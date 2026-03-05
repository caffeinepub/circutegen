# CircuteGen

## Current State
- App generates circuit diagrams from text prompts with animated electron flow
- 8 circuit templates: LED+Resistor, RC Filter, LC Oscillator, Diode Rectifier, Transistor Switch, 555 Timer, Op-Amp Buffer, H-Bridge
- SVG-based circuit renderer with IEEE-style component symbols
- Component labels (e.g. "R1", "LED1") shown near components but small and not always visible
- No panel listing all components by name and type
- 12 component types supported: battery, resistor, capacitor, inductor, led, diode, switch, transistor, opamp, ground, wire, ic555, motor
- Download PNG/SVG available

## Requested Changes (Diff)

### Add
- Component name/type badge labels on every component in the SVG (component ID + type name displayed more prominently)
- Component Info Panel below the circuit canvas: a scrollable table/list showing each component's ID, type name, value, and brief description
- A "Component Types" reference panel in the sidebar showing all 12 component type symbols with their names and descriptions
- Additional circuit templates: Zener regulator, Wheatstone bridge, Full-wave bridge rectifier, Voltage divider, Colpitts oscillator, Darlington pair
- New component type: "zener" diode, "transformer", "voltmeter" added to the engine

### Modify
- EXAMPLE_PROMPTS list to include new circuits
- selectTemplate() to route to new templates
- Component symbol renderers: add more prominent name annotation with type tag below each symbol
- CircuitRenderer to show a component count badge and type names on the canvas overlay

### Remove
- Nothing removed

## Implementation Plan
1. Add new component types (zener, transformer, voltmeter) to circuitEngine.ts types
2. Add SVG symbol renderers for new types in CircuitRenderer.tsx
3. Add 6 new circuit templates to TEMPLATES in circuitEngine.ts
4. Update EXAMPLE_PROMPTS and selectTemplate() routing
5. Improve component label rendering in each symbol function to show both ID label AND type name tag below
6. Add ComponentInfoPanel component to App.tsx — a table below the canvas listing all components in the current circuit
7. Add ComponentTypesReference panel in the left sidebar showing all component types with icons and descriptions
