const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { mockEndpoints, accessLogs } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.text({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ==================== 管理API ====================

// 获取所有mock端点
app.get('/admin/api/endpoints', (req, res) => {
  try {
    const endpoints = mockEndpoints.findAll();
    res.json({
      success: true,
      data: endpoints.map(e => ({
        ...e,
        response_headers: JSON.parse(e.response_headers),
        response_body: e.content_type === 'application/json' ?
          JSON.parse(e.response_body) : e.response_body
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建mock端点
app.post('/admin/api/endpoints', (req, res) => {
  try {
    const { path, method, status_code, response_headers, response_body, delay, content_type } = req.body;

    if (!path || !method) {
      return res.status(400).json({ success: false, error: 'Path and method are required' });
    }

    // 检查是否已存在
    const existing = mockEndpoints.findByPathAndMethod(path, method.toUpperCase());
    if (existing) {
      return res.status(409).json({ success: false, error: 'Endpoint already exists' });
    }

    const id = uuidv4();
    const endpoint = {
      id,
      path,
      method: method.toUpperCase(),
      status_code: status_code || 200,
      response_headers: typeof response_headers === 'string' ?
        response_headers : JSON.stringify(response_headers || {}),
      response_body: typeof response_body === 'string' ?
        response_body : JSON.stringify(response_body || {}),
      delay: delay || 0,
      content_type: content_type || 'application/json'
    };

    mockEndpoints.create(endpoint);
    res.json({ success: true, data: { id, ...endpoint } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新mock端点
app.put('/admin/api/endpoints/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { path, method, status_code, response_headers, response_body, delay, content_type } = req.body;

    const existing = mockEndpoints.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Endpoint not found' });
    }

    const endpoint = {
      path: path || existing.path,
      method: (method || existing.method).toUpperCase(),
      status_code: status_code !== undefined ? status_code : existing.status_code,
      response_headers: typeof response_headers === 'string' ?
        response_headers : JSON.stringify(response_headers || JSON.parse(existing.response_headers)),
      response_body: typeof response_body === 'string' ?
        response_body : JSON.stringify(response_body || existing.response_body),
      delay: delay !== undefined ? delay : existing.delay,
      content_type: content_type || existing.content_type
    };

    mockEndpoints.update(id, endpoint);
    res.json({ success: true, data: { id, ...endpoint } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除mock端点
app.delete('/admin/api/endpoints/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = mockEndpoints.findById(id);

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Endpoint not found' });
    }

    mockEndpoints.delete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 导出配置
app.get('/admin/api/export', (req, res) => {
  try {
    const endpoints = mockEndpoints.exportAll();
    res.json({ success: true, data: endpoints });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 导入配置
app.post('/admin/api/import', (req, res) => {
  try {
    const { endpoints } = req.body;

    if (!Array.isArray(endpoints)) {
      return res.status(400).json({ success: false, error: 'Endpoints must be an array' });
    }

    mockEndpoints.importEndpoints(endpoints);
    res.json({ success: true, message: `Imported ${endpoints.length} endpoints` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取访问日志
app.get('/admin/api/logs', (req, res) => {
  try {
    const { endpoint_id, limit } = req.query;
    let logs;

    if (endpoint_id) {
      logs = accessLogs.findByEndpoint(endpoint_id, parseInt(limit) || 100);
    } else {
      logs = accessLogs.findRecent(parseInt(limit) || 100);
    }

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== Mock API处理 ====================

// 记录访问日志的中间件
const logAccess = (endpoint, req, body) => {
  try {
    accessLogs.create({
      endpoint_id: endpoint.id,
      path: req.path,
      method: req.method,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get('user-agent') || '',
      query_params: JSON.stringify(req.query),
      request_body: body ? JSON.stringify(body).substring(0, 1000) : null
    });
  } catch (error) {
    console.error('Failed to log access:', error);
  }
};

// 动态处理所有mock请求
const handleMockRequest = async (req, res) => {
  try {
    const endpoint = mockEndpoints.findByPathAndMethod(req.path, req.method);

    if (!endpoint) {
      return res.status(404).json({
        error: 'Mock endpoint not found',
        message: `No mock configured for ${req.method} ${req.path}`
      });
    }

    // 记录访问日志
    logAccess(endpoint, req, req.body);

    // 应用延迟
    if (endpoint.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, endpoint.delay));
    }

    // 解析响应头
    const headers = JSON.parse(endpoint.response_headers);
    Object.keys(headers).forEach(key => {
      res.setHeader(key, headers[key]);
    });

    // 设置Content-Type
    res.setHeader('Content-Type', endpoint.content_type);

    // 发送响应
    res.status(endpoint.status_code);

    if (endpoint.content_type === 'application/json') {
      res.json(JSON.parse(endpoint.response_body));
    } else {
      res.send(endpoint.response_body);
    }
  } catch (error) {
    console.error('Error handling mock request:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

// 捕获所有mock请求（排除/admin路径）
app.all('/mock/*', (req, res) => {
  req.path = req.path.replace('/mock', '');
  handleMockRequest(req, res);
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mock API Platform running on port ${PORT}`);
  console.log(`Admin Interface: http://localhost:${PORT}`);
  console.log(`Mock API Base: http://localhost:${PORT}/mock`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
