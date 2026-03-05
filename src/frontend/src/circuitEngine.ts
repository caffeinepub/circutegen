// CircuteGen Circuit Engine
// Parses text prompts and returns structured CircuitGraph objects

export type ComponentType =
  | "battery"
  | "resistor"
  | "capacitor"
  | "inductor"
  | "led"
  | "diode"
  | "switch"
  | "transistor"
  | "opamp"
  | "ground"
  | "wire"
  | "ic555"
  | "motor"
  | "zener"
  | "transformer"
  | "voltmeter";

export const COMPONENT_TYPE_INFO: Record<
  ComponentType,
  { name: string; symbol: string; description: string; category: string }
> = {
  battery: {
    name: "Battery",
    symbol: "BAT",
    description: "Provides DC voltage and current to power the circuit",
    category: "Power Source",
  },
  resistor: {
    name: "Resistor",
    symbol: "R",
    description: "Limits current flow; obeys Ohm's Law (V = IR)",
    category: "Passive",
  },
  capacitor: {
    name: "Capacitor",
    symbol: "C",
    description: "Stores electric charge; blocks DC, passes AC",
    category: "Passive",
  },
  inductor: {
    name: "Inductor",
    symbol: "L",
    description: "Stores energy in a magnetic field; opposes current changes",
    category: "Passive",
  },
  led: {
    name: "LED",
    symbol: "LED",
    description: "Light Emitting Diode; emits light when forward biased",
    category: "Output",
  },
  diode: {
    name: "Diode",
    symbol: "D",
    description: "Allows current in one direction only; blocks reverse current",
    category: "Semiconductor",
  },
  zener: {
    name: "Zener Diode",
    symbol: "ZD",
    description:
      "Regulates voltage by conducting in reverse at breakdown voltage",
    category: "Semiconductor",
  },
  switch: {
    name: "Switch",
    symbol: "SW",
    description: "Opens or closes a circuit path; controls current flow",
    category: "Control",
  },
  transistor: {
    name: "Transistor (BJT)",
    symbol: "Q",
    description: "NPN/PNP device for amplification or switching",
    category: "Semiconductor",
  },
  opamp: {
    name: "Op-Amp",
    symbol: "U",
    description:
      "Operational amplifier; high-gain differential voltage amplifier",
    category: "IC",
  },
  ic555: {
    name: "555 Timer IC",
    symbol: "IC",
    description:
      "Versatile timer IC for oscillators, monostables, and pulse generators",
    category: "IC",
  },
  motor: {
    name: "DC Motor",
    symbol: "M",
    description: "Converts electrical energy to rotational mechanical energy",
    category: "Output",
  },
  transformer: {
    name: "Transformer",
    symbol: "T",
    description:
      "Transfers energy between circuits via magnetic induction; steps voltage up/down",
    category: "Passive",
  },
  voltmeter: {
    name: "Voltmeter",
    symbol: "VM",
    description: "Measures voltage across two points in a circuit",
    category: "Measurement",
  },
  ground: {
    name: "Ground",
    symbol: "GND",
    description:
      "Reference point (0V) for all voltage measurements in the circuit",
    category: "Reference",
  },
  wire: {
    name: "Wire",
    symbol: "W",
    description: "Conductor connecting circuit components",
    category: "Connector",
  },
};

export interface ComponentNode {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  label?: string;
  value?: string;
  active: boolean;
  rotation?: number; // degrees
}

export interface WirePath {
  id: string;
  from: string;
  to: string;
  points: [number, number][];
  currentDirection: 1 | -1;
  voltageDrop?: string;
}

export interface CircuitGraph {
  components: ComponentNode[];
  wires: WirePath[];
  isClosedLoop: boolean;
  title: string;
  description: string;
}

type TemplateId =
  | "simple-led"
  | "rc-filter"
  | "lc-oscillator"
  | "diode-rectifier"
  | "transistor-switch"
  | "ic555-timer"
  | "op-amp-buffer"
  | "h-bridge"
  | "zener-regulator"
  | "wheatstone-bridge"
  | "full-wave-rectifier"
  | "voltage-divider"
  | "colpitts-oscillator"
  | "darlington-pair"
  | "default";

// ─── Template Definitions ────────────────────────────────────────────────────

