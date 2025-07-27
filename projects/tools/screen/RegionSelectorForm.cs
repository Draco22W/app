using System;
using System.Drawing;
using System.Windows.Forms;

namespace ScreenRecorder
{
    /// <summary>
    /// 区域选择窗体，允许用户用鼠标框选屏幕区域。
    /// </summary>
    public class RegionSelectorForm : Form
    {
        public Rectangle SelectedRegion { get; private set; }
        private Point startPoint;
        private Rectangle currentRect;
        private bool isSelecting = false;

        public RegionSelectorForm()
        {
            this.FormBorderStyle = FormBorderStyle.None;
            this.WindowState = FormWindowState.Maximized;
            this.Opacity = 0.3;
            this.BackColor = Color.Black;
            this.TopMost = true;
            this.DoubleBuffered = true;
            this.Cursor = Cursors.Cross;
            this.ShowInTaskbar = false;
            this.KeyDown += (s, e) => { if (e.KeyCode == Keys.Escape) this.DialogResult = DialogResult.Cancel; };
        }

        protected override void OnMouseDown(MouseEventArgs e)
        {
            if (e.Button == MouseButtons.Left)
            {
                isSelecting = true;
                startPoint = e.Location;
                currentRect = new Rectangle(e.Location, new Size(0, 0));
            }
        }

        protected override void OnMouseMove(MouseEventArgs e)
        {
            if (isSelecting)
            {
                currentRect = new Rectangle(
                    Math.Min(startPoint.X, e.X),
                    Math.Min(startPoint.Y, e.Y),
                    Math.Abs(startPoint.X - e.X),
                    Math.Abs(startPoint.Y - e.Y));
                Invalidate();
            }
        }

        protected override void OnMouseUp(MouseEventArgs e)
        {
            if (isSelecting && e.Button == MouseButtons.Left)
            {
                isSelecting = false;
                SelectedRegion = currentRect;
                this.DialogResult = DialogResult.OK;
                this.Close();
            }
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            if (isSelecting)
            {
                using var pen = new Pen(Color.Red, 2);
                e.Graphics.DrawRectangle(pen, currentRect);
            }
        }
    }
} 