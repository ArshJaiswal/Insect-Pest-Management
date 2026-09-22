const axios = require('axios');
const fs = require('fs');
const Pest = require('../models/Pest');

/**
 * Integrate your Crop Doctor AI via Supabase Function API
 * @param {string} imagePath - Path to the uploaded image
 * @returns {Object} Identification results with pest details
 */
const identifyPestWithCropDoctorAPI = async (imagePath) => {
  try {
    console.log('🤖 CROP DOCTOR AI: Starting identification...');
    console.log('📁 Image path:', imagePath);
    
    // Your Supabase function URL and key
    const supabaseUrl = process.env.CROP_DOCTOR_SUPABASE_URL;
    const supabaseKey = process.env.CROP_DOCTOR_SUPABASE_KEY;
    
    console.log('🔗 Supabase URL:', supabaseUrl ? 'Configured' : 'Missing');
    console.log('🔑 Supabase Key:', supabaseKey ? 'Configured' : 'Missing');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Crop Doctor AI Supabase credentials not configured. Please set CROP_DOCTOR_SUPABASE_URL and CROP_DOCTOR_SUPABASE_KEY in .env file');
    }
    
    // Convert image to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
    
    console.log('📷 Image size:', imageBuffer.length, 'bytes');
    console.log('🔍 Base64 preview:', base64Image.substring(0, 100) + '...');
    
    // Prepare messages for the AI (same format as your chatbot)
    const messages = [
      {
        role: 'user',
        content: [
          { 
            type: 'text', 
            text: 'IMPORTANT: First determine if this is actually a photograph of crops, plants, insects, or agricultural content. If this appears to be a screenshot, computer screen, code, software interface, or any non-agricultural content, respond with "This is not agricultural content" and explain what you see instead. Only if it is genuinely agricultural content, then analyze for pests and diseases.' 
          },
          { 
            type: 'image_url', 
            image_url: { url: base64Image } 
          }
        ]
      }
    ];
    
    console.log('📤 Calling Supabase function:', `${supabaseUrl}/functions/v1/pest-identify`);
    
    // Call your Supabase function with streaming response handling
    const response = await axios.post(
      `${supabaseUrl}/functions/v1/pest-identify`,
      { 
        messages: messages,
        language: 'en'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        timeout: 30000, // 30 second timeout
        responseType: 'text', // Handle as text to parse streaming data
        // Bypass SSL certificate validation for development
        httpsAgent: process.env.NODE_ENV === 'development' ? 
          new (require('https').Agent)({ rejectUnauthorized: false }) : 
          undefined
      }
    );

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', response.headers['content-type']);

    // Parse streaming response (Server-Sent Events format)
    let aiResponse = '';
    const responseText = response.data;
    
    console.log('📄 RAW RESPONSE TYPE:', typeof responseText);
    console.log('📄 RAW RESPONSE LENGTH:', responseText.length);
    console.log('📄 RAW RESPONSE (first 1000 chars):');
    console.log(responseText.substring(0, 1000));
    console.log('--- END RAW RESPONSE PREVIEW ---');
    
    if (responseText) {
      // Try multiple parsing approaches
      let fullContent = '';
      
      // Method 1: Parse SSE format
      const lines = responseText.split('\n');
      console.log('📝 Total lines in response:', lines.length);
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('data: ') && !line.includes('[DONE]')) {
          try {
            const jsonStr = line.slice(6).trim(); // Remove 'data: ' prefix
            if (jsonStr && jsonStr !== '[DONE]') {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                fullContent += content;
                console.log('✅ Line', i, 'added content:', content.substring(0, 50) + '...');
              }
            }
          } catch (parseError) {
            console.log('⚠️ Line', i, 'parse error:', parseError.message);
            console.log('⚠️ Line content:', line.substring(0, 200));
          }
        }
      }
      
      // Method 2: If SSE parsing failed, try to extract any readable text
      if (!fullContent) {
        console.log('🔄 SSE parsing failed, trying text extraction...');
        // Look for any text that looks like AI response
        const textMatch = responseText.match(/This is not agricultural content|not a pest|not agricultural|screenshot|code|software|computer/i);
        if (textMatch) {
          fullContent = responseText.substring(textMatch.index, textMatch.index + 500);
          console.log('✅ Found potential AI response via text matching');
        }
      }
      
      // Method 3: If all else fails, use raw response
      if (!fullContent && responseText.length > 100) {
        console.log('🔄 Using raw response as fallback...');
        fullContent = responseText;
      }
      
      aiResponse = fullContent;
      console.log('📝 Final extracted content length:', aiResponse.length);
    }

    // Temporary workaround: If we can't parse the response properly, 
    // but we can detect it's likely a code screenshot, reject it
    if (!aiResponse || aiResponse.length < 10) {
      console.log('⚠️ Could not parse AI response properly');
      
      // Check if the image filename suggests it's a screenshot
      const path = require('path');
      const filename = path.basename(imagePath).toLowerCase();
      console.log('📁 Checking filename:', filename);
      
      if (filename.includes('screenshot') || filename.includes('screen') || 
          filename.includes('capture') || filename.includes('code')) {
        console.log('🛑 Filename suggests screenshot - rejecting');
        return {
          primaryMatch: null,
          alternativeMatches: [],
          analysisComplete: true,
          detectedLabels: ['Non-agricultural content'],
          error: 'Not a pest or crop image',
          note: '🤖 Your Crop Doctor AI detected: Screenshot or computer-related content based on filename. Please upload a real photograph of a pest, insect, or affected crop.',
          fullAnalysis: 'Filename-based detection: ' + filename
        };
      }
      
      throw new Error('No meaningful response from Crop Doctor AI');
    }

    console.log('🤖 CROP DOCTOR AI FULL RESPONSE:');
    console.log('=====================================');
    console.log(aiResponse);
    console.log('=====================================');

    // Extract pest information from AI response
    const pestInfo = extractPestInfoFromResponse(aiResponse);
    
    // Check if AI determined this is NOT a pest/crop image
    if (pestInfo.isNonPest) {
      return {
        primaryMatch: null,
        alternativeMatches: [],
        analysisComplete: true,
        detectedLabels: ['Non-agricultural content'],
        error: 'Not a pest or crop image',
        note: `🤖 Your Crop Doctor AI says: ${pestInfo.reason}. Please upload a real photograph of a pest, insect, or affected crop.`,
        fullAnalysis: aiResponse
      };
    }
    
    // Get all pests from database
    const allPests = await Pest.find().populate('affectedCrops');
    
    // Map AI prediction to pest database
    const matches = await mapAIPredictionToPests(pestInfo, allPests);
    
    if (matches.length === 0) {
      return {
        primaryMatch: null,
        alternativeMatches: [],
        analysisComplete: true,
        detectedLabels: [pestInfo.name || 'Unknown pest'],
        error: 'Pest not found in database',
        note: `🤖 Your Crop Doctor AI detected: "${pestInfo.name}" but this pest is not in our database. Consider adding it or try a different image.`,
        fullAnalysis: aiResponse
      };
    }

    return {
      primaryMatch: matches[0],
      alternativeMatches: matches.slice(1, 3),
      analysisComplete: true,
      detectedLabels: [pestInfo.name || 'Identified pest'],
      note: '🤖 Powered by Your Custom Crop Doctor AI',
      fullAnalysis: aiResponse
    };

  } catch (error) {
    console.error('Crop Doctor AI API Error:', error);
    
    // Provide helpful error messages
    if (error.message.includes('ECONNREFUSED')) {
      throw new Error('Cannot connect to Crop Doctor AI service. Make sure it is running and accessible.');
    } else if (error.message.includes('timeout')) {
      throw new Error('Crop Doctor AI service timeout. The service might be overloaded.');
    } else if (error.response?.status === 401) {
      throw new Error('Invalid Crop Doctor AI credentials. Check your SUPABASE_KEY.');
    } else if (error.response?.status === 404) {
      throw new Error('Crop Doctor AI service not found. Check your SUPABASE_URL.');
    }
    
    throw error;
  }
};

