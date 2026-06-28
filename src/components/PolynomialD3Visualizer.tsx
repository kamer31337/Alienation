import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { AreaChart, Sparkles } from "lucide-react";

interface PolynomialD3VisualizerProps {
  polynomials: {
    secretKey: string;
    publicKeyA: string;
    errorPoly: string;
    publicKeyB: string;
    randomR: string;
  };
  cipher0: string;
  cipher1: string;
}

type PolyType = "secret" | "pubA" | "pubB" | "error" | "c0" | "c1";

export default function PolynomialD3Visualizer({
  polynomials,
  cipher0,
  cipher1,
}: PolynomialD3VisualizerProps) {
  const [selectedPoly, setSelectedPoly] = useState<PolyType>("secret");
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<{
    index: number;
    value: number;
    term: string;
  } | null>(null);

  // Parse coefficients from a polynomial string (e.g. "s(x) = -1 + 1x - 1x^2")
  const parseCoefficients = (polyStr: string): number[] => {
    const coeffs = Array(8).fill(0);
    const clean = polyStr.split("=")[1]?.trim() || polyStr;
    
    // Normalize terms and split on spaces, keeping signs with terms
    const terms = clean
      .replace(/-/g, " -")
      .replace(/\+/g, " +")
      .split(/\s+/)
      .filter(Boolean);
    
    terms.forEach((term) => {
      let coef = 1;
      let power = 0;
      
      const sign = term.startsWith("-") ? -1 : 1;
      const absTerm = term.replace(/^[+-]/, "").trim();
      
      if (!absTerm.includes("x")) {
        // Constant term
        coef = parseInt(absTerm, 10);
        if (isNaN(coef)) coef = absTerm === "" ? 1 : 0;
        power = 0;
      } else {
        const parts = absTerm.split("x");
        const coefPart = parts[0].trim();
        const powerPart = parts[1]?.trim();
        
        coef = coefPart === "" ? 1 : parseInt(coefPart, 10);
        if (isNaN(coef)) coef = 1;
        
        if (!powerPart) {
          power = 1;
        } else if (powerPart.startsWith("^")) {
          power = parseInt(powerPart.substring(1), 10) || 0;
        }
      }
      
      if (power >= 0 && power < 8) {
        coeffs[power] = coef * sign;
      }
    });
    
    return coeffs;
  };

  const getPolyString = (type: PolyType): string => {
    switch (type) {
      case "secret":
        return polynomials.secretKey;
      case "pubA":
        return polynomials.publicKeyA;
      case "pubB":
        return polynomials.publicKeyB;
      case "error":
        return polynomials.errorPoly;
      case "c0":
        return cipher0;
      case "c1":
        return cipher1;
    }
  };

  const getPolyLabel = (type: PolyType): string => {
    switch (type) {
      case "secret":
        return "Secret Key s(x)";
      case "pubA":
        return "Public Key a(x)";
      case "pubB":
        return "Public Key b(x)";
      case "error":
        return "Error e(x)";
      case "c0":
        return "Ciphertext c_0(x)";
      case "c1":
        return "Ciphertext c_1(x)";
    }
  };

  const getColorTheme = (type: PolyType) => {
    switch (type) {
      case "secret":
        return { stroke: "#f43f5e", fill: "rgba(244,63,94,0.15)", glow: "rgba(244,63,94,0.4)" };
      case "pubA":
        return { stroke: "#06b6d4", fill: "rgba(6,182,212,0.15)", glow: "rgba(6,182,212,0.4)" };
      case "pubB":
        return { stroke: "#10b981", fill: "rgba(16,185,129,0.15)", glow: "rgba(16,185,129,0.4)" };
      case "error":
        return { stroke: "#f59e0b", fill: "rgba(245,158,11,0.15)", glow: "rgba(245,158,11,0.4)" };
      case "c0":
        return { stroke: "#a855f7", fill: "rgba(168,85,247,0.15)", glow: "rgba(168,85,247,0.4)" };
      case "c1":
        return { stroke: "#3b82f6", fill: "rgba(59,130,246,0.15)", glow: "rgba(59,130,246,0.4)" };
    }
  };

  const polyStr = getPolyString(selectedPoly);
  const coefficients = parseCoefficients(polyStr);
  const theme = getColorTheme(selectedPoly);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 460;
    const height = 180;
    const margin = { top: 15, right: 25, bottom: 25, left: 35 };

    const svg = d3
      .select(svgRef.current)
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Prepare data
    const data = coefficients.map((val, idx) => ({
      index: idx,
      value: val,
      term: idx === 0 ? `${val}` : idx === 1 ? `${val}x` : `${val}x^${idx}`,
    }));

    // Find min and max for y-scale padding
    const yMin = d3.min(data, (d) => d.value) ?? -5;
    const yMax = d3.max(data, (d) => d.value) ?? 5;
    const yPadding = Math.max(1, Math.ceil((yMax - yMin) * 0.15));

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([0, 7])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([yMin - yPadding, yMax + yPadding])
      .range([height - margin.bottom, margin.top]);

    // X Axis
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(8)
          .tickFormat((d) => `x^${d}`)
      )
      .call((g) => g.select(".domain").attr("stroke", "#27272a"))
      .call((g) => g.selectAll(".tick text").attr("fill", "#71717a").attr("font-size", "8px").attr("font-family", "monospace"))
      .call((g) => g.selectAll(".tick line").attr("stroke", "#27272a"));

    // Y Axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale).ticks(5))
      .call((g) => g.select(".domain").attr("stroke", "#27272a"))
      .call((g) => g.selectAll(".tick text").attr("fill", "#71717a").attr("font-size", "8px").attr("font-family", "monospace"))
      .call((g) => g.selectAll(".tick line").attr("stroke", "#27272a"));

    // Horizontal Zero reference line
    svg
      .append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", yScale(0))
      .attr("y2", yScale(0))
      .attr("stroke", "#3f3f46")
      .attr("stroke-dasharray", "3,3")
      .attr("stroke-width", 1);

    // Subtle horizontal gridlines
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(
        d3
          .axisLeft(yScale)
          .ticks(4)
          .tickSize(-width + margin.left + margin.right)
          .tickFormat(() => "")
      )
      .call((g) => g.select(".domain").remove())
      .call((g) => g.selectAll(".tick line").attr("stroke", "#18181b").attr("stroke-opacity", 0.5));

    // Area generator
    const areaGenerator = d3
      .area<{ index: number; value: number }>()
      .x((d) => xScale(d.index))
      .y0(yScale(0))
      .y1((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Draw area under curve
    svg
      .append("path")
      .datum(data)
      .attr("d", areaGenerator)
      .attr("fill", theme.fill)
      .attr("opacity", 0.4);

    // Line generator
    const lineGenerator = d3
      .line<{ index: number; value: number }>()
      .x((d) => xScale(d.index))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Draw connecting line
    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", theme.stroke)
      .attr("stroke-width", 2)
      .attr("filter", "drop-shadow(0px 0px 4px " + theme.glow + ")")
      .attr("d", lineGenerator);

    // Draw stems and nodes
    data.forEach((d) => {
      // Stem line from zero line to coefficient node
      svg
        .append("line")
        .attr("x1", xScale(d.index))
        .attr("x2", xScale(d.index))
        .attr("y1", yScale(0))
        .attr("y2", yScale(d.value))
        .attr("stroke", theme.stroke)
        .attr("stroke-width", 1.2)
        .attr("stroke-opacity", 0.6)
        .attr("stroke-dasharray", d.value === 0 ? "1,3" : "none");

      // Glowing dot
      const circle = svg
        .append("circle")
        .attr("cx", xScale(d.index))
        .attr("cy", yScale(d.value))
        .attr("r", 4)
        .attr("fill", "#09090b")
        .attr("stroke", theme.stroke)
        .attr("stroke-width", 2)
        .attr("cursor", "pointer")
        .attr("class", "transition-all duration-150");

      // Hover overlay dot for interactivity
      svg
        .append("circle")
        .attr("cx", xScale(d.index))
        .attr("cy", yScale(d.value))
        .attr("r", 12)
        .attr("fill", "transparent")
        .attr("cursor", "pointer")
        .on("mouseenter", () => {
          circle.attr("r", 6).attr("fill", theme.stroke);
          setHoveredNode({ index: d.index, value: d.value, term: d.term });
        })
        .on("mouseleave", () => {
          circle.attr("r", 4).attr("fill", "#09090b");
          setHoveredNode(null);
        });
    });
  }, [coefficients, theme.stroke, theme.fill, theme.glow]);

  return (
    <div className="bg-zinc-950 rounded-xl border border-zinc-900 p-3.5 space-y-3" id="polynomial-d3-widget">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-900">
        <div className="flex items-center gap-1.5">
          <AreaChart className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          <span className="font-mono text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
            Superposition Coefficient Spectrum (D3)
          </span>
        </div>
        <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest bg-zinc-900 px-2 py-0.5 rounded border border-zinc-850">
          Ring-LWE Waveform Analyzer
        </span>
      </div>

      {/* Dialect Selector Toggles */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
        {(["secret", "pubA", "pubB", "error", "c0", "c1"] as const).map((type) => {
          const isSelected = selectedPoly === type;
          const activeTheme = getColorTheme(type);
          return (
            <button
              key={type}
              onClick={() => setSelectedPoly(type)}
              className={`py-1 px-1.5 font-mono text-[8px] uppercase font-bold rounded border transition-all cursor-pointer text-center ${
                isSelected
                  ? `bg-zinc-900 text-white`
                  : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30"
              }`}
              style={{
                borderColor: isSelected ? activeTheme.stroke : "transparent",
              }}
            >
              {type === "secret"
                ? "s(x)"
                : type === "pubA"
                ? "a(x)"
                : type === "pubB"
                ? "b(x)"
                : type === "error"
                ? "e(x)"
                : type === "c0"
                ? "c0(x)"
                : "c1(x)"}
            </button>
          );
        })}
      </div>

      {/* Main visualization svg area */}
      <div className="relative bg-zinc-950/40 rounded-lg p-1.5 border border-zinc-900/40">
        <svg ref={svgRef} className="w-full h-[180px] overflow-visible" />
        
        {/* Dynamic Overlay Info HUD / Tooltip inside canvas */}
        <div className="absolute right-3 top-3 bg-zinc-950/90 border border-zinc-850 p-2 rounded-lg font-mono text-[8px] text-zinc-400 max-w-[170px] pointer-events-none transition-all">
          <div className="font-bold text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1 text-[9px]">
            <Sparkles className="w-2.5 h-2.5 text-zinc-400" />
            <span>Active: {getPolyLabel(selectedPoly)}</span>
          </div>
          {hoveredNode ? (
            <div className="space-y-1 animate-fade-in text-zinc-200">
              <div className="flex justify-between gap-2 border-b border-zinc-900 pb-0.5 mb-1 text-rose-400">
                <span>Term Component:</span>
                <span className="font-bold text-white">{hoveredNode.term}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Coefficient:</span>
                <span className="font-bold text-white">{hoveredNode.value}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Index Degree:</span>
                <span className="font-bold text-white">x^{hoveredNode.index}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Quantum State:</span>
                <span className="text-cyan-400">|{hoveredNode.index.toString(2).padStart(3, "0")}⟩</span>
              </div>
            </div>
          ) : (
            <div className="text-zinc-500 italic text-[8px] leading-relaxed">
              Hover over coordinate nodes on the spectral curve to measure discrete wave phase amplitude and coordinate coefficients.
            </div>
          )}
        </div>
      </div>

      {/* Explanatory footer */}
      <div className="text-[9px] font-mono text-zinc-500 leading-relaxed bg-zinc-900/20 border border-zinc-900 p-2 rounded-lg">
        <strong className="text-zinc-400 block uppercase tracking-wide text-[8px] mb-0.5">Mathematical Interpretation:</strong>
        The D3 spectrum maps coefficients for polynomial terms from <span className="text-zinc-300">x^0</span> to <span className="text-zinc-300">x^7</span>. In standard Ring-LWE cryptography, security hinges on adding secret error coordinates <span className="text-amber-500">e(x)</span> to the public values to distort the final superposition state.
      </div>
    </div>
  );
}
