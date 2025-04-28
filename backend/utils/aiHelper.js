const { GoogleGenerativeAI } = require('@google/generative-ai');

const generateAITips = async (cropDetails) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured in .env file');
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Modified prompt to ensure better formatting
        const promptText = `Provide a detailed farming guide for ${cropDetails.crop_name} 
(Variety: ${cropDetails.variety || 'Not specified'})

Format your response using this exact structure and spacing:

Current Growing Conditions:
• Soil pH: ${cropDetails.soil_ph}
• Field Size: ${cropDetails.field_size} acres
• Irrigation Type: ${cropDetails.irrigation_type}
• Previous Crop: ${cropDetails.previous_crop}

1. Growth Timeline:
• Germination: [Days required]
• Full Maturity: [Total days]
• Key Growth Stages:
  - Stage 1: [Description]
  - Stage 2: [Description]
  - Stage 3: [Description]
  - Stage 4: [Description]

2. Watering Schedule:
• Early Stage: [Frequency and amount]
• Mid Stage: [Frequency and amount]
• Late Stage: [Frequency and amount]
• Critical Points: [List key watering periods]

3. Fertilization Plan:
• Base Fertilizer: [Type and amount]
• First Application: [When and what]
• Second Application: [When and what]
• Final Application: [When and what]

4. Pest Management:
• Common Pests:
  - [Pest 1]: [Control method]
  - [Pest 2]: [Control method]
  - [Pest 3]: [Control method]
• Prevention Steps:
  1. [Step one]
  2. [Step two]
  3. [Step three]

5. Disease Prevention:
• Watch for:
  - [Disease 1]: [Symptoms and treatment]
  - [Disease 2]: [Symptoms and treatment]
  - [Disease 3]: [Symptoms and treatment]

6. Next Actions:
• Immediate Tasks:
  1. [Task one]
  2. [Task two]
  3. [Task three]
• Weekly Checks:
  1. [Check one]
  2. [Check two]
  3. [Check three]

7. Harvest Guide:
• Ready when:
  - [Indicator 1]
  - [Indicator 2]
  - [Indicator 3]
• Expected Yield: [Range per acre]
• Best Conditions: [Ideal harvest conditions]

Remember to use bullet points (•) and proper spacing for clear formatting.`;

        // Generate content
        const result = await model.generateContent(promptText);
        const response = await result.response;
        
        if (!response || !response.text) {
            throw new Error('No response received from AI model');
        }

        // Format the response with proper spacing and line breaks
        const formattedResponse = response.text()
            .replace(/•/g, '•') // Ensure consistent bullet points
            .replace(/\n\n+/g, '\n\n') // Remove extra line breaks
            .split('\n').map(line => line.trim()).join('\n'); // Clean up spacing

        return formattedResponse;
    } catch (err) {
        console.error('AI Error Details:', err);
        return `Error generating farming recommendations: ${err.message}`;
    }
};

const generateLandRecommendations = async (landDetails) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured in .env file');
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const weatherInfo = landDetails.weatherData.error 
            ? 'Weather data is unavailable' 
            : `Current temperature: ${landDetails.weatherData.current.temp_c}°C, Condition: ${landDetails.weatherData.current.condition.text}`;

        const promptText = `You are an agricultural expert AI system. Based on the following land details, provide comprehensive recommendations for optimal crops to grow, when to plant them, and efficiency improvements.

Land Details:
- Location: ${landDetails.location}
- Land Size: ${landDetails.landSize} acres
- Soil Type: ${landDetails.soilType}
- Soil pH: ${landDetails.soilPh}
- Water Source: ${landDetails.waterSource}
- Previous Crop: ${landDetails.previousCrop || 'Not specified'}
- Organic Farming Interest: ${landDetails.organicFarming ? 'Yes' : 'No'}
- Budget: ${landDetails.budget || 'Not specified'} INR per acre
- Additional Information: ${landDetails.additionalInfo || 'None provided'}
- Weather Information: ${weatherInfo}

Provide your response in the following JSON structure:
{
  "recommendedCrops": [
    {
      "name": "Crop Name",
      "plantingTime": "Best time to plant",
      "expectedYield": "Expected yield per acre",
      "profitPotential": "Estimated profit potential",
      "tips": ["Specific tip 1", "Specific tip 2", "Specific tip 3"]
    }
  ],
  "weatherSummary": "Brief analysis of weather patterns in the location",
  "seasonalForecasts": [
    {
      "name": "Season name (e.g., Monsoon, Winter)",
      "forecast": "Brief forecast for this season",
      "suitableCrops": ["Crop 1", "Crop 2", "Crop 3"]
    }
  ],
  "efficiencyTips": [
    "Efficiency tip 1",
    "Efficiency tip 2",
    "Efficiency tip 3"
  ]
}

Ensure you recommend crops that are well-suited to the specific soil type, pH level, and local climate conditions. Consider crop rotation benefits if previous crop information is provided. Provide at least 3-5 recommended crops, and make sure your recommendations are practical and economically viable.`;

        // Generate content
        const result = await model.generateContent(promptText);
        const response = await result.response;
        
        if (!response || !response.text) {
            throw new Error('No response received from AI model');
        }

        // Process the AI response
        const responseText = response.text();
        
        // Extract the JSON response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('AI response did not contain valid JSON data');
        }
        
        const recommendations = JSON.parse(jsonMatch[0]);
        return recommendations;
    } catch (err) {
        console.error('AI Land Recommendation Error:', err);
        
        // Return fallback recommendations if AI fails
        return {
            recommendedCrops: [
                {
                    name: "Rice",
                    plantingTime: "June-July",
                    expectedYield: "20-25 quintals per acre",
                    profitPotential: "₹25,000-30,000 per acre",
                    tips: ["Use SRI method for better yields", "Maintain proper water levels", "Apply organic fertilizers for better quality"]
                },
                {
                    name: "Wheat",
                    plantingTime: "November-December",
                    expectedYield: "15-20 quintals per acre",
                    profitPotential: "₹20,000-25,000 per acre",
                    tips: ["Use drought-resistant varieties", "Apply balanced fertilizers", "Ensure proper spacing for optimal growth"]
                }
            ],
            weatherSummary: "Weather data could not be analyzed at this time. Please check local forecasts for planning.",
            seasonalForecasts: [
                {
                    name: "Summer",
                    forecast: "Hot and dry conditions expected",
                    suitableCrops: ["Cotton", "Sunflower", "Millet"]
                },
                {
                    name: "Monsoon",
                    forecast: "Good rainfall expected",
                    suitableCrops: ["Rice", "Soybean", "Maize"]
                }
            ],
            efficiencyTips: [
                "Implement drip irrigation to conserve water",
                "Use soil testing to optimize fertilizer application",
                "Consider intercropping for better land utilization"
            ]
        };
    }
};

module.exports = { generateAITips, generateLandRecommendations };