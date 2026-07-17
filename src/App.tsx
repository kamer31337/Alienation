import React, { useState, useEffect, useRef } from "react";
import { initAudio, playTypeSound, playCompileSound, playTranslateSound } from "./lib/audio";
import { Language, AlienProject, TranslationResult, SimulationResult, Puzzle } from "./types";
import { LANGUAGES, PUZZLES, TEMPLATES, LanguageInfo } from "./data";
import LanguageSelector from "./components/LanguageSelector";
import DocumentationPanel from "./components/DocumentationPanel";
import ZorblaxChat from "./components/ZorblaxChat";
import TerminalSimulation from "./components/TerminalSimulation";
import PuzzlePanel from "./components/PuzzlePanel";
import QuantumEncryptionSuite from "./components/QuantumEncryptionSuite";
import {
  Terminal,
  Cpu,
  Sparkles,
  RefreshCw,
  HelpCircle,
  FileCode2,
  BrainCircuit,
  CornerDownRight,
  Flame,
  Info,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Minus,
  Copy,
  Check,
  Code,
  Mic,
  MicOff,
  History,
  X,
  Search,
  Download,
  Eye,
  EyeOff,
  Layers,
  Save,
  Trash2,
  FolderOpen,
  Menu,
  Lock,
  Shield,
  ShieldAlert,
  Shuffle,
  Share2,
  Wand2,
  Keyboard,
} from "lucide-react";

const ALIEN_KEYWORDS: Record<Language, string[]> = {
  zeta: ["COORDINATE", "QUANTUM_NODE", "TESS_LOOP", "RESONATE", "COLLAPSE", "PSI_PROJECTION"],
  xylor: ["NUTRIENT_NODE", "SPORE_BLOOM", "ENZYME_SECRETION", "SHED_SPORES"],
  gorgon: ["TIME_ANCHOR", "CHRONO_PRESENT", "CHRONO_FUTURE", "TEMPORAL_WORMHOLE", "CHRONICLE_ECHO", "TIME_WARP"]
};

const DEFAULT_SNIPPETS = [
  {
    id: "sn-1",
    title: "Psi-Tessellation Loop",
    dialect: "zeta" as Language,
    description: "Multi-dimensional coordinates iteration with a recursive energy collapse.",
    code: `COORDINATE t_matrix = QUANTUM_NODE(256);\nTESS_LOOP(t_matrix > 0) {\n  PSI_PROJECTION("Active resonance coordinate: " + t_matrix);\n  t_matrix = RESONATE(t_matrix * -0.15);\n}\nCOLLAPSE(t_matrix);`
  },
  {
    id: "sn-2",
    title: "Quantum Interference Beacon",
    dialect: "zeta" as Language,
    description: "Broadcasts a telemetry signal onto public space corridors.",
    code: `COORDINATE beacon = QUANTUM_NODE(100);\nPSI_PROJECTION("Emitting vector beam");\nRESONATE(beacon);\nCOLLAPSE(beacon);`
  },
  {
    id: "sn-3",
    title: "Spore Density Cultivator",
    dialect: "xylor" as Language,
    description: "Standard vegetative cycle multiplier that triggers bio-organic calculation spikes.",
    code: `NUTRIENT_NODE mycelium = 80;\nSPORE_BLOOM(mycelium > 5) {\n  ENZYME_SECRETION("cultivate-soil", mycelium);\n  mycelium = SHED_SPORES(mycelium, 8);\n}`
  },
  {
    id: "sn-4",
    title: "Timeline Chrono Present Anchor",
    dialect: "gorgon" as Language,
    description: "Anchors the tachyon sequence to prevent bootstrap timeline paradox compile loops.",
    code: `TIME_ANCHOR now = CHRONO_PRESENT();\nTEMPORAL_WORMHOLE(now < CHRONO_FUTURE(5)) {\n  CHRONICLE_ECHO("Chronological index stabilized: " + now);\n  TIME_WARP(now);\n}`
  }
];

/**
 * Basic search term highlighting helper to avoid breaking exact character widths.
 */
const renderHighlightedPart = (text: string, search: string, baseClass: string, key: string | number) => {
  if (!search || !search.trim()) {
    return <span key={key} className={baseClass}>{text}</span>;
  }
  const escaped = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <span key={key} className={baseClass}>
      {parts.map((part, i) =>
        part.toLowerCase() === search.toLowerCase() ? (
          <mark key={i} className="bg-amber-400/40 text-amber-200 border border-amber-400/30 px-0.5 rounded font-bold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

/**
 * Basic syntax highlighting parser that splits code and wraps alien/JS constructs in colored spans.
 */
const highlightCode = (code: string, lang: Language, searchQuery?: string) => {
  if (!code) return "";

  // Keywords lists based on the rules of the selected language
  const keywordsMap: Record<Language, string[]> = {
    zeta: ["COORDINATE", "QUANTUM_NODE", "TESS_LOOP", "RESONATE", "COLLAPSE", "PSI_PROJECTION"],
    xylor: ["NUTRIENT_NODE", "SPORE_BLOOM", "SHED_SPORES", "ENZYME_SECRETION"],
    gorgon: ["TIME_ANCHOR", "TEMPORAL_WORMHOLE", "TIME_WARP", "CHRONICLE_ECHO", "CHRONO_PRESENT", "CHRONO_FUTURE"]
  };

  const keywords = keywordsMap[lang] || [];
  const humanKeywords = ["function", "let", "const", "var", "for", "while", "if", "else", "return", "console", "log", "Math", "pow"];

  // Matches comments (//...), double quotes, single quotes, numbers, and identifiers/words
  const regex = /(\/\/.*|"[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|\b\d+(?:\.\d+)?\b|\b[a-zA-Z_][a-zA-Z0-9_]*\b)/g;

  const parts = code.split(regex);
  const searchStr = searchQuery || "";

  return parts.map((part, index) => {
    if (!part) return null;

    // Comments
    if (part.startsWith("//")) {
      return renderHighlightedPart(part, searchStr, "text-zinc-500 italic", index);
    }

    // Strings
    if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'"))) {
      return renderHighlightedPart(part, searchStr, "text-amber-400 font-medium", index);
    }

    // Numbers
    if (/^\d+(?:\.\d+)?$/.test(part)) {
      return renderHighlightedPart(part, searchStr, "text-rose-400 font-semibold", index);
    }

    // Alien keywords
    const isZeta = ["COORDINATE", "QUANTUM_NODE", "TESS_LOOP", "RESONATE", "COLLAPSE", "PSI_PROJECTION"].includes(part);
    const isXylor = ["NUTRIENT_NODE", "SPORE_BLOOM", "ENZYME_SECRETION", "SHED_SPORES"].includes(part);
    const isGorgon = ["TIME_ANCHOR", "TEMPORAL_WORMHOLE", "TIME_WARP", "CHRONICLE_ECHO", "CHRONO_PRESENT", "CHRONO_FUTURE"].includes(part);

    if (isZeta || isXylor || isGorgon) {
      let colorClass = "text-purple-400 font-bold";
      if (isZeta) colorClass = "text-cyan-400 font-bold drop-shadow-[0_0_4px_rgba(34,211,238,0.3)]";
      if (isXylor) colorClass = "text-emerald-400 font-bold drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]";
      if (isGorgon) colorClass = "text-purple-400 font-bold drop-shadow-[0_0_4px_rgba(192,132,252,0.3)]";
      
      const optimizations: Record<string, string> = {
        // Zeta
        "COORDINATE": "Vector optimization: Declare coordinates as high-dimensional folds to reduce space fold-latency.",
        "QUANTUM_NODE": "Coherence optimization: Couple with a PSI_PROJECTION node to avoid thermal wave leakage.",
        "TESS_LOOP": "Loop unrolling: Unroll TESS_LOOP steps to prevent pocket-dimension exhaustion.",
        "RESONATE": "Waveform optimization: Maintain resonance below 4.5 GHz to preserve structural containment.",
        "COLLAPSE": "Path optimization: Pre-calculate collapse pathways to prevent quantum state decoherence.",
        "PSI_PROJECTION": "Noise optimization: Filter focus vectors to minimize telepathic background noise.",
        // Xylor
        "NUTRIENT_NODE": "Substrate optimization: Enrich with carbon-nitrogen composite to accelerate mycelial growth.",
        "SPORE_BLOOM": "Hydration optimization: Inject moisture to maintain spore vitality and prevent dry-rot.",
        "SHED_SPORES": "Dispersion optimization: Constrain dispersion to under 10m to avoid spore collapse.",
        "ENZYME_SECRETION": "Catalytic optimization: Catalyze secretion rate using cellulose binders for stable bio-flow.",
        // Gorgon
        "TIME_ANCHOR": "Paradox optimization: Synchronize with present chrono-frame to prevent bootstrap timeline paradoxes.",
        "TEMPORAL_WORMHOLE": "Horizon optimization: Stabilize event horizon to avoid chronological tachyon bleeding.",
        "TIME_WARP": "Ripple optimization: Adjust temporal offset to prevent butterfly effect ripples.",
        "CHRONICLE_ECHO": "Acoustic optimization: Filter echoes to avoid acoustic timeline decay.",
        "CHRONO_PRESENT": "Chrono optimization: Anchor to local solar clock for precise chronological positioning.",
        "CHRONO_FUTURE": "Projection optimization: Limit projections to under 10 ticks to avoid temporal fracturing."
      };
      
      const optMessage = optimizations[part] || "Optimize: Ensure proper dimension parameters.";
      
      return (
        <span 
          key={index} 
          onClick={() => {
            document.getElementById("ide-code-textarea")?.focus();
          }}
          className={`${colorClass} relative group cursor-help pointer-events-auto border-b border-dashed border-amber-500/55 pb-[1px] hover:text-amber-300 transition-colors duration-150`}
        >
          {part}
          <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-zinc-950/95 backdrop-blur-md text-zinc-100 font-mono text-[9px] leading-normal rounded-lg border border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.8)] opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-[999] select-none text-left">
            <span className="flex items-center gap-1.5 text-amber-400 font-bold uppercase mb-1 text-[9px]">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>ALIEN LINT ALERT</span>
            </span>
            <span className="text-zinc-300 block font-medium mt-1 leading-relaxed">{optMessage}</span>
            <span className="block text-[7px] text-zinc-500 mt-2 uppercase font-bold tracking-wider pt-1 border-t border-zinc-900">
              KEYWORD: {part} | DIALECT: {isZeta ? "ZETA" : isXylor ? "XYLOR" : "GORGON"}
            </span>
          </span>
        </span>
      );
    }

    // Human programming keywords
    if (humanKeywords.includes(part)) {
      return renderHighlightedPart(part, searchStr, "text-indigo-400 font-medium", index);
    }

    // Plain syntax characters, spaces, punctuation
    return renderHighlightedPart(part, searchStr, "", index);
  });
};

/**
 * Automatically cleans up indentation, spacing, and capitalization rules based on the active language.
 */
const formatAlienCode = (code: string, lang: Language): string => {
  if (!code) return "";

  const lines = code.split("\n");
  let indentLevel = 0;
  const formattedLines: string[] = [];

  const zetaKeywords = ["COORDINATE", "QUANTUM_NODE", "TESS_LOOP", "RESONATE", "COLLAPSE", "PSI_PROJECTION"];
  const xylorKeywords = ["NUTRIENT_NODE", "SPORE_BLOOM", "SHED_SPORES", "ENZYME_SECRETION"];
  const gorgonKeywords = ["TIME_ANCHOR", "TEMPORAL_WORMHOLE", "TIME_WARP", "CHRONICLE_ECHO", "CHRONO_PRESENT", "CHRONO_FUTURE"];

  const currentKeywords = lang === "zeta" ? zetaKeywords : lang === "xylor" ? xylorKeywords : gorgonKeywords;

  for (let line of lines) {
    let trimmed = line.trim();
    if (trimmed === "") {
      formattedLines.push("");
      continue;
    }

    const opens = (trimmed.match(/\{/g) || []).length;
    const closes = (trimmed.match(/\}/g) || []).length;

    if (trimmed.startsWith("}")) {
      indentLevel = Math.max(0, indentLevel - 1);
    } else if (closes > opens) {
      indentLevel = Math.max(0, indentLevel - (closes - opens));
    }

    // Capitalize language keywords
    for (const kw of currentKeywords) {
      const regex = new RegExp(`\\b${kw}\\b`, "gi");
      trimmed = trimmed.replace(regex, kw);
    }

    // Normal JS/TS keywords
    const generalKw = ["let", "const", "var", "function", "return", "if", "else", "for", "while"];
    for (const kw of generalKw) {
      const regex = new RegExp(`\\b${kw}\\b`, "gi");
      trimmed = trimmed.replace(regex, kw);
    }

    // spacing around assignment operator
    trimmed = trimmed.replace(/\s*=\s*/g, " = ");
    trimmed = trimmed.replace(/\s*===\s*/g, " === ");
    trimmed = trimmed.replace(/\s*==\s*/g, " == ");
    trimmed = trimmed.replace(/\s*>=\s*/g, " >= ");
    trimmed = trimmed.replace(/\s*<=\s*/g, " <= ");

    // Trailing semicolon rules for standalone statements
    if (lang === "zeta") {
      if ((trimmed.startsWith("COORDINATE") || trimmed.includes("COLLAPSE") || trimmed.includes("PSI_PROJECTION")) && !trimmed.endsWith(";") && !trimmed.endsWith("{") && !trimmed.endsWith("}")) {
        trimmed = trimmed + ";";
      }
    } else if (lang === "xylor") {
      if ((trimmed.startsWith("NUTRIENT_NODE") || trimmed.includes("ENZYME_SECRETION")) && !trimmed.endsWith(";") && !trimmed.endsWith("{") && !trimmed.endsWith("}")) {
        trimmed = trimmed + ";";
      }
    } else if (lang === "gorgon") {
      if ((trimmed.startsWith("TIME_ANCHOR") || trimmed.includes("CHRONICLE_ECHO")) && !trimmed.endsWith(";") && !trimmed.endsWith("{") && !trimmed.endsWith("}")) {
        trimmed = trimmed + ";";
      }
    }

    const indent = "  ".repeat(indentLevel);
    formattedLines.push(indent + trimmed);

    if (trimmed.endsWith("{") || (opens > closes && !trimmed.startsWith("}"))) {
      indentLevel++;
    }
  }

  return formattedLines.join("\n");
};

const ONBOARDING_STEPS = [
  {
    title: "WELCOME TO THE STARSHIP CORE",
    description: "Welcome to the Alien Programming Simulator, Officer. Prepare to translate human instructions into multidimensional language streams to guide our spaceship systems.",
  },
  {
    title: "1. THE COALESCING EDITOR",
    description: "This workspace is where your sequential code resides. You can type human logic, load templates, and use the Zoom and Format buttons to organize your code dialect rules.",
  },
  {
    title: "2. TRANSLATOR RECEPTOR",
    description: "Once your human code is ready, hit this translator trigger to convert it into selected alien syntax. This streams through server-side neural translators.",
  },
  {
    title: "3. COMPILATION RUNNER",
    description: "Trigger compiled runs directly on the main mainframe terminal simulation. Observe the physical telemetry gauges, wave logs, and yielding signals update live.",
  },
  {
    title: "4. KNOWLEDGE BASE REGISTERS",
    description: "Consult complete grammar manuals and search keywords. See real-time register frequency visualizer graphs built with Recharts update in sync with your edits.",
  }
];

interface QasmLintIssue {
  severity: "error" | "warning";
  line?: number;
  message: string;
  suggestion: string;
}

const performQasmLint = (code: string): QasmLintIssue[] => {
  const issues: QasmLintIssue[] = [];
  if (!code.trim()) return [];

  const lines = code.split("\n");
  const hasQasmHeader = code.includes("OPENQASM 2.0;");

  // 1. Check for header
  if (!hasQasmHeader) {
    issues.push({
      severity: "error",
      message: "Missing 'OPENQASM 2.0;' declaration in header.",
      suggestion: "Add 'OPENQASM 2.0;' at the very top of your file to specify the QASM standard version."
    });
  }

  // 2. Check for include library
  if (!code.includes('include "qelib1.inc";')) {
    issues.push({
      severity: "warning",
      message: "Missing standard library header inclusion.",
      suggestion: "Include the standard quantum gate library by adding 'include \"qelib1.inc\";' directly under the standard version header."
    });
  }

  // Extract declared quantum and classical registers
  const qregs: { name: string; size: number }[] = [];
  const cregs: { name: string; size: number }[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("//")) return;

    // Check register definitions
    if (trimmed.startsWith("qreg ") || trimmed.startsWith("creg ")) {
      if (!trimmed.endsWith(";")) {
        issues.push({
          severity: "error",
          line: index + 1,
          message: `Missing semicolon in register definition on line ${index + 1}.`,
          suggestion: "Append a semicolon ';' to complete the register declaration."
        });
      }
      
      const qregMatch = trimmed.match(/qreg\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\[\s*(\d+)\s*\]/);
      const cregMatch = trimmed.match(/creg\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\[\s*(\d+)\s*\]/);
      
      if (trimmed.startsWith("qreg ") && !qregMatch) {
        issues.push({
          severity: "error",
          line: index + 1,
          message: `Malformed quantum register definition on line ${index + 1}.`,
          suggestion: "Format register declarations as: qreg q[size];"
        });
      } else if (qregMatch) {
        qregs.push({ name: qregMatch[1], size: parseInt(qregMatch[2], 10) });
      }

      if (trimmed.startsWith("creg ") && !cregMatch) {
        issues.push({
          severity: "error",
          line: index + 1,
          message: `Malformed classical register definition on line ${index + 1}.`,
          suggestion: "Format classical register declarations as: creg c[size];"
        });
      } else if (cregMatch) {
        cregs.push({ name: cregMatch[1], size: parseInt(cregMatch[2], 10) });
      }
      return;
    }

    // General operational statements should end with semicolon
    const deservesSemicolon = trimmed.length > 0 && 
                              !trimmed.startsWith("OPENQASM ") && 
                              !trimmed.startsWith("include ") && 
                              !trimmed.endsWith(";") && 
                              !trimmed.endsWith("{") && 
                              !trimmed.endsWith("}");
    if (deservesSemicolon) {
      issues.push({
        severity: "error",
        line: index + 1,
        message: `Incomplete statement on line ${index + 1}.`,
        suggestion: "Ensure this line terminates with a semicolon ';'."
      });
    }

    // Check for register access bounds
    const regAccesses = trimmed.matchAll(/([a-zA-Z_][a-zA-Z0-9_]*)\s*\[\s*(\d+)\s*\]/g);
    for (const match of regAccesses) {
      const regName = match[1];
      const indexVal = parseInt(match[2], 10);
      
      // Check if it's a declared qreg
      const qreg = qregs.find(r => r.name === regName);
      if (qreg && indexVal >= qreg.size) {
        issues.push({
          severity: "error",
          line: index + 1,
          message: `Out-of-bounds quantum register access on line ${index + 1}: '${regName}[${indexVal}]'.`,
          suggestion: `The register '${regName}' is declared with size ${qreg.size}. Indices must be between 0 and ${qreg.size - 1}.`
        });
      }

      // Check if it's a declared creg
      const creg = cregs.find(r => r.name === regName);
      if (creg && indexVal >= creg.size) {
        issues.push({
          severity: "error",
          line: index + 1,
          message: `Out-of-bounds classical register access on line ${index + 1}: '${regName}[${indexVal}]'.`,
          suggestion: `The register '${regName}' is declared with size ${creg.size}. Indices must be between 0 and ${creg.size - 1}.`
        });
      }
    }

    // Check for illegal structures like curly brace scopes
    if (trimmed.includes("{") || trimmed.includes("}")) {
      issues.push({
        severity: "warning",
        line: index + 1,
        message: `Non-standard structural scoping block on line ${index + 1}.`,
        suggestion: "OPENQASM 2.0 does not support standard curly brace scoped functions or conditional loops. Use defined gates or single-line instructions."
      });
    }
  });

  return issues;
};

