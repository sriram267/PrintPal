/**
 * New record ids made in the browser: "<prefix>-<time>-<random>".
 * The time keeps lists that sort by id in creation order; the random part means two shops can never make the same
 * id and nobody can guess one. Same format as src/shared/server/newId.mjs (used by the server).
 */
export function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${randomPart()}`
}

function randomPart(): string {
  const c = globalThis.crypto
  if (typeof c?.randomUUID === "function") return c.randomUUID().replace(/-/g, "")
  // randomUUID needs a secure page (https or localhost); getRandomValues works everywhere.
  const bytes = new Uint8Array(16)
  c.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}
