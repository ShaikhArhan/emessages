import { individualMessageStore, globalMessageStore } from "./store";
import type { EmessageOptions, StoredEmessage, TostConfig } from "./types";
import { isBrowser, showToast } from "./utils";

function parseConfig(
  config: Record<string, any>
): { name: string; options: StoredEmessage } | null {
  const options: EmessageOptions = {};
  let message: string | null = null;
  let name: string | null = null;
  const optionKeys = ["type", "break", "tost", "returnEM", "callBack"];

  for (const key in config) {
    if (Object.prototype.hasOwnProperty.call(config, key)) {
      if (optionKeys.includes(key)) {
        (options as any)[key] = config[key];
      } else {
        if (name !== null) {
          console.warn(
            `emessages: Found multiple potential error names in one config object. Using first one found: "${name}".`
          );
          continue;
        }
        name = key;
        message = String(config[key]);
      }
    }
  }

  if (name === null || message === null) {
    console.error(
      "emessages: Invalid config object. Could not find error name and message.",
      config
    );
    return null;
  }

  return { name, options: { ...options, message } };
}

function processEmessage(
  errorName: string,
  config: StoredEmessage
): string | void {
  const message = config.message;
  const type = config.type ?? "err";

  // 1. Console log
  switch (type) {
    case "log":
      console.log(message);
      break;
    case "war":
      console.warn(message);
      break;
    case "err":
      console.error(message);
      break;
  }

  // 2. Toast notification
  if (config.tost && isBrowser()) {
    showToast(message, config.tost);
  }

  // 3. Callback
  if (config.callBack) {
    try {
      config.callBack();
    } catch (e: any) {
      console.error(
        `emessages: Error in callBack for "${errorName}":`,
        e.message
      );
    }
  }

  // 4. Return error message
  if (config.returnEM) {
    return message;
  }

  // 5. Break execution
  if (config.break ?? true) {
    if (isBrowser()) {
      throw new Error(message);
    } else {
      process.exit(1);
    }
  }
}

export function Emessage(...configs: Record<string, any>[]) {
  for (const config of configs) {
    const parsed = parseConfig(config);
    if (parsed) {
      individualMessageStore.set(parsed.name, parsed.options);
    }
  }
}

Emessage.global = function (...configs: Record<string, any>[]) {
  for (const config of configs) {
    const parsed = parseConfig(config);
    if (parsed) {
      globalMessageStore.set(parsed.name, parsed.options);
    }
  }
};

export function showE(error: string | Record<string, any>): string | void {
  let config: StoredEmessage | null = null;
  let errorName: string | null = null;

  if (typeof error === "string") {
    errorName = error;
    config =
      individualMessageStore.get(error) ?? globalMessageStore.get(error) ?? null;
    if (!config) {
      console.error(`emessages: Error "${error}" not found.`);
      return;
    }
  } else if (typeof error === "object" && error !== null) {
    const parsed = parseConfig(error);
    if (parsed) {
      errorName = parsed.name;
      config = parsed.options;
    } else {
      console.error("emessages: Invalid object passed to showE.");
      return;
    }
  } else {
    console.error("emessages: Invalid argument passed to showE.");
    return;
  }

  if (config && errorName) {
    return processEmessage(errorName, config);
  }
}
