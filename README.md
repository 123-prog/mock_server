# Mock API Platform

一个简单易用的Mock API平台，支持通过Web界面快速创建和管理Mock接口，无需认证即可访问。

## 特性

- ✨ **简单易用** - 直观的Web管理界面，无需编写代码
- 🚀 **动态路由** - 实时创建和修改Mock接口，无需重启
- 🔓 **无需认证** - 创建的Mock接口可直接公网访问
- 💾 **持久化存储** - 使用SQLite数据库保存配置
- 📊 **访问日志** - 自动记录所有Mock接口的访问日志
- 🌐 **CORS支持** - 支持跨域访问，方便前端开发测试
- 📤 **导入/导出** - 支持配置的导入导出，方便团队协作
- ⏱️ **响应延迟** - 模拟网络延迟，测试超时场景
- 🎯 **多种响应类型** - 支持JSON、XML、文本等多种响应格式
- 🐳 **Docker支持** - 提供完整的Docker部署方案

## 项目结构

```
mock_server/
├── database.js           # 数据库操作层
├── server.js            # Express服务器主文件
├── package.json         # 项目依赖配置
├── Dockerfile           # Docker镜像配置
├── docker-compose.yml   # Docker Compose配置
├── database/            # SQLite数据库文件目录
└── public/              # 前端静态文件
    ├── index.html       # 管理界面HTML
    ├── styles.css       # 样式文件
    └── app.js           # 前端交互逻辑
```

## 快速开始

### 方式一：使用Docker（推荐）

1. **克隆或下载项目**

```bash
cd mock_server
```

2. **使用Docker Compose启动**

```bash
docker-compose up -d
```

3. **访问管理界面**

打开浏览器访问: `http://localhost:3000`

### 方式二：本地运行

1. **安装依赖**

```bash
npm install
```

2. **启动服务**

```bash
npm start
```

或使用开发模式（支持热重载）:

```bash
npm run dev
```

3. **访问管理界面**

打开浏览器访问: `http://localhost:3000`

## 使用指南

### 1. 创建Mock接口

在管理界面中填写以下信息：

- **URL路径**: 例如 `/api/users` 或 `/api/products/123`
- **HTTP方法**: GET、POST、PUT、DELETE、PATCH等
- **状态码**: 200、404、500等
- **Content-Type**: application/json、text/plain等
- **响应延迟**: 以毫秒为单位，0表示无延迟
- **响应头**: JSON格式，例如 `{"X-Custom-Header": "value"}`
- **响应体**: 根据Content-Type填写相应内容

点击"创建接口"按钮即可生成Mock接口。

### 2. 访问Mock接口

创建的Mock接口访问地址格式为：

```
http://your-server:3000/mock{你配置的路径}
```

**示例**：

如果你创建了路径为 `/api/users` 的GET接口，访问地址为：

```
http://localhost:3000/mock/api/users
```

### 3. 管理接口

- **编辑**: 点击接口卡片上的"编辑"按钮
- **删除**: 点击接口卡片上的"删除"按钮
- **复制URL**: 点击"复制"按钮快速复制Mock接口地址

### 4. 导入/导出配置

- **导出**: 点击"导出配置"按钮，下载JSON配置文件
- **导入**: 点击"导入配置"按钮，粘贴JSON配置并确认

## API文档

### 管理API

所有管理API的基础路径为: `/admin/api`

#### 获取所有端点

```http
GET /admin/api/endpoints
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "path": "/api/users",
      "method": "GET",
      "status_code": 200,
      "response_headers": {},
      "response_body": {"users": []},
      "delay": 0,
      "content_type": "application/json",
      "created_at": 1234567890,
      "updated_at": 1234567890
    }
  ]
}
```

#### 创建端点

```http
POST /admin/api/endpoints
Content-Type: application/json

{
  "path": "/api/users",
  "method": "GET",
  "status_code": 200,
  "response_headers": "{\"X-Custom\": \"value\"}",
  "response_body": "{\"users\": []}",
  "delay": 0,
  "content_type": "application/json"
}
```

#### 更新端点

```http
PUT /admin/api/endpoints/:id
Content-Type: application/json

{
  "path": "/api/users",
  "method": "GET",
  "status_code": 200,
  "response_headers": "{}",
  "response_body": "{\"users\": []}",
  "delay": 100,
  "content_type": "application/json"
}
```

#### 删除端点

```http
DELETE /admin/api/endpoints/:id
```

#### 导出配置

```http
GET /admin/api/export
```

#### 导入配置

```http
POST /admin/api/import
Content-Type: application/json

{
  "endpoints": [...]
}
```

#### 获取访问日志

```http
GET /admin/api/logs?endpoint_id=xxx&limit=100
```

