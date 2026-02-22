const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

let dbPromise = null;

async function getDb() {
    if (!dbPromise) {
        dbPromise = open({
            filename: dbPath,
            driver: sqlite3.Database
        }).then(db => {
            console.log('Connected to the SQLite database.');
            // Enable foreign keys
            db.run('PRAGMA foreign_keys = ON');
            return db;
        }).catch(err => {
            console.error('Error opening database:', err.message);
            throw err;
        });
    }
    return dbPromise;
}

// Polyfill for mysql2/promise syntax used in routes
const pool = {
    getConnection: async () => {
        const db = await getDb();
        return {
            query: async (sql, params) => pool.query(sql, params),
            execute: async (sql, params) => pool.execute(sql, params),
            release: () => { } // No-op for SQLite
        };
    },
    query: async (sql, params) => {
        const db = await getDb();
        // Translate MySQL syntax placeholders (?) to SQLite (?) - they are the same!

        const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
        const isShow = sql.trim().toUpperCase().startsWith('SHOW');

        if (isShow) {
            // Mock SHOW DATABASES / SHOW TABLES if someone calls it
            return [[], []];
        }

        if (isSelect) {
            const rows = await db.all(sql, params);
            return [rows, []]; // [rows, fields]
        } else {
            const result = await db.run(sql, params);
            return [{ insertId: result.lastID, affectedRows: result.changes }, []]; // [{ insertId, affectedRows }, fields]
        }
    },
    execute: async function (sql, params) {
        return this.query(sql, params);
    },
    end: async () => {
        if (dbPromise) {
            const db = await dbPromise;
            await db.close();
        }
    }
};

module.exports = pool;