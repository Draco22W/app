// main.js
// Phaser 3 游戏主入口，初始化游戏配置和场景

import GameScene from "./scenes/GameScene.js";
import UIScene from "./scenes/UIScene.js";

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: "game-container",
    backgroundColor: "#222",
    physics: {
        default: "matter",
        matter: {
            gravity: { y: 1 },
            debug: false
        }
    },
    scene: [GameScene, UIScene]
};

const game = new Phaser.Game(config); 