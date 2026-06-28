import { Language, Puzzle } from "./types";

export interface LanguageInfo {
  id: Language;
  name: string;
  slogan: string;
  description: string;
  systemModel: string;
  themeColor: string;
  accentBg: string;
  glowColor: string;
  documentation: {
    section: string;
    details: string;
  }[];
}

export const LANGUAGES: LanguageInfo[] = [
  {
    id: "zeta",
    name: "Zeta-6 Glyphs",
    slogan: "Geometric-Telepathic multidimensional arrays",
    description: "Operates in higher dimensional vector grids. Logic nodes form geometric patterns that transfer data instantly through telepathic resonance fields. Standard sequentially compiled logic is compressed into a single, infinite spatial point.",
    systemModel: "Quantized Theta-Core v9.1",
    themeColor: "text-cyan-400 border-cyan-500/30",
    accentBg: "bg-cyan-500/10",
    glowColor: "shadow-[0_0_15px_rgba(34,211,238,0.2)]",
    documentation: [
      {
        section: "Basic Logic",
        details: "Zeta variables are called COORDINATES, initialized using QUANTUM_NODE(). Operators include RESONATE (increments state resonance) and COLLAPSE (retrieves the physical value)."
      },
      {
        section: "Control Flow",
        details: "Instead of if/else loops, Zeta uses TESS_LOOP which performs a hyper-dimensional rotation on all elements simultaneously until the coordinate convergence criterion is met."
      },
      {
        section: "I/O",
        details: "Use PSI_PROJECTION() to broadcast outputs onto standard sensory screens. Standard humans can only perceive these via optical interfaces."
      }
    ]
  },
  {
    id: "xylor",
    name: "Xylor Spores",
    slogan: "Bio-Organic carbon-eating mycelium logic",
    description: "Computations are biological digestive processes. Files are nutrients, loops are reproductive fungal spore blooms, and variables are carbon-dense growth nodes connected by thick mycelial threads.",
    systemModel: "Mycelial Biomass Super-Colony",
    themeColor: "text-emerald-400 border-emerald-500/30",
    accentBg: "bg-emerald-500/10",
    glowColor: "shadow-[0_0_15px_rgba(52,211,153,0.2)]",
    documentation: [
      {
        section: "Biomass States",
        details: "Variables are NUTRIENT_NODES. They require continuous moisture and organic waste to run without dry-decaying."
      },
      {
        section: "Looping Structures",
        details: "SPORE_BLOOM defines a recursive colony growth. During each cycle, spores are shed via SHED_SPORES to feed adjacent computations."
      },
      {
        section: "Enzymatic Secretions",
        details: "Functions are declared using ENZYME_SECRETION. These digest incoming data buffers and secrete simpler amino-acid strings as outputs."
      }
    ]
  },
  {
    id: "gorgon",
    name: "Gorgon Wormholes",
    slogan: "Temporal-Chronological forward-backward state loops",
    description: "Defies sequential temporal constraints. This language compiles forwards and backwards in time simultaneously. Programs can retrieve future results before writing the calculation, but beware of temporal grandfather paradox loops.",
    systemModel: "Tachyon Anchor Core (C-137)",
    themeColor: "text-purple-400 border-purple-500/30",
    accentBg: "bg-purple-500/10",
    glowColor: "shadow-[0_0_15px_rgba(192,132,252,0.2)]",
    documentation: [
      {
        section: "Tachyon Variables",
        details: "Variables are TIME_ANCHORS. They are initialized via CHRONO_PRESENT() or CHRONO_FUTURE() depending on when the value will be computed."
      },
      {
        section: "Temporal Loops",
        details: "TEMPORAL_WORMHOLE allows code to loop backwards through instructions, altering the initial state retroactively. Chronological divergence factors must be kept below 5%."
      },
      {
        section: "Time Warping",
        details: "Use TIME_WARP to shift a variable's timeline offset. If a variable is accessed before its timeline exists, it defaults to a vacuum state."
      }
    ]
  }
];

