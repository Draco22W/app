// objects/Player.js
// 玩家角色对象，含肢体物理、控制、武器、受伤等

/**
 * @class Player
 * @extends Phaser.Physics.Matter.Sprite
 * @description 玩家角色，支持肢体自由摆动、武器、受伤等
 */
export default class Player extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y, texture, options = {}) {
        super(scene.matter.world, x, y, texture, undefined, options);
        scene.add.existing(this);
        // 添加 stickman graphics
        this.stickmanGraphics = scene.add.graphics();
        this.stickmanGraphics.setDepth(10);
        // TODO: 初始化肢体物理、关节、状态、武器等
    }

    drawStickman() {
        const x = this.x;
        const y = this.y;
        this.stickmanGraphics.clear();
        this.stickmanGraphics.lineStyle(4, 0xffffff);
        // 头
        this.stickmanGraphics.strokeCircle(x, y - 20, 12);
        // 身体
        this.stickmanGraphics.lineBetween(x, y - 8, x, y + 20);
        // 手
        this.stickmanGraphics.lineBetween(x, y + 2, x - 12, y + 12);
        this.stickmanGraphics.lineBetween(x, y + 2, x + 12, y + 12);
        // 腿
        this.stickmanGraphics.lineBetween(x, y + 20, x - 10, y + 32);
        this.stickmanGraphics.lineBetween(x, y + 20, x + 10, y + 32);
    }

    update(cursors, pointer, keys) {
        // 基础 WASD 移动
        if (keys.left.isDown) {
            this.setVelocityX(-5);
        } else if (keys.right.isDown) {
            this.setVelocityX(5);
        } else {
            this.setVelocityX(0);
        }
        // 跳跃
        if (keys.up.isDown && this.body.velocity.y === 0) {
            this.setVelocityY(-12);
        }
        // 鼠标朝向（可用于手臂/武器指向）
        if (pointer) {
            this.aimAngle = Phaser.Math.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY);
        }
        // F键切换武器
        if (Phaser.Input.Keyboard.JustDown(keys.switch)) {
            // TODO: 切换武器逻辑
        }
        // 左键攻击
        if (pointer && pointer.isDown) {
            this.attack();
        }
        // 绘制 stickman
        this.drawStickman();
    }

    takeDamage(amount) {
        this.hp = (this.hp || 100) - amount;
        if (this.hp <= 0) {
            this.setTint(0x888888);
            this.setStatic(true);
            this.setVelocity(0, 0);
            this.dead = true;
        }
    }

    pickWeapon(weapon) {
        // 玩家拾取地面武器
        if (this.weapon) {
            // 已有武器，不能直接拾取
            return false;
        }
        this.weapon = weapon;
        weapon.owner = this;
        weapon.setVisible(false); // 隐藏地面武器
        return true;
    }

    switchWeapon(weapon) {
        // 玩家与地面武器交换
        if (!this.weapon) {
            return this.pickWeapon(weapon);
        }
        // 交换
        const oldWeapon = this.weapon;
        this.weapon = weapon;
        weapon.owner = this;
        weapon.setVisible(false);
        // 将原武器放回地面
        oldWeapon.owner = null;
        oldWeapon.setPosition(this.x, this.y + 40);
        oldWeapon.setVisible(true);
        return true;
    }

    attack() {
        // 有武器则用武器攻击，否则空手攻击
        if (this.weapon) {
            this.weapon.attack(this, this.aimAngle);
        } else {
            // TODO: 空手攻击逻辑
        }
    }
} 