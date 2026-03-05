import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PromptEntry {
    id: bigint;
    createdAt: bigint;
    text: string;
}
export interface backendInterface {
    clearHistory(): Promise<void>;
    getRecentPrompts(): Promise<Array<PromptEntry>>;
    savePrompt(text: string): Promise<bigint>;
}
