using System;
using System.Windows.Forms;
using ScreenRecorder.RecorderCore;

namespace ScreenRecorder
{
    /// <summary>
    /// 隐藏窗体，集成系统托盘、右键菜单、全局快捷键与录制控制。
    /// </summary>
    public class TrayForm : Form
    {
        private NotifyIcon trayIcon;
        private ContextMenuStrip trayMenu;
        private ScreenRecorder.RecorderCore.ScreenRecorder recorder;
        private ScreenRecorderOptions options;

        public TrayForm()
        {
            // 初始化录制器与配置
            options = ConfigManager.LoadConfig();
            recorder = new ScreenRecorder.RecorderCore.ScreenRecorder();

            // 托盘菜单
            trayMenu = new ContextMenuStrip();
            trayMenu.Items.Add("开始录制", null, (s, e) => StartRecording());
            trayMenu.Items.Add("停止录制", null, (s, e) => StopRecording());
            trayMenu.Items.Add("截图", null, (s, e) => CaptureScreenshot());
            trayMenu.Items.Add("选择屏幕截图", null, (s, e) => CaptureSelectedScreen());
            trayMenu.Items.Add("区域截图", null, (s, e) => CaptureRegion());
            trayMenu.Items.Add("录制预览", null, (s, e) => ShowPreview());
            trayMenu.Items.Add("导出日志", null, (s, e) => ExportLog());
            trayMenu.Items.Add("参数设置", null, (s, e) => ShowSettingsDialog());
            trayMenu.Items.Add("退出", null, (s, e) => Application.Exit());

            // 托盘图标
            trayIcon = new NotifyIcon
            {
                Text = "ScreenRecorder",
                Icon = System.Drawing.SystemIcons.Application,
                ContextMenuStrip = trayMenu,
                Visible = true
            };

            // 注册全局快捷键
            HotkeyManager.RegisterAllHotkeys(this);

            // 隐藏窗体
            this.ShowInTaskbar = false;
            this.WindowState = FormWindowState.Minimized;
            this.Visible = false;
        }

        protected override void WndProc(ref Message m)
        {
            const int WM_HOTKEY = 0x0312;
            if (m.Msg == WM_HOTKEY)
            {
                var action = (HotkeyManager.HotkeyAction)m.WParam.ToInt32();
                switch (action)
                {
                    case HotkeyManager.HotkeyAction.Start:
                        StartRecording();
                        break;
                    case HotkeyManager.HotkeyAction.Stop:
                        StopRecording();
                        break;
                    // 可扩展暂停、截图等
                }
            }
            base.WndProc(ref m);
        }

        private void StartRecording()
        {
            try
            {
                recorder.StartRecording(options);
                Logger.Info("托盘：开始录制");
                trayIcon.ShowBalloonTip(1000, "ScreenRecorder", "开始录制", ToolTipIcon.Info);
            }
            catch (Exception ex)
            {
                Logger.Error("托盘录制异常: " + ex.Message);
                trayIcon.ShowBalloonTip(2000, "ScreenRecorder", "录制失败: " + ex.Message, ToolTipIcon.Error);
            }
        }

        private void StopRecording()
        {
            try
            {
                recorder.StopRecording();
                Logger.Info("托盘：停止录制");
                trayIcon.ShowBalloonTip(1000, "ScreenRecorder", "录制已停止", ToolTipIcon.Info);
            }
            catch (Exception ex)
            {
                Logger.Error("托盘停止异常: " + ex.Message);
                trayIcon.ShowBalloonTip(2000, "ScreenRecorder", "停止失败: " + ex.Message, ToolTipIcon.Error);
            }
        }

        private void CaptureScreenshot()
        {
            try
            {
                var bounds = System.Windows.Forms.Screen.PrimaryScreen.Bounds;
                using (var bmp = new System.Drawing.Bitmap(bounds.Width, bounds.Height))
                using (var g = System.Drawing.Graphics.FromImage(bmp))
                {
                    g.CopyFromScreen(bounds.X, bounds.Y, 0, 0, bounds.Size);
                    var dir = "screenshots";
                    if (!System.IO.Directory.Exists(dir)) System.IO.Directory.CreateDirectory(dir);
                    var file = $"{dir}/screenshot_{DateTime.Now:yyyyMMdd_HHmmss}.png";
                    bmp.Save(file, System.Drawing.Imaging.ImageFormat.Png);
                    Logger.Info($"截图已保存: {file}");
                    trayIcon.ShowBalloonTip(1000, "ScreenRecorder", $"截图已保存: {file}", ToolTipIcon.Info);
                }
            }
            catch (Exception ex)
            {
                Logger.Error("截图异常: " + ex.Message);
                trayIcon.ShowBalloonTip(2000, "ScreenRecorder", "截图失败: " + ex.Message, ToolTipIcon.Error);
            }
        }

