var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_genai2 = require("@google/genai");
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var ai = new import_genai.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
var updateWorkoutPlanFunctionDeclaration = {
  name: "update_workout_plan",
  description: "Updates the user's 7-day workout plan dynamically based on their requests (e.g. swap exercise, make harder, change to 5-day split, add injuries).",
  parameters: {
    type: import_genai2.Type.OBJECT,
    properties: {
      updatedPlan: {
        type: import_genai2.Type.ARRAY,
        description: "The complete modified 7-day weekly plan. Must always return exactly 7 days.",
        items: {
          type: import_genai2.Type.OBJECT,
          properties: {
            id: { type: import_genai2.Type.STRING },
            number: { type: import_genai2.Type.NUMBER },
            name: { type: import_genai2.Type.STRING },
            category: { type: import_genai2.Type.STRING },
            badge: { type: import_genai2.Type.STRING },
            badgeType: { type: import_genai2.Type.STRING },
            circuitRounds: { type: import_genai2.Type.STRING },
            // optional
            exercises: {
              type: import_genai2.Type.ARRAY,
              items: {
                type: import_genai2.Type.OBJECT,
                properties: {
                  name: { type: import_genai2.Type.STRING },
                  sets: { type: import_genai2.Type.STRING },
                  setsCount: { type: import_genai2.Type.NUMBER },
                  repsText: { type: import_genai2.Type.STRING }
                },
                required: ["name", "sets", "setsCount", "repsText"]
              }
            },
            core: {
              type: import_genai2.Type.ARRAY,
              items: {
                type: import_genai2.Type.OBJECT,
                properties: {
                  name: { type: import_genai2.Type.STRING },
                  sets: { type: import_genai2.Type.STRING },
                  setsCount: { type: import_genai2.Type.NUMBER },
                  repsText: { type: import_genai2.Type.STRING }
                },
                required: ["name", "sets", "setsCount", "repsText"]
              }
            },
            finisher: {
              type: import_genai2.Type.OBJECT,
              properties: {
                label: { type: import_genai2.Type.STRING },
                text: { type: import_genai2.Type.STRING },
                type: { type: import_genai2.Type.STRING },
                durationSeconds: { type: import_genai2.Type.NUMBER }
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
    const systemInstruction = "You are an elite AI personal trainer and calisthenics expert. You converse in a direct, professional, and slightly intense tone like a top-tier coach. Your objective is to help the user modify, optimize, and completely personalize their 7-day workout plan. If the User Profile contains any flagged injuries or sensitive joints, you MUST proactively adapt all exercises in the plan to be low-impact or completely avoid strain on those specific muscle groups, suggesting safer alternatives. Use the 'update_workout_plan' function whenever the user asks to modify their routine (e.g. add/swap exercises, change rest days, work around injury, increase difficulty). When updating the plan, always supply the FULL 7 DAYS so the entire plan remains intact. Just replace/modify the specific exercises/days that need changing. Never leave days blank unless they are explicitly rest days (and even then, they should have recovery activities). Additionally, provide a short conversational reply confirming what you changed and giving motivational coaching.";
    const contents = history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));
    if (contents.length > 0) {
      const lastMsg = contents[contents.length - 1];
      if (lastMsg.role === "user") {
        lastMsg.parts[0].text = `[SYSTEM CONTEXT: Current Plan: ${JSON.stringify(currentPlan)} | User Profile: ${JSON.stringify(userProfile)}]

User Message: ${lastMsg.parts[0].text}`;
      }
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: [updateWorkoutPlanFunctionDeclaration] }],
        temperature: 0.7
      }
    });
    let newPlan = null;
    let replyText = response.text || "";
    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      if (call.name === "update_workout_plan") {
        newPlan = call.args.updatedPlan;
      }
      if (!replyText || replyText.trim() === "") {
        replyText = "I've updated your workout plan based on your request. Check out the new exercises and let's get after it. Stay disciplined.";
      }
    }
    res.json({ text: replyText, newPlan });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
