using System.Drawing;

namespace ScreenRecorder.RecorderCore
{
    /// <summary>
    /// 提供录制区域参数结构和区域选择方法。
    /// </summary>
    public static class ScreenRegionSelector
    {
        /// <summary>
        /// 区域参数结构。
        /// </summary>
        public struct Region
        {
            public int X { get; set; }
            public int Y { get; set; }
            public int Width { get; set; }
            public int Height { get; set; }
            public override string ToString() => $"{X},{Y},{Width}x{Height}";
        }

        /// <summary>
        /// 获取全屏区域参数。
        /// </summary>
        public static Region GetFullScreenRegion()
        {
            var bounds = System.Windows.Forms.Screen.PrimaryScreen.Bounds;
            return new Region { X = bounds.X, Y = bounds.Y, Width = bounds.Width, Height = bounds.Height };
        }

        // TODO: 可扩展窗口选择、鼠标框选等
    }
} 