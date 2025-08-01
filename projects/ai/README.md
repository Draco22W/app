# 编程助手 - AI聊天机器人

一个专门用于编程辅助的聊天机器人应用，使用阿里云通义千问(Qwen)大模型，提供类似ChatGPT的用户界面体验。

## 功能特性

### 🤖 AI对话
- 集成阿里云通义千问API
- 专业的编程问题解答
- 代码示例和算法解析
- 支持多种编程语言

### 💬 聊天界面
- 类似ChatGPT的现代化界面
- 响应式设计，支持移动设备
- 实时消息显示
- 自动滚动到最新消息

### 📝 代码支持
- 代码语法高亮
- 代码块复制功能
- 行内代码格式化
- 支持多种编程语言

### 💾 数据管理
- 本地存储历史记录
- 导出/导入对话记录
- 自动数据备份
- 存储容量管理

### ⌨️ 快捷键支持
- `Ctrl + Enter`: 发送消息
- `Ctrl + K`: 清除历史记录
- `Ctrl + E`: 导出对话记录
- `Ctrl + I`: 导入对话记录
- `Ctrl + S`: 显示统计信息
- `Ctrl + /`: 显示快捷键帮助
- `Escape`: 取消操作

### 🔧 高级功能
- 模拟模式（用于开发测试）
- 系统诊断工具
- 性能监控
- 网络状态检测
- 错误处理和重试机制

## 使用方法

### 🚀 方法1：全血模式（推荐）
使用代理服务器实现真实API调用，无CORS限制：

**Node.js版本（推荐）：**
1. 确保已安装 [Node.js](https://nodejs.org)
2. 双击运行 `start-proxy.bat`
3. 在浏览器中访问 `http://localhost:3000`
4. 点击网页中的"代理模式"按钮
5. 现在可以使用真实API进行对话了！

**Python版本（备选）：**
1. 确保已安装 [Python](https://python.org)
2. 双击运行 `start-python-proxy.bat`
3. 在浏览器中访问 `http://localhost:3000`
4. 点击网页中的"代理模式"按钮

### 📱 方法2：直接使用（模拟模式）
1. 直接双击打开 `index.html` 文件
2. 系统会自动启用模拟模式
3. 在输入框中输入问题
4. 按 `Ctrl + Enter` 或点击发送按钮

### 🔧 API配置
- 默认使用内置的阿里云API密钥
- 如需更换，请修改 `index.html` 中的 `API_KEY` 变量
- API密钥格式：`sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 💡 使用模式说明

**🎯 代理模式（全血模式）**
- ✅ 真实API调用，回复质量最高
- ✅ 支持所有功能特性
- ✅ 智能缓存，提升响应速度
- ⚠️ 需要启动代理服务器

**🤖 模拟模式**
- ✅ 无需网络，离线可用
- ✅ 智能识别问题类型
- ✅ 包含编程、笑话、聊天等多种回复
- ⚠️ 回复内容预设，不如真实API灵活

## 技术架构

### 前端技术
- **HTML5**: 页面结构
- **CSS3**: 样式和响应式设计
- **JavaScript ES6+**: 应用逻辑
- **原生Web API**: 本地存储、网络请求

### 核心组件
- **MessageManager**: 消息管理器
- **APIService**: API调用服务
- **StorageService**: 本地存储服务
- **ErrorHandler**: 错误处理器
- **NetworkMonitor**: 网络监控器
- **PerformanceMonitor**: 性能监控器

### API集成
- **服务商**: 阿里云通义千问
- **模型**: qwen-turbo
- **协议**: HTTPS REST API
- **格式**: JSON

## 浏览器兼容性

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ⚠️ IE 不支持

## 文件结构

```
projects/ai/
├── index.html          # 主应用文件
├── README.md          # 说明文档
└── .kiro/specs/       # 开发规格文档
    └── programming-chatbot/
        ├── requirements.md  # 需求文档
        ├── design.md       # 设计文档
        └── tasks.md        # 任务列表
```

## 开发说明

### 本地开发
1. 直接在浏览器中打开 `index.html`
2. 启用模拟模式进行功能测试
3. 使用浏览器开发者工具调试

### 测试功能
- 按 `Ctrl + T` 运行端到端测试
- 点击"系统诊断"查看系统状态
- 查看浏览器控制台获取详细日志

### 性能优化
- 消息数量限制：100条
- 存储大小限制：5MB
- 自动清理旧消息
- 内存使用监控

## 故障排除

### 常见问题

**1. CORS错误 / API调用失败**
- ✅ **解决方案**：使用代理模式
- 运行 `start-proxy.bat` 或 `start-python-proxy.bat`
- 在 `http://localhost:3000` 中启用代理模式
- 如果仍有问题，检查防火墙设置

**2. 代理服务器启动失败**
- 检查端口3000是否被占用
- 确保已安装Node.js或Python
- 尝试以管理员身份运行
- 检查网络连接和防火墙设置

**3. 历史记录丢失**
- 检查浏览器是否禁用了localStorage
- 清除浏览器缓存后重试
- 使用导入功能恢复备份

**4. 界面显示异常**
- 刷新页面
- 检查浏览器兼容性
- 禁用浏览器扩展
- 尝试无痕模式

**5. 性能问题**
- 清除历史记录和缓存
- 关闭其他标签页
- 检查系统资源使用情况

**6. 缓存问题**
- 点击"缓存管理"查看缓存状态
- 必要时清空缓存
- 缓存会自动过期（24小时）

### 调试工具
- 系统诊断：显示详细的系统状态
- 性能监控：查看API调用和渲染性能
- 错误日志：记录和分析错误信息
- 网络监控：检测网络连接状态

## 更新日志

### v1.0.0 (2024-01-30)
- ✅ 完整的聊天界面实现
- ✅ 阿里云通义千问API集成
- ✅ 代码高亮和复制功能
- ✅ 本地存储和数据管理
- ✅ 响应式设计支持
- ✅ 键盘快捷键支持
- ✅ 错误处理和重试机制
- ✅ 性能监控和优化
- ✅ 端到端测试套件

## 许可证

本项目仅供学习和个人使用。

## 联系方式

如有问题或建议，请通过以下方式联系：
- 项目仓库：查看相关文档
- 开发者：Kiro AI Assistant