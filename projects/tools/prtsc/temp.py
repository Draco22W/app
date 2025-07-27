import os
import shutil
import sys
from datetime import datetime, timedelta

# 目录
DIR = r"D:\screenshots"

def parse_time_arg(time_str):
    """解析时间参数，支持 HH:MM:SS 格式"""
    try:
        return datetime.strptime(time_str, "%H:%M:%S").time()
    except ValueError:
        print(f"时间格式错误: {time_str}，请使用 HH:MM:SS 格式")
        sys.exit(1)

def get_files_with_time():
    """获取目录下所有带时间戳的图片文件"""
    files = [f for f in os.listdir(DIR) if f.endswith(".png") and "_" in f]
    file_dt_list = []
    for f in files:
        try:
            ts = f.split(".")[0]
            dt = datetime.strptime(ts, "%Y%m%d_%H%M%S")
            file_dt_list.append((dt, f))
        except Exception:
            continue
    return sorted(file_dt_list)

def delete_and_fill_from_start(file_dt_list, delete_start_str, delete_end_str):
    """删除指定时间段，然后从最前面开始复制粘贴"""
    try:
        delete_start_dt = datetime.strptime(delete_start_str, "%Y%m%d_%H%M%S")
        delete_end_dt = datetime.strptime(delete_end_str, "%Y%m%d_%H%M%S")
    except ValueError:
        print(f"时间格式错误，请使用 YYYYMMDD_HHMMSS 格式")
        return
    
    print(f"删除时间段: {delete_start_str} 到 {delete_end_str}")
    
    # 第一步：删除需要抹除的时间段
    files_to_delete = []
    for dt, f in file_dt_list:
        if delete_start_dt <= dt <= delete_end_dt:
            files_to_delete.append((dt, f))
    
    print(f"找到 {len(files_to_delete)} 个文件需要删除")
    
    for dt, f in files_to_delete:
        try:
            file_path = os.path.join(DIR, f)
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"删除: {f}")
        except Exception as e:
            print(f"删除失败: {f}，原因: {e}")
    
    # 重新获取文件列表（删除后更新）
    print("重新扫描目录...")
    file_dt_list = get_files_with_time()
    
    # 第二步：找到所有剩余的文件作为源文件
    source_files = []
    for dt, f in file_dt_list:
        file_path = os.path.join(DIR, f)
        if os.path.exists(file_path):
            source_files.append((dt, f))
    
    if not source_files:
        print("没有找到可用的源文件")
        return
    
    print(f"找到 {len(source_files)} 个源文件")
    
    # 第三步：生成目标时间列表（从删除开始时间到删除结束时间）
    target_times = []
    current_dt = delete_start_dt
    while current_dt <= delete_end_dt:
        target_times.append(current_dt)
        current_dt += timedelta(minutes=1)
    
    print(f"将生成 {len(target_times)} 个目标时间点")
    
    # 第四步：从最前面开始循环使用源文件
    source_index = 0
    for target_time in target_times:
        if source_index >= len(source_files):
            source_index = 0  # 循环使用源文件
        
        # 生成目标文件名
        target_filename = target_time.strftime("%Y%m%d_%H%M%S") + ".png"
        target_path = os.path.join(DIR, target_filename)
        source_path = os.path.join(DIR, source_files[source_index][1])
        
        try:
            # 复制文件
            shutil.copyfile(source_path, target_path)
            print(f"复制: {source_files[source_index][1]} -> {target_filename}")
            source_index += 1
            
        except Exception as e:
            print(f"复制失败: {source_files[source_index][1]} -> {target_filename}，原因: {e}")
            source_index += 1

def reorder_time_before_cutoff(file_dt_list, cutoff_time_str):
    """重新排列指定时间点之前的文件时间，每次减去一分钟"""
    try:
        cutoff_dt = datetime.strptime(cutoff_time_str, "%Y%m%d_%H%M%S")
    except ValueError:
        print(f"时间格式错误: {cutoff_time_str}，请使用 YYYYMMDD_HHMMSS 格式")
        return
    
    # 找到截止时间之前的文件
    files_before_cutoff = [(dt, f) for dt, f in file_dt_list if dt < cutoff_dt]
    
    if not files_before_cutoff:
        print(f"没有找到 {cutoff_time_str} 之前的文件")
        return
    
    print(f"找到 {len(files_before_cutoff)} 个文件需要重新排列时间")
    
    # 按时间排序（从晚到早，这样最新的文件时间最大）
    files_before_cutoff.sort(reverse=True)
    
    # 从截止时间开始，每次减去一分钟
    current_time = cutoff_dt - timedelta(minutes=1)
    
    print(f"重新排列时间：从 {current_time.strftime('%H:%M:%S')} 开始，每次减去一分钟")
    
    # 重新命名文件
    for old_dt, old_filename in files_before_cutoff:
        new_filename = current_time.strftime("%Y%m%d_%H%M%S") + ".png"
        old_path = os.path.join(DIR, old_filename)
        new_path = os.path.join(DIR, new_filename)
        
        try:
            if old_filename != new_filename:
                # 检查目标文件名是否已存在
                if os.path.exists(new_path):
                    print(f"警告：文件 {new_filename} 已存在，跳过重命名 {old_filename}")
                    continue
                
                os.rename(old_path, new_path)
                print(f"重命名: {old_filename} -> {new_filename}")
            current_time -= timedelta(minutes=1)
        except Exception as e:
            print(f"重命名失败: {old_filename}，原因: {e}")
            current_time -= timedelta(minutes=1)

