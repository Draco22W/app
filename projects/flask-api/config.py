import os

# 开发环境配置
DEV_DB_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': '123123',
    'database': 'game_platform',
    'charset': 'utf8mb4'
}

# 生产环境配置
PROD_DB_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': 'Qwerqwer0303!',
    'database': 'game_platform',
    'charset': 'utf8mb4'
}

# 根据环境变量选择配置
def get_db_config():
    """根据环境变量返回对应的数据库配置"""
    env = os.getenv('FLASK_ENV', 'development')
    
    if env == 'production':
        return PROD_DB_CONFIG
    else:
        return DEV_DB_CONFIG 