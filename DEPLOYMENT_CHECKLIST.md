# 🎉 Mock API Platform - 部署检查清单

## ✅ 项目文件完整性检查

### 核心文件 (必需)
- [x] package.json - Node.js依赖配置
- [x] server.js - Express服务器主文件
- [x] database.js - 数据库操作层

### 前端文件 (必需)
- [x] public/index.html - 管理界面
- [x] public/styles.css - 样式文件
- [x] public/app.js - 前端逻辑

### Docker文件 (部署必需)
- [x] Dockerfile - Docker镜像配置
- [x] docker-compose.yml - 容器编排配置
- [x] .dockerignore - Docker构建忽略

### 文档文件
- [x] README.md - 完整使用文档
- [x] QUICKSTART.md - 快速开始指南
- [x] PROJECT_STRUCTURE.md - 项目结构说明
- [x] DEPLOYMENT_CHECKLIST.md - 本文件

### 辅助文件
- [x] example-config.json - 示例配置
- [x] start.sh - 快速启动脚本
- [x] stop.sh - 快速停止脚本
- [x] .gitignore - Git忽略文件

## 🚀 部署步骤

### 1️⃣ 本地测试部署

```bash
# 方法A: 使用快捷脚本（推荐）
./start.sh

# 方法B: 使用Docker Compose
docker-compose up -d

# 方法C: 本地开发模式
npm install
npm start
```

### 2️⃣ 验证服务

```bash
# 检查健康状态
curl http://localhost:3000/health

# 预期响应
{"status":"ok","timestamp":1234567890}
```

### 3️⃣ 测试管理界面

1. 打开浏览器访问: http://localhost:3000
2. 创建一个测试接口:
   - 路径: `/test`
   - 方法: `GET`
   - 响应体: `{"message": "It works!"}`
3. 测试Mock接口: `curl http://localhost:3000/mock/test`

### 4️⃣ 导入示例数据（可选）

在管理界面点击"导入配置"，粘贴 `example-config.json` 内容

## 🌐 公网部署步骤

### 选项A: 云服务器部署（阿里云/腾讯云/AWS）

#### Step 1: 准备服务器

```bash
# 购买云服务器（建议配置）
- CPU: 1核或以上
- 内存: 1GB或以上
- 系统: Ubuntu 20.04 / CentOS 7+
- 带宽: 1Mbps或以上
```

#### Step 2: 安装Docker

```bash
# SSH登录服务器
ssh root@your-server-ip

# 安装Docker
curl -fsSL https://get.docker.com | sh

# 启动Docker服务
systemctl start docker
systemctl enable docker

# 安装Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

#### Step 3: 上传项目文件

```bash
# 在本地执行
scp -r mock_server root@your-server-ip:/root/

# 或使用git
ssh root@your-server-ip
cd /root
git clone your-repository-url mock_server
```

#### Step 4: 启动服务

```bash
cd /root/mock_server
./start.sh
```

#### Step 5: 配置防火墙

**阿里云/腾讯云:**
- 登录控制台
- 进入安全组设置
- 添加入站规则: TCP 3000

**Linux防火墙:**
```bash
# Ubuntu (UFW)
ufw allow 3000/tcp
ufw reload

# CentOS (firewalld)
firewall-cmd --permanent --add-port=3000/tcp
firewall-cmd --reload
```

#### Step 6: 验证部署

```bash
# 从外网访问
curl http://your-server-ip:3000/health
```

### 选项B: 使用Nginx反向代理（推荐）

#### Step 1: 安装Nginx

```bash
# Ubuntu/Debian
apt-get update
apt-get install nginx

