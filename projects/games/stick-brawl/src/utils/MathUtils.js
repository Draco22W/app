/**
 * @module MathUtils
 * @description 常用数学工具函数
 */
const MathUtils = {
    distance(x1, y1, x2, y2) {
        return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
    },
    clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }
    // 可扩展更多工具函数
};
export default MathUtils; 