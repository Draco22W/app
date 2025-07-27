using NLog;

namespace ScreenRecorder.RecorderCore
{
    /// <summary>
    /// 日志系统封装，基于 NLog。
    /// </summary>
    public static class Logger
    {
        private static readonly NLog.Logger logger = LogManager.GetCurrentClassLogger();

        public static void Info(string message) => logger.Info(message);
        public static void Warn(string message) => logger.Warn(message);
        public static void Error(string message) => logger.Error(message);
        public static void Debug(string message) => logger.Debug(message);
    }
} 