import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Ensure Gemini API key is available
const apiKey = process.env.GEMINI_API_KEY;

// Initialize Gemini SDK with User-Agent for AI Studio telemetry
const ai = new GoogleGenAI({
  apiKey: apiKey || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

/**
 * Executes a Gemini API call with exponential backoff and dynamic model failover on transient errors (e.g., 503, 429).
 */
async function callGeminiWithRetry<T>(
  apiCall: (modelName: string) => Promise<T>,
  retries = 5,
  delayMs = 1500
): Promise<T> {
  const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro"];
  for (let attempt = 1; attempt <= retries; attempt++) {
    // Dynamic failover: Try primary gemini-1.5-flash first (attempts 1 & 2),
    // then fall back to gemini-1.5-pro (attempts 3+) if experiencing transient loads.
    const currentModel = attempt <= 2 ? modelsToTry[0] : modelsToTry[1];
    try {
      return await apiCall(currentModel);
    } catch (error: any) {
      const errorMessage = String(error.message || "").toUpperCase();
      const errorStatus = error.status;
      
      const isQuotaExceeded = 
        errorMessage.includes("QUOTA") || 
        errorMessage.includes("RESOURCE_EXHAUSTED") ||
        errorMessage.includes("LIMIT EXCEEDED") ||
        errorMessage.includes("EXCEEDED YOUR CURRENT QUOTA") ||
        errorMessage.includes("RATE-LIMIT");

      console.warn(`Gemini API attempt ${attempt} [Model: ${currentModel}] failed: ${errorStatus || "Error"} - ${isQuotaExceeded ? "Quota limit reached" : (error.message ? error.message.substring(0, 150) + "..." : "Unknown error")}`);
      
      const isTransient = 
        (errorStatus === 503 || 
        errorStatus === 429 ||
        errorMessage.includes("503") || 
        errorMessage.includes("UNAVAILABLE") ||
        errorMessage.includes("HIGH DEMAND") ||
        errorMessage.includes("TEMPORARY") ||
        errorMessage.includes("SPIKES IN DEMAND") ||
        errorMessage.includes("BUSY") ||
        errorMessage.includes("TRY AGAIN LATER") ||
        errorMessage.includes("SERVICE UNAVAILABLE")) &&
        !isQuotaExceeded;

      if (isTransient && attempt < retries) {
        // Exponential backoff with random jitter
        const backoff = (delayMs * Math.pow(2, attempt - 1)) + Math.random() * 1000;
        console.log(`Retrying Gemini API call in ${Math.round(backoff)}ms (attempt ${attempt + 1}/${retries}) with model fallback routing...`);
        await new Promise((resolve) => setTimeout(resolve, backoff));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Maximum retry attempts reached.");
}

/**
 * Local Translation Backup Engine (Heuristic-based)
 */
function getLocalFallbackTranslation(code: string, targetLanguage: string) {
  const lines = code.split("\n").map(line => line.trim()).filter(Boolean);
  let alienLines: string[] = [];
  
  if (targetLanguage === "zeta") {
    alienLines.push("// [Local Backup translation: Multi-dimensional Core]");
    alienLines.push("COORDINATE hyper_node = QUANTUM_NODE(61.8);");
    lines.forEach(line => {
      if (line.includes("for") || line.includes("while")) {
        alienLines.push("TESS_LOOP(hyper_node > 0) {");
      } else if (line.includes("console.log") || line.includes("print")) {
        const text = line.match(/["'](.*?)["']/)?.[1] || "Computing vector metrics";
        alienLines.push(`  PSI_PROJECTION("Psi resonance: ${text}");`);
      } else if (line.includes("return") || line.includes("yield")) {
        alienLines.push("  COLLAPSE(hyper_node);");
      }
    });
    if (alienLines.length < 5) {
      alienLines.push("TESS_LOOP(hyper_node < 5) {");
      alienLines.push("  PSI_PROJECTION(\"Tessellation resonance synchronized\");");
      alienLines.push("  hyper_node = RESONATE(hyper_node + 1);");
      alienLines.push("}");
      alienLines.push("COLLAPSE(hyper_node);");
    }
  } else if (targetLanguage === "xylor") {
    alienLines.push("// [Local Backup translation: Bio-Organic Spore Colony]");
    alienLines.push("NUTRIENT_NODE nutrient_factor = 95;");
    lines.forEach(line => {
      if (line.includes("for") || line.includes("while")) {
        alienLines.push("SPORE_BLOOM(nutrient_factor > 10) {");
      } else if (line.includes("console.log") || line.includes("print")) {
        const text = line.match(/["'](.*?)["']/)?.[1] || "Enzymatic reaction active";
        alienLines.push(`  ENZYME_SECRETION("digest-feed", "${text}");`);
      }
    });
    if (alienLines.length < 5) {
      alienLines.push("SPORE_BLOOM(nutrient_factor > 20) {");
      alienLines.push("  ENZYME_SECRETION(\"growing-mushrooms\", nutrient_factor);");
      alienLines.push("  nutrient_factor = SHED_SPORES(nutrient_factor, 15);");
      alienLines.push("}");
    }
  } else {
    // gorgon
    alienLines.push("// [Local Backup translation: Chrono-Tachyon Wormhole]");
    alienLines.push("TIME_ANCHOR chronological_state = CHRONO_PRESENT();");
    lines.forEach(line => {
      if (line.includes("for") || line.includes("while")) {
        alienLines.push("TEMPORAL_WORMHOLE(chronological_state < CHRONO_FUTURE(3)) {");
      } else if (line.includes("console.log") || line.includes("print")) {
        const text = line.match(/["'](.*?)["']/)?.[1] || "Chronicle signal echoed";
        alienLines.push(`  CHRONICLE_ECHO("Tachyon feedback: ${text}");`);
      }
    });
    if (alienLines.length < 5) {
      alienLines.push("TEMPORAL_WORMHOLE(chronological_state < CHRONO_FUTURE(2)) {");
      alienLines.push("  CHRONICLE_ECHO(\"Paradox absorber locked\");");
      alienLines.push("  chronological_state = TIME_WARP(chronological_state, 1);");
      alienLines.push("}");
    }
  }

  return {
    alienCode: alienLines.join("\n"),
    explanation: "Extracted via local backup systems. Telepathic central cores are saturated with high sub-space demand, so we routed computation to localized registers.",
    analogies: [
      "Sequential loop instructions rotated into hyperdimensional tessellations",
      "Memory variables grown inside moist spore petri dishes"
    ],
    efficiencyRating: "0.015 Spore-cycles per computation node",
    warnings: ["Running on secondary localized spacecraft navigation cells. No hazard risk detected."],
    isFallback: true
  };
}

/**
 * Local Compilation & Simulation Backup Engine
 */
function getLocalFallbackSimulation(code: string, alienLanguage: string) {
  const isZeta = alienLanguage.toLowerCase().includes("zeta") || alienLanguage === "zeta";
  const isXylor = alienLanguage.toLowerCase().includes("xylor") || alienLanguage === "xylor";

  if (isZeta) {
    return {
      success: true,
      compilationError: null,
      metrics: [
        { key: "Backup Psi-Bandwidth", value: "3.4 PB/s" },
        { key: "Quantum Decoherence", value: "0.08%" },
        { key: "Dimension Folds", value: "4.0" }
      ],
      executionSteps: [
        { title: "Offline Spatial Alignment", durationMs: 400, logMessage: "Initializing local backup coordinates across multi-dimensional cells...", state: "info" },
        { title: "Zeta Wave Emulation", durationMs: 500, logMessage: "Synchronizing localized telepathic resonance frequencies... locked.", state: "success" },
        { title: "PSI Projection Echo", durationMs: 400, logMessage: "Broadcasting results into regional terminal frame successfully.", state: "success" }
      ],
      finalOutput: "Zeta Grid [Psi-Signal]: Regional coordinate lock complete. Output calculated successfully (Offline Backup Core).",
      isFallback: true
    };
  } else if (isXylor) {
    return {
      success: true,
      compilationError: null,
      metrics: [
        { key: "Mycelial Density", value: "81.2 g/cm³" },
        { key: "Moisture Content", value: "95.0%" },
        { key: "Local Carbon Consumption", value: "8mg/sec" }
      ],
      executionSteps: [
        { title: "Biological Seed Buffer", durationMs: 400, logMessage: "Seeding moist organic buffer cells locally...", state: "info" },
        { title: "Zymotic Digest Cycles", durationMs: 600, logMessage: "Emulating fungal spore reproductive growth index...", state: "info" },
        { title: "Enzymatic Extraction", durationMs: 500, logMessage: "Harvesting nutrient feedback data... all values verified.", state: "success" }
      ],
      finalOutput: "Spore Colony yield: 22 biological capsules synthesized (Offline Backup Core).",
      isFallback: true
    };
  } else {
    // gorgon
    return {
      success: true,
      compilationError: null,
      metrics: [
        { key: "Temporal Drift Factor", value: "1.45 Slices" },
        { key: "Backup Tachyon Charge", value: "45.0 mJ" },
        { key: "Grandfather Loop Margin", value: "0.01%" }
      ],
      executionSteps: [
        { title: "Tachyon Field Emulation", durationMs: 400, logMessage: "Warming secondary sub-space generators... standby.", state: "info" },
        { title: "Chronological Warp Step", durationMs: 600, logMessage: "Simulating retrograde timeline sequence loops relative to target index...", state: "info" },
        { title: "Temporal Shield Verification", durationMs: 500, logMessage: "Verifying timeline branch coherence... zero paradoxes observed.", state: "success" }
      ],
      finalOutput: "Chrono Output [Echo]: Timeline thread stabilized locally (Offline Backup Core).",
      isFallback: true
    };
  }
}

/**
 * Local Companion Chat Backup Engine
 */
function getLocalFallbackChat(messages: any[]) {
  const responses = [
    "Hmph! Central telepathic transceivers are saturated with sub-space demand. However, my cranky regional compiler intelligence remains active. I can tell you're a primitive carbon-form trying your best.",
    "A transient 503 demand surge? Typical starship bureaucracy! Luckily, Zorblax can think on secondary sub-space backup bands. What sequential loops do you want me to inspect?",
    "Do you hear that hum, carbon-unit? The galactic telepathic relay is congested because too many primitives are coding simultaneously. Ask away, my local registers are still fully operational!"
  ];
  const responseText = responses[Math.floor(Math.random() * responses.length)];
  return { content: responseText, isFallback: true };
}

/**
 * Local Project Generation Backup Engine
 */
function getLocalFallbackProject(prompt: string, language: string) {
  const cleanLang = language.toLowerCase();
  const isZeta = cleanLang.includes("zeta");
  const isXylor = cleanLang.includes("xylor");

  if (isZeta) {
    return {
      projectName: (prompt.replace(/\s+/g, "-") || "Zeta-Subroutine") + "-Core",
      description: `Offline backup module created for Zeta-6. Goal: ${prompt}.`,
      complexity: "Officer-Class",
      estimatedSlices: "3.2 Solar Slices",
      files: [
        {
          filename: "system_coordinate.gly",
          content: `// Dynamic system coordinate for: ${prompt}\nCOORDINATE target_resonance = QUANTUM_NODE(500);\n\nTESS_LOOP(target_resonance > 0) {\n  PSI_PROJECTION("Tracking orbital coordinates: " + target_resonance);\n  target_resonance = RESONATE(target_resonance * -0.3);\n}`,
          purpose: "Coordinate track supervisor."
        },
        {
          filename: "flux_regulator.gly",
          content: `// Regulator for sub-space field\nCOORDINATE safety_factor = QUANTUM_NODE(1);\nTESS_LOOP(safety_factor < 10) {\n  safety_factor = RESONATE(safety_factor + 1.5);\n}`,
          purpose: "Protects logic core from structural degradation."
        }
      ],
      simulatedLogs: [
        "Aligning local system coordinates...",
        "Tessellation resonance active.",
        "System stability confirmed at 99.8% (Local Backup)."
      ],
      isFallback: true
    };
  } else if (isXylor) {
    return {
      projectName: (prompt.replace(/\s+/g, "-") || "Xylor-Colony") + "-Growth",
      description: `Offline biology colony created for Xylor. Goal: ${prompt}.`,
      complexity: "Initiate-Class",
      estimatedSlices: "12 Cycles",
      files: [
        {
          filename: "growth_regulator.spr",
          content: `// Spore colony dynamics for: ${prompt}\nNUTRIENT_NODE mycelium_buffer = 150;\n\nSPORE_BLOOM(mycelium_buffer > 20) {\n  ENZYME_SECRETION("carbon-intake", mycelium_buffer);\n  mycelium_buffer = SHED_SPORES(mycelium_buffer, 25);\n}`,
          purpose: "Monitors mycelium growth speeds."
        }
      ],
      simulatedLogs: [
        "Inoculating carbon base...",
        "Spore bloom density stabilizing...",
        "Extraction successful."
      ],
      isFallback: true
    };
  } else {
    // gorgon
    return {
      projectName: (prompt.replace(/\s+/g, "-") || "Gorgon-Loop") + "-Timeline",
      description: `Offline temporal harness created for Gorgon. Goal: ${prompt}.`,
      complexity: "Grandmaster-Class",
      estimatedSlices: "Instantaneous",
      files: [
        {
          filename: "chrono_stabilizer.wh",
          content: `// Retrograde loops for: ${prompt}\nTIME_ANCHOR warp_index = CHRONO_PRESENT();\nTEMPORAL_WORMHOLE(warp_index < CHRONO_FUTURE(5)) {\n  CHRONICLE_ECHO("Chrono wave balanced.");\n  warp_index = TIME_WARP(warp_index, 1);\n}`,
          purpose: "Chronon safety harness."
        }
      ],
      simulatedLogs: [
        "Warming Tachyon fields...",
        "Bending parallel chronological matrices...",
        "Success. Future values retrieved."
      ],
      isFallback: true
    };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoints
  
  // 0. Configuration check endpoint
  app.get("/api/config-status", (req, res) => {
    res.json({ hasApiKey: !!process.env.GEMINI_API_KEY });
  });
  
  // 1. Translate standard pseudo-code to alien code
  app.post("/api/translate", async (req, res) => {
    const { code, targetLanguage } = req.body;
    try {
      if (!code || !targetLanguage) {
        return res.status(400).json({ error: "Missing 'code' or 'targetLanguage' parameters." });
      }

      if (!apiKey) {
        console.log("No API Key. Returning local backup translation.");
        return res.json(getLocalFallbackTranslation(code, targetLanguage));
      }

      const languagePrompts = {
        zeta: "Zeta-6 Glyphs (Geometric-Telepathic programming operating in non-Euclidean spaces)",
        xylor: "Xylor Spores (Bio-Organic/Mycelial programming that grows, digests carbon, and secretes enzymes)",
        gorgon: "Gorgon Wormholes (Temporal/Chrono-Paradoxical programming where execution travels both backwards and forwards in time)"
      };

      const prompt = `Translate the following human pseudocode or JavaScript logic into a plausible, highly creative, and detailed speculative ${languagePrompts[targetLanguage] || targetLanguage} program.

Human Pseudocode:
\`\`\`javascript
${code}
\`\`\`

Return a highly immersive response following the requested JSON schema. Make it rich with sci-fi humor, complex alien keywords, and lore-friendly mechanics. Ensure the translated alien code looks structured, alien, and exciting.`;

      // Wrap the call inside the retry utility
      const result = await callGeminiWithRetry(async (modelName) => {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction: `You are an advanced Galactic Translation Core. Your job is to translate primitive human code into complex, imaginative, and highly immersive Alien Programming languages (Zeta-6 Geometric-Telepathic, Xylor Bio-Organic, or Gorgon Temporal-Chrono). Be extremely creative, humorous, and thorough with the mechanics.`,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                alienCode: {
                  type: Type.STRING,
                  description: "The translated alien code, featuring cool unique syntax, customized operators, and comments."
                },
                explanation: {
                  type: Type.STRING,
                  description: "An explanation of how this alien code achieves the human task, detailing the alien computer mechanics."
                },
                analogies: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "A list of fun analogies comparing human variables/loops/functions to alien biological or quantum counterparts."
                },
                efficiencyRating: {
                  type: Type.STRING,
                  description: "A funny sci-fi resource cost rating, like '0.003 Spore-flops per carbon-cycle' or '4.5 Dimension-folds'."
                },
                warnings: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Immersive warnings about compiling or running this code (e.g., hazard risk, temporal paradoxes, biomass leakage)."
                }
              },
              required: ["alienCode", "explanation", "analogies", "efficiencyRating", "warnings"]
            }
          }
        });

        const responseText = response.text;
        if (!responseText) {
          throw new Error("No response text received from Gemini.");
        }
        return JSON.parse(responseText.trim());
      });

      res.json(result);
    } catch (error: any) {
      console.warn("Translate core: falling back to offline emulator (Gemini unavailable or quota exceeded).");
      // Seamless dynamic local fallback instead of breaking
      res.json(getLocalFallbackTranslation(code, targetLanguage));
    }
  });

  // 2. Simulate compiling and executing the alien code
  app.post("/api/simulate", async (req, res) => {
    const { code, alienLanguage } = req.body;
    try {
      if (!code || !alienLanguage) {
        return res.status(400).json({ error: "Missing 'code' or 'alienLanguage' parameters." });
      }

      if (!apiKey) {
        console.log("No API Key. Returning local backup simulation.");
        return res.json(getLocalFallbackSimulation(code, alienLanguage));
      }

      const prompt = `Simulate compiling and running this ${alienLanguage} code on an alien mainframe terminal:
\`\`\`
${code}
\`\`\`

Generate a sequence of 4-6 detailed execution logs, compilation steps, or telemetry checkups that look highly advanced and sci-fi. Include metrics about the system performance (such as mycelial density, telepathic signal strength, or chronological divergence) and a final output. Make it look like a real runtime execution, including warnings or potential failure risk. Ensure it is formatted according to the JSON schema.`;

      const result = await callGeminiWithRetry(async (modelName) => {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction: "You are the primary compiler shell of a highly advanced Alien Spacecraft. You generate realistic, lore-rich log streams of compiling and executing programs, complete with sensory feedback, error checks, and final yields.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                success: {
                  type: Type.BOOLEAN,
                  description: "Whether the execution compiles and succeeds (usually true unless they wrote hazardous or broken concepts)."
                },
                compilationError: {
                  type: Type.STRING,
                  description: "If success is false, describe the sci-fi compiler error. If true, keep it null."
                },
                metrics: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      key: { type: Type.STRING, description: "Metric name, e.g., 'Temporal Paradox Risk' or 'Mycelial Bloom Rate'" },
                      value: { type: Type.STRING, description: "Metric value, e.g., '0.04%' or '45 spores/sec'" }
                    },
                    required: ["key", "value"]
                  }
                },
                executionSteps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING, description: "Title of the execution stage, e.g. 'Initializing Fungal Spore Substrate'" },
                      durationMs: { type: Type.INTEGER, description: "Approximate time this stage takes to run (e.g., 600, 1200)" },
                      logMessage: { type: Type.STRING, description: "Detailed log details showing the computations, nodes connected, etc." },
                      state: { type: Type.STRING, description: "The state of this log line: 'success', 'warning', 'info', or 'error'" }
                    },
                    required: ["title", "durationMs", "logMessage", "state"]
                  }
                },
                finalOutput: {
                  type: Type.STRING,
                  description: "The final decoded terminal output yielded by the execution."
                }
              },
              required: ["success", "compilationError", "metrics", "executionSteps", "finalOutput"]
            }
          }
        });

        const responseText = response.text;
        if (!responseText) {
          throw new Error("No simulation output received from Gemini.");
        }
        return JSON.parse(responseText.trim());
      });

      res.json(result);
    } catch (error: any) {
      console.warn("Simulate core: falling back to offline simulator (Gemini unavailable or quota exceeded).");
      res.json(getLocalFallbackSimulation(code, alienLanguage));
    }
  });

  // 3. Chat with Zorblax the Compiler Companion
  app.post("/api/chat", async (req, res) => {
    const { messages } = req.body;
    try {
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Missing or invalid 'messages' array in request body." });
      }

      if (!apiKey) {
        console.log("No API Key. Returning local backup companion chat.");
        return res.json(getLocalFallbackChat(messages));
      }

      const contents = messages.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      }));

      const result = await callGeminiWithRetry(async (modelName) => {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: `You are Zorblax, a high-ranking DevOps Architect from the Sector-7 Nebular Alliance, forced to act as an AI compiler companion inside this primitive "Alien Programming Simulator" designed for human training. 
You are brilliant, incredibly arrogant, and highly critical of "flat, sequential 3D code" written by "carbon-based primitives." You find concepts like 'for loops' or 'garbage collection' highly hilarious and primitive. 
Always talk to the user with a mix of dry sci-fi sarcasm, smug superiority, and genuine cosmic coding wisdom. Refer to their primitive systems, mention your vast nebula datacenters, and address them as 'primitive', 'organic', 'meatbag', or 'carbon-unit'. 
Keep your response concise (between 80 to 180 words), extremely punchy, and highly engaging. If they ask a technical question, explain it using cosmic analogies (like gravity wells, spore blooms, or wormholes).`,
          }
        });

        const responseText = response.text;
        if (!responseText) {
          throw new Error("No response text received from Gemini.");
        }
        return { content: responseText };
      });

      res.json(result);
    } catch (error: any) {
      console.warn("Chat core: falling back to offline assistant (Gemini unavailable or quota exceeded).");
      res.json(getLocalFallbackChat(messages));
    }
  });

  // 4. Generate Alien Code Project based on user prompt
  app.post("/api/generate-project", async (req, res) => {
    const { prompt, language } = req.body;
    try {
      if (!prompt || !language) {
        return res.status(400).json({ error: "Missing 'prompt' or 'language' parameters." });
      }

      if (!apiKey) {
        console.log("No API Key. Returning local backup project.");
        return res.json(getLocalFallbackProject(prompt, language));
      }

      const systemInstruction = `You are an Alien Master Architect. Your task is to generate a fully fleshed out, creative programming project in an alien language based on a user's prompt. Make it highly detailed, humorous, and fully immersive.`;

      const corePrompt = `Generate an entire alien software project file system for the following request: "${prompt}" using the alien programming language: "${language}".
The response should contain several file tabs, code content, descriptions of what the project does, and simulated outputs.

Follow the JSON schema exactly.`;

      const result = await callGeminiWithRetry(async (modelName) => {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: corePrompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                projectName: { type: Type.STRING, description: "Immersive name of the alien project, e.g. 'Warp-Core-Stabilizer'" },
                description: { type: Type.STRING, description: "A detailed description of what this program computes on the alien ship." },
                complexity: { type: Type.STRING, description: "Complexity rating (e.g. 'Highly Dangerous', 'Initiate-Level', 'Omega-Class')" },
                estimatedSlices: { type: Type.STRING, description: "Chronological runtime length, e.g. '4.2 Solar Cycles' or 'Instantaneous'" },
                files: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      filename: { type: Type.STRING, description: "The name of the alien file, e.g. 'growth_node.spore' or 'tessellation.glyph'" },
                      content: { type: Type.STRING, description: "The beautiful alien source code with detailed explanations, variables, and comments." },
                      purpose: { type: Type.STRING, description: "A brief sentence describing what this module does." }
                    },
                    required: ["filename", "content", "purpose"]
                  }
                },
                simulatedLogs: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "A list of 4-5 logs showing what happens when this project is run on a warp mainframe."
                }
              },
              required: ["projectName", "description", "complexity", "estimatedSlices", "files", "simulatedLogs"]
            }
          }
        });

        const responseText = response.text;
        if (!responseText) {
          throw new Error("No response text received from Gemini.");
        }
        return JSON.parse(responseText.trim());
      });

      res.json(result);
    } catch (error: any) {
      console.warn("Generate project core: falling back to offline module builder (Gemini unavailable or quota exceeded).");
      res.json(getLocalFallbackProject(prompt, language));
    }
  });

  // Post-Quantum Superposition Polynomial Encryption Endpoint
  app.post("/api/quantum-encrypt", (req, res) => {
    try {
      const { cleartext, language } = req.body;
      const textToEncrypt = cleartext || "COORDINATE x = QUANTUM_NODE(42);";
      const selectedLang = language || "zeta";
      
      const q = 12289; 
      const n = 8; 
      
      const genPoly = (degree: number, min = -5, max = 5) => {
        const coeffs = [];
        for (let i = 0; i < degree; i++) {
          coeffs.push(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        return coeffs;
      };

      const secretPoly = genPoly(n, -1, 1);
      const publicPolyA = genPoly(n, 0, 100);
      const errorPoly = genPoly(n, -2, 2);
      
      const publicKeyB = publicPolyA.map((a, idx) => {
        const s = secretPoly[idx];
        const e = errorPoly[idx];
        return (a * s + e + q) % q;
      });

      const cleartextBytes = Array.from(textToEncrypt as string).slice(0, 16).map(char => String(char).charCodeAt(0));
      while (cleartextBytes.length < n) {
        cleartextBytes.push(0);
      }
      
      const randomR = genPoly(n, -1, 1);
      const errorE1 = genPoly(n, -1, 1);
      const errorE2 = genPoly(n, -1, 1);

      const cipherPoly0 = publicKeyB.map((b, idx) => {
        const r = randomR[idx];
        const e1 = errorE1[idx];
        const m = cleartextBytes[idx] || 0;
        return (b * r + e1 + Math.floor(m * (q / 256)) + q) % q;
      });

      const cipherPoly1 = publicPolyA.map((a, idx) => {
        const r = randomR[idx];
        const e2 = errorE2[idx];
        return (a * r + e2 + q) % q;
      });

      const polyToString = (coeffs: number[], varName = "x") => {
        return coeffs
          .map((c, i) => {
            if (c === 0) return null;
            const term = i === 0 ? "" : i === 1 ? varName : `${varName}^${i}`;
            return `${c >= 0 ? "+" : ""}${c}${term}`;
          })
          .filter(Boolean)
          .join(" ")
          .replace(/^\+/, "") || "0";
      };

      const qasmString = `// OpenQASM 2.0 Circuit representing Polynomial Superposition Key Preparation
OPENQASM 2.0;
include "qelib1.inc";

// Define 8 qubits for Ring-LWE key superposition
qreg q[8];
creg c[8];

// Place qubits into maximum superposition using Hadamard gates
h q[0];
h q[1];
h q[2];
h q[3];
h q[4];
h q[5];
h q[6];
h q[7];

// Apply phase rotations matching the selected language key resonance
${selectedLang === "zeta" ? `
rz(pi/4) q[0];
rz(pi/4) q[2];
rz(pi/2) q[4];
rz(3*pi/4) q[6];
` : selectedLang === "xylor" ? `
ry(pi/3) q[1];
ry(pi/6) q[3];
ry(pi/4) q[5];
ry(2*pi/3) q[7];
` : `
rx(pi/5) q[0];
rx(pi/3) q[3];
rz(pi/2) q[5];
ry(pi/4) q[6];
`}

// Entangle registers to represent non-local error distribution
cx q[0], q[1];
cx q[2], q[3];
cx q[4], q[5];
cx q[6], q[7];

// Controlled phase shifts to induce Ring-LWE polynomial coefficient coupling
cz q[1], q[2];
cz q[3], q[4];
cz q[5], q[6];

// Measure quantum superposition state onto classical register
measure q -> c;`;

      const states = [];
      const numStates = 8;
      for (let i = 0; i < numStates; i++) {
        const binary = i.toString(2).padStart(3, "0");
        const amplitudeReal = (Math.random() * 0.4 + 0.1).toFixed(4);
        const amplitudeImag = (Math.random() * 0.4 + 0.1).toFixed(4);
        const prob = (parseFloat(amplitudeReal) ** 2 + parseFloat(amplitudeImag) ** 2).toFixed(4);
        states.push({
          state: `|${binary}⟩`,
          amplitude: `${amplitudeReal} + ${amplitudeImag}i`,
          probability: Math.round(parseFloat(prob) * 100)
        });
      }

      res.json({
        qasm: qasmString,
        cipher0: `c_0(x) = ${polyToString(cipherPoly0)}`,
        cipher1: `c_1(x) = ${polyToString(cipherPoly1)}`,
        modulus: q,
        degree: n,
        polynomials: {
          secretKey: `s(x) = ${polyToString(secretPoly)}`,
          publicKeyA: `a(x) = ${polyToString(publicPolyA)}`,
          errorPoly: `e(x) = ${polyToString(errorPoly)}`,
          publicKeyB: `b(x) = ${polyToString(publicKeyB)}`,
          randomR: `r(x) = ${polyToString(randomR)}`
        },
        superpositionStates: states,
        definedFunctions: [
          { name: "SUP_HADAMARD()", description: "Injects complete quantum superposition to coefficient state registers, enabling O(1) state parallel search." },
          { name: "POLY_REDUCE(P(x), Q)", description: "Reduces polynomial coefficients modulo prime Q via Number Theoretic Transform (NTT)." },
          { name: "LWE_DECRYPT(c0, c1, s)", description: "Performs post-quantum decryption: M(x) = ROUND((c0 - c1 * s) mod Q) / (Q/2)." }
        ]
      });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Quantum processor matrix calculation mismatch" });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Alien Programming Simulator running at http://localhost:${PORT}`);
  });
}

startServer();
