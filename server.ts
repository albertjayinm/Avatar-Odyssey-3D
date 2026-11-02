import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoints
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", game: "Pokopia 3D Adventure" });
  });

  // AI Creature Speech Translator & Chatter
  app.post("/api/chat-creature", async (req, res) => {
    try {
      const { creatureName, personality, element, message, levelName } = req.body;
      const ai = getAIClient();

      if (!ai) {
        // Fallback response if GEMINI_API_KEY is not set
        const soundMap: Record<string, string> = {
          Bloomtail: "Pew pew! *Wags leafy tail happily*",
          Sparky: "Pika-zap! *Ears twitch with sparks*",
          Frosty: "Brrr-yip! *Nuzzles warmly*",
          Lumi: "Glow-glow~ *Floats gently in circles*",
        };
        const defaultSound = soundMap[creatureName] || "Kuu-kuu! *Happily dances around*";
        return res.json({
          creatureSound: defaultSound,
          translation: `I'm super happy to explore ${levelName || "this land"} with you! Let me help you find berries and secrets!`,
        });
      }

      const prompt = `You are playing the role of "${creatureName}", a cute companion creature in the 3D cozy adventure game Pokopia!
Element: ${element || "Magic"}
Personality: ${personality || "Playful and loyal"}
Current Zone: ${levelName || "Pokopia World"}
Player said: "${message}"

Respond with a JSON object with:
1. "creatureSound": A cute vocal expression with sound effects or actions in asterisks (e.g., "Pika-chirp! *Wiggles fluffy tail*").
2. "translation": The cute, friendly English translation of what the creature is expressing to the player (1-2 short cozy sentences).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const rawText = response.text || "{}";
      const parsed = JSON.parse(rawText);
      res.json({
        creatureSound: parsed.creatureSound || "*Happy creature noises*",
        translation: parsed.translation || "Let's keep adventuring together!",
      });
    } catch (err: any) {
      console.error("Creature chat error:", err);
      res.json({
        creatureSound: "*Joyful chirp*",
        translation: "I love exploring Pokopia with you!",
      });
    }
  });

  // AI Dynamic Quest Generator
  app.post("/api/generate-quest", async (req, res) => {
    try {
      const { levelName, befriendedCount, playerLevel } = req.body;
      const ai = getAIClient();

      if (!ai) {
        return res.json({
          title: "Secret Harvest",
          description: `Gather 3 fresh berries in ${levelName} to share a feast with your Pokopia friends!`,
          rewardItem: "Golden Star Fruit",
          rewardXp: 150,
        });
      }

      const prompt = `Generate a cozy, fun adventure side-quest for a player in the 3D Pokopia game.
Current Biome Level: ${levelName}
Befriended Creatures Count: ${befriendedCount}
Player Explorer Level: ${playerLevel}

Return JSON with:
1. "title": Catchy short quest title
2. "description": 1-2 sentence cozy goal (e.g. finding hidden glowing crystal, building a campfire, feeding wild creatures)
3. "rewardItem": Name of a cool reward item or habitat decor
4. "rewardXp": integer XP value (50-300)`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({
        title: parsed.title || "Explorer's Discovery",
        description: parsed.description || "Explore the surroundings and find hidden elemental crystals!",
        rewardItem: parsed.rewardItem || "Cozy Cushion",
        rewardXp: parsed.rewardXp || 100,
      });
    } catch (err) {
      res.json({
        title: "Berry Picnic",
        description: "Gather delicious berries across the meadow and feed your companions!",
        rewardItem: "Berry Trough",
        rewardXp: 100,
      });
    }
  });

  // Vite middleware for dev or Static serve for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Pokopia 3D Adventure server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