const autoCorrectAlienCode = (code: string, lang: Language): { correctedCode: string; changes: string[] } => {
  let corrected = code;
  const changes: string[] = [];
  if (!code) return { correctedCode: "", changes: [] };

  // 1. Keyword Casing correction
  const keywordsMap: Record<Language, string[]> = {
    zeta: ["COORDINATE", "QUANTUM_NODE", "TESS_LOOP", "RESONATE", "COLLAPSE", "PSI_PROJECTION"],
    xylor: ["NUTRIENT_NODE", "SPORE_BLOOM", "SHED_SPORES", "ENZYME_SECRETION"],
    gorgon: ["TIME_ANCHOR", "TEMPORAL_WORMHOLE", "TIME_WARP", "CHRONICLE_ECHO", "CHRONO_PRESENT", "CHRONO_FUTURE"]
  };
  const keywords = keywordsMap[lang] || [];

  const lines = corrected.split("\n");
  const correctedLines = lines.map((line, lineIdx) => {
    let lineText = line;
    if (lineText.trim().startsWith("//")) return lineText;

    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, "gi");
      const matches = lineText.match(regex);
      if (matches) {
        const hasImproperCasing = matches.some(m => m !== kw);
        if (hasImproperCasing) {
          lineText = lineText.replace(regex, kw);
          changes.push(`Corrected casing of '${kw}' on line ${lineIdx + 1}`);
        }
      }
    });

    return lineText;
  });
  corrected = correctedLines.join("\n");

  // 2. Bracket matching and balancing
  const stack: { char: string; pos: number; line: number }[] = [];
  const openToClose: Record<string, string> = { "{": "}", "(": ")", "[": "]" };
  const closeToOpen: Record<string, string> = { "}": "{", ")": "(", "]": "[" };

  let inLineComment = false;
  let inString: string | null = null;
  let charArray = Array.from(corrected);
  
  for (let i = 0; i < charArray.length; i++) {
    const char = charArray[i];
    const prevChar = i > 0 ? charArray[i - 1] : "";
    const nextChar = i < charArray.length - 1 ? charArray[i + 1] : "";

    // Handle string boundaries
    if (inString) {
      if (char === inString && prevChar !== "\\") {
        inString = null;
      }
      continue;
    }
    if (char === '"' || char === "'") {
      inString = char;
      continue;
    }

    // Handle comment boundaries
    if (inLineComment) {
      if (char === "\n") {
        inLineComment = false;
      }
      continue;
    }
    if (char === "/" && nextChar === "/") {
      inLineComment = true;
      i++;
      continue;
    }

    // Process brackets
    if (char === "{" || char === "(" || char === "[") {
      stack.push({ char, pos: i, line: corrected.slice(0, i).split("\n").length });
    } else if (char === "}" || char === ")" || char === "]") {
      if (stack.length > 0) {
        const top = stack[stack.length - 1];
        if (openToClose[top.char] === char) {
          stack.pop();
        } else {
          const correctClose = openToClose[top.char];
          charArray[i] = correctClose;
          stack.pop();
          changes.push(`Corrected mismatched closing bracket to '${correctClose}' on line ${corrected.slice(0, i).split("\n").length}`);
        }
      } else {
        charArray[i] = "";
        changes.push(`Removed extra trailing bracket '${char}' on line ${corrected.slice(0, i).split("\n").length}`);
      }
    }
  }

  // Auto-close any unclosed opening brackets remaining in stack
  let suffix = "";
  while (stack.length > 0) {
    const unclosed = stack.pop()!;
    const closingChar = openToClose[unclosed.char];
    suffix += (unclosed.char === "{" ? "\n" : "") + closingChar;
    changes.push(`Balanced unclosed '${unclosed.char}' from line ${unclosed.line}`);
  }

  // Join back and clean up empty spaces from removal
  let correctedCode = charArray.join("") + suffix;

  return { correctedCode, changes };
};

