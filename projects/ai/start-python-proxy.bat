@echo off
echo ========================================
echo    AI编程助手 - Python代理服务器
echo ========================================
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未检测到 Python
    echo.
    echo 请先安装 Python:
    echo 1. 访问 https://python.org
    echo 2. 下载并安装最新版本
    echo 3. 重新运行此脚本
    echo.
    pause
    exit /b 1
)

echo ✅ Python 已安装
echo.

REM 启动Python代理服务器
echo 🚀 正在启动Python代理服务器...
echo.

python proxy-server.py

echo.
echo 服务器已停止
pause