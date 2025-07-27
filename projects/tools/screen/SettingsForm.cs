using System;
using System.Drawing;
using System.Windows.Forms;
using ScreenRecorder.RecorderCore;
using System.IO;

namespace ScreenRecorder
{
    /// <summary>
    /// 专业化 OBS 风格设置面板，左侧导航，右侧分组参数。
    /// </summary>
    public class SettingsForm : Form
    {
        public ScreenRecorderOptions UpdatedOptions { get; private set; }
        private ListBox navList;
        private Panel contentPanel;
        private Button btnApply, btnOK, btnCancel;
        private ScreenRecorderOptions options;
        // 输出分组控件引用
        private TextBox txtPath = null!;
        private ComboBox cmbFormat = null!;
        private ComboBox cmbEncoder = null!;
        private TextBox txtBitrate = null!;
        // 视频分组控件引用
        private ComboBox cmbRes = null!;
        private NumericUpDown numFps = null!;
        // 音频分组控件引用
        private ComboBox cmbDevice = null!;
        private ComboBox cmbSample = null!;
        private ComboBox cmbChannels = null!;
        // 热键分组控件引用
        private TextBox txtHotkeyStart = null!;
        private TextBox txtHotkeyStop = null!;
        private int maxScreenWidth = 1920;
        private int maxScreenHeight = 1080;

        public SettingsForm(ScreenRecorderOptions options)
        {
            this.Text = "设置";
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.StartPosition = FormStartPosition.CenterParent;
            this.Width = 700;
            this.Height = 500;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.options = options;
            this.UpdatedOptions = options;
            this.Font = new Font("Segoe UI", 10);

            // 默认保存路径指向 videos 目录
            string videosDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "videos");
            if (!Directory.Exists(videosDir)) Directory.CreateDirectory(videosDir);
            if (string.IsNullOrWhiteSpace(options.OutputPath))
                options.OutputPath = Path.Combine(videosDir, "output.mp4");

            // 检测主屏最大分辨率
            maxScreenWidth = Screen.PrimaryScreen.Bounds.Width;
            maxScreenHeight = Screen.PrimaryScreen.Bounds.Height;

            // 左侧导航
            navList = new ListBox { Left = 0, Top = 0, Width = 120, Height = 420, Font = new Font("Segoe UI", 11, FontStyle.Bold), BackColor = Color.FromArgb(40, 40, 40), ForeColor = Color.White, BorderStyle = BorderStyle.None };            
            navList.Items.AddRange(new[] { "输出", "视频", "音频", "热键" });
            navList.SelectedIndex = 0;
            navList.SelectedIndexChanged += (s, e) => ShowGroup(navList.SelectedIndex);
            this.Controls.Add(navList);

            // 右侧内容区
            contentPanel = new Panel { Left = 130, Top = 10, Width = 540, Height = 420, BackColor = Color.FromArgb(55, 55, 55) };
            this.Controls.Add(contentPanel);

            // 底部按钮
            btnApply = new Button { Text = "应用", Width = 80, Left = 320, Top = 440 };
            btnOK = new Button { Text = "确定", Width = 80, Left = 410, Top = 440, DialogResult = DialogResult.OK };
            btnCancel = new Button { Text = "取消", Width = 80, Left = 500, Top = 440, DialogResult = DialogResult.Cancel };
            btnApply.Click += (s, e) => SaveCurrentGroup();
            btnOK.Click += (s, e) => { SaveCurrentGroup(); this.UpdatedOptions = options; this.Close(); };
            btnCancel.Click += (s, e) => this.Close();
            this.Controls.Add(btnApply);
            this.Controls.Add(btnOK);
            this.Controls.Add(btnCancel);

            ShowGroup(0);
        }

        private void ShowGroup(int idx)
        {
            contentPanel.Controls.Clear();
            switch (idx)
            {
                case 0: ShowOutputGroup(); break;
                case 1: ShowVideoGroup(); break;
                case 2: ShowAudioGroup(); break;
                case 3: ShowHotkeyGroup(); break;
            }
        }

