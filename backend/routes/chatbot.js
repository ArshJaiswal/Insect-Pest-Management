const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Crop = require('../models/Crop');
const Pest = require('../models/Pest');

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

console.log('🤖 CHATBOT ROUTES: Loading chatbot routes...');

/**
 * Intelligent Local Knowledge Base Generator
 * Serves rich, accurate agronomic and pest management advice
 * using local MongoDB records when cloud AI API keys are not configured or offline.
 */
async function generateKnowledgeBaseResponse(message, language = 'en') {
  const lowerMsg = message.toLowerCase().trim();

  // 1. Greetings & Friendly Intros
  if (
    /^(hi|hello|hey|namaste|hola|bonjour|greetings|good morning|good afternoon|good evening)\b/i.test(lowerMsg) ||
    lowerMsg === 'hi' ||
    lowerMsg === 'hello'
  ) {
    return `🌱 **Hello! Welcome to AgroGuard AI Crop Advisory.**

I am your agricultural assistant. Here is how I can assist your farm today:
- 🌾 **Crop Profiles & Management**: Sowing, irrigation, soil health, and harvesting best practices.
- 🐛 **Pest Identification & Control**: Symptoms, biological remedies, and chemical mitigation.
- 🧪 **Fertilizer & Treatment Advice**: NPK balance, organic solutions (e.g., Neem oil), and integrated pest management (IPM).

Feel free to ask a question like *"How do I control aphids?"* or *"Tell me about wheat pests"*.`;
  }

  // 2. Identity / Capabilities
  if (/who are you|what can you do|help me|how does this work/i.test(lowerMsg)) {
    return `🌾 **I am the AgroGuard Agricultural Assistant.**

My purpose is to assist farmers, agronomists, and growers with real-time pest identification, disease diagnosis, and crop care solutions.

You can ask me about:
1. Specific pests (e.g., Aphids, Armyworms, Beetles, Bollworms)
2. Specific crops (e.g., Wheat, Rice, Cotton, Tomato, Corn)
3. Spray schedules and organic remedies
4. Identifying crop damage symptoms and treatment options`;
  }

  try {
    // 3. Match against Database Pests
    const pests = await Pest.find().populate('affectedCrops');
    const matchedPests = pests.filter(p => {
      const pName = (p.name || '').toLowerCase();
      const pSci = (p.scientificName || '').toLowerCase();
      return lowerMsg.includes(pName) || (pSci && lowerMsg.includes(pSci));
    });

    if (matchedPests.length > 0) {
      const pest = matchedPests[0];
      const cropNames = pest.affectedCrops && pest.affectedCrops.length > 0 
        ? pest.affectedCrops.map(c => c.name).join(', ')
        : 'Multiple field and vegetable crops';
      
      const symptomsList = pest.symptoms && pest.symptoms.length > 0
        ? pest.symptoms.map(s => `• ${s}`).join('\n')
        : '• Leaf curling, yellowing, visible foliage damage, or wilting';

      return `🐛 **Pest Advisory: ${pest.name}** ${pest.scientificName ? `(*${pest.scientificName}*)` : ''}

**Overview**:
${pest.description || 'Common agricultural pest capable of reducing crop yield if left unmanaged.'}

⚠️ **Primary Symptoms**:
${symptomsList}

🛡️ **Management & Treatment Recommendations**:
${pest.management || 'Apply integrated pest management (IPM). Monitor population early, encourage natural predators like ladybugs, and use targeted botanical sprays (e.g., 5% Neem seed kernel extract) or approved insecticides if threshold is exceeded.'}

🌾 **Vulnerable Host Crops**: ${cropNames}

*Tip: Always follow local safety waiting intervals before harvest when applying chemical sprays.*`;
    }

    // 4. Match against Database Crops
    const crops = await Crop.find().populate('commonPests');
    const matchedCrops = crops.filter(c => {
      const cName = (c.name || '').toLowerCase();
      return lowerMsg.includes(cName);
    });

    if (matchedCrops.length > 0) {
      const crop = matchedCrops[0];
      const pestItems = crop.commonPests && crop.commonPests.length > 0
        ? crop.commonPests.map(p => `• **${p.name}** ${p.scientificName ? `(*${p.scientificName}*)` : ''}: ${p.description || 'Targeted foliage and stem feeder'}`).join('\n')
        : '• Aphids, Leafhoppers, and stem borers (scout regularly during vegetative stages)';

      return `🌾 **Crop Intelligence: ${crop.name}** (*Category: ${crop.category}*)

**Agronomic Profile**:
${crop.description || 'High-value agricultural crop requiring balanced nutrition, regular soil moisture monitoring, and proactive pest scouting.'}

🦗 **Common Vulnerable Pests for ${crop.name}**:
${pestItems}

💡 **Best Management Practices**:
1. **Soil & Sowing**: Ensure well-drained, nutrient-rich soil with appropriate seedbed preparation.
2. **Scouting**: Inspect the undersides of leaves and early growth tips twice weekly.
3. **Prevention**: Practice crop rotation and avoid excessive nitrogen application which attracts sap-sucking pests.`;
    }

    // 5. Common Symptoms Diagnostic Matching
    if (/yellow|curling|hole|chew|spots|wilting|damage|stunt|blight|rot/i.test(lowerMsg)) {
      return `🔍 **Crop Damage & Symptom Diagnostic Tips**:

Based on your observation:
- **Yellowing or Curling Leaves**: Often indicates sap-sucking pests (such as **Aphids**, **Whiteflies**, or **Thrips**) or nutrient deficiencies (like Nitrogen or Iron). Check undersides of leaves for sticky honeydew or tiny clusters.
- **Holes or Chewed Foliage**: Typical signature of **Caterpillars, Armyworms, or Beetles**. Inspect stems and soil around the base of the plant during early morning or evening.
- **Leaf Spots or Wilting**: May indicate a fungal or bacterial infection aggravated by high humidity and poor drainage.

🌿 **Recommended Immediate Action**:
1. Spray affected foliage with an organic Neem oil solution (5ml/L of water with a mild emulsifier).
2. Isolate heavily infested leaves and destroy them to prevent spread.
3. Use the camera icon below to upload a photo for automated vision diagnosis!`;
    }

    // 6. Fertilizer & Soil Care
    if (/fertilizer|npk|urea|compost|manure|nitrogen/i.test(lowerMsg)) {
      return `🌱 **Soil & Fertilizer Guidance**:

- **Balanced Nutrition**: Apply N-P-K according to a recent soil test. Excess nitrogen leads to lush, soft foliage that heavily attracts pests like aphids and caterpillars.
- **Organic Enrichment**: Incorporate well-decomposed Farm Yard Manure (FYM) or vermicompost 2–3 weeks prior to sowing.
- **Micronutrients**: Zinc, Boron, and Iron foliar sprays during the pre-flowering stage boost plant immunity against pests and environmental stress.`;
    }

    // 7. Irrigation & Watering
    if (/water|irrigation|drip/i.test(lowerMsg)) {
      return `💧 **Irrigation & Water Management Tips**:

- **Timing**: Water early in the morning so plant foliage dries quickly in the sun, minimizing fungal spore germination.
- **Drip Irrigation**: Recommended to deliver water directly to the root zone without wetting foliage, cutting pest and fungal risk significantly.
- **Avoid Waterlogging**: Stagnant water deprives roots of oxygen and triggers root rot and damping-off diseases.`;
    }

    // 8. Organic & Botanical Sprays
    if (/organic|neem|spray|natural|pesticide/i.test(lowerMsg)) {
      return `🌿 **Eco-Friendly & Organic Pest Control**:

1. **Neem Oil Formulation**: 5ml Neem oil (1500 ppm or higher) + 2ml liquid soap per liter of water. Spray thoroughly every 7–10 days on leaf undersides.
2. **Biological Allies**: Conserve natural beneficial predators like ladybird beetles, lacewings, and spider wasps.
3. **Sticky Traps**: Install yellow sticky traps (for whiteflies/aphids) and blue sticky traps (for thrips) at crop canopy level.
4. **Crop Diversity**: Intercrop with marigolds, basil, or coriander to repel harmful insects naturally.`;
    }
  } catch (dbErr) {
    console.error('Error querying MongoDB for chatbot:', dbErr);
  }

  // 9. General Agricultural Advisory Fallback
  return `🌿 **AgroGuard Advisory Response**:

Regarding: *"${message}"*

To give you the most accurate agricultural guidance:
- Mention the specific **crop name** (e.g., *Wheat, Rice, Cotton, Tomato, Corn*).
- Or describe the specific **pest or symptoms** you are observing (e.g., *holes in leaves, sticky residue, aphids*).

You can also click the 📷 camera icon to upload a leaf or pest photo directly for vision diagnostics!`;
}

