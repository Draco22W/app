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
        // TODO: 岩浆动画、与角色碰撞检测
    }
} 