        private void ShowOutputGroup()
        {
            var gb = new GroupBox { Text = "输出设置", ForeColor = Color.White, Font = new Font("Segoe UI", 10, FontStyle.Bold), Width = 520, Height = 400, Left = 10, Top = 10 };
            var lblPath = new Label { Text = "保存路径:", Left = 20, Top = 40, Width = 80, ForeColor = Color.White };
            txtPath = new TextBox { Left = 110, Top = 36, Width = 300, Text = options.OutputPath };
            var btnBrowse = new Button { Text = "浏览", Left = 420, Top = 34, Width = 60 };
            btnBrowse.Click += (s, e) => {
                using var sfd = new SaveFileDialog();
                sfd.Filter = "MP4 文件 (*.mp4)|*.mp4|所有文件 (*.*)|*.*";
                sfd.FileName = string.IsNullOrWhiteSpace(txtPath.Text) ? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "videos", "output.mp4") : txtPath.Text;
                string dir = Path.GetDirectoryName(sfd.FileName);
                if (string.IsNullOrEmpty(dir) || !Directory.Exists(dir))
                    dir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "videos");
                sfd.InitialDirectory = dir;
                if (sfd.ShowDialog() == DialogResult.OK)
                    txtPath.Text = sfd.FileName;
            };
            var lblFormat = new Label { Text = "格式:", Left = 20, Top = 90, Width = 80, ForeColor = Color.White };
            cmbFormat = new ComboBox { Left = 110, Top = 86, Width = 120, DropDownStyle = ComboBoxStyle.DropDownList };
            cmbFormat.Items.AddRange(new[] { "mp4", "mkv", "flv", "avi" });
            cmbFormat.SelectedItem = (options.OutputPath?.ToLower().EndsWith(".mkv") == true ? "mkv" : "mp4");
            var lblEncoder = new Label { Text = "编码器:", Left = 20, Top = 140, Width = 80, ForeColor = Color.White };
            cmbEncoder = new ComboBox { Left = 110, Top = 136, Width = 120, DropDownStyle = ComboBoxStyle.DropDownList };
            cmbEncoder.Items.AddRange(new[] { "libx264", "libx265", "h264_nvenc", "hevc_nvenc" });
            cmbEncoder.SelectedItem = options.VideoCodec;
            var lblBitrate = new Label { Text = "视频码率(kbps):", Left = 20, Top = 190, Width = 120, ForeColor = Color.White };
            txtBitrate = new TextBox { Left = 150, Top = 186, Width = 80, Text = "4000" };
            gb.Controls.AddRange(new Control[] { lblPath, txtPath, btnBrowse, lblFormat, cmbFormat, lblEncoder, cmbEncoder, lblBitrate, txtBitrate });
            contentPanel.Controls.Add(gb);
        }

        private void ShowVideoGroup()
        {
            var gb = new GroupBox { Text = "视频设置", ForeColor = Color.White, Font = new Font("Segoe UI", 10, FontStyle.Bold), Width = 520, Height = 400, Left = 10, Top = 10 };
            var lblRes = new Label { Text = "分辨率:", Left = 20, Top = 40, Width = 80, ForeColor = Color.White };
            cmbRes = new ComboBox { Left = 110, Top = 36, Width = 120, DropDownStyle = ComboBoxStyle.DropDownList };
            var resOptions = new[] { "1920x1080", "2560x1440", "1280x720", "自定义" };
            cmbRes.Items.AddRange(Array.FindAll(resOptions, r =>
            {
                if (r == "自定义") return true;
                var arr = r.Split('x');
                return int.Parse(arr[0]) <= maxScreenWidth && int.Parse(arr[1]) <= maxScreenHeight;
            }));
            cmbRes.SelectedItem = $"{options.Width}x{options.Height}";
            var lblFps = new Label { Text = "帧率:", Left = 20, Top = 90, Width = 80, ForeColor = Color.White };
            numFps = new NumericUpDown { Left = 110, Top = 86, Width = 80, Minimum = 1, Maximum = 240, Value = options.Fps };
            gb.Controls.AddRange(new Control[] { lblRes, cmbRes, lblFps, numFps });
            contentPanel.Controls.Add(gb);
        }

        private void ShowAudioGroup()
        {
            var gb = new GroupBox { Text = "音频设置", ForeColor = Color.White, Font = new Font("Segoe UI", 10, FontStyle.Bold), Width = 520, Height = 400, Left = 10, Top = 10 };
            var lblDevice = new Label { Text = "音频设备:", Left = 20, Top = 40, Width = 80, ForeColor = Color.White };
            cmbDevice = new ComboBox { Left = 110, Top = 36, Width = 300, DropDownStyle = ComboBoxStyle.DropDownList };
            cmbDevice.Items.AddRange(AudioDeviceHelper.GetAudioInputDevices().ToArray());
            cmbDevice.SelectedItem = options.AudioDevice;
            var lblSample = new Label { Text = "采样率(Hz):", Left = 20, Top = 90, Width = 80, ForeColor = Color.White };
            cmbSample = new ComboBox { Left = 110, Top = 86, Width = 120, DropDownStyle = ComboBoxStyle.DropDownList };
            cmbSample.Items.AddRange(new[] { "44100", "48000" });
            cmbSample.SelectedItem = "44100";
            var lblChannels = new Label { Text = "声道:", Left = 20, Top = 140, Width = 80, ForeColor = Color.White };
            cmbChannels = new ComboBox { Left = 110, Top = 136, Width = 120, DropDownStyle = ComboBoxStyle.DropDownList };
            cmbChannels.Items.AddRange(new[] { "单声道", "立体声" });
            cmbChannels.SelectedItem = "立体声";
            gb.Controls.AddRange(new Control[] { lblDevice, cmbDevice, lblSample, cmbSample, lblChannels, cmbChannels });
            contentPanel.Controls.Add(gb);
        }

        private void ShowHotkeyGroup()
        {
            var gb = new GroupBox { Text = "热键设置", ForeColor = Color.White, Font = new Font("Segoe UI", 10, FontStyle.Bold), Width = 520, Height = 400, Left = 10, Top = 10 };
            var lblStart = new Label { Text = "开始录制:", Left = 20, Top = 40, Width = 100, ForeColor = Color.White };
            txtHotkeyStart = new TextBox { Left = 130, Top = 36, Width = 120, Text = "Ctrl+Shift+R" };
            var lblStop = new Label { Text = "停止录制:", Left = 20, Top = 90, Width = 100, ForeColor = Color.White };
            txtHotkeyStop = new TextBox { Left = 130, Top = 86, Width = 120, Text = "Ctrl+Shift+S" };
            gb.Controls.AddRange(new Control[] { lblStart, txtHotkeyStart, lblStop, txtHotkeyStop });
            contentPanel.Controls.Add(gb);
        }

        private void SaveCurrentGroup()
        {
            // 输出分组参数保存
            if (navList.SelectedIndex == 0)
            {
                if (txtPath != null)
                {
                    if (string.IsNullOrWhiteSpace(txtPath.Text))
                    {
                        MessageBox.Show("保存路径不能为空！", "参数错误", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                        txtPath.Focus();
                        return;
                    }
                    options.OutputPath = txtPath.Text;
                }
                if (cmbEncoder != null && cmbEncoder.SelectedItem != null)
                    options.VideoCodec = cmbEncoder.SelectedItem.ToString()!;
                if (txtBitrate != null && !int.TryParse(txtBitrate.Text, out _))
                {
                    MessageBox.Show("码率必须为数字！", "参数错误", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    txtBitrate.Focus();
                    return;
                }
                // 其它参数可扩展
            }
            // 视频分组参数保存
            if (navList.SelectedIndex == 1)
            {
                if (cmbRes != null && cmbRes.SelectedItem != null)
                {
                    var res = cmbRes.SelectedItem.ToString()!;
                    if (res.Contains("x"))
                    {
                        var arr = res.Split('x');
                        if (int.TryParse(arr[0], out int w) && int.TryParse(arr[1], out int h))
                        {
                            if (w < 320 || h < 240 || w > maxScreenWidth || h > maxScreenHeight)
                            {
                                MessageBox.Show($"分辨率非法！最大支持 {maxScreenWidth}x{maxScreenHeight}", "参数错误", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                                return;
                            }
                            options.Width = w;
                            options.Height = h;
                        }
                    }
                }
                if (numFps != null)
                {
                    if (numFps.Value < 1 || numFps.Value > 240)
                    {
                        MessageBox.Show("帧率非法！", "参数错误", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                        return;
                    }
                    options.Fps = (int)numFps.Value;
                }
            }
            // 音频分组参数保存
            if (navList.SelectedIndex == 2)
            {
                if (cmbDevice != null && cmbDevice.SelectedItem != null)
                    options.AudioDevice = cmbDevice.SelectedItem.ToString()!;
                if (cmbSample != null && cmbSample.SelectedItem != null)
                {
                    if (!int.TryParse(cmbSample.SelectedItem.ToString(), out int sample) || (sample != 44100 && sample != 48000))
                    {
                        MessageBox.Show("采样率非法！", "参数错误", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                        return;
                    }
                    // options.SampleRate = sample; // 需在 options 中扩展
                }
                if (cmbChannels != null && cmbChannels.SelectedItem != null)
                {
                    var ch = cmbChannels.SelectedItem.ToString();
                    if (ch != "单声道" && ch != "立体声")
                    {
                        MessageBox.Show("声道非法！", "参数错误", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                        return;
                    }
                    // options.Channels = ch == "立体声" ? 2 : 1; // 需在 options 中扩展
                }
            }
            // 热键分组参数保存
            if (navList.SelectedIndex == 3)
            {
                if (txtHotkeyStart != null)
                {
                    var val = txtHotkeyStart.Text.Trim();
                    if (string.IsNullOrWhiteSpace(val) || !(val.Contains("Ctrl") || val.Contains("Shift") || val.Contains("Alt")))
                    {
                        MessageBox.Show("开始录制热键格式非法，需包含Ctrl/Shift/Alt！", "参数错误", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                        txtHotkeyStart.Focus();
                        return;
                    }
                    // options.HotkeyStart = val; // 需在 options 中扩展
                }
                if (txtHotkeyStop != null)
                {
                    var val = txtHotkeyStop.Text.Trim();
                    if (string.IsNullOrWhiteSpace(val) || !(val.Contains("Ctrl") || val.Contains("Shift") || val.Contains("Alt")))
                    {
                        MessageBox.Show("停止录制热键格式非法，需包含Ctrl/Shift/Alt！", "参数错误", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                        txtHotkeyStop.Focus();
                        return;
                    }
                    // options.HotkeyStop = val; // 需在 options 中扩展
                }
            }
        }

        private void ShowToast(string message)
        {
            var toast = new Form
            {
                FormBorderStyle = FormBorderStyle.None,
                StartPosition = FormStartPosition.Manual,
                ShowInTaskbar = false,
                TopMost = true,
                BackColor = Color.FromArgb(60, 60, 60),
                Opacity = 0.92,
                Width = 260,
                Height = 48
            };
            var lbl = new Label
            {
                Text = message,
                ForeColor = Color.White,
                Font = new Font("Segoe UI", 11, FontStyle.Bold),
                AutoSize = false,
                TextAlign = ContentAlignment.MiddleCenter,
                Dock = DockStyle.Fill
            };
            toast.Controls.Add(lbl);
            // 右上角定位
            var screen = Screen.FromControl(this);
            toast.Left = screen.WorkingArea.Right - toast.Width - 20;
            toast.Top = screen.WorkingArea.Top + 32;
            toast.Show();
            var timer = new Timer { Interval = 1800 };
            timer.Tick += (s, e) => { toast.Close(); timer.Dispose(); };
            timer.Start();
        }

        private void btnApply_Click(object? sender, EventArgs e)
        {
            SaveCurrentGroup();
            ConfigManager.SaveConfig(options);
            ShowToast("参数已应用");
        }
        private void btnOK_Click(object? sender, EventArgs e)
        {
            SaveCurrentGroup();
            ConfigManager.SaveConfig(options);
            ShowToast("设置已保存");
            Close();
        }
        private void btnCancel_Click(object? sender, EventArgs e)
        {
            ShowToast("已取消更改");
            Close();
        }
    }
} 