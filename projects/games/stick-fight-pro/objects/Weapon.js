// objects/Weapon.js
// 武器对象，支持小刀、手枪、火箭筒

/**
 * @class Weapon
 * @extends Phaser.Physics.Matter.Sprite
 * @description 武器对象，支持拾取、切换、攻击、特效
 */
export default class Weapon extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y, type, options = {}) {
        super(scene.matter.world, x, y, type, undefined, options);
        scene.add.existing(this);
        this.type = type; // "knife" | "pistol" | "rocket"
        // TODO: 初始化武器属性
    }

    attack(owner, angle) {
        switch (this.type) {
            case "knife":
                // 近战攻击，检测前方短距离碰撞
                const range = 50;
                const tx = owner.x + Math.cos(angle) * range;
                const ty = owner.y + Math.sin(angle) * range;
                // 简单判定：遍历场上AI和玩家，若在攻击范围内则造成伤害
                owner.scene.aiPlayers.concat(owner.scene.players).forEach(target => {
                    if (target !== owner && Phaser.Math.Distance.Between(tx, ty, target.x, target.y) < 40) {
                        target.takeDamage(20);
                    }
                });
                break;
            case "pistol":
                // 发射子弹
                owner.scene.spawnBullet(owner.x, owner.y, angle, owner);
                break;
            case "rocket":
                // 发射火箭弹
                owner.scene.spawnRocket(owner.x, owner.y, angle, owner);
                break;
        }
    }
} 