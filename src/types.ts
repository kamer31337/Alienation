export type Language = "zeta" | "xylor" | "gorgon";

export interface ProjectFile {
  filename: string;
  content: string;
  purpose: string;
}

export interface AlienProject {
  projectName: string;
  description: string;
  complexity: string;
  estimatedSlices: string;
  files: ProjectFile[];
  simulatedLogs: string[];
  isFallback?: boolean;
}

export interface TranslationResult {
  alienCode: string;
  explanation: string;
  analogies: string[];
  efficiencyRating: string;
  warnings: string[];
  isFallback?: boolean;
}

export interface SimulationMetric {
  key: string;
  value: string;
}

export interface SimulationStep {
  title: string;
  durationMs: number;
  logMessage: string;
  state: "success" | "warning" | "info" | "error";
}

export interface SimulationResult {
  success: boolean;
  compilationError: string | null;
  metrics: SimulationMetric[];
  executionSteps: SimulationStep[];
  finalOutput: string;
  isFallback?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface Puzzle {
  id: string;
  title: string;
  difficulty: "Initiate" | "Officer" | "Grandmaster";
  description: string;
  starterCode: string;
  expectedOutputHint: string;
}
