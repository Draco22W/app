using System;
using ScreenRecorder.RecorderCore;
using System.Windows.Forms;

namespace ScreenRecorder
{
    /// <summary>
    /// 程序主入口，负责解析命令行参数并调用录屏核心逻辑。
    /// </summary>
    class Program
    {
        /// <param name="args">命令行参数</param>
        /// <returns>0 表示正常退出</returns>
        static int Main(string[] args)
        {
            try
            {
                Application.SetHighDpiMode(HighDpiMode.SystemAware);
                if (args.Length > 0 && args[0] == "--tray")
                {
                    Application.EnableVisualStyles();
                    Application.SetCompatibleTextRenderingDefault(false);
                    Application.Run(new TrayForm());
                    return 0;
                }
                // 默认启动主界面
                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);
                Application.Run(new MainForm());
                return 0;
            }
            catch (Exception ex)
            {
                Logger.Error($"发生异常: {ex.Message}\n{ex.StackTrace}");
                Console.WriteLine($"发生错误: {ex.Message}\n请查看 logs/app.log 获取详细信息。");
                return 1;
            }
        }
    }
} 