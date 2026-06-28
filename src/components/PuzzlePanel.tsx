import { Puzzle } from "../types";
import { Award, Code2, ShieldAlert, Sparkles } from "lucide-react";

interface PuzzlePanelProps {
  puzzles: Puzzle[];
  onSelectPuzzle: (puzzle: Puzzle) => void;
  activePuzzleId: string | null;
  langColorClass: string;
}

export default function PuzzlePanel({
  puzzles,
  onSelectPuzzle,
  activePuzzleId,
  langColorClass,
}: PuzzlePanelProps) {
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "Initiate":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "Officer":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default:
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    }
  };

  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-xl p-4 flex flex-col h-full" id="puzzle-dashboard">
      <div className="flex items-center gap-2 mb-3 border-b border-zinc-800/60 pb-2.5">
        <Award className="w-4 h-4 text-zinc-400" />
        <h3 className="font-mono text-xs font-semibold text-zinc-300 tracking-wider uppercase">
          Galactic Academy Challenges
        </h3>
      </div>

      <p className="text-zinc-500 font-mono text-[10px] leading-relaxed mb-4">
        Synthesize standard sequential routines into multi-dimensional computations to bypass regional firewall sectors.
      </p>

      <div className="space-y-2 overflow-y-auto flex-1 max-h-[200px] scrollbar-thin">
        {puzzles.map((puzzle) => {
          const isActive = puzzle.id === activePuzzleId;
          return (
            <button
              key={puzzle.id}
              id={`puzzle-btn-${puzzle.id}`}
              onClick={() => onSelectPuzzle(puzzle)}
              className={`w-full text-left p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-zinc-950 border-zinc-700/60 shadow-md"
                  : "bg-zinc-950/40 border-zinc-900 hover:border-zinc-800/80 hover:bg-zinc-900/10"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-mono text-xs font-bold text-zinc-200 group-hover:text-zinc-100">
                  {puzzle.title}
                </span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${getDifficultyBadge(puzzle.difficulty)}`}>
                  {puzzle.difficulty}
                </span>
              </div>
              <p className="text-zinc-400 font-mono text-[10px] leading-relaxed line-clamp-2">
                {puzzle.description}
              </p>
              {isActive && (
                <div className="mt-2.5 flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 bg-zinc-950 p-1.5 rounded border border-zinc-900">
                  <Code2 className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="truncate">Expected Yield: {puzzle.expectedOutputHint}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
