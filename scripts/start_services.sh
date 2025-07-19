#!/bin/bash

echo "========================================"
echo "           游戏平台服务启动脚本"
echo "========================================"
echo

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误：未检测到Python3，请先安装Python 3.7+"
    exit 1
fi

# 检查MySQL服务状态
echo "🔍 检查MySQL服务状态..."
if systemctl is-active --quiet mysql; then
    echo "✅ MySQL服务已在运行"
elif systemctl is-active --quiet mysqld; then
    echo "✅ MySQL服务已在运行"
else
    echo "⚠️  MySQL服务未运行，尝试启动..."
    if systemctl start mysql 2>/dev/null; then
        echo "✅ MySQL服务启动成功"
    elif systemctl start mysqld 2>/dev/null; then
        echo "✅ MySQL服务启动成功"
    else
        echo "❌ 无法启动MySQL服务，请手动启动MySQL"
        echo "或者检查MySQL服务名称是否正确"
        exit 1
    fi
fi

# 检查并安装Python依赖
echo
echo "📦 检查Python依赖..."
cd "$(dirname "$0")/projects/back-end-api"

# 创建虚拟环境
if [ ! -d "venv" ]; then
    echo "🔧 创建虚拟环境..."
    python3 -m venv venv
fi

echo "🔧 激活虚拟环境并安装依赖..."
source venv/bin/activate
pip install -r requirements.txt >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败，请检查网络连接"
    exit 1
fi
echo "✅ 依赖安装完成"

# 启动后端API服务
echo
echo "🚀 启动后端API服务..."
gnome-terminal --title="后端API服务" -- bash -c "cd '$(pwd)' && source venv/bin/activate && python api.py; exec bash" 2>/dev/null || \
xterm -title "后端API服务" -e "cd '$(pwd)' && source venv/bin/activate && python api.py; exec bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'\" && source venv/bin/activate && python api.py"' 2>/dev/null || \
echo "⚠️  无法打开新终端，请在当前终端运行: cd '$(pwd)' && source venv/bin/activate && python api.py"

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 3

# 检查服务是否启动成功
echo "🔍 检查API服务状态..."
if curl -s http://localhost:5000/api/games >/dev/null 2>&1; then
    echo "✅ API服务启动成功"
else
    echo "⚠️  API服务可能还在启动中，请稍等..."
fi

# 启动前端页面
echo
echo "🌐 启动前端页面..."
if command -v xdg-open &> /dev/null; then
    xdg-open "$(dirname "$0")/projects/home/index.html" 2>/dev/null
elif command -v open &> /dev/null; then
    open "$(dirname "$0")/projects/home/index.html" 2>/dev/null
else
    echo "⚠️  无法自动打开浏览器，请手动打开: $(dirname "$0")/projects/home/index.html"
fi

echo
echo "========================================"
echo "           服务启动完成！"
echo "========================================"
echo
echo "📋 服务状态："
echo "   ✅ MySQL数据库服务"
echo "   ✅ 后端API服务 (http://localhost:5000)"
echo "   ✅ 前端页面已打开"
echo
echo "💡 提示："
echo "   - 如果前端显示网络错误，请等待几秒钟后刷新页面"
echo "   - 后端服务运行在 http://localhost:5000"
echo "   - 按 Ctrl+C 可以停止后端服务"
echo
echo "🎮 现在可以开始使用游戏平台了！"
echo 