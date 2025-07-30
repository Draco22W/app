@echo off
echo ========================================
echo    清理端口3000占用进程
echo ========================================
echo.

echo 🔍 正在查找占用端口3000的进程...
netstat -ano | findstr :3000

echo.
echo 🔪 正在终止占用端口3000的进程...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo 终止进程 PID: %%a
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo ✅ 端口3000已清理完成
echo.
echo 现在可以重新启动代理服务器了
echo 请运行: start-with-test.bat
echo.
pause