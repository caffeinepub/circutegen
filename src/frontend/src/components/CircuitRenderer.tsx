import { type FC, useRef } from "react";
import { COMPONENT_TYPE_INFO } from "../circuitEngine";
import type { CircuitGraph, ComponentNode, WirePath } from "../circuitEngine";

// ─── SVG Color Constants ──────────────────────────────────────────────────────
// Using literal values for SVG drawing (CSS vars can't be used in SVG attributes directly)
const COLORS = {
  wire: "#00d4e8",
  wireDim: "#1a4a55",
  electron: "#7ff8ff",
  electronGlow: "#00d4e8",
  component: "#c5edf5",
  componentActive: "#a0e4f4",
  componentDim: "#374a52",
  ledGlow: "#ffb830",
  ledGlowBright: "#ffd700",
  label: "#7bb8c8",
  labelBright: "#b8e4f0",
  voltage: "#78d48f",
  background: "#0a1220",
  componentFill: "#0d1e2e",
  componentStroke: "#1a5060",
  activeStroke: "#00d4e8",
  batteryPos: "#ff6b6b",
  batteryNeg: "#6b9fff",
  transistorArrow: "#78d48f",
} as const;

// ─── Individual Component SVG Renderers ─────────────────────────────────────

function BatterySymbol({ node }: { node: ComponentNode }) {
  const { x, y, active, label, value } = node;
  const opacity = active ? 1 : 0.4;
  return (
    <g opacity={opacity} className={active ? "component-active" : ""}>
      {/* Vertical body */}
      <line
        x1={x}
        y1={y - 45}
        x2={x}
        y2={y - 28}
        stroke={COLORS.wire}
        strokeWidth={2}
      />
      {/* Long positive plate */}
      <line
        x1={x - 12}
        y1={y - 28}
        x2={x + 12}
        y2={y - 28}
        stroke={COLORS.batteryPos}
        strokeWidth={2.5}
      />
      {/* Short negative plate */}
      <line
        x1={x - 7}
        y1={y - 20}
        x2={x + 7}
        y2={y - 20}
        stroke={COLORS.batteryNeg}
        strokeWidth={2}
      />
      {/* Gap between cells */}
      <line
        x1={x}
        y1={y - 12}
        x2={x}
        y2={y - 20}
        stroke={COLORS.wire}
        strokeWidth={2}
      />
      {/* Second cell */}
      <line
        x1={x - 12}
        y1={y - 12}
        x2={x + 12}
        y2={y - 12}
        stroke={COLORS.batteryPos}
        strokeWidth={2.5}
      />
      <line
        x1={x - 7}
        y1={y - 4}
        x2={x + 7}
        y2={y - 4}
        stroke={COLORS.batteryNeg}
        strokeWidth={2}
      />
      <line
        x1={x}
        y1={y + 45}
        x2={x}
        y2={y - 4}
        stroke={COLORS.wire}
        strokeWidth={2}
      />
      {/* + / - labels */}
      <text
        x={x + 16}
        y={y - 24}
        fill={COLORS.batteryPos}
        fontSize={11}
        fontFamily="JetBrains Mono, monospace"
        fontWeight="bold"
      >
        +
      </text>
      <text
        x={x + 16}
        y={y - 2}
        fill={COLORS.batteryNeg}
        fontSize={11}
        fontFamily="JetBrains Mono, monospace"
        fontWeight="bold"
      >
        −
      </text>
      {/* Value label */}
      {value && (
        <text
          x={x - 30}
          y={y + 4}
          fill={COLORS.label}
          fontSize={9}
          fontFamily="JetBrains Mono, monospace"
        >
          {label || value}
        </text>
      )}
    </g>
  );
}

