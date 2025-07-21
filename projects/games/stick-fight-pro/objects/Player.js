// 直接用全局 Phaser，无需 import

export default class Player {
    constructor(scene, x, y, color = 0xffffff) {
        this.scene = scene;
        this.color = color;
        // 头
        this.head = scene.matter.add.circle(x, y - 32, 8, { restitution: 0.2 });
        // 身体
        this.body = scene.matter.add.rectangle(x, y, 8, 32, { restitution: 0.2 });
        // 左上臂/前臂
        this.leftUpperArm = scene.matter.add.rectangle(x - 14, y - 8, 12, 4, { restitution: 0.2 });
        this.leftLowerArm = scene.matter.add.rectangle(x - 26, y - 8, 12, 4, { restitution: 0.2 });
        // 右上臂/前臂
        this.rightUpperArm = scene.matter.add.rectangle(x + 14, y - 8, 12, 4, { restitution: 0.2 });
        this.rightLowerArm = scene.matter.add.rectangle(x + 26, y - 8, 12, 4, { restitution: 0.2 });
        // 左大腿/小腿
        this.leftThigh = scene.matter.add.rectangle(x - 6, y + 24, 6, 12, { restitution: 0.2 });
        this.leftCalf = scene.matter.add.rectangle(x - 6, y + 38, 6, 12, { restitution: 0.2 });
        // 右大腿/小腿
        this.rightThigh = scene.matter.add.rectangle(x + 6, y + 24, 6, 12, { restitution: 0.2 });
        this.rightCalf = scene.matter.add.rectangle(x + 6, y + 38, 6, 12, { restitution: 0.2 });
        // 关节约束
        this.constraints = [
            // 头-身体
            scene.matter.add.constraint(this.head, this.body, 18, 0.6),
            // 身体-左上臂
            scene.matter.add.constraint(this.body, this.leftUpperArm, 16, 0.6),
            // 左上臂-左前臂
            scene.matter.add.constraint(this.leftUpperArm, this.leftLowerArm, 16, 0.6),
            // 身体-右上臂
            scene.matter.add.constraint(this.body, this.rightUpperArm, 16, 0.6),
            // 右上臂-右前臂
            scene.matter.add.constraint(this.rightUpperArm, this.rightLowerArm, 16, 0.6),
            // 身体-左大腿
            scene.matter.add.constraint(this.body, this.leftThigh, 16, 0.6),
            // 左大腿-左小腿
            scene.matter.add.constraint(this.leftThigh, this.leftCalf, 16, 0.6),
            // 身体-右大腿
            scene.matter.add.constraint(this.body, this.rightThigh, 16, 0.6),
            // 右大腿-右小腿
            scene.matter.add.constraint(this.rightThigh, this.rightCalf, 16, 0.6)
        ];
        // 绘制 stickman
        this.graphics = scene.add.graphics();
        this.graphics.setDepth(10);
        this.isOnGround = false;
        // 监听碰撞事件
        scene.matter.world.on("collisionactive", (event) => {
            event.pairs.forEach(pair => {
                if ((pair.bodyA === this.body || pair.bodyB === this.body)) {
                    // 只要有一方是地面/障碍物
                    if ((pair.bodyA.isStatic && pair.bodyA !== this.body) || (pair.bodyB.isStatic && pair.bodyB !== this.body)) {
                        // 判断脚部是否接触
                        if (this.body.position.y < pair.bodyA.position.y || this.body.position.y < pair.bodyB.position.y) {
                            this.isOnGround = true;
                        }
                    }
                }
            });
        });
        scene.matter.world.on("collisionend", (event) => {
            this.isOnGround = false;
        });
    }

    setControl(keys) {
        this.controlKeys = keys;
    }

    setAimTarget(target) {
        this.aimTarget = target;
    }

    setWeapon(weapon) {
        this.weapon = weapon;
    }

    takeDamage(amount) {
        if (this.dead) return;
        this.hp = (this.hp || 100) - amount;
        this._hitTime = Date.now();
        if (this.hp <= 0) {
            this.dead = true;
            this.hp = 0;
        }
    }

