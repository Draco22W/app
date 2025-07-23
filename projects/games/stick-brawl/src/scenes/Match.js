import Phaser from "phaser";
import Player from "../objects/Player.js";
import AIPlayer from "../objects/AIPlayer.js";
import Weapon from "../objects/Weapon.js";
import Platform from "../objects/Platform.js";

class Match extends Phaser.Scene {
    constructor() {
        super({ key: "Match" });
    }
    create() {
        // 1. 创建平台/地图
        this.platforms = [
            new Platform(this, 480, 500, 900, 40),
            new Platform(this, 300, 350, 200, 20),
            new Platform(this, 660, 250, 200, 20)
        ];
        // 2. 创建玩家和AI
        this.players = [
            new Player(this, 200, 300, "player", {}),
            new AIPlayer(this, 400, 300, "ai", {}),
            new AIPlayer(this, 600, 300, "ai", {}),
            new AIPlayer(this, 800, 300, "ai", {})
        ];
        // 3. 创建武器
        this.weapons = [
            new Weapon(this, 350, 320, "gun"),
            new Weapon(this, 700, 220, "gun")
        ];
        // 4. 物理分组
        this.physics.add.collider(this.players.map(p=>p.sprite), this.platforms.map(p=>p.sprite));
        this.physics.add.collider(this.weapons.map(w=>w.sprite), this.platforms.map(p=>p.sprite));
        this.physics.add.collider(this.players.map(p=>p.sprite), this.weapons.map(w=>w.sprite), this.handlePickup, null, this);
        // 5. 胜负判定
        this.gameOver = false;
    }
    handlePickup(playerSprite, weaponSprite) {
        const player = this.players.find(p => p.sprite === playerSprite);
        const weapon = this.weapons.find(w => w.sprite === weaponSprite);
        if (player && weapon && !player.hasWeapon() && !weapon.heldBy) {
            player.pickupWeapon(weapon);
        }
    }
    update(time, delta) {
        if (this.gameOver) return;
        // 更新所有玩家/AI
        for (const p of this.players) {
            if (p.isAI && p.updateAI) {
                p.updateAI(delta, { players: this.players, weapons: this.weapons, platforms: this.platforms });
            } else if (p.update) {
                p.update();
            }
        }
        // 检查掉落出界
        for (const p of this.players) {
            if (p.sprite.y > 600 && !this.gameOver) {
                p.sprite.setVisible(false);
                p.sprite.body.enable = false;
            }
        }
        // 判断剩余存活者
        const alive = this.players.filter(p => p.sprite.visible);
        if (alive.length === 1 && !this.gameOver) {
            this.gameOver = true;
            this.add.text(400, 200, `胜者: ${alive[0].isAI ? "AI" : "玩家"}`, { fontSize: 40, color: "#0f0" });
            this.time.delayedCall(2000, () => this.scene.start("Menu"));
        }
    }
}
export default Match; 