import { LanguageInfo } from "../data";
import { Cpu, Biohazard, Orbit } from "lucide-react";

interface LanguageSelectorProps {
  languages: LanguageInfo[];
  selectedId: string;
  onSelect: (id: any) => void;
}

export default function LanguageSelector({
  languages,
  selectedId,
  onSelect,
}: LanguageSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="language-selector">
      {languages.map((lang) => {
        const isSelected = lang.id === selectedId;
        const iconColor =
          lang.id === "zeta"
            ? "text-cyan-400"
            : lang.id === "xylor"
            ? "text-emerald-400"
            : "text-purple-400";

        const ringColor =
          lang.id === "zeta"
            ? "border-cyan-500/50 shadow-cyan-500/10"
            : lang.id === "xylor"
            ? "border-emerald-500/50 shadow-emerald-500/10"
            : "border-purple-500/50 shadow-purple-500/10";

        const hoverColor =
          lang.id === "zeta"
            ? "hover:border-cyan-400/60 hover:bg-cyan-500/5"
            : lang.id === "xylor"
            ? "hover:border-emerald-400/60 hover:bg-emerald-500/5"
            : "hover:border-purple-400/60 hover:bg-purple-500/5";

        return (
          <button
            key={lang.id}
            id={`lang-btn-${lang.id}`}
            onClick={() => onSelect(lang.id)}
            className={`text-left p-4 rounded-xl border bg-zinc-900/60 backdrop-blur-md transition-all duration-300 relative group cursor-pointer ${hoverColor} ${
              isSelected
                ? `${ringColor} border-2 ${lang.glowColor}`
                : "border-zinc-800"
            }`}
          >
            {/* Ambient background glow for active language */}
            {isSelected && (
              <div
                className={`absolute inset-0 rounded-xl opacity-10 pointer-events-none transition-opacity ${
                  lang.id === "zeta"
                    ? "bg-cyan-500"
                    : lang.id === "xylor"
                    ? "bg-emerald-500"
                    : "bg-purple-500"
                }`}
              />
            )}

            <div className="flex items-start gap-3 relative z-10">
              <div className={`p-2 rounded-lg bg-zinc-950 border border-zinc-800 ${iconColor}`}>
                {lang.id === "zeta" && <Cpu className="w-5 h-5" id="zeta-icon" />}
                {lang.id === "xylor" && <Biohazard className="w-5 h-5" id="xylor-icon" />}
                {lang.id === "gorgon" && <Orbit className="w-5 h-5" id="gorgon-icon" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-sm font-semibold text-zinc-100 tracking-wider">
                    {lang.name}
                  </h3>
                  {isSelected && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 ${iconColor} animate-pulse`}
                    >
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-zinc-400 font-mono text-[11px] mt-1 leading-relaxed line-clamp-2">
                  {lang.slogan}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