def move_and_reorder_desktop_files(desktop_start_str, desktop_end_str, target_cutoff_str):
    """从桌面移动文件并重新排列时间"""
    # 桌面路径
    desktop_dir = r"C:\Users\Administrator\Desktop"
    
    try:
        desktop_start_dt = datetime.strptime(desktop_start_str, "%Y%m%d_%H%M%S")
        desktop_end_dt = datetime.strptime(desktop_end_str, "%Y%m%d_%H%M%S")
        target_cutoff_dt = datetime.strptime(target_cutoff_str, "%Y%m%d_%H%M%S")
    except ValueError:
        print(f"时间格式错误，请使用 YYYYMMDD_HHMMSS 格式")
        return
    
    print(f"从桌面移动文件: {desktop_start_str} 到 {desktop_end_str}")
    print(f"目标位置: {target_cutoff_str} 之前")
    
    # 第一步：找到桌面上的目标文件
    desktop_files = []
    try:
        for f in os.listdir(desktop_dir):
            if f.endswith(".png") and "_" in f:
                try:
                    ts = f.split(".")[0]
                    dt = datetime.strptime(ts, "%Y%m%d_%H%M%S")
                    if desktop_start_dt <= dt <= desktop_end_dt:
                        desktop_files.append((dt, f))
                except Exception:
                    continue
    except Exception as e:
        print(f"读取桌面目录失败: {e}")
        return
    
    if not desktop_files:
        print(f"桌面上没有找到 {desktop_start_str} 到 {desktop_end_str} 时间段的文件")
        return
    
    print(f"找到 {len(desktop_files)} 个桌面文件需要移动")
    
    # 第二步：移动文件到截图目录
    moved_files = []
    for dt, f in desktop_files:
        try:
            src_path = os.path.join(desktop_dir, f)
            dst_path = os.path.join(DIR, f)
            
            if os.path.exists(src_path):
                shutil.move(src_path, dst_path)
                moved_files.append((dt, f))
                print(f"移动: {f}")
        except Exception as e:
            print(f"移动失败: {f}，原因: {e}")
    
    if not moved_files:
        print("没有成功移动任何文件")
        return
    
    print(f"成功移动 {len(moved_files)} 个文件")
    
    # 第三步：重新获取文件列表并重新排列时间
    print("重新扫描目录...")
    file_dt_list = get_files_with_time()
    
    # 找到截止时间之前的文件（包括刚移动的文件）
    files_before_cutoff = [(dt, f) for dt, f in file_dt_list if dt < target_cutoff_dt]
    
    if not files_before_cutoff:
        print(f"没有找到 {target_cutoff_str} 之前的文件")
        return
    
    print(f"找到 {len(files_before_cutoff)} 个文件需要重新排列时间")
    
    # 按时间排序（从晚到早）
    files_before_cutoff.sort(reverse=True)
    
    # 从截止时间开始，每次减去一分钟
    current_time = target_cutoff_dt - timedelta(minutes=1)
    
    print(f"重新排列时间：从 {current_time.strftime('%H:%M:%S')} 开始，每次减去一分钟")
    
    # 重新命名文件
    for old_dt, old_filename in files_before_cutoff:
        new_filename = current_time.strftime("%Y%m%d_%H%M%S") + ".png"
        old_path = os.path.join(DIR, old_filename)
        new_path = os.path.join(DIR, new_filename)
        
        try:
            if old_filename != new_filename:
                # 检查目标文件名是否已存在
                if os.path.exists(new_path):
                    print(f"警告：文件 {new_filename} 已存在，跳过重命名 {old_filename}")
                    continue
                
                os.rename(old_path, new_path)
                print(f"重命名: {old_filename} -> {new_filename}")
            current_time -= timedelta(minutes=1)
        except Exception as e:
            print(f"重命名失败: {old_filename}，原因: {e}")
            current_time -= timedelta(minutes=1)

