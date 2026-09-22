const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const Pest = require('../models/Pest');

/**
 * Integrate your Crop Doctor AI model
 * @param {string} imagePath - Path to the uploaded image
 * @returns {Object} Identification results with pest details
 */
const identifyPestWithCropDoctorAI = async (imagePath) => {
  try {
    console.log('Using Crop Doctor AI for pest identification...');
    
    // Path to your AI model (adjust this path)
    const aiModelPath = path.join(__dirname, '../../crop-doctor-ai-main');
    
    // Call your Python AI script
    const aiResult = await callPythonAI(aiModelPath, imagePath);
    
    if (!aiResult || !aiResult.prediction) {
      throw new Error('No prediction from AI model');
    }

    console.log('Crop Doctor AI Results:', aiResult);

    // Get all pests from database
    const allPests = await Pest.find().populate('affectedCrops');
    
    // Map AI prediction to pest database
    const matches = await mapAIPredictionToPests(aiResult, allPests);
    
    if (matches.length === 0) {
      return {
        primaryMatch: null,
        alternativeMatches: [],
        analysisComplete: true,
        detectedLabels: [aiResult.prediction],
        error: 'Pest not found in database',
        note: `AI detected: ${aiResult.prediction}, but no matching pest found in database.`
      };
    }

    return {
      primaryMatch: matches[0],
      alternativeMatches: matches.slice(1, 4),
      analysisComplete: true,
      detectedLabels: [aiResult.prediction],
      note: '🤖 Powered by Your Custom Crop Doctor AI Model'
    };

  } catch (error) {
    console.error('Crop Doctor AI Error:', error);
    throw error;
  }
};

/**
 * Call Python AI script
 */
const callPythonAI = (aiModelPath, imagePath) => {
  return new Promise((resolve, reject) => {
    // Adjust the Python script name and arguments based on your AI
    const pythonScript = path.join(aiModelPath, 'predict.py'); // Change this to your script name
    
    const python = spawn('python', [pythonScript, imagePath], {
      cwd: aiModelPath
    });

    let dataString = '';
    let errorString = '';

    python.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    python.stderr.on('data', (data) => {
      errorString += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed: ${errorString}`));
        return;
      }

      try {
        // Parse the AI output (adjust based on your output format)
        const result = JSON.parse(dataString.trim());
        resolve(result);
      } catch (parseError) {
        // If not JSON, treat as plain text
        resolve({
          prediction: dataString.trim(),
          confidence: 0.8 // Default confidence if not provided
        });
      }
    });

    python.on('error', (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });
  });
};

/**
 * Map AI prediction to pest database
 */
const mapAIPredictionToPests = async (aiResult, allPests) => {
  const matches = [];
  const prediction = aiResult.prediction.toLowerCase();
  const confidence = aiResult.confidence || 0.8;

  for (const pest of allPests) {
    let matchScore = 0;
    const pestNameLower = pest.name.toLowerCase();
    const scientificLower = pest.scientificName?.toLowerCase() || '';

    // Direct name match
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
    // Generic type matching
    else {
      const pestTypes = ['beetle', 'fly', 'worm', 'moth', 'aphid', 'bug', 'hopper', 'thrips'];
      const predictedType = pestTypes.find(type => prediction.includes(type));
      const pestType = pestTypes.find(type => pestNameLower.includes(type));
      
      if (predictedType && pestType && predictedType === pestType) {
        matchScore = confidence * 60;
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
        detectedAs: aiResult.prediction
      });
    }
  }

  // Sort by confidence
  matches.sort((a, b) => b.confidence - a.confidence);
  return matches;
};

module.exports = { identifyPestWithCropDoctorAI };