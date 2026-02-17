export type MessageType = "log" | "war" | "err" | boolean;
export type ArgsM = Record<string, any>;
export type DynamicValue<T> = T | ((argsM: ArgsM) => T);

export interface ToastConfig {
  message?: DynamicValue<string | undefined>;
  style?: DynamicValue<string | undefined>;
  class?: DynamicValue<string | undefined>;
  position?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "center"
    | "top-right"
    | "top-left"
    | "top-center"
    | "bottom-right"
    | "bottom-left"
    | "bottom-center"
    | "center-left"
    | "center-right";
  stay?: DynamicValue<boolean | undefined>;
  duration?: DynamicValue<number | undefined>;
  delay?: DynamicValue<number | undefined>;
}

export interface EmessageOptions {
  type?: DynamicValue<MessageType>;
  break?: DynamicValue<boolean>;
  toast?: DynamicValue<boolean | ToastConfig>;
  returnEM?: DynamicValue<boolean>;
  callBack?: (argsM: ArgsM) => void;
}

export interface EmessageConfig extends EmessageOptions {
  [key: string]:
    | string
    | DynamicValue<string | MessageType | boolean | ToastConfig | undefined>
    | ((argsM: ArgsM) => void)
    | undefined;
}

export interface StoredEmessage extends EmessageOptions {
  message: DynamicValue<string>;
}

