import os
import shutil
import sys
from datetime import datetime, timedelta

# 目录
DIR = r"D:\screenshots"

# 默认参数
DEFAULT_DELETE_AFTER = "16:17:00"
DEFAULT_FILL_START = "16:17:00"

# 解析命令行参数
delete_after = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_DELETE_AFTER
fill_start = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_FILL_START

# fill_end自动设为当前时间
now = datetime.now()
fill_end = now.strftime("%H:%M:%S")

print(f"删除 {delete_after} 之后的所有图片，并顺序填充 {fill_start} ~ {fill_end} 每分钟的图片。")

# 1. 找到所有图片
files = [f for f in os.listdir(DIR) if f.endswith(".png") and "_" in f]
file_dt_list = []
for f in files:
    try:
        ts = f.split(".")[0]
        dt = datetime.strptime(ts, "%Y%m%d_%H%M%S")
        file_dt_list.append((dt, f))
    except Exception:
        continue

if not file_dt_list:
    print("目录下没有可用的图片！")
    sys.exit(0)

# 2. 删除指定时间点之后的图片
threshold_time = datetime.strptime(delete_after, "%H:%M:%S").time()
valid_imgs = []
for dt, f in sorted(file_dt_list):
    if dt.time() > threshold_time:
        try:
            os.remove(os.path.join(DIR, f))
            print(f"已删除: {f}")
        except Exception as e:
            print(f"删除失败: {f}，原因: {e}")
    else:
        valid_imgs.append(os.path.join(DIR, f))

# 3. 顺序填充指定时间段每分钟
if not valid_imgs:
    print("没有可用的图片用于填充！")
else:
    # 以最早图片的日期为基准，时间用参数
    base_date = file_dt_list[0][0].date()
    fill_start_dt = datetime.combine(base_date, datetime.strptime(fill_start, "%H:%M:%S").time())
    fill_end_dt = datetime.combine(base_date, now.time())
    fill_times = []
    cur = fill_start_dt
    while cur <= fill_end_dt:
        fill_times.append(cur)
        cur += timedelta(minutes=1)

    # 顺序一对一填充
    for idx, t in enumerate(fill_times):
        if idx >= len(valid_imgs):
            print("图片数量不足，后续时间点不再填充。")
            break
        target_name = t.strftime("%Y%m%d_%H%M%S") + ".png"
        target_path = os.path.join(DIR, target_name)
        src_img = valid_imgs[idx]
        shutil.copyfile(src_img, target_path)
        print(f"填充: {target_name} 用 {os.path.basename(src_img)}")