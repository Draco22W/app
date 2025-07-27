using System;
using System.Drawing;
using System.Windows.Forms;
using ScreenRecorder.RecorderCore;

namespace ScreenRecorder
{
    /// <summary>
    /// 录制预览窗体，定时刷新显示当前录制区域画面。
    /// </summary>
    public class PreviewForm : Form
    {
        private readonly Timer timer;
        private readonly PictureBox pictureBox;
        private readonly ScreenRecorderOptions options;

        public PreviewForm(ScreenRecorderOptions options)
        {
            this.options = options;
            this.Text = "录制预览";
            this.Width = 400;
            this.Height = 240;
            this.FormBorderStyle = FormBorderStyle.FixedToolWindow;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.TopMost = true;

            pictureBox = new PictureBox { Dock = DockStyle.Fill, SizeMode = PictureBoxSizeMode.Zoom };
            this.Controls.Add(pictureBox);

            timer = new Timer { Interval = 200 };
            timer.Tick += (s, e) => RefreshPreview();
            timer.Start();
        }

        private void RefreshPreview()
        {
            try
            {
                Rectangle rect;
                if (!string.IsNullOrEmpty(options.Region) && options.Region != "full")
                {
                    // 期望格式: x,y,widthxheight
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
                pictureBox.Image?.Dispose();
                pictureBox.Image = (Bitmap)bmp.Clone();
            }
            catch { /* 忽略预览异常 */ }
        }

        protected override void OnFormClosed(FormClosedEventArgs e)
        {
            timer?.Stop();
            pictureBox.Image?.Dispose();
            base.OnFormClosed(e);
        }
    }
} 