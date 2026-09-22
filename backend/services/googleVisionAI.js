const vision = require('@google-cloud/vision');
const Pest = require('../models/Pest');

// Initialize Google Cloud Vision client
let visionClient;

try {
  // Method 1: Using service account JSON file
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    visionClient = new vision.ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });
  } 
  // Method 2: Using API key (alternative)
  else if (process.env.GOOGLE_CLOUD_API_KEY) {
    visionClient = new vision.ImageAnnotatorClient({
      apiKey: process.env.GOOGLE_CLOUD_API_KEY
    });
  }
} catch (error) {
  console.warn('Google Cloud Vision not configured. Using mock identification.');
}

/**
 * Identify pest using Google Cloud Vision API
 * @param {string} imagePath - Path to the uploaded image
 * @returns {Object} Identification results with pest details
 */
const identifyPestWithGoogleVision = async (imagePath) => {
  try {
    if (!visionClient) {
      throw new Error('Google Cloud Vision API not configured');
    }

    // Perform label detection on the image
    const [result] = await visionClient.labelDetection(imagePath);
    const labels = result.labelAnnotations;

    console.log('Google Vision Labels:', labels.map(l => l.description));

    // Perform text detection to check if image is primarily text/code
    const [textResult] = await visionClient.textDetection(imagePath);
    const textAnnotations = textResult.textAnnotations || [];
    const hasSignificantText = textAnnotations.length > 0 && textAnnotations[0]?.description?.length > 50;

    console.log('Text detected:', hasSignificantText ? 'Yes (likely screenshot/document)' : 'No');

    // Also get web detection for better context
    const [webResult] = await visionClient.webDetection(imagePath);
    const webEntities = webResult.webDetection?.webEntities || [];

    console.log('Web Entities:', webEntities.map(e => e.description));

    // Combine labels and web entities for better matching
    const allDetections = [
      ...labels.map(l => ({ text: l.description, score: l.score })),
      ...webEntities.map(e => ({ text: e.description, score: e.score || 0.5 }))
    ];

    // Keywords that might indicate pests or crops
    const pestKeywords = [
      'insect', 'pest', 'bug', 'beetle', 'moth', 'fly', 'aphid', 
      'caterpillar', 'worm', 'borer', 'hopper', 'mite', 'thrips',
      'whitefly', 'leafhopper', 'planthopper', 'bollworm', 'armyworm',
      'larva', 'larvae', 'grub', 'maggot'
    ];

    // Keywords that indicate crops or plants
    const cropKeywords = [
      'plant', 'leaf', 'crop', 'agriculture', 'farming', 'vegetation',
      'rice', 'wheat', 'corn', 'maize', 'cotton', 'tomato', 'potato',
      'cabbage', 'fruit', 'vegetable', 'tree', 'flower', 'garden'
    ];

    // Check if image is primarily text/code/screenshot
    if (hasSignificantText) {
      return {
        primaryMatch: null,
        alternativeMatches: [],
        analysisComplete: true,
        detectedLabels: labels.map(l => l.description),
        error: 'Invalid image type - Text/Code/Screenshot detected',
        note: 'Please upload a photograph of a pest, insect, or affected crop. Screenshots, code snippets, and text documents cannot be analyzed for pest identification.'
      };
    }

    // Keywords that indicate this is NOT a pest/crop image
    const invalidKeywords = [
      'screenshot', 'display', 'monitor', 'computer', 'laptop', 'screen',
      'phone', 'device', 'electronics', 'furniture', 'building', 'person',
      'human', 'face', 'hand', 'indoor', 'room', 'wall', 'floor', 'website',
      'software', 'application', 'interface', 'window', 'browser'
    ];

    // Check if image contains invalid content
    const hasInvalidContent = allDetections.some(d => 
      d.text && invalidKeywords.some(keyword => 
        d.text.toLowerCase().includes(keyword)
      ) && d.score > 0.5
    );

    if (hasInvalidContent) {
      return {
        primaryMatch: null,
        alternativeMatches: [],
        analysisComplete: true,
        detectedLabels: labels.map(l => l.description),
        error: 'Invalid image type',
        note: 'Please upload a real photograph of a pest, insect, or affected crop. The uploaded image appears to be a screenshot or non-agricultural content.'
      };
    }

    // Find pest-related detections
    const pestDetections = allDetections.filter(d => 
      d.text && pestKeywords.some(keyword => 
        d.text.toLowerCase().includes(keyword)
      )
    );

    // Find crop-related detections
    const cropDetections = allDetections.filter(d => 
      d.text && cropKeywords.some(keyword => 
        d.text.toLowerCase().includes(keyword)
      )
    );

    // Check if image is related to agriculture at all
    const hasAgriculturalContent = pestDetections.length > 0 || cropDetections.length > 0;

    if (!hasAgriculturalContent) {
      return {
        primaryMatch: null,
        alternativeMatches: [],
        analysisComplete: true,
        detectedLabels: labels.map(l => l.description),
        error: 'No agricultural content detected',
        note: 'Please upload an image of a pest, insect, or crop with pest damage. The uploaded image does not appear to be related to agriculture or pest management.'
      };
    }

    // Get all pests from database
    const allPests = await Pest.find().populate('affectedCrops');

    // Match detected labels with pest database
    const matches = [];

    for (const detection of allDetections) {
      if (!detection.text) continue;

      for (const pest of allPests) {
        let matchScore = 0;
        const detectionLower = detection.text.toLowerCase();
        const pestNameLower = pest.name.toLowerCase();
        const scientificLower = pest.scientificName?.toLowerCase() || '';

        // Exact match
        if (detectionLower === pestNameLower || detectionLower === scientificLower) {
          matchScore = detection.score * 100;
        }
        // Partial match in name
        else if (pestNameLower.includes(detectionLower) || detectionLower.includes(pestNameLower)) {
          matchScore = detection.score * 80;
        }
        // Partial match in scientific name
        else if (scientificLower.includes(detectionLower) || detectionLower.includes(scientificLower)) {
          matchScore = detection.score * 75;
        }
        // Match in description
        else if (pest.description?.toLowerCase().includes(detectionLower)) {
          matchScore = detection.score * 60;
        }

        if (matchScore > 0) {
          // Check if pest already in matches
          const existingMatch = matches.find(m => m.pest._id.equals(pest._id));
          if (existingMatch) {
            existingMatch.confidence = Math.max(existingMatch.confidence, matchScore);
          } else {
            matches.push({
              pest: {
                _id: pest._id,
                name: pest.name,
                scientificName: pest.scientificName,
                description: pest.description,
                symptoms: pest.symptoms,
                management: pest.management,
                affectedCrops: pest.affectedCrops
              },
              confidence: matchScore,
              detectedAs: detection.text
            });
          }
        }
      }
    }

    // Sort by confidence
    matches.sort((a, b) => b.confidence - a.confidence);

    // If no good matches found, use general insect detection
    if (matches.length === 0 && pestDetections.length > 0) {
      // Return top 3 most common pests as suggestions
      const commonPests = allPests.slice(0, 3);
      return {
        primaryMatch: {
          pest: commonPests[0],
          confidence: 50,
          detectedAs: 'General insect detected'
        },
        alternativeMatches: commonPests.slice(1).map(p => ({
          pest: p,
          confidence: 40
        })),
        analysisComplete: true,
        detectedLabels: labels.map(l => l.description),
        note: 'Insect or pest damage detected but specific pest not identified. Showing common pests that may cause similar symptoms.'
      };
    }

    // If crop detected but no pest, suggest it might be healthy or need closer image
    if (matches.length === 0 && cropDetections.length > 0) {
      return {
        primaryMatch: null,
        alternativeMatches: [],
        analysisComplete: true,
        detectedLabels: labels.map(l => l.description),
        note: 'Crop or plant detected but no visible pest or damage identified. If you suspect pest damage, please upload a closer image of the affected area.'
      };
    }

    // If still no matches, return null
    if (matches.length === 0) {
      return {
        primaryMatch: null,
        alternativeMatches: [],
        analysisComplete: true,
        detectedLabels: labels.map(l => l.description),
        note: 'No pest or crop detected in the image. Please upload an image of a pest, insect, or affected crop.'
      };
    }

    return {
      primaryMatch: matches[0],
      alternativeMatches: matches.slice(1, 4),
      analysisComplete: true,
      detectedLabels: labels.map(l => l.description)
    };

  } catch (error) {
    console.error('Google Vision API Error:', error);
    throw error;
  }
};

module.exports = { identifyPestWithGoogleVision };
