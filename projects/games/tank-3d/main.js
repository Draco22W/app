console.log('main.js loaded');
// 主入口，初始化three.js场景和UI逻辑
/**
 * @file main.js
 * @description 初始化three.js场景、摄像机、光源、地面、边界和UI面板逻辑
 */

let renderer = null, scene = null, camera = null;
let animationId = null;
let playerState = { hits: 0, alive: true };
let playerTank = null;
let moveState = { w: false, a: false, s: false, d: false };
let mouse = { x: 0, y: 0 };
let tankSpeed = 2.2;
let tankRotateSpeed = 0.04;
let tankColor = 0x2e8b57;
let playerName = "玩家1";
// 掩体
let obstacles = [];

// 子弹
let bullets = [];
const BULLET_SPEED = 12;
const BULLET_RADIUS = 8;
const BULLET_LIFETIME = 5000; // ms

let aiTanks = [];
let aiStates = [];
let aiCount = 3;
let aiDifficulty = 'normal';
const TANK_HIT_RADIUS = 32;

// AI参数
const AI_CONFIG = {
    easy:   { shootInterval: 1800, dodge: false, aimLead: 0.2 },
    normal: { shootInterval: 1200, dodge: true,  aimLead: 0.5 },
    hard:   { shootInterval: 700,  dodge: true,  aimLead: 1.0 }
};
let aiTimers = [];

// 视角模式
let cameraMode = 'top'; // 'top'高空2D, 'follow'驾驶

// 切换视角快捷键
window.addEventListener('keydown', (e) => {
    if (e.key === 'c' || e.key === 'C') {
        cameraMode = cameraMode === 'top' ? 'follow' : 'top';
    }
});

// 随机生成掩体
function createObstacles(count = 12) {
    obstacles = [];
    for (let i = 0; i < count; i++) {
        let x = Math.random() * 1000 - 500;
        let z = Math.random() * 1000 - 500;
        // 避开中心区域
        if (Math.abs(x) < 150 && Math.abs(z) < 150) {
            x += 200 * Math.sign(x || 1);
            z += 200 * Math.sign(z || 1);
        }
        const w = 60 + Math.random() * 40;
        const h = 60 + Math.random() * 40;
        const d = 60 + Math.random() * 40;
        const geo = new THREE.BoxGeometry(w, h, d);
        const mat = new THREE.MeshPhongMaterial({ color: 0x5a5a5a });
        const box = new THREE.Mesh(geo, mat);
        box.position.set(x, h / 2, z);
        box.castShadow = true;
        box.receiveShadow = true;
        scene.add(box);
        obstacles.push(box);
    }
}

// 创建坦克模型
function createTank(color = 0x2e8b57) {
    const tank = new THREE.Group();
    // 底盘
    const baseGeo = new THREE.BoxGeometry(48, 18, 60);
    const baseMat = new THREE.MeshPhongMaterial({ color });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.castShadow = true;
    base.receiveShadow = true;
    tank.add(base);
    // 炮塔
    const turretGeo = new THREE.CylinderGeometry(16, 16, 12, 32);
    const turretMat = new THREE.MeshPhongMaterial({ color: 0x444 });
    const turret = new THREE.Mesh(turretGeo, turretMat);
    turret.position.y = 15;
    turret.rotation.x = Math.PI / 2;
    tank.add(turret);
    // 炮管
    const barrelGeo = new THREE.CylinderGeometry(4, 4, 48, 16);
    const barrelMat = new THREE.MeshPhongMaterial({ color: 0x888 });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.position.y = 15;
    barrel.position.z = 36;
    barrel.rotation.x = Math.PI / 2;
    barrel.name = "barrel";
    tank.add(barrel);
    tank.userData = { base, turret, barrel };
    return tank;
}

function updateCamera() {
    if (!renderer || !renderer.domElement) return;
    if (cameraMode === 'top') {
        // 高空2D视角
        camera.position.set(0, 120, 220);
        camera.lookAt(0, 0, 0);
    } else if (cameraMode === 'follow' && playerTank && playerState.alive) {
        // 驾驶视角，摄像机跟随坦克
        const tankPos = playerTank.position.clone();
        const tankRot = playerTank.rotation.y;
        // 摄像机在坦克上方偏后
        const camOffset = new THREE.Vector3(0, 38, -60).applyAxisAngle(new THREE.Vector3(0,1,0), tankRot);
        camera.position.copy(tankPos.clone().add(camOffset));
        camera.lookAt(tankPos.x, tankPos.y + 12, tankPos.z);
    }
}

