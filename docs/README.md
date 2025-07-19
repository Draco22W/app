# 游戏平台项目

一个类似Steam的游戏平台，包含多个小游戏和用户系统。

## 🚀 快速启动

### Windows用户
双击运行 `start_services.bat` 即可一键启动所有服务

### Linux/Mac用户
```bash
chmod +x start_services.sh
./start_services.sh
```

## 📁 项目结构

```
app/
├── start_services.bat          # Windows一键启动脚本
├── start_services.sh           # Linux/Mac一键启动脚本
├── stop_services.bat           # Windows停止服务脚本
├── projects/
│   ├── home/                   # 游戏平台主页
│   │   └── index.html
│   ├── games/                  # 游戏目录
│   │   ├── guess-thing/        # 猜物品游戏
│   │   ├── snake/              # 贪吃蛇游戏
│   │   └── whack/              # 打地鼠游戏
│   ├── blogs/                  # 博客项目
│   └── back-end-api/           # 后端API服务
│       ├── api.py
│       ├── requirements.txt
│       └── README.md
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

## 🛠️ 手动启动（如果脚本不工作）

### 1. 启动MySQL服务
```bash
# Windows
net start MySQL80

# Linux
sudo systemctl start mysql

# Mac
brew services start mysql
```

### 2. 启动后端API
```bash
cd projects/back-end-api
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python api.py
```

### 3. 打开前端页面
在浏览器中打开 `projects/home/index.html`

## 🌐 访问地址

- **前端页面**：`file:///path/to/projects/home/index.html`
- **后端API**：`http://localhost:5000`

## 📝 使用说明

1. **首次使用**：运行启动脚本，会自动安装依赖和初始化数据库
2. **注册账号**：点击右上角"登录"按钮，选择"注册"
3. **开始游戏**：登录后可以查看游戏列表和详情
4. **自动登录**：注册后30天内无需重复登录

## 🔍 故障排除

### 常见问题

1. **"网络错误，请检查后端服务"**
   - 确保MySQL服务正在运行
   - 确保后端API服务已启动
   - 检查端口5000是否被占用

2. **"数据库连接失败"**
   - 检查MySQL服务状态
   - 确认数据库配置正确
   - 检查用户名和密码

3. **"依赖安装失败"**
   - 检查网络连接
   - 确保Python版本正确
   - 尝试手动安装：`pip install -r requirements.txt`

### 手动检查服务状态

```bash
# 检查MySQL服务
net start | findstr MySQL  # Windows
systemctl status mysql     # Linux

# 检查API服务
curl http://localhost:5000/api/games
```

## 📞 技术支持

如果遇到问题，请检查：
1. 所有服务是否正常启动
2. 浏览器控制台是否有错误信息
3. 网络连接是否正常

## 🎯 功能特性

- ✅ 用户注册登录系统
- ✅ 自动登录功能
- ✅ 游戏列表展示
- ✅ 游戏详情页面
- ✅ 移动端适配
- ✅ 现代化UI设计
- ✅ 一键启动脚本 