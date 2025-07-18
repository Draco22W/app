## 游戏开发需求

一个猜物品的游戏，由ai自动生成描述和物品，最大提供描述次数由用户决定
ai使用阿里云的百炼大模型。模型名称使用qwen-plus。
api key使用：sk-fa7bde32774c4c4fa0446d8c84827e2a
ss

## 阿里云大模型请求文档参考：
curl -X POST https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions \
-H "Authorization: Bearer $DASHSCOPE_API_KEY" \
-H "Content-Type: application/json" \
-d '{
    "model": "qwen-plus",
    "messages": [
        {
            "role": "system",
            "content": "You are a helpful assistant."
        },
        {
            "role": "user", 
            "content": "你是谁？"
        }
    ]
}'