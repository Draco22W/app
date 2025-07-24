using System;
using System.Diagnostics;

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
            if (ffmpegProcess != null && !ffmpegProcess.HasExited)
                throw new InvalidOperationException("录制已在进行中！");
            ffmpegProcess = FFmpegHelper.StartFFmpeg(options);
        }

        /// <summary>
        /// 停止录制。
        /// </summary>
        public void StopRecording()
        {
            if (ffmpegProcess != null && !ffmpegProcess.HasExited)
            {
                ffmpegProcess.Kill();
                ffmpegProcess.WaitForExit();
                ffmpegProcess = null;
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