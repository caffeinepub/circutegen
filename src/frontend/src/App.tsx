import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  Download,
  Info,
  Layers,
  Loader2,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { Toaster, toast } from "sonner";
import {
  COMPONENT_TYPE_INFO,
  type CircuitGraph,
  type ComponentType,
  EXAMPLE_PROMPTS,
  parsePrompt,
} from "./circuitEngine";
import CircuitRenderer from "./components/CircuitRenderer";
import { useRecentPrompts, useSavePrompt } from "./hooks/useQueries";

// ─── Types ────────────────────────────────────────────────────────────────────

// ─── Header ──────────────────────────────────────────────────────────────────

function Header() {
  return (
    <header className="relative border-b border-border/50 bg-card/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/30 to-cyan-500/10 border border-cyan-500/40 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan" strokeWidth={1.5} />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan/80 animate-electron-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight text-foreground">
              Circu<span className="text-cyan">te</span>Gen
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              circuit diagram generator
            </p>
          </div>
        </motion.div>

        <motion.div
          className="hidden sm:flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-cyan/20 bg-cyan/5">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan/80 animate-electron-pulse" />
            <span className="text-xs font-mono text-cyan/70">
              Live Simulation
            </span>
          </div>
        </motion.div>
      </div>
    </header>
  );
}

// ─── Example Prompts Panel ───────────────────────────────────────────────────

function ExamplesPanel({ onSelect }: { onSelect: (p: string) => void }) {
  return (
    <div>
      <p className="text-xs font-mono text-muted-foreground mb-3 uppercase tracking-widest">
        Example Circuits
      </p>
      <div className="flex flex-wrap gap-2">
        {EXAMPLE_PROMPTS.map((ex, i) => (
          <motion.button
            key={ex.prompt}
            data-ocid={`examples.item.${i + 1}`}
            onClick={() => onSelect(ex.prompt)}
            className="px-3 py-1.5 rounded-md text-xs font-mono border border-border/60 text-muted-foreground hover:border-cyan/50 hover:text-cyan hover:bg-cyan/5 transition-all duration-150 cursor-pointer"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {ex.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Recent Prompts ──────────────────────────────────────────────────────────

function RecentPromptsPanel({ onSelect }: { onSelect: (p: string) => void }) {
  const { data: prompts, isLoading } = useRecentPrompts();

  if (!isLoading && (!prompts || prompts.length === 0)) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
          Recent
        </p>
      </div>
      <div className="space-y-1.5">
        {isLoading
          ? (["sk1", "sk2", "sk3"] as const).map((sk) => (
              <Skeleton
                key={sk}
                className="h-7 w-full rounded-md"
                data-ocid="history.loading_state"
              />
            ))
          : prompts?.slice(0, 5).map((p, i) => (
              <motion.button
                key={p.id.toString()}
                data-ocid={`history.item.${i + 1}`}
                onClick={() => onSelect(p.text)}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono text-muted-foreground hover:text-cyan hover:bg-cyan/5 border border-transparent hover:border-cyan/20 transition-all duration-150 text-left group"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <ChevronRight className="w-3 h-3 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                <span className="truncate">{p.text}</span>
              </motion.button>
            ))}
      </div>
    </div>
  );
}

// ─── Circuit Legend ──────────────────────────────────────────────────────────

function CircuitLegend({ isClosedLoop }: { isClosedLoop: boolean }) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-0.5"
          style={{ background: "linear-gradient(to right, #00d4e8, #7ff8ff)" }}
        />
        <span className="text-xs font-mono text-muted-foreground">
          Conductor
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ background: "#7ff8ff", boxShadow: "0 0 6px #00d4e8" }}
        />
        <span className="text-xs font-mono text-muted-foreground">
          {isClosedLoop ? "Electron flow →" : "No current"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ background: "#78d48f" }}
        />
        <span className="text-xs font-mono text-muted-foreground">
          Voltage node
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ background: "#ffb830" }}
        />
        <span className="text-xs font-mono text-muted-foreground">
          LED active
        </span>
      </div>
    </div>
  );
}

// ─── Simulation Status ───────────────────────────────────────────────────────

