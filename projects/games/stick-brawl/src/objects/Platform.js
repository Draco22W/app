import Phaser from "phaser";
/**
 * @class Platform
 * @description 地图平台对象，支持掉落、破坏等扩展
 */
class Platform {
    constructor(scene, x, y, width, height) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        // 用图形API绘制平台
        this.sprite = scene.add.graphics();
        this.sprite.fillStyle(0x888888);
        this.sprite.fillRect(-width/2, -height/2, width, height);
        this.sprite.setPosition(x, y);
        scene.physics.add.existing(this.sprite, true); // 静态体
        this.sprite.body.setSize(width, height);
        this.sprite.body.setOffset(-width/2, -height/2);
    }
    destroy() { this.sprite.destroy(); }
}
export default Platform; 