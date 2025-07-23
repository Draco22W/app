import Phaser from "phaser";
/**
 * @class Weapon
 * @description 武器基类，支持不同类型武器扩展
 */
class Weapon {
    constructor(scene, x, y, type = "gun") {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.type = type;
        this.heldBy = null;
        // 用图形API绘制武器
        this.sprite = scene.add.graphics();
        this.sprite.fillStyle(0xffcc00);
        this.sprite.fillRect(-10, -4, 20, 8);
        this.sprite.setPosition(x, y);
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setAllowGravity(true);
        this.sprite.body.setCollideWorldBounds(true);
        this.sprite.body.setSize(20, 8);
        this.sprite.body.setOffset(-10, -4);
    }
    pickup(player) {
        this.heldBy = player;
        this.sprite.visible = false;
    }
    drop() {
        this.heldBy = null;
        this.sprite.visible = true;
        this.sprite.setPosition(this.x, this.y);
    }
    attack() {
        // 简单攻击效果：可扩展为发射子弹等
        if (this.heldBy) {
            this.scene.add.text(this.heldBy.x, this.heldBy.y - 40, "Bang!", { fontSize: 16, color: "#f00" }).setDepth(10).setAlpha(0.8).setScrollFactor(0);
        }
    }
}
export default Weapon; 