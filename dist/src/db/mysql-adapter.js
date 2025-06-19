import mysql from "mysql2/promise";
/**
 * MySQL database adapter implementation
 */
export class MysqlAdapter {
    constructor(connectionInfo) {
        this.connection = null;
        this.host = connectionInfo.host;
        this.database = connectionInfo.database;
        this.config = {
            host: connectionInfo.host,
            database: connectionInfo.database,
            port: connectionInfo.port || 3306,
            user: connectionInfo.user,
            password: connectionInfo.password,
            connectTimeout: connectionInfo.connectionTimeout || 30000,
            multipleStatements: true,
        };
        if (typeof connectionInfo.ssl === 'object' || typeof connectionInfo.ssl === 'string') {
            this.config.ssl = connectionInfo.ssl;
        }
        else if (connectionInfo.ssl === true) {
            this.config.ssl = {};
        }
        // Validate port
        if (connectionInfo.port && typeof connectionInfo.port !== 'number') {
            const parsedPort = parseInt(connectionInfo.port, 10);
            if (isNaN(parsedPort)) {
                throw new Error(`Invalid port value for MySQL: ${connectionInfo.port}`);
            }
            this.config.port = parsedPort;
        }
        // Log the port for debugging
        console.error(`[DEBUG] MySQL connection will use port: ${this.config.port}`);
    }
    /**
     * Initialize MySQL connection
     */
    async init() {
        try {
            console.error(`[INFO] Connecting to MySQL: ${this.host}, Database: ${this.database}`);
            this.connection = await mysql.createConnection(this.config);
            console.error(`[INFO] MySQL connection established successfully`);
        }
        catch (err) {
            console.error(`[ERROR] MySQL connection error: ${err.message}`);
            throw new Error(`Failed to connect to MySQL: ${err.message}`);
        }
    }
    /**
     * Execute a SQL query and get all results
     */
    async all(query, params = []) {
        if (!this.connection) {
            throw new Error("Database not initialized");
        }
        try {
            const [rows] = await this.connection.execute(query, params);
            return Array.isArray(rows) ? rows : [];
        }
        catch (err) {
            throw new Error(`MySQL query error: ${err.message}`);
        }
    }
    /**
     * Execute a SQL query that modifies data
     */
    async run(query, params = []) {
        if (!this.connection) {
            throw new Error("Database not initialized");
        }
        try {
            const [result] = await this.connection.execute(query, params);
            const changes = result.affectedRows || 0;
            const lastID = result.insertId || 0;
            return { changes, lastID };
        }
        catch (err) {
            throw new Error(`MySQL query error: ${err.message}`);
        }
    }
    /**
     * Execute multiple SQL statements
     */
    async exec(query) {
        if (!this.connection) {
            throw new Error("Database not initialized");
        }
        try {
            await this.connection.query(query);
        }
        catch (err) {
            throw new Error(`MySQL batch error: ${err.message}`);
        }
    }
    /**
     * Close the database connection
     */
    async close() {
        if (this.connection) {
            await this.connection.end();
            this.connection = null;
        }
    }
    /**
     * Get database metadata
     */
    getMetadata() {
        return {
            name: "MySQL",
            type: "mysql",
            server: this.host,
            database: this.database,
        };
    }
    /**
     * Get database-specific query for listing tables
     */
    getListTablesQuery() {
        return "SHOW TABLES";
    }
    /**
     * Get database-specific query for describing a table
     */
    getDescribeTableQuery(tableName) {
        return `DESCRIBE \`${tableName}\``;
    }
}
