import Phaser from "phaser";

export default class Weapon {
    constructor(scene, x, y, type = "knife", color = 0xffff00) {
        this.scene = scene;
        this.type = type;
        this.color = color;
        // 武器物理体
        this.body = scene.matter.add.rectangle(x, y, 32, 8, { restitution: 0.2 });
        // 绑定状态
        this.holder = null;
        // 绘制武器
        this.graphics = scene.add.graphics();
        this.graphics.setDepth(20);
    }

    attachTo(handBody) {
        // 绑定到角色手臂
        this.holder = handBody;
        this.constraint = this.scene.matter.add.constraint(this.body, handBody, 2, 0.9);
    }

    detach() {
        // 解除绑定
        if (this.constraint) {
            this.scene.matter.world.removeConstraint(this.constraint);
            this.constraint = null;
        }
        this.holder = null;
    }

    update() {
        // 跟随手臂移动
        if (this.holder) {
            // 物理约束已自动同步
        }
        // 绘制武器
        const g = this.graphics;
        g.clear();
        g.lineStyle(6, this.color);
        g.strokeRect(
            this.body.position.x - 16,
            this.body.position.y - 4,
            32, 8
        );
    }

    attack(owner) {
        // 近战攻击：检测武器前方短距离碰撞
        const range = 36;
        const angle = Phaser.Math.Angle.Between(
            owner.body.position.x,
            owner.body.position.y - 12,
            this.body.position.x,
            this.body.position.y
        );
        const tx = this.body.position.x + Math.cos(angle) * range;
        const ty = this.body.position.y + Math.sin(angle) * range;
        // 判定所有目标
        const targets = owner.scene.players.concat(owner.scene.aiPlayers);
        targets.forEach(target => {
            if (target !== owner && Phaser.Math.Distance.Between(tx, ty, target.body.position.x, target.body.position.y) < 24) {
                if (!target._lastHit || Date.now() - target._lastHit > 500) {
                    target._lastHit = Date.now();
                    if (typeof target.takeDamage === "function") target.takeDamage(20);
                    // 击退效果
                    const force = 0.13;
                    const fx = Math.cos(angle) * force;
                    const fy = Math.sin(angle) * force;
                    owner.scene.matter.body.applyForce(target.body, { x: fx, y: fy });
                    // 粒子特效
                    if (owner.scene.emitHitParticle) {
                        owner.scene.emitHitParticle(tx, ty, target.color || 0xffffff);
                    }
                }
            }
        });
    }
} 