// 生成安全出生点，确保距离足够远
function getSafeSpawn(existing, minDist = 300) {
    let x, z, safe = false, tryCount = 0;
    while (!safe && tryCount < 100) {
        x = Math.random() * 900 - 450;
        z = Math.random() * 900 - 450;
        safe = true;
        for (const pos of existing) {
            if (Math.hypot(pos.x - x, pos.z - z) < minDist) {
                safe = false;
                break;
            }
        }
        tryCount++;
    }
    return { x, z };
}

// 修改createAITanks和玩家出生点
function createAITanks(count = 3, playerSpawn) {
    aiTanks = [];
    aiStates = [];
    const colors = [0x1976d2, 0xd32f2f, 0xfbc02d];
    let spawns = [playerSpawn];
    for (let i = 0; i < count; i++) {
        const spawn = getSafeSpawn(spawns);
        spawns.push(spawn);
        const tank = createTank(colors[i % colors.length], true, `AI${i + 1}`);
        tank.position.set(spawn.x, 9, spawn.z);
        aiTanks.push(tank);
        aiStates.push({ hits: 0, alive: true });
    }
}

function updateTankMovement() {
    if (!playerTank) return;
    if (!playerState.alive) return;
    let moveVec = new THREE.Vector3();
    if (moveState.w) moveVec.z -= 1;
    if (moveState.s) moveVec.z += 1;
    if (moveState.a) moveVec.x -= 1;
    if (moveState.d) moveVec.x += 1;
    if (moveVec.length() > 0) {
        moveVec.normalize();
        if (cameraMode === 'top') {
            // 2D高空视角，旋转方向与移动方向一致
            const angle = Math.atan2(moveVec.x, moveVec.z);
            playerTank.rotation.y = angle;
            playerTank.position.x += Math.sin(angle) * tankSpeed;
            playerTank.position.z += Math.cos(angle) * tankSpeed;
        } else if (cameraMode === 'follow') {
            // 驾驶视角，坦克朝向决定前进方向
            const angle = playerTank.rotation.y;
            const forward = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
            const right = new THREE.Vector3(Math.cos(angle), 0, -Math.sin(angle));
            let move = new THREE.Vector3();
            if (moveState.w) move.add(forward);
            if (moveState.s) move.add(forward.clone().negate());
            if (moveState.a) move.add(right);
            if (moveState.d) move.add(right.clone().negate());
            if (move.length() > 0) {
                move.normalize();
                playerTank.position.add(move.multiplyScalar(tankSpeed));
            }
        }
    }
}

// 驾驶视角下，鼠标左右控制坦克朝向和炮管
let followViewYaw = 0;
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (cameraMode === 'follow' && playerTank && playerState.alive) {
        // 鼠标左右移动控制坦克旋转
        if (typeof window._lastMouseX !== 'undefined') {
            const dx = e.clientX - window._lastMouseX;
            playerTank.rotation.y -= dx * 0.003; // 降低灵敏度
        }
        window._lastMouseX = e.clientX;
    }
});
window.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
        shootBullet();
    }
});

// 高空2D视角下，炮管随鼠标指向地面
function updateBarrelRotation() {
    if (!playerTank) return;
    if (!renderer || !renderer.domElement) return;
    if (cameraMode === 'top') {
        // 屏幕坐标转世界坐标
        const rect = renderer.domElement.getBoundingClientRect();
        const mouseNDC = {
            x: ((mouse.x - rect.left) / rect.width) * 2 - 1,
            y: -((mouse.y - rect.top) / rect.height) * 2 + 1
        };
        // 射线投射到地面
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouseNDC, camera);
        const ground = scene.children.find(obj => obj.geometry instanceof THREE.PlaneGeometry);
        const intersects = raycaster.intersectObject(ground);
        if (intersects && intersects[0]) {
            const point = intersects[0].point;
            const tankPos = playerTank.position.clone();
            const dir = new THREE.Vector3(point.x - tankPos.x, 0, point.z - tankPos.z);
            const angle = Math.atan2(dir.x, dir.z);
            playerTank.userData.barrel.rotation.y = angle - playerTank.rotation.y;
            playerTank.userData.turret.rotation.y = angle - playerTank.rotation.y;
        }
    } else if (cameraMode === 'follow') {
        // 炮管与坦克同向
        playerTank.userData.barrel.rotation.y = 0;
        playerTank.userData.turret.rotation.y = 0;
    }
}

