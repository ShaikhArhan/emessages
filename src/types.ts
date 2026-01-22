export type MessageType = "log" | "war" | "err";

export interface ToastConfig {
  style?: string;
  message?: string;
  position?:
    | "top"
    | "right"
    | "left"
    | "bottom"
    | "center"
    | "top right"
    | "top left"
    | "bottom right"
    | "bottom left";
}

export interface EmessageOptions {
  type?: MessageType;
  break?: boolean;
  toast?: boolean | ToastConfig;
  returnEM?: boolean;
  callBack?: (...args: any[]) => any;
}

export interface StoredEmessage extends EmessageOptions {
  message: string;
}

export type EmessageConfig = EmessageOptions & { [key: string]: any };
