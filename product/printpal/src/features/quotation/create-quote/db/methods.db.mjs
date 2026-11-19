/**
 * Database: The six pricing methods (shared by every shop).
 * Every query is scoped to the signed-in shop (tenant) and runs syncRls first, so row-level security applies.
 * Moved unchanged from server/repository.mjs (restructure A2).
 */
export function createMethodsDb(pg, syncRls) {
  return {
    async getAll() {
      const res = await pg.query("SELECT * FROM methods ORDER BY sort_order ASC");
      return res.rows;
    },
  };
}
