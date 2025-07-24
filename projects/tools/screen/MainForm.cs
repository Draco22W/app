using System;
using System.Drawing;
using System.Windows.Forms;
using ScreenRecorder.RecorderCore;
using System.IO;
using System.Drawing.Drawing2D;
using System.Collections.Generic; // Added for ListBox

namespace ScreenRecorder
{
    /// <summary>
    /// 现代化 OBS 风格主界面。
    /// </summary>
    public class MainForm : Form
    {
        private Button btnStart = null!;
        private Button btnStop = null!;
        private Button btnSettings = null!;
        private Button btnTheme = null!;
        private Label lblStatus = null!;
        private NotifyIcon trayIcon = null!;
        private ScreenRecorder.RecorderCore.ScreenRecorder recorder = null!;
        private ScreenRecorderOptions options = null!;
        private bool isDark = true;
        private PictureBox previewBox = null!;
        private Timer previewTimer = null!;
        private Timer themeAnimTimer = null!;
        private float themeAnimProgress = 1f;
        private bool animToDark = true;
        private Color currentBg1, currentBg2, targetBg1, targetBg2;
        private Color currentBtn1, currentBtn2, targetBtn1, targetBtn2;
        private Label lblSavePath = null!;

        public MainForm()
        {
            try
            {
                options = ConfigManager.LoadConfig();
                this.Text = "ScreenRecorder";
                this.FormBorderStyle = FormBorderStyle.Sizable;
                this.MaximizeBox = true;
                this.MinimizeBox = true;
                this.DoubleBuffered = true;
                this.StartPosition = FormStartPosition.CenterScreen;
                this.Width = 1100;
                this.Height = 700;
                this.BackColor = Color.FromArgb(30, 30, 30);
                this.Font = new Font("Segoe UI", 10);

                // 顶部栏
                var topBar = new Panel { Height = 40, Dock = DockStyle.Top, BackColor = Color.FromArgb(40, 40, 40) };
                var lblTitle = new Label { Text = "ScreenRecorder", ForeColor = Color.White, Font = new Font("Segoe UI", 14, FontStyle.Bold), AutoSize = true, Left = 20, Top = 8 };
                topBar.Controls.Add(lblTitle);
                this.Controls.Add(topBar);

                // 左侧场景区
                var leftPanel = new GroupBox { Text = "场景", ForeColor = Color.White, Font = new Font("Segoe UI", 10, FontStyle.Bold), Width = 180, Dock = DockStyle.Left, BackColor = Color.FromArgb(40, 40, 40) };
                var sceneList = new ListBox { Dock = DockStyle.Fill, Font = new Font("Segoe UI", 10), BackColor = Color.FromArgb(50, 50, 50), ForeColor = Color.White };
                sceneList.Items.Add("默认场景");
                leftPanel.Controls.Add(sceneList);
                this.Controls.Add(leftPanel);

                // 右侧音频区
                var rightPanel = new GroupBox { Text = "音频混音器", ForeColor = Color.White, Font = new Font("Segoe UI", 10, FontStyle.Bold), Width = 220, Dock = DockStyle.Right, BackColor = Color.FromArgb(40, 40, 40) };
                var audioLabel = new Label { Text = "麦克风/Aux", Top = 40, Left = 20, Width = 120, ForeColor = Color.White };
                var audioBar = new ProgressBar { Top = 70, Left = 20, Width = 160, Height = 20, Value = 50, ForeColor = Color.LimeGreen };
                rightPanel.Controls.Add(audioLabel);
                rightPanel.Controls.Add(audioBar);
                this.Controls.Add(rightPanel);

                // 中间预览区
                var previewPanel = new Panel { Dock = DockStyle.Fill, BackColor = Color.FromArgb(60, 60, 60) };
                var previewBox = new PictureBox { Width = 600, Height = 340, Left = 120, Top = 60, BackColor = Color.Black, SizeMode = PictureBoxSizeMode.Zoom };
                previewPanel.Controls.Add(previewBox);
                this.Controls.Add(previewPanel);

                // 右下角控制按钮区
                var controlPanel = new Panel { Height = 80, Dock = DockStyle.Bottom, BackColor = Color.FromArgb(40, 40, 40) };
                var btnStart = new Button { Text = "开始录制", Width = 120, Height = 40, Left = 600, Top = 20, BackColor = Color.FromArgb(255, 236, 140), ForeColor = Color.Black, Font = new Font("Segoe UI", 12, FontStyle.Bold) };
                var btnStop = new Button { Text = "停止录制", Width = 120, Height = 40, Left = 740, Top = 20, BackColor = Color.FromArgb(255, 167, 81), ForeColor = Color.Black, Font = new Font("Segoe UI", 12, FontStyle.Bold) };
                var btnSettings = new Button { Text = "设置", Width = 100, Height = 36, Left = 880, Top = 22, BackColor = Color.FromArgb(80, 80, 80), ForeColor = Color.White, Font = new Font("Segoe UI", 11, FontStyle.Bold) };
                var btnExit = new Button { Text = "退出", Width = 100, Height = 36, Left = 990, Top = 22, BackColor = Color.FromArgb(80, 80, 80), ForeColor = Color.White, Font = new Font("Segoe UI", 11, FontStyle.Bold) };
                controlPanel.Controls.Add(btnStart);
                controlPanel.Controls.Add(btnStop);
                controlPanel.Controls.Add(btnSettings);
                controlPanel.Controls.Add(btnExit);
                this.Controls.Add(controlPanel);

                // 绑定按钮事件
                btnStart.Click += (s, e) =>
                {
                    try
                    {
                        if (recorder == null) recorder = new ScreenRecorder.RecorderCore.ScreenRecorder();
                        recorder.StartRecording(options);
                        lblStatus.Text = "状态：录制中...";
                        // TODO: 刷新预览区为实时画面
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show("录制启动失败：" + ex.Message, "错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    }
                };
                btnStop.Click += (s, e) =>
                {
                    try
                    {
                        recorder?.StopRecording();
                        lblStatus.Text = "状态：空闲";
                        // TODO: 恢复预览区为占位图
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show("停止录制失败：" + ex.Message, "错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    }
                };
                btnSettings.Click += (s, e) =>
                {
                    using var dlg = new SettingsForm(options);
                    if (dlg.ShowDialog() == DialogResult.OK)
                    {
                        options = dlg.UpdatedOptions;
                        ConfigManager.SaveConfig(options);
                    }
                };
                btnExit.Click += (s, e) => this.Close();

                // 底部状态栏
                var statusBar = new Panel { Height = 32, Dock = DockStyle.Bottom, BackColor = Color.FromArgb(30, 30, 30) };
                lblStatus = new Label { Text = "状态：空闲", ForeColor = Color.White, Font = new Font("Segoe UI", 10), AutoSize = false, TextAlign = ContentAlignment.MiddleLeft, Dock = DockStyle.Fill };
                statusBar.Controls.Add(lblStatus);
                this.Controls.Add(statusBar);
            }
            catch (Exception ex)
            {
                MessageBox.Show("构造异常: " + ex.ToString());
            }
        }

        protected override void OnLoad(EventArgs e)
        {
            try
            {
                base.OnLoad(e);
            }
            catch (Exception ex)
            {
                MessageBox.Show("OnLoad异常: " + ex.ToString());
            }
        }

        private void StartRecording()
        {
            try
            {
                recorder.StartRecording(options);
                lblStatus.Text = "状态：录制中...";
                trayIcon.ShowBalloonTip(1000, "ScreenRecorder", "开始录制", ToolTipIcon.Info);
            }
            catch (Exception ex)
            {
                MessageBox.Show("录制启动失败：" + ex.Message, "错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void StopRecording()
        {
            try
            {
                recorder.StopRecording();
                lblStatus.Text = "状态：空闲";
                trayIcon.ShowBalloonTip(1000, "ScreenRecorder", "录制已停止", ToolTipIcon.Info);
            }
            catch (Exception ex)
            {
                MessageBox.Show("停止录制失败：" + ex.Message, "错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void ShowSettings()
        {
            using (var dlg = new SettingsForm(options))
            {
                if (dlg.ShowDialog() == DialogResult.OK)
                {
                    options = dlg.UpdatedOptions;
                    ConfigManager.SaveConfig(options);
                }
            }
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            // 绘制主背景渐变
            using var brush = new LinearGradientBrush(
                this.ClientRectangle,
                Color.FromArgb(255, 236, 140),
                Color.FromArgb(255, 167, 81),
                45f);
            e.Graphics.FillRectangle(brush, this.ClientRectangle);
            base.OnPaint(e);
        }

        private void AnimateTheme()
        {
            // 线性插值渐变动画
            const float speed = 0.08f;
            themeAnimProgress += speed;
            if (themeAnimProgress >= 1f)
            {
                themeAnimProgress = 1f;
                themeAnimTimer.Stop();
            }
            currentBg1 = LerpColor(currentBg1, targetBg1, themeAnimProgress);
            currentBg2 = LerpColor(currentBg2, targetBg2, themeAnimProgress);
            currentBtn1 = LerpColor(currentBtn1, targetBtn1, themeAnimProgress);
            currentBtn2 = LerpColor(currentBtn2, targetBtn2, themeAnimProgress);
            btnStart.BackColor = currentBtn1;
            btnStop.BackColor = currentBtn2;
            btnSettings.BackColor = btnTheme.BackColor = currentBtn1;
            btnStart.ForeColor = btnStop.ForeColor = btnSettings.ForeColor = btnTheme.ForeColor = isDark ? Color.White : Color.Black;
            lblStatus.BackColor = isDark ? Color.FromArgb(38, 38, 44) : Color.Gainsboro;
            lblStatus.ForeColor = isDark ? Color.LightGray : Color.Black;
            this.Invalidate();
        }

        private static Color LerpColor(Color a, Color b, float t)
        {
            t = Math.Min(1f, Math.Max(0f, t));
            return Color.FromArgb(
                (int)(a.A + (b.A - a.A) * t),
                (int)(a.R + (b.R - a.R) * t),
                (int)(a.G + (b.G - a.G) * t),
                (int)(a.B + (b.B - a.B) * t));
        }

        private void ToggleTheme()
        {
            isDark = !isDark;
            themeAnimProgress = 0f;
            animToDark = isDark;
            if (isDark)
            {
                targetBg1 = Color.FromArgb(127, 0, 255); // 渐变紫
                targetBg2 = Color.FromArgb(225, 0, 255);
                targetBtn1 = Color.FromArgb(127, 0, 255);
                targetBtn2 = Color.FromArgb(225, 0, 255);
            }
            else
            {
                targetBg1 = Color.FromArgb(255, 226, 89); // 渐变黄
                targetBg2 = Color.FromArgb(255, 167, 81);
                targetBtn1 = Color.FromArgb(255, 226, 89);
                targetBtn2 = Color.FromArgb(255, 167, 81);
            }
            themeAnimTimer.Start();
        }

        private void RefreshPreview()
        {
            try
            {
                Rectangle rect;
                if (!string.IsNullOrEmpty(options.Region) && options.Region != "full")
                {
                    var parts = options.Region.Split(',');
                    if (parts.Length == 2 && parts[1].Contains('x'))
                    {
                        var xy = parts[0].Split(' ');
                        var wh = parts[1].Split('x');
                        int x = int.Parse(xy[0]);
                        int y = int.Parse(xy[1]);
                        int w = int.Parse(wh[0]);
                        int h = int.Parse(wh[1]);
                        rect = new Rectangle(x, y, w, h);
                    }
                    else
                    {
                        rect = Screen.PrimaryScreen.Bounds;
                    }
                }
                else
                {
                    rect = Screen.PrimaryScreen.Bounds;
                }
                using var bmp = new Bitmap(rect.Width, rect.Height);
                using var g = Graphics.FromImage(bmp);
                g.CopyFromScreen(rect.X, rect.Y, 0, 0, rect.Size);
                previewBox.Image?.Dispose();
                previewBox.Image = (Bitmap)bmp.Clone();
            }
            catch { /* 忽略预览异常 */ }
        }

        protected override void OnFormClosed(FormClosedEventArgs e)
        {
            trayIcon?.Dispose();
            previewTimer?.Stop();
            previewBox.Image?.Dispose();
            base.OnFormClosed(e);
        }
    }
} 