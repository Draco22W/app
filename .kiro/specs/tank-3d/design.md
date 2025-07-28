# Design Document

## Overview

3D坦克大战将作为一个完整的单页面应用实现在index.html中，使用Three.js作为3D渲染引擎。整个应用采用面向对象的架构设计，所有功能模块封装为ES6类，确保代码的可维护性和扩展性。

## Architecture

### 技术栈
- **Three.js**: 3D渲染引擎，通过CDN引入
- **HTML5 Canvas**: 渲染目标
- **ES6 Classes**: 面向对象架构
- **CSS3**: 现代化UI样式
- **Web APIs**: 鼠标、键盘事件处理

### 核心架构模式
- **单例模式**: Game类作为全局游戏控制器
- **组合模式**: Tank由多个3D组件组合而成
- **观察者模式**: UI更新响应游戏状态变化
- **策略模式**: AI难度通过不同策略实现

## Components and Interfaces

### 1. Game Class
```javascript
class Game {
  constructor()
  init()           // 初始化场景、渲染器、摄像机
  start()          // 开始游戏循环
  update()         // 每帧更新逻辑
  handleInput()    // 处理用户输入
  checkCollisions() // 碰撞检测
  checkWin()       // 胜负判定
  reset()          // 重置游戏
}
```

### 2. Tank Class
```javascript
class Tank {
  constructor(name, color, isAI)
  createMesh()     // 创建3D模型（机身、炮塔、炮管）
  move(direction)  // WASD移动控制
  rotate(angle)    // 机身旋转
  aimAt(target)    // 炮管瞄准
  shoot()          // 发射子弹
  takeHit()        // 受击处理
  die()            // 死亡处理
  update()         // 每帧更新
}
```

### 3. Bullet Class
```javascript
class Bullet {
  constructor(position, direction, shooter)
  update()         // 运动和反弹逻辑
  checkCollision() // 碰撞检测
  reflect(normal)  // 反弹计算
  destroy()        // 销毁子弹
}
```

### 4. AIController Class
```javascript
class AIController {
  constructor(tank, difficulty)
  chooseTarget()   // 选择最近目标
  calculateMove()  // 计算移动方向
  calculateAim()   // 计算瞄准角度
  addError()       // 根据难度添加误差
  update()         // AI行为更新
}
```

### 5. CameraController Class
```javascript
class CameraController {
  constructor(camera)
  followTarget()   // 跟随目标
  handleMouseRotation() // 右键拖动旋转
  handleZoom()     // 滚轮缩放
  switchToSpectator() // 切换观战模式
  update()         // 摄像机更新
}
```

### 6. UIManager Class
```javascript
class UIManager {
  constructor()
  createSettingsPanel() // 创建设置界面
  updatePlayerInfo()    // 更新玩家信息
  updateAIInfo()        // 更新AI信息
  showWinDialog()       // 显示胜利弹窗
  showPauseMenu()       // 显示暂停菜单
  beautifyElements()    // 美化UI元素
}
```

### 7. Obstacle Class
```javascript
class Obstacle {
  constructor(position, size)
  createMesh()     // 创建3D模型
  getBoundingBox() // 获取碰撞边界
  checkCollision() // 碰撞检测
}
```

### 8. Wall Class
```javascript
class Wall {
  constructor(position, size)
  createMesh()     // 创建墙体模型
  checkCollision() // 碰撞检测
}
```

## Data Models

### Game State
```javascript
{
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  player: Tank,
  aiTanks: Tank[],
  bullets: Bullet[],
  obstacles: Obstacle[],
  walls: Wall[],
  gameState: 'menu' | 'playing' | 'paused' | 'ended',
  settings: {
    playerName: string,
    tankColor: string,
    aiCount: number,
    difficulty: 'easy' | 'medium' | 'hard'
  }
}
```

### Tank State
```javascript
{
  group: THREE.Group,
  base: THREE.Mesh,
  turret: THREE.Group,
  barrel: THREE.Mesh,
  position: THREE.Vector3,
  rotation: number,
  turretRotation: number,
  alive: boolean,
  hitCount: number,
  name: string,
  color: string,
  isAI: boolean,
  lastShootTime: number
}
```

### Input State
```javascript
{
  keys: {
    w: boolean, a: boolean, s: boolean, d: boolean,
    esc: boolean, arrows: boolean[]
  },
  mouse: {
    x: number, y: number,
    leftPressed: boolean,
    rightPressed: boolean,
    rightDragging: boolean,
    lastX: number, lastY: number
  }
}
```

## Error Handling

### 碰撞检测错误处理
- 使用Three.js的Raycaster进行精确碰撞检测
- 边界检查防止坦克移出地图
- 子弹反弹角度计算异常处理

### 渲染错误处理
- WebGL上下文丢失恢复
- 资源加载失败回退
- 性能监控和帧率优化

### 用户输入错误处理
- 非法设置值验证
- 鼠标事件边界检查
- 键盘事件冲突处理

## Testing Strategy

### 单元测试重点
- Tank移动和旋转逻辑
- 子弹轨迹和反弹计算
- AI目标选择算法
- 碰撞检测准确性

### 集成测试重点
- 游戏循环性能
- 多坦克交互
- UI状态同步
- 摄像机控制流畅性

### 用户体验测试
- 不同难度AI行为
- 控制响应性
- 视觉效果质量
- 界面易用性

## Performance Considerations

### 渲染优化
- 使用Three.js的几何体合并减少draw calls
- 实现视锥剔除优化
- 纹理和材质复用
- 阴影和光照优化

### 内存管理
- 及时销毁不用的3D对象
- 子弹对象池复用
- 事件监听器清理
- 纹理内存管理

### 计算优化
- AI决策频率控制
- 碰撞检测空间分割
- 物理计算时间步长优化
- 批量更新减少重绘

## Implementation Details

### 3D模型创建
- 坦克使用基础几何体组合（BoxGeometry, CylinderGeometry）
- 障碍物使用随机大小的BoxGeometry
- 地面使用PlaneGeometry with texture
- 墙体使用BoxGeometry围绕地图边界

### 物理系统
- 简化的2D物理在3D空间中实现
- 基于AABB的碰撞检测
- 子弹反弹使用向量反射公式
- 坦克移动使用速度向量

### 控制系统
- WASD映射到世界坐标系移动
- 鼠标位置转换为3D世界坐标
- 右键拖动转换为摄像机旋转
- 滚轮事件转换为摄像机距离调整