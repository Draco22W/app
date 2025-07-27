using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

namespace ScreenRecorder.RecorderCore
{
    /// <summary>
    /// 负责屏幕录制的核心逻辑，封装 FFmpeg 调用与参数配置。
    /// </summary>
    public class ScreenRecorder
    {
        private Process? ffmpegProcess;

        /// <summary>
        /// 开始录制屏幕。
        /// </summary>
        /// <param name="options">录制参数</param>
        public void StartRecording(ScreenRecorderOptions options)
        {
            try
            {
                // 参数合法性校验
                if (string.IsNullOrWhiteSpace(options.OutputPath))
                    throw new ArgumentException("保存路径不能为空");
                string dir = Path.GetDirectoryName(options.OutputPath) ?? "";
                if (!Directory.Exists(dir))
                    Directory.CreateDirectory(dir); // 自动创建目录
                // 检查写入权限
                try
                {
                    string testFile = Path.Combine(dir, "__test_write.tmp");
                    File.WriteAllText(testFile, "test");
                    File.Delete(testFile);
                }
                catch
                {
                    throw new UnauthorizedAccessException($"无写入权限: {dir}");
                }
                // 检查磁盘空间（大于100MB）
                var drive = new DriveInfo(Path.GetPathRoot(dir)!);
                if (drive.AvailableFreeSpace < 100 * 1024 * 1024)
                    throw new IOException("磁盘空间不足，至少需要100MB可用空间");
                // 分辨率、码率、编码器校验
                if (options.Width < 320 || options.Height < 240)
                    throw new ArgumentException("分辨率过低");
                if (options.Fps < 1 || options.Fps > 240)
                    throw new ArgumentException("帧率非法");
                if (string.IsNullOrWhiteSpace(options.VideoCodec))
                    throw new ArgumentException("编码器不能为空");
                // ...可扩展更多参数校验
                if (ffmpegProcess != null && !ffmpegProcess.HasExited)
                    throw new InvalidOperationException("录制已在进行中！");
                ffmpegProcess = FFmpegHelper.StartFFmpeg(options);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"录制启动失败：{ex.Message}", "错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
                throw;
            }
        }

        /// <summary>
        /// 停止录制。
        /// </summary>
        public void StopRecording()
        {
            try
            {
                if (ffmpegProcess != null && !ffmpegProcess.HasExited)
                {
                    ffmpegProcess.Kill();
                    ffmpegProcess.WaitForExit();
                    ffmpegProcess = null;
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"停止录制失败：{ex.Message}", "错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }

    /// <summary>
    /// 录屏参数配置类。
    /// </summary>
    public class ScreenRecorderOptions
    {
        public string OutputPath { get; set; } = "output.mp4";
        public int Width { get; set; } = 1920;
        public int Height { get; set; } = 1080;
        public int Fps { get; set; } = 30;
        public string VideoCodec { get; set; } = "libx264";
        public string AudioDevice { get; set; } = "default";
        public bool RecordAudio { get; set; } = true;
        public string Region { get; set; } = "full"; // full/window/region
        // 可扩展更多参数
    }
} 