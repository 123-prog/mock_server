#!/bin/bash

# Mock API Platform 项目验证脚本

echo "🔍 开始验证 Mock API Platform 项目..."
echo ""

SUCCESS=0
FAILED=0

# 验证函数
check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1"
        ((SUCCESS++))
    else
        echo "❌ $1 - 文件不存在"
        ((FAILED++))
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo "✅ $1/"
        ((SUCCESS++))
    else
        echo "❌ $1/ - 目录不存在"
        ((FAILED++))
    fi
}

check_executable() {
    if [ -x "$1" ]; then
        echo "✅ $1 (可执行)"
        ((SUCCESS++))
    else
        echo "⚠️  $1 (不可执行)"
    fi
}

echo "📁 检查目录结构..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_dir "public"
check_dir "database"
echo ""

echo "📦 检查核心文件..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "package.json"
check_file "server.js"
check_file "database.js"
echo ""

echo "🌐 检查前端文件..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "public/index.html"
check_file "public/styles.css"
check_file "public/app.js"
echo ""

echo "🐳 检查Docker文件..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "Dockerfile"
check_file "docker-compose.yml"
check_file ".dockerignore"
echo ""

echo "📖 检查文档文件..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "README.md"
check_file "QUICKSTART.md"
check_file "PROJECT_STRUCTURE.md"
check_file "DEPLOYMENT_CHECKLIST.md"
check_file "SUMMARY.md"
echo ""

echo "🎁 检查辅助文件..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "example-config.json"
check_file ".gitignore"
check_executable "start.sh"
check_executable "stop.sh"
echo ""

echo "🔍 验证文件内容..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 检查package.json是否包含必要的依赖
if grep -q "express" package.json && grep -q "better-sqlite3" package.json; then
    echo "✅ package.json 包含必要的依赖"
    ((SUCCESS++))
else
    echo "❌ package.json 缺少必要的依赖"
    ((FAILED++))
fi

# 检查server.js是否包含关键代码
if grep -q "express()" server.js && grep -q "app.listen" server.js; then
    echo "✅ server.js 包含Express服务器代码"
    ((SUCCESS++))
else
    echo "❌ server.js 缺少关键代码"
    ((FAILED++))
fi

# 检查database.js是否包含数据库操作
if grep -q "better-sqlite3" database.js && grep -q "CREATE TABLE" database.js; then
    echo "✅ database.js 包含数据库初始化代码"
    ((SUCCESS++))
else
    echo "❌ database.js 缺少数据库代码"
    ((FAILED++))
fi

# 检查HTML是否包含管理界面
if grep -q "Mock API Platform" public/index.html && grep -q "mock-form" public/index.html; then
    echo "✅ index.html 包含管理界面"
    ((SUCCESS++))
else
    echo "❌ index.html 缺少管理界面"
    ((FAILED++))
fi

echo ""
echo "📊 代码统计..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 统计代码行数
JS_LINES=$(cat server.js database.js public/app.js 2>/dev/null | wc -l)
HTML_LINES=$(cat public/index.html 2>/dev/null | wc -l)
CSS_LINES=$(cat public/styles.css 2>/dev/null | wc -l)
DOC_LINES=$(cat *.md 2>/dev/null | wc -l)

echo "JavaScript: $JS_LINES 行"
echo "HTML:       $HTML_LINES 行"
echo "CSS:        $CSS_LINES 行"
echo "文档:       $DOC_LINES 行"
echo "总计:       $((JS_LINES + HTML_LINES + CSS_LINES + DOC_LINES)) 行"

echo ""
echo "🎯 功能检查..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 检查是否有管理API路由
if grep -q "/admin/api/endpoints" server.js; then
    echo "✅ 管理API路由已实现"
else
    echo "❌ 缺少管理API路由"
fi

# 检查是否有Mock API处理
if grep -q "/mock" server.js; then
    echo "✅ Mock API路由已实现"
else
    echo "❌ 缺少Mock API路由"
fi

# 检查是否有CORS支持
if grep -q "cors" server.js; then
    echo "✅ CORS支持已配置"
else
    echo "❌ 缺少CORS配置"
fi

# 检查是否有健康检查
if grep -q "/health" server.js; then
    echo "✅ 健康检查端点已实现"
else
    echo "❌ 缺少健康检查端点"
fi

# 检查是否有访问日志功能
if grep -q "access_logs" database.js; then
    echo "✅ 访问日志功能已实现"
else
    echo "❌ 缺少访问日志功能"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 验证通过！所有检查项都已通过！"
    echo ""
    echo "✨ 项目已准备就绪，可以开始使用了！"
    echo ""
    echo "📝 下一步："
    echo "   1. 运行 ./start.sh 启动服务"
    echo "   2. 访问 http://localhost:3000"
    echo "   3. 开始创建你的第一个Mock接口"
    echo ""
    exit 0
else
    echo "⚠️  验证发现 $FAILED 个问题，请检查！"
    echo ""
    exit 1
fi