function SimulationStatus({ circuit }: { circuit: CircuitGraph }) {
  return (
    <div
      data-ocid="simulation.panel"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono ${
        circuit.isClosedLoop
          ? "border-green-500/30 bg-green-500/10 text-green-400"
          : "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
      }`}
    >
      {circuit.isClosedLoop ? (
        <CheckCircle2 className="w-3.5 h-3.5" />
      ) : (
        <AlertCircle className="w-3.5 h-3.5" />
      )}
      {circuit.isClosedLoop ? "Circuit Complete ✓" : "Open Circuit ⚠"}
    </div>
  );
}

// ─── Download Logic ──────────────────────────────────────────────────────────

async function downloadPNG(
  svgRef: React.RefObject<SVGSVGElement | null>,
  title: string,
) {
  const svgEl = svgRef.current;
  if (!svgEl) return;

  // Serialize SVG to string
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgEl);

  // Create canvas
  const canvas = document.createElement("canvas");
  const scale = 2; // 2x for high DPI
  canvas.width = 700 * scale;
  canvas.height = 440 * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.scale(scale, scale);

  // Draw SVG onto canvas
  const img = new Image();
  const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  await new Promise<void>((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 700, 440);
      resolve();
    };
    img.onerror = reject;
    img.src = url;
  });

  URL.revokeObjectURL(url);

  canvas.toBlob((pngBlob) => {
    if (!pngBlob) return;
    const pngUrl = URL.createObjectURL(pngBlob);
    const a = document.createElement("a");
    a.href = pngUrl;
    a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
    URL.revokeObjectURL(pngUrl);
  }, "image/png");
}

function downloadSVG(
  svgRef: React.RefObject<SVGSVGElement | null>,
  title: string,
) {
  const svgEl = svgRef.current;
  if (!svgEl) return;
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgEl);
  const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Component Info Panel ─────────────────────────────────────────────────────

function ComponentInfoPanel({ circuit }: { circuit: CircuitGraph }) {
  const nonGround = circuit.components.filter(
    (c) => c.type !== "ground" && c.type !== "wire",
  );

  const categoryColors: Record<string, string> = {
    "Power Source": "text-red-400 border-red-500/30 bg-red-500/10",
    Passive: "text-blue-300 border-blue-400/30 bg-blue-400/10",
    Semiconductor: "text-purple-300 border-purple-400/30 bg-purple-400/10",
    IC: "text-orange-300 border-orange-400/30 bg-orange-400/10",
    Output: "text-yellow-300 border-yellow-400/30 bg-yellow-400/10",
    Control: "text-green-300 border-green-400/30 bg-green-400/10",
    Measurement: "text-teal-300 border-teal-400/30 bg-teal-400/10",
    Reference: "text-slate-300 border-slate-400/30 bg-slate-400/10",
    Connector: "text-cyan-300 border-cyan-400/30 bg-cyan-400/10",
  };

  return (
    <div data-ocid="component.panel" className="glass-panel rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-4 h-4 text-cyan" strokeWidth={1.5} />
        <h3 className="text-sm font-semibold text-foreground">
          Circuit Components
        </h3>
        <Badge
          variant="outline"
          className="ml-auto font-mono text-xs border-cyan/20 text-cyan/70"
        >
          {nonGround.length} parts
        </Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-border/40">
              <th className="text-left py-1.5 pr-3 text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                ID
              </th>
              <th className="text-left py-1.5 pr-3 text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                Component
              </th>
              <th className="text-left py-1.5 pr-3 text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                Type
              </th>
              <th className="text-left py-1.5 pr-3 text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                Value
              </th>
              <th className="text-left py-1.5 text-muted-foreground font-medium uppercase tracking-wider text-[10px] hidden md:table-cell">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {nonGround.map((comp, i) => {
              const info = COMPONENT_TYPE_INFO[comp.type];
              const colorClass =
                categoryColors[info?.category ?? "Connector"] ??
                "text-cyan-300 border-cyan-400/30 bg-cyan-400/10";
              return (
                <tr
                  key={comp.id}
                  data-ocid={`component.row.${i + 1}`}
                  className="border-b border-border/20 hover:bg-white/3 transition-colors"
                >
                  <td className="py-2 pr-3 text-cyan font-bold">
                    {comp.label || comp.id}
                  </td>
                  <td className="py-2 pr-3 text-foreground/90">
                    {info?.name ?? comp.type}
                  </td>
                  <td className="py-2 pr-3">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-bold ${colorClass}`}
                    >
                      {info?.symbol ?? comp.type}
                      {info?.category ? ` · ${info.category}` : ""}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">
                    {comp.value || "—"}
                  </td>
                  <td className="py-2 text-muted-foreground/70 hidden md:table-cell max-w-[200px] truncate">
                    {info?.description ?? ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Component Types Reference ────────────────────────────────────────────────

const ALL_DISPLAY_TYPES: ComponentType[] = [
  "battery",
  "resistor",
  "capacitor",
  "inductor",
  "led",
  "diode",
  "zener",
  "switch",
  "transistor",
  "opamp",
  "ic555",
  "motor",
  "transformer",
  "voltmeter",
];

function ComponentTypesReference() {
  const [expanded, setExpanded] = useState(false);

  const categoryColors: Record<string, string> = {
    "Power Source": "border-red-500/30 bg-red-500/8 text-red-300",
    Passive: "border-blue-400/30 bg-blue-400/8 text-blue-200",
    Semiconductor: "border-purple-400/30 bg-purple-400/8 text-purple-200",
    IC: "border-orange-400/30 bg-orange-400/8 text-orange-200",
    Output: "border-yellow-400/30 bg-yellow-400/8 text-yellow-200",
    Control: "border-green-400/30 bg-green-400/8 text-green-200",
    Measurement: "border-teal-400/30 bg-teal-400/8 text-teal-200",
    Reference: "border-slate-400/30 bg-slate-400/8 text-slate-200",
    Connector: "border-cyan-400/30 bg-cyan-400/8 text-cyan-200",
  };

  return (
    <div className="glass-panel rounded-xl p-4">
      <button
        data-ocid="component.types.toggle"
        type="button"
        className="w-full flex items-center gap-2 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <Layers className="w-4 h-4 text-cyan" strokeWidth={1.5} />
        <h3 className="text-sm font-semibold text-foreground flex-1">
          Component Types
        </h3>
        <span className="text-xs font-mono text-muted-foreground/60">
          {expanded ? "▲ hide" : "▼ show all"}
        </span>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 grid grid-cols-1 gap-1.5">
              {ALL_DISPLAY_TYPES.map((type) => {
                const info = COMPONENT_TYPE_INFO[type];
                const colorClass =
                  categoryColors[info?.category ?? "Connector"] ??
                  "border-cyan-400/30 bg-cyan-400/8 text-cyan-200";
                return (
                  <div
                    key={type}
                    className={`flex items-start gap-2.5 px-2.5 py-2 rounded-lg border ${colorClass}`}
                  >
                    <span className="font-mono text-[10px] font-bold shrink-0 w-8 text-center opacity-80 mt-0.5">
                      {info.symbol}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold leading-tight">
                        {info.name}
                      </div>
                      <div className="text-[10px] opacity-60 mt-0.5 leading-tight">
                        {info.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [circuit, setCircuit] = useState<CircuitGraph | null>(() =>
    parsePrompt("LED with resistor and battery"),
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const savePrompt = useSavePrompt();

  const handleGenerate = useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      toast.error("Enter a circuit description first");
      return;
    }

    setIsGenerating(true);
    // Small artificial delay for UX feel
    await new Promise((r) => setTimeout(r, 600));
    const result = parsePrompt(trimmed);
    setCircuit(result);
    setIsGenerating(false);

    // Fire-and-forget backend save
    savePrompt.mutate(trimmed, {
      onError: () => {
        /* silent */
      },
    });

    toast.success(`Generated: ${result.title}`, {
      description: result.description,
      duration: 3000,
    });
  }, [prompt, savePrompt]);

  const handleExampleSelect = useCallback(
    (exPrompt: string) => {
      setPrompt(exPrompt);
      const result = parsePrompt(exPrompt);
      setCircuit(result);
      savePrompt.mutate(exPrompt, { onError: () => {} });
      toast.success(`Loaded: ${result.title}`);
    },
    [savePrompt],
  );

  const handleDownloadPNG = useCallback(async () => {
    if (!circuit) return;
    try {
      await downloadPNG(svgRef, circuit.title);
      toast.success("PNG downloaded!");
    } catch {
      toast.error("Failed to download PNG");
    }
  }, [circuit]);

  const handleDownloadSVG = useCallback(() => {
    if (!circuit) return;
    downloadSVG(svgRef, circuit.title);
    toast.success("SVG downloaded!");
  }, [circuit]);

  const currentYear = new Date().getFullYear();
  const hostname = window.location.hostname;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster position="top-right" theme="dark" richColors />
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-[420px,1fr] gap-6 h-full">
          {/* ── Left Panel ─────────────────────────────────────────────── */}
          <motion.aside
            className="flex flex-col gap-5"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Prompt input card */}
            <div className="glass-panel rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-cyan" strokeWidth={1.5} />
                <h2 className="text-sm font-semibold text-foreground">
                  Describe Your Circuit
                </h2>
              </div>

              <Textarea
                data-ocid="prompt.textarea"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    void handleGenerate();
                  }
                }}
                placeholder="e.g. LED with resistor and 9V battery, RC low-pass filter, 555 timer oscillator..."
                className="min-h-[110px] bg-input/50 border-border/60 text-sm font-mono placeholder:text-muted-foreground/50 resize-none focus-visible:ring-1 focus-visible:ring-cyan/40 focus-visible:border-cyan/40"
                rows={4}
              />

              <Button
                data-ocid="prompt.submit_button"
                onClick={() => void handleGenerate()}
                disabled={isGenerating || !prompt.trim()}
                className="w-full btn-cyan-glow bg-cyan/15 hover:bg-cyan/25 border border-cyan/40 text-cyan font-mono text-sm font-semibold transition-all duration-200"
                variant="outline"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="animate-generating-pulse">
                      Generating Circuit...
                    </span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Circuit
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground/60 font-mono text-center">
                ⌘+Enter to generate
              </p>
            </div>

            {/* Examples */}
            <div className="glass-panel rounded-xl p-5">
              <ExamplesPanel onSelect={handleExampleSelect} />
            </div>

            {/* Recent prompts */}
            <div className="glass-panel rounded-xl p-5">
              <RecentPromptsPanel onSelect={handleExampleSelect} />
            </div>

            {/* Component types reference */}
            <ComponentTypesReference />
          </motion.aside>

          {/* ── Right Panel ─────────────────────────────────────────────── */}
          <motion.section
            className="flex flex-col gap-4"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          >
            {/* Circuit title & status */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={circuit?.title}
                    className="text-lg font-bold font-display text-foreground"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.2 }}
                  >
                    {circuit?.title ?? "Ready to Generate"}
                  </motion.h2>
                </AnimatePresence>
                {circuit?.description && (
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {circuit.description}
                  </p>
                )}
              </div>
              {circuit && <SimulationStatus circuit={circuit} />}
            </div>

            {/* Canvas */}
            <div
              data-ocid="circuit.canvas_target"
              className="relative rounded-xl overflow-hidden border border-border/50 circuit-canvas-bg flex-1 min-h-[350px] lg:min-h-[420px]"
              style={{ aspectRatio: "16/10" }}
            >
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="loading"
                    className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                    data-ocid="circuit.loading_state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-2 border-cyan/20 border-t-cyan animate-spin" />
                      <Cpu className="absolute inset-0 m-auto w-5 h-5 text-cyan/60" />
                    </div>
                    <p className="text-sm font-mono text-muted-foreground animate-generating-pulse">
                      Analyzing circuit topology...
                    </p>
                  </motion.div>
                ) : circuit ? (
                  <motion.div
                    key={circuit.title}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <CircuitRenderer circuit={circuit} svgRef={svgRef} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                    data-ocid="circuit.empty_state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Cpu
                      className="w-10 h-10 text-muted-foreground/30"
                      strokeWidth={1}
                    />
                    <p className="text-sm font-mono text-muted-foreground/50">
                      Enter a prompt and click Generate
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Component info panel */}
            {circuit && <ComponentInfoPanel circuit={circuit} />}

            {/* Legend & Download controls */}
            <div className="glass-panel rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CircuitLegend isClosedLoop={circuit?.isClosedLoop ?? false} />

              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant="outline"
                  className="font-mono text-xs border-cyan/20 text-cyan/70 hidden sm:flex"
                >
                  {circuit?.components.length ?? 0} components
                </Badge>
                <Separator
                  orientation="vertical"
                  className="h-6 hidden sm:block"
                />
                <Button
                  data-ocid="download.primary_button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleDownloadPNG()}
                  disabled={!circuit}
                  className="font-mono text-xs border-border/60 hover:border-cyan/40 hover:text-cyan gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  PNG
                </Button>
                <Button
                  data-ocid="download.secondary_button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSVG}
                  disabled={!circuit}
                  className="font-mono text-xs border-border/60 hover:border-cyan/40 hover:text-cyan gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  SVG
                </Button>
              </div>
            </div>
          </motion.section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-xs font-mono text-muted-foreground/50">
            © {currentYear} CircuteGen
          </p>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
          >
            Built with ♥ using caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
