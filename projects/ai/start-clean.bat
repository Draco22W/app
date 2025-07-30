@echo off
echo ========================================
echo    AI编程助手 - 清理并启动
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

echo 🔍 检查端口3000占用情况...
netstat -ano | findstr :3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️ 端口3000被占用，正在清理...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        echo 终止进程 PID: %%a
        taskkill /PID %%a /F >nul 2>&1
    )
    echo ✅ 端口已清理
    timeout /t 2 >nul
) else (
    echo ✅ 端口3000可用
)

echo.
echo 🚀 正在启动代理服务器...
echo.
echo 📱 主应用地址: http://localhost:3000
echo 🧪 测试页面: http://localhost:3000/test-proxy.html
echo 📊 状态页面: http://localhost:3000/status
echo ⏹️  按 Ctrl+C 停止服务器
echo.
echo ========================================
echo.

node proxy-server.js

echo.
echo 服务器已停止
pause