/**
 * Extract pest information from AI response text
 */
const extractPestInfoFromResponse = (response) => {
  const text = response.toLowerCase();
  
  // First, check if AI explicitly says it's NOT a pest/crop image
  const nonPestIndicators = [
    'not a pest', 'not an insect', 'not a crop', 'not agricultural',
    'screenshot', 'computer screen', 'code', 'programming', 'software',
    'text editor', 'ide', 'development environment', 'terminal',
    'not related to agriculture', 'not a plant', 'not farming',
    'appears to be', 'looks like', 'seems to be', 'this is a'
  ];
  
  // Check for non-pest content
  for (const indicator of nonPestIndicators) {
    if (text.includes(indicator)) {
      // If AI says it's not a pest, return special response
      if (text.includes('screenshot') || text.includes('code') || text.includes('computer') || text.includes('software')) {
        return {
          name: 'NOT_A_PEST',
          confidence: 0.95,
          fullResponse: response,
          isNonPest: true,
          reason: 'Screenshot or computer-related content detected'
        };
      } else if (text.includes('not a pest') || text.includes('not agricultural') || text.includes('not a crop')) {
        return {
          name: 'NOT_A_PEST',
          confidence: 0.90,
          fullResponse: response,
          isNonPest: true,
          reason: 'AI determined this is not agricultural content'
        };
      }
    }
  }
  
  // Common pest keywords to look for
  const pestKeywords = [
    'aphid', 'beetle', 'caterpillar', 'worm', 'fly', 'moth', 'bug', 
    'thrips', 'mite', 'hopper', 'borer', 'weevil', 'scale', 'whitefly',
    'bollworm', 'cutworm', 'armyworm', 'leafhopper', 'planthopper',
    'colorado potato beetle', 'corn borer', 'fall armyworm'
  ];
  
  // Disease keywords
  const diseaseKeywords = [
    'blight', 'rust', 'mildew', 'rot', 'wilt', 'spot', 'mosaic', 
    'virus', 'fungus', 'bacterial', 'disease', 'leaf spot', 'powdery mildew'
  ];
  
  let detectedPest = null;
  let confidence = 0.7;
  
  // Look for specific pest names first (longer matches are better)
  const sortedPestKeywords = pestKeywords.sort((a, b) => b.length - a.length);
  for (const keyword of sortedPestKeywords) {
    if (text.includes(keyword)) {
      detectedPest = keyword;
      confidence = 0.85;
      break;
    }
  }
  
  // Look for disease keywords if no pest found
  if (!detectedPest) {
    const sortedDiseaseKeywords = diseaseKeywords.sort((a, b) => b.length - a.length);
    for (const keyword of sortedDiseaseKeywords) {
      if (text.includes(keyword)) {
        detectedPest = keyword;
        confidence = 0.75;
        break;
      }
    }
  }
  
  // Try to extract confidence from response if mentioned
  const confidenceMatch = text.match(/(\d+)%|confidence[:\s]*(\d+\.?\d*)/i);
  if (confidenceMatch) {
    const extractedConfidence = parseFloat(confidenceMatch[1] || confidenceMatch[2]);
    if (extractedConfidence > 0 && extractedConfidence <= 100) {
      confidence = extractedConfidence / 100;
    }
  }
  
  return {
    name: detectedPest || 'Unknown issue',
    confidence: confidence,
    fullResponse: response,
    isNonPest: false
  };
};