def delete_files_after_time(file_dt_list, delete_after):
    """删除指定时间点之后的文件"""
    threshold_time = parse_time_arg(delete_after)
    valid_imgs = []
    for dt, f in file_dt_list:
        if dt.time() > threshold_time:
            try:
                os.remove(os.path.join(DIR, f))
                print(f"已删除: {f}")
            except Exception as e:
                print(f"删除失败: {f}，原因: {e}")
        else:
            valid_imgs.append((dt, f))
    return valid_imgs

def fill_time_range(valid_imgs, fill_start, fill_end):
    """填充指定时间段"""
    if not valid_imgs:
        print("没有可用的图片用于填充！")
        return
    base_date = valid_imgs[0][0].date()
    fill_start_dt = datetime.combine(base_date, parse_time_arg(fill_start))
    fill_end_dt = datetime.combine(base_date, parse_time_arg(fill_end))
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
        src_img = os.path.join(DIR, valid_imgs[idx][1])
        shutil.copyfile(src_img, target_path)
        print(f"填充: {target_name} 用 {valid_imgs[idx][1]}")

def move_append_desktop_files(desktop_start_str, desktop_end_str):
    """将桌面指定时间段的文件移动到截图目录最后，并顺序重命名"""
    desktop_dir = r"C:\Users\Administrator\Desktop"
    try:
        desktop_start_dt = datetime.strptime(desktop_start_str, "%Y%m%d_%H%M%S")
        desktop_end_dt = datetime.strptime(desktop_end_str, "%Y%m%d_%H%M%S")
    except ValueError:
        print(f"时间格式错误，请使用 YYYYMMDD_HHMMSS 格式")
        return
    print(f"从桌面移动文件: {desktop_start_str} 到 {desktop_end_str}，并追加到截图目录最后")
    # 1. 获取截图目录最大时间
    file_dt_list = get_files_with_time()
    if file_dt_list:
        max_dt = max(dt for dt, _ in file_dt_list)
    else:
        print("截图目录没有文件，无法追加！")
        return
    # 2. 找到桌面目标文件
    desktop_files = []
    try:
        for f in os.listdir(desktop_dir):
            if f.endswith(".png") and "_" in f:
                try:
                    ts = f.split(".")[0]
                    dt = datetime.strptime(ts, "%Y%m%d_%H%M%S")
                    if desktop_start_dt <= dt <= desktop_end_dt:
                        desktop_files.append((dt, f))
                except Exception:
                    continue
    except Exception as e:
        print(f"读取桌面目录失败: {e}")
        return
    if not desktop_files:
        print(f"桌面上没有找到 {desktop_start_str} 到 {desktop_end_str} 时间段的文件")
        return
    print(f"找到 {len(desktop_files)} 个桌面文件需要移动")
    # 3. 移动并重命名
    desktop_files.sort()  # 按时间升序
    current_time = max_dt + timedelta(minutes=1)
    for dt, f in desktop_files:
        src_path = os.path.join(desktop_dir, f)
        new_filename = current_time.strftime("%Y%m%d_%H%M%S") + ".png"
        dst_path = os.path.join(DIR, new_filename)
        try:
            if os.path.exists(src_path):
                shutil.move(src_path, dst_path)
                print(f"移动并重命名: {f} -> {new_filename}")
                current_time += timedelta(minutes=1)
        except Exception as e:
            print(f"移动失败: {f}，原因: {e}")

