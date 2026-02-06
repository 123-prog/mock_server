#!/bin/bash

# Mock API Platform 快速启动脚本

echo "🚀 正在启动 Mock API Platform..."
echo ""

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 未检测到Docker，请先安装Docker"
    echo "访问 https://docs.docker.com/get-docker/ 获取安装指南"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ 未检测到Docker Compose，请先安装"
    exit 1
fi

# 创建数据库目录
if [ ! -d "database" ]; then
    echo "📁 创建数据库目录..."
    mkdir -p database
fi

# 启动服务
echo "🔨 构建并启动服务..."
docker-compose up -d --build

# 等待服务就绪
echo "⏳ 等待服务启动..."
sleep 5

# 检查服务状态
if curl -s http://localhost:3000/health > /dev/null; then
    echo ""
    echo "✅ Mock API Platform 启动成功！"
    echo ""
    echo "📋 访问信息："
    echo "   管理界面: http://localhost:3000"
    echo "   Mock API: http://localhost:3000/mock"
    echo "   健康检查: http://localhost:3000/health"
    echo ""
    echo "💡 提示："
    echo "   - 查看日志: docker-compose logs -f"
    echo "   - 停止服务: docker-compose down"
    echo "   - 重启服务: docker-compose restart"
    echo ""
else
    echo ""
    echo "⚠️  服务可能未正常启动，请检查日志："
    echo "   docker-compose logs"
    echo ""
fi
