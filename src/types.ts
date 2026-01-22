export type MessageType = "log" | "war" | "err";

export interface TostConfig {
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
  tost?: boolean | TostConfig;
  returnEM?: boolean;
  callBack?: (...args: any[]) => any;
}

export interface StoredEmessage extends EmessageOptions {
  message: string;
}