function ResistorSymbol({ node }: { node: ComponentNode }) {
  const { x, y, active, label, value } = node;
  const opacity = active ? 1 : 0.4;
  // Zigzag 50px wide, centered at (x, y)
  const w = 50;
  const h = 10;
  const startX = x - w / 2;
  const zigzag = [
    `M ${startX - 20} ${y}`,
    `L ${startX} ${y}`,
    `L ${startX + 5} ${y - h}`,
    `L ${startX + 15} ${y + h}`,
    `L ${startX + 25} ${y - h}`,
    `L ${startX + 35} ${y + h}`,
    `L ${startX + 45} ${y - h}`,
    `L ${startX + 55} ${y + h}`,
    `L ${startX + 60} ${y}`,
    `L ${startX + 70} ${y}`,
  ].join(" ");
  return (
    <g opacity={opacity}>
      <path
        d={zigzag}
        stroke={active ? COLORS.activeStroke : COLORS.componentDim}
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {label && (
        <text
          x={x}
          y={y - 16}
          fill={COLORS.label}
          fontSize={9}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
        >
          {label}
        </text>
      )}
      {value && (
        <text
          x={x}
          y={y + 22}
          fill={COLORS.labelBright}
          fontSize={9}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
        >
          {value}
        </text>
      )}
    </g>
  );
}

function CapacitorSymbol({ node }: { node: ComponentNode }) {
  const { x, y, active, label, value } = node;
  const opacity = active ? 1 : 0.4;
  const plateW = 18;
  const gap = 8;
  return (
    <g opacity={opacity}>
      <line
        x1={x}
        y1={y - 40}
        x2={x}
        y2={y - gap / 2}
        stroke={active ? COLORS.activeStroke : COLORS.componentDim}
        strokeWidth={2}
      />
      <line
        x1={x - plateW}
        y1={y - gap / 2}
        x2={x + plateW}
        y2={y - gap / 2}
        stroke={active ? COLORS.componentActive : COLORS.componentDim}
        strokeWidth={3}
      />
      <line
        x1={x - plateW}
        y1={y + gap / 2}
        x2={x + plateW}
        y2={y + gap / 2}
        stroke={active ? COLORS.componentActive : COLORS.componentDim}
        strokeWidth={3}
      />
      <line
        x1={x}
        y1={y + gap / 2}
        x2={x}
        y2={y + 40}
        stroke={active ? COLORS.activeStroke : COLORS.componentDim}
        strokeWidth={2}
      />
      {label && (
        <text
          x={x + 26}
          y={y - 4}
          fill={COLORS.label}
          fontSize={9}
          fontFamily="JetBrains Mono, monospace"
        >
          {label}
        </text>
      )}
      {value && (
        <text
          x={x + 26}
          y={y + 10}
          fill={COLORS.labelBright}
          fontSize={9}
          fontFamily="JetBrains Mono, monospace"
        >
          {value}
        </text>
      )}
    </g>
  );
}

function InductorSymbol({ node }: { node: ComponentNode }) {
  const { x, y, active, label, value } = node;
  const opacity = active ? 1 : 0.4;
  const bumpR = 8;
  const numBumps = 5;
  const startX = x - (numBumps * bumpR * 2) / 2;
  // Build arc path for bumps
  let d = `M ${startX - 18} ${y}`;
  for (let i = 0; i < numBumps; i++) {
    const cx = startX + i * bumpR * 2 + bumpR;
    d += ` A ${bumpR} ${bumpR} 0 0 1 ${cx + bumpR} ${y}`;
  }
  d += ` L ${startX + numBumps * bumpR * 2 + 18} ${y}`;
  return (
    <g opacity={opacity}>
      <path
        d={d}
        stroke={active ? COLORS.activeStroke : COLORS.componentDim}
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {label && (
        <text
          x={x}
          y={y - 16}
          fill={COLORS.label}
          fontSize={9}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
        >
          {label}
        </text>
      )}
      {value && (
        <text
          x={x}
          y={y + 22}
          fill={COLORS.labelBright}
          fontSize={9}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
        >
          {value}
        </text>
      )}
    </g>
  );
}

