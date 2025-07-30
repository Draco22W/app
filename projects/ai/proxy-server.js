const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

// MIME类型映射
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-DashScope-SSE');

    // 处理预检请求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);

    // 健康检查端点
    if (parsedUrl.pathname === '/health' || parsedUrl.pathname === '/api/health') {
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
            status: 'ok',
            message: '代理服务器运行正常',
            timestamp: new Date().toISOString(),
            endpoints: {
                main: 'http://localhost:3000/',
                proxy: 'http://localhost:3000/api/proxy (POST only)',
                test: 'http://localhost:3000/test-proxy.html',
                health: 'http://localhost:3000/health'
            }
        }));
        return;
    }

    // API代理
    if (parsedUrl.pathname === '/api/proxy') {
        console.log('📡 收到API代理请求');
        console.log('📝 请求详情:', {
            method: req.method,
            url: req.url,
            userAgent: req.headers['user-agent'],
            referer: req.headers['referer'],
            origin: req.headers['origin']
        });

        // 只处理POST请求
        if (req.method !== 'POST') {
            console.log('⚠️ 非POST请求，返回方法说明');
            res.writeHead(405, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Allow': 'POST'
            });
            res.end(JSON.stringify({
                error: '此端点仅支持POST请求',
                method: req.method,
                url: req.url,
                hint: '请使用POST方法并在请求体中包含有效的JSON数据',
                note: '这可能是浏览器的预检请求或测试请求，可以忽略'
            }));
            return;
        }

        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('error', (error) => {
            console.error('❌ 请求接收错误:', error.message);
            res.writeHead(500, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ error: '请求接收失败: ' + error.message }));
        });

        req.on('end', () => {
            try {
                console.log('📝 请求体长度:', body.length);
                console.log('📝 请求方法:', req.method);
                console.log('📝 请求头:', JSON.stringify(req.headers, null, 2));

                if (!body || body.trim() === '') {
                    console.error('❌ 请求体为空，可能是预检请求或测试请求');
                    res.writeHead(400, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify({
                        error: '请求体为空',
                        method: req.method,
                        url: req.url,
                        hint: '请确保发送POST请求并包含有效的JSON数据'
                    }));
                    return;
                }

                console.log('📝 请求体内容:', body.substring(0, 300) + (body.length > 300 ? '...' : ''));

                let requestData;
                try {
                    requestData = JSON.parse(body);
                } catch (parseError) {
                    console.error('❌ JSON解析失败:', parseError.message);
                    console.error('❌ 原始数据:', body);
                    throw new Error('JSON格式无效: ' + parseError.message);
                }

                if (!requestData.headers || !requestData.headers.Authorization) {
                    throw new Error('缺少Authorization头');
                }

                console.log('🔑 API密钥:', requestData.headers.Authorization.substring(0, 20) + '...');

                const options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': requestData.headers.Authorization,
                        'X-DashScope-SSE': 'disable'
                    }
                };

                console.log('🚀 发送API请求到:', API_URL);

                const apiReq = https.request(API_URL, options, (apiRes) => {
                    console.log('📥 API响应状态:', apiRes.statusCode);

                    let responseData = '';

                    apiRes.on('data', chunk => {
                        responseData += chunk;
                    });

                    apiRes.on('end', () => {
                        console.log('✅ API响应完成，长度:', responseData.length);
                        console.log('📄 API响应内容预览:', responseData.substring(0, 500) + (responseData.length > 500 ? '...' : ''));
                        
                        // 验证响应是否为有效JSON
                        try {
                            const parsedResponse = JSON.parse(responseData);
                            console.log('✅ API响应JSON格式有效');
                            console.log('📊 响应结构:', Object.keys(parsedResponse));
                        } catch (jsonError) {
                            console.error('❌ API响应不是有效JSON:', jsonError.message);
                        }
                        
                        res.writeHead(apiRes.statusCode, {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        });
                        res.end(responseData);
                    });
                });

                apiReq.on('error', (error) => {
                    console.error('❌ API请求错误:', error.message);
                    res.writeHead(500, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify({ error: 'API请求失败: ' + error.message }));
                });

                const requestBody = JSON.stringify(requestData.body);
                console.log('📤 发送请求体长度:', requestBody.length);

                apiReq.write(requestBody);
                apiReq.end();

            } catch (error) {
                console.error('❌ 解析请求失败:', error.message);
                res.writeHead(400, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({ error: '请求格式错误: ' + error.message }));
            }
        });
        return;
    }

    // 状态页面
    if (parsedUrl.pathname === '/status') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html lang="zh-CN">
            <head>
                <meta charset="UTF-8">
                <title>代理服务器状态</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
                    .status { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 10px 0; }
                    .endpoint { background: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 3px; }
                    .note { background: #fff3cd; color: #856404; padding: 10px; border-radius: 3px; margin: 10px 0; }
                </style>
            </head>
            <body>
                <h1>🚀 AI编程助手代理服务器</h1>
                <div class="status">✅ 服务器运行正常 - ${new Date().toLocaleString()}</div>
                
                <h2>📡 可用端点</h2>
                <div class="endpoint"><strong>主应用:</strong> <a href="/">http://localhost:3000/</a></div>
                <div class="endpoint"><strong>API代理:</strong> http://localhost:3000/api/proxy (仅POST)</div>
                <div class="endpoint"><strong>功能测试:</strong> <a href="/test-proxy.html">http://localhost:3000/test-proxy.html</a></div>
                <div class="endpoint"><strong>健康检查:</strong> <a href="/health">http://localhost:3000/health</a></div>
                <div class="endpoint"><strong>状态页面:</strong> <a href="/status">http://localhost:3000/status</a></div>
                
                <h2>💡 使用说明</h2>
                <div class="note">
                    <p><strong>正常使用流程:</strong></p>
                    <ol>
                        <li>访问主应用: <a href="/">http://localhost:3000/</a></li>
                        <li>确认看到"🚀 代理模式已启用"提示</li>
                        <li>开始与AI对话</li>
                    </ol>
                </div>
                
                <div class="note">
                    <p><strong>如果遇到问题:</strong></p>
                    <ol>
                        <li>先访问测试页面验证功能</li>
                        <li>检查浏览器控制台是否有错误</li>
                        <li>确保使用 http://localhost:3000 而不是 file:// 协议</li>
                    </ol>
                </div>
                
                <p><a href="/">← 返回主应用</a> | <a href="/test-proxy.html">功能测试 →</a></p>
            </body>
            </html>
        `);
        return;
    }

    // 静态文件服务
    let filePath = '.' + parsedUrl.pathname;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - 文件未找到</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`服务器错误: ${error.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 代理服务器已启动`);
    console.log(`📱 访问地址: http://localhost:${PORT}`);
    console.log(`🔗 API代理: http://localhost:${PORT}/api/proxy`);
    console.log(`⏹️  按 Ctrl+C 停止服务器`);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n🛑 正在关闭服务器...');
    server.close(() => {
        console.log('✅ 服务器已关闭');
        process.exit(0);
    });
});