function updatePlayerInfoUI() {
    const playerInfo = document.getElementById('player-info');
    playerInfo.textContent = `玩家：${playerName}  ${playerState.alive ? '存活' : '死亡'}  被击中：${playerState.hits}`;
}
function updateAIInfoUI() {
    const aiInfo = document.getElementById('ai-info');
    let html = '';
    for (let i = 0; i < aiTanks.length; i++) {
        const state = aiStates[i];
        html += `${aiTanks[i].userData.name}：${state.alive ? '存活' : '死亡'} `;
    }
    aiInfo.textContent = html;
}

// 修正子弹发射方向，保证水平发射
function shootBullet(shooter = playerTank) {
    if (!shooter || !shooter.userData || shooter.userData.alive === false) return;
    const barrel = shooter.userData.barrel;
    const worldPos = new THREE.Vector3();
    barrel.getWorldPosition(worldPos);
    // 获取炮管世界方向，只取XZ分量
    let dir = new THREE.Vector3(0, 0, 1);
    dir.applyQuaternion(barrel.getWorldQuaternion(new THREE.Quaternion()));
    dir.y = 0; // 保证水平
    dir.normalize();
    const bulletGeo = new THREE.SphereGeometry(BULLET_RADIUS, 16, 16);
    const bulletMat = new THREE.MeshPhongMaterial({ color: 0xf5e663 });
    const bullet = new THREE.Mesh(bulletGeo, bulletMat);
    bullet.position.copy(worldPos).add(dir.clone().multiplyScalar(32));
    bullet.castShadow = true;
    bullet.userData = {
        velocity: dir.clone().multiplyScalar(BULLET_SPEED),
        born: performance.now(),
        shooter
    };
    scene.add(bullet);
    bullets.push(bullet);
}

function updateBullets() {
    const now = performance.now();
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        // 运动
        bullet.position.add(bullet.userData.velocity);
        // 边界反弹
        let bounced = false;
        if (Math.abs(bullet.position.x) > 600 - BULLET_RADIUS) {
            bullet.position.x = Math.sign(bullet.position.x) * (600 - BULLET_RADIUS);
            bullet.userData.velocity.x *= -1;
            bounced = true;
        }
        if (Math.abs(bullet.position.z) > 600 - BULLET_RADIUS) {
            bullet.position.z = Math.sign(bullet.position.z) * (600 - BULLET_RADIUS);
            bullet.userData.velocity.z *= -1;
            bounced = true;
        }
        // 掩体反弹
        for (const obs of obstacles) {
            const obsBox = new THREE.Box3().setFromObject(obs);
            if (obsBox.containsPoint(bullet.position)) {
                // 简单反弹：根据最近面反弹
                const obsSize = new THREE.Vector3();
                obsBox.getSize(obsSize);
                const obsCenter = new THREE.Vector3();
                obsBox.getCenter(obsCenter);
                const rel = bullet.position.clone().sub(obsCenter);
                if (Math.abs(rel.x) > Math.abs(rel.z)) {
                    bullet.userData.velocity.x *= -1;
                    bullet.position.x += Math.sign(rel.x) * (obsSize.x / 2 + BULLET_RADIUS);
                } else {
                    bullet.userData.velocity.z *= -1;
                    bullet.position.z += Math.sign(rel.z) * (obsSize.z / 2 + BULLET_RADIUS);
                }
                bounced = true;
                break;
            }
        }
        // 反弹时稍作冷却，避免卡在障碍物内
        if (bounced) {
            bullet.userData.lastBounce = now;
        }
        // 5秒后消失
        if (now - bullet.userData.born > BULLET_LIFETIME) {
            scene.remove(bullet);
            bullets.splice(i, 1);
        }
    }
}

function checkBulletTankCollision() {
    // 玩家被AI子弹击中
    for (const ai of aiTanks) {
        if (!ai || !ai.userData || ai.userData.alive === false) continue;
        for (const bullet of bullets) {
            if (bullet.userData.shooter === ai) continue; // AI自己发的子弹不打自己
            if (bullet.userData.shooter === playerTank) continue; // 跳过玩家子弹
            if (ai.position.distanceTo(bullet.position) < TANK_HIT_RADIUS) {
                bullet.userData.born = -999999; // 立即消失
                aiStates[aiTanks.indexOf(ai)].hits++;
                if (aiStates[aiTanks.indexOf(ai)].hits >= 2 && aiStates[aiTanks.indexOf(ai)].alive) {
                    aiStates[aiTanks.indexOf(ai)].alive = false;
                    ai.userData.alive = false;
                    playExplosion(ai.position);
                    fadeOutTank(ai);
                }
                updateAIInfoUI();
            }
        }
    }
    // AI子弹打玩家
    if (playerState.alive) {
        for (const bullet of bullets) {
            if (bullet.userData.shooter === playerTank) continue; // 跳过玩家子弹
            if (playerTank.position.distanceTo(bullet.position) < TANK_HIT_RADIUS) {
                bullet.userData.born = -999999;
                playerState.hits++;
                if (playerState.hits >= 2 && playerState.alive) {
                    playerState.alive = false;
                    playExplosion(playerTank.position);
                    fadeOutTank(playerTank);
                }
                updatePlayerInfoUI();
            }
        }
    }
}

