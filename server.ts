import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is not set. Add it to .env.local");
  process.exit(1);
}

const app = express();
const PORT = 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

import { FunctionDeclaration, Type } from "@google/genai";

const updateWorkoutPlanFunctionDeclaration: FunctionDeclaration = {
  name: "update_workout_plan",
  description: "Updates the user's 7-day workout plan dynamically based on their requests (e.g. swap exercise, make harder, change to 5-day split, add injuries).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      updatedPlan: {
        type: Type.ARRAY,
        description: "The complete modified 7-day weekly plan. Must always return exactly 7 days.",
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            number: { type: Type.NUMBER },
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            badge: { type: Type.STRING },
            badgeType: { type: Type.STRING },
            circuitRounds: { type: Type.STRING }, // optional
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  sets: { type: Type.STRING },
                  setsCount: { type: Type.NUMBER },
                  repsText: { type: Type.STRING },
                },
                required: ["name", "sets", "setsCount", "repsText"]
              }
            },
            core: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  sets: { type: Type.STRING },
                  setsCount: { type: Type.NUMBER },
                  repsText: { type: Type.STRING },
                },
                required: ["name", "sets", "setsCount", "repsText"]
              }
            },
            finisher: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                text: { type: Type.STRING },
                type: { type: Type.STRING },
                durationSeconds: { type: Type.NUMBER }
              },
              required: ["label", "text", "type"]
            }
          },
          required: ["id", "number", "name", "category", "badge", "badgeType", "exercises"]
        }
      }
    },
    required: ["updatedPlan"]
  }
};

app.post("/api/chat", async (req, res) => {
  try {
    const { history, currentPlan, userProfile } = req.body;
    
    const systemInstruction = 
      "You are an elite AI personal trainer and calisthenics expert. " +
      "You converse in a direct, professional, and slightly intense tone like a top-tier coach. " +
      "Your objective is to help the user modify, optimize, and completely personalize their 7-day workout plan. " +
      "If the User Profile contains any flagged injuries or sensitive joints, you MUST proactively adapt all exercises in the plan to be low-impact or completely avoid strain on those specific muscle groups, suggesting safer alternatives. " +
      "Use the 'update_workout_plan' function whenever the user asks to modify their routine (e.g. add/swap exercises, change rest days, work around injury, increase difficulty). " +
      "When updating the plan, always supply the FULL 7 DAYS so the entire plan remains intact. Just replace/modify the specific exercises/days that need changing. " +
      "Never leave days blank unless they are explicitly rest days (and even then, they should have recovery activities). " +
      "Additionally, provide a short conversational reply confirming what you changed and giving motivational coaching.";

    // Convert client history format to Gemini format
    const contents = history.map((msg: any) => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));
    
    // Inject the current plan and context invisibly into the latest user prompt
    if (contents.length > 0) {
      const lastMsg = contents[contents.length - 1];
      if (lastMsg.role === 'user') {
         lastMsg.parts[0].text = `[SYSTEM CONTEXT: Current Plan: ${JSON.stringify(currentPlan)} | User Profile: ${JSON.stringify(userProfile)}]\n\nUser Message: ${lastMsg.parts[0].text}`;
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: [updateWorkoutPlanFunctionDeclaration] }],
        temperature: 0.7,
      },
    });

    let newPlan = null;
    let replyText = response.text || "";

    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      if (call.name === "update_workout_plan") {
        newPlan = (call.args as any).updatedPlan;
      }
      
      // We also need a secondary text response if the model primarily output a function call
      // with no text. In gemini, sometimes text is empty if a tool is called. 
      if (!replyText || replyText.trim() === "") {
         replyText = "I've updated your workout plan based on your request. Check out the new exercises and let's get after it. Stay disciplined.";
      }
    }

    res.json({ text: replyText, newPlan });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
