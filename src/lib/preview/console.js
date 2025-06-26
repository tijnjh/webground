/**
 * @template {keyof HTMLElementTagNameMap} TagName
 * @typedef {& Partial<HTMLElementTagNameMap[TagName]>} ElementAttributes
 */

/**
 * @template {keyof HTMLElementTagNameMap} TagName
 * @param {TagName} tagName
 * @param {ElementAttributes<TagName>} [attributes]
 * @returns {HTMLElementTagNameMap[TagName]}
 */
function createEl(tagName, attributes) {
  const el = document.createElement(tagName);
  Object.assign(el, attributes);
  return el;
}

/**
 * @typedef {"log" | "warn" | "error" | "info"} LogTypes
 */

/** @type {HTMLDivElement | null} */
let consoleEl = null;

/** @type {Pick<Console, LogTypes> | null} */
let originalConsole = null;

/** @type {Map<string, {element: HTMLElement, count: number}>} */
let messageCache = new Map();

/**
 * Format a value for display in the console
 * @param {*} value
 * @param {number} depth
 * @returns {HTMLElement}
 */
function formatValue(value, depth = 0) {
  const container = createEl("span");

  if (value === null) {
    container.className = "null";
    container.textContent = "null";
  } else if (value === undefined) {
    container.className = "undefined";
    container.textContent = "undefined";
  } else if (typeof value === "string") {
    container.className = "string";
    container.textContent = `"${value}"`;
  } else if (typeof value === "number") {
    container.className = "number";
    container.textContent = value.toString();
  } else if (typeof value === "boolean") {
    container.className = "boolean";
    container.textContent = value.toString();
  } else if (typeof value === "function") {
    container.className = "function";
    container.textContent =
      value.toString().length > 50
        ? value.toString().substring(0, 50) + "..."
        : value.toString();
  } else if (Array.isArray(value)) {
    return formatArray(value, depth);
  } else if (value instanceof Error) {
    return formatError(value);
  } else if (typeof value === "object") {
    return formatObject(value, depth);
  } else {
    container.textContent = String(value);
  }

  return container;
}

/**
 * Format an array for display
 * @param {any[]} arr
 * @param {number} depth
 * @returns {HTMLElement}
 */
function formatArray(arr, depth) {
  const container = createEl("span", { className: "array" });

  if (arr.length === 0) {
    container.textContent = "[]";
    return container;
  }

  if (depth > 2) {
    container.textContent = `Array(${arr.length})`;
    return container;
  }

  const toggle = createEl("span", {
    className: "toggle",
    textContent: "▶",
  });

  const preview = createEl("span", {
    className: "preview",
    textContent: `Array(${arr.length})`,
  });

  const content = createEl("div", { className: "expandable-content" });

  arr.forEach((item, index) => {
    const itemEl = createEl("div", { className: "array-item" });
    const indexEl = createEl("span", {
      className: "index",
      textContent: `${index}: `,
    });
    itemEl.append(indexEl, formatValue(item, depth + 1));
    content.append(itemEl);
  });

  let expanded = false;
  toggle.onclick = () => {
    expanded = !expanded;
    toggle.textContent = expanded ? "▼" : "▶";
    content.style.display = expanded ? "block" : "none";
    preview.style.display = expanded ? "none" : "inline";
  };

  container.append(toggle, preview, content);
  return container;
}

/**
 * Format an object for display
 * @param {any} obj
 * @param {number} depth
 * @returns {HTMLElement}
 */
function formatObject(obj, depth) {
  const container = createEl("span", { className: "object" });

  if (obj === null) {
    container.textContent = "null";
    return container;
  }

  const keys = Object.keys(obj);
  if (keys.length === 0) {
    container.textContent = "{}";
    return container;
  }

  if (depth > 2) {
    container.textContent = `{${keys.slice(0, 3).join(", ")}${
      keys.length > 3 ? "..." : ""
    }}`;
    return container;
  }

  const toggle = createEl("span", {
    className: "toggle",
    textContent: "▶",
  });

  const preview = createEl("span", {
    className: "preview",
    textContent: `{${keys.slice(0, 3).join(", ")}${
      keys.length > 3 ? `... +${keys.length - 3} more` : ""
    }}`,
  });

  const content = createEl("div", { className: "expandable-content" });

  keys.forEach((key) => {
    const itemEl = createEl("div", { className: "object-item" });
    const keyEl = createEl("span", {
      className: "key",
      textContent: `${key}: `,
    });
    try {
      itemEl.append(keyEl, formatValue(obj[key], depth + 1));
    } catch (e) {
      const errorEl = createEl("span", {
        className: "error",
        textContent: "[Error accessing property]",
      });
      itemEl.append(keyEl, errorEl);
    }
    content.append(itemEl);
  });

  let expanded = false;
  toggle.onclick = () => {
    expanded = !expanded;
    toggle.textContent = expanded ? "▼" : "▶";
    content.style.display = expanded ? "block" : "none";
    preview.style.display = expanded ? "none" : "inline";
  };

  container.append(toggle, preview, content);
  return container;
}

