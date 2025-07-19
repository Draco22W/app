# 环境配置说明

## 数据库配置

项目支持开发环境和生产环境的数据库配置，通过环境变量 `FLASK_ENV` 来控制。

### 开发环境配置
- **密码**: `123123`
- **设置方式**: `FLASK_ENV=development` 或不设置（默认）

### 生产环境配置  
- **密码**: `Qwerqwer0303!`
- **设置方式**: `FLASK_ENV=production`

## 使用方法

### 开发环境运行
```bash
# 方式1：不设置环境变量（默认开发环境）
python api.py

# 方式2：明确设置开发环境
set FLASK_ENV=development  # Windows
export FLASK_ENV=development  # Linux/Mac
python api.py
```

### 生产环境运行
```bash
# Windows
set FLASK_ENV=production
python api.py

# Linux/Mac
export FLASK_ENV=production
python api.py
```

## 配置文件结构

- `config.py` - 包含开发和生产环境的数据库配置
- `api.py` - 主应用文件，通过 `get_db_config()` 函数获取当前环境的配置

## 注意事项

1. 生产环境请确保使用强密码
2. 建议在生产环境中使用环境变量文件（.env）来管理敏感信息
3. 数据库配置中的其他参数（host、port、user、database、charset）在两个环境中保持一致 