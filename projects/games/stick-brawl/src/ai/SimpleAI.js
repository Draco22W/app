/**
 * @class SimpleAI
 * @description 简单 AI 行为决策模块
 * @param {AIPlayer} aiPlayer - 绑定的 AI 角色对象
 */
class SimpleAI {
    constructor(aiPlayer) {
        this.aiPlayer = aiPlayer;
        this.actionCooldown = 0; // 行为决策间隔
    }

    /**
     * AI 行为主循环
     * @param {number} delta - 时间增量
     * @param {object} context - { players, weapons, platforms }
     */
    update(delta, context) {
        this.actionCooldown -= delta;
        if (this.actionCooldown > 0) return;
        this.actionCooldown = 150; // 每 150ms 决策一次

        // 1. 避开边缘/障碍
        if (this.isNearEdge(context.platforms)) {
            this.aiPlayer.jump();
            return;
        }

        // 2. 拾取最近武器
        const weapon = this.findNearestWeapon(context.weapons);
        if (weapon && !this.aiPlayer.hasWeapon()) {
            this.moveTo(weapon.x);
            return;
        }

        // 3. 追击最近玩家
        const target = this.findNearestPlayer(context.players);
        if (target) {
            if (this.isNear(target)) {
                this.aiPlayer.attack();
            } else {
                this.moveTo(target.x);
            }
        }
    }

    /**
     * 判断是否靠近平台边缘
     * @param {Array} platforms
     * @returns {boolean}
     */
    isNearEdge(platforms) {
        // 简化：检测当前 x 是否接近平台边界
        // 实际可用碰撞体或平台数据优化
        const { x } = this.aiPlayer;
        for (const pf of platforms) {
            if (x < pf.x + 30 || x > pf.x + pf.width - 30) {
                return true;
            }
        }
        return false;
    }

    /**
     * 查找最近的武器
     * @param {Array} weapons
     * @returns {object|null}
     */
    findNearestWeapon(weapons) {
        let minDist = Infinity, nearest = null;
        for (const w of weapons) {
            const d = Math.abs(this.aiPlayer.x - w.x);
            if (d < minDist) {
                minDist = d;
                nearest = w;
            }
        }
        return nearest;
    }

    /**
     * 查找最近的玩家（排除自己和 AI）
     * @param {Array} players
     * @returns {object|null}
     */
    findNearestPlayer(players) {
        let minDist = Infinity, nearest = null;
        for (const p of players) {
            if (p === this.aiPlayer || p.isAI) continue;
            const d = Math.abs(this.aiPlayer.x - p.x);
            if (d < minDist) {
                minDist = d;
                nearest = p;
            }
        }
        return nearest;
    }

    /**
     * 判断是否靠近目标
     * @param {object} target
     * @returns {boolean}
     */
    isNear(target) {
        return Math.abs(this.aiPlayer.x - target.x) < 40;
    }

    /**
     * 控制 AI 左右移动
     * @param {number} targetX
     */
    moveTo(targetX) {
        if (this.aiPlayer.x < targetX - 5) {
            this.aiPlayer.moveRight();
        } else if (this.aiPlayer.x > targetX + 5) {
            this.aiPlayer.moveLeft();
        } else {
            this.aiPlayer.stop();
        }
    }
}

export default SimpleAI; 