function LEDSymbol({ node }: { node: ComponentNode }) {
  const { x, y, active, label } = node;
  const opacity = active ? 1 : 0.4;
  const triSize = 16;
  const glowColor = COLORS.ledGlow;
  return (
    <g opacity={opacity} className={active ? "led-glow" : ""}>
      {/* Glow halo when active */}
      {active && (
        <circle cx={x} cy={y} r={28} fill={glowColor} opacity={0.12} />
      )}
      {/* Lead in */}
      <line
        x1={x - 36}
        y1={y}
        x2={x - triSize}
        y2={y}
        stroke={active ? COLORS.wire : COLORS.wireDim}
        strokeWidth={2}
      />
      {/* Triangle (diode) pointing right */}
      <polygon
        points={`${x - triSize},${y - triSize} ${x - triSize},${y + triSize} ${x + triSize},${y}`}
        fill={active ? `${glowColor}33` : "none"}
        stroke={active ? COLORS.ledGlowBright : COLORS.componentDim}
        strokeWidth={2}
      />
      {/* Bar */}
      <line
        x1={x + triSize}
        y1={y - triSize}
        x2={x + triSize}
        y2={y + triSize}
        stroke={active ? COLORS.ledGlowBright : COLORS.componentDim}
        strokeWidth={2.5}
      />
      {/* Lead out */}
      <line
        x1={x + triSize}
        y1={y}
        x2={x + triSize + 20}
        y2={y}
        stroke={active ? COLORS.wire : COLORS.wireDim}
        strokeWidth={2}
      />
      {/* Light rays */}
      {active && (
        <>
          <line
            x1={x + 12}
            y1={y - 22}
            x2={x + 24}
            y2={y - 34}
            stroke={COLORS.ledGlowBright}
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={0.8}
          />
          <line
            x1={x + 20}
            y1={y - 14}
            x2={x + 35}
            y2={y - 24}
            stroke={COLORS.ledGlowBright}
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={0.8}
          />
        </>
      )}
      {label && (
        <text
          x={x}
          y={y + 34}
          fill={COLORS.label}
          fontSize={9}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
        >
          {label}
        </text>
      )}
    </g>
  );
}

function DiodeSymbol({ node }: { node: ComponentNode }) {
  const { x, y, active, label, value } = node;
  const opacity = active ? 1 : 0.4;
  const triSize = 14;
  return (
    <g opacity={opacity}>
      <line
        x1={x - 30}
        y1={y}
        x2={x - triSize}
        y2={y}
        stroke={active ? COLORS.wire : COLORS.wireDim}
        strokeWidth={2}
      />
      <polygon
        points={`${x - triSize},${y - triSize} ${x - triSize},${y + triSize} ${x + triSize},${y}`}
        fill={active ? `${COLORS.activeStroke}22` : "none"}
        stroke={active ? COLORS.activeStroke : COLORS.componentDim}
        strokeWidth={2}
      />
      <line
        x1={x + triSize}
        y1={y - triSize}
        x2={x + triSize}
        y2={y + triSize}
        stroke={active ? COLORS.activeStroke : COLORS.componentDim}
        strokeWidth={2.5}
      />
      <line
        x1={x + triSize}
        y1={y}
        x2={x + 30}
        y2={y}
        stroke={active ? COLORS.wire : COLORS.wireDim}
        strokeWidth={2}
      />
      {label && (
        <text
          x={x}
          y={y - 22}
          fill={COLORS.label}
          fontSize={9}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
        >
          {label}
        </text>
      )}
      {value && (
        <text
          x={x}
          y={y + 28}
          fill={COLORS.labelBright}
          fontSize={9}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
        >
          {value}
        </text>
      )}
    </g>
  );
}

function SwitchSymbol({ node }: { node: ComponentNode }) {
  const { x, y, active, label, value } = node;
  const opacity = active ? 1 : 0.4;
  const isClosed = value === "closed";
  return (
    <g opacity={opacity}>
      <line
        x1={x - 30}
        y1={y}
        x2={x - 10}
        y2={y}
        stroke={active ? COLORS.wire : COLORS.wireDim}
        strokeWidth={2}
      />
      <circle
        cx={x - 10}
        cy={y}
        r={3}
        fill={active ? COLORS.activeStroke : COLORS.componentDim}
      />
      {isClosed ? (
        <line
          x1={x - 10}
          y1={y}
          x2={x + 10}
          y2={y}
          stroke={active ? COLORS.activeStroke : COLORS.componentDim}
          strokeWidth={2}
        />
      ) : (
        <line
          x1={x - 10}
          y1={y}
          x2={x + 8}
          y2={y - 14}
          stroke={active ? COLORS.activeStroke : COLORS.componentDim}
          strokeWidth={2}
        />
      )}
      <circle
        cx={x + 10}
        cy={y}
        r={3}
        fill={active ? COLORS.activeStroke : COLORS.componentDim}
      />
      <line
        x1={x + 10}
        y1={y}
        x2={x + 30}
        y2={y}
        stroke={active ? COLORS.wire : COLORS.wireDim}
        strokeWidth={2}
      />
      {label && (
        <text
          x={x}
          y={y - 18}
          fill={COLORS.label}
          fontSize={9}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
        >
          {label}
        </text>
      )}
    </g>
  );
}

