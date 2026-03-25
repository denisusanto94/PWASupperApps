
import PouchDB from 'pouchdb';
import path from 'path';

const DB_NAME = 'chat_users';
const dbPath = path.resolve('database');
const db = new PouchDB(path.join(dbPath, DB_NAME));

async function check() {
  try {
    const res = await db.allDocs({ include_docs: true });
    console.log(`Total docs in ${DB_NAME}: ${res.total_rows}`);
    res.rows.forEach(r => {
      console.log(`- ID: ${r.id}, Rev: ${r.doc._rev}`);
    });
  } catch (e) {
    console.error(e);
  }
}

check();
