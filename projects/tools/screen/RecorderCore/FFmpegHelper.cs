using System;
using System.Diagnostics;

namespace ScreenRecorder.RecorderCore
{
    /// <summary>
    /// 封装 FFmpeg 命令拼接与进程管理，便于录屏和音频录制。
    /// </summary>
    public static class FFmpegHelper
    {
        /// <summary>
        /// 启动 FFmpeg 录屏进程。
        /// </summary>
        /// <param name="options">录屏参数</param>
        /// <returns>FFmpeg 进程对象</returns>
        public static Process StartFFmpeg(ScreenRecorderOptions options)
        {
            string args = BuildFFmpegArgs(options);
            var psi = new ProcessStartInfo
            {
                FileName = "ffmpeg.exe", // 需确保 ffmpeg.exe 在 PATH 或指定路径
                Arguments = args,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true
            };
            var process = new Process { StartInfo = psi };
            process.Start();
            return process;
        }

        /// <summary>
        /// 根据参数拼接 FFmpeg 命令行参数。
        /// </summary>
        /// <param name="options">录屏参数</param>
        /// <returns>FFmpeg 命令行参数字符串</returns>
        public static string BuildFFmpegArgs(ScreenRecorderOptions options)
        {
            // 支持全屏与自定义区域录制（gdigrab）
            string regionArg = string.Empty;
            if (!string.IsNullOrEmpty(options.Region) && options.Region != "full")
            {
                // 期望格式: x,y,widthxheight 例如 100,200,1280x720
                var parts = options.Region.Split(',');
                if (parts.Length == 2 && parts[1].Contains("x"))
                {
                    var xy = parts[0];
                    var wh = parts[1];
                    regionArg = $"-offset_x {xy.Split(' ')[0]} -offset_y {xy.Split(' ')[1]} -video_size {wh}";
                }
            }
            else
            {
                regionArg = $"-video_size {options.Width}x{options.Height}";
            }
            string videoInput = $"-f gdigrab -framerate {options.Fps} {regionArg} -i desktop";
            string audioInput = options.RecordAudio ? $" -f dshow -i audio=\"{options.AudioDevice}\"" : string.Empty;
            string codec = $"-c:v {options.VideoCodec}";
            string output = $"\"{options.OutputPath}\"";
            string args = $"{videoInput}{audioInput} {codec} -preset ultrafast -pix_fmt yuv420p {output}";
            return args;
        }
    }
} 