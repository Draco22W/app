using System;
using System.Windows.Forms;
using ScreenRecorder.RecorderCore;

namespace ScreenRecorder
{
    /// <summary>
    /// 参数设置对话框，支持常用录屏参数的查看与修改。
    /// </summary>
    public class SettingsForm : Form
    {
        public ScreenRecorderOptions UpdatedOptions { get; private set; }
        private TextBox txtOutput;
        private NumericUpDown numWidth, numHeight, numFps;
        private ComboBox cmbCodec, cmbAudioDevice;
        private CheckBox chkAudio;
        private Button btnOK, btnCancel;

        public SettingsForm(ScreenRecorderOptions options)
        {
            this.Text = "参数设置";
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.StartPosition = FormStartPosition.CenterParent;
            this.Width = 350;
            this.Height = 320;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.UpdatedOptions = options;

            var lblOutput = new Label { Text = "输出文件:", Left = 20, Top = 20, Width = 80 };
            txtOutput = new TextBox { Left = 110, Top = 18, Width = 200, Text = options.OutputPath };

            var lblWidth = new Label { Text = "宽度:", Left = 20, Top = 60, Width = 80 };
            numWidth = new NumericUpDown { Left = 110, Top = 58, Width = 80, Minimum = 320, Maximum = 7680, Value = options.Width };
            var lblHeight = new Label { Text = "高度:", Left = 200, Top = 60, Width = 50 };
            numHeight = new NumericUpDown { Left = 250, Top = 58, Width = 60, Minimum = 240, Maximum = 4320, Value = options.Height };

            var lblFps = new Label { Text = "帧率:", Left = 20, Top = 100, Width = 80 };
            numFps = new NumericUpDown { Left = 110, Top = 98, Width = 80, Minimum = 1, Maximum = 240, Value = options.Fps };

            var lblCodec = new Label { Text = "编码器:", Left = 20, Top = 140, Width = 80 };
            cmbCodec = new ComboBox { Left = 110, Top = 138, Width = 200, DropDownStyle = ComboBoxStyle.DropDownList };
            cmbCodec.Items.AddRange(new string[] { "libx264", "libx265" });
            cmbCodec.SelectedItem = options.VideoCodec;

            var lblAudio = new Label { Text = "录制音频:", Left = 20, Top = 180, Width = 80 };
            chkAudio = new CheckBox { Left = 110, Top = 178, Checked = options.RecordAudio };

            var lblAudioDevice = new Label { Text = "音频设备:", Left = 20, Top = 220, Width = 80 };
            cmbAudioDevice = new ComboBox { Left = 110, Top = 218, Width = 200, DropDownStyle = ComboBoxStyle.DropDownList };
            cmbAudioDevice.Items.AddRange(AudioDeviceHelper.GetAudioInputDevices().ToArray());
            cmbAudioDevice.SelectedItem = options.AudioDevice;

            btnOK = new Button { Text = "确定", Left = 110, Top = 260, Width = 80, DialogResult = DialogResult.OK };
            btnCancel = new Button { Text = "取消", Left = 230, Top = 260, Width = 80, DialogResult = DialogResult.Cancel };

            btnOK.Click += (s, e) =>
            {
                UpdatedOptions = new ScreenRecorderOptions
                {
                    OutputPath = txtOutput.Text,
                    Width = (int)numWidth.Value,
                    Height = (int)numHeight.Value,
                    Fps = (int)numFps.Value,
                    VideoCodec = cmbCodec.SelectedItem?.ToString() ?? "libx264",
                    RecordAudio = chkAudio.Checked,
                    AudioDevice = cmbAudioDevice.SelectedItem?.ToString() ?? "default",
                    Region = options.Region
                };
                this.DialogResult = DialogResult.OK;
                this.Close();
            };
            btnCancel.Click += (s, e) => { this.DialogResult = DialogResult.Cancel; this.Close(); };

            this.Controls.AddRange(new Control[] {
                lblOutput, txtOutput,
                lblWidth, numWidth, lblHeight, numHeight,
                lblFps, numFps,
                lblCodec, cmbCodec,
                lblAudio, chkAudio,
                lblAudioDevice, cmbAudioDevice,
                btnOK, btnCancel
            });
        }
    }
} 