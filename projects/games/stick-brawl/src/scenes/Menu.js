import Phaser from "phaser";

class Menu extends Phaser.Scene {
    constructor() {
        super({ key: "Menu" });
    }
    create() {
        this.add.text(400, 200, "Stick Brawl", { fontSize: 48, color: "#fff" });
        const startBtn = this.add.text(420, 300, "开始游戏", { fontSize: 32, color: "#0f0" })
            .setInteractive()
            .on("pointerdown", () => this.scene.start("Match"));
    }
}
export default Menu; 