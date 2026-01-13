export class QueryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QueryValidationError';
  }
}

export const queryValidator = {
  validate(query: string): void {
    const trimmed = query.trim();

    if (!trimmed) {
      throw new QueryValidationError('Query cannot be empty');
    }

    // Check minimum length
    if (trimmed.length < 10) {
      throw new QueryValidationError('Query is too short to be valid');
    }

    // Check maximum length
    if (trimmed.length > 100000) {
      throw new QueryValidationError('Query is too long (max 100,000 characters)');
    }

    // Check for balanced parentheses
    const openParens = (trimmed.match(/\(/g) || []).length;
    const closeParens = (trimmed.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      throw new QueryValidationError('Unbalanced parentheses in query');
    }

    // Check for balanced quotes
    const singleQuotes = (trimmed.match(/'/g) || []).length;
    const doubleQuotes = (trimmed.match(/"/g) || []).length;
    if (singleQuotes % 2 !== 0) {
      throw new QueryValidationError('Unclosed single quotes in query');
    }
    if (doubleQuotes % 2 !== 0) {
      throw new QueryValidationError('Unclosed double quotes in query');
    }

    const upperQuery = trimmed.toUpperCase();

    // Must be a SELECT query
    if (!upperQuery.startsWith('SELECT') && !upperQuery.startsWith('WITH')) {
      throw new QueryValidationError('Only SELECT queries are allowed. Query must start with SELECT or WITH');
    }

    // Check for basic SELECT structure
    if (upperQuery.startsWith('SELECT') && !upperQuery.includes('FROM')) {
      throw new QueryValidationError('SELECT query must include a FROM clause');
    }

    // Block DDL statements
    const ddlKeywords = [
      'CREATE', 'ALTER', 'DROP', 'TRUNCATE', 'RENAME',
      'GRANT', 'REVOKE', 'COMMENT'
    ];

    // Block DML statements (except SELECT)
    const dmlKeywords = [
      'INSERT', 'UPDATE', 'DELETE', 'MERGE', 'CALL'
    ];

    // Block transaction control
    const transactionKeywords = [
      'BEGIN', 'COMMIT', 'ROLLBACK', 'SAVEPOINT'
    ];

    // Block dangerous functions
    const dangerousFunctions = [
      'PG_READ_FILE', 'PG_LS_DIR', 'COPY', '\\COPY'
    ];

    // Check for DDL
    for (const keyword of ddlKeywords) {
      if (upperQuery.startsWith(`${keyword} `) || upperQuery.includes(` ${keyword} `)) {
        throw new QueryValidationError(`DDL statement '${keyword}' is not allowed. Only SELECT queries are permitted`);
      }
    }

    // Check for DML (except SELECT)
    for (const keyword of dmlKeywords) {
      if (upperQuery.startsWith(`${keyword} `) || upperQuery.includes(` ${keyword} `)) {
        throw new QueryValidationError(`DML statement '${keyword}' is not allowed. Only SELECT queries are permitted`);
      }
    }

    // Check for transaction control
    for (const keyword of transactionKeywords) {
      if (upperQuery.startsWith(`${keyword} `) || upperQuery.includes(` ${keyword} `)) {
        throw new QueryValidationError(`Transaction control '${keyword}' is not allowed`);
      }
    }

    // Check for dangerous functions
    for (const func of dangerousFunctions) {
      if (upperQuery.includes(func)) {
        throw new QueryValidationError(`Dangerous function is not allowed for security reasons`);
      }
    }

    // Check for multiple statements (semicolons)
    const semicolonCount = (trimmed.match(/;/g) || []).length;
    if (semicolonCount > 1) {
      throw new QueryValidationError('Multiple statements detected. Please submit only one query at a time');
    }
  }
};
