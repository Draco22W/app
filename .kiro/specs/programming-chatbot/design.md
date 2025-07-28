# 设计文档

## 概述

编程助手聊天机器人是一个单页面Web应用，使用纯HTML、CSS和JavaScript实现。应用将集成阿里云通义千问API，提供类似ChatGPT的用户界面体验，专注于编程相关的问答和辅助功能。

## 架构

### 整体架构
- **前端架构**: 单页面应用(SPA)，使用原生JavaScript
- **API集成**: 直接调用阿里云通义千问API
- **数据存储**: 浏览器localStorage用于历史记录
- **部署方式**: 静态文件，可直接在浏览器中打开

### 技术栈
- HTML5 - 页面结构
- CSS3 - 样式和响应式设计
- JavaScript ES6+ - 应用逻辑
- 阿里云通义千问API - AI对话服务

## 组件和接口

### 1. 用户界面组件

#### ChatContainer
- **职责**: 主聊天容器，管理整体布局
- **元素**: 
  - 头部标题栏
  - 消息显示区域
  - 输入区域
  - 控制按钮区域

#### MessageList
- **职责**: 显示对话消息列表
- **功能**:
  - 渲染用户和AI消息
  - 自动滚动到最新消息
  - 支持代码高亮显示
  - 消息时间戳显示

#### MessageInput
- **职责**: 用户输入组件
- **功能**:
  - 多行文本输入
  - 发送按钮
  - 键盘快捷键支持(Ctrl+Enter发送)
  - 输入状态指示

#### ControlPanel
- **职责**: 应用控制面板
- **功能**:
  - 清除历史记录按钮
  - 设置选项
  - 状态指示器

### 2. 核心服务模块

#### APIService
```javascript
class APIService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
  }
  
  async sendMessage(message, conversationHistory) {
    // 调用通义千问API
  }
}
```

#### StorageService
```javascript
class StorageService {
  saveConversation(messages) {
    // 保存到localStorage
  }
  
  loadConversation() {
    // 从localStorage加载
  }
  
  clearConversation() {
    // 清除历史记录
  }
}
```

#### MessageManager
```javascript
class MessageManager {
  constructor() {
    this.messages = [];
    this.maxMessages = 100;
  }
  
  addMessage(message) {
    // 添加消息并管理数量限制
  }
  
  getMessages() {
    // 获取消息列表
  }
}
```

### 3. API接口设计

#### 通义千问API调用
```javascript
const requestBody = {
  model: "qwen-turbo",
  input: {
    messages: [
      {
        role: "system",
        content: "你是一个专业的编程助手，专门帮助开发者解决编程问题。"
      },
      {
        role: "user", 
        content: userMessage
      }
    ]
  },
  parameters: {
    temperature: 0.7,
    max_tokens: 2000
  }
};
```

## 数据模型

### Message模型
```javascript
const Message = {
  id: String,           // 唯一标识
  role: String,         // 'user' | 'assistant'
  content: String,      // 消息内容
  timestamp: Date,      // 发送时间
  status: String        // 'sending' | 'sent' | 'error'
};
```

### Conversation模型
```javascript
const Conversation = {
  id: String,           // 会话ID
  messages: Array,      // Message数组
  createdAt: Date,      // 创建时间
  updatedAt: Date       // 更新时间
};
```

## 错误处理

### API错误处理
1. **网络错误**: 显示重试按钮，允许用户重新发送
2. **认证错误**: 提示API密钥问题
3. **限流错误**: 显示等待提示
4. **服务器错误**: 显示通用错误信息

### 客户端错误处理
1. **存储空间不足**: 自动清理旧消息
2. **JSON解析错误**: 显示数据格式错误提示
3. **网络连接问题**: 显示离线状态

## 测试策略

### 单元测试
- APIService的API调用逻辑
- StorageService的数据存储和检索
- MessageManager的消息管理逻辑
- 工具函数的输入输出验证

### 集成测试
- API调用与UI更新的集成
- 本地存储与消息显示的集成
- 错误处理流程的完整性测试

### 用户界面测试
- 响应式设计在不同屏幕尺寸下的表现
- 用户交互流程的完整性
- 消息发送和接收的用户体验
- 历史记录加载和清除功能

### 性能测试
- 大量消息时的渲染性能
- 本地存储的读写性能
- API调用的响应时间
- 内存使用情况监控

## 用户界面设计

### 设计原则
- **简洁性**: 类似ChatGPT的简洁界面
- **可用性**: 直观的操作流程
- **响应性**: 适配各种设备屏幕
- **可访问性**: 支持键盘导航和屏幕阅读器

### 颜色方案
- 主色调: #10a37f (类似ChatGPT绿色)
- 背景色: #ffffff / #343541 (支持明暗主题)
- 文本色: #353740 / #ececf1
- 边框色: #e5e5e5 / #565869

### 布局结构
```
┌─────────────────────────────────┐
│           标题栏                │
├─────────────────────────────────┤
│                                 │
│         消息显示区域            │
│                                 │
│  [用户消息]          [AI回复]   │
│                                 │
├─────────────────────────────────┤
│  [输入框]              [发送]   │
│  [清除历史]                     │
└─────────────────────────────────┘
```

### 响应式断点
- 移动设备: < 768px
- 平板设备: 768px - 1024px  
- 桌面设备: > 1024px