function TransistorSymbol({ node }: { node: ComponentNode }) {
  const { x, y, active, label } = node;
  const opacity = active ? 1 : 0.4;
  return (
    <g opacity={opacity}>
      {/* Body circle */}
      <circle
        cx={x}
        cy={y}
        r={22}
        fill={COLORS.componentFill}
        stroke={active ? COLORS.activeStroke : COLORS.componentDim}
        strokeWidth={2}
      />
      {/* Base line */}
      <line
        x1={x - 22}
        y1={y}
        x2={x - 8}
        y2={y}
        stroke={active ? COLORS.wire : COLORS.wireDim}
        strokeWidth={2}
      />
      {/* Vertical bar */}
      <line
        x1={x - 8}
        y1={y - 16}
        x2={x - 8}
        y2={y + 16}
        stroke={active ? COLORS.activeStroke : COLORS.componentDim}
        strokeWidth={2.5}
      />
      {/* Collector */}
      <line
        x1={x - 8}
        y1={y - 10}
        x2={x + 18}
        y2={y - 22}
        stroke={active ? COLORS.activeStroke : COLORS.componentDim}
        strokeWidth={2}
      />
      {/* Emitter with arrow */}
      <line
        x1={x - 8}
        y1={y + 10}
        x2={x + 18}
        y2={y + 22}
        stroke={active ? COLORS.transistorArrow : COLORS.componentDim}
        strokeWidth={2}
      />
      {/* Emitter arrow head */}
      {active && (
        <polygon
          points={`${x + 18},${y + 22} ${x + 6},${y + 18} ${x + 12},${y + 30}`}
          fill={COLORS.transistorArrow}
        />
      )}
      {label && (
        <text
          x={x - 32}
          y={y + 40}
          fill={COLORS.label}
          fontSize={9}
          fontFamily="JetBrains Mono, monospace"
        >
          {label}
        </text>
      )}
    </g>
  );
}

function OpAmpSymbol({ node }: { node: ComponentNode }) {
  const { x, y, active, label } = node;
  const opacity = active ? 1 : 0.4;
  const w = 50;
  const h = 40;
  return (
    <g opacity={opacity}>
      {/* Triangle body */}
      <polygon
        points={`${x - w / 2},${y - h / 2} ${x - w / 2},${y + h / 2} ${x + w / 2},${y}`}
        fill={COLORS.componentFill}
        stroke={active ? COLORS.activeStroke : COLORS.componentDim}
        strokeWidth={2}
      />
      {/* + input */}
      <line
        x1={x - w / 2 - 15}
        y1={y - 12}
        x2={x - w / 2}
        y2={y - 12}
        stroke={active ? COLORS.wire : COLORS.wireDim}
        strokeWidth={2}
      />
      <text
        x={x - w / 2 + 5}
        y={y - 8}
        fill={COLORS.batteryPos}
        fontSize={9}
        fontFamily="JetBrains Mono, monospace"
      >
        +
      </text>
      {/* - input */}
      <line
        x1={x - w / 2 - 15}
        y1={y + 12}
        x2={x - w / 2}
        y2={y + 12}
        stroke={active ? COLORS.wire : COLORS.wireDim}
        strokeWidth={2}
      />
      <text
        x={x - w / 2 + 5}
        y={y + 16}
        fill={COLORS.batteryNeg}
        fontSize={9}
        fontFamily="JetBrains Mono, monospace"
      >
        −
      </text>
      {/* Output */}
      <line
        x1={x + w / 2}
        y1={y}
        x2={x + w / 2 + 15}
        y2={y}
        stroke={active ? COLORS.wire : COLORS.wireDim}
        strokeWidth={2}
      />
      {label && (
        <text
          x={x + 5}
          y={y + 5}
          fill={COLORS.labelBright}
          fontSize={8}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
        >
          {label}
        </text>
      )}
    </g>
  );
}

