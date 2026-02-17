import { ToastConfig, MessageType } from "./types";

export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.document !== "undefined";
}


/**
 * Removes a toast element from the DOM with a fade-out transition.
 * @param toastElement The toast element to remove.
 */
function removeToastElement(toastElement: HTMLElement | null) {
  if (!toastElement || !toastElement.parentElement) return;

  toastElement.classList.remove("visible");
  // Remove the element after the transition ends to allow for animation
  toastElement.addEventListener("transitionend", () => {
    const container = toastElement.parentElement;
    if (container) {
      container.removeChild(toastElement);
      // If the container is now empty, remove it from the DOM
      if (container.childElementCount === 0 && container.parentElement) {
        container.parentElement.removeChild(container);
      }
    }
  });
}

/**
 * Initializes the global API for emessages, like window.emessages.closeToast
 */
function initializeGlobalApi() {
  if (!isBrowser()) return;

  // Ensure the global namespace exists
  if (!(window as any).emessages) {
    (window as any).emessages = {};
  }

  // Attach the closeToast function if it doesn't exist
  if (!(window as any).emessages.closeToast) {
    (window as any).emessages.closeToast = function (eventOrId: Event | string) {
      let toastElement: HTMLElement | null = null;

      if (typeof eventOrId === 'string') {
        // Find toast by ID
        toastElement = document.getElementById(eventOrId);
      } else if (eventOrId && eventOrId.target) {
        // Find toast by traversing from the event target
        toastElement = (eventOrId.target as HTMLElement).closest('.emessage-toast');
      }

      if (toastElement) {
        removeToastElement(toastElement);
      } else {
        console.warn('emessages: closeToast() was called but could not find a toast element to close.');
      }
    };
  }
}

// Initialize the global API when the module is loaded
initializeGlobalApi();


// Function to inject CSS for toasts
function injectToastStyles() {
  if (!isBrowser()) return;

  const styleId = "emessages-toast-styles";
  if (document.getElementById(styleId)) {
    return; // Styles already injected
  }

  const style = document.createElement("style");
  style.id = styleId;
  style.innerHTML = `
    .emessages-toast-container {
      position: fixed;
      display: flex;
      flex-direction: column;
      padding: 10px;
      pointer-events: none;
      z-index: 9999;
      box-sizing: border-box;
    }

    /* Positioning for containers */
    .emessages-toast-container.top-left { top: 0; left: 0; align-items: flex-start; }
    .emessages-toast-container.top-center { top: 0; left: 50%; transform: translateX(-50%); align-items: center; }
    .emessages-toast-container.top-right { top: 0; right: 0; align-items: flex-end; }
    .emessages-toast-container.bottom-left { bottom: 0; left: 0; align-items: flex-start; }
    .emessages-toast-container.bottom-center { bottom: 0; left: 50%; transform: translateX(-50%); align-items: center; }
    .emessages-toast-container.bottom-right { bottom: 0; right: 0; align-items: flex-end; }
    .emessages-toast-container.center { top: 50%; left: 50%; transform: translate(-50%, -50%); align-items: center; }
    .emessages-toast-container.center-left { top: 50%; left: 0; transform: translateY(-50%); align-items: flex-start; }
    .emessages-toast-container.center-right { top: 50%; right: 0; transform: translateY(-50%); align-items: flex-end; }


    .emessage-toast {
      padding: 12px 18px;
      margin: 8px;
      border-radius: 6px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
      font-size: 14px;
      opacity: 0;
      transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
      transform: translateY(20px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      pointer-events: all;
      max-width: 350px;
      word-break: break-word;
      box-sizing: border-box;
      position: relative;
      padding-right: 42px; /* keep content clear from the absolute close button */
    }

    .emessage-toast.visible {
      opacity: 1;
      transform: translateY(0);
    }

    /* Default styles based on message type */
    .emessage-toast-err { background-color: #ef4444; color: white; } /* red-500 */
    .emessage-toast-war { background-color: #f59e0b; color: white; } /* amber-500 */
    .emessage-toast-log { background-color: #ffffff; color: #1f2937; border: 1px solid #e5e7eb; } /* white, gray-800 text, gray-200 border */

    .emessage-toast-message {
      display: block;
      width: 100%;
    }

    .emessage-toast-close {
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      color: inherit;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;
      line-height: 1;
      opacity: 0.7;
      padding: 2px 6px;
      margin: 0;
      z-index: 1;
    }
    .emessage-toast-close:hover {
        opacity: 1;
    }
    .emessage-toast-close:focus,
    .emessage-toast-close:focus-visible {
      outline: none;
    }
  `;
  // Prepend styles to give user stylesheets higher priority
  document.head.insertBefore(style, document.head.firstChild);
}

