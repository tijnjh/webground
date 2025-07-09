/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */

/** @typedef {import("../types").ConsoleAction} ConsoleAction */

const timers = new Map()

/**
 * @template T
 * @param {T} arg
 * @returns {SanitizedValue<T>} 
 */
function sanitize(arg) {
  /**
   * @type {WeakSet<object>}
   */
  const seen = new WeakSet()
  /**
   * @param {any} obj
   * @returns {any} 
   */
  const traverse = (obj) => {
    if (obj === null || typeof obj !== 'object') {
      if (typeof obj === 'function')
        return obj.toString()
      return obj
    }
    if (seen.has(obj)) {
      return '[Circular]'
    }
    seen.add(obj)

    if (obj instanceof Error) {
      /** @type {SanitizedError} */
      return {
        __isError: true,
        message: obj.message,
        stack: obj.stack,
      }
    }

    if (Array.isArray(obj)) {
      return obj.map(traverse)
    }

    /** @type {Record<string, any>} */
    const newObj = {}
    for (const key of Object.keys(obj)) {
      newObj[key] = traverse(obj[key])
    }
    return newObj
  }
  return traverse(arg)
}

/**
 * @typedef {object} SanitizedError
 * @property {true} __isError
 * @property {string} message
 * @property {string|undefined} stack
 */

/**
 * @template T
 * @typedef {T extends Error
 *   ? SanitizedError
 *   : T extends Function
 *     ? string
 *     : T extends object
 *       ? { [K in keyof T]: SanitizedValue<T[K]> }
 *       : T
 * } SanitizedValue
 */

/** @param {ConsoleAction["type"]} type */
function createLogger(type) {
  return (/** @type {*[]} */ ...args) => {
    const data = args.map(sanitize)
    window.parent.postMessage({ __webground: true, type, data }, '*')
  }
}

console.log = createLogger('log')
console.warn = createLogger('warn')
console.error = createLogger('error')
console.dir = createLogger('dir')
console.info = createLogger('info')
console.debug = createLogger('debug')

console.assert = (condition, ...args) => {
  if (!condition) {
    const data = ['Assertion failed:', ...args.map(sanitize)]
    window.parent.postMessage({ __webground: true, type: 'error', data }, '*')
  }
}

console.clear = () => {
  window.parent.postMessage(
    { __webground: true, type: 'clear', data: [] },
    '*',
  )
}

console.table = (...args) => {
  const data = args.map(sanitize)
  window.parent.postMessage({ __webground: true, type: 'table', data }, '*')
}

console.timeLog = (label = 'default') => {
  const startTime = timers.get(label)
  if (startTime) {
    const duration = performance.now() - startTime
    console.log(`${label}: ${duration.toFixed(2)}ms`)
    // Note: doesn't delete the timer like timeEnd does
  }
}

console.time = (label = 'default') => {
  timers.set(label, performance.now())
}

console.timeEnd = (label = 'default') => {
  const startTime = timers.get(label)
  if (startTime) {
    const duration = performance.now() - startTime
    console.log(`${label}: ${duration.toFixed(2)}ms`)
    timers.delete(label)
  }
}

console.trace = (...args) => {
  const stack = new Error().stack?.split('\n').slice(2).join('\n')
  const data = [...args.map(sanitize), { __isTrace: true, stack }]
  window.parent.postMessage({ __webground: true, type: 'trace', data }, '*')
}

window.addEventListener('error', (event) => {
  console.error(event.error)
})
