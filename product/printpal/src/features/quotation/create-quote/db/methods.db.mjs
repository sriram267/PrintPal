/**
 * Database: The six pricing methods (shared by every shop, so not scoped to one shop).
 */
export function createMethodsDb(pg, syncRls) {
  return {
    async getAll() {
      const res = await pg.query("SELECT * FROM methods ORDER BY sort_order ASC");
      return res.rows;
    },
  };
}