function GroundSymbol({ node }: { node: ComponentNode }) {
  const { x, y, active } = node;
  const opacity = active ? 0.8 : 0.3;
  return (
    <g opacity={opacity}>
      <line
        x1={x}
        y1={y - 20}
        x2={x}
        y2={y}
        stroke={active ? COLORS.wire : COLORS.wireDim}
        strokeWidth={2}
      />
      <line
        x1={x - 16}
        y1={y}
        x2={x + 16}
        y2={y}
        stroke={active ? COLORS.componentActive : COLORS.componentDim}
        strokeWidth={2.5}
      />
      <line
        x1={x - 10}
        y1={y + 7}
        x2={x + 10}
        y2={y + 7}
        stroke={active ? COLORS.componentActive : COLORS.componentDim}
        strokeWidth={2}
      />
      <line
        x1={x - 4}
        y1={y + 14}
        x2={x + 4}
        y2={y + 14}
        stroke={active ? COLORS.componentActive : COLORS.componentDim}
        strokeWidth={1.5}
      />
    </g>
  );
}

function IC555Symbol({ node }: { node: ComponentNode }) {
  const { x, y, active, label } = node;
  const opacity = active ? 1 : 0.4;
  const w = 60;
  const h = 80;
  return (
    <g opacity={opacity}>
      <rect
        x={x - w / 2}
        y={y - h / 2}
        width={w}
        height={h}
        fill={COLORS.componentFill}
        stroke={active ? COLORS.activeStroke : COLORS.componentDim}
        strokeWidth={2}
        rx={3}
      />
      <text
        x={x}
        y={y + 4}
        fill={active ? COLORS.componentActive : COLORS.componentDim}
        fontSize={11}
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontWeight="bold"
      >
        {label}
      </text>
      {/* Pin stubs */}
      {([-28, -10, 10, 28] as const).map((dy) => (
        <line
          key={`lpin-${dy}`}
          x1={x - w / 2 - 8}
          y1={y + dy}
          x2={x - w / 2}
          y2={y + dy}
          stroke={active ? COLORS.wire : COLORS.wireDim}
          strokeWidth={1.5}
        />
      ))}
      {([-28, -10, 10, 28] as const).map((dy) => (
        <line
          key={`rpin-${dy}`}
          x1={x + w / 2}
          y1={y + dy}
          x2={x + w / 2 + 8}
          y2={y + dy}
          stroke={active ? COLORS.wire : COLORS.wireDim}
          strokeWidth={1.5}
        />
      ))}
    </g>
  );
}

function MotorSymbol({ node }: { node: ComponentNode }) {
  const { x, y, active, label } = node;
  const opacity = active ? 1 : 0.4;
  return (
    <g opacity={opacity}>
      <circle
        cx={x}
        cy={y}
        r={24}
        fill={COLORS.componentFill}
        stroke={active ? COLORS.activeStroke : COLORS.componentDim}
        strokeWidth={2}
      />
      <text
        x={x}
        y={y + 5}
        fill={active ? COLORS.componentActive : COLORS.componentDim}
        fontSize={12}
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontWeight="bold"
      >
        M
      </text>
      {label && (
        <text
          x={x}
          y={y + 36}
          fill={COLORS.label}
          fontSize={9}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
        >
          {label}
        </text>
      )}
    </g>
  );
}

function ZenerSymbol({ node }: { node: ComponentNode }) {
  const { x, y, active, label, value } = node;
  const opacity = active ? 1 : 0.4;
  const triSize = 14;
  return (
    <g opacity={opacity}>
      {/* Lead in */}
      <line
        x1={x}
        y1={y - 36}
        x2={x}
        y2={y - triSize}
        stroke={active ? COLORS.wire : COLORS.wireDim}
        strokeWidth={2}
      />
      {/* Triangle pointing down (vertical orientation) */}
      <polygon
        points={`${x - triSize},${y - triSize} ${x + triSize},${y - triSize} ${x},${y + triSize}`}
        fill={active ? `${COLORS.activeStroke}22` : "none"}
        stroke={active ? COLORS.activeStroke : COLORS.componentDim}
        strokeWidth={2}
      />
      {/* Zener bar with bent ends */}
      <line
        x1={x - triSize - 5}
        y1={y + triSize}
        x2={x + triSize + 5}
        y2={y + triSize}
        stroke={active ? COLORS.activeStroke : COLORS.componentDim}
        strokeWidth={2.5}
      />
      {/* Bent ends of zener bar */}
      <line
        x1={x - triSize - 5}
        y1={y + triSize}
        x2={x - triSize - 5}
        y2={y + triSize + 6}
        stroke={active ? COLORS.activeStroke : COLORS.componentDim}
        strokeWidth={2}
      />
      <line
        x1={x + triSize + 5}
        y1={y + triSize}
        x2={x + triSize + 5}
        y2={y + triSize - 6}
        stroke={active ? COLORS.activeStroke : COLORS.componentDim}
        strokeWidth={2}
      />
      {/* Lead out */}
      <line
        x1={x}
        y1={y + triSize}
        x2={x}
        y2={y + 40}
        stroke={active ? COLORS.wire : COLORS.wireDim}
        strokeWidth={2}
      />
      {label && (
        <text
          x={x + 22}
          y={y - 4}
          fill={COLORS.label}
          fontSize={9}
          fontFamily="JetBrains Mono, monospace"
        >
          {label}
        </text>
      )}
      {value && (
        <text
          x={x + 22}
          y={y + 10}
          fill={COLORS.labelBright}
          fontSize={9}
          fontFamily="JetBrains Mono, monospace"
        >
          {value}
        </text>
      )}
    </g>
  );
}

