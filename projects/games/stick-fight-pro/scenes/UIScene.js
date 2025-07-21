// scenes/UIScene.js
// 游戏UI场景，负责血条、武器栏、剩余玩家数、结算界面等

// 直接用全局 Phaser，无需 import

export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: "UIScene" });
    }

    create() {
        this.graphics = this.add.graphics();
        this.gameScene = this.scene.get("GameScene");
    }

    update() {
        const g = this.graphics;
        g.clear();
        // 显示所有玩家和AI的血条
        const all = (this.gameScene.players || []).concat(this.gameScene.aiPlayers || []);
        all.forEach((p, i) => {
            if (!p.body) return;
            const x = p.body.position.x;
            const y = p.body.position.y - 40;
            const w = 40;
            const h = 6;
            const hp = Math.max(0, Math.min(1, (p.hp || 100) / 100));
            g.fillStyle(0x000000, 0.7);
            g.fillRect(x - w / 2, y - h / 2, w, h);
            g.fillStyle(p.color || 0xffffff, 1);
            g.fillRect(x - w / 2, y - h / 2, w * hp, h);
        });
        // 显示主玩家武器和弹药
        const player = this.gameScene.players && this.gameScene.players[0];
        if (player && player.weapon) {
            g.lineStyle(0);
            g.fillStyle(0x222222, 0.8);
            g.fillRect(20, 20, 180, 36);
            g.fillStyle(0xffffff, 1);
            g.setFontSize && g.setFontSize(18);
            g.setTextAlign && g.setTextAlign("left");
            this.add.text && this.add.text(30, 28, `武器: ${player.weapon.type}  弹药: ${player.weapon.ammo === Infinity ? '∞' : player.weapon.ammo}`, { fontSize: 18, color: "#fff" });
        }
    }
} 