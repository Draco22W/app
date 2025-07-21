// scenes/GameScene.js
// 主游戏场景，负责地图、角色、AI、障碍物、武器、岩浆等核心逻辑

/**
 * @class GameScene
 * @extends Phaser.Scene
 * @description 主游戏场景，包含所有核心玩法元素
 */
import Player from "../objects/Player.js";
import AIPlayer from "../objects/AIPlayer.js";
import Weapon from "../objects/Weapon.js";
import Obstacle from "../objects/Obstacle.js";
import Lava from "../objects/Lava.js";

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
        this.players = [];
        this.aiPlayers = [];
        this.weapons = [];
        this.obstacles = [];
        this.lavas = [];
    }

    preload() {
        // TODO: 预加载资源（如角色、武器、障碍物、岩浆图片等）
    }

    create() {
        // 初始化地图和障碍物
        this.createObstacles();
        // 初始化玩家
        this.createPlayers();
        // 初始化AI
        this.createAIPlayers();
        // 初始化武器
        this.createWeapons();
        // 初始化岩浆
        this.createLavas();
        // 控制器
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = {
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            switch: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F)
        };
    }

    update(time, delta) {
        // 更新玩家
        this.players.forEach(player => {
            player.update(this.cursors, this.input.activePointer, this.keys);
            // 检查与地面武器的碰撞
            this.weapons.forEach(weapon => {
                if (!weapon.owner && Phaser.Math.Distance.Between(player.x, player.y, weapon.x, weapon.y) < 40) {
                    if (Phaser.Input.Keyboard.JustDown(this.keys.switch)) {
                        player.switchWeapon(weapon);
                    }
                }
            });
        });
        // 更新AI
        this.aiPlayers.forEach(ai => ai.update());
        // 更新岩浆
        this.lavas.forEach(lava => lava.update());
    }

    createObstacles() {
        // 示例：生成3个平台障碍物
        const platforms = [
            { x: 640, y: 650, w: 1200, h: 40 }, // 地面
            { x: 400, y: 450, w: 300, h: 30 },
            { x: 900, y: 350, w: 300, h: 30 }
        ];
        platforms.forEach((p, i) => {
            const obs = this.matter.add.rectangle(p.x, p.y, p.w, p.h, { isStatic: true });
            const g = this.add.graphics();
            g.fillStyle(0x888888, 1);
            g.fillRect(p.x - p.w / 2, p.y - p.h / 2, p.w, p.h);
            this.obstacles.push(obs);
        });
    }

    createPlayers() {
        // 只创建1名玩家，出生点居中
        const player = new Player(this, 200, 600, null);
        this.players.push(player);
    }

    createAIPlayers() {
        // 创建最多3名AI，出生点分散
        for (let i = 0; i < 3; i++) {
            const ai = new AIPlayer(this, 1000 - i * 100, 600, null);
            this.aiPlayers.push(ai);
        }
    }

    createWeapons() {
        // 随机生成3个武器，类型随机
        const types = ["knife", "pistol", "rocket"];
        for (let i = 0; i < 3; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const weapon = new Weapon(this, 400 + i * 200, 600, type);
            this.weapons.push(weapon);
        }
    }

    createLavas() {
        // 随机生成1个岩浆，位置在底部
        const lava = new Lava(this, 640, 700, null);
        this.lavas.push(lava);
        // 占位显示
        const g = this.add.graphics();
        g.fillStyle(0xff3300, 1);
        g.fillRect(0, 690, 1280, 30);
    }

    spawnBullet(x, y, angle, owner) {
        // 简单子弹实现
        const speed = 12;
        const bullet = this.matter.add.circle(x, y, 6, { isSensor: true });
        this.matter.body.setVelocity(bullet, { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed });
        const g = this.add.graphics();
        g.fillStyle(0xffff00, 1);
        g.fillCircle(x, y, 6);
        // 子弹碰撞检测
        this.matter.world.on("collisionstart", (event) => {
            event.pairs.forEach(pair => {
                if (pair.bodyA === bullet || pair.bodyB === bullet) {
                    // 检查是否击中AI或玩家
                    this.aiPlayers.concat(this.players).forEach(target => {
                        if (Phaser.Math.Distance.Between(target.x, target.y, bullet.position.x, bullet.position.y) < 20 && target !== owner) {
                            target.takeDamage(30);
                        }
                    });
                    this.matter.world.remove(bullet);
                    g.destroy();
                }
            });
        });
    }

    spawnRocket(x, y, angle, owner) {
        // 简单火箭弹实现
        const speed = 8;
        const rocket = this.matter.add.circle(x, y, 10, { isSensor: true });
        this.matter.body.setVelocity(rocket, { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed });
        const g = this.add.graphics();
        g.fillStyle(0xff6600, 1);
        g.fillCircle(x, y, 10);
        // 火箭弹碰撞检测
        this.matter.world.on("collisionstart", (event) => {
            event.pairs.forEach(pair => {
                if (pair.bodyA === rocket || pair.bodyB === rocket) {
                    // 爆炸范围伤害
                    this.aiPlayers.concat(this.players).forEach(target => {
                        if (Phaser.Math.Distance.Between(target.x, target.y, rocket.position.x, rocket.position.y) < 80 && target !== owner) {
                            target.takeDamage(60);
                        }
                    });
                    this.matter.world.remove(rocket);
                    g.destroy();
                }
            });
        });
    }
}

export default GameScene; 