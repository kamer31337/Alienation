import { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Cpu, 
  Copy, 
  Check, 
  Terminal, 
  RefreshCw, 
  Sparkles, 
  Share2, 
  Layers,
  History,
  Clock
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip 
} from "recharts";
import PolynomialD3Visualizer from "./PolynomialD3Visualizer";

interface QuantumEncryptionSuiteProps {
  activeCode: string;
  selectedLanguage: string;
}

interface QuantumData {
  qasm: string;
  cipher0: string;
  cipher1: string;
  modulus: number;
  degree: number;
  polynomials: {
    secretKey: string;
    publicKeyA: string;
    errorPoly: string;
    publicKeyB: string;
    randomR: string;
  };
  superpositionStates: Array<{
    state: string;
    amplitude: string;
    probability: number;
  }>;
  definedFunctions: Array<{
    name: string;
    description: string;
  }>;
}

interface EncryptionHistoryItem {
  id: string;
  timestamp: string;
  cleartext: string;
  language: string;
  secretKey: string;
  publicKeyA: string;
  publicKeyB: string;
  data: QuantumData;
}

export default function QuantumEncryptionSuite({ activeCode, selectedLanguage }: QuantumEncryptionSuiteProps) {
  const [inputText, setInputText] = useState<string>("");
  const [quantumData, setQuantumData] = useState<QuantumData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedQasm, setCopiedQasm] = useState<boolean>(false);
  const [copiedCipher, setCopiedCipher] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<"qasm" | "equations" | "amplitudes" | "d3">("qasm");
  
  // Local storage backed history of recently generated keys
  const [history, setHistory] = useState<EncryptionHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("quantum_encryption_history");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    if (activeCode) {
      setInputText(activeCode.slice(0, 120));
    }
  }, [activeCode]);

  // Initial fetch of quantum encryption parameters
  useEffect(() => {
    handleEncrypt();
  }, [selectedLanguage]);

  const handleEncrypt = async () => {
    setIsLoading(true);
    try {
      const payloadText = inputText || activeCode || "COORDINATE val = QUANTUM_NODE(64);";
      const res = await fetch("/api/quantum-encrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cleartext: payloadText,
          language: selectedLanguage
        })
      });

      if (res.ok) {
        const data: QuantumData = await res.json();
        setQuantumData(data);

        // Add to history
        const newHistoryItem: EncryptionHistoryItem = {
          id: Math.random().toString(36).substring(2, 11),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          cleartext: payloadText,
          language: selectedLanguage,
          secretKey: data.polynomials.secretKey,
          publicKeyA: data.polynomials.publicKeyA,
          publicKeyB: data.polynomials.publicKeyB,
          data: data
        };

        setHistory((prev) => {
          // Avoid exact duplicates of secretKey in history
          const isDup = prev.some(item => item.secretKey === data.polynomials.secretKey);
          if (isDup) return prev;
          const updated = [newHistoryItem, ...prev].slice(0, 5);
          localStorage.setItem("quantum_encryption_history", JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      console.error("Failed to connect to quantum encrypt hardware module:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReapplyHistory = (item: EncryptionHistoryItem) => {
    setQuantumData(item.data);
    setInputText(item.cleartext);
  };

  const handleCopyQasm = () => {
    if (!quantumData) return;
    navigator.clipboard.writeText(quantumData.qasm);
    setCopiedQasm(true);
    setTimeout(() => setCopiedQasm(false), 2000);
  };

  const handleCopyCipher = () => {
    if (!quantumData) return;
    const equations = `${quantumData.cipher0}\n${quantumData.cipher1}\nModulus Q = ${quantumData.modulus}`;
    navigator.clipboard.writeText(equations);
    setCopiedCipher(true);
    setTimeout(() => setCopiedCipher(false), 2000);
  };

  const getLanguageAccent = () => {
    if (selectedLanguage === "zeta") return "text-cyan-400 border-cyan-500/20 bg-cyan-950/10";
    if (selectedLanguage === "xylor") return "text-emerald-400 border-emerald-500/20 bg-emerald-950/10";
    return "text-purple-400 border-purple-500/20 bg-purple-950/10";
  };

  return (
    <div 
      className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-xl p-4 flex flex-col h-full transition-all duration-300"
      id="quantum-encryption-suite"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 border-b border-zinc-800/60 pb-2">
        <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
        <h3 className="font-mono text-xs font-semibold text-zinc-300 tracking-wider uppercase">
          Post-Quantum Polynomial Encrypter
        </h3>
      </div>

      {/* Manual Input Core */}
      <div className="space-y-2 mb-4">
        <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider block">
          Cleartext Core Payload:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter ship coordinates, algorithms or logic to encrypt..."
            className="flex-1 bg-zinc-950 border border-zinc-850 px-3 py-1.5 rounded-lg font-mono text-[11px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-rose-500/35 focus:ring-1 focus:ring-rose-500/10 transition-all"
          />
          <button
            onClick={handleEncrypt}
            disabled={isLoading}
            className="px-3 py-1.5 bg-rose-950/30 hover:bg-rose-900/30 text-rose-400 border border-rose-500/25 rounded-lg font-mono text-[10px] uppercase font-bold tracking-wider transition-colors disabled:opacity-40 flex items-center gap-1 cursor-pointer shrink-0"
          >
            {isLoading ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <Cpu className="w-3 h-3" />
            )}
            <span>Encrypt</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-zinc-900 mb-3 gap-1 overflow-x-auto scrollbar-none">
        {(["qasm", "equations", "amplitudes", "d3"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`pb-1.5 px-2.5 font-mono text-[10px] uppercase border-b-2 transition-all duration-150 cursor-pointer whitespace-nowrap ${
              activeSubTab === tab
                ? "border-rose-500 text-rose-400 font-bold"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab === "qasm" 
              ? "QASM Code" 
              : tab === "equations" 
              ? "Polynomials" 
              : tab === "amplitudes" 
              ? "Superposition" 
              : "D3 Spectrum"}
          </button>
        ))}
      </div>

      {/* Output Content */}
      <div className="flex-1 flex flex-col min-h-[220px]">
        {quantumData ? (
          <>
            {activeSubTab === "qasm" && (
              <div className="flex-1 flex flex-col min-h-0 bg-zinc-950/80 rounded-lg border border-zinc-900 p-3 relative">
                <div className="flex items-center justify-between mb-2 pb-1 border-b border-zinc-900/60">
                  <span className="font-mono text-[8px] text-zinc-500 uppercase font-bold">
                    QASM 2.0 Superposition Circuit
                  </span>
                  <button
                    onClick={handleCopyQasm}
                    className="p-1 hover:bg-zinc-900 rounded text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer"
                    title="Copy QASM code"
                  >
                    {copiedQasm ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <pre className="flex-1 overflow-y-auto text-[10px] font-mono text-zinc-400 leading-relaxed max-h-[140px] select-all pr-1 scrollbar-thin scrollbar-thumb-zinc-900">
                  {quantumData.qasm}
                </pre>
              </div>
            )}

            {activeSubTab === "equations" && (
              <div className="flex-1 flex flex-col min-h-0 bg-zinc-950/80 rounded-lg border border-zinc-900 p-3">
                <div className="flex items-center justify-between mb-2 pb-1 border-b border-zinc-900/60">
                  <span className="font-mono text-[8px] text-zinc-500 uppercase font-bold">
                    Ring-LWE Polynomial Outputs
                  </span>
                  <button
                    onClick={handleCopyCipher}
                    className="p-1 hover:bg-zinc-900 rounded text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer"
                    title="Copy ciphertext polynomial equations"
                  >
                    {copiedCipher ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                
                <div className="space-y-2 text-[10px] font-mono max-h-[140px] overflow-y-auto pr-1 scrollbar-thin">
                  <div>
                    <span className="text-rose-400 font-bold block">Ciphertext C0:</span>
                    <p className="text-zinc-300 bg-zinc-950 p-1.5 rounded border border-zinc-900 select-all overflow-x-auto whitespace-nowrap">
                      {quantumData.cipher0}
                    </p>
                  </div>
                  <div>
                    <span className="text-rose-400 font-bold block">Ciphertext C1:</span>
                    <p className="text-zinc-300 bg-zinc-950 p-1.5 rounded border border-zinc-900 select-all overflow-x-auto whitespace-nowrap">
                      {quantumData.cipher1}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-900">
                    <div>
                      <span className="text-zinc-500 block text-[8px]">Modulus q:</span>
                      <span className="text-zinc-300 font-semibold">{quantumData.modulus}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[8px]">Degree N:</span>
                      <span className="text-zinc-300 font-semibold">{quantumData.degree}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === "amplitudes" && (
              <div className="flex-1 flex flex-col min-h-0 bg-zinc-950/80 rounded-lg border border-zinc-900 p-3">
                <span className="font-mono text-[8px] text-zinc-500 uppercase font-bold mb-1 block">
                  Measured superposition state registers (%)
                </span>

                <div className="flex-1 min-h-[110px] w-full text-zinc-400">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={quantumData.superpositionStates}
                      margin={{ top: 5, right: 5, left: -32, bottom: 0 }}
                    >
                      <XAxis 
                        dataKey="state" 
                        tick={{ fill: '#71717a', fontSize: 8, fontFamily: 'monospace' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fill: '#71717a', fontSize: 8, fontFamily: 'monospace' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Bar dataKey="probability" fill="#f43f5e" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeSubTab === "d3" && (
              <div className="flex-1 flex flex-col min-h-0">
                <PolynomialD3Visualizer
                  polynomials={quantumData.polynomials}
                  cipher0={quantumData.cipher0}
                  cipher1={quantumData.cipher1}
                />
              </div>
            )}

            {/* Keys History Panel */}
            <div className="mt-4 bg-zinc-950/30 border border-zinc-900 p-3 rounded-lg flex flex-col gap-2 font-mono">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                  <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">
                    Recent Encryption Keys History
                  </span>
                </div>
                <span className="text-[7px] text-zinc-600 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-900 font-bold uppercase tracking-widest">
                  Secure Queue
                </span>
              </div>
              
              {history.length === 0 ? (
                <div className="text-center py-4 text-zinc-600 text-[9px] italic">
                  No recently generated keys recorded. Try generating a key above!
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[125px] overflow-y-auto pr-1 scrollbar-thin">
                  {history.map((item) => {
                    const isCurrent = quantumData.polynomials.secretKey === item.secretKey;
                    const langColor = 
                      item.language === "zeta" 
                        ? "text-cyan-400 bg-cyan-950/20 border-cyan-900/30" 
                        : item.language === "xylor" 
                        ? "text-emerald-400 bg-emerald-950/20 border-emerald-900/30" 
                        : "text-purple-400 bg-purple-950/20 border-purple-900/30";
                    
                    return (
                      <div 
                        key={item.id} 
                        className={`flex items-center justify-between gap-3 p-2 rounded-lg border transition-all text-left ${
                          isCurrent 
                            ? "bg-rose-950/10 border-rose-500/20" 
                            : "bg-zinc-950/50 border-zinc-900/60 hover:bg-zinc-950/80 hover:border-zinc-850"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className={`text-[7px] font-bold uppercase tracking-widest px-1 py-0.5 rounded border ${langColor}`}>
                              {item.language}
                            </span>
                            <span className="text-[7px] text-zinc-500 flex items-center gap-0.5 font-bold">
                              <Clock className="w-2.5 h-2.5 text-zinc-600" />
                              {item.timestamp}
                            </span>
                            <span className="text-[9px] text-zinc-400 font-bold truncate max-w-[150px]">
                              "{item.cleartext}"
                            </span>
                          </div>
                          <div className="text-[8px] text-zinc-500 truncate select-all">
                            <span className="text-rose-400/80 font-bold">Secret s(x):</span> {item.secretKey}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleReapplyHistory(item)}
                          disabled={isCurrent}
                          className={`px-2 py-1 rounded text-[8px] font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                            isCurrent
                              ? "bg-rose-950/20 border border-rose-900/30 text-rose-400/60 font-black cursor-not-allowed"
                              : "bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white"
                          }`}
                        >
                          {isCurrent ? "Active" : "Re-apply"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Defined Functions */}
            <div className="mt-3 bg-zinc-950/40 border border-zinc-850/60 p-2.5 rounded-lg">
              <div className="flex items-center gap-1.5 text-zinc-400 mb-1.5 border-b border-zinc-900 pb-1">
                <Layers className="w-3.5 h-3.5 text-zinc-500" />
                <span className="font-mono text-[9px] uppercase font-bold text-zinc-500">
                  Quantum Cryptography Decoders
                </span>
              </div>
              <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1 scrollbar-thin">
                {quantumData.definedFunctions.map((fn, idx) => (
                  <div key={idx} className="font-mono text-[10px] leading-relaxed">
                    <strong className="text-zinc-200 block">{fn.name}</strong>
                    <span className="text-zinc-500 block text-[9px]">{fn.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-zinc-600">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="font-mono text-[10px] uppercase">Booting quantum simulator...</span>
          </div>
        )}
      </div>
    </div>
  );
}