const TEMPLATES: Record<TemplateId, () => CircuitGraph> = {
  "simple-led": () => ({
    title: "LED with Resistor & Battery",
    description:
      "Simple LED circuit with current-limiting resistor powered by a 9V battery",
    isClosedLoop: true,
    components: [
      {
        id: "bat1",
        type: "battery",
        x: 80,
        y: 200,
        label: "9V",
        value: "9V",
        active: true,
      },
      {
        id: "sw1",
        type: "switch",
        x: 230,
        y: 90,
        label: "SW1",
        value: "closed",
        active: true,
      },
      {
        id: "r1",
        type: "resistor",
        x: 390,
        y: 90,
        label: "R1",
        value: "470Ω",
        active: true,
      },
      {
        id: "led1",
        type: "led",
        x: 540,
        y: 200,
        label: "LED1",
        value: "2.0V",
        active: true,
      },
      {
        id: "gnd1",
        type: "ground",
        x: 80,
        y: 330,
        label: "",
        value: "",
        active: true,
      },
    ],
    wires: [
      {
        id: "w1",
        from: "bat1.pos",
        to: "sw1.in",
        points: [
          [130, 115],
          [180, 90],
        ],
        currentDirection: 1,
        voltageDrop: "9.0V",
      },
      {
        id: "w2",
        from: "sw1.out",
        to: "r1.in",
        points: [
          [280, 90],
          [340, 90],
        ],
        currentDirection: 1,
        voltageDrop: "9.0V",
      },
      {
        id: "w3",
        from: "r1.out",
        to: "led1.in",
        points: [
          [440, 90],
          [490, 90],
          [490, 160],
        ],
        currentDirection: 1,
        voltageDrop: "7.0V",
      },
      {
        id: "w4",
        from: "led1.out",
        to: "gnd1.in",
        points: [
          [540, 240],
          [540, 330],
          [130, 330],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
      {
        id: "w5",
        from: "gnd1.out",
        to: "bat1.neg",
        points: [
          [80, 330],
          [80, 245],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
      {
        id: "w6",
        from: "bat1.pos",
        to: "sw1.in",
        points: [
          [80, 160],
          [80, 90],
          [180, 90],
        ],
        currentDirection: 1,
        voltageDrop: "9.0V",
      },
    ],
  }),

  "rc-filter": () => ({
    title: "RC Low-Pass Filter",
    description:
      "First-order RC low-pass filter with cutoff frequency at 1/(2πRC)",
    isClosedLoop: true,
    components: [
      {
        id: "bat1",
        type: "battery",
        x: 80,
        y: 200,
        label: "5V",
        value: "5V",
        active: true,
      },
      {
        id: "r1",
        type: "resistor",
        x: 250,
        y: 90,
        label: "R1",
        value: "10kΩ",
        active: true,
      },
      {
        id: "c1",
        type: "capacitor",
        x: 430,
        y: 200,
        label: "C1",
        value: "100nF",
        active: true,
      },
      {
        id: "gnd1",
        type: "ground",
        x: 430,
        y: 330,
        label: "",
        value: "",
        active: true,
      },
      {
        id: "gnd2",
        type: "ground",
        x: 80,
        y: 330,
        label: "",
        value: "",
        active: true,
      },
    ],
    wires: [
      {
        id: "w1",
        from: "bat1.pos",
        to: "r1.in",
        points: [
          [80, 155],
          [80, 90],
          [200, 90],
        ],
        currentDirection: 1,
        voltageDrop: "5.0V",
      },
      {
        id: "w2",
        from: "r1.out",
        to: "c1.top",
        points: [
          [300, 90],
          [430, 90],
          [430, 155],
        ],
        currentDirection: 1,
        voltageDrop: "2.5V",
      },
      {
        id: "w3",
        from: "c1.bot",
        to: "gnd1.in",
        points: [
          [430, 245],
          [430, 330],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
      {
        id: "w4",
        from: "gnd1.out",
        to: "gnd2.in",
        points: [
          [430, 330],
          [80, 330],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
      {
        id: "w5",
        from: "gnd2.out",
        to: "bat1.neg",
        points: [
          [80, 330],
          [80, 245],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
    ],
  }),

  "lc-oscillator": () => ({
    title: "LC Tank Oscillator",
    description: "LC resonant tank circuit oscillating at f=1/(2π√LC)",
    isClosedLoop: true,
    components: [
      {
        id: "bat1",
        type: "battery",
        x: 80,
        y: 200,
        label: "12V",
        value: "12V",
        active: true,
      },
      {
        id: "l1",
        type: "inductor",
        x: 260,
        y: 90,
        label: "L1",
        value: "1mH",
        active: true,
      },
      {
        id: "c1",
        type: "capacitor",
        x: 470,
        y: 200,
        label: "C1",
        value: "10µF",
        active: true,
      },
      {
        id: "gnd1",
        type: "ground",
        x: 260,
        y: 330,
        label: "",
        value: "",
        active: true,
      },
    ],
    wires: [
      {
        id: "w1",
        from: "bat1.pos",
        to: "l1.in",
        points: [
          [80, 155],
          [80, 90],
          [210, 90],
        ],
        currentDirection: 1,
        voltageDrop: "12V",
      },
      {
        id: "w2",
        from: "l1.out",
        to: "c1.top",
        points: [
          [310, 90],
          [470, 90],
          [470, 155],
        ],
        currentDirection: 1,
        voltageDrop: "6V",
      },
      {
        id: "w3",
        from: "c1.bot",
        to: "gnd1.in",
        points: [
          [470, 245],
          [470, 330],
          [310, 330],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
      {
        id: "w4",
        from: "gnd1.out",
        to: "bat1.neg",
        points: [
          [210, 330],
          [80, 330],
          [80, 245],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
    ],
  }),

  "diode-rectifier": () => ({
    title: "Half-Wave Diode Rectifier",
    description: "Simple half-wave rectifier with LED load indicator",
    isClosedLoop: true,
    components: [
      {
        id: "bat1",
        type: "battery",
        x: 80,
        y: 200,
        label: "12V",
        value: "12V",
        active: true,
      },
      {
        id: "d1",
        type: "diode",
        x: 240,
        y: 90,
        label: "D1",
        value: "1N4001",
        active: true,
      },
      {
        id: "r1",
        type: "resistor",
        x: 390,
        y: 90,
        label: "R1",
        value: "330Ω",
        active: true,
      },
      {
        id: "led1",
        type: "led",
        x: 540,
        y: 200,
        label: "LED1",
        value: "2.0V",
        active: true,
      },
      {
        id: "gnd1",
        type: "ground",
        x: 80,
        y: 330,
        label: "",
        value: "",
        active: true,
      },
    ],
    wires: [
      {
        id: "w1",
        from: "bat1.pos",
        to: "d1.in",
        points: [
          [80, 155],
          [80, 90],
          [190, 90],
        ],
        currentDirection: 1,
        voltageDrop: "12V",
      },
      {
        id: "w2",
        from: "d1.out",
        to: "r1.in",
        points: [
          [290, 90],
          [340, 90],
        ],
        currentDirection: 1,
        voltageDrop: "11.3V",
      },
      {
        id: "w3",
        from: "r1.out",
        to: "led1.in",
        points: [
          [440, 90],
          [490, 90],
          [490, 160],
        ],
        currentDirection: 1,
        voltageDrop: "9.3V",
      },
      {
        id: "w4",
        from: "led1.out",
        to: "gnd1.in",
        points: [
          [540, 240],
          [540, 330],
          [80, 330],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
      {
        id: "w5",
        from: "gnd1.out",
        to: "bat1.neg",
        points: [
          [80, 330],
          [80, 245],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
    ],
  }),

  "transistor-switch": () => ({
    title: "Transistor Switch",
    description: "NPN BJT used as a digital switch to control an LED load",
    isClosedLoop: true,
    components: [
      {
        id: "bat1",
        type: "battery",
        x: 80,
        y: 200,
        label: "9V",
        value: "9V",
        active: true,
      },
      {
        id: "r1",
        type: "resistor",
        x: 240,
        y: 90,
        label: "Rc",
        value: "470Ω",
        active: true,
      },
      {
        id: "led1",
        type: "led",
        x: 400,
        y: 90,
        label: "LED1",
        value: "2.0V",
        active: true,
      },
      {
        id: "q1",
        type: "transistor",
        x: 470,
        y: 250,
        label: "Q1",
        value: "NPN",
        active: true,
      },
      {
        id: "r2",
        type: "resistor",
        x: 290,
        y: 300,
        label: "Rb",
        value: "10kΩ",
        active: true,
      },
      {
        id: "gnd1",
        type: "ground",
        x: 470,
        y: 370,
        label: "",
        value: "",
        active: true,
      },
    ],
    wires: [
      {
        id: "w1",
        from: "bat1.pos",
        to: "r1.in",
        points: [
          [80, 155],
          [80, 90],
          [190, 90],
        ],
        currentDirection: 1,
        voltageDrop: "9V",
      },
      {
        id: "w2",
        from: "r1.out",
        to: "led1.in",
        points: [
          [290, 90],
          [350, 90],
        ],
        currentDirection: 1,
        voltageDrop: "7V",
      },
      {
        id: "w3",
        from: "led1.out",
        to: "q1.col",
        points: [
          [450, 90],
          [470, 90],
          [470, 210],
        ],
        currentDirection: 1,
        voltageDrop: "5V",
      },
      {
        id: "w4",
        from: "r2.out",
        to: "q1.base",
        points: [
          [340, 300],
          [420, 250],
        ],
        currentDirection: 1,
        voltageDrop: "0.7V",
      },
      {
        id: "w5",
        from: "q1.emit",
        to: "gnd1.in",
        points: [
          [470, 290],
          [470, 370],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
      {
        id: "w6",
        from: "gnd1.out",
        to: "bat1.neg",
        points: [
          [470, 380],
          [80, 380],
          [80, 245],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
      {
        id: "w7",
        from: "bat1.pos",
        to: "r2.in",
        points: [
          [130, 300],
          [240, 300],
        ],
        currentDirection: 1,
        voltageDrop: "9V",
      },
    ],
  }),

  "ic555-timer": () => ({
    title: "555 Timer Oscillator",
    description: "Astable 555 timer circuit generating a square wave output",
    isClosedLoop: true,
    components: [
      {
        id: "bat1",
        type: "battery",
        x: 60,
        y: 210,
        label: "9V",
        value: "9V",
        active: true,
      },
      {
        id: "r1",
        type: "resistor",
        x: 200,
        y: 90,
        label: "R1",
        value: "1kΩ",
        active: true,
      },
      {
        id: "r2",
        type: "resistor",
        x: 340,
        y: 90,
        label: "R2",
        value: "10kΩ",
        active: true,
      },
      {
        id: "ic1",
        type: "ic555",
        x: 420,
        y: 200,
        label: "555",
        value: "NE555",
        active: true,
      },
      {
        id: "c1",
        type: "capacitor",
        x: 340,
        y: 310,
        label: "C1",
        value: "10µF",
        active: true,
      },
      {
        id: "c2",
        type: "capacitor",
        x: 200,
        y: 310,
        label: "C2",
        value: "10nF",
        active: true,
      },
      {
        id: "led1",
        type: "led",
        x: 560,
        y: 90,
        label: "OUT",
        value: "2.0V",
        active: true,
      },
      {
        id: "gnd1",
        type: "ground",
        x: 60,
        y: 340,
        label: "",
        value: "",
        active: true,
      },
    ],
    wires: [
      {
        id: "w1",
        from: "bat1.pos",
        to: "r1.in",
        points: [
          [60, 165],
          [60, 90],
          [150, 90],
        ],
        currentDirection: 1,
        voltageDrop: "9V",
      },
      {
        id: "w2",
        from: "r1.out",
        to: "r2.in",
        points: [
          [250, 90],
          [290, 90],
        ],
        currentDirection: 1,
        voltageDrop: "8V",
      },
      {
        id: "w3",
        from: "r2.out",
        to: "ic1.vcc",
        points: [
          [390, 90],
          [420, 90],
          [420, 160],
        ],
        currentDirection: 1,
        voltageDrop: "7V",
      },
      {
        id: "w4",
        from: "ic1.out",
        to: "led1.in",
        points: [
          [520, 200],
          [520, 90],
          [510, 90],
        ],
        currentDirection: 1,
        voltageDrop: "5V",
      },
      {
        id: "w5",
        from: "c1.bot",
        to: "gnd1.in",
        points: [
          [340, 350],
          [60, 350],
          [60, 340],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
      {
        id: "w6",
        from: "led1.out",
        to: "gnd1.in",
        points: [
          [610, 90],
          [630, 90],
          [630, 350],
          [60, 350],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
    ],
  }),

  "op-amp-buffer": () => ({
    title: "Op-Amp Voltage Follower",
    description:
      "Unity-gain buffer using op-amp in voltage follower configuration",
    isClosedLoop: true,
    components: [
      {
        id: "bat1",
        type: "battery",
        x: 60,
        y: 220,
        label: "±15V",
        value: "±15V",
        active: true,
      },
      {
        id: "r1",
        type: "resistor",
        x: 200,
        y: 130,
        label: "Rin",
        value: "10kΩ",
        active: true,
      },
      {
        id: "oa1",
        type: "opamp",
        x: 380,
        y: 200,
        label: "U1",
        value: "LM741",
        active: true,
      },
      {
        id: "r2",
        type: "resistor",
        x: 480,
        y: 310,
        label: "Rf",
        value: "10kΩ",
        active: true,
      },
      {
        id: "gnd1",
        type: "ground",
        x: 60,
        y: 350,
        label: "",
        value: "",
        active: true,
      },
    ],
    wires: [
      {
        id: "w1",
        from: "bat1.pos",
        to: "r1.in",
        points: [
          [60, 175],
          [60, 130],
          [150, 130],
        ],
        currentDirection: 1,
        voltageDrop: "15V",
      },
      {
        id: "w2",
        from: "r1.out",
        to: "oa1.in+",
        points: [
          [250, 130],
          [330, 130],
          [330, 185],
          [380, 185],
        ],
        currentDirection: 1,
        voltageDrop: "14V",
      },
      {
        id: "w3",
        from: "oa1.out",
        to: "r2.in",
        points: [
          [500, 200],
          [540, 200],
          [540, 310],
          [480, 310],
        ],
        currentDirection: 1,
        voltageDrop: "13V",
      },
      {
        id: "w4",
        from: "r2.out",
        to: "oa1.in-",
        points: [
          [420, 310],
          [330, 310],
          [330, 215],
          [380, 215],
        ],
        currentDirection: -1,
        voltageDrop: "13V",
      },
      {
        id: "w5",
        from: "oa1.gnd",
        to: "gnd1.in",
        points: [
          [430, 260],
          [430, 350],
          [60, 350],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
      {
        id: "w6",
        from: "gnd1.out",
        to: "bat1.neg",
        points: [
          [60, 350],
          [60, 265],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
    ],
  }),

  "h-bridge": () => ({
    title: "H-Bridge Motor Driver",
    description:
      "H-bridge circuit using 4 NPN transistors to control motor direction",
    isClosedLoop: true,
    components: [
      {
        id: "bat1",
        type: "battery",
        x: 60,
        y: 200,
        label: "12V",
        value: "12V",
        active: true,
      },
      {
        id: "q1",
        type: "transistor",
        x: 220,
        y: 100,
        label: "Q1",
        value: "NPN",
        active: true,
      },
      {
        id: "q2",
        type: "transistor",
        x: 420,
        y: 100,
        label: "Q2",
        value: "NPN",
        active: true,
      },
      {
        id: "q3",
        type: "transistor",
        x: 220,
        y: 300,
        label: "Q3",
        value: "NPN",
        active: true,
      },
      {
        id: "q4",
        type: "transistor",
        x: 420,
        y: 300,
        label: "Q4",
        value: "NPN",
        active: true,
      },
      {
        id: "mot1",
        type: "motor",
        x: 320,
        y: 200,
        label: "M1",
        value: "DC",
        active: true,
      },
      {
        id: "gnd1",
        type: "ground",
        x: 60,
        y: 360,
        label: "",
        value: "",
        active: true,
      },
    ],
    wires: [
      {
        id: "w1",
        from: "bat1.pos",
        to: "q1.col",
        points: [
          [60, 155],
          [60, 60],
          [220, 60],
          [220, 60],
        ],
        currentDirection: 1,
        voltageDrop: "12V",
      },
      {
        id: "w2",
        from: "bat1.pos",
        to: "q2.col",
        points: [
          [60, 60],
          [420, 60],
          [420, 60],
        ],
        currentDirection: 1,
        voltageDrop: "12V",
      },
      {
        id: "w3",
        from: "q1.emit",
        to: "mot1.in",
        points: [
          [220, 140],
          [220, 200],
          [280, 200],
        ],
        currentDirection: 1,
        voltageDrop: "11V",
      },
      {
        id: "w4",
        from: "q2.emit",
        to: "mot1.out",
        points: [
          [420, 140],
          [420, 200],
          [360, 200],
        ],
        currentDirection: -1,
        voltageDrop: "11V",
      },
      {
        id: "w5",
        from: "mot1.in",
        to: "q3.col",
        points: [
          [280, 200],
          [220, 200],
          [220, 260],
        ],
        currentDirection: 1,
        voltageDrop: "6V",
      },
      {
        id: "w6",
        from: "mot1.out",
        to: "q4.col",
        points: [
          [360, 200],
          [420, 200],
          [420, 260],
        ],
        currentDirection: -1,
        voltageDrop: "6V",
      },
      {
        id: "w7",
        from: "q3.emit",
        to: "gnd1.in",
        points: [
          [220, 340],
          [220, 380],
          [60, 380],
          [60, 360],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
    ],
  }),

  "zener-regulator": () => ({
    title: "Zener Voltage Regulator",
    description:
      "Zener diode shunt regulator maintaining a fixed output voltage",
    isClosedLoop: true,
    components: [
      {
        id: "bat1",
        type: "battery",
        x: 80,
        y: 200,
        label: "12V",
        value: "12V",
        active: true,
      },
      {
        id: "r1",
        type: "resistor",
        x: 280,
        y: 90,
        label: "Rs",
        value: "470Ω",
        active: true,
      },
      {
        id: "zd1",
        type: "zener",
        x: 460,
        y: 200,
        label: "ZD1",
        value: "5.1V",
        active: true,
      },
      {
        id: "r2",
        type: "resistor",
        x: 580,
        y: 200,
        label: "RL",
        value: "1kΩ",
        active: true,
      },
      {
        id: "vm1",
        type: "voltmeter",
        x: 460,
        y: 350,
        label: "V1",
        value: "5.1V",
        active: true,
      },
      {
        id: "gnd1",
        type: "ground",
        x: 80,
        y: 330,
        label: "",
        value: "",
        active: true,
      },
    ],
    wires: [
      {
        id: "w1",
        from: "bat1.pos",
        to: "r1.in",
        points: [
          [80, 155],
          [80, 90],
          [230, 90],
        ],
        currentDirection: 1,
        voltageDrop: "12V",
      },
      {
        id: "w2",
        from: "r1.out",
        to: "zd1.top",
        points: [
          [330, 90],
          [460, 90],
          [460, 160],
        ],
        currentDirection: 1,
        voltageDrop: "6.9V",
      },
      {
        id: "w3",
        from: "zd1.bot",
        to: "gnd1",
        points: [
          [460, 240],
          [460, 330],
          [80, 330],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
      {
        id: "w4",
        from: "gnd1.out",
        to: "bat1.neg",
        points: [
          [80, 330],
          [80, 245],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
      {
        id: "w5",
        from: "r1.out",
        to: "r2.in",
        points: [
          [460, 90],
          [540, 90],
          [580, 90],
          [580, 160],
        ],
        currentDirection: 1,
        voltageDrop: "5.1V",
      },
      {
        id: "w6",
        from: "r2.out",
        to: "gnd1",
        points: [
          [580, 240],
          [580, 330],
          [460, 330],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
    ],
  }),

  "wheatstone-bridge": () => ({
    title: "Wheatstone Bridge",
    description: "Balanced bridge circuit for precise resistance measurement",
    isClosedLoop: true,
    components: [
      {
        id: "bat1",
        type: "battery",
        x: 350,
        y: 60,
        label: "9V",
        value: "9V",
        active: true,
      },
      {
        id: "r1",
        type: "resistor",
        x: 200,
        y: 170,
        label: "R1",
        value: "1kΩ",
        active: true,
      },
      {
        id: "r2",
        type: "resistor",
        x: 500,
        y: 170,
        label: "R2",
        value: "1kΩ",
        active: true,
      },
      {
        id: "r3",
        type: "resistor",
        x: 200,
        y: 290,
        label: "R3",
        value: "1kΩ",
        active: true,
      },
      {
        id: "r4",
        type: "resistor",
        x: 500,
        y: 290,
        label: "Rx",
        value: "?Ω",
        active: true,
      },
      {
        id: "vm1",
        type: "voltmeter",
        x: 350,
        y: 230,
        label: "V1",
        value: "0V",
        active: true,
      },
      {
        id: "gnd1",
        type: "ground",
        x: 350,
        y: 390,
        label: "",
        value: "",
        active: true,
      },
    ],
    wires: [
      {
        id: "w1",
        from: "bat1.pos",
        to: "r1.in",
        points: [
          [300, 60],
          [200, 60],
          [200, 130],
        ],
        currentDirection: 1,
        voltageDrop: "9V",
      },
      {
        id: "w2",
        from: "bat1.pos",
        to: "r2.in",
        points: [
          [400, 60],
          [500, 60],
          [500, 130],
        ],
        currentDirection: 1,
        voltageDrop: "9V",
      },
      {
        id: "w3",
        from: "r1.out",
        to: "r3.in",
        points: [
          [200, 210],
          [200, 250],
        ],
        currentDirection: 1,
        voltageDrop: "4.5V",
      },
      {
        id: "w4",
        from: "r2.out",
        to: "r4.in",
        points: [
          [500, 210],
          [500, 250],
        ],
        currentDirection: 1,
        voltageDrop: "4.5V",
      },
      {
        id: "w5",
        from: "r3.out",
        to: "gnd1.in",
        points: [
          [200, 330],
          [200, 390],
          [350, 390],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
      {
        id: "w6",
        from: "r4.out",
        to: "gnd1.in",
        points: [
          [500, 330],
          [500, 390],
          [400, 390],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
    ],
  }),

  "full-wave-rectifier": () => ({
    title: "Full-Wave Bridge Rectifier",
    description: "4-diode bridge rectifier converting AC to pulsating DC",
    isClosedLoop: true,
    components: [
      {
        id: "bat1",
        type: "battery",
        x: 80,
        y: 220,
        label: "AC",
        value: "12VAC",
        active: true,
      },
      {
        id: "d1",
        type: "diode",
        x: 240,
        y: 130,
        label: "D1",
        value: "1N4007",
        active: true,
      },
      {
        id: "d2",
        type: "diode",
        x: 400,
        y: 130,
        label: "D2",
        value: "1N4007",
        active: true,
      },
      {
        id: "d3",
        type: "diode",
        x: 240,
        y: 310,
        label: "D3",
        value: "1N4007",
        active: true,
      },
      {
        id: "d4",
        type: "diode",
        x: 400,
        y: 310,
        label: "D4",
        value: "1N4007",
        active: true,
      },
      {
        id: "c1",
        type: "capacitor",
        x: 560,
        y: 220,
        label: "C1",
        value: "1000µF",
        active: true,
      },
      {
        id: "r1",
        type: "resistor",
        x: 650,
        y: 220,
        label: "RL",
        value: "1kΩ",
        active: true,
      },
      {
        id: "gnd1",
        type: "ground",
        x: 320,
        y: 390,
        label: "",
        value: "",
        active: true,
      },
    ],
    wires: [
      {
        id: "w1",
        from: "bat1.pos",
        to: "d1.in",
        points: [
          [80, 175],
          [80, 130],
          [190, 130],
        ],
        currentDirection: 1,
        voltageDrop: "12V",
      },
      {
        id: "w2",
        from: "d1.out",
        to: "d2.in",
        points: [
          [290, 130],
          [350, 130],
        ],
        currentDirection: 1,
        voltageDrop: "11.3V",
      },
      {
        id: "w3",
        from: "d2.out",
        to: "c1.top",
        points: [
          [450, 130],
          [560, 130],
          [560, 175],
        ],
        currentDirection: 1,
        voltageDrop: "10.6V",
      },
      {
        id: "w4",
        from: "bat1.neg",
        to: "d3.in",
        points: [
          [80, 265],
          [80, 310],
          [190, 310],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
      {
        id: "w5",
        from: "d3.out",
        to: "d4.in",
        points: [
          [290, 310],
          [350, 310],
        ],
        currentDirection: 1,
        voltageDrop: "0.7V",
      },
      {
        id: "w6",
        from: "d4.out",
        to: "gnd1.in",
        points: [
          [450, 310],
          [560, 310],
          [560, 265],
          [320, 265],
          [320, 390],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
    ],
  }),

  "voltage-divider": () => ({
    title: "Voltage Divider",
    description: "Two-resistor network that scales down voltage proportionally",
    isClosedLoop: true,
    components: [
      {
        id: "bat1",
        type: "battery",
        x: 80,
        y: 200,
        label: "12V",
        value: "12V",
        active: true,
      },
      {
        id: "r1",
        type: "resistor",
        x: 300,
        y: 130,
        label: "R1",
        value: "10kΩ",
        active: true,
      },
      {
        id: "r2",
        type: "resistor",
        x: 300,
        y: 280,
        label: "R2",
        value: "10kΩ",
        active: true,
      },
      {
        id: "vm1",
        type: "voltmeter",
        x: 480,
        y: 200,
        label: "Vout",
        value: "6V",
        active: true,
      },
      {
        id: "gnd1",
        type: "ground",
        x: 300,
        y: 360,
        label: "",
        value: "",
        active: true,
      },
      {
        id: "gnd2",
        type: "ground",
        x: 80,
        y: 330,
        label: "",
        value: "",
        active: true,
      },
    ],
    wires: [
      {
        id: "w1",
        from: "bat1.pos",
        to: "r1.top",
        points: [
          [80, 155],
          [80, 90],
          [300, 90],
          [300, 90],
        ],
        currentDirection: 1,
        voltageDrop: "12V",
      },
      {
        id: "w2",
        from: "r1.bot",
        to: "r2.top",
        points: [
          [300, 170],
          [300, 240],
        ],
        currentDirection: 1,
        voltageDrop: "6V",
      },
      {
        id: "w3",
        from: "r2.bot",
        to: "gnd1.in",
        points: [
          [300, 320],
          [300, 360],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
      {
        id: "w4",
        from: "gnd1.out",
        to: "gnd2.in",
        points: [
          [300, 360],
          [80, 360],
          [80, 330],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
      {
        id: "w5",
        from: "gnd2.out",
        to: "bat1.neg",
        points: [
          [80, 330],
          [80, 245],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
      {
        id: "w6",
        from: "midpoint",
        to: "vm1.in",
        points: [
          [300, 205],
          [430, 200],
        ],
        currentDirection: 1,
        voltageDrop: "6V",
      },
    ],
  }),

  "colpitts-oscillator": () => ({
    title: "Colpitts Oscillator",
    description: "LC oscillator using capacitive voltage divider feedback",
    isClosedLoop: true,
    components: [
      {
        id: "bat1",
        type: "battery",
        x: 60,
        y: 220,
        label: "9V",
        value: "9V",
        active: true,
      },
      {
        id: "q1",
        type: "transistor",
        x: 300,
        y: 200,
        label: "Q1",
        value: "NPN",
        active: true,
      },
      {
        id: "l1",
        type: "inductor",
        x: 460,
        y: 130,
        label: "L1",
        value: "100µH",
        active: true,
      },
      {
        id: "c1",
        type: "capacitor",
        x: 460,
        y: 260,
        label: "C1",
        value: "100pF",
        active: true,
      },
      {
        id: "c2",
        type: "capacitor",
        x: 460,
        y: 350,
        label: "C2",
        value: "100pF",
        active: true,
      },
      {
        id: "r1",
        type: "resistor",
        x: 180,
        y: 120,
        label: "R1",
        value: "47kΩ",
        active: true,
      },
      {
        id: "r2",
        type: "resistor",
        x: 180,
        y: 290,
        label: "R2",
        value: "10kΩ",
        active: true,
      },
      {
        id: "gnd1",
        type: "ground",
        x: 300,
        y: 390,
        label: "",
        value: "",
        active: true,
      },
    ],
    wires: [
      {
        id: "w1",
        from: "bat1.pos",
        to: "r1.in",
        points: [
          [60, 175],
          [60, 90],
          [130, 90],
          [180, 90],
        ],
        currentDirection: 1,
        voltageDrop: "9V",
      },
      {
        id: "w2",
        from: "r1.out",
        to: "q1.base",
        points: [
          [230, 120],
          [260, 180],
        ],
        currentDirection: 1,
        voltageDrop: "4V",
      },
      {
        id: "w3",
        from: "q1.col",
        to: "l1.in",
        points: [
          [320, 160],
          [320, 90],
          [410, 90],
          [460, 90],
        ],
        currentDirection: 1,
        voltageDrop: "8V",
      },
      {
        id: "w4",
        from: "l1.out",
        to: "c1.top",
        points: [
          [460, 170],
          [460, 220],
        ],
        currentDirection: 1,
        voltageDrop: "5V",
      },
      {
        id: "w5",
        from: "c1.bot",
        to: "c2.top",
        points: [
          [460, 300],
          [460, 310],
        ],
        currentDirection: 1,
        voltageDrop: "2V",
      },
      {
        id: "w6",
        from: "q1.emit",
        to: "gnd1.in",
        points: [
          [300, 240],
          [300, 390],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
      {
        id: "w7",
        from: "c2.bot",
        to: "gnd1.in",
        points: [
          [460, 390],
          [300, 390],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
    ],
  }),

  "darlington-pair": () => ({
    title: "Darlington Pair Amplifier",
    description: "Two cascaded BJTs for very high current gain (β²)",
    isClosedLoop: true,
    components: [
      {
        id: "bat1",
        type: "battery",
        x: 60,
        y: 220,
        label: "12V",
        value: "12V",
        active: true,
      },
      {
        id: "q1",
        type: "transistor",
        x: 260,
        y: 160,
        label: "Q1",
        value: "NPN",
        active: true,
      },
      {
        id: "q2",
        type: "transistor",
        x: 380,
        y: 260,
        label: "Q2",
        value: "NPN",
        active: true,
      },
      {
        id: "r1",
        type: "resistor",
        x: 140,
        y: 160,
        label: "Rb",
        value: "100kΩ",
        active: true,
      },
      {
        id: "r2",
        type: "resistor",
        x: 500,
        y: 130,
        label: "Rc",
        value: "1kΩ",
        active: true,
      },
      {
        id: "led1",
        type: "led",
        x: 500,
        y: 260,
        label: "Load",
        value: "2.0V",
        active: true,
      },
      {
        id: "gnd1",
        type: "ground",
        x: 380,
        y: 380,
        label: "",
        value: "",
        active: true,
      },
    ],
    wires: [
      {
        id: "w1",
        from: "bat1.pos",
        to: "r2.top",
        points: [
          [60, 175],
          [60, 90],
          [500, 90],
          [500, 90],
        ],
        currentDirection: 1,
        voltageDrop: "12V",
      },
      {
        id: "w2",
        from: "r2.bot",
        to: "q1.col",
        points: [
          [500, 170],
          [500, 200],
          [280, 120],
        ],
        currentDirection: 1,
        voltageDrop: "10V",
      },
      {
        id: "w3",
        from: "q1.emit",
        to: "q2.base",
        points: [
          [280, 200],
          [280, 260],
          [340, 240],
        ],
        currentDirection: 1,
        voltageDrop: "1.4V",
      },
      {
        id: "w4",
        from: "q2.col",
        to: "led1.in",
        points: [
          [400, 220],
          [450, 220],
          [450, 260],
        ],
        currentDirection: 1,
        voltageDrop: "5V",
      },
      {
        id: "w5",
        from: "q2.emit",
        to: "gnd1.in",
        points: [
          [380, 300],
          [380, 380],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
      {
        id: "w6",
        from: "gnd1.out",
        to: "bat1.neg",
        points: [
          [380, 390],
          [60, 390],
          [60, 265],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
      {
        id: "w7",
        from: "bat1.pos",
        to: "r1.in",
        points: [
          [60, 160],
          [90, 160],
        ],
        currentDirection: 1,
        voltageDrop: "9V",
      },
      {
        id: "w8",
        from: "r1.out",
        to: "q1.base",
        points: [
          [190, 160],
          [220, 160],
          [220, 160],
        ],
        currentDirection: 1,
        voltageDrop: "8V",
      },
    ],
  }),

  default: () => ({
    title: "Basic Battery-Resistor Circuit",
    description: "Simple series circuit with battery and resistor",
    isClosedLoop: true,
    components: [
      {
        id: "bat1",
        type: "battery",
        x: 100,
        y: 200,
        label: "9V",
        value: "9V",
        active: true,
      },
      {
        id: "r1",
        type: "resistor",
        x: 340,
        y: 90,
        label: "R1",
        value: "1kΩ",
        active: true,
      },
      {
        id: "gnd1",
        type: "ground",
        x: 100,
        y: 330,
        label: "",
        value: "",
        active: true,
      },
    ],
    wires: [
      {
        id: "w1",
        from: "bat1.pos",
        to: "r1.in",
        points: [
          [100, 155],
          [100, 90],
          [290, 90],
        ],
        currentDirection: 1,
        voltageDrop: "9V",
      },
      {
        id: "w2",
        from: "r1.out",
        to: "gnd1.in",
        points: [
          [390, 90],
          [500, 90],
          [500, 330],
          [100, 330],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
      {
        id: "w3",
        from: "gnd1.out",
        to: "bat1.neg",
        points: [
          [100, 330],
          [100, 245],
        ],
        currentDirection: 1,
        voltageDrop: "0V",
      },
    ],
  }),
};

// ─── Keyword → Template Mapping ──────────────────────────────────────────────

function selectTemplate(prompt: string): TemplateId {
  const p = prompt.toLowerCase();

  // 555 timer
  if (/555|timer\s+oscillator/.test(p)) return "ic555-timer";

  // H-bridge
  if (/h.?bridge|motor\s+driver/.test(p)) return "h-bridge";

  // Op-amp
  if (/op.?amp|opamp|operational\s+amp|buffer/.test(p)) return "op-amp-buffer";

  // Darlington
  if (/darlington/.test(p)) return "darlington-pair";

  // Colpitts
  if (/colpitts/.test(p)) return "colpitts-oscillator";

  // Wheatstone
  if (/wheatstone|bridge.*resist/.test(p)) return "wheatstone-bridge";

  // Full-wave rectifier
  if (/full.?wave|bridge.*rectif/.test(p)) return "full-wave-rectifier";

  // Zener regulator
  if (/zener|voltage.*regulat|regulat.*voltage/.test(p))
    return "zener-regulator";

  // Voltage divider
  if (/voltage\s+divid|potential\s+divid|divider/.test(p))
    return "voltage-divider";

  // Transistor switch
  if (/transistor|bjt|switch.*led|npn|pnp|amplifier/.test(p))
    return "transistor-switch";

  // LC oscillator
  if (/lc|oscillator|inductor|coil|tank/.test(p)) return "lc-oscillator";

  // Diode rectifier
  if (/rectif|diode|half.?wave/.test(p)) return "diode-rectifier";

  // RC filter
  if (
    /rc\s+filter|low.?pass|high.?pass|rc\s+circuit|capacitor.*resistor|resistor.*capacitor/.test(
      p,
    )
  )
    return "rc-filter";

  // LED circuit (general)
  if (/led|light\s+emitting|lamp/.test(p)) return "simple-led";

  // Capacitor
  if (/capacitor|capacitance/.test(p)) return "rc-filter";

  // Inductor
  if (/inductor|inductance/.test(p)) return "lc-oscillator";

  return "default";
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function parsePrompt(prompt: string): CircuitGraph {
  const templateId = selectTemplate(prompt.trim());
  return TEMPLATES[templateId]();
}

export const EXAMPLE_PROMPTS: { label: string; prompt: string }[] = [
  {
    label: "LED + Resistor + Battery",
    prompt: "LED with resistor and battery",
  },
  { label: "RC Low-Pass Filter", prompt: "RC low-pass filter" },
  { label: "555 Timer Oscillator", prompt: "555 timer oscillator" },
  { label: "Transistor Switch", prompt: "Transistor switch with LED" },
  { label: "Diode Rectifier", prompt: "Half-wave diode rectifier" },
  { label: "LC Tank Oscillator", prompt: "LC tank oscillator" },
  { label: "Op-Amp Buffer", prompt: "Op-amp voltage follower buffer" },
  { label: "H-Bridge Motor Driver", prompt: "H-bridge motor driver circuit" },
  { label: "Zener Regulator", prompt: "Zener voltage regulator" },
  { label: "Wheatstone Bridge", prompt: "Wheatstone bridge resistance" },
  { label: "Full-Wave Rectifier", prompt: "Full-wave bridge rectifier" },
  { label: "Voltage Divider", prompt: "Voltage divider circuit" },
  { label: "Colpitts Oscillator", prompt: "Colpitts oscillator" },
  { label: "Darlington Pair", prompt: "Darlington pair amplifier" },
];
