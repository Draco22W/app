import Phaser from "phaser";

/**
 * @class Player
 * @description 玩家/AI 基类，包含基础移动、攻击等方法
 */
class Player {
    constructor(scene, x, y, texture, config) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.texture = texture;
        this.config = config;
        this.isAI = false;
        this.speed = 200;
        this.jumpSpeed = 400;
        this.hasWeaponFlag = false;
        this.weapon = null;
        // 创建火柴人形象（用图形API）
        this.sprite = scene.add.graphics();
        this.drawStickman();
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setCollideWorldBounds(true);
        this.sprite.body.setBounce(0.1);
        this.sprite.body.setSize(24, 48);
        this.sprite.body.setOffset(-12, -24);
        this.sprite.setPosition(x, y);
        // 键盘控制
        if (!this.isAI) {
            this.cursors = scene.input.keyboard.createCursorKeys();
            this.keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
            this.keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
            this.keyW = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
            this.keySpace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        }
    }
    drawStickman() {
        const g = this.sprite;
        g.clear();
        g.lineStyle(4, 0x222222);
        g.strokeCircle(0, -16, 12); // 头
        g.lineBetween(0, -4, 0, 20); // 身体
        g.lineBetween(0, 0, -10, 12); // 左臂
        g.lineBetween(0, 0, 10, 12); // 右臂
        g.lineBetween(0, 20, -8, 36); // 左腿
        g.lineBetween(0, 20, 8, 36); // 右腿
    }
    update() {
        if (!this.isAI) {
            let vx = 0;
            if (this.cursors.left.isDown || this.keyA.isDown) vx = -this.speed;
            else if (this.cursors.right.isDown || this.keyD.isDown) vx = this.speed;
            this.sprite.body.setVelocityX(vx);
            if ((this.cursors.up.isDown || this.keyW.isDown) && this.sprite.body.onFloor()) {
                this.sprite.body.setVelocityY(-this.jumpSpeed);
            }
            // 攻击
            if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
                this.attack();
            }
        }
        // 更新 x/y
        this.x = this.sprite.x;
        this.y = this.sprite.y;
    }
    moveLeft() { this.sprite.body.setVelocityX(-this.speed); }
    moveRight() { this.sprite.body.setVelocityX(this.speed); }
    stop() { this.sprite.body.setVelocityX(0); }
    jump() { if (this.sprite.body.onFloor()) this.sprite.body.setVelocityY(-this.jumpSpeed); }
    attack() { if (this.weapon) this.weapon.attack(); }
    hasWeapon() { return !!this.weapon; }
    pickupWeapon(weapon) {
        this.weapon = weapon;
        this.hasWeaponFlag = true;
        weapon.pickup(this);
    }
    dropWeapon() {
        if (this.weapon) {
            this.weapon.drop();
            this.weapon = null;
            this.hasWeaponFlag = false;
        }
    }
}
export default Player; 