// main.js
/**
 * Trouble Tank 2D Phaser入口
 * 包含：迷宫生成与渲染
 */

const MAZE_ROWS = 15;
const MAZE_COLS = 20;
const CELL_SIZE = 40;

/**
 * 随机生成迷宫（深度优先法）
 * @returns {number[][]} 0为通路，1为墙
 */
function generateMaze(rows, cols) {
    // 初始化全墙
    const maze = Array.from({ length: rows }, () => Array(cols).fill(1));
    function carve(x, y) {
        maze[y][x] = 0;
        const dirs = [ [0, -1], [1, 0], [0, 1], [-1, 0] ];
        Phaser.Utils.Array.Shuffle(dirs);
        for (const [dx, dy] of dirs) {
            const nx = x + dx * 2, ny = y + dy * 2;
            if (ny >= 0 && ny < rows && nx >= 0 && nx < cols && maze[ny][nx] === 1) {
                maze[y + dy][x + dx] = 0;
                carve(nx, ny);
            }
        }
    }
    carve(1, 1);
    return maze;
}

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: "MainScene" });
    }
    preload() {
        // 加载1x1透明图片
        this.load.image('blank', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=');
    }
    create() {
        // 生成迷宫
        this.maze = generateMaze(MAZE_ROWS, MAZE_COLS);
        this.wallGroup = this.physics.add.staticGroup();
        for (let y = 0; y < MAZE_ROWS; y++) {
            for (let x = 0; x < MAZE_COLS; x++) {
                if (this.maze[y][x] === 1) {
                    const wall = this.add.rectangle(
                        x * CELL_SIZE + CELL_SIZE / 2,
                        y * CELL_SIZE + CELL_SIZE / 2,
                        CELL_SIZE, CELL_SIZE,
                        0x888888
                    );
                    this.wallGroup.add(wall);
                }
            }
        }
        // 玩家坦克（用透明sprite做物理体）
        this.player = this.physics.add.sprite(CELL_SIZE * 1.5, CELL_SIZE * 1.5, 'blank')
            .setDisplaySize(32, 32)
            .setCollideWorldBounds(true);
        // AI坦克（用透明sprite做物理体）
        this.ai = this.physics.add.sprite(CELL_SIZE * (MAZE_COLS - 2), CELL_SIZE * (MAZE_ROWS - 2), 'blank')
            .setDisplaySize(32, 32)
            .setCollideWorldBounds(true);
        this.playerTurretColor = 0x2a7;
        this.aiTurretColor = 0xc11;
        this.aiTurretAngle = 0;
        this.aiFireCooldown = 0;
        // 子弹组
        this.bullets = this.physics.add.group();
        // 碰撞
        this.physics.add.collider(this.player, this.wallGroup);
        this.physics.add.collider(this.bullets, this.wallGroup, this.handleBulletBounce, null, this);
        // 键盘输入修正
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        // 鼠标左键发射
        this.input.on("pointerdown", (pointer) => {
            if (pointer.button === 0 && this.hasSkill === false && this.skillActive === false) {
                this.handleFire(pointer);
            }
        }, this);
        // 提示
        this.add.text(10, 10, "WASD移动，鼠标瞄准，左键射击", { font: "18px Arial", fill: "#fff" });
        // AI相关初始化
        this.aiTankColor = 0xe33;
        this.aiTurretColor = 0xc11;
        this.aiTurretAngle = 0;
        this.aiFireCooldown = 0;
        this.physics.add.collider(this.ai, this.wallGroup);
        this.physics.add.collider(this.ai, this.player);
        this.aiBullets = this.physics.add.group();
        this.physics.add.collider(this.aiBullets, this.wallGroup, this.handleBulletBounce, null, this);
        this.physics.add.collider(this.aiBullets, this.player, this.handlePlayerHit, null, this);
        // 美化UI：顶部信息栏
        const config = this.game.config;
        this.uiBar = this.add.rectangle(config.width/2, 24, config.width-16, 48, 0x222222, 0.7).setDepth(100);
        this.uiText = this.add.text(32, 12, '', { font: '20px Microsoft YaHei', fill: '#fff' }).setDepth(101);
        // 技能状态
        this.hasSkill = false;
        this.skillActive = false;
        this.skillPath = [];
        // 随机生成技能食物
        this.spawnSkillFood();
        // 只创建一个graphics
        this.graphics = this.add.graphics();
    }
    update() {
        const pointer = this.input.activePointer;
        // 玩家控制
        if (this.player && this.player.body) {
            const speed = 160;
            let pvx = 0, pvy = 0;
            if (this.keyA.isDown) pvx -= speed;
            if (this.keyD.isDown) pvx += speed;
            if (this.keyW.isDown) pvy -= speed;
            if (this.keyS.isDown) pvy += speed;
            this.player.body.setVelocity(pvx, pvy);
            // 炮管朝向
            this.playerTurretAngle = Phaser.Math.Angle.Between(
                this.player.x, this.player.y, pointer.x, pointer.y
            );
        }
        // AI控制
        if (this.ai && this.ai.body && this.player) {
            // 预测玩家子弹反弹路径，提前规避
            let avoidX = 0, avoidY = 0;
            this.bullets.children.iterate(bullet => {
                if (!bullet) return;
                // 预测未来N帧子弹轨迹
                const danger = this.predictBulletDanger(bullet, this.ai.x, this.ai.y, 60);
                if (danger) {
                    avoidX += this.ai.x - danger.x;
                    avoidY += this.ai.y - danger.y;
                }
            });
            let avx = 0, avy = 0;
            if (avoidX !== 0 || avoidY !== 0) {
                // 躲避危险点
                const len = Math.sqrt(avoidX * avoidX + avoidY * avoidY);
                avx = (avoidX / len) * 120;
                avy = (avoidY / len) * 120;
            } else {
                // 追击玩家
                const dx = this.player.x - this.ai.x;
                const dy = this.player.y - this.ai.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                avx = (dx / len) * 120;
                avy = (dy / len) * 120;
            }
            this.ai.body.setVelocity(avx, avy);
            this.aiTurretAngle = Phaser.Math.Angle.Between(this.ai.x, this.ai.y, this.player.x, this.player.y);
            if (this.aiFireCooldown <= 0) {
                this.handleAIFire();
                this.aiFireCooldown = 40;
            } else {
                this.aiFireCooldown--;
            }
        }
        // 子弹生命周期与渲染
        if (this.bullets) {
            this.bullets.children.iterate(bullet => {
                if (!bullet) return;
                bullet.lifespan--;
                if (bullet.lifespan <= 0) bullet.destroy();
            });
        }
        // 技能食物碰撞
        if (this.skillFood && this.player && Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.skillFood.getBounds())) {
            this.hasSkill = true;
            this.skillFood.destroy();
            this.skillFood = null;
        }
        // 技能激活与轨迹绘制
        if (this.hasSkill && pointer.isDown && !this.skillActive && this.player) {
            this.skillActive = true;
            this.skillPath = this.calcSkillPath();
            this.time.delayedCall(200, () => { this.handleSkillEffect(); this.skillActive = false; this.hasSkill = false; }, [], this);
        }
        // UI信息栏内容
        let info = `玩家生命: 1  AI生命: 1`;
        if (this.hasSkill) info += '  |  技能可用：左键释放反弹轨迹';
        if (this.skillActive) info += '  |  技能释放中...';
        if (this.uiText) this.uiText.setText(info);
        // 绘制技能轨迹
        if (this.skillActive && this.skillPath.length > 1) {
            if (!this.skillGraphics) this.skillGraphics = this.add.graphics().setDepth(99);
            this.skillGraphics.clear();
            this.skillGraphics.lineStyle(4, 0x00ffff, 0.8);
            this.skillGraphics.beginPath();
            this.skillGraphics.moveTo(this.player.x, this.player.y);
            for (const pt of this.skillPath) this.skillGraphics.lineTo(pt.x, pt.y);
            this.skillGraphics.strokePath();
        } else if (this.skillGraphics) {
            this.skillGraphics.clear();
        }
        // 绘制所有坦克炮管
        this.graphics.clear();
        if (this.player) this.renderTank(
            this.graphics,
            this.player.x, this.player.y, 0, this.playerTurretAngle,
            0x3a9, this.playerTurretColor
        );
        if (this.ai) this.renderTank(
            this.graphics,
            this.ai.x, this.ai.y, 0, this.aiTurretAngle,
            0xe33, this.aiTurretColor
        );
    }
    /**
     * 预测子弹未来N帧是否威胁到AI
     * @param {Phaser.Physics.Arcade.Sprite} bullet
     * @param {number} aiX
     * @param {number} aiY
     * @param {number} frames
     * @returns {null|{x:number,y:number}} 危险点或null
     */
    predictBulletDanger(bullet, aiX, aiY, frames) {
        let bx = bullet.x, by = bullet.y;
        let vx = bullet.body.velocity.x, vy = bullet.body.velocity.y;
        for (let i = 0; i < frames; i++) {
            bx += vx * (1/60);
            by += vy * (1/60);
            // 检查是否碰到墙体，模拟反弹
            const col = Math.floor(bx / CELL_SIZE);
            const row = Math.floor(by / CELL_SIZE);
            if (row < 0 || row >= MAZE_ROWS || col < 0 || col >= MAZE_COLS) break;
            if (this.maze[row][col] === 1) {
                // 反弹：判断撞击方向
                const prevX = bx - vx * (1/60);
                const prevY = by - vy * (1/60);
                if (Math.floor(prevX / CELL_SIZE) !== col) vx = -vx;
                if (Math.floor(prevY / CELL_SIZE) !== row) vy = -vy;
                // 反弹后修正位置
                bx += vx * (1/60);
                by += vy * (1/60);
            }
            // 判断是否威胁AI
            const dist = Phaser.Math.Distance.Between(bx, by, aiX, aiY);
            if (dist < 28) return { x: bx, y: by };
        }
        return null;
    }
    // 自定义渲染坦克
    renderTank(g, x, y, angle, turretAngle, bodyColor, turretColor) {
        // 只画炮塔和炮管，车体用rectangle
        // 炮塔
        const turretX = x;
        const turretY = y;
        g.fillStyle(turretColor, 1);
        g.fillCircle(turretX, turretY, 9);
        // 炮管
        const gunStartX = x;
        const gunStartY = y;
        const gunEndX = x + Math.cos(turretAngle) * 26;
        const gunEndY = y + Math.sin(turretAngle) * 26;
        g.lineStyle(7, 0xffffff, 1);
        g.beginPath();
        g.moveTo(gunStartX, gunStartY);
        g.lineTo(gunEndX, gunEndY);
        g.strokePath();
    }
    postUpdate() {
        // Phaser没有原生postUpdate，手动在update后渲染坦克
        this.renderTank(
            this.player.x, this.player.y, 0, this.playerTurretAngle,
            this.playerTankColor, this.playerTurretColor
        );
    }
    handleFire(pointer) {
        if (pointer.button === 0 && this.hasSkill === false && this.skillActive === false && this.player) {
            const angle = this.playerTurretAngle;
            const bullet = this.bullets.create(
                this.player.x + Math.cos(angle) * 24,
                this.player.y + Math.sin(angle) * 24,
                null
            );
            bullet.setCircle(4).setSize(8, 8).setVelocity(
                Math.cos(angle) * 400,
                Math.sin(angle) * 400
            );
            bullet.lifespan = 120;
        }
    }
    handleBulletBounce(bullet, wall) {
        // 反弹：判断碰撞方向，反转速度分量
        const prevVel = bullet.body.prev;
        if (Math.abs(prevVel.velocity.x) > Math.abs(prevVel.velocity.y)) {
            bullet.setVelocityX(-bullet.body.velocity.x);
        } else {
            bullet.setVelocityY(-bullet.body.velocity.y);
        }
        // 子弹反弹限制
        if (!bullet.bounceTime) bullet.bounceTime = 0;
        bullet.bounceTime += 1/60;
        if (bullet.bounceTime > 5) bullet.destroy();
    }
    handleAIFire() {
        if (!this.ai) return;
        const angle = this.aiTurretAngle;
        const bullet = this.aiBullets.create(
            this.ai.x + Math.cos(angle) * 24,
            this.ai.y + Math.sin(angle) * 24,
            null
        );
        bullet.setCircle(4).setSize(8, 8).setVelocity(
            Math.cos(angle) * 400,
            Math.sin(angle) * 400
        );
        bullet.lifespan = 120;
    }
    handlePlayerHit(player, bullet) {
        bullet.destroy();
        // 玩家被击中，可扩展为扣血/结束等
    }
    spawnSkillFood() {
        // 随机空地生成技能食物
        let x, y;
        do {
            x = Phaser.Math.Between(1, MAZE_COLS-2);
            y = Phaser.Math.Between(1, MAZE_ROWS-2);
        } while (this.maze[y][x] !== 0);
        this.skillFood = this.add.rectangle(x*CELL_SIZE+CELL_SIZE/2, y*CELL_SIZE+CELL_SIZE/2, 24, 24, 0xffe066).setStrokeStyle(2, 0xffa500);
        this.add.text(this.skillFood.x-10, this.skillFood.y-10, 'S', { font: '18px Arial', fill: '#a60' });
    }
    calcSkillPath() {
        // 以玩家炮管方向为起点，模拟反弹轨迹
        const path = [];
        let x = this.player.x, y = this.player.y;
        let angle = this.playerTurretAngle;
        let vx = Math.cos(angle) * 600, vy = Math.sin(angle) * 600;
        let t = 0;
        while (t < 1.5) { // 最多1.5秒轨迹
            x += vx * (1/60);
            y += vy * (1/60);
            const col = Math.floor(x / CELL_SIZE);
            const row = Math.floor(y / CELL_SIZE);
            if (row < 0 || row >= MAZE_ROWS || col < 0 || col >= MAZE_COLS) break;
            if (this.maze[row][col] === 1) {
                // 反弹
                const prevX = x - vx * (1/60);
                const prevY = y - vy * (1/60);
                if (Math.floor(prevX / CELL_SIZE) !== col) vx = -vx;
                if (Math.floor(prevY / CELL_SIZE) !== row) vy = -vy;
                x += vx * (1/60);
                y += vy * (1/60);
            }
            if (t === 0 || t % 0.1 < 1/60) path.push({ x, y });
            t += 1/60;
        }
        return path;
    }
    handleSkillEffect() {
        if (!this.skillPath) return;
        for (const pt of this.skillPath) {
            if (this.ai && Phaser.Math.Distance.Between(pt.x, pt.y, this.ai.x, this.ai.y) < 24) {
                this.ai.destroy();
                this.ai = null;
            }
            if (this.bullets) {
                this.bullets.children.iterate(bullet => {
                    if (bullet && Phaser.Math.Distance.Between(pt.x, pt.y, bullet.x, bullet.y) < 12) bullet.destroy();
                });
            }
            if (this.aiBullets) {
                this.aiBullets.children.iterate(bullet => {
                    if (bullet && Phaser.Math.Distance.Between(pt.x, pt.y, bullet.x, bullet.y) < 12) bullet.destroy();
                });
            }
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: MAZE_COLS * CELL_SIZE,
    height: MAZE_ROWS * CELL_SIZE,
    backgroundColor: "#444",
    parent: "gameContainer",
    physics: { default: "arcade" },
    scene: [MainScene]
};

const game = new Phaser.Game(config); 