export default function App() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("zeta");
  const [activeCode, setActiveCode] = useState<string>("");
  const [promptValue, setPromptValue] = useState<string>("");
  const [activePuzzleId, setActivePuzzleId] = useState<string | null>(null);

  // Translation states
  const [translatedResult, setTranslatedResult] = useState<TranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  // Simulation / Compilation states
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Custom multi-file Project generated from prompt
  const [activeProject, setActiveProject] = useState<AlienProject | null>(null);
  const [activeFileIdx, setActiveFileIdx] = useState<number>(0);
  const [isGeneratingProject, setIsGeneratingProject] = useState<boolean>(false);

  // System states
  const [isApiKeyMissing, setIsApiKeyMissing] = useState<boolean>(false);
  const [apiStatusReason, setApiStatusReason] = useState<"missing" | "congested" | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "warning">("connected");
  const [apiError, setApiError] = useState<string | null>(null);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const lineCounterRef = useRef<HTMLDivElement>(null);
  const highlighterRef = useRef<HTMLDivElement>(null);

  // Readability & Editor Workspace control states
  const [editorFontSize, setEditorFontSize] = useState<number>(13);
  const [copied, setCopied] = useState<boolean>(false);
  const [editorSearchQuery, setEditorSearchQuery] = useState<string>("");
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);

  // New features states: Alien Theme and Autocomplete
  const [isAlienThemeActive, setIsAlienThemeActive] = useState<boolean>(true);
  const [editorVisualTheme, setEditorVisualTheme] = useState<"dark_void" | "high_contrast_nebula">(() => {
    return (localStorage.getItem("editor_visual_theme") as "dark_void" | "high_contrast_nebula") || "dark_void";
  });
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [lowLightMode, setLowLightMode] = useState<"normal" | "dimmed" | "amber">(() => {
    return (localStorage.getItem("editor_low_light_mode") as "normal" | "dimmed" | "amber") || "normal";
  });
  const [generatedShareUrl, setGeneratedShareUrl] = useState<string>("");
  const [sharedRoutineName, setSharedRoutineName] = useState<string>("");
  const [sharedRoutineId, setSharedRoutineId] = useState<string>("");
  const [shareCopied, setShareCopied] = useState<boolean>(false);
  const [shareCardCopied, setShareCardCopied] = useState<boolean>(false);
  const [decryptStatus, setDecryptStatus] = useState<{ visible: boolean; name: string; id: string; timestamp: string } | null>(null);
  const [autoCorrectResults, setAutoCorrectResults] = useState<{ visible: boolean; changes: string[] } | null>(null);

  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState<number>(0);
  const [showAutocomplete, setShowAutocomplete] = useState<boolean>(false);
  const [autocompleteCoords, setAutocompleteCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [typedWord, setTypedWord] = useState<string>("");

  // Snippet Library Modal states
  const [isSnippetLibraryOpen, setIsSnippetLibraryOpen] = useState<boolean>(false);
  const [savedSnippets, setSavedSnippets] = useState<Array<{ id: string; title: string; dialect: Language; description: string; code: string }>>(() => {
    const saved = localStorage.getItem("saved_alien_snippets");
    return saved ? JSON.parse(saved) : DEFAULT_SNIPPETS;
  });
  const [newSnippetTitle, setNewSnippetTitle] = useState<string>("");
  const [newSnippetDesc, setNewSnippetDesc] = useState<string>("");
  const [newSnippetDialect, setNewSnippetDialect] = useState<Language>("zeta");

  // Left sliding navigation menu states
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"coding" | "altered" | "converter">("coding");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Dialect Converter states
  const [converterInput, setConverterInput] = useState<string>("let counter = 10;\nwhile (counter > 0) {\n  counter = counter - 1;\n}");
  const [converterResults, setConverterResults] = useState<Record<Language, TranslationResult | null>>({
    zeta: null,
    xylor: null,
    gorgon: null
  });
  const [isConvertingAll, setIsConvertingAll] = useState<boolean>(false);

  // Code Minimap states & refs
  const [minimapThumbTop, setMinimapThumbTop] = useState<number>(0);
  const [minimapThumbHeight, setMinimapThumbHeight] = useState<number>(40);
  const minimapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("saved_alien_snippets", JSON.stringify(savedSnippets));
  }, [savedSnippets]);

  const getLowLightStyle = () => {
    if (editorVisualTheme !== "dark_void") return {};
    if (lowLightMode === "dimmed") {
      return { filter: "brightness(0.65) contrast(0.95)" };
    }
    if (lowLightMode === "amber") {
      return { filter: "sepia(0.6) hue-rotate(335deg) saturate(1.25) brightness(0.85)" };
    }
    return {};
  };

  // Get dynamic colors for the Alien Language responsive theme
  const getThemeClasses = () => {
    const isNebula = editorVisualTheme === "high_contrast_nebula";
    
    if (!isAlienThemeActive) {
      if (isNebula) {
        return {
          bg: "bg-slate-900 border-yellow-400/80",
          lineBg: "bg-slate-950 border-yellow-400/40 text-yellow-300",
          caret: "caret-yellow-400",
          text: "text-yellow-100 font-semibold",
          glow: "shadow-[0_0_20px_rgba(234,179,8,0.25)]",
          accentText: "text-yellow-400 font-bold"
        };
      }
      return {
        bg: "bg-zinc-950 border-zinc-850/80",
        lineBg: "bg-zinc-950/80 border-zinc-900/60 text-zinc-600",
        caret: "caret-zinc-100",
        text: "text-zinc-100/90",
        glow: "",
        accentText: "text-zinc-400"
      };
    }
    
    switch (selectedLanguage) {
      case "zeta":
        return isNebula ? {
          bg: "bg-[#031628] border-cyan-400",
          lineBg: "bg-[#052646] border-cyan-300 text-cyan-200",
          caret: "caret-cyan-300",
          text: "text-cyan-50 font-semibold",
          glow: "shadow-[0_0_30px_rgba(6,182,212,0.4)]",
          accentText: "text-cyan-300 font-extrabold"
        } : {
          bg: "bg-black border-cyan-500/25",
          lineBg: "bg-black border-cyan-950/50 text-cyan-800",
          caret: "caret-cyan-500",
          text: "text-cyan-100/80",
          glow: "",
          accentText: "text-cyan-500"
        };
      case "xylor":
        return isNebula ? {
          bg: "bg-[#021d0a] border-emerald-400",
          lineBg: "bg-[#043310] border-emerald-300 text-emerald-200",
          caret: "caret-emerald-300",
          text: "text-emerald-50 font-semibold",
          glow: "shadow-[0_0_30px_rgba(16,185,129,0.4)]",
          accentText: "text-emerald-300 font-extrabold"
        } : {
          bg: "bg-black border-emerald-500/25",
          lineBg: "bg-black border-emerald-950/50 text-emerald-800",
          caret: "caret-emerald-500",
          text: "text-emerald-100/80",
          glow: "",
          accentText: "text-emerald-500"
        };
      case "gorgon":
        return isNebula ? {
          bg: "bg-[#18032b] border-purple-400",
          lineBg: "bg-[#2f0750] border-purple-300 text-purple-200",
          caret: "caret-purple-300",
          text: "text-purple-50 font-semibold",
          glow: "shadow-[0_0_30px_rgba(168,85,247,0.4)]",
          accentText: "text-purple-300 font-extrabold"
        } : {
          bg: "bg-black border-purple-500/25",
          lineBg: "bg-black border-purple-950/50 text-purple-800",
          caret: "caret-purple-500",
          text: "text-purple-100/80",
          glow: "",
          accentText: "text-purple-500"
        };
      default:
        return {
          bg: "bg-zinc-950 border-zinc-850/80",
          lineBg: "bg-zinc-950/80 border-zinc-900/60 text-zinc-600",
          caret: "caret-zinc-100",
          text: "text-zinc-100/90",
          glow: "",
          accentText: "text-zinc-400"
        };
    }
  };

  // Calculates a complexity 'danger' score based on the number of nested loops and system calls.
  const getComplexityScore = (code: string) => {
    const loopRegex = /\b(for\s*\(|while\s*\(|TESS_LOOP|SPORE_BLOOM|TEMPORAL_WORMHOLE)/g;
    const systemCallRegex = /\b(PSI_PROJECTION|RESONATE|COLLAPSE|QUANTUM_NODE|ENZYME_SECRETION|SHED_SPORES|CHRONICLE_ECHO|TIME_WARP|CHRONO_PRESENT|CHRONO_FUTURE|console\.log)\b/g;

    const systemCalls = (code.match(systemCallRegex) || []).length;
    
    let maxDepth = 0;
    let currentDepth = 0;
    
    const lines = code.split('\n');
    let braceLevel = 0;
    const loopBraceLevels: number[] = [];
    
    for (let line of lines) {
      const hasLoop = /\b(for|while|TESS_LOOP|SPORE_BLOOM|TEMPORAL_WORMHOLE)\b/.test(line);
      const hasOpen = line.includes('{');
      const hasClose = line.includes('}');
      
      if (hasClose) {
        braceLevel = Math.max(0, braceLevel - 1);
        if (loopBraceLevels.length > 0 && loopBraceLevels[loopBraceLevels.length - 1] === braceLevel) {
          loopBraceLevels.pop();
          currentDepth = loopBraceLevels.length;
        }
      }
      
      if (hasLoop) {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
        if (hasOpen) {
          loopBraceLevels.push(braceLevel);
        } else {
          loopBraceLevels.push(braceLevel);
        }
      }
      
      if (hasOpen) {
        braceLevel++;
      }
    }

    const totalLoops = (code.match(loopRegex) || []).length;
    if (totalLoops > 0 && maxDepth === 0) {
      maxDepth = 1;
    }
    if (maxDepth > totalLoops) {
      maxDepth = totalLoops;
    }

    // Danger Score formula
    const score = Math.min(100, (maxDepth * 25) + (systemCalls * 8) + (totalLoops * 10));
    
    let rating = "Safe";
    let color = "text-emerald-400 bg-emerald-950/25 border-emerald-500/20";
    let barColor = "bg-emerald-500";
    if (score > 75) {
      rating = "Catastrophic";
      color = "text-red-400 bg-red-950/25 border-red-500/20 animate-pulse";
      barColor = "bg-red-500 animate-pulse";
    } else if (score > 45) {
      rating = "Dangerous";
      color = "text-amber-400 bg-amber-950/25 border-amber-500/20";
      barColor = "bg-amber-500";
    } else if (score > 20) {
      rating = "Moderate";
      color = "text-cyan-400 bg-cyan-950/25 border-cyan-500/20";
      barColor = "bg-cyan-500";
    }
    
    return {
      score,
      maxDepth,
      systemCalls,
      totalLoops,
      rating,
      color,
      barColor
    };
  };

  // Autocomplete updates and suggestions
  const updateAutocomplete = (text: string, cursorPos: number, textarea: HTMLTextAreaElement) => {
    const textBeforeCursor = text.slice(0, cursorPos);
    const linesBefore = textBeforeCursor.split("\n");
    const currentLineIdx = linesBefore.length - 1;
    const currentLineText = linesBefore[currentLineIdx];
    
    const wordMatch = currentLineText.match(/[a-zA-Z_0-9]+$/);
    const word = wordMatch ? wordMatch[0] : "";
    
    if (!word || word.length < 1) {
      setShowAutocomplete(false);
      return;
    }

    const allKeywords = [
      ...(ALIEN_KEYWORDS[selectedLanguage] || []),
      "function", "let", "const", "return", "if", "else"
    ];

    const matches = allKeywords.filter(kw => 
      kw.toLowerCase().startsWith(word.toLowerCase()) && 
      kw.toLowerCase() !== word.toLowerCase()
    );

    if (matches.length > 0) {
      setAutocompleteSuggestions(matches);
      setActiveSuggestionIdx(0);
      setTypedWord(word);
      
      const charWidth = editorFontSize * 0.6;
      const lineHeight = editorFontSize * 1.6;
      const scrollTop = textarea.scrollTop;
      
      const topPos = (currentLineIdx * lineHeight) - scrollTop + 32;
      const leftPos = (currentLineText.length - word.length) * charWidth + (showLineNumbers ? 40 : 0) + 15;
      
      const containerHeight = 300;
      const containerWidth = textarea.clientWidth;
      
      setAutocompleteCoords({
        top: Math.min(containerHeight - 120, Math.max(10, topPos)),
        left: Math.min(containerWidth - 220, Math.max(10, leftPos))
      });
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
    }
  };

  const insertSuggestion = (suggestion: string) => {
    if (!editorRef.current) return;
    const textarea = editorRef.current;
    const cursorPos = textarea.selectionStart;
    
    const textBefore = activeCode.slice(0, cursorPos - typedWord.length);
    const textAfter = activeCode.slice(cursorPos);
    
    const newCode = textBefore + suggestion + textAfter;
    setActiveCode(newCode);
    setActiveProject(null);
    setShowAutocomplete(false);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = cursorPos - typedWord.length + suggestion.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isSoundEnabled) playTypeSound();
    if (showAutocomplete && autocompleteSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestionIdx(prev => (prev + 1) % autocompleteSuggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestionIdx(prev => (prev - 1 + autocompleteSuggestions.length) % autocompleteSuggestions.length);
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertSuggestion(autocompleteSuggestions[activeSuggestionIdx]);
      } else if (e.key === "Escape") {
        setShowAutocomplete(false);
      }
    }
  };

  // Performance and voice dictation states
  const [executionCycles, setExecutionCycles] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [dictationSupported, setDictationSupported] = useState<boolean>(true);
  const [recognition, setRecognition] = useState<any>(null);
  const [dictationError, setDictationError] = useState<string | null>(null);

  // File snaps history and onboarding states
  const [recentSnippets, setRecentSnippets] = useState<any[]>([]);
  const [isSavingIndicatorVisible, setIsSavingIndicatorVisible] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [onboardingStep, setOnboardingStep] = useState<number>(0);

  // Initial trigger for onboarding
  useEffect(() => {
    const completed = localStorage.getItem("alien_onboarding_completed_v1");
    if (!completed) {
      setShowOnboarding(true);
    }
  }, []);

  // Save editor theme setting when modified
  useEffect(() => {
    localStorage.setItem("editor_visual_theme", editorVisualTheme);
  }, [editorVisualTheme]);

  // Save low light environment setting when modified
  useEffect(() => {
    localStorage.setItem("editor_low_light_mode", lowLightMode);
  }, [lowLightMode]);

  // Check for shared routine in URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get("share");
    if (shareId) {
      try {
        const sharedRegistry = JSON.parse(localStorage.getItem("shared_alien_routines") || "[]");
        const found = sharedRegistry.find((r: any) => r.id === shareId);
        if (found) {
          setSelectedLanguage(found.language);
          setActiveCode(found.code);
          setActiveProject({
            id: `shared_${found.id}`,
            projectName: found.name,
            dialect: found.language,
            description: `Subspace Shared Routine decrypted successfully.`,
            difficulty: "Medium",
            specifications: ["Standard crew shared algorithmic sequence."]
          });
          setDecryptStatus({
            visible: true,
            name: found.name,
            id: found.id,
            timestamp: found.timestamp || new Date().toLocaleString()
          });
        }
      } catch (err) {
        console.error("Failed to decrypt shared routine from URL:", err);
      }
    }
  }, []);

  // Check if API key is configured on mount
  useEffect(() => {
    const checkConfig = async () => {
      try {
        const res = await fetch("/api/config-status");
        if (res.ok) {
          const data = await res.json();
          if (!data.hasApiKey) {
            setIsApiKeyMissing(true);
            setApiStatusReason("missing");
            setConnectionStatus("warning");
          } else {
            setIsApiKeyMissing(false);
            setApiStatusReason(null);
            setConnectionStatus("connected");
          }
        }
      } catch (err) {
        console.error("Error checking config status:", err);
      }
    };
    checkConfig();
  }, []);

  // Debounced auto-save of current editor buffer into recent snapshots
  useEffect(() => {
    if (!activeCode || !activeCode.trim()) return;
    
    const timer = setTimeout(() => {
      const trimmed = activeCode.trim();
      setRecentSnippets((prev) => {
        // Prevent exact identical duplication
        const duplicate = prev.find((item) => item.code.trim() === trimmed);
        if (duplicate) return prev;

        // Formulate descriptive file name based on current context
        let name = "Draft Edit";
        if (activeProject) {
          name = `${activeProject.projectName} (Main)`;
        } else if (activePuzzleId) {
          const pz = PUZZLES.find(p => p.id === activePuzzleId);
          name = pz ? `Puzzle: ${pz.title}` : "Puzzle starter";
        } else {
          const matchingTemplate = TEMPLATES[selectedLanguage].find(t => t.code.trim() === trimmed);
          if (matchingTemplate) {
            name = matchingTemplate.name;
          } else {
            name = `buffer.${selectedLanguage === "zeta" ? "gly" : selectedLanguage === "xylor" ? "spr" : "wh"}`;
          }
        }

        const newSnap = {
          id: Math.random().toString(),
          name: name,
          code: activeCode,
          language: selectedLanguage,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        };

        // Briefly show saving indicator
        setTimeout(() => {
          setIsSavingIndicatorVisible(true);
        }, 0);

        return [newSnap, ...prev].slice(0, 5);
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [activeCode, selectedLanguage, activeProject, activePuzzleId]);

  // Turn off saving indicator after a brief duration
  useEffect(() => {
    if (isSavingIndicatorVisible) {
      const timer = setTimeout(() => {
        setIsSavingIndicatorVisible(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSavingIndicatorVisible]);

  const languageInfo = LANGUAGES.find((l) => l.id === selectedLanguage)!;

  // Load initial code template when language changes
  useEffect(() => {
    if (!activeProject) {
      const defaultTemplate = TEMPLATES[selectedLanguage][0]?.code || "";
      setActiveCode(defaultTemplate);
    }
    setTranslatedResult(null);
  }, [selectedLanguage, activeProject]);

  // Synchronize scroll of line numbers and syntax highlighter with text area
  const handleScroll = () => {
    if (editorRef.current) {
      if (lineCounterRef.current) {
        lineCounterRef.current.scrollTop = editorRef.current.scrollTop;
      }
      if (highlighterRef.current) {
        highlighterRef.current.scrollTop = editorRef.current.scrollTop;
        highlighterRef.current.scrollLeft = editorRef.current.scrollLeft;
      }

      // Compute minimap thumb position
      const textarea = editorRef.current;
      const scrollHeight = textarea.scrollHeight;
      const clientHeight = textarea.clientHeight;
      const scrollTop = textarea.scrollTop;

      const minimapHeight = 300; // matching height of the minimap
      const ratio = scrollTop / (scrollHeight - clientHeight || 1);
      
      const thumbHeight = Math.max(20, (clientHeight / scrollHeight) * minimapHeight);
      const thumbTop = ratio * (minimapHeight - thumbHeight);

      setMinimapThumbTop(thumbTop);
      setMinimapThumbHeight(thumbHeight);
    }
  };

  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (editorRef.current && minimapContainerRef.current) {
      const rect = minimapContainerRef.current.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const textarea = editorRef.current;
      const scrollHeight = textarea.scrollHeight;
      const clientHeight = textarea.clientHeight;

      const minimapHeight = 300;
      const clickRatio = clickY / minimapHeight;
      const targetScrollTop = clickRatio * scrollHeight - (clientHeight / 2);

      textarea.scrollTop = Math.max(0, Math.min(scrollHeight - clientHeight, targetScrollTop));
      handleScroll();
    }
  };

  const handleCopyCode = () => {
    if (!activeCode) return;
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleExportBackup = () => {
    if (!activeCode) return;
    const element = document.createElement("a");
    const file = new Blob([activeCode], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = activeProject 
      ? `${activeProject.projectName.toLowerCase().replace(/\s+/g, "_")}_backup.txt`
      : `alien_core_backup.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleExportQASM = () => {
    if (!activeCode) return;
    let qasmContent = "";
    if (activeCode.includes("OPENQASM 2.0;")) {
      qasmContent = activeCode;
    } else {
      const timestamp = new Date().toISOString();
      qasmContent = `// OpenQASM 2.0 file exported from Alien Programming Workspace
// Generated at: ${timestamp}
// Target Dialect: ${selectedLanguage.toUpperCase()}

OPENQASM 2.0;
include "qelib1.inc";

// --- Register Allocations ---
qreg q[8];
creg c[8];

// --- Dialect Functions & Templates Preservation ---
// The original dialect contains structured procedures.
// They are preserved here as classical compile markers and gate sequences:
`;

      const lines = activeCode.split("\n");
      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) {
          qasmContent += "\n";
          return;
        }
        if (trimmed.startsWith("//")) {
          qasmContent += `${line}\n`;
          return;
        }

        if (trimmed.includes("{") || trimmed.includes("}") || trimmed.includes("function") || trimmed.includes("TESS_LOOP") || trimmed.includes("SPORE_BLOOM")) {
          qasmContent += `// Preserved Structure: ${trimmed}\n`;
          return;
        }

        if (trimmed.startsWith("COORDINATE") || trimmed.startsWith("PSI_PROJECTION") || trimmed.startsWith("RESONATE") || trimmed.startsWith("COLLAPSE")) {
          qasmContent += `// Operation: ${trimmed}\n`;
          qasmContent += "h q[0];\ncx q[0], q[1];\n";
        } else {
          qasmContent += `// ${trimmed}\n`;
        }
      });

      qasmContent += `
// --- Quantum State Superposition Measurement ---
measure q -> c;
`;
    }

    const blob = new Blob([qasmContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const baseName = activeProject ? activeProject.projectName.toLowerCase().replace(/\s+/g, "_") : "alien_quantum_routine";
    link.download = `${baseName}.qasm`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFormatCode = () => {
    if (isSoundEnabled) playCompileSound();
    const formatted = formatAlienCode(activeCode, selectedLanguage);
    setActiveCode(formatted);
  };

  const handleShareRoutine = () => {
    const routineId = Math.random().toString(36).substring(2, 9);
    const routineName = activeProject ? activeProject.projectName : `Routine_${selectedLanguage.toUpperCase()}_${routineId}`;
    
    let sharedRegistry = [];
    try {
      sharedRegistry = JSON.parse(localStorage.getItem("shared_alien_routines") || "[]");
    } catch (e) {
      console.error(e);
    }
    const newShared = {
      id: routineId,
      name: routineName,
      language: selectedLanguage,
      code: activeCode,
      timestamp: new Date().toLocaleString()
    };
    
    sharedRegistry.push(newShared);
    localStorage.setItem("shared_alien_routines", JSON.stringify(sharedRegistry));
    
    const publicUrl = `${window.location.origin}${window.location.pathname}?share=${routineId}`;
    setGeneratedShareUrl(publicUrl);
    setSharedRoutineId(routineId);
    setSharedRoutineName(routineName);
    setShareCopied(false);
    setShareCardCopied(false);
    setIsShareModalOpen(true);
  };

  const handleAutoCorrect = () => {
    const { correctedCode, changes } = autoCorrectAlienCode(activeCode, selectedLanguage);
    if (correctedCode !== activeCode) {
      setActiveCode(correctedCode);
      setActiveProject(null);
    }
    setAutoCorrectResults({
      visible: true,
      changes: changes
    });
  };

  // Voice Recognition Web Speech API Initializer
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setDictationSupported(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
        setDictationError(null);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event);
        if (event.error === "not-allowed") {
          setDictationError("Microphone access denied. Please check permissions.");
        } else {
          setDictationError(`Voice Dictation error: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        if (transcript && transcript.trim()) {
          let cleanedText = transcript.trim();
          // Voice macro replacements for common alien concepts
          const upperWords = ["coordinate", "quantum node", "tess loop", "resonate", "collapse", "psi projection", "nutrient node", "spore bloom", "shed spores", "enzyme secretion", "time anchor", "temporal wormhole", "time warp", "chronicle echo", "chrono present", "chrono future"];
          for (const word of upperWords) {
            const regex = new RegExp(`\\b${word}\\b`, "gi");
            cleanedText = cleanedText.replace(regex, word.toUpperCase().replace(/\s+/g, "_"));
          }
          setActiveCode((prev) => prev + (prev ? "\n" : "") + cleanedText);
        }
      };

      setRecognition(rec);
    } catch (e) {
      console.error("Failed to initialize speech recognition", e);
      setDictationSupported(false);
    }
  }, []);

  const handleToggleDictate = () => {
    if (!dictationSupported || !recognition) {
      setDictationError("SpeechRecognition API not supported or disabled in this environment.");
      setTimeout(() => setDictationError(null), 4000);
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (err) {
        console.error(err);
        setDictationError("Could not start microphone. Check browser permissions.");
        setTimeout(() => setDictationError(null), 4000);
      }
    }
  };

  // Keyboard Shortcuts (Ctrl+Enter to Translate/Run, Ctrl+S to Format, Ctrl+/ to Shortcuts)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleTranslate();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleFormatCode();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "/" || e.key === "?")) {
        e.preventDefault();
        setIsShortcutModalOpen(prev => !prev);
      }
      if (e.key === "Escape") {
        setIsShortcutModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeCode, selectedLanguage, isTranslating]);

  // Get total line count for line number display
  const lines = activeCode.split("\n");

  const getSearchMatchesCount = () => {
    if (!editorSearchQuery.trim()) return 0;
    try {
      const escaped = editorSearchQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const matches = activeCode.match(new RegExp(escaped, "gi"));
      return matches ? matches.length : 0;
    } catch (e) {
      return 0;
    }
  };

  const handleSelectPuzzle = (puzzle: Puzzle) => {
    setActivePuzzleId(puzzle.id);
    setActiveProject(null);
    setActiveCode(puzzle.starterCode);
    setTranslatedResult(null);
  };

  const handleSelectTemplate = (code: string) => {
    setActiveProject(null);
    setActivePuzzleId(null);
    setActiveCode(code);
    setTranslatedResult(null);
  };

  const triggerOfflineMockTranslation = (targetLang: Language) => {
    const mockTranslations: Record<Language, TranslationResult> = {
      zeta: {
        alienCode: `// OFFLINE TRANSLATION CORE\nCOORDINATE response_node = QUANTUM_NODE(42);\nTESS_LOOP(response_node > 0) {\n  PSI_PROJECTION("Locating interstellar coordinates: " + response_node);\n  response_node = RESONATE(response_node * -1.5);\n}`,
        explanation: "Translated using secondary local galactic core. Telepathic relays are bypassed due to sub-space interference.",
        analogies: ["Human loops translated to multidimensional space rotations", "Variables simulated as resonance anchors"],
        efficiencyRating: "0.004 Space-cycles per carbon unit",
        warnings: ["Higher dimensions might experience slight spatial shrinkage during execution."],
      },
      xylor: {
        alienCode: `// MYCELIAL TRANSLATION FLUID\nNUTRIENT_NODE moisture = 100;\nSPORE_BLOOM(moisture > 50) {\n  ENZYME_SECRETION("carbon-secrete", moisture);\n  moisture = SHED_SPORES(moisture, 10);\n}`,
        explanation: "Biological spore algorithm grown locally inside starship cargo bay.",
        analogies: ["Human memory allocation replaced with raw moist carbon food sources"],
        efficiencyRating: "0.08 Spore-flops per fungal spore",
        warnings: ["Keep moisture level above 30% to prevent spores dry-rotting."],
      },
      gorgon: {
        alienCode: `// TEMPORAL WARP SIGNAL\nTIME_ANCHOR warp_factor = CHRONO_PRESENT();\nTEMPORAL_WORMHOLE(warp_factor < CHRONO_FUTURE(4)) {\n  CHRONICLE_ECHO("Tachyon wave stabilized.");\n  warp_factor = TIME_WARP(warp_factor, 1);\n}`,
        explanation: "Sequential timing routine translated backwards relative to future timelines.",
        analogies: ["Sequential loops replaced with backwards-ticking chronological gears"],
        efficiencyRating: "5.2 Tachyon pulses per loop fold",
        warnings: ["Do not run parallel loops in the same quadrant to avoid temporal loops."],
      },
    };

    const mock = mockTranslations[targetLang];
    setTranslatedResult(mock);
    setActiveCode(mock.alienCode);
  };

  const handleConvertSimultaneous = async () => {
    if (!converterInput.trim()) return;
    setIsConvertingAll(true);
    
    const targets: Language[] = ["zeta", "xylor", "gorgon"];
    const resultsCopy = { ...converterResults };

    const translateSingle = async (lang: Language) => {
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: converterInput, targetLanguage: lang }),
        });
        
        if (res.ok) {
          const data = await res.json();
          return data;
        }
      } catch (err) {
        console.error(`Error converting to ${lang}:`, err);
      }
      
      // Offline fallback mock translations
      const fallbackCode: Record<Language, string> = {
        zeta: `// ZETA SIMULTANEOUS TRANSLATION\nCOORDINATE response_node = QUANTUM_NODE(42);\nTESS_LOOP(response_node > 0) {\n  PSI_PROJECTION("Quantum Data: " + response_node);\n  response_node = RESONATE(response_node * -1.5);\n}`,
        xylor: `// XYLOR SIMULTANEOUS TRANSLATION\nNUTRIENT_NODE moisture = 100;\nSPORE_BLOOM(moisture > 50) {\n  ENZYME_SECRETION("carbon-secrete", moisture);\n  moisture = SHED_SPORES(moisture, 10);\n}`,
        gorgon: `// GORGON SIMULTANEOUS TRANSLATION\nTIME_ANCHOR warp_factor = CHRONO_PRESENT();\nTEMPORAL_WORMHOLE(warp_factor < CHRONO_FUTURE(4)) {\n  CHRONICLE_ECHO("Chronology stabilized.");\n  warp_factor = TIME_WARP(warp_factor, 1);\n}`
      };
      
      const fallbackExplanations: Record<Language, string> = {
        zeta: "Translated standard logic to geometric space folds and quantum wave alignment in the local offline core.",
        xylor: "Coalesced logical operations into mycelial spores and metabolic secretion cycles using local mock bio-fluids.",
        gorgon: "Linked procedural execution backwards in time using chronotachyon waves via the temporal fallback relay."
      };

      return {
        alienCode: fallbackCode[lang],
        explanation: fallbackExplanations[lang],
        analogies: ["Simulated local multi-dimensional equivalent mappings"],
        efficiencyRating: "0.01 Space-flops",
        warnings: ["Subspace offline fallback translation deployed."]
      };
    };

    try {
      const converted = await Promise.all(targets.map(lang => translateSingle(lang)));
      targets.forEach((lang, idx) => {
        resultsCopy[lang] = converted[idx];
      });
      setConverterResults(resultsCopy);
    } catch (err) {
      console.error("Error in simultaneous conversion:", err);
    } finally {
      setIsConvertingAll(false);
    }
  };

  const handleTranslate = async () => {
    if (isSoundEnabled) playTranslateSound();
    if (!activeCode.trim()) return;
    setIsTranslating(true);
    setApiError(null);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: activeCode, targetLanguage: selectedLanguage }),
      });

      if (!res.ok) {
        if (res.status === 503 || res.status === 500) {
          setIsApiKeyMissing(true);
          setApiStatusReason("congested");
          setConnectionStatus("warning");
          triggerOfflineMockTranslation(selectedLanguage);
          return;
        }
        throw new Error("sub-space relay failed.");
      }

      const data = await res.json();
      if (data.isFallback) {
        setIsApiKeyMissing(true);
        setApiStatusReason("congested");
        setConnectionStatus("warning");
      }
      setTranslatedResult(data);
      if (data.alienCode) {
        let cleanCode = data.alienCode;
        if (typeof cleanCode === "string") {
          cleanCode = cleanCode.replace(/\\n/g, "\n");
        }
        setActiveCode(cleanCode);
      }
    } catch (err: any) {
      console.error(err);
      setApiError("Failed to reach galactic translator server. Running mock translation.");
      triggerOfflineMockTranslation(selectedLanguage);
    } finally {
      setIsTranslating(false);
    }
  };

  const triggerOfflineMockSimulation = (lang: Language): SimulationResult => {
    const mockSims: Record<Language, SimulationResult> = {
      zeta: {
        success: true,
        compilationError: null,
        metrics: [
          { key: "Psi-Bandwidth", value: "12.8 PB/s" },
          { key: "Quantum Decoherence", value: "0.03%" },
          { key: "Dimension Folds", value: "6.0" },
        ],
        executionSteps: [
          { title: "Quantum Alignment", durationMs: 400, logMessage: "Initializing spatial grid alignment across sectors 1-5...", state: "info" },
          { title: "Telepathic Resonance", durationMs: 600, logMessage: "Psi frequency locked at 440.12MHz. Handshaking complete.", state: "success" },
          { title: "Psi-Projection Broadcast", durationMs: 500, logMessage: "Transmitting scalar data streams onto orbit display...", state: "info" },
        ],
        finalOutput: "Zeta Grid [Psi-Signal]: Orbital array broadcast successfully. All vectors aligned.",
      },
      xylor: {
        success: true,
        compilationError: null,
        metrics: [
          { key: "Mycelial Density", value: "94.2 g/cm³" },
          { key: "Enzyme Moisture", value: "91.5%" },
          { key: "Carbon Absorb Rate", value: "14mg/sec" },
        ],
        executionSteps: [
          { title: "Colony Inoculation", durationMs: 500, logMessage: "Seeding organic carbon substrate with spores...", state: "info" },
          { title: "Moisture Ventilation", durationMs: 700, logMessage: "Warning: High carbon output detected. Siphoning spores.", state: "warning" },
          { title: "Enzymatic Secretion Yield", durationMs: 600, logMessage: "Mushroom stems grown. Digesting carbon files.", state: "success" },
        ],
        finalOutput: "Spore Colony yield: 45 carbon-capsules synthesized successfully. Harvest ready.",
      },
      gorgon: {
        success: true,
        compilationError: null,
        metrics: [
          { key: "Temporal Paradox Risk", value: "0.02%" },
          { key: "Chrono Drift Factor", value: "1.02 Slices" },
          { key: "Tachyon Charge", value: "88.4 mJ" },
        ],
        executionSteps: [
          { title: "Tachyon Charge", durationMs: 450, logMessage: "Warming chronon generators... status green.", state: "info" },
          { title: "Timeline Folding", durationMs: 650, logMessage: "Weaving backwards timeline thread through line index 2.", state: "info" },
          { title: "Paradox Filter Active", durationMs: 600, logMessage: "Future output retrieved safely before calculation startup.", state: "success" },
        ],
        finalOutput: "Chrono Output [Echo]: Future feedback retrieved. System uptime is stabilized.",
      },
    };

    return mockSims[lang];
  };

  const handleSimulate = async () => {
    setExecutionCycles((prev) => prev + 1);
    setIsSimulating(true);
    setApiError(null);

    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: activeCode, alienLanguage: selectedLanguage }),
      });

      if (!res.ok) {
        if (res.status === 503 || res.status === 500) {
          setIsApiKeyMissing(true);
          setApiStatusReason("congested");
          setConnectionStatus("warning");
          const mock = triggerOfflineMockSimulation(selectedLanguage);
          setSimulationResult(mock);
          return;
        }
        throw new Error("mainframe error.");
      }

      const data = await res.json();
      if (data.isFallback) {
        setIsApiKeyMissing(true);
        setApiStatusReason("congested");
        setConnectionStatus("warning");
      }
      setSimulationResult(data);
    } catch (err) {
      console.error(err);
      const mock = triggerOfflineMockSimulation(selectedLanguage);
      setSimulationResult(mock);
    }
  };

  const handleGenerateProject = async () => {
    if (!promptValue.trim()) return;
    setIsGeneratingProject(true);
    setActiveProject(null);
    setApiError(null);

    try {
      const res = await fetch("/api/generate-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptValue, language: selectedLanguage }),
      });

      if (!res.ok) {
        if (res.status === 503 || res.status === 500) {
          setIsApiKeyMissing(true);
          setApiStatusReason("congested");
          setConnectionStatus("warning");
          // Fallback static project
          const fallbackProj: AlienProject = {
            projectName: promptValue.replace(/\s+/g, "-") || "Warp-Core-Stabilizer",
            description: "Generated module loaded using local ship memory offline buffers.",
            complexity: "Officer-Class",
            estimatedSlices: "4.5 Cycles",
            files: [
              {
                filename: "main_node.alien",
                content: `// Local generated code for: ${promptValue}\nCOORDINATE main_core = QUANTUM_NODE(100);\n\nTESS_LOOP(main_core > 0) {\n  PSI_PROJECTION("Warp stabilization active factor: " + main_core);\n  main_core = RESONATE(main_core * -0.2);\n}`,
                purpose: "Primary system loop.",
              },
              {
                filename: "shield_regulator.alien",
                content: `// Subroutine module\nCOORDINATE shields = QUANTUM_NODE(50);\nTESS_LOOP(shields < 100) {\n  shields = RESONATE(shields + 10);\n}`,
                purpose: "Regulates localized shield flux.",
              },
            ],
            simulatedLogs: ["Mock project file generated successfully."],
          };
          setActiveProject(fallbackProj);
          setActiveCode(fallbackProj.files[0].content);
          setActiveFileIdx(0);
          return;
        }
        throw new Error("Project generation failed.");
      }

      const data = await res.json();
      if (data.isFallback) {
        setIsApiKeyMissing(true);
        setApiStatusReason("congested");
        setConnectionStatus("warning");
      }
      // Clean up literal newlines inside generated files
      if (data.files && Array.isArray(data.files)) {
        data.files = data.files.map((file: any) => ({
          ...file,
          content: typeof file.content === "string" ? file.content.replace(/\\n/g, "\n") : file.content
        }));
      }
      setActiveProject(data);
      if (data.files && data.files.length > 0) {
        setActiveCode(data.files[0].content);
        setActiveFileIdx(0);
      }
    } catch (err) {
      console.error(err);
      setApiError("Subspace project builder failed. Loading local static module template.");
    } finally {
      setIsGeneratingProject(false);
    }
  };

  const handleSelectProjectFile = (idx: number) => {
    if (activeProject) {
      setActiveFileIdx(idx);
      setActiveCode(activeProject.files[idx].content);
    }
  };

  const handleApplyZorblaxCode = (suggestedCode: string) => {
    setActiveProject(null);
    setActivePuzzleId(null);
    let cleanCode = suggestedCode;
    if (typeof cleanCode === "string") {
      cleanCode = cleanCode.replace(/\\n/g, "\n");
    }
    setActiveCode(cleanCode);
  };

  const getLanguageColor = () => {
    if (selectedLanguage === "zeta") return "text-cyan-400";
    if (selectedLanguage === "xylor") return "text-emerald-400";
    return "text-purple-400";
  };

  const getLanguageBorder = () => {
    if (selectedLanguage === "zeta") return "border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-500/10";
    if (selectedLanguage === "xylor") return "border-emerald-500/30 focus:border-emerald-400 focus:ring-emerald-500/10";
    return "border-purple-500/30 focus:border-purple-400 focus:ring-purple-500/10";
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-zinc-800" id="main-ide-app">
      {/* Immersive Starship Top Header */}
      <header className="border-b border-zinc-900 bg-zinc-950 p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Menu Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(prev => !prev)}
              className="md:hidden p-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer mr-1 flex items-center justify-center"
              title="Toggle Subspace Navigation"
              id="mobile-menu-trigger"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center relative">
              <Cpu className="w-5 h-5 text-red-500 animate-pulse" />
              <div className="absolute -inset-0.5 rounded-xl border border-red-500/10 animate-pulse pointer-events-none" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-mono text-sm font-bold tracking-wider text-zinc-100">
                  🛸 ALIEN PROGRAMMING IDE
                </h1>
                <span className="text-[10px] font-mono bg-zinc-900 text-zinc-400 px-1.5 py-0.2 rounded border border-zinc-800">
                  v4.9
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-500 leading-none mt-1">
                Compress 3D sequential algorithms into hyper-dense galactic modules.
              </p>
            </div>
          </div>

          {/* Reactor Stats & Network Connections */}
          <div className="flex items-center gap-3 font-mono text-[10px]">
            <div className="hidden sm:flex items-center gap-1 bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-800 text-zinc-400">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>REACTOR TEMP:</span>
              <span className="text-zinc-200 font-semibold">412°K</span>
            </div>

            <div className="flex items-center gap-2 bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-800">
              {connectionStatus === "connected" ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-400">TRANSLATOR RELAY CONNECTED</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-amber-400">OFFLINE TRANSLATOR BUFFER ACTIVE</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Area: Left Sidebar + Right Scroll Container */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 relative">
        {/* Sliding Left Sidebar (Desktop) */}
        <aside 
          className={`hidden md:flex flex-col bg-zinc-950 border-r border-zinc-900 sticky top-[73px] h-[calc(100vh-73px)] shrink-0 transition-all duration-300 ease-in-out z-30 select-none overflow-hidden ${
            isSidebarExpanded ? "w-64" : "w-16"
          }`}
          id="desktop-sidebar"
        >
          {/* Header & Toggle Button */}
          <div className="p-4 border-b border-zinc-900 flex items-center justify-between min-h-[57px] bg-zinc-950/40">
            {isSidebarExpanded && (
              <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest animate-fade-in">
                Operations Core
              </span>
            )}
            <button
              onClick={() => setIsSidebarExpanded(prev => !prev)}
              className={`p-1.5 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer ${
                !isSidebarExpanded ? "mx-auto" : ""
              }`}
              title={isSidebarExpanded ? "Collapse Navigation" : "Expand Navigation"}
            >
              {isSidebarExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-3 flex-1 space-y-2 mt-2">
            {/* Coding Workspace Tab Button */}
            <button
              onClick={() => setActiveWorkspaceTab("coding")}
              className={`w-full flex items-center rounded-xl border transition-all cursor-pointer font-mono group relative ${
                isSidebarExpanded ? "p-3 gap-3 text-left" : "p-2.5 justify-center"
              } ${
                activeWorkspaceTab === "coding"
                  ? "bg-zinc-900/80 border-zinc-800/80 text-zinc-100 shadow-[0_0_15px_rgba(34,211,238,0.08)]"
                  : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30"
              }`}
              title={!isSidebarExpanded ? "Coding Workspace" : undefined}
            >
              <Terminal className={`w-4 h-4 shrink-0 transition-colors ${activeWorkspaceTab === "coding" ? getLanguageColor() : "text-zinc-500 group-hover:text-zinc-300"}`} />
              
              {isSidebarExpanded ? (
                <div className="animate-fade-in min-w-0">
                  <span className="text-xs font-bold block uppercase tracking-wider truncate">Coding Workspace</span>
                  <span className="text-[9px] text-zinc-500 block uppercase mt-0.5 truncate text-left">Active IDE & Compiler</span>
                </div>
              ) : (
                activeWorkspaceTab === "coding" && (
                  <div className="absolute right-1 w-1 h-4 rounded bg-cyan-400" />
                )
              )}
            </button>

            {/* Altered Target Tab Button */}
            <button
              onClick={() => setActiveWorkspaceTab("altered")}
              className={`w-full flex items-center rounded-xl border transition-all cursor-pointer font-mono group relative ${
                isSidebarExpanded ? "p-3 gap-3 text-left" : "p-2.5 justify-center"
              } ${
                activeWorkspaceTab === "altered"
                  ? "bg-zinc-900/80 border-zinc-800/80 text-zinc-100 shadow-[0_0_15px_rgba(244,63,94,0.08)]"
                  : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30"
              }`}
              title={!isSidebarExpanded ? "Altered Target" : undefined}
            >
              <ShieldAlert className={`w-4 h-4 shrink-0 transition-colors ${activeWorkspaceTab === "altered" ? "text-rose-400 animate-pulse" : "text-zinc-500 group-hover:text-zinc-300"}`} />
              
              {isSidebarExpanded ? (
                <div className="animate-fade-in min-w-0">
                  <span className="text-xs font-bold block uppercase tracking-wider truncate">Altered Target</span>
                  <span className="text-[9px] text-zinc-500 block uppercase mt-0.5 truncate text-left">Quantum Encryption</span>
                </div>
              ) : (
                activeWorkspaceTab === "altered" && (
                  <div className="absolute right-1 w-1 h-4 rounded bg-rose-500" />
                )
              )}
            </button>

            {/* Dialect Converter Tab Button */}
            <button
              onClick={() => setActiveWorkspaceTab("converter")}
              className={`w-full flex items-center rounded-xl border transition-all cursor-pointer font-mono group relative ${
                isSidebarExpanded ? "p-3 gap-3 text-left" : "p-2.5 justify-center"
              } ${
                activeWorkspaceTab === "converter"
                  ? "bg-zinc-900/80 border-zinc-800/80 text-zinc-100 shadow-[0_0_15px_rgba(168,85,247,0.08)]"
                  : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30"
              }`}
              title={!isSidebarExpanded ? "Dialect Converter" : undefined}
            >
              <Shuffle className={`w-4 h-4 shrink-0 transition-colors ${activeWorkspaceTab === "converter" ? "text-purple-400 animate-pulse" : "text-zinc-500 group-hover:text-zinc-300"}`} />
              
              {isSidebarExpanded ? (
                <div className="animate-fade-in min-w-0">
                  <span className="text-xs font-bold block uppercase tracking-wider truncate">Dialect Converter</span>
                  <span className="text-[9px] text-zinc-500 block uppercase mt-0.5 truncate text-left">Simultaneous Dialects</span>
                </div>
              ) : (
                activeWorkspaceTab === "converter" && (
                  <div className="absolute right-1 w-1 h-4 rounded bg-purple-500" />
                )
              )}
            </button>
          </div>

          {/* Sidebar Status Info at bottom */}
          <div className="p-4 border-t border-zinc-900/60 bg-zinc-950/10 text-center font-mono text-[9px] text-zinc-600 uppercase">
            {isSidebarExpanded ? (
              <div className="space-y-1.5 text-left animate-fade-in">
                <div className="flex items-center justify-between">
                  <span>ACTIVE DIALECT:</span>
                  <span className="font-bold text-zinc-400">{selectedLanguage}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>REACTOR STATUS:</span>
                  <span className="text-amber-500 font-bold">STABLE</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Stable" />
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Sliding Sidebar Drawer (Overlay) */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80] md:hidden animate-fade-in"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
        <aside 
          className={`fixed top-0 bottom-0 left-0 w-64 bg-zinc-950 border-r border-zinc-900 z-[90] md:hidden flex flex-col transform transition-transform duration-300 ease-out select-none ${
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          id="mobile-sidebar"
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-zinc-900 flex items-center justify-between min-h-[57px]">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="font-mono text-xs font-bold tracking-widest text-zinc-300">CORE NAVIGATION</span>
            </div>
            <button 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-1.5 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-lg text-zinc-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="p-4 flex-1 space-y-3">
            <button
              onClick={() => {
                setActiveWorkspaceTab("coding");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border font-mono transition-all text-left cursor-pointer ${
                activeWorkspaceTab === "coding"
                  ? "bg-zinc-900 border-zinc-800 text-zinc-100 shadow-[0_0_15px_rgba(34,211,238,0.1)]"
                  : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Terminal className={`w-5 h-5 ${activeWorkspaceTab === "coding" ? getLanguageColor() : "text-zinc-500"}`} />
              <div>
                <span className="text-xs font-bold block uppercase tracking-wider text-zinc-200">Coding Workspace</span>
                <span className="text-[9px] text-zinc-500 block uppercase mt-0.5">Active IDE & Compiler</span>
              </div>
            </button>

             <button
              onClick={() => {
                setActiveWorkspaceTab("altered");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border font-mono transition-all text-left cursor-pointer ${
                activeWorkspaceTab === "altered"
                  ? "bg-zinc-900 border-rose-950/50 text-zinc-100 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
                  : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <ShieldAlert className={`w-5 h-5 ${activeWorkspaceTab === "altered" ? "text-rose-400" : "text-zinc-500"}`} />
              <div>
                <span className="text-xs font-bold block uppercase tracking-wider text-zinc-200">Altered Target</span>
                <span className="text-[9px] text-zinc-500 block uppercase mt-0.5">Quantum Encryption</span>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveWorkspaceTab("converter");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border font-mono transition-all text-left cursor-pointer ${
                activeWorkspaceTab === "converter"
                  ? "bg-zinc-900 border-purple-950/50 text-zinc-100 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                  : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Shuffle className={`w-5 h-5 ${activeWorkspaceTab === "converter" ? "text-purple-400 animate-pulse" : "text-zinc-500"}`} />
              <div>
                <span className="text-xs font-bold block uppercase tracking-wider text-zinc-200">Dialect Converter</span>
                <span className="text-[9px] text-zinc-500 block uppercase mt-0.5">Simultaneous Dialects</span>
              </div>
            </button>
          </div>

          {/* Footer info in drawer */}
          <div className="p-4 border-t border-zinc-900 font-mono text-[9px] text-zinc-600 uppercase">
            <div>Translator Status: Online</div>
            <div className="mt-1">Active Dialect: {selectedLanguage}</div>
          </div>
        </aside>

        {/* Right Scroll Container & Main View */}
        <div className="flex-1 min-w-0 flex flex-col overflow-y-auto">
          <main className="flex-1 p-4 lg:p-6 space-y-6">
            {/* Tab Wrapping condition */}
            {activeWorkspaceTab === "coding" ? (
              <div className="space-y-6 animate-fade-in">
        {/* API Key Graceful Warning Banner */}
        {isApiKeyMissing && (
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 animate-fade-in" id="apikey-warning-banner">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-mono text-xs font-semibold text-amber-300">
                {apiStatusReason === "congested" 
                  ? "System Alert: Telepathic Relay Congestion (503 / High Demand)"
                  : "System Alert: Subspace Transceiver Offline"}
              </h4>
              <p className="font-mono text-[11px] text-zinc-400 mt-1 leading-relaxed">
                {apiStatusReason === "congested" ? (
                  <span>
                    The central cosmic intelligence cores are experiencing extremely high demand spikes. To ensure zero lag, the simulator has seamlessly activated local offline mock compiler cores. You can continue writing code, running simulations, and compiling projects in safe local registers without interruption!
                  </span>
                ) : (
                  <span>
                    Gemini API Key is not configured in your settings. The simulator has deployed its local offline mock compiler cores so you can still experiment with the IDE, run code, and build files seamlessly. Add a <strong className="text-amber-300">GEMINI_API_KEY</strong> in the Secrets panel to activate full telepathic translation capabilities.
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Decryption Success Notification Banner */}
        {decryptStatus && decryptStatus.visible && (
          <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 flex items-start justify-between gap-3 animate-fade-in shadow-[0_0_15px_rgba(16,185,129,0.1)]" id="decryption-success-banner">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h4 className="font-mono text-xs font-bold text-emerald-300">
                  🛸 SUBSPACE DATA-STREAM DECRYPTED
                </h4>
                <p className="font-mono text-[11px] text-zinc-300 mt-1 leading-relaxed">
                  Successfully decrypted a shared alien routine: <strong className="text-emerald-300 font-bold">"{decryptStatus.name}"</strong> (ID: <span className="font-mono text-cyan-400">#{decryptStatus.id}</span>). 
                  Synchronized on <span className="text-zinc-400 font-semibold">{decryptStatus.timestamp}</span>. Loaded into the editor buffer registers.
                </p>
              </div>
            </div>
            <button 
              onClick={() => {
                setDecryptStatus(null);
                const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
                window.history.pushState({ path: newUrl }, '', newUrl);
              }}
              className="text-zinc-500 hover:text-zinc-200 font-mono text-[10px] uppercase font-bold px-2 py-1 rounded bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 transition-all cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Auto-Correct Diagnostics and Structural Harmonization Notification */}
        {autoCorrectResults && autoCorrectResults.visible && (
          <div className="bg-cyan-950/30 border border-cyan-500/40 rounded-xl p-4 flex items-start justify-between gap-3 animate-fade-in shadow-[0_0_15px_rgba(6,182,212,0.1)]" id="autocorrect-banner">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h4 className="font-mono text-xs font-bold text-cyan-300">
                  ✨ AUTO-CORRECT DIAGNOSTICS & HARMONIZATION
                </h4>
                {autoCorrectResults.changes.length === 0 ? (
                  <p className="font-mono text-[11px] text-emerald-400 font-bold mt-1 leading-relaxed">
                    Diagnostic complete: All structural brackets, parentheses, and keyword casings are perfectly aligned in the selected dialect! No anomalies detected.
                  </p>
                ) : (
                  <div className="mt-2 space-y-1">
                    <p className="font-mono text-[11px] text-zinc-300 leading-relaxed mb-1.5">
                      Successfully applied <strong className="text-cyan-400">{autoCorrectResults.changes.length}</strong> semantic corrections:
                    </p>
                    <ul className="list-disc pl-4 space-y-1 max-h-24 overflow-y-auto">
                      {autoCorrectResults.changes.map((change, idx) => (
                        <li key={idx} className="font-mono text-[10px] text-zinc-400">{change}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={() => setAutoCorrectResults(null)}
              className="text-zinc-500 hover:text-zinc-200 font-mono text-[10px] uppercase font-bold px-2 py-1 rounded bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 transition-all cursor-pointer"
            >
              Acknowledge
            </button>
          </div>
        )}

        {/* 1. Language Dialect Selector */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px] font-bold uppercase tracking-widest pl-1">
            <BrainCircuit className="w-4 h-4 text-zinc-500" />
            <span>Select Target Dialect</span>
          </div>
          <LanguageSelector
            languages={LANGUAGES}
            selectedId={selectedLanguage}
            onSelect={setSelectedLanguage}
          />
        </div>

        {/* 2. Interactive Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Code Editor and Generators (Span 7) */}
          <div className="lg:col-span-7 space-y-4 flex flex-col">
            <div 
              className={`backdrop-blur-md border rounded-xl p-4 flex-1 flex flex-col transition-all duration-300 ${
                showOnboarding && onboardingStep === 1
                  ? "bg-purple-950/10 border-purple-500 ring-2 ring-purple-500/60 ring-offset-4 ring-offset-black shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                  : "bg-zinc-900/40 border-zinc-800/80"
              }`} 
              id="ide-workspace"
            >
              {/* Workspace Header */}
              <div className="flex flex-col gap-3 border-b border-zinc-800/60 pb-3 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* File Name Info with dialect accent indicator */}
                  <div className="flex items-center gap-2">
                    <FileCode2 className={`w-4 h-4 ${getLanguageColor()}`} />
                    <span className="font-mono text-xs font-bold text-zinc-200">
                      {activeProject ? `${activeProject.projectName} (Custom Project)` : `editor_buffer.${selectedLanguage === "zeta" ? "gly" : selectedLanguage === "xylor" ? "spr" : "wh"}`}
                    </span>

                    {/* Recent Snippets History Menu */}
                    <div className="relative group ml-2">
                      <button
                        className="px-2 py-0.5 font-mono text-[9px] font-bold rounded bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all flex items-center gap-1 cursor-pointer"
                        title="Session File snaps history (Last 5 snapshots)"
                      >
                        <History className="w-2.5 h-2.5 text-cyan-400" />
                        <span>Recent ({recentSnippets.length})</span>
                      </button>
                      <div className="absolute left-0 top-full mt-1.5 w-60 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl p-2 hidden group-hover:block z-50 animate-fade-in">
                        <div className="border-b border-zinc-850 pb-1 mb-1.5 px-1 flex items-center justify-between">
                          <span className="font-mono text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Recent Snapshots</span>
                          <span className="text-[8px] text-zinc-600 font-mono">Max 5</span>
                        </div>
                        {recentSnippets.length === 0 ? (
                          <div className="p-2.5 text-center text-zinc-600 font-mono text-[9px]">
                            No snapshots recorded yet.
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {recentSnippets.map((snap) => (
                              <button
                                key={snap.id}
                                onClick={() => {
                                  setSelectedLanguage(snap.language);
                                  setActiveCode(snap.code);
                                  setActiveProject(null);
                                  setActivePuzzleId(null);
                                }}
                                className="w-full text-left p-1 rounded hover:bg-zinc-900 font-mono text-[9px] text-zinc-300 hover:text-white transition-colors flex justify-between items-center gap-1 cursor-pointer"
                              >
                                <div className="truncate flex-1">
                                  <span className="font-bold text-zinc-300 block truncate">{snap.name}</span>
                                  <span className="text-[7px] text-zinc-500 block uppercase">{snap.language} · {snap.timestamp}</span>
                                </div>
                                <span className="text-[8px] text-cyan-400 font-bold bg-cyan-950/30 border border-cyan-900/20 px-1 rounded">LOAD</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {isSavingIndicatorVisible && (
                      <span className="flex items-center gap-1.5 font-mono text-[9px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/25 px-2 py-0.5 rounded-md animate-pulse">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                        <span>Saving...</span>
                      </span>
                    )}
                  </div>

                  {/* Right: Font Zoom, Code Formatter, and Copy tools */}
                  <div className="flex items-center flex-wrap gap-2">
                    {/* Import Template Dropdown */}
                    <div className="relative group">
                      <button
                        className="px-2.5 py-1 font-mono text-[10px] font-bold rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Insert Template"
                      >
                        <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Templates</span>
                      </button>
                      <div className="absolute right-0 top-full mt-1.5 w-60 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl p-2 hidden group-hover:block z-50 animate-fade-in">
                        {TEMPLATES[selectedLanguage].map((tmpl) => (
                          <button
                            key={tmpl.name}
                            onClick={() => setActiveCode(activeCode + "\n" + tmpl.code)}
                            className="w-full text-left p-2 rounded hover:bg-zinc-900 font-mono text-[10px] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <span className="font-bold block text-zinc-100">{tmpl.name}</span>
                            <span className="text-[9px] text-zinc-500 block">{tmpl.description}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Snippet Library Trigger */}
                    <button
                      onClick={() => setIsSnippetLibraryOpen(true)}
                      className="px-2.5 py-1 font-mono text-[10px] font-bold rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Open Snippet Library Modal to reuse common alien code logic patterns"
                    >
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Snippets</span>
                    </button>

                      {/* Alien Theme Toggle */}
                      <button
                        onClick={() => setIsAlienThemeActive(prev => !prev)}
                        className={`px-2.5 py-1 font-mono text-[10px] font-bold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                          isAlienThemeActive
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-400 font-semibold shadow-[0_0_8px_rgba(245,158,11,0.1)]"
                            : "border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100"
                        }`}
                        title="Toggle Alien Language Immersive UI Accent colors"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Alien Theme</span>
                      </button>

                      {/* Sound Toggle */}
                      <button
                        onClick={() => {
                          if (!isSoundEnabled) initAudio();
                          setIsSoundEnabled(prev => !prev);
                        }}
                        className={`px-2.5 py-1 font-mono text-[10px] font-bold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSoundEnabled
                            ? "border-zinc-800 bg-zinc-950 text-zinc-300"
                            : "border-red-900 bg-red-950/20 text-red-400"
                        }`}
                        title="Toggle sound effects"
                      >
                        {isSoundEnabled ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                        <span>{isSoundEnabled ? "Sound ON" : "Sound OFF"}</span>
                      </button>

                    {/* Editor Visual Theme Toggle */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => setEditorVisualTheme(prev => prev === "dark_void" ? "high_contrast_nebula" : "dark_void")}
                        className={`px-2.5 py-1 font-mono text-[10px] font-bold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                          editorVisualTheme === "high_contrast_nebula"
                            ? "border-cyan-400 bg-cyan-950/40 text-cyan-300 font-semibold shadow-[0_0_12px_rgba(34,211,238,0.25)]"
                            : "border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                        }`}
                        title="Switch between 'Dark Void' and 'High Contrast Nebula' themes to improve visibility in low-light ship environments"
                      >
                        {editorVisualTheme === "high_contrast_nebula" ? (
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                        )}
                        <span>Theme: {editorVisualTheme === "high_contrast_nebula" ? "Nebula (Contrast)" : "Dark Void"}</span>
                      </button>

                      {/* Low-Light Environment Compatibility Sub-Preset */}
                      {editorVisualTheme === "dark_void" && (
                        <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800/80 px-2.5 py-1 rounded-lg">
                          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider font-bold">COCKPIT PRESET:</span>
                          <select
                            value={lowLightMode}
                            onChange={(e) => setLowLightMode(e.target.value as any)}
                            className="bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[10px] px-2 py-0.5 rounded cursor-pointer focus:outline-none"
                            title="Filter blue-light or dim screen for night-time spaceflight compatibility"
                          >
                            <option value="normal">Normal Dark</option>
                            <option value="dimmed">Cockpit Dim (65%)</option>
                            <option value="amber">Amber Shift (No Blue)</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Font Size Fine-grained Slider & Controller */}
                    <div className="flex items-center gap-2 bg-zinc-950/80 border border-zinc-800/80 px-2.5 py-1 rounded-lg">
                      <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider font-bold">FONT:</span>
                      <button
                        onClick={() => setEditorFontSize(prev => Math.max(8, prev - 1))}
                        disabled={editorFontSize <= 8}
                        className="p-0.5 hover:bg-zinc-900 rounded text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                        title="Decrease Font Size (1px)"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="range"
                        min="8"
                        max="32"
                        step="1"
                        value={editorFontSize}
                        onChange={(e) => setEditorFontSize(Number(e.target.value))}
                        className="w-14 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        title="Slide to adjust font size (1px steps)"
                      />
                      <span className="font-mono text-[10px] text-zinc-300 min-w-[28px] text-center font-bold">{editorFontSize}px</span>
                      <button
                        onClick={() => setEditorFontSize(prev => Math.min(32, prev + 1))}
                        disabled={editorFontSize >= 32}
                        className="p-0.5 hover:bg-zinc-900 rounded text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                        title="Increase Font Size (1px)"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Keyboard Shortcuts Trigger Button */}
                    <button
                      onClick={() => setIsShortcutModalOpen(true)}
                      className="px-2.5 py-1 font-mono text-[10px] font-bold rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 transition-all flex items-center gap-1.5 cursor-pointer"
                      title="View all Keyboard Shortcuts & Hotkeys (Ctrl+/)"
                    >
                      <Keyboard className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Shortcuts</span>
                    </button>

                    {/* Dictate Code button */}
                    <button
                      onClick={handleToggleDictate}
                      className={`px-2.5 py-1 font-mono text-[10px] font-bold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                        isListening
                          ? "border-red-500/30 bg-red-500/15 text-red-400 font-semibold shadow-[0_0_8px_rgba(239,68,68,0.2)]"
                          : "border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100"
                      }`}
                      title={isListening ? "Listening... Click to stop voice dictation" : "Dictate Code (Speak commands to type)"}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-3 h-3 text-red-400 animate-bounce" />
                          <span className="text-[9px] uppercase tracking-wider text-red-400">Listening...</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3 h-3 text-red-400" />
                          <span>Dictate</span>
                        </>
                      )}
                    </button>

                    {/* Format Code button */}
                    <button
                      onClick={handleFormatCode}
                      className="px-2.5 py-1 font-mono text-[10px] font-bold rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Format indentation, capitalization, and spacing rules"
                    >
                      <Code className="w-3 h-3 text-purple-400" />
                      <span>Format</span>
                    </button>

                    {/* Auto-Correct button */}
                    <button
                      onClick={handleAutoCorrect}
                      className="px-2.5 py-1 font-mono text-[10px] font-bold rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 transition-colors flex items-center gap-1 cursor-pointer shadow-[0_0_8px_rgba(34,211,238,0.05)]"
                      title="Scan buffer and automatically fix mismatched brackets or casing errors"
                    >
                      <Wand2 className="w-3 h-3 text-cyan-400" />
                      <span>Auto-Correct</span>
                    </button>

                    {/* Export QASM button */}
                    <button
                      onClick={handleExportQASM}
                      className="px-2.5 py-1 font-mono text-[10px] font-bold rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Export current buffer code as a standard OpenQASM 2.0 quantum file"
                    >
                      <Download className="w-3 h-3 text-cyan-400" />
                      <span>Export QASM</span>
                    </button>

                    {/* Share Routine button */}
                    <button
                      onClick={handleShareRoutine}
                      className="px-2.5 py-1 font-mono text-[10px] font-bold rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Share this routine with other crew members"
                    >
                      <Share2 className="w-3 h-3 text-amber-400" />
                      <span>Share</span>
                    </button>

                    {/* Copy to Clipboard button */}
                    <button
                      onClick={handleCopyCode}
                      className={`px-2.5 py-1 font-mono text-[10px] font-bold rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                        copied
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold shadow-[0_0_8px_rgba(16,185,129,0.1)]"
                          : "border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100"
                      }`}
                      title="Copy full code buffer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400 animate-pulse" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-zinc-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {/* Toggle Line Numbers button */}
                    <button
                      onClick={() => setShowLineNumbers(prev => !prev)}
                      className={`px-2.5 py-1 font-mono text-[10px] font-bold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                        showLineNumbers
                          ? "border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-zinc-100"
                          : "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-semibold"
                      }`}
                      title={showLineNumbers ? "Hide line numbers column" : "Show line numbers column"}
                    >
                      {showLineNumbers ? (
                        <>
                          <EyeOff className="w-3 h-3 text-zinc-400" />
                          <span>Lines: ON</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3 text-cyan-400" />
                          <span>Lines: OFF</span>
                        </>
                      )}
                    </button>

                    {/* Export to Local Backup button */}
                    <button
                      onClick={handleExportBackup}
                      disabled={!activeCode.trim()}
                      className="px-2.5 py-1 font-mono text-[10px] font-bold rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Export editor buffer to offline .txt backup"
                    >
                      <Download className="w-3 h-3 text-emerald-400" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                {/* Voice Dictation Error Banner */}
                {dictationError && (
                  <div className="bg-red-950/20 border border-red-500/20 text-red-400 p-2.5 rounded-lg text-[10px] font-mono flex items-center gap-2 animate-pulse mt-1 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                    <span>{dictationError}</span>
                  </div>
                )}

                {/* Dialect metadata details and Load Module Select template */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950/20 p-2 rounded-lg border border-zinc-900/60">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-500">
                    <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: selectedLanguage === "zeta" ? "#22d3ee" : selectedLanguage === "xylor" ? "#34d399" : "#c084fc" }} />
                    <span className="uppercase tracking-widest">{selectedLanguage} core dialect optimized</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                      Load Module:
                    </label>
                    <select
                      onChange={(e) => handleSelectTemplate(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] font-mono text-zinc-300 focus:outline-none focus:border-zinc-700 cursor-pointer"
                    >
                      <option value="">-- Choose Template --</option>
                      {TEMPLATES[selectedLanguage].map((tmpl, idx) => (
                        <option key={idx} value={tmpl.code}>
                          {tmpl.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Multi-file Tab Bar (If custom project has been generated) */}
              {activeProject && (
                <div className="flex overflow-x-auto gap-1 border-b border-zinc-900 pb-2 mb-3 scrollbar-thin">
                  {activeProject.files.map((file, idx) => (
                    <button
                      key={idx}
                      id={`proj-file-tab-${idx}`}
                      onClick={() => handleSelectProjectFile(idx)}
                      className={`px-3 py-1 text-[10px] font-mono rounded border transition-all cursor-pointer whitespace-nowrap ${
                        activeFileIdx === idx
                          ? "bg-zinc-950 border-zinc-800 text-zinc-100"
                          : "bg-zinc-950/20 border-transparent text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      📄 {file.filename}
                    </button>
                  ))}
                </div>
              )}

              {/* Keyword Search Navigation Bar */}
              <div className="bg-zinc-950/60 border border-zinc-850/80 rounded-xl p-2 mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <input
                    type="text"
                    value={editorSearchQuery}
                    onChange={(e) => setEditorSearchQuery(e.target.value)}
                    placeholder="Search/highlight keywords in code (e.g. COORDINATE, RESONATE, function)..."
                    className="w-full bg-transparent text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none"
                  />
                  {editorSearchQuery && (
                    <button
                      onClick={() => setEditorSearchQuery("")}
                      className="p-1 hover:bg-zinc-900 rounded text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {editorSearchQuery && (
                  <div className="font-mono text-[9px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-md animate-pulse shrink-0">
                    {getSearchMatchesCount()} {getSearchMatchesCount() === 1 ? "match" : "matches"} found
                  </div>
                )}
              </div>

              {/* Complexity Danger Assessment Dashboard */}
              {(() => {
                const comp = getComplexityScore(activeCode);
                return (
                  <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-xl p-3 mb-3 flex flex-col md:flex-row items-stretch gap-4 transition-all duration-300">
                    {/* Left: Score circle or badge */}
                    <div className="flex flex-col items-center justify-center bg-zinc-950/80 border border-zinc-900 px-4 py-2.5 rounded-lg min-w-[110px] shrink-0 text-center relative overflow-hidden">
                      <span className="font-mono text-[8px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">DANGER SCORE</span>
                      <span className={`font-mono text-2xl font-black ${comp.score > 75 ? "text-red-500" : comp.score > 45 ? "text-amber-500" : comp.score > 20 ? "text-cyan-400" : "text-emerald-400"}`}>
                        {comp.score}
                        <span className="text-[10px] font-normal text-zinc-500">/100</span>
                      </span>
                      <span className={`mt-1 font-mono text-[8px] font-black uppercase px-2 py-0.5 rounded border ${comp.color}`}>
                        {comp.rating}
                      </span>
                    </div>

                    {/* Right: Details / progress and context warnings */}
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-zinc-950/50 border border-zinc-900/60 p-1.5 rounded-lg">
                          <span className="block font-mono text-[8px] text-zinc-500 uppercase">Nested Depth</span>
                          <span className="font-mono text-xs font-black text-zinc-200">{comp.maxDepth}</span>
                        </div>
                        <div className="bg-zinc-950/50 border border-zinc-900/60 p-1.5 rounded-lg">
                          <span className="block font-mono text-[8px] text-zinc-500 uppercase">System Calls</span>
                          <span className="font-mono text-xs font-black text-zinc-200">{comp.systemCalls}</span>
                        </div>
                        <div className="bg-zinc-950/50 border border-zinc-900/60 p-1.5 rounded-lg">
                          <span className="block font-mono text-[8px] text-zinc-500 uppercase">Total Loops</span>
                          <span className="font-mono text-xs font-black text-zinc-200">{comp.totalLoops}</span>
                        </div>
                      </div>

                      {/* Progress Bar and Warning */}
                      <div className="mt-2">
                        <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full ${comp.barColor} transition-all duration-500`} style={{ width: `${comp.score}%` }} />
                        </div>
                        <p className="mt-2 font-mono text-[9px] text-zinc-400 flex items-center gap-1.5">
                          {comp.score > 75 ? (
                            <Flame className="w-3.5 h-3.5 text-red-500 animate-bounce shrink-0" />
                          ) : (
                            <Info className={`w-3.5 h-3.5 shrink-0 ${comp.score > 45 ? "text-amber-500" : "text-zinc-500"}`} />
                          )}
                          <span className="truncate">
                            {selectedLanguage === "zeta" && comp.score > 60
                              ? "Critical threat: Hyper-dimensional coordinate overlap may trigger resonance cascade!"
                              : selectedLanguage === "zeta"
                              ? "System operating within standard space-vector convergence margins."
                              : selectedLanguage === "xylor" && comp.score > 60
                              ? "Spore infestation alert: Colony growing too dense, high risk of host consumption."
                              : selectedLanguage === "xylor"
                              ? "Spore moisture and nutrient index optimal for bio-organic computation."
                              : selectedLanguage === "gorgon" && comp.score > 60
                              ? "Timeline paradox alert: High tachyon flux detected. Future state might overlap past compile."
                              : "Temporal chronological vectors remain stable relative to normal gravity wells."}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Code Area Wrapper with Low-Light Cockpit filter support */}
              <div 
                className={`flex-1 rounded-xl overflow-hidden flex flex-col border transition-all duration-300 ${getThemeClasses().bg} ${getThemeClasses().glow}`}
                style={getLowLightStyle()}
              >
                {/* Editor scrollable layer */}
                <div className="flex-1 min-h-[300px] flex relative font-mono text-xs">
                {/* Simulated vertical line counter column, scaling with font zoom */}
                {showLineNumbers && (
                  <div
                    ref={lineCounterRef}
                    className={`w-10 border-r py-3 px-1 text-right select-none overflow-hidden h-[300px] transition-colors duration-300 ${getThemeClasses().lineBg}`}
                    style={{
                      fontSize: `${editorFontSize}px`,
                      lineHeight: `${editorFontSize * 1.6}px`,
                      paddingTop: '12px',
                      paddingBottom: '12px'
                    }}
                  >
                    {lines.map((_, idx) => (
                      <div
                        key={idx}
                        style={{ height: `${editorFontSize * 1.6}px` }}
                      >
                        {idx + 1}
                      </div>
                    ))}
                  </div>
                )}

                {/* Double-layered input container for synced syntax highlighting underlay */}
                <div className="flex-1 h-[300px] relative overflow-hidden bg-transparent">
                  {/* Fully Interactive transparent Text Area on bottom */}
                  <textarea
                    ref={editorRef}
                    value={activeCode}
                    onChange={(e) => {
                      setActiveCode(e.target.value);
                      setActiveProject(null);
                      updateAutocomplete(e.target.value, e.target.selectionStart, e.target);
                    }}
                    onKeyDown={handleKeyDown}
                    onClick={(e) => {
                      const textarea = e.currentTarget;
                      updateAutocomplete(textarea.value, textarea.selectionStart, textarea);
                    }}
                    onScroll={handleScroll}
                    placeholder={`Write your sequential algorithms here... Load templates above to see examples of ${languageInfo.name}.`}
                    className={`absolute inset-0 w-full h-full p-3 bg-transparent text-transparent focus:outline-none resize-none overflow-y-auto overflow-x-hidden select-text selection:bg-zinc-800/80 selection:text-zinc-100 tracking-normal ${getThemeClasses().caret} z-0`}
                    style={{
                      fontSize: `${editorFontSize}px`,
                      lineHeight: `${editorFontSize * 1.6}px`,
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                      padding: '12px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all'
                    }}
                    spellCheck="false"
                    id="ide-code-textarea"
                  />

                  {/* Real-time Syntax Highlighted Div on top */}
                  <div
                    ref={highlighterRef}
                    className={`absolute inset-0 p-3 overflow-hidden whitespace-pre-wrap break-all pointer-events-none tracking-normal scrollbar-none transition-colors duration-300 ${getThemeClasses().text} z-10`}
                    style={{
                      fontSize: `${editorFontSize}px`,
                      lineHeight: `${editorFontSize * 1.6}px`,
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                      padding: '12px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      scrollbarWidth: 'none'
                    }}
                  >
                    {highlightCode(activeCode, selectedLanguage, editorSearchQuery)}
                    {activeCode.endsWith("\n") ? "\n" : ""}
                  </div>

                  {/* Autocomplete Suggestion Dropdown */}
                  {showAutocomplete && autocompleteSuggestions.length > 0 && (
                    <div
                      className="absolute z-50 bg-zinc-950/95 border border-zinc-800 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.85)] p-1.5 w-52 max-h-48 overflow-y-auto backdrop-blur-md"
                      style={{
                        top: `${autocompleteCoords.top}px`,
                        left: `${autocompleteCoords.left}px`,
                      }}
                    >
                      <div className="font-mono text-[7px] text-zinc-500 px-1 pb-1 border-b border-zinc-900 mb-1.5 flex justify-between items-center uppercase tracking-wider font-bold">
                        <span>Keywords</span>
                        <span>Tab/Enter</span>
                      </div>
                      {autocompleteSuggestions.map((suggestion, idx) => {
                        const isSelected = idx === activeSuggestionIdx;
                        const activeBg = 
                          selectedLanguage === "zeta" ? "bg-cyan-600 text-white" :
                          selectedLanguage === "xylor" ? "bg-emerald-600 text-white" :
                          "bg-purple-600 text-white";
                        return (
                          <button
                            key={suggestion}
                            onClick={() => insertSuggestion(suggestion)}
                            className={`w-full text-left font-mono text-[10px] px-2 py-1 rounded transition-colors flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? `${activeBg}`
                                : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                            }`}
                          >
                            <span>{suggestion}</span>
                            {ALIEN_KEYWORDS[selectedLanguage]?.includes(suggestion) && (
                              <span className="text-[6px] font-bold text-zinc-450 uppercase tracking-widest bg-zinc-900/60 px-1 py-0.5 rounded border border-zinc-800">
                                DIALECT
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Code Minimap */}
                <div 
                  className="hidden md:flex w-16 bg-zinc-950/80 border-l border-zinc-900 h-[300px] relative select-none flex-col justify-start py-2 overflow-hidden shrink-0"
                  id="editor-minimap"
                  onClick={handleMinimapClick}
                  ref={minimapContainerRef}
                >
                  {/* Miniature representations of text lines */}
                  <div className="flex-1 flex flex-col gap-[1px] opacity-60 px-1 pointer-events-none">
                    {lines.slice(0, 100).map((lineText, idx) => {
                      let colorClass = "text-zinc-700";
                      const trimmed = lineText.trim();
                      if (trimmed.startsWith("//")) colorClass = "text-zinc-800";
                      else if (trimmed.includes("TESS_LOOP") || trimmed.includes("SPORE_BLOOM") || trimmed.includes("TEMPORAL_WORMHOLE")) {
                        colorClass = selectedLanguage === "zeta" ? "text-cyan-500" : selectedLanguage === "xylor" ? "text-emerald-500" : "text-purple-500";
                      } else if (trimmed.includes("function") || trimmed.includes("const") || trimmed.includes("let")) {
                        colorClass = "text-amber-500";
                      } else if (trimmed.includes("PSI_PROJECTION") || trimmed.includes("ENZYME_SECRETION") || trimmed.includes("CHRONICLE_ECHO")) {
                        colorClass = "text-blue-400";
                      }

                      return (
                        <div 
                          key={idx} 
                          className={`font-mono text-[4px] leading-[3px] truncate ${colorClass}`} 
                        >
                          {lineText.substring(0, 20)}
                        </div>
                      );
                    })}
                  </div>

                  {/* Scroll Thumb highlighting current position */}
                  <div 
                    className="absolute left-0 right-0 bg-white/10 border-t border-b border-white/20 pointer-events-none transition-all duration-75"
                    style={{
                      top: `${minimapThumbTop}px`,
                      height: `${minimapThumbHeight}px`
                    }}
                  />
                </div>
              </div>

              {/* Real-time Character and Word Count Status Bar */}
                <div className="bg-zinc-950/90 border-t border-zinc-900 px-4 py-2 flex flex-col sm:flex-row justify-between items-center text-[10px] text-zinc-400 font-mono gap-2 relative z-20 select-none">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                      <span className="uppercase text-zinc-500 font-semibold text-[8px] tracking-wider">DIALECT:</span>
                      <strong className="text-zinc-200 uppercase">{selectedLanguage}</strong>
                    </span>
                    <span className="text-zinc-800">|</span>
                    <span>
                      <span className="text-zinc-500 font-semibold uppercase text-[8px] tracking-wider">CHARS:</span> <strong className="text-zinc-350">{activeCode.length}</strong>
                    </span>
                    <span className="text-zinc-800">|</span>
                    <span>
                      <span className="text-zinc-500 font-semibold uppercase text-[8px] tracking-wider">WORDS:</span> <strong className="text-zinc-350">{activeCode.trim() === "" ? 0 : activeCode.trim().split(/\s+/).length}</strong>
                    </span>
                    <span className="text-zinc-800">|</span>
                    <span>
                      <span className="text-zinc-500 font-semibold uppercase text-[8px] tracking-wider">COMPLEXITY:</span> <strong className="text-zinc-350">{lines.length}</strong> lines
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {editorVisualTheme === "dark_void" && lowLightMode !== "normal" && (
                      <span className="text-amber-500 font-bold uppercase text-[9px] animate-pulse flex items-center gap-1">
                        ⚠️ Low-Light: {lowLightMode === "dimmed" ? "DIMMED" : "AMBER FILTER"}
                      </span>
                    )}
                    <button
                      onClick={() => setIsShortcutModalOpen(true)}
                      className="text-zinc-500 hover:text-zinc-300 transition-colors uppercase font-semibold text-[9px] flex items-center gap-1 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-zinc-600" />
                      <span>Shortcuts (Ctrl+/)</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Real-time QASM-Lint Feature */}
              {(() => {
                const qasmIssues = performQasmLint(activeCode);
                const hasQasmKeywords = activeCode.includes("OPENQASM") || activeCode.includes("qreg") || activeCode.includes("creg") || activeCode.includes("include \"qelib1.inc\"");
                
                return (
                  <div className="mt-3 bg-zinc-950/45 border border-zinc-900 rounded-xl p-3 font-mono text-xs" id="qasm-lint-dashboard">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-2">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className={`w-4 h-4 ${!hasQasmKeywords ? "text-zinc-500" : qasmIssues.length === 0 ? "text-emerald-400" : "text-rose-400"}`} />
                        <span className="text-[10px] uppercase font-bold text-zinc-300 tracking-wider">QASM-Lint Static Analyzer</span>
                      </div>
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded border ${
                        !hasQasmKeywords 
                          ? "text-zinc-500 bg-zinc-950/40 border-zinc-900/60" 
                          : qasmIssues.length === 0 
                          ? "text-emerald-400 bg-emerald-950/20 border-emerald-500/20" 
                          : "text-rose-400 bg-rose-950/20 border-rose-500/20"
                      }`}>
                        {!hasQasmKeywords 
                          ? "DIALECT ACTIVE" 
                          : qasmIssues.length === 0 
                          ? "COMPATIBLE" 
                          : `${qasmIssues.filter(x => x.severity === 'error').length} ERRORS / ${qasmIssues.filter(x => x.severity === 'warning').length} WARNINGS`}
                      </span>
                    </div>

                    {!hasQasmKeywords ? (
                      <div className="text-[10px] text-zinc-500 leading-relaxed py-1">
                        Dialect Mode Active. QASM-Lint is idle. To check quantum formatting, write QASM headers or click <span className="text-zinc-350 font-bold">"Export QASM"</span> in the header to view or download a compliant quantum compilation template.
                      </div>
                    ) : qasmIssues.length === 0 ? (
                      <div className="text-[10px] text-emerald-400/90 leading-relaxed py-1 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        <span>All QASM formatting specifications are fully met! Syntactically compatible with Qiskit/OpenQASM executor.</span>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 scrollbar-thin">
                        {qasmIssues.map((issue, idx) => (
                          <div key={idx} className={`p-2 rounded-lg border text-[10px] leading-relaxed ${
                            issue.severity === 'error' 
                              ? 'bg-rose-950/10 border-rose-500/15 text-rose-300/90' 
                              : 'bg-amber-950/10 border-amber-500/15 text-amber-300/90'
                          }`}>
                            <div className="flex items-center justify-between font-bold mb-0.5">
                              <span className="uppercase tracking-wider">
                                {issue.severity === 'error' ? '🚫 Semicolon/Structural Violation' : '⚠️ Compatibility Warning'}
                              </span>
                              {issue.line && (
                                <span className="text-[9px] bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-900 text-zinc-400">
                                  Line {issue.line}
                                </span>
                              )}
                            </div>
                            <p className="font-semibold text-zinc-200">{issue.message}</p>
                            <p className="text-[9px] text-zinc-500 mt-0.5"><strong className="text-zinc-400">Suggestion:</strong> {issue.suggestion}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Translation Trigger Control Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3 pt-3 border-t border-zinc-800/60">
                <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[10px]">
                  <Info className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Translate sequentially written routines to active dialect</span>
                </div>
                <button
                  onClick={handleTranslate}
                  disabled={isTranslating || !activeCode.trim()}
                  className={`px-4 py-2 font-mono text-[11px] font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 bg-zinc-950 hover:bg-zinc-900 text-zinc-100 ${
                    showOnboarding && onboardingStep === 2
                      ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-black border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.4)]"
                      : ""
                  }`}
                  style={{ borderColor: selectedLanguage === "zeta" ? "#22d3ee50" : selectedLanguage === "xylor" ? "#34d39950" : "#c084fc50" }}
                  id="translate-btn"
                >
                  {isTranslating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>COALESCING QUANTUM STATE...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>TRANSLATE CODE TO {languageInfo.name.toUpperCase()}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quantum System Telemetry & Performance Monitor */}
            <div className="bg-zinc-950/50 border border-zinc-900/60 rounded-xl p-3 flex flex-col sm:flex-row justify-between items-center gap-3 font-mono text-[10px] text-zinc-400">
              <div className="flex items-center gap-2">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </div>
                <span>TELEMETRY DIAGNOSTICS:</span>
                <span className="text-zinc-500 uppercase">Engine Cycle Stream Online</span>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-850 px-2.5 py-1 rounded-md">
                  <span className="text-zinc-500 uppercase">Execution Cycles:</span>
                  <span className="text-emerald-400 font-extrabold text-[11px] animate-pulse">{executionCycles}</span>
                </div>

                <div className="flex items-center gap-2 text-[9px] text-zinc-500 sm:border-l sm:border-zinc-800 sm:pl-4">
                  <span className="bg-zinc-900 border border-zinc-800 px-1 py-0.5 rounded text-zinc-400">Ctrl+Enter</span> Translate
                  <span className="bg-zinc-900 border border-zinc-800 px-1 py-0.5 rounded text-zinc-400">Ctrl+S</span> Format
                </div>
              </div>
            </div>

            {/* AI Custom Project Prompt Builder */}
            <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-zinc-300 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
                <BrainCircuit className="w-4 h-4 text-zinc-400" />
                <span>Ask Gemini to construct a custom Alien software module</span>
              </div>
              <p className="font-mono text-[10px] text-zinc-500 mb-3 leading-normal">
                Input a core prompt (e.g. "Calculate gravity vectors near a black hole core") to construct a complete multidimensional program.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promptValue}
                  onChange={(e) => setPromptValue(e.target.value)}
                  placeholder="e.g. 'Harvest energy from red giant stars' or 'Bioluminescent spore tracking regulator'..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-800"
                  id="project-prompt-input"
                />
                <button
                  onClick={handleGenerateProject}
                  disabled={isGeneratingProject || !promptValue.trim()}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-800 rounded-lg text-xs font-mono transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5 shrink-0"
                  id="generate-project-btn"
                >
                  {isGeneratingProject ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>GENERATING SYSTEM...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
                      <span>Generate Project</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Simulation Monitor & Zorblax Advisor (Span 5) */}
          <div className="lg:col-span-5 space-y-6 flex flex-col">
            {/* Terminal Simulation Monitor */}
            <div className="flex-1">
              <TerminalSimulation
                language={selectedLanguage}
                simulationResult={simulationResult}
                isSimulating={isSimulating}
                onSimulate={handleSimulate}
                langColorClass={getLanguageColor()}
                highlighted={showOnboarding && onboardingStep === 3}
                activeCode={activeCode}
              />
            </div>

            {/* Zorblax Chat Companion */}
            <div>
              <ZorblaxChat
                language={languageInfo.name}
                onCodeSuggestion={handleApplyZorblaxCode}
              />
            </div>
          </div>
        </div>

        {/* 3. Specs Panel & Training Missions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dialect Spec Docs */}
          <div>
            <DocumentationPanel 
              languageInfo={languageInfo} 
              activeCode={activeCode} 
              highlighted={showOnboarding && onboardingStep === 4}
            />
          </div>

          {/* Training Missions Academy */}
          <div>
            <PuzzlePanel
              puzzles={PUZZLES}
              onSelectPuzzle={handleSelectPuzzle}
              activePuzzleId={activePuzzleId}
              langColorClass={getLanguageColor()}
            />
          </div>
        </div>
      </div>
    ) : activeWorkspaceTab === "altered" ? (
      /* Altered Target (Quantum Encryption Suite) View Contents */
      <div className="space-y-6 animate-fade-in" id="altered-target-workspace">
        
        {/* Header Info Panel */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-rose-400 animate-pulse" />
              <h2 className="font-mono text-sm font-bold text-zinc-100 tracking-wider uppercase">
                Altered Target Matrix (Quantum Defense Suite)
              </h2>
            </div>
            <p className="text-[11px] font-mono text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Analyze and encrypt sensitive navigation and subspace telemetry algorithms using post-quantum Ring-LWE (Learning With Errors) lattice polynomial cryptography. Alter compile targets to resist quantum decryption.
            </p>
          </div>
          
          {/* Status indicators */}
          <div className="flex items-center gap-2.5 font-mono text-[10px] bg-zinc-950 p-2 rounded-xl border border-zinc-900 shrink-0">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-rose-400 font-bold uppercase">SECURE LATTICE NODE</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Cryptographic Polynomial Suite (Span 8) */}
          <div className="lg:col-span-8 flex flex-col">
            <QuantumEncryptionSuite
              activeCode={activeCode}
              selectedLanguage={selectedLanguage}
            />
          </div>

          {/* Right Column: Security Matrix & Threat Assessment Control Center (Span 4) */}
          <div className="lg:col-span-4 space-y-6 flex flex-col">
            
            {/* Threat Mitigation Stats */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 font-mono text-xs flex flex-col justify-between h-[230px]">
              <div>
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-900/60 mb-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-[10px] text-zinc-300 uppercase tracking-wider">Lattice Defense Parameter</span>
                </div>
                
                <div className="space-y-2.5">
                  <div className="bg-zinc-950/60 p-2 rounded-lg border border-zinc-900/60 flex justify-between items-center">
                    <span className="text-[9px] text-zinc-500 uppercase">Defense Method:</span>
                    <span className="text-[10px] text-zinc-300 font-bold">Ring-LWE (N=256)</span>
                  </div>
                  
                  <div className="bg-zinc-950/60 p-2 rounded-lg border border-zinc-900/60 flex justify-between items-center">
                    <span className="text-[9px] text-zinc-500 uppercase">Quantum Attack Resistance:</span>
                    <span className="text-[10px] text-emerald-400 font-bold">Immunity Verified</span>
                  </div>

                  <div className="bg-zinc-950/60 p-2 rounded-lg border border-zinc-900/60 flex justify-between items-center">
                    <span className="text-[9px] text-zinc-500 uppercase">Gaussian Noise σ:</span>
                    <span className="text-[10px] text-zinc-300 font-bold">3.2 Standard</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-900">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-zinc-500 uppercase">DEFENSE MATRIX STATE:</span>
                  <span className="text-emerald-400 font-bold">100% SECURE</span>
                </div>
                <div className="w-full bg-zinc-900 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-400 h-full w-full rounded-full animate-pulse" />
                </div>
              </div>
            </div>

            {/* Advanced Threat Decrypter Simulation log */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 font-mono flex flex-col h-[230px]">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-900/60 mb-2.5">
                <Lock className="w-4 h-4 text-rose-400 animate-pulse" />
                <span className="font-bold text-[10px] text-zinc-300 uppercase tracking-wider">Quantum Intercept Logs</span>
              </div>
              
              <div className="flex-1 overflow-y-auto text-[9px] text-zinc-500 space-y-1.5 leading-normal pr-1 scrollbar-thin">
                <p className="text-zinc-600">[13:14:02 UTC] SYSTEM NODE RE-ALIGNED SUB-CORRIDOR 4</p>
                <p className="text-rose-400/80">» ALERT: BRUTE-FORCE PROBE ATTEMPT DETECTED BY OUTPOST-DELTA</p>
                <p className="text-zinc-500">» RESOLVING POLYNOMIAL RING EQUATIONS FOR CLEARTEXT MATRIX</p>
                <p className="text-emerald-400/80">» SUCCESS: ENCRYPTED WITH MODULUS Q=12289. EXPENDED NOISE ERROR VECTOR</p>
                <p className="text-zinc-500">» GENERATING HEURISTIC DECRYPTION KEY FROM SUPERPOSITION MATRIX</p>
                <p className="text-zinc-500">» SYNCING CORRIDORS FOR DIALECT: {selectedLanguage.toUpperCase()}</p>
                <p className="text-zinc-600">[13:16:45 UTC] LATTICE MATRIX RE-CALIBRATED SUCCESSFULLY</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    ) : (
      /* Dialect Converter View Contents */
      <div className="space-y-6 animate-fade-in" id="dialect-converter-workspace">
        {/* Header Panel */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Shuffle className="w-5 h-5 text-purple-400 animate-pulse" />
              <h2 className="font-mono text-sm font-bold text-zinc-100 tracking-wider uppercase">
                Multiverse Dialect Converter Core
              </h2>
            </div>
            <p className="text-[11px] font-mono text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Translate a single human or JavaScript algorithm simultaneously into Zeta-6, Xylor, and Gorgon alien dialects. Inspect syntax rules, structures, and run times in a real-time side-by-side comparison matrix.
            </p>
          </div>
          
          <button
            onClick={() => {
              if (activeCode.trim()) {
                setConverterInput(activeCode);
              }
            }}
            disabled={!activeCode.trim()}
            className="px-3.5 py-1.5 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-900 hover:border-zinc-800 rounded-xl text-[10px] font-mono font-bold transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Import Editor Buffer</span>
          </button>
        </div>

        {/* Input Pane & Action Control */}
        <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl flex flex-col gap-3 font-mono">
          <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
            <span>Primitive Human Logic Input (Pseudocode / JS)</span>
            <span className="text-[8px] text-zinc-650">Source Buffer Ready</span>
          </div>
          
          <textarea
            value={converterInput}
            onChange={(e) => setConverterInput(e.target.value)}
            placeholder="Type pseudocode or JavaScript to translate..."
            className="w-full h-[120px] bg-zinc-900/40 border border-zinc-850 p-3 rounded-lg text-zinc-100 placeholder-zinc-700 text-xs focus:outline-none focus:border-purple-900 focus:ring-1 focus:ring-purple-950 resize-none font-mono"
            spellCheck="false"
          />

          <div className="flex justify-end">
            <button
              onClick={handleConvertSimultaneous}
              disabled={isConvertingAll || !converterInput.trim()}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white border border-purple-500 hover:border-purple-400 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]"
            >
              {isConvertingAll ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>SYNCHRONIZING COSMIC DIALECTS...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>CONVERT SIMULTANEOUSLY</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Split Panes Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Zeta-6 Panel */}
          <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-4 flex flex-col h-[400px] hover:border-cyan-500/20 transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-900/80 mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)] animate-pulse" />
                <span className="font-mono text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Zeta-6 Geometric</span>
              </div>
              <span className="font-mono text-[8px] bg-cyan-950/40 text-cyan-400 border border-cyan-950 px-2 py-0.5 rounded-md uppercase font-bold">TELEPATHIC</span>
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-3 leading-relaxed scrollbar-thin pr-1">
              {converterResults.zeta ? (
                <>
                  <div className="bg-zinc-950/60 border border-zinc-900/60 p-3 rounded-lg overflow-x-auto whitespace-pre font-mono text-[10px] text-cyan-200">
                    {converterResults.zeta.alienCode}
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="block text-[8px] text-zinc-500 uppercase font-extrabold tracking-wider">Dialect Explanation:</span>
                      <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">{converterResults.zeta.explanation}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="bg-zinc-950/40 border border-zinc-900/45 p-1.5 rounded text-[8px]">
                        <span className="block text-zinc-500 uppercase font-bold">Rating</span>
                        <span className="text-cyan-400 font-extrabold block mt-0.5 truncate">{converterResults.zeta.efficiencyRating}</span>
                      </div>
                      <div className="bg-zinc-950/40 border border-zinc-900/45 p-1.5 rounded text-[8px]">
                        <span className="block text-zinc-500 uppercase font-bold">Warnings</span>
                        <span className="text-rose-400/80 font-bold block mt-0.5 truncate">{converterResults.zeta.warnings?.[0] || "None detected."}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-10 text-zinc-600 gap-2">
                  <Terminal className="w-8 h-8 text-zinc-700 animate-pulse" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Awaiting translation stream...</span>
                </div>
              )}
            </div>
          </div>

          {/* Xylor Panel */}
          <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-4 flex flex-col h-[400px] hover:border-emerald-500/20 transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-900/80 mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
                <span className="font-mono text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Xylor Mycelial</span>
              </div>
              <span className="font-mono text-[8px] bg-emerald-950/40 text-emerald-400 border border-emerald-950 px-2 py-0.5 rounded-md uppercase font-bold">BIO-ORGANIC</span>
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-3 leading-relaxed scrollbar-thin pr-1">
              {converterResults.xylor ? (
                <>
                  <div className="bg-zinc-950/60 border border-zinc-900/60 p-3 rounded-lg overflow-x-auto whitespace-pre font-mono text-[10px] text-emerald-200">
                    {converterResults.xylor.alienCode}
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="block text-[8px] text-zinc-500 uppercase font-extrabold tracking-wider">Colony Mechanics:</span>
                      <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">{converterResults.xylor.explanation}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="bg-zinc-950/40 border border-zinc-900/45 p-1.5 rounded text-[8px]">
                        <span className="block text-zinc-500 uppercase font-bold">Rating</span>
                        <span className="text-emerald-400 font-extrabold block mt-0.5 truncate">{converterResults.xylor.efficiencyRating}</span>
                      </div>
                      <div className="bg-zinc-950/40 border border-zinc-900/45 p-1.5 rounded text-[8px]">
                        <span className="block text-zinc-500 uppercase font-bold">Warnings</span>
                        <span className="text-rose-400/80 font-bold block mt-0.5 truncate">{converterResults.xylor.warnings?.[0] || "None detected."}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-10 text-zinc-600 gap-2">
                  <Terminal className="w-8 h-8 text-zinc-700 animate-pulse" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Awaiting translation stream...</span>
                </div>
              )}
            </div>
          </div>

          {/* Gorgon Panel */}
          <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-4 flex flex-col h-[400px] hover:border-purple-500/20 transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-900/80 mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)] animate-pulse" />
                <span className="font-mono text-[11px] font-bold text-purple-400 uppercase tracking-wider">Gorgon Temporal</span>
              </div>
              <span className="font-mono text-[8px] bg-purple-950/40 text-purple-400 border border-purple-950 px-2 py-0.5 rounded-md uppercase font-bold">CHRONO-WARP</span>
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-3 leading-relaxed scrollbar-thin pr-1">
              {converterResults.gorgon ? (
                <>
                  <div className="bg-zinc-950/60 border border-zinc-900/60 p-3 rounded-lg overflow-x-auto whitespace-pre font-mono text-[10px] text-purple-200">
                    {converterResults.gorgon.alienCode}
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="block text-[8px] text-zinc-500 uppercase font-extrabold tracking-wider">Timeline Chronology:</span>
                      <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">{converterResults.gorgon.explanation}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="bg-zinc-950/40 border border-zinc-900/45 p-1.5 rounded text-[8px]">
                        <span className="block text-zinc-500 uppercase font-bold">Rating</span>
                        <span className="text-purple-400 font-extrabold block mt-0.5 truncate">{converterResults.gorgon.efficiencyRating}</span>
                      </div>
                      <div className="bg-zinc-950/40 border border-zinc-900/45 p-1.5 rounded text-[8px]">
                        <span className="block text-zinc-500 uppercase font-bold">Warnings</span>
                        <span className="text-rose-400/80 font-bold block mt-0.5 truncate">{converterResults.gorgon.warnings?.[0] || "None detected."}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-10 text-zinc-600 gap-2">
                  <Terminal className="w-8 h-8 text-zinc-700 animate-pulse" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Awaiting translation stream...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
  </main>
</div>
</div>

      {/* Footer */}
      <footer className="border-t border-zinc-900/60 bg-zinc-950 p-4 mt-8 font-mono text-[10px] text-zinc-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>© 2026 Sector-7 Spacecraft Navigation Subsystem Core.</span>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setOnboardingStep(0);
                setShowOnboarding(true);
              }}
              className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer mr-3"
            >
              Restart Tour
            </button>
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mr-1" />
            <span>Telemetry Link Stable. Logged in as: {localStorage.getItem("user_email") || "kmr360@gmail.com"}</span>
          </div>
        </div>
      </footer>

      {/* Onboarding Dialog Walkthrough */}
      {showOnboarding && (
        <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-96 bg-zinc-950/95 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-5 shadow-[0_0_30px_rgba(34,211,238,0.2)] z-[999] animate-bounce font-mono">
          <div className="flex items-start justify-between gap-3 mb-3 pb-2 border-b border-zinc-900">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <HelpCircle className="w-4 h-4 animate-pulse text-cyan-400" />
              <span className="text-[10px] font-bold tracking-widest uppercase">TRAINING SIM TOUR</span>
            </div>
            <button
              onClick={() => {
                setShowOnboarding(false);
                localStorage.setItem("alien_onboarding_completed_v1", "true");
              }}
              className="p-0.5 hover:bg-zinc-900 rounded text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              title="Skip Tour"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <h4 className="text-zinc-100 text-xs font-bold uppercase tracking-wider">
              {ONBOARDING_STEPS[onboardingStep].title}
            </h4>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              {ONBOARDING_STEPS[onboardingStep].description}
            </p>

            <div className="flex items-center justify-between pt-3 mt-1 border-t border-zinc-900/60">
              <div className="flex items-center gap-1">
                {ONBOARDING_STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      onboardingStep === i ? "w-4 bg-cyan-400" : "w-1.5 bg-zinc-800"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {onboardingStep > 0 && (
                  <button
                    onClick={() => setOnboardingStep((prev) => prev - 1)}
                    className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-zinc-200 transition-colors text-[10px] font-bold cursor-pointer"
                  >
                    Back
                  </button>
                )}
                {onboardingStep < ONBOARDING_STEPS.length - 1 ? (
                  <button
                    onClick={() => setOnboardingStep((prev) => prev + 1)}
                    className="px-3 py-1 rounded bg-cyan-950 border border-cyan-900 text-cyan-400 hover:text-cyan-200 transition-colors text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    Next <ChevronRight className="w-3 h-3" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowOnboarding(false);
                      localStorage.setItem("alien_onboarding_completed_v1", "true");
                    }}
                    className="px-3 py-1 rounded bg-emerald-950 border border-emerald-900 text-emerald-400 hover:text-emerald-200 transition-colors text-[10px] font-bold cursor-pointer"
                  >
                    Acknowledge & Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subspace Routine Distribution (Share) Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fade-in font-mono">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-xl flex flex-col max-h-[90vh] shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4 bg-zinc-950">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-amber-500 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
                    Subspace Routine Distribution Node
                  </h3>
                  <p className="text-[10px] text-zinc-500 uppercase mt-0.5">
                    Broadcast encrypted routine keys and formatted cards to fleet crew members
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
              
              {/* Part 1: Public Share Link */}
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold">
                  🛸 Subspace Distribution URL (Crew Communication Link)
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={generatedShareUrl}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none font-mono selection:bg-zinc-800 selection:text-zinc-100"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedShareUrl);
                      setShareCopied(true);
                      setTimeout(() => setShareCopied(false), 2000);
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                      shareCopied 
                        ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-400" 
                        : "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {shareCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied Link!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[9px] text-zinc-600 leading-normal uppercase">
                  This public URL is embedded with a unique encrypted hash that automatically decrypts and loads your active editor registers when another crew member loads it in their terminal simulator.
                </p>
              </div>

              {/* Part 2: High-Contrast Snippet Card */}
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold">
                  💾 Formatted Routine Snippet Card (Terminal Copy)
                </label>
                
                {/* The Sci-Fi Routine Card container */}
                <div className={`p-4 rounded-xl border relative overflow-hidden flex flex-col gap-3 transition-colors duration-300 ${
                  selectedLanguage === "zeta" 
                    ? "bg-[#020b12] border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]" 
                    : selectedLanguage === "xylor" 
                      ? "bg-[#010c05] border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]" 
                      : "bg-[#0b0213] border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                }`}>
                  {/* Decorative card grid overlay lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                  
                  {/* Card Header */}
                  <div className="flex justify-between items-start border-b border-zinc-800/60 pb-2 relative z-10">
                    <div>
                      <span className={`text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded uppercase ${
                        selectedLanguage === "zeta" 
                          ? "bg-cyan-950/40 text-cyan-400 border border-cyan-500/20" 
                          : selectedLanguage === "xylor" 
                            ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20" 
                            : "bg-purple-950/40 text-purple-400 border border-purple-500/20"
                      }`}>
                        {selectedLanguage === "zeta" ? "ZETA DIALECT" : selectedLanguage === "xylor" ? "XYLOR DIALECT" : "GORGON DIALECT"}
                      </span>
                      <h4 className="text-xs font-bold text-zinc-100 mt-2 tracking-wide uppercase">
                        {sharedRoutineName}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-zinc-500 uppercase block font-bold">REGISTRY KEY</span>
                      <span className="text-[10px] text-amber-400 font-bold font-mono">#{sharedRoutineId}</span>
                    </div>
                  </div>

                  {/* Card Metadata Section */}
                  <div className="grid grid-cols-2 gap-2 bg-zinc-950/60 border border-zinc-900 rounded p-2 text-[8px] text-zinc-500 uppercase font-mono relative z-10">
                    <div>
                      <span className="block text-zinc-650">TRANSMISSION: SECURE SUBSPACE</span>
                      <span className="block text-zinc-650 mt-0.5">CREW ID: COGNITIVE TRANSCEIVER</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-zinc-650">TIMESTAMP: {new Date().toLocaleDateString()}</span>
                      <span className="block text-zinc-650 mt-0.5">INTEGRITY: PARITY VALIDATED</span>
                    </div>
                  </div>

                  {/* Card Code Preview container */}
                  <div className="bg-black/95 border border-zinc-900 rounded-lg p-3 max-h-40 overflow-y-auto text-[10px] leading-relaxed text-zinc-300 font-mono relative z-10 select-all whitespace-pre-wrap break-all">
                    {activeCode}
                  </div>
                  
                  {/* Bottom branding footer */}
                  <div className="flex justify-between items-center text-[7px] text-zinc-600 uppercase font-bold tracking-widest relative z-10 pt-1 border-t border-zinc-900/40">
                    <span>COSMIC SHIELD VERIFIED</span>
                    <span>CREW COMPLIANT v3.5</span>
                  </div>
                </div>

                {/* Card copy and library actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const cardText = `🛸 SUBSPACE ALIEN ROUTINE CARD 🛸
=================================
DIALECT: ${selectedLanguage.toUpperCase()}
ROUTINE NAME: ${sharedRoutineName}
REGISTRY KEY: #${sharedRoutineId}
TIMESTAMP: ${new Date().toLocaleString()}
---------------------------------
CODE INSTANCE BUFFER:
${activeCode}
---------------------------------
Cosmic Parity Validated · Fleet Compliant`;
                      navigator.clipboard.writeText(cardText);
                      setShareCardCopied(true);
                      setTimeout(() => setShareCardCopied(false), 2000);
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      shareCardCopied 
                        ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-400" 
                        : "bg-zinc-900 border-zinc-800 hover:bg-zinc-850 text-zinc-300"
                    }`}
                  >
                    {shareCardCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Card Text Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Copy Card as Text Snippet</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      const exists = savedSnippets.some(s => s.code === activeCode);
                      if (exists) return;
                      
                      const newSnippet = {
                        id: `sn-shared-${sharedRoutineId}`,
                        title: sharedRoutineName,
                        dialect: selectedLanguage,
                        description: `Subspace shared routine pinned to registry.`,
                        code: activeCode
                      };
                      setSavedSnippets(prev => [newSnippet, ...prev]);
                      setIsShareModalOpen(false);
                    }}
                    className="px-4 py-1.5 text-xs font-bold rounded-lg border border-cyan-800/40 bg-cyan-950/20 text-cyan-400 hover:bg-cyan-950/30 hover:border-cyan-700/50 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Pin to Local Snippets</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-zinc-900 bg-zinc-950 font-mono">
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="px-4 py-1.5 border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Close Distribution
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Snippet Library Modal */}
      {isSnippetLibraryOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fade-in font-mono">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh] shadow-[0_0_50px_rgba(34,211,238,0.15)] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4 bg-zinc-950">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
                    Alien Code Snippet Registry
                  </h3>
                  <p className="text-[10px] text-zinc-500 uppercase mt-0.5">
                    Save, search and reuse common space algorithms and resonance hooks
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsSnippetLibraryOpen(false)}
                className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-zinc-200 cursor-pointer animate-fade-in"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
              
              {/* Predefined / Saved Snippets List */}
              <div className="space-y-3">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block border-b border-zinc-900 pb-1">
                  Registered Snippet Keys ({savedSnippets.length})
                </span>
                
                <div className="grid grid-cols-1 gap-3">
                  {savedSnippets.map((snippet) => {
                    const isCurrentDialect = snippet.dialect === selectedLanguage;
                    const dialectColors = 
                      snippet.dialect === "zeta" ? "text-cyan-400 border-cyan-500/20 bg-cyan-950/10" :
                      snippet.dialect === "xylor" ? "text-emerald-400 border-emerald-500/20 bg-emerald-950/10" :
                      "text-purple-400 border-purple-500/20 bg-purple-950/10";

                    return (
                      <div 
                        key={snippet.id} 
                        className={`border rounded-xl p-3 bg-zinc-950/50 flex flex-col md:flex-row justify-between gap-4 transition-all duration-200 hover:border-zinc-700/60`}
                        style={{ borderLeft: `4px solid ${snippet.dialect === "zeta" ? "#22d3ee" : snippet.dialect === "xylor" ? "#34d399" : "#c084fc"}` }}
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-zinc-200 uppercase">{snippet.title}</span>
                            <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${dialectColors}`}>
                              {snippet.dialect}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 leading-relaxed">{snippet.description}</p>
                          <pre className="mt-2 bg-zinc-950 p-2 rounded text-[10px] text-zinc-400 overflow-x-auto border border-zinc-900 leading-normal max-h-24">
                            {snippet.code}
                          </pre>
                        </div>

                        <div className="flex flex-row md:flex-col gap-2 shrink-0 justify-end md:justify-start items-center md:items-end">
                          <button
                            onClick={() => {
                              setSelectedLanguage(snippet.dialect);
                              setActiveCode(snippet.code);
                              setActiveProject(null);
                              setActivePuzzleId(null);
                              setIsSnippetLibraryOpen(false);
                            }}
                            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded-lg text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-colors"
                          >
                            Load Core
                          </button>
                          
                          <button
                            onClick={() => {
                              setSavedSnippets(prev => prev.filter(s => s.id !== snippet.id));
                            }}
                            className="p-1.5 hover:bg-red-950/30 text-zinc-600 hover:text-red-400 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-red-500/10"
                            title="Delete custom snippet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Save Current Code Area */}
              <div className="border-t border-zinc-900 pt-4 space-y-3">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">
                  Archive current workspace code as snippet
                </span>

                <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[8px] text-zinc-500 uppercase tracking-wider block">Snippet Title:</label>
                      <input 
                        type="text" 
                        value={newSnippetTitle}
                        onChange={(e) => setNewSnippetTitle(e.target.value)}
                        placeholder="e.g. Spore Multiplication Cascade"
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] text-zinc-500 uppercase tracking-wider block">Snippet Dialect:</label>
                      <select
                        value={newSnippetDialect}
                        onChange={(e) => setNewSnippetDialect(e.target.value as Language)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/30 uppercase cursor-pointer"
                      >
                        <option value="zeta">Zeta Dialect</option>
                        <option value="xylor">Xylor Dialect</option>
                        <option value="gorgon">Gorgon Dialect</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] text-zinc-500 uppercase tracking-wider block">Brief Description:</label>
                    <input 
                      type="text" 
                      value={newSnippetDesc}
                      onChange={(e) => setNewSnippetDesc(e.target.value)}
                      placeholder="Explain what this logic sequence triggers..."
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/30"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[8px] text-zinc-600">
                      Code size: {activeCode.length} bytes to be registered.
                    </span>
                    <button
                      onClick={() => {
                        if (!newSnippetTitle.trim()) return;
                        const newSnap = {
                          id: "sn-" + Date.now(),
                          title: newSnippetTitle,
                          dialect: newSnippetDialect,
                          description: newSnippetDesc || "User defined custom alien module snippet.",
                          code: activeCode
                        };
                        setSavedSnippets(prev => [newSnap, ...prev]);
                        setNewSnippetTitle("");
                        setNewSnippetDesc("");
                      }}
                      disabled={!newSnippetTitle.trim() || !activeCode.trim()}
                      className="px-3.5 py-1.5 bg-cyan-950 border border-cyan-900 hover:border-cyan-500/40 text-cyan-400 rounded-lg text-[10px] uppercase font-bold tracking-wider cursor-pointer disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Archive Snippet</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-zinc-950/80 px-5 py-3 border-t border-zinc-900 flex justify-end">
              <button 
                onClick={() => setIsSnippetLibraryOpen(false)}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 rounded-lg text-[10px] uppercase font-bold tracking-wider cursor-pointer"
              >
                Close Library
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Reference Modal */}
      {isShortcutModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fade-in font-mono">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg flex flex-col shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4 bg-zinc-950">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
                    Galactic Keybindings Reference
                  </h3>
                  <p className="text-[10px] text-zinc-500 uppercase mt-0.5">
                    Navigate the workspace at warp speed with native cockpit shortcuts
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsShortcutModalOpen(false)}
                className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block border-b border-zinc-900 pb-1">
                Workspace Commands
              </span>

              <div className="grid grid-cols-1 gap-3.5">
                {/* Translate */}
                <div className="flex items-center justify-between bg-zinc-950/50 border border-zinc-900 rounded-xl p-3 hover:border-zinc-800 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-cyan-950/40 rounded-lg border border-cyan-500/10">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-zinc-200 block">Translate & Run</span>
                      <span className="text-[9px] text-zinc-500 block uppercase">Compile active editor buffer</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <kbd className="bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-300 font-bold text-[10px] shadow-[0_1.5px_0_#27272a]">Ctrl</kbd>
                    <span className="text-zinc-600 text-xs">+</span>
                    <kbd className="bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-300 font-bold text-[10px] shadow-[0_1.5px_0_#27272a]">Enter</kbd>
                  </div>
                </div>

                {/* Format */}
                <div className="flex items-center justify-between bg-zinc-950/50 border border-zinc-900 rounded-xl p-3 hover:border-zinc-800 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-amber-950/40 rounded-lg border border-amber-500/10">
                      <Wand2 className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-zinc-200 block">Auto-Format Code</span>
                      <span className="text-[9px] text-zinc-500 block uppercase">Standardize spacing & dialect casing</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <kbd className="bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-300 font-bold text-[10px] shadow-[0_1.5px_0_#27272a]">Ctrl</kbd>
                    <span className="text-zinc-600 text-xs">+</span>
                    <kbd className="bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-300 font-bold text-[10px] shadow-[0_1.5px_0_#27272a]">S</kbd>
                  </div>
                </div>

                {/* Shortcuts */}
                <div className="flex items-center justify-between bg-zinc-950/50 border border-zinc-900 rounded-xl p-3 hover:border-zinc-800 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-purple-950/40 rounded-lg border border-purple-500/10">
                      <Keyboard className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-zinc-200 block">Bindings Reference</span>
                      <span className="text-[9px] text-zinc-500 block uppercase">Toggle this cockpit help modal</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <kbd className="bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-300 font-bold text-[10px] shadow-[0_1.5px_0_#27272a]">Ctrl</kbd>
                    <span className="text-zinc-600 text-xs">+</span>
                    <kbd className="bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-300 font-bold text-[10px] shadow-[0_1.5px_0_#27272a]">/</kbd>
                  </div>
                </div>

                {/* Dismiss modals */}
                <div className="flex items-center justify-between bg-zinc-950/50 border border-zinc-900 rounded-xl p-3 hover:border-zinc-800 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-zinc-900/40 rounded-lg border border-zinc-800/10">
                      <X className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-zinc-200 block">Close Menus & Modals</span>
                      <span className="text-[9px] text-zinc-500 block uppercase">Dismiss dialogs or autocomplete</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <kbd className="bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-300 font-bold text-[10px] shadow-[0_1.5px_0_#27272a]">Esc</kbd>
                  </div>
                </div>
              </div>

              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block border-b border-zinc-900 pt-2 pb-1">
                High-Speed Autocomplete Suggestions
              </span>

              <div className="grid grid-cols-1 gap-2 text-[10px] text-zinc-400 pl-1 space-y-1">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-zinc-500 uppercase tracking-wider text-[8px] font-bold">Cycle Suggestions:</span>
                  <span className="flex items-center gap-1">
                    <kbd className="bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800 text-zinc-400">↑ Up Arrow</kbd>
                    <span className="text-zinc-600 font-bold">/</span>
                    <kbd className="bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800 text-zinc-400">↓ Down Arrow</kbd>
                  </span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-zinc-500 uppercase tracking-wider text-[8px] font-bold">Commit Selected suggestion:</span>
                  <span className="flex items-center gap-1">
                    <kbd className="bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-400">Enter</kbd>
                    <span className="text-zinc-600 font-bold">or</span>
                    <kbd className="bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-400">Tab</kbd>
                  </span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-zinc-500 uppercase tracking-wider text-[8px] font-bold">Dismiss suggestions:</span>
                  <span>
                    <kbd className="bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-400">Esc</kbd>
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-zinc-950/80 px-5 py-3 border-t border-zinc-900 flex justify-end">
              <button 
                onClick={() => setIsShortcutModalOpen(false)}
                className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-350 hover:text-zinc-100 rounded-lg text-[10px] uppercase font-bold tracking-wider cursor-pointer"
              >
                Clear Screen
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Floating Clipboard Copy Toast Confirmation */}
      {copied && (
        <div className="fixed bottom-6 right-6 bg-zinc-900 border border-zinc-800 text-emerald-400 px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-2xl font-mono text-xs z-[100] animate-bounce" style={{ borderLeft: '4px solid #10b981' }}>
          <Check className="w-4 h-4 animate-pulse text-emerald-400" />
          <span>CODE COPIED TO GALACTIC CLIPBOARD BUFFER!</span>
        </div>
      )}
    </div>
  );
}
