@echo off
echo ========================================
echo           游戏平台服务启动脚本
echo ========================================
echo.

:: 检查Python是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo 错误：未检测到Python，请先安装Python 3.7+
    pause
    exit /b 1
)

:: 检查MySQL服务状态
echo 检查MySQL服务状态...
net start | findstr "MySQL" >nul
if errorlevel 1 (
    echo MySQL服务未运行，尝试启动...
    net start MySQL93 >nul 2>&1
    if errorlevel 1 (
        net start MySQL80 >nul 2>&1
        if errorlevel 1 (
            net start MySQL >nul 2>&1
            if errorlevel 1 (
                echo 无法启动MySQL服务，请手动启动
                echo 请以管理员身份运行此脚本
                echo 或者手动运行: net start MySQL93
                pause
                exit /b 1
            )
        )
    )
    echo MySQL服务启动成功
) else (
    echo MySQL服务已在运行
)

:: 检查并安装Python依赖
echo.
echo 检查Python依赖...
cd /d "%~dp0projects\back-end-api"
if not exist "venv" (
    echo 创建虚拟环境...
    python -m venv venv
)

echo 激活虚拟环境并安装依赖...
call venv\Scripts\activate.bat
if exist "requirements.txt" (
    pip install -r requirements.txt
    if errorlevel 1 (
        echo 依赖安装失败，请检查网络连接
        pause
        exit /b 1
    )
    echo 依赖安装完成
) else (
    echo requirements.txt文件不存在
    pause
    exit /b 1
)

:: 启动后端API服务
echo.
echo 启动后端API服务...
start "后端API服务" cmd /k "cd /d %~dp0projects\back-end-api && venv\Scripts\activate.bat && python api.py"

:: 等待服务启动
echo 等待服务启动...
timeout /t 3 /nobreak >nul

:: 检查服务是否启动成功
echo 检查API服务状态...
curl -s http://localhost:5000/api/games >nul 2>&1
if errorlevel 1 (
    echo API服务可能还在启动中，请稍等...
) else (
    echo API服务启动成功
)

:: 启动前端页面
echo.
echo 启动前端页面...
start "" "%~dp0projects\home\index.html"

echo.
echo ========================================
echo           服务启动完成！
echo ========================================
echo.
echo 服务状态：
echo    MySQL数据库服务
echo    后端API服务 (http://localhost:5000)
echo    前端页面已打开
echo.
echo 提示：
echo    - 如果前端显示网络错误，请等待几秒钟后刷新页面
echo    - 后端服务运行在 http://localhost:5000
echo    - 按 Ctrl+C 可以停止后端服务
echo.
echo 现在可以开始使用游戏平台了！
echo.
pause 