import { TostConfig } from "./types";

export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.document !== "undefined";
}

export function showToast(
  message: string,
  tostConfig: boolean | TostConfig
): void {
  if (!isBrowser()) {
    return;
  }

  const toast = document.createElement("div");

  const config: TostConfig = typeof tostConfig === "object" ? tostConfig : {};

  toast.textContent = config.message || message;

  // Base styles are applied via CSS, but some can be defaults.
  toast.className = "emessage-toast";
  if (config.style) {
    toast.classList.add(...config.style.split(" "));
  }

  // Positioning
  const position = config.position || "top-right";
  toast.setAttribute("data-position", position);

  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.add("visible");
  }, 10);

  // Animate out and remove
  setTimeout(() => {
    toast.classList.remove("visible");
    toast.addEventListener("transitionend", () => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    });
  }, 3000);
}
