@echo off
echo ========================================
echo    AI编程助手 - 代理服务器 + 测试
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

echo 🚀 正在启动代理服务器...
echo.
echo 📱 主应用地址: http://localhost:3000
echo 🧪 测试页面: http://localhost:3000/test-proxy.html
echo ⏹️  按 Ctrl+C 停止服务器
echo.
echo 使用说明:
echo 1. 服务器启动后，先访问测试页面验证功能
echo 2. 测试通过后，访问主应用并启用代理模式
echo 3. 如果测试失败，请检查网络连接和API密钥
echo.
echo ========================================
echo.

node proxy-server.js

echo.
echo 服务器已停止
pause