function playExplosion(pos) {
    // 光芒球体
    const glowGeo = new THREE.SphereGeometry(36, 24, 24);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffe066, transparent: true, opacity: 0.7 });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.copy(pos);
    scene.add(glow);
    setTimeout(() => scene.remove(glow), 400);

    // 彩色碎片
    const pieces = [];
    const colors = [0xffe066, 0xff5252, 0x40c4ff, 0x69f0ae, 0xffd740];
    for (let i = 0; i < 18; i++) {
        const geo = new THREE.SphereGeometry(6 + Math.random() * 4, 8, 8);
        const mat = new THREE.MeshPhongMaterial({ color: colors[i % colors.length] });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(pos);
        // 随机速度
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const speed = 6 + Math.random() * 8;
        mesh.userData = {
            velocity: new THREE.Vector3(
                Math.sin(phi) * Math.cos(theta),
                Math.cos(phi),
                Math.sin(phi) * Math.sin(theta)
            ).multiplyScalar(speed),
            born: performance.now()
        };
        scene.add(mesh);
        pieces.push(mesh);
    }
    // 动画更新碎片
    let t = 0;
    function animatePieces() {
        t++;
        const now = performance.now();
        for (const mesh of pieces) {
            mesh.position.add(mesh.userData.velocity);
            // 重力
            mesh.userData.velocity.y -= 0.4;
            // 渐隐
            mesh.material.opacity = Math.max(0, 1 - (now - mesh.userData.born) / 500);
            mesh.material.transparent = true;
        }
        if (t < 30) {
            requestAnimationFrame(animatePieces);
        } else {
            for (const mesh of pieces) scene.remove(mesh);
        }
    }
    animatePieces();
}

// 优化死亡坦克残影渐隐
function fadeOutTank(tank) {
    const meshes = [];
    tank.traverse(obj => {
        if (obj.isMesh) meshes.push(obj);
    });
    let alpha = 1;
    function fade() {
        alpha -= 0.08;
        for (const m of meshes) {
            m.material.transparent = true;
            m.material.opacity = Math.max(0, alpha);
        }
        if (alpha > 0) {
            requestAnimationFrame(fade);
        } else {
            scene.remove(tank);
        }
    }
    fade();
}

// 修正AI移动逻辑，让AI持续主动追击玩家
function updateAITanks() {
    for (let i = 0; i < aiTanks.length; i++) {
        const ai = aiTanks[i];
        if (!ai || !ai.userData || ai.userData.alive === false) continue;
        // 持续追玩家，加最小速度和噪声
        const toPlayer = playerTank.position.clone().sub(ai.position);
        toPlayer.y = 0;
        let dist = toPlayer.length();
        if (dist > 60) {
            toPlayer.normalize();
            // AI即使距离很近也会缓慢移动，避免完全停下
            let speed = 1.2 + Math.random() * 0.3;
            if (dist < 120) speed = 0.3 + Math.random() * 0.2;
            ai.position.add(toPlayer.multiplyScalar(speed));
        }
        // 炮管朝向玩家
        const dir = new THREE.Vector3(playerTank.position.x - ai.position.x, 0, playerTank.position.z - ai.position.z);
        const angle = Math.atan2(dir.x, dir.z);
        ai.rotation.y = angle;
        ai.userData.barrel.rotation.y = 0;
        ai.userData.turret.rotation.y = 0;
        // 定时射击
        if (!aiShootTimers[i]) aiShootTimers[i] = 0;
        aiShootTimers[i] += 16;
        if (aiShootTimers[i] > 1200) {
            shootBullet(ai);
            aiShootTimers[i] = 0;
        }
    }
}

let lastPlayerPos = null;
function getPlayerVelocity() {
    if (!lastPlayerPos) {
        lastPlayerPos = playerTank.position.clone();
        return new THREE.Vector3();
    }
    const vel = playerTank.position.clone().sub(lastPlayerPos);
    lastPlayerPos.copy(playerTank.position);
    return vel;
}

