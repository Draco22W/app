# ScreenRecorder

高性能现代化 Windows 桌面录屏工具核心模块（命令行/类库），严格遵循 READEME.md 设计与技术选型。

## 功能概述
- 支持分辨率/帧率/编码/区域/音频/快捷键等参数
- 依赖 FFmpeg、NAudio、NLog、Newtonsoft.Json
- 可作为命令行工具或被主程序调用

## 构建与运行
1. 安装 .NET 6 SDK
2. 还原依赖：`dotnet restore`
3. 构建项目：`dotnet build`
4. 运行示例：`dotnet run -- [参数]`

## 目录结构
- Program.cs         // 主入口
- RecorderCore/      // 录屏核心模块（后续补充）
- config.json        // 默认配置

## 依赖
- FFmpeg（需放置于 PATH 或指定路径）
- NAudio
- NLog
- Newtonsoft.Json

## 参考 READEME.md 获取详细功能与技术说明 