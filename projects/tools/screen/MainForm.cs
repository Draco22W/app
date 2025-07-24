using System;
using System.Drawing;
using System.Windows.Forms;
using ScreenRecorder.RecorderCore;
using System.IO;

namespace ScreenRecorder
{
    /// <summary>
    /// 现代化 OBS 风格主界面。
    /// </summary>
    public class MainForm : Form
    {
        private readonly Button btnStart, btnStop, btnSettings, btnTheme;
        private readonly Label lblStatus;
        private readonly PictureBox logoBox;
        private readonly NotifyIcon trayIcon;
        private readonly ScreenRecorder.RecorderCore.ScreenRecorder recorder;
        private ScreenRecorderOptions options;
        private bool isDark = true;
        private readonly PictureBox previewBox;
        private readonly Timer previewTimer;
        private readonly Timer themeAnimTimer;
        private float themeAnimProgress = 1f;
        private bool animToDark = true;
        private Color currentBg1, currentBg2, targetBg1, targetBg2;
        private Color currentBtn1, currentBtn2, targetBtn1, targetBtn2;

        public MainForm()
        {
            try
            {
                // MessageBox.Show("MainForm 构造已执行"); // 移除调试弹窗
                string logoPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "resources", "logo.png");
                this.Text = "ScreenRecorder";
                this.FormBorderStyle = FormBorderStyle.FixedSingle;
                this.MaximizeBox = false;
                this.MinimizeBox = false;
                this.StartPosition = FormStartPosition.CenterScreen;
                this.Width = 420;
                this.Height = 320;
                this.BackColor = Color.FromArgb(28, 28, 34);
                this.Font = new Font("Segoe UI", 11);
                // 不设置 this.Icon
                // 顶部 logo
                logoBox = new PictureBox
                {
                    Image = Image.FromFile(logoPath),
                    SizeMode = PictureBoxSizeMode.Zoom,
                    Width = 64,
                    Height = 64,
                    Left = (this.ClientSize.Width - 64) / 2,
                    Top = 18
                };
                this.Controls.Add(logoBox);

                // 按钮区
                btnStart = new Button
                {
                    Text = "开始录制",
                    Width = 120,
                    Height = 40,
                    Left = 50,
                    Top = 110,
                    BackColor = Color.FromArgb(60, 180, 75),
                    ForeColor = Color.White,
                    FlatStyle = FlatStyle.Flat
                };
                btnStart.FlatAppearance.BorderSize = 0;
                btnStart.Click += (s, e) => StartRecording();

                btnStop = new Button
                {
                    Text = "停止录制",
                    Width = 120,
                    Height = 40,
                    Left = 250,
                    Top = 110,
                    BackColor = Color.FromArgb(220, 50, 47),
                    ForeColor = Color.White,
                    FlatStyle = FlatStyle.Flat
                };
                btnStop.FlatAppearance.BorderSize = 0;
                btnStop.Click += (s, e) => StopRecording();

                btnSettings = new Button
                {
                    Text = "设置",
                    Width = 120,
                    Height = 36,
                    Left = 140,
                    Top = 180,
                    BackColor = Color.FromArgb(45, 45, 55),
                    ForeColor = Color.White,
                    FlatStyle = FlatStyle.Flat
                };
                btnSettings.FlatAppearance.BorderSize = 0;
                btnSettings.Click += (s, e) => ShowSettings();

                this.Controls.Add(btnStart);
                this.Controls.Add(btnStop);
                this.Controls.Add(btnSettings);

                // 初始化渐变色
                currentBg1 = targetBg1 = Color.FromArgb(127, 0, 255); // 紫色
                currentBg2 = targetBg2 = Color.FromArgb(225, 0, 255); // 紫色
                currentBtn1 = targetBtn1 = Color.FromArgb(127, 0, 255);
                currentBtn2 = targetBtn2 = Color.FromArgb(225, 0, 255);

                // 主题切换动画定时器
                themeAnimTimer = new Timer { Interval = 16 };
                themeAnimTimer.Tick += (s, e) => AnimateTheme();

                // 主题切换按钮
                btnTheme = new Button
                {
                    Text = "切换主题",
                    Width = 120,
                    Height = 36,
                    Left = 140,
                    Top = 230,
                    FlatStyle = FlatStyle.Flat
                };
                btnTheme.FlatAppearance.BorderSize = 0;
                btnTheme.Click += (s, e) => ToggleTheme();
                this.Controls.Add(btnTheme);

                // 录制预览区
                previewBox = new PictureBox
                {
                    Left = 20,
                    Top = 280,
                    Width = 380,
                    Height = 80,
                    BorderStyle = BorderStyle.FixedSingle,
                    SizeMode = PictureBoxSizeMode.Zoom
                };
                this.Controls.Add(previewBox);

                previewTimer = new Timer { Interval = 200 };
                previewTimer.Tick += (s, e) => RefreshPreview();
                previewTimer.Start();

                // 状态栏
                lblStatus = new Label
                {
                    Text = "状态：空闲",
                    ForeColor = Color.LightGray,
                    AutoSize = false,
                    TextAlign = ContentAlignment.MiddleCenter,
                    Dock = DockStyle.Bottom,
                    Height = 32,
                    BackColor = Color.FromArgb(38, 38, 44)
                };
                this.Controls.Add(lblStatus);

                // 托盘图标
                trayIcon = new NotifyIcon
                {
                    // 不设置 Icon
                    Text = "ScreenRecorder",
                    Visible = true
                };
                trayIcon.DoubleClick += (s, e) => this.Show();

                // 初始化录制器
                options = ConfigManager.LoadConfig();
                recorder = new ScreenRecorder.RecorderCore.ScreenRecorder();

                // 强制主窗体显示在最前面
                this.WindowState = FormWindowState.Normal;
                this.Show();
                this.BringToFront();
                this.Activate();
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
            using var brush = new System.Drawing.Drawing2D.LinearGradientBrush(
                this.ClientRectangle,
                currentBg1,
                currentBg2,
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