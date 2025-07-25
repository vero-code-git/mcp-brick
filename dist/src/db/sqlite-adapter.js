import sqlite3 from "sqlite3";
/**
 * SQLite database adapter implementation
 */
export class SqliteAdapter {
    constructor(dbPath) {
        this.db = null;
        this.dbPath = dbPath;
    }
    /**
     * Initialize the SQLite database connection
     */
    async init() {
        return new Promise((resolve, reject) => {
            // Ensure the dbPath is accessible
            console.error(`[INFO] Opening SQLite database at: ${this.dbPath}`);
            this.db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
                if (err) {
                    console.error(`[ERROR] SQLite connection error: ${err.message}`);
                    reject(err);
                }
                else {
                    console.error("[INFO] SQLite database opened successfully");
                    resolve();
                }
            });
        });
    }
    /**
     * Execute a SQL query and get all results
     * @param query SQL query to execute
     * @param params Query parameters
     * @returns Promise with query results
     */
    async all(query, params = []) {
        if (!this.db) {
            throw new Error("Database not initialized");
        }
        return new Promise((resolve, reject) => {
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }
    /**
     * Execute a SQL query that modifies data
     * @param query SQL query to execute
     * @param params Query parameters
     * @returns Promise with result info
     */
    async run(query, params = []) {
        if (!this.db) {
            throw new Error("Database not initialized");
        }
        return new Promise((resolve, reject) => {
            this.db.run(query, params, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({ changes: this.changes, lastID: this.lastID });
                }
            });
        });
    }
    /**
     * Execute multiple SQL statements
     * @param query SQL statements to execute
     * @returns Promise that resolves when execution completes
     */
    async exec(query) {
        if (!this.db) {
            throw new Error("Database not initialized");
        }
        return new Promise((resolve, reject) => {
            this.db.exec(query, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    /**
     * Close the database connection
     */
    async close() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve();
                return;
            }
            this.db.close((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    this.db = null;
                    resolve();
                }
            });
        });
    }
    /**
     * Get database metadata
     */
    getMetadata() {
        return {
            name: "SQLite",
            type: "sqlite",
            path: this.dbPath
        };
    }
    /**
     * Get database-specific query for listing tables
     */
    getListTablesQuery() {
        return "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'";
    }
    /**
     * Get database-specific query for describing a table
     * @param tableName Table name
     */
    getDescribeTableQuery(tableName) {
        return `PRAGMA table_info(${tableName})`;
    }
}
