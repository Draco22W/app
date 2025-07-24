import os
import sys
import time
from datetime import datetime
import pyautogui
from PIL import Image
from PyQt5 import QtWidgets, QtGui, QtCore
import shutil

# 指定保存目录
SAVE_DIR = r"D:\screenshots"

# 确保保存目录存在
os.makedirs(SAVE_DIR, exist_ok=True)

# 开机自启动设置
import getpass
import winreg

def add_to_startup():
    """
    将本程序添加到Windows开机自启动（当前用户）。
    """
    exe_path = sys.executable
    script_path = os.path.abspath(__file__)
    # 判断是否为打包exe，否则用pythonw启动
    if exe_path.lower().endswith("python.exe") or exe_path.lower().endswith("pythonw.exe"):
        cmd = f'"{exe_path}" "{script_path}"'
    else:
        cmd = f'"{exe_path}"'
    try:
        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER,
                            r"Software\\Microsoft\\Windows\\CurrentVersion\\Run", 0, winreg.KEY_SET_VALUE)
        winreg.SetValueEx(key, "AutoScreenshotApp", 0, winreg.REG_SZ, cmd)
        winreg.CloseKey(key)
    except Exception as e:
        print(f"添加开机自启动失败: {e}")

try:
    add_to_startup()
except Exception as e:
    print(f"添加开机自启动失败: {e}")

class ScreenshotWorker(QtCore.QThread):
    notify = QtCore.pyqtSignal(str)
    def run(self):
        while True:
            for i in range(45):
                time.sleep(1)
            self.notify.emit("15秒后将自动截屏！")
            time.sleep(15)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            file_path = os.path.join(SAVE_DIR, f"{timestamp}.png")
            screenshot = pyautogui.screenshot()
            screenshot.save(file_path)
            self.notify.emit(f"已保存截图: {file_path}")

class TrayApp(QtWidgets.QSystemTrayIcon):
    def __init__(self, icon, parent=None):
        super().__init__(icon, parent)
        self.setToolTip("自动截屏程序")
        menu = QtWidgets.QMenu(parent)
        show_action = menu.addAction("显示主界面")
        quit_action = menu.addAction("退出")
        show_action.triggered.connect(self.show_main)
        quit_action.triggered.connect(QtWidgets.qApp.quit)
        self.setContextMenu(menu)
        self.activated.connect(self.on_activated)
        self.main_window = parent

    def show_main(self):
        self.main_window.show()
        self.main_window.raise_()
        self.main_window.activateWindow()

    def on_activated(self, reason):
        if reason == QtWidgets.QSystemTrayIcon.DoubleClick:
            self.show_main()

class MainWindow(QtWidgets.QWidget):
    def __init__(self):
        super().__init__()
        icon = self.style().standardIcon(QtWidgets.QStyle.SP_ComputerIcon)
        self.setWindowTitle("自动截屏程序")
        self.setWindowIcon(icon)
        self.resize(300, 120)
        layout = QtWidgets.QVBoxLayout()
        self.label = QtWidgets.QLabel("程序正在后台自动截屏，每隔60秒保存到 D:/screenshots")
        layout.addWidget(self.label)
        self.log = QtWidgets.QTextEdit()
        self.log.setReadOnly(True)
        layout.addWidget(self.log)
        self.setLayout(layout)
        self.tray = TrayApp(icon, self)
        self.tray.show()
        self.worker = ScreenshotWorker()
        self.worker.notify.connect(self.append_log)
        self.worker.start()

    def closeEvent(self, event):
        event.ignore()
        self.hide()
        self.tray.showMessage("自动截屏程序", "程序已最小化到托盘，仍在后台运行。", QtWidgets.QSystemTrayIcon.Information, 2000)

    def append_log(self, msg):
        self.log.append(msg)

if __name__ == "__main__":
    app = QtWidgets.QApplication(sys.argv)
    win = MainWindow()
    win.show()
    sys.exit(app.exec_())
