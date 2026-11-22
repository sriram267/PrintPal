import pg from 'pg';
import fs from 'fs';

// Read DATABASE_URL from .env
const envFile = fs.readFileSync('.env', 'utf8');
const match = envFile.match(/DATABASE_URL="?([^"\n]+)"?/);
const connectionString = match ? match[1] : process.env.DATABASE_URL;

console.log('Connecting to Neon:', connectionString.replace(/:[^:]*@/, ':***@'));

const pool = new pg.Pool({
  connectionString: connectionString
});

async function checkNeon() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('\nNeon Tables in public schema:');
    console.log(res.rows.map(r => ' - ' + r.table_name).join('\n'));
  } catch (err) {
    console.error('Neon Query Error:', err);
  } finally {
    client.release();
    pool.end();
  }
}

checkNeon();