/**
 * Format an error for display
 * @param {Error} error
 * @returns {HTMLElement}
 */
function formatError(error) {
  const container = createEl("div", { className: "error-container" });

  const message = createEl("div", {
    className: "error-message",
    textContent: `${error.name}: ${error.message}`,
  });

  if (error.stack) {
    const stackToggle = createEl("span", {
      className: "stack-toggle",
      textContent: "▶ Show stack trace",
    });

    const stackContent = createEl("pre", {
      className: "stack-trace",
      textContent: error.stack,
    });

    let stackExpanded = false;
    stackToggle.onclick = () => {
      stackExpanded = !stackExpanded;
      stackToggle.textContent = stackExpanded
        ? "▼ Hide stack trace"
        : "▶ Show stack trace";
      stackContent.style.display = stackExpanded ? "block" : "none";
    };

    container.append(message, stackToggle, stackContent);
  } else {
    container.append(message);
  }

  return container;
}

/**
 * Get timestamp string
 * @returns {string}
 */
function getTimestamp() {
  const now = new Date();
  return now.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  });
}

/**
 * Create a console line
 * @param {LogTypes} type
 * @param {*[]} args
 */
function createConsoleLine(type, args) {
  const messageKey = `${type}:${args.map((arg) => String(arg)).join(":")}`;

  // Check if we have this exact message already
  if (messageCache.has(messageKey)) {
    const cached = messageCache.get(messageKey);
    if (cached) {
      cached.count++;
      const countEl = cached.element.querySelector(".repeat-count");
      if (countEl && countEl instanceof HTMLElement) {
        countEl.textContent = cached.count.toString();
        countEl.style.display = "inline-block";
      }
    }
    return;
  }

  const lineEl = createEl("div", { className: `console-line ${type}` });

  // Timestamp
  const timestampEl = createEl("span", {
    className: "timestamp",
    textContent: getTimestamp(),
  });

  // Content container
  const contentEl = createEl("div", { className: "content" });

  // Format each argument
  args.forEach((arg, index) => {
    if (index > 0) {
      contentEl.append(createEl("span", { textContent: " " }));
    }
    contentEl.append(formatValue(arg));
  });

  // Repeat count (initially hidden)
  const repeatCount = createEl("span", {
    className: "repeat-count",
    textContent: "1",
  });

  // Copy button
  const copyBtn = createEl("button", {
    className: "copy-btn",
    textContent: "📋",
    title: "Copy to clipboard",
  });

  copyBtn.onclick = () => {
    const text = args
      .map((arg) => {
        if (typeof arg === "object") {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(" ");

    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        copyBtn.textContent = "✓";
        setTimeout(() => (copyBtn.textContent = "📋"), 1000);
      })
      .catch(() => {
        // Fallback for older browsers
        const textarea = createEl("textarea", { value: text });
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        copyBtn.textContent = "✓";
        setTimeout(() => (copyBtn.textContent = "📋"), 1000);
      });
  };

  lineEl.append(timestampEl, contentEl, repeatCount, copyBtn);
  consoleEl?.append(lineEl);

  // Cache the message
  messageCache.set(messageKey, { element: lineEl, count: 1 });

  // Auto-scroll to bottom
  if (consoleEl) {
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }
}

/** @param {LogTypes} type */
function fakeConsole(type) {
  /** @param {*[]} args */
  return (...args) => {
    if (!consoleEl) return;

    // Call original console method
    originalConsole?.[type](...args);

    // Add to our console
    createConsoleLine(type, args);
  };
}

function initOverrides() {
  if (!consoleEl) return;

  originalConsole = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    info: console.info.bind(console),
  };

  console.log = fakeConsole("log");
  console.warn = fakeConsole("warn");
  console.error = fakeConsole("error");
  console.info = fakeConsole("info");

  // Catch uncaught errors
  window.addEventListener("error", (event) => {
    createConsoleLine("error", [event.error || new Error(event.message)]);
  });

  // Catch unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    createConsoleLine("error", [
      new Error(`Unhandled promise rejection: ${event.reason}`),
    ]);
  });
}

/**
 * Clear the console
 */
function clearConsole() {
  if (consoleEl) {
    consoleEl.innerHTML = "";
    messageCache.clear();
  }
}

/** @type {boolean} */
let isReinjecting = false;

