# 启动 ScreenRecorder 主界面
Write-Host "正在启动 ScreenRecorder..."
dotnet run --project "$(Split-Path -Parent $MyInvocation.MyCommand.Definition)\ScreenRecorder.csproj" 