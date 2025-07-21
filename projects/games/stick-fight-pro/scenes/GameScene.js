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
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
        };
        // 绑定主玩家控制
        if (this.players.length > 0) {
            this.players[0].setControl(this.keys);
        }
        // 粒子特效
        this.particles = this.add.particles(0xffffff);
        this.hitEmitter = this.particles.createEmitter({
            speed: { min: 80, max: 180 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.25, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 300,
            quantity: 8,
            on: false
        });
    }

    update(time, delta) {
        // 更新玩家
        this.players.forEach(player => player.update(this.input.activePointer));
        // 更新AI
        this.aiPlayers.forEach(ai => {
            const target = this.players[0];
            if (!target) return;
            ai.setAimTarget(target);
            // AI移动逻辑
            if (ai.body.position.x < target.body.position.x - 10) {
                this.matter.body.setVelocity(ai.body, { x: 2.5, y: ai.body.velocity.y });
            } else if (ai.body.position.x > target.body.position.x + 10) {
                this.matter.body.setVelocity(ai.body, { x: -2.5, y: ai.body.velocity.y });
            } else {
                this.matter.body.setVelocity(ai.body, { x: 0, y: ai.body.velocity.y });
            }
            if (target.body.position.y < ai.body.position.y - 40 && Math.abs(ai.body.velocity.y) < 1) {
                this.matter.body.setVelocity(ai.body, { x: ai.body.velocity.x, y: -10 });
            }
            ai.update();
        });
        // 更新武器
        this.weapons.forEach(w => w.update());
        // 更新岩浆
        this.lavas.forEach(lava => lava.update());
        // 玩家/AI拾取地面武器
        this.players.concat(this.aiPlayers).forEach(p => {
            if (!p.weapon) {
                this.weapons.forEach(w => {
                    if (!w.holder && Phaser.Math.Distance.Between(p.body.position.x, p.body.position.y, w.body.position.x, w.body.position.y) < 40) {
                        w.attachTo(p.rightLowerArm);
                        p.setWeapon(w);
                    }
                });
            }
        });
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
        // 创建主玩家（白色）
        const player = new Player(this, 200, 600, 0xffffff);
        this.players.push(player);
    }

    createAIPlayers() {
        // 创建3名AI，红、绿、蓝
        const aiColors = [0xff4444, 0x44ff44, 0x4488ff];
        for (let i = 0; i < 3; i++) {
            const ai = new Player(this, 1000 - i * 100, 600, aiColors[i]);
            this.aiPlayers.push(ai);
        }
    }

    createWeapons() {
        // 地面生成3把武器，类型随机
        const types = ["knife", "pistol", "rocket"];
        for (let i = 0; i < 3; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const weapon = new Weapon(this, 400 + i * 200, 600, type, 0xffff00 - i * 0x2222);
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

    emitHitParticle(x, y, color) {
        this.hitEmitter.setPosition(x, y);
        this.hitEmitter.setTint(color);
        this.hitEmitter.explode(8, x, y);
    }
}

export default GameScene; 