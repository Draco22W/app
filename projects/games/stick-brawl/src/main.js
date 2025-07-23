import Phaser from "phaser";
import Menu from "./scenes/Menu.js";
import Match from "./scenes/Match.js";

const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 540,
    backgroundColor: "#222",
    parent: "game-container",
    scene: [Menu, Match],
    physics: {
        default: "arcade",
        arcade: { gravity: { y: 1000 }, debug: false }
    }
};

const game = new Phaser.Game(config);
export default game; 