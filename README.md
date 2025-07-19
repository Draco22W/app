# 游戏平台项目

一个类似Steam的游戏平台，包含多个小游戏和用户系统。

## 🚀 快速启动

### 本地运行

#### Windows用户（推荐使用PowerShell）
```powershell
# 以管理员身份运行PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\scripts\start_services.ps1
```

#### Windows用户（批处理脚本）
```bash
# 以管理员身份运行
scripts\start_services.bat
```

#### Linux/Mac用户
```bash
chmod +x scripts/start_services.sh
./scripts/start_services.sh
```

### 服务器部署

#### 自动部署到服务器
```bash
# Windows用户
scripts\deploy_to_server.bat

# Linux/Mac用户
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

#### 部署后访问
- **服务器地址**: http://101.35.103.216
- **24小时在线运行**
- **支持多人同时访问**

## 📁 项目结构

```
app/
├── 📁 projects/              # 主要项目目录
│   ├── 🏠 home/              # 游戏平台主页
│   ├── 🎮 games/             # 游戏集合
│   │   ├── guess-thing/      # 猜物品游戏
│   │   ├── snake/            # 贪吃蛇游戏
│   │   └── whack/            # 打地鼠游戏
│   ├── 📝 blogs/             # 博客项目
│   └── 🔧 back-end-api/      # 后端API服务
├── 📁 scripts/               # 脚本文件
│   ├── start_services.bat    # Windows启动脚本
│   ├── start_services.sh     # Linux/Mac启动脚本
│   └── stop_services.bat     # Windows停止脚本
├── 📁 docs/                  # 文档目录
│   └── README.md             # 详细文档
├── 📁 config/                # 配置文件
│   └── nginx/                # Nginx配置
└── README.md                 # 项目说明（本文件）
```

## 🎮 游戏列表

1. **猜物品游戏** - AI驱动的猜谜游戏
2. **贪吃蛇** - 经典贪吃蛇游戏  
3. **打地鼠** - 考验反应速度的游戏

## 👤 用户系统

- **注册**：用户名 + 手机号
- **登录**：用户名 + 手机号
- **自动登录**：30天内无需重复登录
- **JWT认证**：安全的用户认证机制

## 🔧 技术栈

### 前端
- HTML5 + CSS3 + JavaScript
- 响应式设计，支持移动端
- 现代化UI设计

### 后端
- Python Flask
- MySQL数据库
- JWT认证
- RESTful API

## 📋 环境要求

- Python 3.7+
- MySQL 5.7+
- 现代浏览器

## 🌐 访问地址

- **前端页面**：`projects/home/index.html`
- **后端API**：`http://localhost:5000`

## 📝 使用说明

1. **首次使用**：运行启动脚本，会自动安装依赖和初始化数据库
2. **注册账号**：点击右上角"登录"按钮，选择"注册"
3. **开始游戏**：登录后可以查看游戏列表和详情
4. **自动登录**：注册后30天内无需重复登录

## 🔍 故障排除

如果遇到问题，请查看 `docs/README.md` 获取详细说明。

## 🎯 功能特性

- ✅ 用户注册登录系统
- ✅ 自动登录功能
- ✅ 游戏列表展示
- ✅ 游戏详情页面
- ✅ 移动端适配
- ✅ 现代化UI设计
- ✅ 一键启动脚本 