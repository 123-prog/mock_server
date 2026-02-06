# Mock API Platform - 项目文件结构

```
mock_server/
├── README.md                 # 完整使用文档
├── QUICKSTART.md            # 快速开始指南
├── package.json             # Node.js项目配置
├── server.js                # Express服务器主文件
├── database.js              # 数据库操作层（SQLite）
│
├── public/                  # 前端静态文件
│   ├── index.html          # 管理界面HTML
│   ├── styles.css          # 样式文件
│   └── app.js              # 前端交互逻辑
│
├── database/               # 数据库文件目录（运行时创建）
│   └── mocks.db           # SQLite数据库（自动生成）
│
├── Dockerfile              # Docker镜像配置
├── docker-compose.yml      # Docker Compose配置
├── .dockerignore          # Docker构建忽略文件
├── .gitignore             # Git忽略文件
│
├── example-config.json     # 示例配置（10个Mock接口）
├── start.sh               # 快速启动脚本
└── stop.sh                # 快速停止脚本
```

## 文件说明

### 核心文件

- **server.js** (约200行)
  - Express服务器配置
  - 管理API路由 (`/admin/api/*`)
  - Mock API动态路由 (`/mock/*`)
  - CORS配置和访问日志记录

- **database.js** (约150行)
  - SQLite数据库初始化
  - Mock端点的CRUD操作
  - 访问日志管理
  - 配置导入/导出功能

### 前端文件

- **public/index.html** (约200行)
  - 响应式Web管理界面
  - 表单验证和交互
  - 接口列表展示
  - 导入/导出模态框

- **public/styles.css** (约450行)
  - 现代化UI设计
  - 渐变色主题
  - 响应式布局
  - 动画效果

- **public/app.js** (约400行)
  - API调用逻辑
  - 表单处理
  - 动态渲染
  - 通知系统

### 配置文件

- **package.json**
  - Express 4.18.2
  - better-sqlite3 9.2.2
  - cors 2.8.5
  - uuid 9.0.1

- **docker-compose.yml**
  - 端口映射: 3000:3000
  - 数据卷挂载
  - 健康检查配置
  - 自动重启策略

### 辅助文件

- **example-config.json**
  - 10个预配置的Mock接口示例
  - 涵盖GET/POST/XML等多种场景
  - 可直接导入使用

- **start.sh / stop.sh**
  - 一键启动/停止脚本
  - 服务状态检查
  - 友好的命令行提示

## 代码统计

| 文件类型 | 文件数 | 代码行数（估算） |
|---------|--------|-----------------|
| JavaScript | 3 | ~750行 |
| HTML | 1 | ~200行 |
| CSS | 1 | ~450行 |
| JSON | 2 | ~200行 |
| Markdown | 3 | ~800行 |
| Docker | 2 | ~50行 |
| Shell | 2 | ~60行 |
| **总计** | **14** | **~2500行** |

## 功能特性

### ✅ 已实现功能

1. **Web管理界面**
   - ✅ 创建/编辑/删除Mock接口
   - ✅ 实时预览和测试
   - ✅ 响应式设计

2. **Mock API功能**
   - ✅ 动态路由生成
   - ✅ 多种HTTP方法支持
   - ✅ 自定义状态码
   - ✅ 自定义响应头
   - ✅ 多种Content-Type支持
   - ✅ 响应延迟模拟

3. **数据持久化**
   - ✅ SQLite数据库
   - ✅ 配置导入/导出
   - ✅ 访问日志记录

4. **部署支持**
   - ✅ Docker容器化
   - ✅ Docker Compose编排
   - ✅ 健康检查
   - ✅ 数据卷持久化

5. **开发体验**
   - ✅ 完整文档
   - ✅ 示例配置
   - ✅ 快捷脚本
   - ✅ 错误处理

## 技术亮点

- 🎯 **零依赖前端**: 纯HTML/CSS/JS，无需构建
- 🚀 **性能优化**: SQLite性能优异，支持高并发
- 🔒 **类型安全**: better-sqlite3同步操作，避免回调地狱
- 🎨 **现代UI**: 渐变色设计，流畅动画
- 📦 **轻量级**: Docker镜像约50MB
- 🔧 **易维护**: 代码结构清晰，注释完善

## 下一步扩展建议

### 可选功能（未实现，供参考）

1. **高级功能**
   - 条件响应（根据请求参数返回不同内容）
   - 响应模板（支持变量替换）
   - Webhook支持
   - 批量操作接口

2. **管理功能**
   - 用户认证（可选）
   - 接口分组管理
   - 接口搜索和过滤
   - 统计和分析面板

3. **开发工具**
   - Postman集合导出
   - Swagger文档生成
   - 请求录制和重放
   - Mock数据生成器

## 数据库结构

### mock_endpoints 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | UUID主键 |
| path | TEXT | URL路径 |
| method | TEXT | HTTP方法 |
| status_code | INTEGER | 状态码 |
| response_headers | TEXT | 响应头JSON |
| response_body | TEXT | 响应体 |
| delay | INTEGER | 延迟(ms) |
| content_type | TEXT | 内容类型 |
| created_at | INTEGER | 创建时间 |
| updated_at | INTEGER | 更新时间 |

### access_logs 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 自增主键 |
| endpoint_id | TEXT | 端点ID |
| path | TEXT | 请求路径 |
| method | TEXT | 请求方法 |
| timestamp | INTEGER | 访问时间 |
| ip_address | TEXT | IP地址 |
| user_agent | TEXT | User Agent |
| query_params | TEXT | 查询参数 |
| request_body | TEXT | 请求体 |
