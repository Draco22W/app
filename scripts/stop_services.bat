@echo off
chcp 65001 >nul
echo ========================================
echo           游戏平台服务停止脚本
echo ========================================
echo.

echo 🔍 查找并停止后端API服务...
tasklist /FI "WINDOWTITLE eq 后端API服务*" 2>NUL | find /I /N "cmd.exe">NUL
if "%ERRORLEVEL%"=="0" (
    taskkill /FI "WINDOWTITLE eq 后端API服务*" /F >NUL 2>&1
    echo ✅ 后端API服务已停止
) else (
    echo ℹ️  未找到运行中的后端API服务
)

echo.
echo 🔍 查找Python进程...
tasklist /FI "IMAGENAME eq python.exe" 2>NUL | find /I /N "python.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ⚠️  发现Python进程，是否停止？(Y/N)
    set /p choice=
    if /i "%choice%"=="Y" (
        taskkill /FI "IMAGENAME eq python.exe" /F >NUL 2>&1
        echo ✅ Python进程已停止
    )
)

echo.
echo ========================================
echo           服务停止完成！
echo ========================================
echo.
echo 💡 提示：
echo    - MySQL服务仍在运行，如需停止请手动操作
echo    - 如需完全停止所有服务，请手动停止MySQL
echo.
pause 