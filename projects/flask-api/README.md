# 游戏平台后端API

## 后端启动方式：
localhost  python3 api.py
服务器 FLASK_ENV=production python3 api.py

## 环境要求

- Python 3.7+
- MySQL 5.7+
- pip

## 安装步骤

1. **安装Python依赖**
   ```bash
   pip install -r requirements.txt
   ```

2. **配置MySQL数据库**
   - 确保MySQL服务正在运行
   - 创建数据库：`CREATE DATABASE game_platform;`
   - 修改 `api.py` 中的数据库配置：
     ```python
     DB_CONFIG = {
         'host': 'localhost',
         'port': 3306,
         'user': 'root',
         'password': '你的MySQL密码',  # 修改这里
         'database': 'game_platform',
         'charset': 'utf8mb4'
     }
     ```

3. **运行后端服务**
   ```bash
   python api.py
   ```
   服务将在 `http://localhost:5000` 启动

## API接口

### 用户认证

- `POST /api/register` - 用户注册（用户名 + 手机号）
- `POST /api/login` - 用户登录（用户名 + 手机号）
- `POST /api/auto-login` - 自动登录（验证Token）

### 游戏管理

- `GET /api/games` - 获取游戏列表
- `GET /api/games/<id>` - 获取游戏详情

## 注册登录说明

### 注册流程
1. 用户输入用户名（至少3位）和手机号
2. 系统验证手机号格式（中国手机号：1[3-9]xxxxxxxxx）
3. 检查用户名和手机号是否已被注册
4. 注册成功后自动登录，返回JWT Token

### 登录流程
1. 用户输入用户名和手机号
2. 验证用户名和手机号是否匹配
3. 登录成功后返回JWT Token

### 自动登录
1. 前端保存JWT Token到localStorage
2. 页面加载时自动验证Token有效性
3. Token有效期为30天
4. 自动登录成功后刷新Token

## 数据库结构

### users表
- id: 用户ID
- username: 用户名（唯一）
- phone: 手机号（唯一）
- created_at: 创建时间

### games表
- id: 游戏ID
- title: 游戏标题
- description: 游戏描述
- game_url: 游戏链接
- how_to_play: 游戏玩法
- image_url: 游戏图片
- created_at: 创建时间

### comments表
- id: 评论ID
- game_id: 游戏ID
- user_id: 用户ID
- content: 评论内容
- rating: 评分(1-5)
- created_at: 创建时间

## 前端功能

### 自动登录
- 页面加载时自动检查localStorage中的Token
- 调用自动登录API验证Token有效性
- 自动登录成功后显示用户名
- Token失效时自动清除本地存储

### 用户体验
- 注册成功后自动登录，无需再次输入
- 下次访问网站时自动登录
- 30天内无需重复登录
- 支持手动登出

## 注意事项

- 确保MySQL服务正在运行
- 检查数据库连接配置
- 首次运行会自动创建数据表和示例数据
- 手机号格式验证：1[3-9]xxxxxxxxx
- JWT Token有效期：30天 