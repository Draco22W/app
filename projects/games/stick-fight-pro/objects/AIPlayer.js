// objects/AIPlayer.js
// AI角色对象，继承Player，具备AI行为

import Player from "./Player.js";

/**
 * @class AIPlayer
 * @extends Player
 * @description AI角色，具备寻路、拾武器、攻击、避障等行为
 */
export default class AIPlayer extends Player {
    constructor(scene, x, y, texture, options = {}) {
        super(scene, x, y, texture, options);
        // TODO: 初始化AI状态、目标等
    }

    update() {
        if (this.dead) return;
        // 简单AI：靠近最近玩家，自动攻击
        const scene = this.scene;
        let target = scene.players[0];
        if (!target || target.dead) return;
        // 移动到玩家附近
        if (target.x < this.x - 10) {
            this.setVelocityX(-3);
        } else if (target.x > this.x + 10) {
            this.setVelocityX(3);
        } else {
            this.setVelocityX(0);
        }
        // 跳跃（简单：如果玩家在上方且AI在地面）
        if (target.y < this.y - 40 && this.body.velocity.y === 0) {
            this.setVelocityY(-10);
        }
        // 自动攻击
        this.aimAngle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
        if (this.weapon) {
            this.attack();
        }
        // 自动拾取地面武器
        scene.weapons.forEach(weapon => {
            if (!weapon.owner && Phaser.Math.Distance.Between(this.x, this.y, weapon.x, weapon.y) < 40) {
                this.switchWeapon(weapon);
            }
        });
    }
} 