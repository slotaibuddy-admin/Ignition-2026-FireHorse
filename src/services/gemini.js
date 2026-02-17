import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function generateCyberModule() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Generate a unique Cyber Module for the Year of the Fire Horse (2026). 
    
    Create a JSON object with the following structure:
    {
      "name": "A unique, creative name for a cyber module (should sound futuristic and powerful)",
      "rarity": "One of: Common, Rare, Epic, Legendary, or Mythic",
      "description": "A short, engaging description (2-3 sentences) about this module's capabilities and origin",
      "power": A number between 1 and 100,
      "speed": A number between 1 and 100,
      "heat": A number between 1 and 100
    }
    
    Make the module creative and thematic to the Fire Horse year. Higher rarity should have better stats.
    Return ONLY the JSON object, no other text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response (remove markdown code blocks if present)
    let jsonText = text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }
    
    const module = JSON.parse(jsonText);
    
    // Validate the module has all required fields
    if (!module.name || !module.rarity || !module.description || 
        module.power === undefined || module.speed === undefined || module.heat === undefined) {
      throw new Error('Invalid module structure received from AI');
    }
    
    return module;
  } catch (error) {
    console.error('Error generating cyber module:', error);
    
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key')) {
      throw new Error('Invalid API key. Please check your VITE_GEMINI_API_KEY in .env file.');
    }
    
    throw new Error(`Failed to generate module: ${error.message}`);
  }
}
