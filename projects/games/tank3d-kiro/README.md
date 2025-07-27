# 3D坦克大战（tank-3d）

## 功能概述

- **现代化UI设置**：支持玩家自定义昵称、坦克颜色、AI数量与难度选择。
- **3D地图与障碍物**：大地图（2000x2000），随机生成障碍物，四周有不可穿越的墙体。
- **坦克控制**：
  - **WASD**：360°无死角移动（机身方向与移动方向无关）
  - **鼠标**：指哪打哪，炮管始终指向鼠标，子弹严格按炮管方向发射
  - **鼠标右键拖动**：可旋转摄像机视角（上帝/驾驶视角均支持）
  - **鼠标滚轮**：可缩放摄像机视角，拉近/拉远观察
- **AI系统**：
  - AI自动选择最近的存活坦克（玩家或AI）为目标
  - AI移动、攻击、瞄准有误差，难度可调
- **碰撞与物理**：
  - 坦克与障碍物/墙体碰撞不可穿越
  - 子弹遇障碍物/墙体反弹，最多存在3秒
- **击杀与胜负判定**：
  - 坦克被击中2次死亡
  - 只剩一个坦克时自动弹窗显示胜利
- **死亡后观战**：
  - 死亡后可用方向键自由旋转视角
- **UI美化**：左上/右上角信息区有圆角、阴影、半透明背景

---

## 高级功能

- **鼠标右键旋转视角**：按住鼠标右键拖动可自由旋转摄像机，支持上帝/驾驶视角。
- **鼠标滚轮缩放**：滚动鼠标滚轮可拉近/拉远摄像机，便于观察全局或细节。

---

## 架构设计（class封装）

本项目采用面向对象的架构，所有核心功能均封装为 class，便于维护、扩展和迁移。
主要分为以下模块：

- **Game**：游戏主控制器，负责场景初始化、主循环、输入管理、UI更新、胜负判定等。
- **Tank**：坦克对象，包含机身、炮塔、炮管、移动、旋转、射击、受击、死亡等行为。
- **Bullet**：子弹对象，负责运动、反弹、碰撞检测、生命周期管理。
- **AIController**：AI行为控制器，管理AI目标选择、移动、射击、难度调整等。
- **Obstacle**：障碍物对象，负责碰撞体积、渲染等。
- **Wall**：地图边界墙体对象，负责碰撞和视觉表现。
- **CameraController**：摄像机控制器，支持视角切换、右键旋转、滚轮缩放、死亡观战等。
- **UIManager**：UI管理器，负责信息区、弹窗、设置面板等UI的更新与美化。

所有 class 尽量解耦，便于单独测试和迁移到其他游戏引擎。

---

## 主要类与模块设计（细化）

### 1. Game
- **属性**：
  - `scene`：three.js 场景对象
  - `camera`：摄像机对象
  - `renderer`：渲染器
  - `player`：玩家 Tank 实例
  - `aiTanks`：AI Tank 实例数组
  - `bullets`：Bullet 实例数组
  - `obstacles`：Obstacle 实例数组
  - `walls`：Wall 实例数组
  - `uiManager`：UIManager 实例
  - `cameraController`：CameraController 实例
- **方法**：
  - `init()`：初始化场景和所有对象
  - `start()`：开始主循环
  - `update()`：每帧更新
  - `handleInput()`：输入管理
  - `checkCollisions()`：统一碰撞检测
  - `checkWin()`：胜负判定
  - `reset()`：重置游戏

### 2. Tank
- **属性**：
  - `group`：three.js Group，坦克整体
  - `base`、`turret`、`barrel`：Mesh
  - `position`、`rotation`：便捷访问
  - `alive`：是否存活
  - `name`：玩家/AI名称
  - `isAI`：是否AI
  - `hitCount`：被击中次数
- **方法**：
  - `move(direction)`：移动
  - `rotate(angle)`：旋转机身
  - `aimAt(target)`：炮管朝向
  - `shoot()`：发射子弹
  - `takeHit()`：受击
  - `die()`：死亡处理
  - `update()`：每帧更新

### 3. Bullet
- **属性**：
  - `mesh`：three.js Mesh
  - `velocity`：速度向量
  - `bornTime`：出生时间
  - `shooter`：发射者
- **方法**：
  - `update()`：运动与反弹
  - `checkCollision(targets)`：与坦克/障碍物/墙体碰撞检测
  - `destroy()`：销毁

### 4. AIController
- **属性**：
  - `tank`：AI控制的Tank实例
  - `game`：Game实例引用
  - `target`：当前攻击目标
  - `difficulty`：难度参数
- **方法**：
  - `chooseTarget()`：选择最近目标
  - `update()`：AI移动、瞄准、射击逻辑

### 5. Obstacle
- **属性**：
  - `mesh`：three.js Mesh
  - `boundingBox`：碰撞体积
- **方法**：
  - `checkCollision(tank)`：与坦克碰撞检测

### 6. Wall
- **属性**：
  - `mesh`：three.js Mesh
  - `boundingBox`：碰撞体积
- **方法**：
  - `checkCollision(tankOrBullet)`：与坦克/子弹碰撞检测

### 7. CameraController
- **属性**：
  - `camera`：three.js Camera
  - `mode`：当前视角模式（上帝/驾驶/观战）
  - `target`：跟随目标
  - `distance`：缩放距离
- **方法**：
  - `update()`：每帧更新摄像机位置
  - `rotateByMouse(dx, dy)`：右键拖动旋转
  - `zoomByWheel(delta)`：滚轮缩放
  - `switchMode()`：切换视角

### 8. UIManager
- **属性**：
  - `playerInfoEl`、`aiInfoEl` 等DOM元素
- **方法**：
  - `updatePlayerInfo()`、`updateAIInfo()`、`showPauseDialog()`、`showWinDialog()`、`beautifyUI()`等

---

## 快速开始

1. 打开 `index.html`，设置昵称、AI数量、难度、颜色，点击“开始游戏”
2. WASD移动，鼠标指哪打哪，左键射击，右键拖动旋转视角，滚轮缩放
3. ESC暂停
4. 死亡后可观战
