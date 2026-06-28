import { useState } from "react";
import { LanguageInfo } from "../data";
import { BookOpen, AlertTriangle, Cpu, Terminal, BarChart2, Search, X } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

interface DocumentationPanelProps {
  languageInfo: LanguageInfo;
  activeCode: string;
  highlighted?: boolean;
}

const keywordsMap: Record<string, string[]> = {
  zeta: ["COORDINATE", "QUANTUM_NODE", "TESS_LOOP", "RESONATE", "COLLAPSE", "PSI_PROJECTION"],
  xylor: ["NUTRIENT_NODE", "SPORE_BLOOM", "SHED_SPORES", "ENZYME_SECRETION"],
  gorgon: ["TIME_ANCHOR", "TEMPORAL_WORMHOLE", "TIME_WARP", "CHRONICLE_ECHO", "CHRONO_PRESENT", "CHRONO_FUTURE"]
};

export default function DocumentationPanel({ languageInfo, activeCode, highlighted }: DocumentationPanelProps) {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const getAccentColor = () => {
    if (languageInfo.id === "zeta") return "text-cyan-400 border-cyan-500/30 bg-cyan-500/10 hover:text-cyan-300";
    if (languageInfo.id === "xylor") return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:text-emerald-300";
    return "text-purple-400 border-purple-500/30 bg-purple-500/10 hover:text-purple-300";
  };

  const getBorderActiveColor = () => {
    if (languageInfo.id === "zeta") return "border-cyan-400 text-cyan-400";
    if (languageInfo.id === "xylor") return "border-emerald-400 text-emerald-400";
    return "border-purple-400 text-purple-400";
  };

  const getChartColor = () => {
    if (languageInfo.id === "zeta") return "#22d3ee";
    if (languageInfo.id === "xylor") return "#34d399";
    return "#c084fc";
  };

  // Calculate occurrences of each keyword in the activeCode
  const currentKeywords = keywordsMap[languageInfo.id] || [];
  const chartData = currentKeywords.map((kw) => {
    if (!activeCode) return { name: kw, occurrences: 0 };
    // Escaping special characters just in case, but alien keywords are safe alphanumeric characters with underscores
    const escaped = kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "g");
    const occurrences = (activeCode.match(regex) || []).length;
    return { name: kw, occurrences };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950/95 border border-zinc-800 px-2 py-1.5 rounded shadow-2xl font-mono text-[10px]">
          <p className="text-zinc-400 font-bold text-[9px] tracking-wider uppercase">{payload[0].name}</p>
          <p className="text-zinc-200 mt-0.5">
            Frequency: <span className="text-zinc-100 font-extrabold" style={{ color: getChartColor() }}>{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Search filter and highlight helpers
  const filteredDoc = languageInfo.documentation.filter(
    (doc) =>
      doc.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text;
    const parts = text.split(new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="bg-cyan-500/30 text-cyan-200 px-1 rounded border border-cyan-500/20 font-bold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div 
      className={`bg-zinc-900/40 backdrop-blur-md border rounded-xl p-4 flex flex-col h-full transition-all duration-300 ${
        highlighted
          ? "border-indigo-500/80 ring-2 ring-indigo-500/60 ring-offset-4 ring-offset-black shadow-[0_0_15px_rgba(99,102,241,0.3)]"
          : "border-zinc-800/80"
      }`} 
      id="documentation-panel"
    >
      <div className="flex items-center gap-2 mb-3 border-b border-zinc-800/60 pb-2">
        <BookOpen className="w-4 h-4 text-zinc-400" />
        <h3 className="font-mono text-xs font-semibold text-zinc-300 tracking-wider uppercase">
          Dialect Specification Core
        </h3>
      </div>

      {/* Search Input Box */}
      <div className="relative mb-4">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-3.5 w-3.5 text-zinc-500" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search rules, definitions & grammar...`}
          className="w-full pl-9 pr-8 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/30 transition-all focus:ring-1 focus:ring-cyan-500/20"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-500 hover:text-zinc-300 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-4">
        {/* Navigation Tabs OR Search Results */}
        {searchQuery ? (
          <div>
            <div className="bg-zinc-950/60 border border-zinc-800/40 rounded-lg p-3 min-h-[140px] font-mono text-xs leading-relaxed text-zinc-300">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold block mb-2.5">
                Search Results ({filteredDoc.length})
              </span>
              {filteredDoc.length === 0 ? (
                <div className="py-6 text-center text-zinc-500 text-[11px]">
                  <AlertTriangle className="w-4 h-4 mx-auto text-zinc-600 mb-1.5" />
                  No results match your coordinate query.
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[180px] overflow-y-auto scrollbar-thin">
                  {filteredDoc.map((doc, idx) => (
                    <div key={idx} className="border-b border-zinc-900 pb-2.5 last:border-0 last:pb-0">
                      <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wide block mb-1">
                        {highlightText(doc.section, searchQuery)}
                      </span>
                      <p className="text-zinc-300 leading-relaxed text-[11px]">
                        {highlightText(doc.details, searchQuery)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex border-b border-zinc-800 mb-3 overflow-x-auto gap-2">
              {languageInfo.documentation.map((doc, idx) => (
                <button
                  key={idx}
                  id={`doc-tab-${idx}`}
                  onClick={() => setActiveTab(idx)}
                  className={`pb-2 px-3 text-xs font-mono border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    activeTab === idx
                      ? getBorderActiveColor()
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {doc.section}
                </button>
              ))}
            </div>

            <div className="bg-zinc-950/60 border border-zinc-800/40 rounded-lg p-3 min-h-[140px] font-mono text-xs leading-relaxed text-zinc-300">
              <div className="flex items-start gap-2 mb-2">
                <Terminal className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" />
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                  Specification Details
                </span>
              </div>
              <p className="text-zinc-300">{languageInfo.documentation[activeTab]?.details}</p>
            </div>
          </div>
        )}

        {/* Real-Time Keyword Telemetry Chart */}
        <div className="bg-zinc-950/40 border border-zinc-850/60 rounded-lg p-3 flex flex-col">
          <div className="flex items-center gap-2 text-zinc-400 mb-2.5">
            <BarChart2 className="w-3.5 h-3.5 text-zinc-500" />
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-zinc-500">
              Keyword Register Frequency
            </span>
          </div>

          <div className="h-32 w-full text-zinc-400">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#71717a", fontSize: 8, fontFamily: "ui-monospace, monospace" }}
                  tickLine={false}
                  axisLine={{ stroke: "#27272a" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#71717a", fontSize: 8, fontFamily: "ui-monospace, monospace" }}
                  tickLine={false}
                  axisLine={{ stroke: "#27272a" }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                <Bar dataKey="occurrences" radius={[2, 2, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getChartColor()}
                      opacity={entry.occurrences > 0 ? 0.9 : 0.25}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800/60">
        <div className="flex items-center gap-2 text-zinc-400 mb-2">
          <Cpu className="w-3.5 h-3.5" />
          <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-zinc-500">
            Coring Platform
          </span>
        </div>
        <div className="flex justify-between items-center bg-zinc-950/40 p-2 rounded border border-zinc-800/30">
          <span className="font-mono text-[10px] text-zinc-400">{languageInfo.systemModel}</span>
          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500">
            ONLINE
          </span>
        </div>
      </div>
    </div>
  );
}
