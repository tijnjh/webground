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
 * @typedef {"log" | "warn" | "error"} LogTypes
 */

/** @type {HTMLDivElement | null} */
let consoleEl = null;

/** @type {Pick<Console, LogTypes> | null} */
let originalConsole = null;

/** @param {LogTypes} type */
function fakeConsole(type) {
    /** @param {*[]} args */
    return (...args) => {
        if (!consoleEl) return;

        originalConsole?.[type](...args);

        for (const arg of args) {
            const lineEl = document.createElement("div");
            lineEl.className = `line ${type}`;
            lineEl.textContent = arg;
            consoleEl.append(lineEl);
        }
    };
}

function initOverrides() {
    if (!consoleEl) return;

    originalConsole = {
        log: console.log.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console),
    };

    console.log = fakeConsole("log");
    console.warn = fakeConsole("warn");
    console.error = fakeConsole("error");
}

class WebgroundConsole extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: "open" });
        const style = document.createElement("style");
        style.textContent = getStyles();

        const consoleContainerEl = createEl("div", { className: "collapsed" });

        consoleContainerEl.setAttribute("data-webground-console", "");

        const headerEl = createEl("div", {
            className: "header",
            innerHTML: "Console",
        });

        const collapseButton = createEl("button", {
            textContent: "Toggle",
            onclick: () =>
                void consoleContainerEl.classList.toggle("collapsed"),
        });

        headerEl.append(collapseButton);

        const outputEl = createEl("div", { className: "output" });
        consoleEl = outputEl;

        consoleContainerEl.append(headerEl, outputEl);

        shadow.append(style, consoleContainerEl);

        initOverrides();
    }
}

customElements.define("webground-console", WebgroundConsole);

function getStyles() {
    return `
        [data-webground-console] {
            all: unset;
            background-color: #fff;
            font-family: monospace;
            font-size: 14px;
            font-weight: normal;
            position: fixed;
            bottom: 0;
            overflow-y: scroll;
            inset-inline: 0;
            display: flex;
            flex-direction: column;

            .header {
                background-color: #f0f0f0;
                padding: 0.5rem 1rem;
                border-block: 1px solid #ccc;
                font-weight: bold;
                color: #333;
                flex-shrink: 0; 
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .output { 
                flex-grow: 1;
                overflow-y: auto; 
                height: 256px;
            }

            &.collapsed .output {
                flex-grow: 0;   
                display: none;
            }

            .line {
                --color: gray;
                padding: .25rem .5rem;
                border-bottom: 1px solid color-mix(in srgb, var(--color), transparent 75%);
                background-color: color-mix(in srgb, var(--color), transparent 85%);
                color: color-mix(in srgb, var(--color), #000 50%);    

                &.warn {
                    --color: yellow;
                }

                &.error {
                    --color: red;
                }
            }
        }
    `;
}