    update(pointer) {
        // 玩家控制（仅主玩家）
        if (this.controlKeys) {
            if (this.controlKeys.left.isDown) {
                this.scene.matter.body.setVelocity(this.body, { x: -5, y: this.body.velocity.y });
            } else if (this.controlKeys.right.isDown) {
                this.scene.matter.body.setVelocity(this.body, { x: 5, y: this.body.velocity.y });
            } else {
                this.scene.matter.body.setVelocity(this.body, { x: 0, y: this.body.velocity.y });
            }
            // 跳跃（严格判定）
            if (this.controlKeys.up.isDown && this.isOnGround) {
                this.scene.matter.body.setVelocity(this.body, { x: this.body.velocity.x, y: -12 });
            }
            // F键丢弃武器
            if (this.controlKeys.switch && Phaser.Input.Keyboard.JustDown(this.controlKeys.switch) && this.weapon) {
                this.weapon.detach();
                this.weapon = null;
            }
            // 左键攻击（无论是否有武器）
            if (pointer && pointer.isDown) {
                if (!this._lastAttack || Date.now() - this._lastAttack > 300) {
                    this._lastAttack = Date.now();
                    if (this.weapon) {
                        this.weapon.attack(this);
                    } else {
                        this.punchAttack();
                    }
                }
            }
        } else if (this.aimTarget) {
            // AI靠近主玩家自动攻击（无论是否有武器）
            const dist = Phaser.Math.Distance.Between(this.body.position.x, this.body.position.y, this.aimTarget.body.position.x, this.aimTarget.body.position.y);
            if (dist < 60) {
                if (!this._lastAttack || Date.now() - this._lastAttack > 500) {
                    this._lastAttack = Date.now();
                    if (this.weapon) {
                        this.weapon.attack(this);
                    } else {
                        this.punchAttack();
                    }
                }
            }
        }
        // 手臂朝向
        let aimAngle = 0;
        if (this.controlKeys && pointer) {
            aimAngle = Phaser.Math.Angle.Between(this.body.position.x, this.body.position.y - 12, pointer.worldX, pointer.worldY);
        } else if (this.aimTarget) {
            aimAngle = Phaser.Math.Angle.Between(this.body.position.x, this.body.position.y - 12, this.aimTarget.body.position.x, this.aimTarget.body.position.y);
        }
        // 右上臂/前臂朝向目标
        const armLen = 16;
        const forearmLen = 16;
        this.scene.matter.body.setPosition(this.rightUpperArm, {
            x: this.body.position.x + Math.cos(aimAngle) * armLen,
            y: this.body.position.y - 12 + Math.sin(aimAngle) * armLen
        });
        this.scene.matter.body.setPosition(this.rightLowerArm, {
            x: this.rightUpperArm.position.x + Math.cos(aimAngle) * forearmLen,
            y: this.rightUpperArm.position.y + Math.sin(aimAngle) * forearmLen
        });
        // 绘制 stickman骨架
        const g = this.graphics;
        g.clear();
        // 受击变色
        let color = this.color;
        if (this._hitTime && Date.now() - this._hitTime < 200) {
            color = 0xff0000;
        } else if (this.dead) {
            color = 0x888888;
        }
        g.lineStyle(2, color); // 更细的线条
        // 头
        g.strokeCircle(this.head.position.x, this.head.position.y, 8);
        // 身体
        g.lineBetween(this.head.position.x, this.head.position.y + 8, this.body.position.x, this.body.position.y - 16);
        g.lineBetween(this.body.position.x, this.body.position.y - 16, this.body.position.x, this.body.position.y + 16);
        // 左臂
        g.lineBetween(this.body.position.x, this.body.position.y - 10, this.leftUpperArm.position.x, this.leftUpperArm.position.y);
        g.lineBetween(this.leftUpperArm.position.x, this.leftUpperArm.position.y, this.leftLowerArm.position.x, this.leftLowerArm.position.y);
        // 右臂
        g.lineBetween(this.body.position.x, this.body.position.y - 10, this.rightUpperArm.position.x, this.rightUpperArm.position.y);
        g.lineBetween(this.rightUpperArm.position.x, this.rightUpperArm.position.y, this.rightLowerArm.position.x, this.rightLowerArm.position.y);
        // 左腿
        g.lineBetween(this.body.position.x, this.body.position.y + 16, this.leftThigh.position.x, this.leftThigh.position.y);
        g.lineBetween(this.leftThigh.position.x, this.leftThigh.position.y, this.leftCalf.position.x, this.leftCalf.position.y);
        // 右腿
        g.lineBetween(this.body.position.x, this.body.position.y + 16, this.rightThigh.position.x, this.rightThigh.position.y);
        g.lineBetween(this.rightThigh.position.x, this.rightThigh.position.y, this.rightCalf.position.x, this.rightCalf.position.y);
    }

    punchAttack() {
        // 拳击攻击：检测右手前方短距离碰撞
        const range = 36;
        const angle = Phaser.Math.Angle.Between(
            this.body.position.x,
            this.body.position.y - 12,
            this.rightLowerArm.position.x,
            this.rightLowerArm.position.y
        );
        const tx = this.rightLowerArm.position.x + Math.cos(angle) * range;
        const ty = this.rightLowerArm.position.y + Math.sin(angle) * range;
        const targets = this.scene.players.concat(this.scene.aiPlayers);
        targets.forEach(target => {
            if (target !== this && Phaser.Math.Distance.Between(tx, ty, target.body.position.x, target.body.position.y) < 24) {
                if (!target._lastHit || Date.now() - target._lastHit > 500) {
                    target._lastHit = Date.now();
                    if (typeof target.takeDamage === "function") target.takeDamage(10);
                    // 击退效果
                    const force = 0.08;
                    const fx = Math.cos(angle) * force;
                    const fy = Math.sin(angle) * force;
                    this.scene.matter.body.applyForce(target.body, { x: fx, y: fy });
                    // 粒子特效
                    if (this.scene.emitHitParticle) {
                        this.scene.emitHitParticle(tx, ty, target.color || 0xffffff);
                    }
                }
            }
        });
    }
} 