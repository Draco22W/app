from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql
from pymysql.cursors import DictCursor
import hashlib
import jwt
import datetime
import os
import re

app = Flask(__name__)
CORS(app)

# 配置
app.config['SECRET_KEY'] = 'your-secret-key-here'
DB_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': '',  # 请设置你的MySQL密码
    'database': 'game_platform',
    'charset': 'utf8mb4'
}

# 数据库连接
def get_db_connection():
    try:
        connection = pymysql.connect(**DB_CONFIG)
        return connection
    except Exception as e:
        print(f"数据库连接失败: {e}")
        return None

# 初始化数据库
def init_database():
    connection = get_db_connection()
    if not connection:
        return
    
    try:
        with connection.cursor() as cursor:
            # 创建用户表 - 修改为包含手机号
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    phone VARCHAR(20) UNIQUE NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # 创建游戏表
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS games (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(100) NOT NULL,
                    description TEXT,
                    game_url VARCHAR(255),
                    how_to_play TEXT,
                    image_url VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # 创建评论表
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS comments (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    game_id INT,
                    user_id INT,
                    content TEXT,
                    rating INT CHECK (rating >= 1 AND rating <= 5),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (game_id) REFERENCES games(id),
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """)
            
            # 插入示例游戏数据
            cursor.execute("SELECT COUNT(*) FROM games")
            result = cursor.fetchone()
            if result and result[0] == 0:
                sample_games = [
                    {
                        'title': '猜物品游戏',
                        'description': '一个有趣的AI猜物品游戏，通过描述猜测物品，考验你的推理能力！',
                        'game_url': '/projects/games/guess-thing/index.html',
                        'how_to_play': '1. 设置最大描述次数\n2. 点击开始游戏\n3. 根据AI提供的描述猜测物品\n4. 可以请求更多描述\n5. 输入你的答案并提交',
                        'image_url': '/projects/games/guess-thing/preview.jpg'
                    },
                    {
                        'title': '贪吃蛇',
                        'description': '经典贪吃蛇游戏，控制蛇吃食物成长，避免撞墙或撞到自己！',
                        'game_url': '/projects/games/snake/index.html',
                        'how_to_play': '1. 使用方向键控制蛇的移动\n2. 吃食物让蛇变长\n3. 避免撞墙或撞到自己\n4. 挑战更高分数',
                        'image_url': '/projects/games/snake/preview.jpg'
                    },
                    {
                        'title': '打地鼠',
                        'description': '考验反应速度的打地鼠游戏，快速点击出现的地鼠获得分数！',
                        'game_url': '/projects/games/whack/index.html',
                        'how_to_play': '1. 地鼠会随机从洞里出现\n2. 快速点击地鼠获得分数\n3. 注意时间限制\n4. 挑战更高分数',
                        'image_url': '/projects/games/whack/preview.jpg'
                    }
                ]
                
                for game in sample_games:
                    cursor.execute("""
                        INSERT INTO games (title, description, game_url, how_to_play, image_url)
                        VALUES (%s, %s, %s, %s, %s)
                    """, (game['title'], game['description'], game['game_url'], 
                          game['how_to_play'], game['image_url']))
        
        connection.commit()
        print("数据库初始化完成")
        
    except Exception as e:
        print(f"数据库初始化失败: {e}")
    finally:
        connection.close()

# JWT token生成
def generate_token(user_id, username, phone):
    payload = {
        'user_id': user_id,
        'username': username,
        'phone': phone,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30)  # 30天有效期
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

# JWT token验证
def verify_token(token):
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload
    except:
        return None

# 验证手机号格式
def validate_phone(phone):
    # 中国手机号格式验证
    pattern = r'^1[3-9]\d{9}$'
    return re.match(pattern, phone) is not None

# 注册API
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        phone = data.get('phone')
        
        if not username or not phone:
            return jsonify({'success': False, 'message': '用户名和手机号不能为空'}), 400
        
        if len(username) < 3:
            return jsonify({'success': False, 'message': '用户名至少3位'}), 400
        
        if not validate_phone(phone):
            return jsonify({'success': False, 'message': '请输入正确的手机号格式'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'success': False, 'message': '数据库连接失败'}), 500
        
        with connection.cursor() as cursor:
            # 检查用户名是否已存在
            cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
            if cursor.fetchone():
                return jsonify({'success': False, 'message': '用户名已存在'}), 400
            
            # 检查手机号是否已存在
            cursor.execute("SELECT id FROM users WHERE phone = %s", (phone,))
            if cursor.fetchone():
                return jsonify({'success': False, 'message': '手机号已被注册'}), 400
            
            # 创建新用户
            cursor.execute("INSERT INTO users (username, phone) VALUES (%s, %s)", 
                         (username, phone))
            user_id = cursor.lastrowid
            connection.commit()
            
            # 生成token
            token = generate_token(user_id, username, phone)
            
            return jsonify({
                'success': True,
                'message': '注册成功',
                'token': token,
                'user': {'id': user_id, 'username': username, 'phone': phone}
            })
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'注册失败: {str(e)}'}), 500
    finally:
        if connection:
            connection.close()

# 登录API
@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        phone = data.get('phone')
        
        if not username or not phone:
            return jsonify({'success': False, 'message': '用户名和手机号不能为空'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'success': False, 'message': '数据库连接失败'}), 500
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, username, phone FROM users WHERE username = %s AND phone = %s", 
                         (username, phone))
            user = cursor.fetchone()
            
            if not user:
                return jsonify({'success': False, 'message': '用户名或手机号错误'}), 401
            
            # 生成token
            token = generate_token(user[0], user[1], user[2])
            
            return jsonify({
                'success': True,
                'message': '登录成功',
                'token': token,
                'user': {'id': user[0], 'username': user[1], 'phone': user[2]}
            })
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'登录失败: {str(e)}'}), 500
    finally:
        if connection:
            connection.close()

# 自动登录API
@app.route('/api/auto-login', methods=['POST'])
def auto_login():
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({'success': False, 'message': 'Token不能为空'}), 400
        
        # 验证token
        payload = verify_token(token)
        if not payload:
            return jsonify({'success': False, 'message': 'Token已过期或无效'}), 401
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'success': False, 'message': '数据库连接失败'}), 500
        
        with connection.cursor() as cursor:
            # 验证用户是否还存在
            cursor.execute("SELECT id, username, phone FROM users WHERE id = %s", (payload['user_id'],))
            user = cursor.fetchone()
            
            if not user:
                return jsonify({'success': False, 'message': '用户不存在'}), 401
            
            # 生成新token
            new_token = generate_token(user[0], user[1], user[2])
            
            return jsonify({
                'success': True,
                'message': '自动登录成功',
                'token': new_token,
                'user': {'id': user[0], 'username': user[1], 'phone': user[2]}
            })
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'自动登录失败: {str(e)}'}), 500
    finally:
        if connection:
            connection.close()

# 获取游戏列表API
@app.route('/api/games', methods=['GET'])
def get_games():
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'success': False, 'message': '数据库连接失败'}), 500
        
        with connection.cursor(DictCursor) as cursor:
            cursor.execute("""
                SELECT g.*, 
                       COUNT(c.id) as comment_count,
                       AVG(c.rating) as avg_rating
                FROM games g
                LEFT JOIN comments c ON g.id = c.game_id
                GROUP BY g.id
                ORDER BY g.created_at DESC
            """)
            games = cursor.fetchall()
            
            # 处理评分
            for game in games:
                if game.get('avg_rating'):
                    game['avg_rating'] = round(float(game['avg_rating']), 1)
                else:
                    game['avg_rating'] = 0
                game['comment_count'] = int(game.get('comment_count', 0))
            
            return jsonify({
                'success': True,
                'games': games
            })
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'获取游戏列表失败: {str(e)}'}), 500
    finally:
        if connection:
            connection.close()

# 获取游戏详情API
@app.route('/api/games/<int:game_id>', methods=['GET'])
def get_game_detail(game_id):
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'success': False, 'message': '数据库连接失败'}), 500
        
        with connection.cursor(DictCursor) as cursor:
            # 获取游戏信息
            cursor.execute("SELECT * FROM games WHERE id = %s", (game_id,))
            game = cursor.fetchone()
            
            if not game:
                return jsonify({'success': False, 'message': '游戏不存在'}), 404
            
            # 获取评论
            cursor.execute("""
                SELECT c.*, u.username
                FROM comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.game_id = %s
                ORDER BY c.created_at DESC
            """, (game_id,))
            comments = cursor.fetchall()
            
            return jsonify({
                'success': True,
                'game': game,
                'comments': comments
            })
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'获取游戏详情失败: {str(e)}'}), 500
    finally:
        if connection:
            connection.close()

if __name__ == '__main__':
    # 初始化数据库
    init_database()
    
    # 启动服务器
    app.run(debug=True, host='0.0.0.0', port=5000)
