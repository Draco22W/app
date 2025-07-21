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
        // 现代化UI：开始游戏按钮
        this.startPanel = this.add.rectangle(960, 540, 480, 220, 0x222233, 0.95).setDepth(100).setAlpha(0);
        this.startText = this.add.text(960, 500, "Stick Fight Pro", { fontSize: 48, color: "#fff", fontStyle: "bold" }).setOrigin(0.5).setDepth(101).setAlpha(0);
        this.startBtn = this.add.rectangle(960, 600, 220, 60, 0x44ccff, 1).setDepth(101).setInteractive().setAlpha(0);
        this.btnText = this.add.text(960, 600, "开始游戏", { fontSize: 32, color: "#fff" }).setOrigin(0.5).setDepth(102).setAlpha(0);
        // 动画淡入
        this.tweens.add({ targets: [this.startPanel, this.startText, this.startBtn, this.btnText], alpha: 1, duration: 800, ease: "Cubic.easeOut" });
        // 按钮动画
        this.tweens.add({ targets: this.startBtn, scaleX: 1.1, scaleY: 1.1, yoyo: true, repeat: -1, duration: 800, ease: "Sine.easeInOut" });
        // 按钮点击事件
        this.startBtn.on("pointerdown", () => {
            this.tweens.add({ targets: [this.startPanel, this.startText, this.startBtn, this.btnText], alpha: 0, duration: 400, onComplete: () => {
                this.startPanel.setVisible(false);
                this.startText.setVisible(false);
                this.startBtn.setVisible(false);
                this.btnText.setVisible(false);
                this.scene.resume("GameScene");
            }});
        });
        // 初始暂停主场景
        this.scene.pause("GameScene");
    }

    update() {
        const g = this.graphics;
        g.clear();
        // 显示所有玩家和AI的血条
        const all = (this.gameScene.players || []).concat(this.gameScene.aiPlayers || []);
        all.forEach((p, i) => {
            if (!p || !p.body) return;
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
        if (player && player.weapon && typeof player.weapon.type !== 'undefined' && typeof player.weapon.ammo !== 'undefined') {
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