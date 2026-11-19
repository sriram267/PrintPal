/*
 * New record ids made on the server: "<prefix>-<time>-<random>".
 * The time keeps lists that sort by id in creation order; the random part means two shops can never make the
 * same id and nobody can guess one. Same format as src/shared/newId.ts (used by the screens).
 */
import { randomUUID } from "node:crypto";

export function newId(prefix) {
  return `${prefix}-${Date.now()}-${randomUUID().replace(/-/g, "")}`;
}
