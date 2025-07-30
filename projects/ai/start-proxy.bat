@echo off
echo ========================================
echo    AI编程助手 - 代理服务器启动器
echo ========================================
echo.

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未检测到 Node.js
    echo.
    echo 请先安装 Node.js:
    echo 1. 访问 https://nodejs.org
    echo 2. 下载并安装最新版本
    echo 3. 重新运行此脚本
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js 已安装
echo.

REM 启动代理服务器
echo 🚀 正在启动代理服务器...
echo.
echo 📱 启动后请访问: http://localhost:3000
echo 🔗 然后在网页中点击"代理模式"按钮
echo ⏹️  按 Ctrl+C 停止服务器
echo.
echo ========================================
echo.

node proxy-server.js

echo.
echo 服务器已停止
pause