/** @typedef {import("../types").ConsoleAction} ConsoleAction */

/** @param {ConsoleAction["type"]} type */
const createLogger = (type) => (/** @type {*[]} */ ...data) => {
  window.parent.postMessage({ __webground: true, type, data }, "*");
};

console.log = createLogger("log");
console.warn = createLogger("warn");
console.error = createLogger("error");
