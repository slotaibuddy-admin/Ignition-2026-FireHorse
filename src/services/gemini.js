import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = import.meta.env.VITE_GEMINI_API_KEY 
  ? new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
  : null;

function generateUniqueId() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  const secondRandom = Math.random().toString(36).substring(2, 6);
  return `0x${timestamp}${randomPart}${secondRandom}`.toUpperCase();
}

// Mock data for testing when API key is not available
const mockCreatures = [
  {
    name: "Blaze Phoenix",
    rarity: "Legendary",
    description: "A majestic fire phoenix risen from ancient flames, embodying the spirit of 2026.",
    power: 92,
    speed: 85,
    heat: 98,
    hp: 120,
    weakness: "Water",
    resistance: "Fire",
    asset3dType: "phoenix"
  },
  {
    name: "Inferno Drake",
    rarity: "Epic",
    description: "A powerful serpentine dragon wrapped in eternal flames of the Year of Fire.",
    power: 88,
    speed: 72,
    heat: 94,
    hp: 110,
    weakness: "Ice",
    resistance: "Dragon",
    asset3dType: "drake"
  },
  {
    name: "Magma Beast",
    rarity: "Rare",
    description: "A creature born from molten earth, carrying the strength of volcanic power.",
    power: 75,
    speed: 60,
    heat: 88,
    hp: 95,
    weakness: "Water",
    resistance: "Fire",
    asset3dType: "magma_beast"
  },
  {
    name: "Blaze Wolf",
    rarity: "Common",
    description: "A swift wolf ablaze with mystical fire, a companion of the 2026 lunar year.",
    power: 65,
    speed: 80,
    heat: 75,
    hp: 80,
    weakness: "Water",
    resistance: "Fire",
    asset3dType: "blaze_wolf"
  },
  {
    name: "Inferno Core",
    rarity: "Mythic",
    description: "The ultimate embodiment of the Year of Fire - a sentient core of pure celestial flame.",
    power: 99,
    speed: 78,
    heat: 100,
    hp: 140,
    weakness: "Ice",
    resistance: "Fire",
    asset3dType: "inferno_core"
  }
];

export async function generateCyberModule() {
  try {
    // If API key not configured, use mock data
    if (!genAI) {
      console.warn('Gemini API key not configured. Using mock test data.');
      const mockCreature = mockCreatures[Math.floor(Math.random() * mockCreatures.length)];
      return {
        ...mockCreature,
        uniqueId: generateUniqueId(),
        generatedAt: new Date().toISOString()
      };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Generate a unique Fire Horse NFT Creature for the Year of the Fire Horse (2026).

    Create a JSON object with the following structure (return ONLY valid JSON):
    {
      "name": "A unique, creative name for the creature (futuristic + fire themed)",
      "rarity": "One of: Common, Rare, Epic, Legendary, or Mythic",
      "description": "A short, engaging backstory (2-3 sentences) about this creature",
      "power": A number between 1 and 100,
      "speed": A number between 1 and 100,
      "heat": A number between 1 and 100,
      "hp": A number between 20 and 150 (Pokemon-style HP),
      "weakness": "A type weakness (e.g., Water, Ice, Rock)",
      "resistance": "A type resistance (e.g., Fire, Dragon, Flying)",
      "asset3dType": "One of: phoenix, drake, inferno_core, blaze_wolf, magma_beast"
    }

    Requirements:
    - Higher rarity → better stats overall
    - Make it thematically related to the Year of the Fire Horse
    - asset3dType should match the creature's visual archetype
    - Return ONLY the JSON object, no markdown or extra text.`;

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
    const requiredFields = ['name', 'rarity', 'description', 'power', 'speed', 'heat', 'hp', 'weakness', 'resistance', 'asset3dType'];
    const missingFields = requiredFields.filter(field => module[field] === undefined);
    if (missingFields.length > 0) {
      throw new Error(`Invalid module structure. Missing fields: ${missingFields.join(', ')}`);
    }

    module.uniqueId = generateUniqueId();
    module.generatedAt = new Date().toISOString();

    return module;
  } catch (error) {
    console.error('Error generating cyber module:', error);

    // Log warning about using fallback data
    console.warn('Using fallback demo module due to API error. Check API configuration or network connectivity.');

    // Return a fallback demo module for testing/demo purposes
    return {
      name: "Phoenix Inferno Core",
      rarity: "Legendary",
      description: "Born from the eternal flames of the Fire Horse constellation, this legendary core channels raw cosmic energy through crystallized phoenix essence. Its power transcends mortal comprehension.",
      power: 95,
      speed: 88,
      heat: 99,
      hp: 120,
      weakness: "Water",
      resistance: "Fire",
      asset3dType: "phoenix",
      uniqueId: generateUniqueId(),
      generatedAt: new Date().toISOString()
    };
  }
}
