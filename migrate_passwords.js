import PouchDB from 'pouchdb';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import 'dotenv/config';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, process.env.DATABASE_DIR || './database');
const PouchDBStore = PouchDB.defaults({ prefix: dbPath + path.sep });

const AUTH_KEY_TAG = 'secret_vault_auth_v7.3';
const SALT = 'auth-salt-v7.3';

async function deriveAuthKey(user) {
  const enc = new TextEncoder();
  const keyMat = await crypto.subtle.importKey('raw', enc.encode(AUTH_KEY_TAG + user), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode(SALT), iterations: 50000, hash: 'SHA-256' }, 
    keyMat, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
  );
}

function uint8ArrayToBase64(bytes) {
  return Buffer.from(bytes).toString('base64');
}

async function encryptAuth(text, user) {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAuthKey(user);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(text));
  return JSON.stringify({ d: uint8ArrayToBase64(new Uint8Array(encrypted)), i: uint8ArrayToBase64(iv) });
}

async function migrate() {
  console.log('--- Memulai Migrasi Password Users ---');
  const dbName = 'chat_users';
  const db = new PouchDBStore(dbName);
  
  try {
    const all = await db.allDocs({ include_docs: true });
    let count = 0;
    
    for (const row of all.rows) {
      if (row.doc && !row.id.startsWith('_design/')) {
        const doc = row.doc;
        if (doc.password && !doc.password.startsWith('{')) {
          console.log(`- Mengenkripsi password user: ${doc._id}`);
          const encrypted = await encryptAuth(doc.password, doc._id);
          doc.password = encrypted;
          await db.put(doc);
          count++;
        }
      }
    }
    
    console.log(`--- Migrasi Selesai! ${count} akun telah dienkripsi. ---`);
    await db.close();
  } catch (err) {
    console.error('Migration failed:', err.message);
  }
}

migrate();