/**
 * Map AI prediction to pest database
 */
const mapAIPredictionToPests = async (pestInfo, allPests) => {
  const matches = [];
  const prediction = pestInfo.name.toLowerCase();
  const confidence = pestInfo.confidence || 0.7;

  for (const pest of allPests) {
    let matchScore = 0;
    const pestNameLower = pest.name.toLowerCase();
    const scientificLower = pest.scientificName?.toLowerCase() || '';

    // Direct name match (highest priority)
    if (prediction.includes(pestNameLower) || pestNameLower.includes(prediction)) {
      matchScore = confidence * 95;
    }
    // Scientific name match
    else if (prediction.includes(scientificLower) || scientificLower.includes(prediction)) {
      matchScore = confidence * 90;
    }
    // Partial match in description
    else if (pest.description?.toLowerCase().includes(prediction)) {
      matchScore = confidence * 70;
    }
    // Generic type matching (e.g., "beetle" matches "Colorado Potato Beetle")
    else {
      const pestTypes = ['beetle', 'fly', 'worm', 'moth', 'aphid', 'bug', 'hopper', 'thrips', 'borer', 'weevil'];
      const predictedType = pestTypes.find(type => prediction.includes(type));
      const pestType = pestTypes.find(type => pestNameLower.includes(type));
      
      if (predictedType && pestType && predictedType === pestType) {
        matchScore = confidence * 65;
      }
    }

    if (matchScore > 0) {
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
        detectedAs: pestInfo.name
      });
    }
  }

  // Sort by confidence (highest first)
  matches.sort((a, b) => b.confidence - a.confidence);
  return matches;
};

module.exports = { identifyPestWithCropDoctorAPI };