### Mock API

所有Mock API的基础路径为: `/mock`

访问你创建的Mock接口：

```http
{METHOD} /mock{你配置的路径}
```

## 使用示例

### 示例1: 创建用户列表接口

**配置**:
- 路径: `/api/users`
- 方法: `GET`
- 状态码: `200`
- 响应体:
```json
{
  "users": [
    {"id": 1, "name": "张三", "email": "zhangsan@example.com"},
    {"id": 2, "name": "李四", "email": "lisi@example.com"}
  ]
}
```

**访问**: `http://localhost:3000/mock/api/users`

### 示例2: 模拟创建用户接口

**配置**:
- 路径: `/api/users`
- 方法: `POST`
- 状态码: `201`
- 响应体:
```json
{
  "success": true,
  "message": "用户创建成功",
  "data": {
    "id": 3,
    "name": "新用户",
    "email": "newuser@example.com"
  }
}
```

**访问**:
```bash
curl -X POST http://localhost:3000/mock/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "新用户", "email": "newuser@example.com"}'
```

### 示例3: 模拟错误响应

**配置**:
- 路径: `/api/error`
- 方法: `GET`
- 状态码: `500`
- 响应体:
```json
{
  "error": "服务器内部错误",
  "code": "INTERNAL_ERROR"
}
```

**访问**: `http://localhost:3000/mock/api/error`

### 示例4: 模拟网络延迟

**配置**:
- 路径: `/api/slow`
- 方法: `GET`
- 状态码: `200`
- 响应延迟: `3000` (3秒)
- 响应体:
```json
{
  "message": "这是一个慢速响应"
}
```

**访问**: `http://localhost:3000/mock/api/slow` (将延迟3秒后返回)

## Docker部署

### 构建镜像

```bash
docker build -t mock-api-platform .
```

### 运行容器

```bash
docker run -d \
  --name mock-api \
  -p 3000:3000 \
  -v $(pwd)/database:/app/database \
  mock-api-platform
```

### 使用Docker Compose

```bash
# 启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down

# 重启
docker-compose restart
```

### 数据持久化

数据库文件存储在 `./database` 目录中，通过Docker volume映射确保数据持久化。即使容器删除，数据也不会丢失。

## 公网部署

### 1. 使用云服务器部署

在云服务器（阿里云、腾讯云等）上部署：

```bash
# 1. 安装Docker
curl -fsSL https://get.docker.com | sh

# 2. 上传项目文件
scp -r mock_server root@your-server-ip:/root/

# 3. SSH到服务器
ssh root@your-server-ip

# 4. 启动服务
cd /root/mock_server
docker-compose up -d

# 5. 配置防火墙开放3000端口
# 阿里云/腾讯云需要在安全组中开放3000端口
```

### 2. 配置域名（可选）

使用Nginx反向代理：

```nginx
server {
    listen 80;
    server_name mock.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 3. HTTPS配置（推荐）

使用Let's Encrypt免费证书：

```bash
# 安装certbot
apt-get install certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d mock.yourdomain.com
```

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | 服务端口 | 3000 |
| NODE_ENV | 运行环境 | development |

## 安全建议

虽然本平台设计为无需认证的公网Mock服务，但在实际使用时请注意：

1. **不要存储敏感数据** - Mock接口中不要包含真实的密码、密钥等敏感信息
2. **访问控制** - 如需限制访问，建议在Nginx层面添加IP白名单
3. **定期清理** - 定期清理不再使用的Mock接口和访问日志
4. **监控流量** - 监控异常流量，防止被滥用
5. **备份数据** - 定期备份 `database` 目录

如需添加认证功能，可以考虑：
- 使用Nginx Basic Auth
- 在代码层面添加Token验证
- 使用API Gateway进行访问控制

## 故障排查

### 服务无法启动

1. 检查端口是否被占用：
```bash
lsof -i :3000
```

2. 查看日志：
```bash
docker-compose logs -f
```

### 数据库错误

1. 检查database目录权限：
```bash
chmod -R 755 database
```

2. 删除数据库重新初始化：
```bash
rm -rf database/*.db
docker-compose restart
```

### Mock接口404

1. 确认访问路径包含 `/mock` 前缀
2. 检查接口是否已在管理界面创建
3. 检查HTTP方法是否匹配

## 开发

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（支持热重载）
npm run dev
```

### 项目技术栈

- **后端**: Node.js + Express
- **数据库**: SQLite + better-sqlite3
- **前端**: 原生HTML/CSS/JavaScript
- **容器化**: Docker + Docker Compose

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

## 联系方式

如有问题或建议，欢迎通过Issue反馈。

---

**享受Mock API带来的便利！** 🚀
