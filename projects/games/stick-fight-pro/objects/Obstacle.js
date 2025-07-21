// objects/Obstacle.js
// 障碍物对象，支持平台、箱子、斜坡等

/**
 * @class Obstacle
 * @extends Phaser.Physics.Matter.Sprite
 * @description 障碍物对象，供玩家站立、跳跃、攀爬
 */
export default class Obstacle extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y, texture, options = {}) {
        super(scene.matter.world, x, y, texture, undefined, options);
        scene.add.existing(this);
        // TODO: 初始化障碍物属性
    }
} 