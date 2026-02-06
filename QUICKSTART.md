# 快速开始指南

## 5分钟快速部署

### 方法一：使用快捷脚本（推荐）

```bash
# 启动服务
./start.sh

# 停止服务
./stop.sh
```

### 方法二：使用Docker Compose

```bash
# 启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

### 方法三：本地运行

```bash
# 安装依赖
npm install

# 启动服务
npm start
```

## 首次使用

### 1. 访问管理界面

打开浏览器访问: **http://localhost:3000**

### 2. 创建第一个Mock接口

在管理界面填写：

- **URL路径**: `/api/hello`
- **HTTP方法**: `GET`
- **状态码**: `200`
- **响应体**:
```json
{
  "message": "Hello World!",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

点击"创建接口"

### 3. 测试Mock接口

```bash
# 使用curl测试
curl http://localhost:3000/mock/api/hello

# 或在浏览器访问
http://localhost:3000/mock/api/hello
```

### 4. 导入示例配置（可选）

点击管理界面的"导入配置"按钮，粘贴 `example-config.json` 文件内容，快速创建10个示例接口。

## 常用命令

```bash
# 查看运行状态
docker-compose ps

# 查看实时日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 完全清理（包括数据）
docker-compose down -v
```

## 端口说明

- **3000**: 主服务端口
  - 管理界面: `http://localhost:3000`
  - Mock API: `http://localhost:3000/mock/*`
  - 健康检查: `http://localhost:3000/health`

## 常见问题

### 端口被占用

修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "8080:3000"  # 改为8080端口
```

### 数据库重置

```bash
rm -rf database/*.db
docker-compose restart
```

### 查看访问日志

访问: `http://localhost:3000/admin/api/logs`

## 下一步

- 📖 阅读完整文档: [README.md](README.md)
- 🔧 查看API文档了解高级功能
- 🌐 部署到公网服务器
- 🔐 配置访问控制（如需要）

## 支持

遇到问题？查看 [README.md](README.md) 的故障排查章节
