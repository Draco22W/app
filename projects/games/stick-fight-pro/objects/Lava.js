// objects/Lava.js
// 岩浆对象，支持随机生成、碰撞持续掉血

/**
 * @class Lava
 * @extends Phaser.Physics.Matter.Sprite
 * @description 岩浆对象，碰撞持续掉血，支持动画
 */
export default class Lava extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y, texture, options = {}) {
        super(scene.matter.world, x, y, texture, undefined, options);
        scene.add.existing(this);
        // TODO: 初始化岩浆属性
    }

    update() {
        // 检查所有玩家和AI是否碰到岩浆
        const all = this.scene.players.concat(this.scene.aiPlayers);
        all.forEach(p => {
            if (p.dead) return;
            // 判断角色身体或脚是否在岩浆区域
            if (Phaser.Math.Distance.Between(p.body.position.x, p.body.position.y, this.x, this.y) < 80) {
                if (!p._inLava) p._inLava = Date.now();
                if (Date.now() - p._inLava > 400) {
                    if (typeof p.takeDamage === "function") p.takeDamage(10);
                    p._inLava = Date.now();
                }
            } else {
                p._inLava = null;
            }
        });
    }
} 