// Function to get or create a specific toast container for a position
function getOrCreateToastContainer(position: string): HTMLElement {
  // Normalize position string to handle variants like "top" -> "top-center"
  const positionMap: Record<string, string> = {
    top: "top-center",
    bottom: "bottom-center",
    left: "center-left",
    right: "center-right",
    center: "center",
    "top-right": "top-right",
    "top-left": "top-left",
    "top-center": "top-center",
    "bottom-right": "bottom-right",
    "bottom-left": "bottom-left",
    "bottom-center": "bottom-center",
    "center-left": "center-left",
    "center-right": "center-right",
  };

  const normalizedPosition = positionMap[position.toLowerCase().replace(/\s/g, "-")] || "top-right";
  const containerId = `emessages-toast-container-${normalizedPosition}`;
  let container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    container.className = `emessages-toast-container ${normalizedPosition}`;
    document.body.appendChild(container);
  }
  return container;
}


export function showToast(
  message: string,
  toastOptions: boolean | ToastConfig,
  messageType: MessageType = "log"
): void {
  if (!isBrowser()) {
    return;
  }

  injectToastStyles();

  const config: ToastConfig = typeof toastOptions === "object" ? toastOptions : {};

    let {
      message: customMessage,
      style: customStyle,
      class: customClass,
      position = "top-right",
      stay = false,
      duration = 3000,
      delay = 0,
    } = config;
  
    const toast = document.createElement("div");
    // Assign a unique ID for programmatic closing
    toast.id = `emessage-toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Base class is applied first
    let toastClasses = ['emessage-toast'];
  
    // Add default type class. We use a separate class to avoid specificity conflicts.
    toastClasses.push(`emessage-toast-${messageType}`);
  
    // Add custom classes. These can now override the default type styles if they have the same specificity.
    if (customClass) {
      toastClasses.push(...customClass.split(' ').filter(c => c));
    }
    
    toast.className = toastClasses.join(' ');
  
    // Apply custom inline style from config (highest priority)
    if (customStyle) {
      toast.style.cssText += customStyle;
    }
  
    // Create a dedicated element for the message to avoid conflicts with the close button
    const messageElement = document.createElement('div');
    messageElement.className = 'emessage-toast-message';
  
    // Check if customMessage is a React element or other object, which is invalid.
    if (typeof customMessage === 'object' && customMessage !== null) {
        console.warn('emessages: The `toast.message` property received an object (likely a React component), but it only accepts an HTML string. Please pass a string of HTML to render it correctly. Falling back to the default message.');
        customMessage = undefined; // Use the default message instead
    }
  
    messageElement.innerHTML = customMessage || message;
    toast.appendChild(messageElement);
  
  
    // Add close button (always add for accessibility, but control removal logic)
    const closeButton = document.createElement("button");
    closeButton.className = "emessage-toast-close";
    closeButton.innerHTML = "&times;";
    closeButton.setAttribute("aria-label", "Close");
    closeButton.onclick = () => removeToastElement(toast);
    toast.appendChild(closeButton);
  
    const container = getOrCreateToastContainer(position);
  
    // Delay the appearance of the toast
    setTimeout(() => {
      // For bottom-positioned toasts, insert at the top of the container
      if (position.includes('bottom')) {
          container.prepend(toast);
      } else {
          container.appendChild(toast);
      }
      
      // Allow the element to be in the DOM before transitioning
      requestAnimationFrame(() => {
          toast.classList.add("visible");
      });
    }, delay);
  
    // Set up auto-hide if not staying
    if (!stay) {
      const hideTimeout = setTimeout(() => removeToastElement(toast), delay + duration);
      // Optional: pause on hover
      toast.addEventListener('mouseenter', () => clearTimeout(hideTimeout));
      toast.addEventListener('mouseleave', () => {
          if (!stay) {
              setTimeout(() => removeToastElement(toast), 1000); // Give some time before hiding on mouse leave
          }
      });
    }}
