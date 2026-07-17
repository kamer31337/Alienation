import { useState, useEffect, useRef } from "react";
import { SimulationResult, SimulationStep } from "../types";
import { 
  Terminal, 
  RefreshCw, 
  Play, 
  Sparkles, 
  Monitor, 
  Activity, 
  Cpu, 
  Layers, 
  Zap, 
  Flame, 
  Compass 
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";

interface TerminalSimulationProps {
  language: string;
  simulationResult: SimulationResult | null;
  isSimulating: boolean;
  onSimulate: () => void;
  langColorClass: string;
  highlighted?: boolean;
  activeCode: string;
}

export default function TerminalSimulation({
  language,
  simulationResult,
  isSimulating,
  onSimulate,
  langColorClass,
  highlighted,
  activeCode,
}: TerminalSimulationProps) {
  const [activeSteps, setActiveSteps] = useState<SimulationStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [showFinalOutput, setShowFinalOutput] = useState<boolean>(false);
  const [tickerMetrics, setTickerMetrics] = useState<Array<{ key: string; value: string }>>([]);
  const [activeTab, setActiveTab] = useState<"logs" | "perf">("logs");
  const [hardwareTheme, setHardwareTheme] = useState<"crt" | "plasma" | "void">("crt");
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const logEndRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number | null>(null);

  // Stopwatch effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulating) {
      startTimeRef.current = Date.now();
      setElapsedTime(0);
      interval = setInterval(() => {
        if (startTimeRef.current) {
          setElapsedTime(Date.now() - startTimeRef.current);
        }
      }, 100);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSteps, showFinalOutput]);

  // When a new simulation is triggered
  useEffect(() => {
    if (isSimulating && simulationResult) {
      setActiveSteps([]);
      setCurrentStepIdx(0);
      setShowFinalOutput(false);
      setTickerMetrics([]);
      
      let stepIdx = 0;
      const steps = simulationResult.executionSteps;

      const runNextStep = () => {
        if (stepIdx < steps.length) {
          const currentStep = steps[stepIdx];
          setActiveSteps((prev) => [...prev, currentStep]);
          
          if (
            simulationResult.metrics &&
            Array.isArray(simulationResult.metrics) &&
            simulationResult.metrics[stepIdx]
          ) {
            const currentMetric = simulationResult.metrics[stepIdx];
            if (currentMetric && typeof currentMetric === "object" && "key" in currentMetric) {
              setTickerMetrics((prev) => [...prev, currentMetric]);
            }
          }

          stepIdx++;
          setCurrentStepIdx(stepIdx);

          setTimeout(runNextStep, currentStep.durationMs || 1000);
        } else {
          setShowFinalOutput(true);
        }
      };

      const timeoutId = setTimeout(runNextStep, 400);
      return () => clearTimeout(timeoutId);
    }
  }, [isSimulating, simulationResult]);

  const getStateColor = (state: string) => {
    switch (state) {
      case "success":
        return "text-emerald-400";
      case "warning":
        return "text-amber-400";
      case "error":
        return "text-red-400";
      default:
        return "text-cyan-400";
    }
  };

  const getLanguageHex = () => {
    if (language === "zeta") return "#22d3ee";
    if (language === "xylor") return "#34d399";
    return "#c084fc";
  };

  // Extract functions and routines dynamically from code for profiling
  const getProfileData = () => {
    const list: Array<{ name: string; duration: number; memory: number }> = [];
    
    // Find functions
    const funcRegex = /(?:function|subroutine|COORDINATE)\s+([a-zA-Z_]\w*)/g;
    let match;
    let index = 0;
    while ((match = funcRegex.exec(activeCode)) !== null && index < 6) {
      const name = match[1];
      if (name && !list.some(item => item.name === name)) {
        // Deterministic but random looking metrics based on characters
        const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        list.push({
          name: name + "()",
          duration: (hash % 85) + 15,
          memory: (hash % 200) + 24
        });
        index++;
      }
    }

    // Common blocks
    const alienBlocks = ["TESS_LOOP", "SPORE_BLOOM", "TEMPORAL_WORMHOLE", "QUANTUM_NODE", "RESONATE", "PSI_PROJECTION", "ENZYME_SECRETION", "TIME_WARP"];
    alienBlocks.forEach((block, idx) => {
      if (activeCode.includes(block) && list.length < 6) {
        list.push({
          name: block,
          duration: 30 + (idx * 12) + (activeCode.length % 15),
          memory: 45 + (idx * 25) + (activeCode.length % 35)
        });
      }
    });

    // Default mock profiles if none are in the code
    if (list.length === 0) {
      list.push({ name: "main_loop()", duration: 42, memory: 64 });
      list.push({ name: "quantum_sync()", duration: 18, memory: 32 });
      list.push({ name: "resonance_gate()", duration: 75, memory: 128 });
    }

    return list;
  };

  // Hardware Theme Configuration
  const getThemeStyles = () => {
    switch (hardwareTheme) {
      case "plasma":
        return {
          termBg: "bg-[#180303] border-orange-500/20",
          termText: "text-orange-400 selection:bg-orange-950 selection:text-orange-200",
          glow: "shadow-[0_0_20px_rgba(249,115,22,0.18)]",
          scanlineOpacity: "opacity-45",
          accentColor: "text-orange-500",
          borderColor: "border-orange-500/40",
          label: "Plasma Matrix Core",
          barColor1: "#f97316",
          barColor2: "#ef4444"
        };
      case "void":
        return {
          termBg: "bg-[#040108] border-purple-500/10",
          termText: "text-purple-300 selection:bg-purple-950 selection:text-purple-200",
          glow: "shadow-[0_0_10px_rgba(168,85,247,0.1)]",
          scanlineOpacity: "opacity-15",
          accentColor: "text-purple-500",
          borderColor: "border-purple-500/20",
          label: "Void Static Core",
          barColor1: "#a855f7",
          barColor2: "#ec4899"
        };
      case "crt":
      default:
        return {
          termBg: "bg-black border-emerald-500/20",
          termText: "text-emerald-400 selection:bg-emerald-950 selection:text-emerald-200",
          glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
          scanlineOpacity: "opacity-70",
          accentColor: "text-emerald-500",
          borderColor: "border-emerald-500/40",
          label: "CRT Oscilloscope v1.2",
          barColor1: "#10b981",
          barColor2: "#06b6d4"
        };
    }
  };

  const themeStyles = getThemeStyles();
  const profileData = getProfileData();

  return (
    <div 
      className={`bg-zinc-900/40 backdrop-blur-md border rounded-xl p-4 flex flex-col h-full transition-all duration-300 ${
        highlighted
          ? "border-emerald-500/80 ring-2 ring-emerald-500/60 ring-offset-4 ring-offset-black shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          : isSimulating
          ? "animate-terminal-compiling"
          : "animate-terminal-idle border-zinc-800/80"
      }`} 
      id="terminal-simulator-core"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 mb-4 border-b border-zinc-800/60 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Terminal className={`w-4 h-4 ${langColorClass}`} />
            <h3 className="font-mono text-xs font-semibold text-zinc-100 tracking-wider uppercase">
              Simulation Monitor Panel
            </h3>
            {/* Stopwatch */}
            <span className="ml-2 font-mono text-[10px] text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
              {(elapsedTime / 1000).toFixed(1)}s
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Clear Button */}
            <button
              onClick={() => {
                setActiveSteps([]);
                setCurrentStepIdx(0);
                setShowFinalOutput(false);
                setTickerMetrics([]);
                setElapsedTime(0);
              }}
              className="text-zinc-500 hover:text-red-400 transition-colors p-1.5 rounded-lg border border-zinc-800 bg-zinc-950"
              title="Clear Terminal Logs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onSimulate}
              disabled={isSimulating}
              className={`flex items-center gap-1.5 font-mono text-[10px] px-3 py-1.5 rounded-lg border bg-zinc-950 hover:bg-zinc-900 text-zinc-100 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none`}
              style={{ borderColor: getLanguageHex() + "30" }}
              id="compile-btn"
            >
            {isSimulating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>ALIGNING QUANTUM FIELDS...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
                <span>COMPILE & RUN SYSTEM</span>
              </>
            )}
          </button>
        </div>
        </div>

        {/* Dynamic Controls: Theme Swapper + View Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          {/* Hardware Theme Switcher */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">Hardware:</span>
            <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-850/80 gap-1">
              {(["crt", "plasma", "void"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setHardwareTheme(t)}
                  className={`px-2 py-0.5 rounded font-mono text-[9px] uppercase transition-all cursor-pointer ${
                    hardwareTheme === t
                      ? t === "crt"
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/25 font-bold"
                        : t === "plasma"
                        ? "bg-orange-950/40 text-orange-400 border border-orange-500/25 font-bold"
                        : "bg-purple-950/40 text-purple-400 border border-purple-500/25 font-bold"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex items-center gap-1.5 bg-zinc-950/80 p-1 rounded-lg border border-zinc-850/60 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("logs")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1 rounded-md font-mono text-[10px] uppercase transition-all cursor-pointer ${
                activeTab === "logs"
                  ? "bg-zinc-900 text-zinc-100 border border-zinc-800 font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Telemetry Logs</span>
            </button>
            <button
              onClick={() => setActiveTab("perf")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1 rounded-md font-mono text-[10px] uppercase transition-all cursor-pointer ${
                activeTab === "perf"
                  ? "bg-zinc-900 text-zinc-100 border border-zinc-800 font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Profiler Chart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4" id="sim-metrics-bar">
        {tickerMetrics.length > 0 ? (
          tickerMetrics.map((met, idx) => {
            if (!met || typeof met !== "object") return null;
            return (
              <div
                key={idx}
                className="bg-zinc-950/70 border border-zinc-800/50 p-2 rounded-lg font-mono flex flex-col justify-center animate-fade-in"
                style={{ borderLeft: `3px solid ${getLanguageHex()}` }}
              >
                <span className="text-[9px] text-zinc-500 uppercase tracking-wider">{met.key || "Metric"}</span>
                <span className="text-xs font-semibold text-zinc-100 mt-0.5">{met.value || "N/A"}</span>
              </div>
            );
          })
        ) : (
          <div className="col-span-3 py-3 text-center border border-dashed border-zinc-800/40 rounded-lg bg-zinc-950/20">
            <span className="font-mono text-[10px] text-zinc-500">
              Run compiler to stream system diagnostics parameters.
            </span>
          </div>
        )}
      </div>

      {/* MAIN CONTAINER SPACE */}
      <div className="flex-1 flex flex-col h-[320px]">
        {activeTab === "logs" ? (
          /* Terminal Console Display */
          <div
            className={`flex-1 ${themeStyles.termBg} border ${themeStyles.borderColor} rounded-xl p-4 font-mono text-[11px] leading-relaxed flex flex-col h-full relative overflow-hidden transition-all duration-300 ${themeStyles.glow}`}
            style={{ animation: "crt-flicker 0.25s infinite" }}
          >
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes crt-flicker {
                0% { opacity: 0.985; }
                50% { opacity: 1; }
                100% { opacity: 0.99; }
              }
              @keyframes scanline-move {
                0% { top: -20%; }
                100% { top: 120%; }
              }
            `}} />
            
            {/* CRT Overlays */}
            <div className={`absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] z-20 ${themeStyles.scanlineOpacity}`} />
            
            {/* Moving scanline bar */}
            <div 
              className="absolute left-0 right-0 h-12 pointer-events-none bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent z-20" 
              style={{ animation: "scanline-move 6s linear infinite" }} 
            />

            <div className="flex items-center gap-1.5 text-zinc-500 border-b border-zinc-900/60 pb-2 mb-2 justify-between relative z-10">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500/40" />
                <span className="w-2 h-2 rounded-full bg-yellow-500/40" />
                <span className="w-2 h-2 rounded-full bg-green-500/40" />
                <span className="ml-1 text-[9px] uppercase font-bold tracking-wider">{themeStyles.label}</span>
              </div>
              <span className="text-[8px] text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded uppercase font-bold">TTY-ACTIVE</span>
            </div>

            {/* Output Logs Scroll Area */}
            <div className={`flex-1 overflow-y-auto space-y-2 scrollbar-thin select-text relative z-10 ${themeStyles.termText}`}>
              {activeSteps.length > 0 ? (
                activeSteps.map((step, idx) => (
                  <div key={idx} className="animate-fade-in border-b border-zinc-950/20 pb-1" id={`log-step-${idx}`}>
                    <div className="flex items-start gap-1">
                      <span className="opacity-60 font-bold">»</span>
                      <span className={`font-semibold uppercase text-[10px] ${getStateColor(step.state)}`}>
                        [{step.title}]
                      </span>
                    </div>
                    <p className="opacity-90 ml-3.5 mt-0.5 whitespace-pre-wrap">{step.logMessage}</p>
                  </div>
                ))
              ) : isSimulating ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <RefreshCw className="w-5 h-5 text-zinc-600 animate-spin" />
                  <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Syncing Neural Cores...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-zinc-600">
                  <Terminal className="w-8 h-8 opacity-45" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                    Awaiting System Activation...
                  </span>
                  <p className="text-[10px] text-zinc-500 max-w-[200px] text-center leading-normal mt-1">
                    Press Compile & Run above to transmit parameters to the mainframe matrix.
                  </p>
                </div>
              )}

              {/* Decoded final output frame */}
              {showFinalOutput && simulationResult && (
                <div className="mt-4 pt-3 border-t border-zinc-800/60 animate-fade-in bg-zinc-900/10 p-3 rounded-lg border border-zinc-800/20">
                  <div className="flex items-center gap-1.5 text-zinc-400 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                    <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500">
                      Decoded Output Matrix Yield
                    </span>
                  </div>
                  <div className="bg-zinc-950/60 p-2.5 rounded border border-zinc-900/80 font-mono text-zinc-100 font-semibold select-text">
                    {simulationResult.finalOutput}
                  </div>
                </div>
              )}

              <div ref={logEndRef} />
            </div>
          </div>
        ) : (
          /* Recharts Performance Profiler View */
          <div className="flex-1 bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono text-[10px] uppercase text-zinc-300 font-bold tracking-wider">
                  Alien Modules Performance Profile
                </span>
              </div>
              <span className="font-mono text-[9px] text-zinc-500 uppercase">
                Active Code Size: {activeCode.length} Bytes
              </span>
            </div>

            {/* Profile Statistics */}
            <div className="flex-1 flex flex-col gap-3 min-h-0">
              <p className="font-mono text-[10px] text-zinc-400 leading-normal">
                Parallel timeline benchmarks comparing CPU execution ticks (<strong>duration in ms</strong>) and workspace <strong>memory load in KB</strong>.
              </p>

              <div className="flex-1 min-h-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={profileData}
                    margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#16161a" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#71717a', fontSize: 9, fontFamily: 'monospace' }}
                    />
                    <YAxis 
                      tick={{ fill: '#71717a', fontSize: 9, fontFamily: 'monospace' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#09090b',
                        borderColor: '#27272a',
                        borderRadius: '8px',
                        fontFamily: 'monospace',
                        fontSize: '10px',
                      }}
                      labelClassName="text-zinc-400 font-bold"
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: 9, fontFamily: 'monospace' }} 
                      verticalAlign="top"
                      height={24}
                    />
                    <Bar 
                      dataKey="duration" 
                      name="Duration (ms)" 
                      fill={themeStyles.barColor1} 
                      radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                      dataKey="memory" 
                      name="Memory (KB)" 
                      fill={themeStyles.barColor2} 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

  );
}
