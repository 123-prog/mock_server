#!/bin/bash

# Bug修复后的快速重启脚本

echo "════════════════════════════════════════════════════════════════"
echo "  🔧 Mock API Platform - 应用Bug修复"
echo "════════════════════════════════════════════════════════════════"
echo ""

echo "✅ Bug已修复：路径匹配问题已解决"
echo ""

# 检查是否在正确的目录
if [ ! -f "server.js" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    echo "   cd /root/workspace/test-script/mock_server"
    exit 1
fi

# 检查Docker是否运行
if command -v docker-compose &> /dev/null; then
    echo "📦 检测到 Docker Compose，正在重启服务..."
    echo ""

    # 检查容器是否运行
    if docker-compose ps | grep -q "Up"; then
        echo "🔄 停止当前服务..."
        docker-compose down
        echo ""

        echo "🚀 重新启动服务（应用修复）..."
        docker-compose up -d --build
        echo ""

        echo "⏳ 等待服务就绪..."
        sleep 5

        # 健康检查
        if curl -s http://localhost:3000/health > /dev/null; then
            echo "✅ 服务启动成功！"
        else
            echo "⚠️  服务可能未正常启动，请检查日志："
            echo "   docker-compose logs -f"
        fi
    else
        echo "🚀 启动服务..."
        docker-compose up -d --build
        echo ""

        echo "⏳ 等待服务就绪..."
        sleep 5

        if curl -s http://localhost:3000/health > /dev/null; then
            echo "✅ 服务启动成功！"
        else
            echo "⚠️  服务可能未正常启动，请检查日志"
        fi
    fi
else
    echo "📦 未检测到 Docker Compose"
    echo ""
    echo "如果使用 npm 运行，请手动执行："
    echo "  1. 按 Ctrl+C 停止当前进程"
    echo "  2. 运行: npm start"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  ✨ 现在可以测试你的 Mock 接口了！"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "测试命令（替换为你的实际路径）："
echo "  curl http://localhost:3000/mock/sigInfo"
echo ""
echo "或在浏览器访问："
echo "  http://localhost:3000/mock/sigInfo"
echo ""
echo "════════════════════════════════════════════════════════════════"
