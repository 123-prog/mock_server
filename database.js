const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.join(dbDir, 'mocks.db'));

// 初始化数据库表
db.exec(`
  CREATE TABLE IF NOT EXISTS mock_endpoints (
    id TEXT PRIMARY KEY,
    path TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER DEFAULT 200,
    response_headers TEXT DEFAULT '{}',
    response_body TEXT DEFAULT '{}',
    delay INTEGER DEFAULT 0,
    content_type TEXT DEFAULT 'application/json',
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now')),
    UNIQUE(path, method)
  );

  CREATE TABLE IF NOT EXISTS access_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint_id TEXT,
    path TEXT,
    method TEXT,
    timestamp INTEGER DEFAULT (strftime('%s', 'now')),
    ip_address TEXT,
    user_agent TEXT,
    query_params TEXT,
    request_body TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_access_logs_endpoint ON access_logs(endpoint_id);
  CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON access_logs(timestamp);
`);

// Mock端点操作
const mockEndpoints = {
  create: (data) => {
    const stmt = db.prepare(`
      INSERT INTO mock_endpoints (id, path, method, status_code, response_headers, response_body, delay, content_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      data.id,
      data.path,
      data.method,
      data.status_code,
      data.response_headers,
      data.response_body,
      data.delay,
      data.content_type
    );
  },

  update: (id, data) => {
    const stmt = db.prepare(`
      UPDATE mock_endpoints
      SET path = ?, method = ?, status_code = ?, response_headers = ?,
          response_body = ?, delay = ?, content_type = ?, updated_at = strftime('%s', 'now')
      WHERE id = ?
    `);
    return stmt.run(
      data.path,
      data.method,
      data.status_code,
      data.response_headers,
      data.response_body,
      data.delay,
      data.content_type,
      id
    );
  },

  delete: (id) => {
    const stmt = db.prepare('DELETE FROM mock_endpoints WHERE id = ?');
    return stmt.run(id);
  },

  findById: (id) => {
    const stmt = db.prepare('SELECT * FROM mock_endpoints WHERE id = ?');
    return stmt.get(id);
  },

  findByPathAndMethod: (path, method) => {
    const stmt = db.prepare('SELECT * FROM mock_endpoints WHERE path = ? AND method = ?');
    return stmt.get(path, method);
  },

  findAll: () => {
    const stmt = db.prepare('SELECT * FROM mock_endpoints ORDER BY created_at DESC');
    return stmt.all();
  },

  exportAll: () => {
    const endpoints = mockEndpoints.findAll();
    return endpoints.map(endpoint => ({
      ...endpoint,
      response_headers: JSON.parse(endpoint.response_headers),
      response_body: endpoint.content_type === 'application/json' ?
        JSON.parse(endpoint.response_body) : endpoint.response_body
    }));
  },

  importEndpoints: (endpoints) => {
    const deleteStmt = db.prepare('DELETE FROM mock_endpoints');
    deleteStmt.run();

    endpoints.forEach(endpoint => {
      mockEndpoints.create({
        id: endpoint.id,
        path: endpoint.path,
        method: endpoint.method,
        status_code: endpoint.status_code,
        response_headers: typeof endpoint.response_headers === 'string' ?
          endpoint.response_headers : JSON.stringify(endpoint.response_headers),
        response_body: typeof endpoint.response_body === 'string' ?
          endpoint.response_body : JSON.stringify(endpoint.response_body),
        delay: endpoint.delay || 0,
        content_type: endpoint.content_type || 'application/json'
      });
    });
  }
};

// 访问日志操作
const accessLogs = {
  create: (data) => {
    const stmt = db.prepare(`
      INSERT INTO access_logs (endpoint_id, path, method, ip_address, user_agent, query_params, request_body)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      data.endpoint_id,
      data.path,
      data.method,
      data.ip_address,
      data.user_agent,
      data.query_params,
      data.request_body
    );
  },

  findByEndpoint: (endpointId, limit = 100) => {
    const stmt = db.prepare(`
      SELECT * FROM access_logs
      WHERE endpoint_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    return stmt.all(endpointId, limit);
  },

  findRecent: (limit = 100) => {
    const stmt = db.prepare(`
      SELECT * FROM access_logs
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    return stmt.all(limit);
  },

  deleteOld: (daysToKeep = 30) => {
    const cutoffTimestamp = Math.floor(Date.now() / 1000) - (daysToKeep * 24 * 60 * 60);
    const stmt = db.prepare('DELETE FROM access_logs WHERE timestamp < ?');
    return stmt.run(cutoffTimestamp);
  }
};

module.exports = {
  db,
  mockEndpoints,
  accessLogs
};