export const PUZZLES: Puzzle[] = [
  {
    id: "decrypt-pulsar",
    title: "Decrypt Pulsar Signal",
    difficulty: "Initiate",
    description: "A dying star is emitting sequential bursts of cosmic radiation. We need a program that reads the signal rate, filters out atmospheric noise (values below 10), and returns the decrypted base-3 coordinates.",
    starterCode: `// Human Signal Decryptor
function decryptSignal(signalArray) {
  let filtered = [];
  for (let i = 0; i < signalArray.length; i++) {
    if (signalArray[i] >= 10) {
      filtered.push(signalArray[i] * 3);
    }
  }
  return filtered;
}`,
    expectedOutputHint: "An array of energy bursts amplified by an alien factor of 3."
  },
  {
    id: "spore-growth",
    title: "Mycelial Colonization Tracker",
    difficulty: "Officer",
    description: "To compute the optimal navigation vectors, we must grow a spore colony. The biomass doubles every spore bloom, but loses 15 units per cycle to enzyme secretions. Track the final biomass after 5 blooms starting at 50 units.",
    starterCode: `// Spore Biomass growth
let biomass = 50;
for (let cycle = 1; cycle <= 5; cycle++) {
  biomass = (biomass * 2) - 15;
}
console.log("Final biomass:", biomass);`,
    expectedOutputHint: "Expected final biomass calculations with logarithmic decay offsets."
  },
  {
    id: "warp-core",
    title: "Warp Core Chrono-Stabilizer",
    difficulty: "Grandmaster",
    description: "The warp core has an unstable frequency that fluctuates based on gravitational tides. We must predict the future frequency state by calculating the gravity-well coefficient and folding it backwards through the temporal field.",
    starterCode: `// Predict warp core frequency
let baseFrequency = 440; // Hz
let gravityCoefficient = 1.618;
// Must warp backward to line 2 to cancel the static decay
let balancedFrequency = baseFrequency * Math.pow(gravityCoefficient, 4) / 2.718;
console.log("Core Frequency stabilized at:", balancedFrequency);`,
    expectedOutputHint: "Stable tachyon-locked wave frequency calculated outside sequential flow."
  }
];

export const TEMPLATES: Record<Language, Array<{ name: string; description: string; code: string }>> = {
  zeta: [
    {
      name: "Psi hello-orbit.gly",
      description: "Broadcasts greetings to planetary orbits",
      code: `// Initializing Telepathic Grid
COORDINATE transmission = QUANTUM_NODE(1);

TESS_LOOP(transmission < 5) {
  PSI_PROJECTION("Broadcasting Sector-9 Greeting Vector: " + transmission);
  transmission = RESONATE(transmission);
}

COLLAPSE(transmission);`
    },
    {
      name: "anti-gravity-drive.gly",
      description: "Calculates metric tensor vectors for sub-light levitation",
      code: `COORDINATE gravity_well = QUANTUM_NODE(9.81);
COORDINATE core_resonance = QUANTUM_NODE(0.0);

TESS_LOOP(gravity_well > 0.1) {
  PSI_PROJECTION("Sinking gravity coordinate... current factor: " + gravity_well);
  gravity_well = RESONATE(gravity_well * -0.5); // non-Euclidean decay
  core_resonance = RESONATE(core_resonance + 4.2);
}

PSI_PROJECTION("Levitation threshold achieved. Resonance locked.");
COLLAPSE(core_resonance);`
    }
  ],
  xylor: [
    {
      name: "spore-hello.spr",
      description: "Feeds carbon-units and sheds bioluminescent spores",
      code: `// Fungal Node Initialization
NUTRIENT_NODE carbon_substrate = 80;

SPORE_BLOOM(carbon_substrate > 10) {
  ENZYME_SECRETION("biolum-grow", carbon_substrate);
  // Absorb 12 carbon per bloom and propagate spores
  carbon_substrate = SHED_SPORES(carbon_substrate, 12);
}

ENZYME_SECRETION("digest-complete", 1);`
    },
    {
      name: "carbon-recycler.spr",
      description: "Digests toxic starship exhausts and synthesizes synthetic nutrients",
      code: `NUTRIENT_NODE toxin_index = 500;
NUTRIENT_NODE synthesized_mushrooms = 0;

SPORE_BLOOM(toxin_index > 0) {
  ENZYME_SECRETION("break-heavy-elements", toxin_index);
  toxin_index = SHED_SPORES(toxin_index, 75); // consume 75 toxins
  synthesized_mushrooms = synthesized_mushrooms + 3;
}

ENZYME_SECRETION("digest-yield", synthesized_mushrooms);`
    }
  ],
  gorgon: [
    {
      name: "chrono-hello.wh",
      description: "Sends signals to the past to greet previous operators",
      code: `// Secure Timeline Anchors
TIME_ANCHOR timeline_offset = CHRONO_PRESENT();

TEMPORAL_WORMHOLE(timeline_offset < CHRONO_FUTURE(3)) {
  CHRONICLE_ECHO("Temporal greeting echoing to timeline step " + timeline_offset);
  // Rewind timeline offset relative to Tachyon flow
  timeline_offset = TIME_WARP(timeline_offset, 1);
}

CHRONICLE_ECHO("Timeline stabilized. Future results retrieved successfully.");`
    },
    {
      name: "paradox-absorber.wh",
      description: "Safely drains chronons to avoid erasing your own software creation",
      code: `TIME_ANCHOR reality_index = CHRONO_PRESENT();
TIME_ANCHOR paradox_buffer = CHRONO_FUTURE(-2); // Accessing the past!

TEMPORAL_WORMHOLE(reality_index > paradox_buffer) {
  CHRONICLE_ECHO("Absorbing parallel chronological friction...");
  reality_index = TIME_WARP(reality_index, -1);
}

CHRONICLE_ECHO("Status: Safe. Chronological loop variance reduced to 0.001%.");`
    }
  ]
};
