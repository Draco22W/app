using System.IO;
using Newtonsoft.Json;

namespace ScreenRecorder.RecorderCore
{
    /// <summary>
    /// 负责加载和保存本地配置文件（config.json）。
    /// </summary>
    public static class ConfigManager
    {
        private const string ConfigFileName = "config.json";

        /// <summary>
        /// 加载配置文件。
        /// </summary>
        /// <returns>ScreenRecorderOptions 对象</returns>
        public static ScreenRecorderOptions LoadConfig()
        {
            if (!File.Exists(ConfigFileName))
                return new ScreenRecorderOptions();
            var json = File.ReadAllText(ConfigFileName);
            return JsonConvert.DeserializeObject<ScreenRecorderOptions>(json) ?? new ScreenRecorderOptions();
        }

        /// <summary>
        /// 保存配置文件。
        /// </summary>
        /// <param name="options">要保存的配置</param>
        public static void SaveConfig(ScreenRecorderOptions options)
        {
            var json = JsonConvert.SerializeObject(options, Formatting.Indented);
            File.WriteAllText(ConfigFileName, json);
        }
    }
} 