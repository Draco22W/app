import os
import sys
import time
from datetime import datetime
import pyautogui
from PIL import Image
from PyQt5 import QtWidgets, QtGui, QtCore

# 指定保存目录
SAVE_DIR = r"D:\screenshots"

# 确保保存目录存在
os.makedirs(SAVE_DIR, exist_ok=True)

class ScreenshotWorker(QtCore.QThread):
    notify = QtCore.pyqtSignal(str)
    def run(self):
        while True:
            now = datetime.now()
            # 只在每分钟的零秒截屏
            if now.second == 0:
                timestamp = now.strftime("%Y%m%d_%H%M%S")
                file_path = os.path.join(SAVE_DIR, f"{timestamp}.png")
                # 截屏
                screenshot = pyautogui.screenshot()
                # 保存为PNG
                screenshot.save(file_path)
                self.notify.emit(f"已保存截图: {file_path}")
                # 等待1秒，避免重复截屏
                time.sleep(1)
            else:
                # 每0.2秒检查一次
                time.sleep(0.2)

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
        self.setWindowTitle("自动截屏程序")
        self.setWindowIcon(QtGui.QIcon.fromTheme("camera"))
        self.resize(300, 120)
        layout = QtWidgets.QVBoxLayout()
        self.label = QtWidgets.QLabel("程序正在后台自动截屏，每分钟零秒保存到 D:/screenshots")
        layout.addWidget(self.label)
        self.log = QtWidgets.QTextEdit()
        self.log.setReadOnly(True)
        layout.addWidget(self.log)
        self.setLayout(layout)
        self.tray = TrayApp(QtGui.QIcon.fromTheme("camera"), self)
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