def move_prepend_desktop_files(desktop_start_str, desktop_end_str):
    """将桌面指定时间段的文件移动到截图目录最前，并顺序重命名"""
    desktop_dir = r"C:\Users\Administrator\Desktop"
    try:
        desktop_start_dt = datetime.strptime(desktop_start_str, "%Y%m%d_%H%M%S")
        desktop_end_dt = datetime.strptime(desktop_end_str, "%Y%m%d_%H%M%S")
    except ValueError:
        print(f"时间格式错误，请使用 YYYYMMDD_HHMMSS 格式")
        return
    print(f"从桌面移动文件: {desktop_start_str} 到 {desktop_end_str}，并插入到截图目录最前")
    # 1. 获取截图目录最小时间
    file_dt_list = get_files_with_time()
    if file_dt_list:
        min_dt = min(dt for dt, _ in file_dt_list)
    else:
        print("截图目录没有文件，无法插入！")
        return
    # 2. 找到桌面目标文件
    desktop_files = []
    try:
        for f in os.listdir(desktop_dir):
            if f.endswith(".png") and "_" in f:
                try:
                    ts = f.split(".")[0]
                    dt = datetime.strptime(ts, "%Y%m%d_%H%M%S")
                    if desktop_start_dt <= dt <= desktop_end_dt:
                        desktop_files.append((dt, f))
                except Exception:
                    continue
    except Exception as e:
        print(f"读取桌面目录失败: {e}")
        return
    if not desktop_files:
        print(f"桌面上没有找到 {desktop_start_str} 到 {desktop_end_str} 时间段的文件")
        return
    print(f"找到 {len(desktop_files)} 个桌面文件需要移动")
    # 3. 移动并重命名
    desktop_files.sort()  # 按时间升序
    prepend_count = len(desktop_files)
    # 新的起始时间 = min_dt - (文件数-1)分钟
    current_time = min_dt - timedelta(minutes=prepend_count-1)
    for dt, f in desktop_files:
        src_path = os.path.join(desktop_dir, f)
        new_filename = current_time.strftime("%Y%m%d_%H%M%S") + ".png"
        dst_path = os.path.join(DIR, new_filename)
        try:
            if os.path.exists(src_path):
                shutil.move(src_path, dst_path)
                print(f"移动并重命名: {f} -> {new_filename}")
                current_time += timedelta(minutes=1)
        except Exception as e:
            print(f"移动失败: {f}，原因: {e}")

def fix_seconds_prepend(count):
    """将最前面N个文件的秒数统一改为13"""
    file_dt_list = get_files_with_time()
    if not file_dt_list or count <= 0:
        print("没有可处理的文件或数量无效")
        return
    # 取最前面count个文件（按时间升序）
    file_dt_list.sort()
    target_files = file_dt_list[:count]
    for dt, f in target_files:
        # 构造新时间，秒数设为13
        new_dt = dt.replace(second=13)
        new_filename = new_dt.strftime("%Y%m%d_%H%M%S") + ".png"
        old_path = os.path.join(DIR, f)
        new_path = os.path.join(DIR, new_filename)
        try:
            if f != new_filename:
                if os.path.exists(new_path):
                    print(f"警告：文件 {new_filename} 已存在，跳过重命名 {f}")
                    continue
                os.rename(old_path, new_path)
                print(f"重命名: {f} -> {new_filename}")
        except Exception as e:
            print(f"重命名失败: {f}，原因: {e}")

