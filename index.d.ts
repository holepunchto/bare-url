declare class URL {
  constructor(input: string, base?: string, opts?: { throw?: boolean })

  href: string
  protocol: string
  username: string
  password: string
  host: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string

  toString(): string
  toJSON(): string
}

declare namespace URL {
  export function isURL(value: unknown): value is URL

  export function parse(input: string, base?: string): URL | null

  export function canParse(input: string, base?: string): boolean

  export function fileURLToPath(url: URL | string): string

  export function pathToFileURL(pathname: string): URL

  export { URL }
}

export = URL
