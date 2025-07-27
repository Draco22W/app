using System;
using System.Windows.Forms;

namespace ScreenRecorder
{
    /// <summary>
    /// 多屏选择对话框。
    /// </summary>
    public class ScreenSelectorForm : Form
    {
        public int SelectedScreenIndex { get; private set; } = 0;
        private ComboBox cmbScreens;
        private Button btnOK, btnCancel;

        public ScreenSelectorForm()
        {
            this.Text = "选择屏幕";
            this.Width = 300;
            this.Height = 140;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.StartPosition = FormStartPosition.CenterParent;
            this.MaximizeBox = false;
            this.MinimizeBox = false;

            var lbl = new Label { Text = "请选择要截图的屏幕：", Left = 20, Top = 20, Width = 240 };
            cmbScreens = new ComboBox { Left = 20, Top = 50, Width = 240, DropDownStyle = ComboBoxStyle.DropDownList };
            for (int i = 0; i < Screen.AllScreens.Length; i++)
            {
                var scr = Screen.AllScreens[i];
                cmbScreens.Items.Add($"屏幕{i + 1} ({scr.Bounds.Width}x{scr.Bounds.Height})");
            }
            cmbScreens.SelectedIndex = 0;

            btnOK = new Button { Text = "确定", Left = 60, Top = 85, Width = 70, DialogResult = DialogResult.OK };
            btnCancel = new Button { Text = "取消", Left = 150, Top = 85, Width = 70, DialogResult = DialogResult.Cancel };

            btnOK.Click += (s, e) => { SelectedScreenIndex = cmbScreens.SelectedIndex; this.DialogResult = DialogResult.OK; this.Close(); };
            btnCancel.Click += (s, e) => { this.DialogResult = DialogResult.Cancel; this.Close(); };

            this.Controls.AddRange(new Control[] { lbl, cmbScreens, btnOK, btnCancel });
        }
    }
} 