#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI编程助手 - Python代理服务器
解决CORS跨域问题，实现真实API调用
"""

import http.server
import socketserver
import json
import urllib.request
import urllib.parse
import urllib.error
import os
from urllib.parse import urlparse, parse_qs

PORT = 3000
API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-DashScope-SSE')
        super().end_headers()

    def do_OPTIONS(self):
        """处理预检请求"""
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        """处理POST请求"""
        if self.path == '/api/proxy':
            self.handle_api_proxy()
        else:
            self.send_error(404, "Not Found")

    def handle_api_proxy(self):
        """处理API代理请求"""
        try:
            # 读取请求体
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            # 构建API请求
            headers = {
                'Content-Type': 'application/json',
                'Authorization': request_data['headers']['Authorization'],
                'X-DashScope-SSE': 'disable'
            }
            
            api_data = json.dumps(request_data['body']).encode('utf-8')
            
            # 创建请求
            req = urllib.request.Request(API_URL, data=api_data, headers=headers, method='POST')
            
            # 发送请求
            with urllib.request.urlopen(req, timeout=30) as response:
                response_data = response.read()
                
                # 返回响应
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(response_data)
                
        except urllib.error.HTTPError as e:
            print(f"API请求错误: {e.code} - {e.reason}")
            self.send_response(e.code)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            error_response = json.dumps({
                'error': f'API请求失败: {e.reason}',
                'code': e.code
            }).encode('utf-8')
            self.wfile.write(error_response)
            
        except Exception as e:
            print(f"代理服务器错误: {str(e)}")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            error_response = json.dumps({
                'error': f'服务器内部错误: {str(e)}'
            }).encode('utf-8')
            self.wfile.write(error_response)

    def log_message(self, format, *args):
        """自定义日志格式"""
        print(f"[{self.log_date_time_string()}] {format % args}")

def main():
    """启动代理服务器"""
    print("=" * 50)
    print("    AI编程助手 - Python代理服务器")
    print("=" * 50)
    print()
    
    try:
        # 切换到脚本所在目录
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
        
        # 创建服务器
        with socketserver.TCPServer(("", PORT), CORSHTTPRequestHandler) as httpd:
            print(f"🚀 代理服务器已启动")
            print(f"📱 访问地址: http://localhost:{PORT}")
            print(f"🔗 API代理: http://localhost:{PORT}/api/proxy")
            print(f"⏹️  按 Ctrl+C 停止服务器")
            print()
            print("使用说明:")
            print("1. 在浏览器中访问 http://localhost:3000")
            print("2. 点击网页中的'代理模式'按钮")
            print("3. 现在可以使用真实API进行对话了！")
            print()
            print("=" * 50)
            print()
            
            # 启动服务器
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 正在关闭服务器...")
        print("✅ 服务器已关闭")
    except Exception as e:
        print(f"❌ 启动失败: {str(e)}")
        input("按回车键退出...")

if __name__ == "__main__":
    main()