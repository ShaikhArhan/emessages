# emessages

A simple and flexible error messaging utility for JavaScript and TypeScript applications. Works in both Node.js and the browser, supporting CJS and ESM modules.

## Features

-   **Flexible Configuration**: Define error messages with custom behaviors.
-   **Global & Local Scope**: Set global messages for your entire application and override them with local messages in specific files.
-   **Multiple Actions**: Show console messages (`log`, `warn`, `error`), halt execution, show browser toasts, return the message, and run callbacks.
-   **TypeScript Ready**: Fully typed for a great developer experience.
-   **Isomorphic**: Works on both frontend and backend.

## Installation

```bash
npm install emessages
```

## Quick Start

### 1. Basic Usage

In your JavaScript or TypeScript file:

```javascript
import { Emessage, showE } from "emessages";

// Define a local error message
Emessage({
  GREETING_ERROR: "Cannot greet a user without a name.",
  type: "war",
  break: false, // Don't stop the code
});

function greet(name) {
  if (!name) {
    showE("GREETING_ERROR");
    return;
  }
  console.log(`Hello, ${name}!`);
}

greet(); // outputs a warning
greet("World"); // outputs: "Hello, World!"
```

### 2. Global Messages (Optional)

To define messages that are accessible throughout your project, create a file (e.g., `globalMessages.ts`) and import it once in your application's entry point.

**`globalMessages.ts`**
```javascript
import { Emessage } from "emessages";

// Use Emessage.global to define messages available everywhere
Emessage.global(
  {
    NAME_NOT_FOUND: "Name is required.",
    type: "err",
    break: false,
  },
  {
    UNAUTHORIZED: "User is not authorized.",
    type: "err",
    tost: true,
  }
);
```

**`index.ts` (Your app's entry point)**
```javascript
import "./globalMessages";
// ... rest of your app
```

**Priority**: Messages defined with `Emessage` (local) will always take priority over messages defined with `Emessage.global`.

### 3. Toast Notifications (Browser)

To use toast notifications, you must import the provided CSS file in your application.

```javascript
// Example in a React/Vue/Svelte entry file
import "emessages/dist/emessages.css";
```

Then, use the `tost` option:

```javascript
Emessage({
  STYLE_ERROR: "This will be a toast.",
  type: "log", // It can be any type
  tost: true, // Enable toast
  break: false,
});

showE("STYLE_ERROR");
```

You can also customize the toast:

```javascript
showE({
  CUSTOM_TOAST: "A custom toast!",
  tost: {
    message: "This message overrides the default.",
    style: "text-yellow-400 text-base", // Custom CSS classes
    position: "bottom-left",
  },
  break: false,
});
```

## API Reference

### `Emessage(...configs)`

Defines one or more local error messages.

### `Emessage.global(...configs)`

Defines one or more global error messages.

### Config Object

Each config object passed to `Emessage` has one error name/message and a set of optional properties:

-   `[errorName: string]: string`: The name of the error and its message.
-   `type?`: `"log" | "war" | "err"`. The console method to use. **Default**: `"err"`.
-   `break?`: `boolean`. If `true`, stops execution (throws in browser, `process.exit(1)` in Node.js). **Default**: `true`.
-   `tost?`: `boolean | TostConfig`. If `true`, shows a toast. Can be an object for customization.
-   `returnEM?`: `boolean`. If `true`, `showE` will return the error message as a string.
-   `callBack?`: `() => void`. A function to execute.

**`TostConfig` Object**
-   `message?`: `string`. A different message for the toast.
-   `style?`: `string`. Custom CSS classes to apply.
-   `position?`: `string`. e.g., `"top-right"`, `"bottom-left"`, `"center"`.

### `showE(errorName | config, argsM?)`

Triggers an error.

-   `errorName: string`: The name of the pre-configured error to show. `showE` will look for a local definition first, then a global one.
-   `config: object`: An inline config object for a one-off error message.
-   `argsM?: Record<string, any>`: Runtime values used to build dynamic messages and evaluate dynamic options.

## Dynamic `argsM` Example

```javascript
import { Emessage, showE } from "emessages";

const dataStore = {};

Emessage({
  TEST3: (argsM) =>`Hello ${argsM.name}, your total marks are ${argsM.totalMarks}`,
  type: (argsM) => (argsM.name ? "log" : "err"),
  break: (argsM) => !(argsM.name && argsM.age && argsM.marks?.length > 0),
  toast: (argsM) => !!(argsM.subject && argsM.marks),
  callBack: (argsM) => {
    dataStore.totalMarks = argsM.totalMarks;
    dataStore.marksPercentage = argsM.getMarksPercentage(argsM.marks);
  },
});

showE("TEST3", {
  name: "Arhan",
  age: 20,
  subject: { sub1: "Math", sub2: "Science" },
  marks: [90, 80, 70],
  totalMarks: 240,
  getMarksPercentage: (marks) => (marks.reduce((a, b) => a + b, 0) / 300) * 100,
});

console.log(dataStore);
```