function TransformerSymbol({ node }: { node: ComponentNode }) {
  const { x, y, active, label, value } = node;
  const opacity = active ? 1 : 0.4;
  const bumpR = 7;
  const numBumps = 3;
  // Primary coil (left side)
  let primaryD = `M ${x - 40} ${y - 12}`;
  for (let i = 0; i < numBumps; i++) {
    const cy = y - 12 + i * bumpR * 2 + bumpR;
    primaryD += ` A ${bumpR} ${bumpR} 0 0 0 ${x - 40} ${cy + bumpR}`;
  }
  // Secondary coil (right side)
  let secondaryD = `M ${x + 40} ${y - 12}`;
  for (let i = 0; i < numBumps; i++) {
    const cy = y - 12 + i * bumpR * 2 + bumpR;
    secondaryD += ` A ${bumpR} ${bumpR} 0 0 1 ${x + 40} ${cy + bumpR}`;
  }
  return (
    <g opacity={opacity}>
      {/* Core line */}
      <line
        x1={x - 10}
        y1={y - 24}
        x2={x - 10}
        y2={y + 24}
        stroke={active ? COLORS.componentActive : COLORS.componentDim}
        strokeWidth={3}
      />
      <line
        x1={x + 10}
        y1={y - 24}
        x2={x + 10}
        y2={y + 24}
        stroke={active ? COLORS.componentActive : COLORS.componentDim}
        strokeWidth={3}
      />
      {/* Primary coil */}
      <path
        d={primaryD}
        stroke={active ? COLORS.activeStroke : COLORS.componentDim}
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Lead wires primary */}
      <line
        x1={x - 60}
        y1={y - 12}
        x2={x - 40}
        y2={y - 12}
        stroke={active ? COLORS.wire : COLORS.wireDim}
        strokeWidth={2}
      />
      <line
        x1={x - 60}
        y1={y + 30}
        x2={x - 40}
        y2={y + 30}
        stroke={active ? COLORS.wire : COLORS.wireDim}
        strokeWidth={2}
      />
      {/* Secondary coil */}
      <path
        d={secondaryD}
        stroke={active ? "#78d48f" : COLORS.componentDim}
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Lead wires secondary */}
      <line
        x1={x + 40}
        y1={y - 12}
        x2={x + 60}
        y2={y - 12}
        stroke={active ? COLORS.wire : COLORS.wireDim}
        strokeWidth={2}
      />
      <line
        x1={x + 40}
        y1={y + 30}
        x2={x + 60}
        y2={y + 30}
        stroke={active ? COLORS.wire : COLORS.wireDim}
        strokeWidth={2}
      />
      {label && (
        <text
          x={x}
          y={y - 32}
          fill={COLORS.label}
          fontSize={9}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
        >
          {label}
        </text>
      )}
      {value && (
        <text
          x={x}
          y={y + 44}
          fill={COLORS.labelBright}
          fontSize={9}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
        >
          {value}
        </text>
      )}
    </g>
  );
}

