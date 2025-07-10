export interface Code {
  html: string
  css: string
  js: string
}

export type LangUnion = 'html' | 'css' | 'js'
export interface ConsoleAction {
  __webground: true
  type:
    | 'log'
    | 'warn'
    | 'error'
    | 'dir'
    | 'trace'
    | 'info'
    | 'debug'
    | 'assert'
    | 'clear'
    | 'table'
    | 'timeLog'
  data: any[]
}
