export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const queryValidator = {
  validate(query: string): ValidationResult {
    // Trim and check if empty
    const trimmed = query.trim();
    if (!trimmed) {
      return { isValid: false, error: 'Query cannot be empty' };
    }

    // Check minimum length
    if (trimmed.length < 10) {
      return { isValid: false, error: 'Query is too short to be valid' };
    }

    // Check maximum length
    if (trimmed.length > 100000) {
      return { isValid: false, error: 'Query is too long (max 100,000 characters)' };
    }

    const upperQuery = trimmed.toUpperCase();

    // Must start with SELECT or WITH (CTE)
    if (!upperQuery.startsWith('SELECT') && !upperQuery.startsWith('WITH')) {
      return { 
        isValid: false, 
        error: 'Only SELECT queries are allowed. Query must start with SELECT or WITH' 
      };
    }

    // Check for balanced parentheses
    const openParens = (trimmed.match(/\(/g) || []).length;
    const closeParens = (trimmed.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      return { 
        isValid: false, 
        error: 'Unbalanced parentheses in query' 
      };
    }

    // Check for balanced quotes (single and double)
    const singleQuotes = (trimmed.match(/'/g) || []).length;
    const doubleQuotes = (trimmed.match(/"/g) || []).length;
    if (singleQuotes % 2 !== 0) {
      return { 
        isValid: false, 
        error: 'Unclosed single quotes in query' 
      };
    }
    if (doubleQuotes % 2 !== 0) {
      return { 
        isValid: false, 
        error: 'Unclosed double quotes in query' 
      };
    }

    // Check for basic SELECT structure (must have SELECT and FROM)
    if (upperQuery.startsWith('SELECT')) {
      if (!upperQuery.includes('FROM')) {
        return { 
          isValid: false, 
          error: 'SELECT query must include a FROM clause' 
        };
      }
    }

    // Check for blocked keywords (DDL)
    const ddlKeywords = [
      'CREATE', 'ALTER', 'DROP', 'TRUNCATE', 'RENAME',
      'GRANT', 'REVOKE', 'COMMENT'
    ];
    for (const keyword of ddlKeywords) {
      if (upperQuery.includes(` ${keyword} `) || upperQuery.startsWith(`${keyword} `)) {
        return { 
          isValid: false, 
          error: `DDL statement '${keyword}' is not allowed. Only SELECT queries are permitted` 
        };
      }
    }

    // Check for blocked DML keywords
    const dmlKeywords = ['INSERT', 'UPDATE', 'DELETE', 'MERGE', 'CALL'];
    for (const keyword of dmlKeywords) {
      if (upperQuery.includes(` ${keyword} `) || upperQuery.startsWith(`${keyword} `)) {
        return { 
          isValid: false, 
          error: `DML statement '${keyword}' is not allowed. Only SELECT queries are permitted` 
        };
      }
    }

    // Check for transaction control
    const transactionKeywords = ['BEGIN', 'COMMIT', 'ROLLBACK', 'SAVEPOINT'];
    for (const keyword of transactionKeywords) {
      if (upperQuery.includes(` ${keyword} `) || upperQuery.startsWith(`${keyword} `)) {
        return { 
          isValid: false, 
          error: `Transaction control '${keyword}' is not allowed` 
        };
      }
    }

    // Check for dangerous functions
    const dangerousFunctions = ['PG_READ_FILE', 'PG_LS_DIR', 'COPY', '\\COPY'];
    for (const func of dangerousFunctions) {
      if (upperQuery.includes(func)) {
        return { 
          isValid: false, 
          error: `Dangerous function is not allowed for security reasons` 
        };
      }
    }

    // Check for semicolons (should allow them, but warn if multiple statements)
    const semicolonCount = (trimmed.match(/;/g) || []).length;
    if (semicolonCount > 1) {
      return { 
        isValid: false, 
        error: 'Multiple statements detected. Please submit only one query at a time' 
      };
    }

    return { isValid: true };
  }
};