function VoltmeterSymbol({ node }: { node: ComponentNode }) {
  const { x, y, active, label, value } = node;
  const opacity = active ? 1 : 0.4;
  return (
    <g opacity={opacity}>
      <circle
        cx={x}
        cy={y}
        r={22}
        fill={COLORS.componentFill}
        stroke={active ? "#78d48f" : COLORS.componentDim}
        strokeWidth={2}
      />
      <text
        x={x}
        y={y + 5}
        fill={active ? "#78d48f" : COLORS.componentDim}
        fontSize={12}
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontWeight="bold"
      >
        V
      </text>
      {/* Lead left */}
      <line
        x1={x - 22}
        y1={y}
        x2={x - 36}
        y2={y}
        stroke={active ? COLORS.wire : COLORS.wireDim}
        strokeWidth={2}
      />
      {/* Lead right */}
      <line
        x1={x + 22}
        y1={y}
        x2={x + 36}
        y2={y}
        stroke={active ? COLORS.wire : COLORS.wireDim}
        strokeWidth={2}
      />
      {label && (
        <text
          x={x}
          y={y - 30}
          fill={COLORS.label}
          fontSize={9}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
        >
          {label}
        </text>
      )}
      {value && (
        <text
          x={x}
          y={y + 36}
          fill={COLORS.labelBright}
          fontSize={9}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
        >
          {value}
        </text>
      )}
    </g>
  );
}

// ─── Wire Renderer ────────────────────────────────────────────────────────────

interface WireProps {
  wire: WirePath;
  isClosedLoop: boolean;
  animIndex: number;
}

function WireElement({ wire, isClosedLoop, animIndex }: WireProps) {
  const pathId = `wire-path-${wire.id}`;
  const pointsStr = wire.points.map(([px, py]) => `${px},${py}`).join(" ");

  // Convert polyline points to SVG path for animateMotion
  const pathD = wire.points.reduce((acc, [px, py], i) => {
    return i === 0 ? `M ${px} ${py}` : `${acc} L ${px} ${py}`;
  }, "");

  const dur = 3 + (animIndex % 3) * 0.5;
  const delays = ["0s", `${dur * 0.33}s`, `${dur * 0.66}s`];

  return (
    <g>
      {/* Wire path */}
      <polyline
        points={pointsStr}
        stroke={COLORS.wire}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.85}
      />

      {/* Animated electrons when circuit is closed */}
      {isClosedLoop && (
        <>
          <defs>
            <path id={pathId} d={pathD} />
          </defs>
          {delays.map((delay) => (
            <circle
              key={`e-${delay}`}
              r={3}
              fill={COLORS.electron}
              opacity={0.9}
            >
              <animateMotion
                dur={`${dur}s`}
                begin={delay}
                repeatCount="indefinite"
                rotate="auto"
              >
                <mpath href={`#${pathId}`} />
              </animateMotion>
            </circle>
          ))}
          {/* Glow electrons */}
          {delays.map((delay) => (
            <circle
              key={`glow-${delay}`}
              r={5}
              fill={COLORS.electronGlow}
              opacity={0.3}
            >
              <animateMotion
                dur={`${dur}s`}
                begin={delay}
                repeatCount="indefinite"
                rotate="auto"
              >
                <mpath href={`#${pathId}`} />
              </animateMotion>
            </circle>
          ))}
        </>
      )}

      {/* Voltage drop label */}
      {isClosedLoop &&
        wire.voltageDrop &&
        wire.points.length >= 2 &&
        (() => {
          const mid = Math.floor(wire.points.length / 2);
          const [mx, my] = wire.points[mid];
          return (
            <text
              x={mx + 4}
              y={my - 6}
              fill={COLORS.voltage}
              fontSize={8}
              fontFamily="JetBrains Mono, monospace"
              opacity={0.7}
            >
              {wire.voltageDrop}
            </text>
          );
        })()}
    </g>
  );
}

// ─── Component Type Badge ─────────────────────────────────────────────────────

function ComponentTypeBadge({ node }: { node: ComponentNode }) {
  const info = COMPONENT_TYPE_INFO[node.type];
  if (!info || node.type === "ground" || node.type === "wire") return null;
  const { x, y } = node;

  // Position badge above the component (offset varies by type)
  const badgeY =
    node.type === "transistor" ||
    node.type === "opamp" ||
    node.type === "ic555" ||
    node.type === "motor" ||
    node.type === "voltmeter"
      ? y - 40
      : y - 28;

  return (
    <g opacity={node.active ? 0.75 : 0.3}>
      {/* Background pill */}
      <rect
        x={x - 20}
        y={badgeY - 10}
        width={40}
        height={12}
        rx={3}
        fill="#0a1f30"
        stroke="#1a4a60"
        strokeWidth={0.8}
      />
      <text
        x={x}
        y={badgeY}
        fill="#5cc8dc"
        fontSize={7}
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontWeight="bold"
      >
        {info.symbol}
      </text>
    </g>
  );
}