        private void CaptureSelectedScreen()
        {
            try
            {
                using (var dlg = new ScreenSelectorForm())
                {
                    if (dlg.ShowDialog() == DialogResult.OK)
                    {
                        var scr = Screen.AllScreens[dlg.SelectedScreenIndex];
                        var bounds = scr.Bounds;
                        using (var bmp = new System.Drawing.Bitmap(bounds.Width, bounds.Height))
                        using (var g = System.Drawing.Graphics.FromImage(bmp))
                        {
                            g.CopyFromScreen(bounds.X, bounds.Y, 0, 0, bounds.Size);
                            var dir = "screenshots";
                            if (!System.IO.Directory.Exists(dir)) System.IO.Directory.CreateDirectory(dir);
                            var file = $"{dir}/screenshot_screen{dlg.SelectedScreenIndex + 1}_{DateTime.Now:yyyyMMdd_HHmmss}.png";
                            bmp.Save(file, System.Drawing.Imaging.ImageFormat.Png);
                            Logger.Info($"多屏截图已保存: {file}");
                            trayIcon.ShowBalloonTip(1000, "ScreenRecorder", $"截图已保存: {file}", ToolTipIcon.Info);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Logger.Error("多屏截图异常: " + ex.Message);
                trayIcon.ShowBalloonTip(2000, "ScreenRecorder", "截图失败: " + ex.Message, ToolTipIcon.Error);
            }
        }

        private void CaptureRegion()
        {
            try
            {
                using (var dlg = new RegionSelectorForm())
                {
                    if (dlg.ShowDialog() == DialogResult.OK && dlg.SelectedRegion.Width > 0 && dlg.SelectedRegion.Height > 0)
                    {
                        var rect = dlg.SelectedRegion;
                        using (var bmp = new System.Drawing.Bitmap(rect.Width, rect.Height))
                        using (var g = System.Drawing.Graphics.FromImage(bmp))
                        {
                            g.CopyFromScreen(rect.X, rect.Y, 0, 0, rect.Size);
                            var dir = "screenshots";
                            if (!System.IO.Directory.Exists(dir)) System.IO.Directory.CreateDirectory(dir);
                            var file = $"{dir}/screenshot_region_{rect.X}_{rect.Y}_{rect.Width}x{rect.Height}_{DateTime.Now:yyyyMMdd_HHmmss}.png";
                            bmp.Save(file, System.Drawing.Imaging.ImageFormat.Png);
                            Logger.Info($"区域截图已保存: {file}");
                            trayIcon.ShowBalloonTip(1000, "ScreenRecorder", $"截图已保存: {file}", ToolTipIcon.Info);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Logger.Error("区域截图异常: " + ex.Message);
                trayIcon.ShowBalloonTip(2000, "ScreenRecorder", "截图失败: " + ex.Message, ToolTipIcon.Error);
            }
        }

        private void ShowPreview()
        {
            try
            {
                using (var dlg = new PreviewForm(options))
                {
                    dlg.ShowDialog();
                }
            }
            catch (Exception ex)
            {
                Logger.Error("录制预览异常: " + ex.Message);
                trayIcon.ShowBalloonTip(2000, "ScreenRecorder", "录制预览失败: " + ex.Message, ToolTipIcon.Error);
            }
        }

        private void ExportLog()
        {
            try
            {
                var logPath = "logs/app.log";
                var desktop = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                var dest = System.IO.Path.Combine(desktop, $"ScreenRecorder_log_{DateTime.Now:yyyyMMdd_HHmmss}.log");
                System.IO.File.Copy(logPath, dest, true);
                Logger.Info($"日志已导出: {dest}");
                trayIcon.ShowBalloonTip(1000, "ScreenRecorder", $"日志已导出到桌面", ToolTipIcon.Info);
            }
            catch (Exception ex)
            {
                Logger.Error("导出日志异常: " + ex.Message);
                trayIcon.ShowBalloonTip(2000, "ScreenRecorder", "导出日志失败: " + ex.Message, ToolTipIcon.Error);
            }
        }

        private void ShowSettingsDialog()
        {
            try
            {
                using (var dlg = new SettingsForm(options))
                {
                    if (dlg.ShowDialog() == DialogResult.OK)
                    {
                        options = dlg.UpdatedOptions;
                        ConfigManager.SaveConfig(options);
                        Logger.Info("参数已更新");
                        trayIcon.ShowBalloonTip(1000, "ScreenRecorder", "参数已保存", ToolTipIcon.Info);
                    }
                }
            }
            catch (Exception ex)
            {
                Logger.Error("参数设置异常: " + ex.Message);
                trayIcon.ShowBalloonTip(2000, "ScreenRecorder", "参数设置失败: " + ex.Message, ToolTipIcon.Error);
            }
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                trayIcon?.Dispose();
                trayMenu?.Dispose();
                HotkeyManager.UnregisterAllHotkeys(this);
            }
            base.Dispose(disposing);
        }
    }
} 