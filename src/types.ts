export type MessageType = "log" | "war" | "err" | boolean;

export interface ToastConfig {
  message?: string;
  style?: string;
  class?: string;
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
  stay?: boolean;
  duration?: number;
  delay?: number;
}

export interface EmessageOptions {
  type?: MessageType;
  break?: boolean;
  toast?: boolean | ToastConfig;
  returnEM?: boolean;
  callBack?: () => void;
}

export interface EmessageConfig extends EmessageOptions {
  [key: string]: string | MessageType | boolean | (() => void) | ToastConfig | undefined;
}

export interface StoredEmessage extends EmessageOptions {
  message: string;
}

