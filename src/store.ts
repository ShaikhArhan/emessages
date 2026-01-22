import type { StoredEmessage } from "./types";

export const individualMessageStore = new Map<string, StoredEmessage>();
export const globalMessageStore = new Map<string, StoredEmessage>();
