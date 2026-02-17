import { individualMessageStore, globalMessageStore } from "./store";
import type {
  ArgsM,
  DynamicValue,
  EmessageConfig,
  EmessageOptions,
  StoredEmessage,
  ToastConfig,
  MessageType,
} from "./types";
import { isBrowser, showToast } from "./utils";

function resolveDynamicValue<T>(value: DynamicValue<T> | undefined, argsM: ArgsM): T | undefined {
  if (typeof value === "function") {
    return (value as (args: ArgsM) => T)(argsM);
  }
  return value;
}

function getByPath(target: ArgsM, path: string): any {
  const normalized = path.replace(/\[(\w+)\]/g, ".$1").replace(/^\./, "");
  const segments = normalized.split(".").filter(Boolean);

  let current: any = target;
  for (const segment of segments) {
    if (current == null) return undefined;
    current = current[segment];
  }
  return current;
}

function interpolateArgsM(template: string, argsM: ArgsM): string {
  return template.replace(/\$\{\s*argsM\.([^}]+)\s*\}/g, (match, rawPath) => {
    const path = String(rawPath).trim();
    const value = getByPath(argsM, path);
    if (value === undefined) return match;
    if (typeof value === "object" && value !== null) {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value);
  });
}

function resolveToastConfig(toast: boolean | ToastConfig, argsM: ArgsM): boolean | ToastConfig {
  if (typeof toast !== "object" || toast === null) {
    return toast;
  }

  return {
    message: resolveDynamicValue(toast.message, argsM),
    style: resolveDynamicValue(toast.style, argsM),
    class: resolveDynamicValue(toast.class, argsM),
    position: toast.position,
    stay: resolveDynamicValue(toast.stay, argsM),
    duration: resolveDynamicValue(toast.duration, argsM),
    delay: resolveDynamicValue(toast.delay, argsM),
  };
}

function parseConfig(
  config: Record<string, any>
): { name: string; options: StoredEmessage } | null {
  const options: EmessageOptions = {};
  let message: DynamicValue<string> | null = null;
  let name: string | null = null;
  const optionKeys = ["type", "break", "toast", "returnEM", "callBack"];

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
        message = config[key];
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

  // Apply default for 'break' if not explicitly set
  if (options.break === undefined) {
    if (options.type === "war" || options.type === "log") {
      options.break = false;
    } else {
      // Default for 'err' type or if type is not specified
      options.break = true;
    }
  }

  return { name, options: { ...options, message } };
}

function processEmessage(
  errorName: string,
  config: StoredEmessage,
  argsM: ArgsM,
  errorToThrow?: Error
): string | void {
  const message = interpolateArgsM(String(resolveDynamicValue(config.message, argsM) ?? ""), argsM);

  let consoleType: MessageType | false;
  const resolvedType = resolveDynamicValue(config.type, argsM);
  if (resolvedType === false) {
    consoleType = false;
  } else if (resolvedType === true || resolvedType === undefined) {
    consoleType = "err";
  } else {
    consoleType = resolvedType;
  }

  // 1. Console log
  if (consoleType) {
    if (isBrowser()) {
      switch (consoleType) {
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
    } else {
      switch (consoleType) {
        case "log":
          console.log(`\x1b[30;47m ${message} \x1b[0m`);
          break;
        case "war":
          console.warn(`\x1b[37;43m ${message} \x1b[0m`);
          break;
        case "err":
          console.error(`\x1b[37;41m ${message} \x1b[0m`);
          break;
      }
    }
  }

  // 2. Toast notification
  const resolvedToast = resolveDynamicValue(config.toast, argsM);
  if (resolvedToast && isBrowser()) {
    showToast(message, resolveToastConfig(resolvedToast, argsM), consoleType as MessageType);
  }

  // 3. Callback
  if (config.callBack) {
    try {
      config.callBack(argsM);
    } catch (e: any) {
      console.error(
        `emessages: Error in callBack for "${errorName}":`,
        e.message
      );
    }
  }

  // 4. Return error message
  if (resolveDynamicValue(config.returnEM, argsM)) {
    return message;
  }

  // 5. Break execution
  const resolvedBreak = resolveDynamicValue(config.break, argsM);
  if (resolvedBreak ?? true) {
    if (isBrowser()) {
      throw errorToThrow || new Error(message);
    } else {
      process.exit(1);
    }
  }
}

export function Emessage(...configs: EmessageConfig[]) {
  for (const config of configs) {
    const parsed = parseConfig(config);
    if (parsed) {
      individualMessageStore.set(parsed.name, parsed.options);
    }
  }
}

Emessage.global = function (...configs: EmessageConfig[]) {
  for (const config of configs) {
    const parsed = parseConfig(config);
    if (parsed) {
      globalMessageStore.set(parsed.name, parsed.options);
    }
  }
};

export function showE(error: string | Record<string, any>, argsM: ArgsM = {}): string | void {
  const errorForStack = new Error();
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
    errorForStack.message = interpolateArgsM(
      String(resolveDynamicValue(config.message, argsM) ?? ""),
      argsM
    );
    return processEmessage(errorName, config, argsM, errorForStack);
  }
}
