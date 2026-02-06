#!/bin/bash

# Mock API Platform 停止脚本

echo "🛑 正在停止 Mock API Platform..."

if ! command -v docker-compose &> /dev/null; then
    echo "❌ 未检测到Docker Compose"
    exit 1
fi

docker-compose down

echo ""
echo "✅ Mock API Platform 已停止"
echo ""
echo "💡 数据库文件已保存在 ./database 目录中"
echo "   重新启动时数据不会丢失"
echo ""