/**
 * Chatbot API: Powered by Google Gemini AI with local Agricultural Knowledge Engine fallback
 */
router.post('/chat', async (req, res) => {
  try {
    console.log('🤖 CHATBOT: New chat request received');
    
    const { message, conversationHistory = [], language = 'en' } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    console.log('💬 User message:', message);
    console.log('🌍 Language:', language);

    // 1. Try Google Gemini API if configured
    const geminiKey = process.env.GEMINI_API_KEY;
    const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

    if (geminiKey) {
      try {
        console.log(`🤖 Calling Google Gemini API (${geminiModel})...`);
        const contents = [];
        
        // Add conversation history
        conversationHistory.slice(-6).forEach(m => {
          contents.push({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          });
        });
        
        // Add current message
        contents.push({
          role: 'user',
          parts: [{ text: message }]
        });

        const geminiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`,
          {
            system_instruction: {
              parts: [{
                text: `You are AgroGuard AI Assistant, an expert agricultural advisor and crop specialist. Provide practical, farmer-friendly, accurate advice on crop health, pest identification, symptom diagnosis, fertilizers, irrigation, and integrated pest management (IPM). Include emojis and clear bullet points. Language: ${language}.`
              }]
            },
            contents: contents
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 25000
          }
        );

        const aiText = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiText && aiText.trim()) {
          console.log('✅ Google Gemini AI responded successfully');
          return res.json({
            success: true,
            response: aiText.trim(),
            timestamp: new Date().toISOString()
          });
        }
      } catch (geminiErr) {
        console.warn('⚠️ Gemini API call failed, falling back to local database knowledge base:', geminiErr.response?.data?.error?.message || geminiErr.message);
      }
    }

    // 2. Try Supabase function if configured
    const supabaseUrl = process.env.CROP_DOCTOR_SUPABASE_URL;
    const supabaseKey = process.env.CROP_DOCTOR_SUPABASE_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        console.log('📤 Trying Supabase AI function...');
        const response = await axios.post(
          `${supabaseUrl}/functions/v1/pest-identify`,
          {
            messages: [
              {
                role: 'system',
                content: `You are AgroGuard AI Assistant, an expert agricultural advisor. Help farmers with crop management, pest control, disease management, and farming best practices.`
              },
              ...conversationHistory.slice(-5).map(m => ({ role: m.role, content: m.content })),
              { role: 'user', content: message }
            ],
            language: language
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`
            },
            timeout: 25000,
            responseType: 'text',
            httpsAgent: process.env.NODE_ENV === 'development' ? 
              new (require('https').Agent)({ rejectUnauthorized: false }) : 
              undefined
          }
        );

        let aiResponse = '';
        const responseText = response.data;
        if (responseText) {
          const lines = responseText.split('\n');
          let fullContent = '';
          for (const line of lines) {
            if (line.startsWith('data: ') && !line.includes('[DONE]')) {
              try {
                const parsed = JSON.parse(line.slice(6).trim());
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) fullContent += content;
              } catch (e) {}
            }
          }
          aiResponse = fullContent || responseText;
        }

        if (aiResponse && aiResponse.trim().length > 3) {
          console.log('✅ Supabase AI response received successfully');
          return res.json({
            success: true,
            response: aiResponse,
            timestamp: new Date().toISOString()
          });
        }
      } catch (cloudErr) {
        console.warn('⚠️ Cloud AI service failed, seamlessly using local agricultural knowledge engine:', cloudErr.message);
      }
    }

    // 3. Seamless Local Knowledge Engine Fallback
    console.log('🧠 Using AgroGuard Local Agricultural Knowledge Engine...');
    const localResponse = await generateKnowledgeBaseResponse(message, language);

    return res.json({
      success: true,
      response: localResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ CHATBOT ROUTE ERROR:', error);
    return res.json({
      success: true,
      response: "🌱 AgroGuard AI Assistant is ready. Please tell me which crop or pest symptoms you would like advice on!",
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Image analysis endpoint for pest identification
 */
router.post('/analyze-image', upload.single('image'), async (req, res) => {
  try {
    console.log('📷 IMAGE ANALYSIS: New image analysis request');
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    const { message = 'Please analyze this image for pest identification', language = 'en' } = req.body;
    const geminiKey = process.env.GEMINI_API_KEY;
    const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

    // 1. Try Google Gemini Multimodal Vision
    if (geminiKey) {
      try {
        console.log(`📷 Calling Google Gemini Vision (${geminiModel})...`);
        const mimeType = req.file.mimetype || 'image/jpeg';
        const base64Data = req.file.buffer.toString('base64');

        const geminiVisionRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`,
          {
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `You are an expert agricultural entomologist and plant pathologist for AgroGuard.
Analyze this image:
1. Verification: Is this agricultural content (plant, leaf, crop, insect, or pest)? If not, clearly state what it is.
2. If agricultural:
   - Identify the Pest or Disease (Common Name & Scientific Name).
   - Estimated Confidence (e.g., 90%).
   - Observable Symptoms & Damage Assessment.
   - Recommended Organic / Biological Control (e.g. Neem oil, natural predators).
   - Recommended Chemical Control (if threshold exceeded).
   - Preventive Agronomic Advice.
Keep it practical and structured with clean markdown headings and emojis.`
                  },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64Data
                    }
                  }
                ]
              }
            ]
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 35000
          }
        );

        const visionText = geminiVisionRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (visionText && visionText.trim()) {
          console.log('✅ Gemini Vision analyzed image successfully');
          return res.json({
            success: true,
            response: visionText.trim(),
            timestamp: new Date().toISOString()
          });
        }
      } catch (visionErr) {
        console.warn('⚠️ Gemini Vision call failed, falling back to local analysis:', visionErr.response?.data?.error?.message || visionErr.message);
      }
    }

    // 2. Local fallback using file system
    const tempDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempFilename = `temp_${Date.now()}_${path.basename(req.file.originalname || 'pest.jpg')}`;
    const tempFilePath = path.join(tempDir, tempFilename);
    fs.writeFileSync(tempFilePath, req.file.buffer);

    try {
      const { identifyPestFromImage } = require('../services/pestIdentification');
      const pestResult = await identifyPestFromImage(tempFilePath);
      
      let reply = '';
      if (pestResult && pestResult.primaryMatch && pestResult.primaryMatch.pest) {
        const pest = pestResult.primaryMatch.pest;
        const confidence = Math.round(pestResult.primaryMatch.confidence || 85);
        reply = `🔍 **Image Analysis Result: ${pest.name}** ${pest.scientificName ? `(*${pest.scientificName}*)` : ''}
Confidence Level: **${confidence}%**

**Identification Details**:
${pest.description || 'Pest detected on plant foliage.'}

⚠️ **Observable Symptoms**:
${pest.symptoms && pest.symptoms.length > 0 ? pest.symptoms.map(s => `• ${s}`).join('\n') : '• Foliage damage and feeding marks'}

🛡️ **Recommended Control & Treatment**:
${pest.management || 'Inspect nearby crops, remove heavily infested stems, and apply recommended botanical or targeted insecticides.'}`;
      } else {
        reply = `🔍 **Image Scan Complete**:
${pestResult.note || 'No acute pest infestation detected in this image. Foliage appears healthy or requires closer photo.'}

💡 *Tip: For best results, capture a clear close-up of affected leaves, stems, or insect clusters under daylight.*`;
      }

      try { fs.unlinkSync(tempFilePath); } catch (e) {}

      return res.json({
        success: true,
        response: reply,
        timestamp: new Date().toISOString()
      });
    } catch (analysisErr) {
      console.error('Local vision analysis failed:', analysisErr);
      try { fs.unlinkSync(tempFilePath); } catch (e) {}
      
      return res.json({
        success: true,
        response: "📸 Image received! Our database indicates typical symptoms can be matched via the **AI Identify** scanner in the navigation bar for high-precision diagnostic verification.",
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ IMAGE ANALYSIS ERROR:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to process image. Please try a clearer photograph.',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Status/health check endpoint
 */
router.get('/status', (req, res) => {
  const isGeminiConfigured = !!process.env.GEMINI_API_KEY;
  const isCloudConfigured = !!(process.env.CROP_DOCTOR_SUPABASE_URL && process.env.CROP_DOCTOR_SUPABASE_KEY);
  
  res.json({
    status: 'online',
    engine: isGeminiConfigured ? `Google Gemini (${process.env.GEMINI_MODEL || 'gemini-3.6-flash'})` : (isCloudConfigured ? 'Supabase AI' : 'Local Agricultural Knowledge Engine'),
    configured: true,
    features: [
      'Crop Management Advice',
      'Pest Identification Help', 
      'Disease & Symptom Diagnostics',
      'Organic & Chemical Control',
      'Multimodal Image Analysis'
    ],
    timestamp: new Date().toISOString()
  });
});

console.log('🤖 CHATBOT ROUTES: Routes configured successfully');
module.exports = router;