/**
 * @class AIPlayer
 * @extends Player
 * @description AI 火柴人角色，集成简单 AI 行为
 * @param {Phaser.Scene} scene - 游戏场景
 * @param {number} x - 初始 x 坐标
 * @param {number} y - 初始 y 坐标
 * @param {string} texture - 角色贴图
 * @param {object} config - 角色配置
 */
import SimpleAI from "../ai/SimpleAI.js";
import Player from "./Player.js";

class AIPlayer extends Player {
    constructor(scene, x, y, texture, config) {
        super(scene, x, y, texture, config);
        this.ai = new SimpleAI(this);
        this.isAI = true;
    }
    updateAI(delta, context) {
        this.ai.update(delta, context);
        this.update(); // 让 AI 也能物理移动和动画
    }
}
export default AIPlayer; 