/** @type {number} */
let reinjectTimeout = 0;

/**
 * Ensure console is present in the document
 */
function ensureConsoleExists() {
  // Prevent recursive calls
  if (isReinjecting) return;

  // Check if console element exists in the DOM
  if (!document.querySelector("webground-console")) {
    isReinjecting = true;

    // Re-create and append the console
    const newConsole = document.createElement("webground-console");
    document.body.appendChild(newConsole);

    // Reset flag after a delay
    setTimeout(() => {
      isReinjecting = false;
    }, 100);
  }
}

/**
 * Set up observer to watch for console removal
 */
function setupConsoleObserver() {
  // Create a MutationObserver to watch for DOM changes
  const observer = new MutationObserver((mutations) => {
    // Prevent recursive triggering
    if (isReinjecting) return;

    // Clear any existing timeout
    clearTimeout(reinjectTimeout);

    // Debounce the check to prevent rapid-fire mutations
    reinjectTimeout = setTimeout(() => {
      // Only check if we're not currently reinjecting
      if (isReinjecting) return;

      let needsReinjection = false;

      mutations.forEach((mutation) => {
        // Check if nodes were removed and console was among them
        if (mutation.type === "childList" && mutation.removedNodes.length > 0) {
          const consoleRemoved = Array.from(mutation.removedNodes).some(
            (node) =>
              node.nodeName === "WEBGROUND-CONSOLE" ||
              (node.nodeType === Node.ELEMENT_NODE &&
                node instanceof Element &&
                node.querySelector("webground-console"))
          );

          if (consoleRemoved) {
            needsReinjection = true;
          }
        }
      });

      // Also check if console is missing from DOM entirely
      if (!document.querySelector("webground-console")) {
        needsReinjection = true;
      }

      if (needsReinjection) {
        ensureConsoleExists();
      }
    }, 50); // 50ms debounce delay
  });

  // Start observing the document body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

class WebgroundConsole extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    const style = createEl("style");
    style.textContent = getStyles();

    const consoleContainerEl = createEl("div", {
      className: "console-container",
    });
    consoleContainerEl.setAttribute("data-webground-console", "");

    const headerEl = createEl("div", { className: "header" });

    const titleEl = createEl("span", {
      className: "title",
      textContent: "Console",
    });

    const buttonsEl = createEl("div", { className: "buttons" });

    const clearButton = createEl("button", {
      className: "clear-btn",
      textContent: "Clear",
      onclick: clearConsole,
    });

    const collapseButton = createEl("button", {
      className: "collapse-btn",
      textContent: "▼",
      onclick: () => {
        const isCollapsed = consoleContainerEl.classList.toggle("collapsed");
        collapseButton.textContent = isCollapsed ? "▲" : "▼";
      },
    });

    buttonsEl.append(clearButton, collapseButton);
    headerEl.append(titleEl, buttonsEl);

    const outputEl = createEl("div", { className: "output" });
    consoleEl = outputEl;

    consoleContainerEl.append(headerEl, outputEl);
    shadow.append(style, consoleContainerEl);

    initOverrides();

    // Set up observer to re-inject console if it gets removed
    setupConsoleObserver();

    // Add welcome message
    setTimeout(() => {
      console.log(
        "Console ready! Try logging something: console.log('Hello World!')"
      );
    }, 100);
  }
}

customElements.define("webground-console", WebgroundConsole);