// ─── Component Dispatcher ────────────────────────────────────────────────────

function ComponentElement({
  node,
  index,
}: { node: ComponentNode; index: number }) {
  const delay = index * 0.08;
  return (
    <g
      style={{
        animation: `circuit-entrance 0.4s ease-out ${delay}s both`,
      }}
    >
      {node.type === "battery" && <BatterySymbol node={node} />}
      {node.type === "resistor" && <ResistorSymbol node={node} />}
      {node.type === "capacitor" && <CapacitorSymbol node={node} />}
      {node.type === "inductor" && <InductorSymbol node={node} />}
      {node.type === "led" && <LEDSymbol node={node} />}
      {node.type === "diode" && <DiodeSymbol node={node} />}
      {node.type === "zener" && <ZenerSymbol node={node} />}
      {node.type === "switch" && <SwitchSymbol node={node} />}
      {node.type === "transistor" && <TransistorSymbol node={node} />}
      {node.type === "opamp" && <OpAmpSymbol node={node} />}
      {node.type === "ground" && <GroundSymbol node={node} />}
      {node.type === "ic555" && <IC555Symbol node={node} />}
      {node.type === "motor" && <MotorSymbol node={node} />}
      {node.type === "transformer" && <TransformerSymbol node={node} />}
      {node.type === "voltmeter" && <VoltmeterSymbol node={node} />}
      <ComponentTypeBadge node={node} />
    </g>
  );
}

// ─── Main CircuitRenderer ────────────────────────────────────────────────────

interface CircuitRendererProps {
  circuit: CircuitGraph;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}

const CircuitRenderer: FC<CircuitRendererProps> = ({ circuit, svgRef }) => {
  const localRef = useRef<SVGSVGElement>(null);
  const ref = svgRef ?? localRef;

  // Reset animation state when circuit changes by forcing re-render key
  const circuitKey = circuit.title;

  return (
    <svg
      key={circuitKey}
      ref={ref}
      viewBox="0 0 700 440"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      style={{ background: COLORS.background }}
      role="img"
      aria-label={`Circuit diagram: ${circuit.title}`}
    >
      <title>{circuit.title}</title>
      <defs>
        {/* Glow filter for electrons */}
        <filter
          id="electron-glow"
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
        >
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* LED glow filter */}
        <filter
          id="led-glow-filter"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Component active glow */}
        <filter
          id="component-glow"
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
        >
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Dot grid background */}
      <defs>
        <pattern
          id="dotgrid"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="10" cy="10" r="0.8" fill="#1a3040" />
        </pattern>
      </defs>
      <rect width="700" height="440" fill="url(#dotgrid)" />

      {/* Wires (draw behind components) */}
      {circuit.wires.map((wire, i) => (
        <WireElement
          key={wire.id}
          wire={wire}
          isClosedLoop={circuit.isClosedLoop}
          animIndex={i}
        />
      ))}

      {/* Components */}
      {circuit.components.map((node, i) => (
        <ComponentElement key={node.id} node={node} index={i} />
      ))}

      {/* Status indicator */}
      <g transform="translate(14, 420)">
        <circle
          cx={6}
          cy={-6}
          r={4}
          fill={circuit.isClosedLoop ? "#78d48f" : "#f0a830"}
          opacity={0.9}
        >
          {circuit.isClosedLoop && (
            <animate
              attributeName="opacity"
              values="0.9;0.4;0.9"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
        </circle>
        <text
          x={15}
          y={-2}
          fill={circuit.isClosedLoop ? "#78d48f" : "#f0a830"}
          fontSize={9}
          fontFamily="JetBrains Mono, monospace"
        >
          {circuit.isClosedLoop ? "CLOSED LOOP" : "OPEN CIRCUIT"}
        </text>
      </g>
    </svg>
  );
};

export default CircuitRenderer;