# CentOS
yum install nginx
```

#### Step 2: 配置Nginx

```bash
# 创建配置文件
nano /etc/nginx/sites-available/mock-api
```

粘贴以下配置:

```nginx
server {
    listen 80;
    server_name mock.yourdomain.com;  # 改为你的域名

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Step 3: 启用配置

```bash
# 创建软链接
ln -s /etc/nginx/sites-available/mock-api /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重启Nginx
systemctl restart nginx
```

#### Step 4: 配置HTTPS（推荐）

```bash
# 安装Certbot
apt-get install certbot python3-certbot-nginx

# 获取SSL证书
certbot --nginx -d mock.yourdomain.com

# 自动续期
certbot renew --dry-run
```

### 选项C: Docker Hub部署（高级）

#### Step 1: 构建并推送镜像

```bash
# 登录Docker Hub
docker login

# 构建镜像
docker build -t yourusername/mock-api-platform:latest .

# 推送镜像
docker push yourusername/mock-api-platform:latest
```

#### Step 2: 在服务器上拉取

```bash
# 在服务器执行
docker pull yourusername/mock-api-platform:latest
docker run -d -p 3000:3000 -v /data/mock-api:/app/database yourusername/mock-api-platform:latest
```

## 🔒 安全配置（重要！）

### 1. 添加访问控制（Nginx层）

```nginx
# 在Nginx配置中添加IP白名单
location /admin {
    allow 192.168.1.0/24;  # 允许的IP段
    deny all;
    proxy_pass http://localhost:3000;
}
```

### 2. 限制请求速率

```nginx
# 在http块中添加
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

# 在location块中应用
location /mock {
    limit_req zone=api_limit burst=20;
    proxy_pass http://localhost:3000;
}
```

### 3. 设置环境变量

```bash
# 修改docker-compose.yml
environment:
  - NODE_ENV=production
  - MAX_REQUEST_SIZE=5mb
  - LOG_LEVEL=info
```

## 📊 监控和维护

### 日志查看

```bash
# Docker日志
docker-compose logs -f

# 查看最近100行
docker-compose logs --tail=100

# 查看特定时间
docker-compose logs --since 30m
```

### 数据备份

```bash
# 备份数据库
tar -czf backup-$(date +%Y%m%d).tar.gz database/

# 定时备份（添加到crontab）
0 2 * * * cd /root/mock_server && tar -czf backup-$(date +\%Y\%m\%d).tar.gz database/
```

### 清理访问日志

```bash
# 进入容器
docker-compose exec mock-api node -e "
const { accessLogs } = require('./database');
accessLogs.deleteOld(30); // 删除30天前的日志
console.log('日志清理完成');
"
```

### 资源监控

```bash
# 查看容器资源使用
docker stats mock-api-platform

# 查看磁盘使用
du -sh database/
```

## ✅ 部署验证清单

完成以下检查确保部署成功:

- [ ] 服务正常启动 (`docker-compose ps` 显示UP状态)
- [ ] 健康检查通过 (`curl /health` 返回200)
- [ ] 管理界面可访问 (浏览器打开正常)
- [ ] 可以创建Mock接口
- [ ] Mock接口可以正常访问
- [ ] 数据库文件正常创建 (`ls database/mocks.db`)
- [ ] 重启后数据不丢失
- [ ] 防火墙已配置
- [ ] (可选) HTTPS已配置
- [ ] (可选) 监控已设置

## 🆘 常见问题

### 问题1: 端口3000被占用

**解决方案:**

```bash
# 方法A: 修改端口
# 编辑docker-compose.yml，改为 "8080:3000"

# 方法B: 停止占用端口的进程
lsof -ti:3000 | xargs kill -9
```

### 问题2: 权限错误

**解决方案:**

```bash
chmod -R 755 /root/mock_server
chown -R root:root /root/mock_server
```

### 问题3: Docker镜像构建失败

**解决方案:**

```bash
# 清理Docker缓存
docker system prune -a

# 重新构建
docker-compose build --no-cache
```

### 问题4: 数据库锁定

**解决方案:**

```bash
# 重启服务
docker-compose restart

# 如果无效，删除锁文件
rm database/*.db-wal database/*.db-shm
```

## 📞 技术支持

- 📖 查看完整文档: [README.md](README.md)
- 🚀 快速开始: [QUICKSTART.md](QUICKSTART.md)
- 📁 项目结构: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

## 🎯 下一步

1. ✅ 完成部署验证清单
2. 📝 创建你的第一个Mock接口
3. 🔗 分享Mock API地址给团队
4. 📊 定期查看访问日志
5. 💾 设置定时备份

---

**祝你使用愉快！** 🎉