function createAITank(color = 0x1976d2, name = "AI") {
    const tank = createTank(color);
    tank.position.set(Math.random() * 800 - 400, 9, Math.random() * 800 - 400);
    tank.userData.name = name;
    tank.userData.isAI = true;
    tank.userData.alive = true;
    scene.add(tank);
    return tank;
}

function initThree() {
    console.log('initThree running');
    if (window.animationId) cancelAnimationFrame(window.animationId);
    if (renderer && renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
    renderer = null;
    scene = null;
    camera = null;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.id = 'game-canvas';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100vw';
    renderer.domElement.style.height = '100vh';
    renderer.domElement.style.zIndex = '1';
    renderer.domElement.style.background = '#222';
    document.body.insertBefore(renderer.domElement, document.body.firstChild);
    playerState = { hits: 0, alive: true };
    playerTank = null;
    aiTanks = [];
    aiStates = [];
    // 地面
    const groundGeo = new THREE.PlaneGeometry(1200, 1200);
    const groundMat = new THREE.MeshPhongMaterial({ color: 0x3a3f4b });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);
    // 边界
    const borderGeo = new THREE.BoxGeometry(1200, 20, 1200);
    const borderMat = new THREE.MeshBasicMaterial({ color: 0x444, wireframe: true });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.position.y = 10;
    scene.add(border);
    // 玩家坦克
    let spawns = [];
    const playerSpawn = getSafeSpawn(spawns, 350);
    spawns.push(playerSpawn);
    playerTank = createTank(tankColor);
    playerTank.position.set(playerSpawn.x, 9, playerSpawn.z);
    playerTank.rotation.y = 0;
    scene.add(playerTank);
    // 光照
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(200, 400, 200);
    scene.add(dirLight);
    // 摄像机位置
    camera.position.set(0, 300, 300);
    camera.lookAt(0, 0, 0);
    if (renderer) renderer.setSize(window.innerWidth, window.innerHeight);
    console.log('camera position', camera.position);
    console.log('scene children', scene.children.map(obj => obj.type));
    createObstacles(12);
    // 生成玩家和AI出生点
    aiTanks = [];
    aiShootTimers = [];
    for (let i = 0; i < 1; i++) { // 你可调整AI数量
        const aiSpawn = getSafeSpawn(spawns, 350);
        spawns.push(aiSpawn);
        const ai = createAITank(0x1976d2, `AI${i+1}`);
        ai.position.set(aiSpawn.x, 9, aiSpawn.z);
        aiTanks.push(ai);
        aiShootTimers.push(0);
    }
}

function animate() {
    window.animationId = requestAnimationFrame(animate);
    console.log('animate running');
    console.log('scene objects count', scene && scene.children ? scene.children.length : 'no scene');
    updateTankMovement();
    updateBarrelRotation();
    updateBullets();
    updateAITanks();
    checkBulletTankCollision();
    updateCamera();
    if (!renderer || !scene || !camera) return;
    renderer.render(scene, camera);
}

function resize() {
    if (!renderer || !camera || !renderer.domElement) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.width = '100vw';
    renderer.domElement.style.height = '100vh';
}

// UI逻辑
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded');
    const uiPanel = document.getElementById('ui-panel');
    const startBtn = document.getElementById('startBtn');
    const gameInfo = document.getElementById('game-info');
    if (startBtn) {
        startBtn.onclick = () => {
            console.log('startBtn clicked');
            // 防止多次初始化
            startBtn.onclick = null;
            // 终止旧动画循环
            if (window.animationId) cancelAnimationFrame(window.animationId);
            playerName = document.getElementById('playerName').value || '玩家1';
            tankColor = parseInt(document.getElementById('tankColor').value.replace('#', '0x'));
            if (uiPanel) uiPanel.style.display = 'none';
            if (gameInfo) gameInfo.style.display = 'flex';
            initThree();
            console.log('initThree called');
            animate();
        };
    } else {
        console.log('startBtn not found');
    }
    window.addEventListener('resize', resize);
    // 键盘控制
    window.addEventListener('keydown', (e) => {
        if (e.key === 'w') moveState.w = true;
        if (e.key === 'a') moveState.a = true;
        if (e.key === 's') moveState.s = true;
        if (e.key === 'd') moveState.d = true;
    });
    window.addEventListener('keyup', (e) => {
        if (e.key === 'w') moveState.w = false;
        if (e.key === 'a') moveState.a = false;
        if (e.key === 's') moveState.s = false;
        if (e.key === 'd') moveState.d = false;
    });
}); 