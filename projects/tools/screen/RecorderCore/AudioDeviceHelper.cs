using System.Collections.Generic;
using NAudio.CoreAudioApi;

namespace ScreenRecorder.RecorderCore
{
    /// <summary>
    /// 提供音频输入设备枚举功能，便于用户选择录制来源。
    /// </summary>
    public static class AudioDeviceHelper
    {
        /// <summary>
        /// 获取所有可用音频输入设备（麦克风/声卡）。
        /// </summary>
        /// <returns>设备名称列表</returns>
        public static List<string> GetAudioInputDevices()
        {
            var devices = new List<string>();
            using (var enumerator = new MMDeviceEnumerator())
            {
                foreach (var device in enumerator.EnumerateAudioEndPoints(DataFlow.Capture, DeviceState.Active))
                {
                    devices.Add(device.FriendlyName);
                }
            }
            return devices;
        }
    }
} 