#!/usr/bin/env node
/**
 * Offline Database Reset Script (CLI Only)
 * 
 * SECURITY: This script is deliberately NOT exposed over HTTP.
 * It can only be executed with direct database access via the terminal.
 *
 * Usage:
 *   node scripts/db-clear-all.mjs --confirm
 */

import pgPkg from 'pg';
import fs from 'node:fs';

const isConfirmed = process.argv.includes('--confirm');

if (!isConfirmed) {
  console.error('\n⚠️  SAFETY HALT: This script will delete ALL customers, enquiries, quotes, and sites across all tenants.');
  console.error('To proceed, re-run with: node scripts/db-clear-all.mjs --confirm\n');
  process.exit(1);
}

// Read DATABASE_URL from .env or environment
let connectionString = process.env.DATABASE_URL;
if (!connectionString && fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
  if (match) connectionString = match[1];
}

if (!connectionString) {
  console.error('DATABASE_URL not found in environment or .env');
  process.exit(1);
}

const pool = new pgPkg.Pool({ connectionString });

async function clearData() {
  const client = await pool.connect();
  try {
    console.log('Clearing quote_lines...');
    await client.query('DELETE FROM quote_lines;');
    console.log('Clearing quotations...');
    await client.query('DELETE FROM quotations;');
    console.log('Clearing enquiries...');
    await client.query('DELETE FROM enquiries;');
    console.log('Clearing sites...');
    await client.query('DELETE FROM sites;');
    console.log('Clearing customers...');
    await client.query('DELETE FROM customers;');
    console.log('✅ Database reset complete. All operational data cleared.');
  } catch (err) {
    console.error('Failed to clear database:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

clearData();