function getStyles() {
  return `
    [data-webground-console] {
      all: unset;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
      font-size: 12px;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      border-top: 1px solid #e1e4e8;
      z-index: 9999;
      max-height: 40vh;
      min-height: 120px;
    }
    
    @media (prefers-color-scheme: dark) {
      [data-webground-console] {
        background: #1e1e1e;
        border-top-color: #333;
      }
    }

    .header {
      background: #f6f8fa;
      border-bottom: 1px solid #e1e4e8;
      padding: 8px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #586069;
    }
    
    @media (prefers-color-scheme: dark) {
      .header {
        background: #2d2d2d;
        border-bottom-color: #444;
        color: #8b949e;
      }
    }

    .buttons {
      display: flex;
      gap: 8px;
    }

    .clear-btn, .collapse-btn {
      background: none;
      border: 1px solid #d0d7de;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 11px;
      cursor: pointer;
      color: #656d76;
      transition: all 0.15s ease;
    }
    
    .clear-btn:hover, .collapse-btn:hover {
      background: #f3f4f6;
      border-color: #8c959f;
    }
    
    @media (prefers-color-scheme: dark) {
      .clear-btn, .collapse-btn {
        border-color: #444;
        color: #8b949e;
      }
      
      .clear-btn:hover, .collapse-btn:hover {
        background: #333;
        border-color: #666;
      }
    }

    .output {
      flex: 1;
      overflow-y: auto;
      padding: 0;
      background: #ffffff;
    }
    
    @media (prefers-color-scheme: dark) {
      .output {
        background: #1e1e1e;
      }
    }

    .collapsed .output {
      display: none;
    }

    .console-line {
      display: flex;
      align-items: flex-start;
      padding: 6px 12px;
      border-bottom: 1px solid #f6f8fa;
      position: relative;
      line-height: 1.4;
    }
    
    .console-line:hover {
      background: #f6f8fa;
    }
    
    .console-line:hover .copy-btn {
      opacity: 1;
    }
    
    @media (prefers-color-scheme: dark) {
      .console-line {
        border-bottom-color: #2d2d2d;
      }
      
      .console-line:hover {
        background: #2d2d2d;
      }
    }

    .console-line.warn {
      background: #fff8e1;
      border-left: 3px solid #ff9800;
    }
    
    .console-line.error {
      background: #ffebee;
      border-left: 3px solid #f44336;
    }
    
    .console-line.info {
      background: #e3f2fd;
      border-left: 3px solid #2196f3;
    }
    
    @media (prefers-color-scheme: dark) {
      .console-line.warn {
        background: #332b1a;
      }
      
      .console-line.error {
        background: #331a1a;
      }
      
      .console-line.info {
        background: #1a2633;
      }
    }

    .timestamp {
      color: #8b949e;
      font-size: 10px;
      margin-right: 8px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .content {
      flex: 1;
      word-break: break-word;
      color: #24292f;
    }
    
    @media (prefers-color-scheme: dark) {
      .content {
        color: #c9d1d9;
      }
    }

    .repeat-count {
      background: #0969da;
      color: white;
      border-radius: 10px;
      padding: 2px 6px;
      font-size: 10px;
      margin-left: 6px;
      display: none;
      flex-shrink: 0;
    }

    .copy-btn {
      background: none;
      border: none;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.15s ease;
      padding: 2px 4px;
      border-radius: 3px;
      font-size: 10px;
      margin-left: 8px;
      flex-shrink: 0;
    }
    
    .copy-btn:hover {
      background: #f3f4f6;
    }
    
    @media (prefers-color-scheme: dark) {
      .copy-btn:hover {
        background: #333;
      }
    }

    /* Value formatting */
    .string { color: #032f62; }
    .number { color: #005cc5; }
    .boolean { color: #d73a49; }
    .null, .undefined { color: #6f42c1; }
    .function { color: #6f42c1; font-style: italic; }
    
    @media (prefers-color-scheme: dark) {
      .string { color: #9ecbff; }
      .number { color: #79c0ff; }
      .boolean { color: #ff7b72; }
      .null, .undefined { color: #d2a8ff; }
      .function { color: #d2a8ff; }
    }

    .toggle {
      cursor: pointer;
      user-select: none;
      margin-right: 4px;
      color: #656d76;
      font-size: 10px;
    }
    
    .toggle:hover {
      color: #24292f;
    }
    
    @media (prefers-color-scheme: dark) {
      .toggle {
        color: #8b949e;
      }
      
      .toggle:hover {
        color: #c9d1d9;
      }
    }

    .expandable-content {
      display: none;
      margin-left: 12px;
      border-left: 1px solid #e1e4e8;
      padding-left: 8px;
      margin-top: 4px;
    }
    
    @media (prefers-color-scheme: dark) {
      .expandable-content {
        border-left-color: #444;
      }
    }

    .array-item, .object-item {
      margin: 2px 0;
    }

    .index, .key {
      color: #6f42c1;
      font-weight: 500;
    }
    
    @media (prefers-color-scheme: dark) {
      .index, .key {
        color: #d2a8ff;
      }
    }

    .error-container {
      color: #d73a49;
    }
    
    @media (prefers-color-scheme: dark) {
      .error-container {
        color: #ff7b72;
      }
    }

    .error-message {
      font-weight: 500;
    }

    .stack-toggle {
      cursor: pointer;
      color: #0969da;
      font-size: 11px;
      margin-top: 4px;
      display: block;
    }
    
    .stack-toggle:hover {
      text-decoration: underline;
    }
    
    @media (prefers-color-scheme: dark) {
      .stack-toggle {
        color: #58a6ff;
      }
    }

    .stack-trace {
      display: none;
      background: #f6f8fa;
      padding: 8px;
      border-radius: 4px;
      margin-top: 4px;
      font-size: 11px;
      color: #656d76;
      overflow-x: auto;
    }
    
    @media (prefers-color-scheme: dark) {
      .stack-trace {
        background: #2d2d2d;
        color: #8b949e;
      }
    }
  `;
}