def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("用法:")
        print("1. 删除并填充: python temp.py delete [delete_start] [delete_end]")
        print("   例如: python temp.py delete 20250726_064700 20250726_071100")
        print("2. 重新排列时间: python temp.py reorder [cutoff_time]")
        print("   例如: python temp.py reorder 20250726_151815")
        print("3. 移动桌面文件: python temp.py move [desktop_start] [desktop_end] [target_cutoff]")
        print("   例如: python temp.py move 20250725_144639 20250725_160843 20250726_151815")
        print("4. 删除并填充: python temp.py fill [delete_after] [fill_start] [fill_end]")
        print("   例如: python temp.py fill 15:43:00 00:00:00")
        print("5. 移动并追加桌面文件: python temp.py move_append [desktop_start] [desktop_end]")
        print("   例如: python temp.py move_append 20250725_144639 20250725_160843")
        print("6. 移动并插入桌面文件: python temp.py move_prepend [desktop_start] [desktop_end]")
        print("   例如: python temp.py move_prepend 20250725_144639 20250725_160843")
        print("7. 修复最前面N个文件的秒数: python temp.py fix_seconds_prepend [count]")
        print("   例如: python temp.py fix_seconds_prepend 5")
        sys.exit(1)
    
    if sys.argv[1] == "delete":
        # 删除并填充模式
        if len(sys.argv) < 4:
            print("删除模式需要指定删除时间段")
            print("用法: python temp.py delete [delete_start] [delete_end]")
            print("例如: python temp.py delete 20250726_064700 20250726_071100")
            sys.exit(1)
        
        delete_start = sys.argv[2]
        delete_end = sys.argv[3]
        
        print(f"删除时间段: {delete_start} 到 {delete_end}，然后从最前面开始复制")
        file_dt_list = get_files_with_time()
        delete_and_fill_from_start(file_dt_list, delete_start, delete_end)
    
    elif sys.argv[1] == "reorder":
        # 重新排列时间模式
        if len(sys.argv) < 3:
            print("重新排列模式需要指定截止时间")
            print("用法: python temp.py reorder [cutoff_time]")
            print("例如: python temp.py reorder 20250726_151815")
            sys.exit(1)
        
        cutoff_time = sys.argv[2]
        
        print(f"重新排列 {cutoff_time} 之前的文件时间，每次减去一分钟")
        file_dt_list = get_files_with_time()
        reorder_time_before_cutoff(file_dt_list, cutoff_time)
    
    elif sys.argv[1] == "move":
        # 移动桌面文件模式
        if len(sys.argv) < 5:
            print("移动模式需要指定桌面时间段和目标位置")
            print("用法: python temp.py move [desktop_start] [desktop_end] [target_cutoff]")
            print("例如: python temp.py move 20250725_144639 20250725_160843 20250726_151815")
            sys.exit(1)
        
        desktop_start = sys.argv[2]
        desktop_end = sys.argv[3]
        target_cutoff = sys.argv[4]
        
        print(f"从桌面移动 {desktop_start} 到 {desktop_end} 的文件到 {target_cutoff} 之前")
        move_and_reorder_desktop_files(desktop_start, desktop_end, target_cutoff)
        
    elif sys.argv[1] == "fill":
        # 删除并填充模式
        delete_after = sys.argv[2] if len(sys.argv) > 2 else "16:17:00"
        fill_start = sys.argv[3] if len(sys.argv) > 3 else "16:17:00"
        fill_end = sys.argv[4] if len(sys.argv) > 4 else None
        
        # fill_end自动设为当前时间（如果未指定）
        now = datetime.now()
        if fill_end is None:
            fill_end_str = now.strftime("%H:%M:%S")
        else:
            fill_end_str = fill_end
        
        print(f"删除 {delete_after} 之后的所有图片，并顺序填充 {fill_start} ~ {fill_end_str} 每分钟的图片。")
        
        file_dt_list = get_files_with_time()
        if not file_dt_list:
            print("目录下没有可用的图片！")
            sys.exit(0)
        
        valid_imgs = delete_files_after_time(file_dt_list, delete_after)
        fill_time_range(valid_imgs, fill_start, fill_end_str)
    
    elif sys.argv[1] == "move_append":
        # 移动并追加桌面文件模式
        if len(sys.argv) < 4:
            print("移动并追加模式需要指定桌面时间段")
            print("用法: python temp.py move_append [desktop_start] [desktop_end]")
            print("例如: python temp.py move_append 20250725_144639 20250725_160843")
            sys.exit(1)
        
        desktop_start = sys.argv[2]
        desktop_end = sys.argv[3]
        
        print(f"从桌面移动 {desktop_start} 到 {desktop_end} 的文件到截图目录最后，并顺序重命名")
        move_append_desktop_files(desktop_start, desktop_end)
    
    elif sys.argv[1] == "move_prepend":
        # 移动并插入桌面文件模式
        if len(sys.argv) < 4:
            print("移动并插入模式需要指定桌面时间段")
            print("用法: python temp.py move_prepend [desktop_start] [desktop_end]")
            print("例如: python temp.py move_prepend 20250725_144639 20250725_160843")
            sys.exit(1)
        
        desktop_start = sys.argv[2]
        desktop_end = sys.argv[3]
        
        print(f"从桌面移动 {desktop_start} 到 {desktop_end} 的文件到截图目录最前，并顺序重命名")
        move_prepend_desktop_files(desktop_start, desktop_end)
    
    elif sys.argv[1] == "fix_seconds_prepend":
        # 修复最前面N个文件的秒数模式
        if len(sys.argv) < 3:
            print("修复最前面N个文件的秒数模式需要指定数量")
            print("用法: python temp.py fix_seconds_prepend [count]")
            print("例如: python temp.py fix_seconds_prepend 5")
            sys.exit(1)
        
        count = int(sys.argv[2])
        print(f"将最前面 {count} 个文件的秒数统一改为 13")
        fix_seconds_prepend(count)
    
    else:
        print("未知命令，请使用 'delete'、'reorder'、'move' 或 'fill'")
        print("用法:")
        print("1. 删除并填充: python temp.py delete [delete_start] [delete_end]")
        print("2. 重新排列时间: python temp.py reorder [cutoff_time]")
        print("3. 移动桌面文件: python temp.py move [desktop_start] [desktop_end] [target_cutoff]")
        print("4. 删除并填充: python temp.py fill [delete_after] [fill_start] [fill_end]")
        print("5. 移动并追加桌面文件: python temp.py move_append [desktop_start] [desktop_end]")
        print("6. 移动并插入桌面文件: python temp.py move_prepend [desktop_start] [desktop_end]")
        print("7. 修复最前面N个文件的秒数: python temp.py fix_seconds_prepend [count]")

if __name__ == "__main__":
    main()