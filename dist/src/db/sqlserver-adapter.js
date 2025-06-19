import sql from 'mssql';
/**
 * SQL Server database adapter implementation
 */
export class SqlServerAdapter {
    constructor(connectionInfo) {
        this.pool = null;
        this.server = connectionInfo.server;
        this.database = connectionInfo.database;
        // Create SQL Server connection config
        this.config = {
            server: connectionInfo.server,
            database: connectionInfo.database,
            port: connectionInfo.port || 1433,
            options: {
                trustServerCertificate: connectionInfo.trustServerCertificate ?? true,
                ...connectionInfo.options
            }
        };
        // Add authentication options
        if (connectionInfo.user && connectionInfo.password) {
            this.config.user = connectionInfo.user;
            this.config.password = connectionInfo.password;
        }
        else {
            // Use Windows authentication if no username/password provided
            this.config.options.trustedConnection = true;
            this.config.options.enableArithAbort = true;
        }
    }
    /**
     * Initialize SQL Server connection
     */
    async init() {
        try {
            console.error(`[INFO] Connecting to SQL Server: ${this.server}, Database: ${this.database}`);
            this.pool = await new sql.ConnectionPool(this.config).connect();
            console.error(`[INFO] SQL Server connection established successfully`);
        }
        catch (err) {
            console.error(`[ERROR] SQL Server connection error: ${err.message}`);
            throw new Error(`Failed to connect to SQL Server: ${err.message}`);
        }
    }
    /**
     * Execute a SQL query and get all results
     * @param query SQL query to execute
     * @param params Query parameters
     * @returns Promise with query results
     */
    async all(query, params = []) {
        if (!this.pool) {
            throw new Error("Database not initialized");
        }
        try {
            const request = this.pool.request();
            // Add parameters to the request
            params.forEach((param, index) => {
                request.input(`param${index}`, param);
            });
            // Replace ? with named parameters
            const preparedQuery = query.replace(/\?/g, (_, i) => `@param${i}`);
            const result = await request.query(preparedQuery);
            return result.recordset;
        }
        catch (err) {
            throw new Error(`SQL Server query error: ${err.message}`);
        }
    }
    /**
     * Execute a SQL query that modifies data
     * @param query SQL query to execute
     * @param params Query parameters
     * @returns Promise with result info
     */
    async run(query, params = []) {
        if (!this.pool) {
            throw new Error("Database not initialized");
        }
        try {
            const request = this.pool.request();
            // Add parameters to the request
            params.forEach((param, index) => {
                request.input(`param${index}`, param);
            });
            // Replace ? with named parameters
            const preparedQuery = query.replace(/\?/g, (_, i) => `@param${i}`);
            // Add output parameter for identity value if it's an INSERT
            let lastID = 0;
            if (query.trim().toUpperCase().startsWith('INSERT')) {
                request.output('insertedId', sql.Int, 0);
                const updatedQuery = `${preparedQuery}; SELECT @insertedId = SCOPE_IDENTITY();`;
                const result = await request.query(updatedQuery);
                lastID = result.output.insertedId || 0;
            }
            else {
                const result = await request.query(preparedQuery);
                lastID = 0;
            }
            return {
                changes: this.getAffectedRows(query, lastID),
                lastID: lastID
            };
        }
        catch (err) {
            throw new Error(`SQL Server query error: ${err.message}`);
        }
    }
    /**
     * Execute multiple SQL statements
     * @param query SQL statements to execute
     * @returns Promise that resolves when execution completes
     */
    async exec(query) {
        if (!this.pool) {
            throw new Error("Database not initialized");
        }
        try {
            const request = this.pool.request();
            await request.batch(query);
        }
        catch (err) {
            throw new Error(`SQL Server batch error: ${err.message}`);
        }
    }
    /**
     * Close the database connection
     */
    async close() {
        if (this.pool) {
            await this.pool.close();
            this.pool = null;
        }
    }
    /**
     * Get database metadata
     */
    getMetadata() {
        return {
            name: "SQL Server",
            type: "sqlserver",
            server: this.server,
            database: this.database
        };
    }
    /**
     * Get database-specific query for listing tables
     */
    getListTablesQuery() {
        return "SELECT T.TABLE_SCHEMA, T.TABLE_NAME AS name, O.modify_date FROM INFORMATION_SCHEMA.TABLES T JOIN sys.objects O ON O.name = T.TABLE_NAME AND O.type = 'U' AND SCHEMA_NAME(O.schema_id) = T.TABLE_SCHEMA WHERE T.TABLE_TYPE = 'BASE TABLE' AND O.modify_date >= '2025-01-01' ORDER BY T.TABLE_NAME;";
        // "SELECT TABLE_NAME as name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME";
    }
    /**
     * Get database-specific query for describing a table
     * @param tableName Table name
     */
    getDescribeTableQuery(tableName) {
        return `
      SELECT 
        c.COLUMN_NAME as name,
        c.DATA_TYPE as type,
        CASE WHEN c.IS_NULLABLE = 'YES' THEN 1 ELSE 0 END as notnull,
        CASE WHEN pk.CONSTRAINT_TYPE = 'PRIMARY KEY' THEN 1 ELSE 0 END as pk,
        c.COLUMN_DEFAULT as dflt_value
      FROM 
        INFORMATION_SCHEMA.COLUMNS c
      LEFT JOIN 
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu ON c.TABLE_NAME = kcu.TABLE_NAME AND c.COLUMN_NAME = kcu.COLUMN_NAME
      LEFT JOIN 
        INFORMATION_SCHEMA.TABLE_CONSTRAINTS pk ON kcu.CONSTRAINT_NAME = pk.CONSTRAINT_NAME AND pk.CONSTRAINT_TYPE = 'PRIMARY KEY'
      WHERE 
        c.TABLE_NAME = '${tableName}'
      ORDER BY 
        c.ORDINAL_POSITION
    `;
    }
    /**
     * Helper to get the number of affected rows based on query type
     */
    getAffectedRows(query, lastID) {
        const queryType = query.trim().split(' ')[0].toUpperCase();
        if (queryType === 'INSERT' && lastID > 0) {
            return 1;
        }
        return 0; // For SELECT, unknown for UPDATE/DELETE without additional query
    }
}
