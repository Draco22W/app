using System;
using System.Runtime.InteropServices;
using System.Windows.Forms;

namespace ScreenRecorder.RecorderCore
{
    /// <summary>
    /// 全局快捷键注册与监听，基于 WinAPI。
    /// </summary>
    public static class HotkeyManager
    {
        [DllImport("user32.dll")]
        private static extern bool RegisterHotKey(IntPtr hWnd, int id, uint fsModifiers, uint vk);
        [DllImport("user32.dll")]
        private static extern bool UnregisterHotKey(IntPtr hWnd, int id);

        public const int MOD_ALT = 0x1;
        public const int MOD_CONTROL = 0x2;
        public const int MOD_SHIFT = 0x4;
        public const int MOD_WIN = 0x8;

        public enum HotkeyAction { Start, Pause, Stop, Capture }

        /// <summary>
        /// 注册全局快捷键。
        /// </summary>
        public static void RegisterAllHotkeys(Form form)
        {
            // 默认快捷键
            RegisterHotKey(form.Handle, (int)HotkeyAction.Start, MOD_CONTROL | MOD_SHIFT, (uint)Keys.R);
            RegisterHotKey(form.Handle, (int)HotkeyAction.Pause, MOD_CONTROL | MOD_SHIFT, (uint)Keys.P);
            RegisterHotKey(form.Handle, (int)HotkeyAction.Stop, MOD_CONTROL | MOD_SHIFT, (uint)Keys.S);
            RegisterHotKey(form.Handle, (int)HotkeyAction.Capture, MOD_CONTROL | MOD_SHIFT, (uint)Keys.C);
        }

        /// <summary>
        /// 注销所有快捷键。
        /// </summary>
        public static void UnregisterAllHotkeys(Form form)
        {
            foreach (HotkeyAction action in Enum.GetValues(typeof(HotkeyAction)))
            {
                UnregisterHotKey(form.Handle, (int)action);
            }
        }
    }
} 