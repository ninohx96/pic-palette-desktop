use std::fs;
use std::io::Write;
use serde::{Deserialize, Serialize};
use tauri::Manager;
use uuid::Uuid;

// 图像路径结构体
#[derive(Debug, Serialize, Deserialize)]
pub struct ImagePath {
    pub path: String,
}

// 调色板颜色结构体
#[derive(Debug, Serialize, Deserialize)]
pub struct PaletteColor {
    pub hex: String,
    pub rgb: [u8; 3],
    pub population: f64,
    pub name: String,
}

// 保存前端传递的图像数据
#[tauri::command]
async fn save_image_data(app_handle: tauri::AppHandle, image_data_base64: &str) -> Result<ImagePath, String> {
    // 解码 base64 图像数据
    let image_data = match base64::decode(image_data_base64.replace("data:image/png;base64,", "").replace("data:image/jpeg;base64,", "")) {
        Ok(data) => data,
        Err(e) => return Err(format!("解码图像数据失败: {}", e)),
    };
    
    // 创建临时目录
    let app_dir = app_handle.path().app_data_dir().unwrap();
    let temp_dir = app_dir.join("temp");
    if !temp_dir.exists() {
        fs::create_dir_all(&temp_dir).map_err(|e| format!("创建临时目录失败: {}", e))?;
    }
    
    // 生成唯一的文件名
    let file_name = format!("{}.png", Uuid::new_v4());
    let file_path = temp_dir.join(&file_name);
    
    // 将图像数据保存到文件
    let mut file = fs::File::create(&file_path)
        .map_err(|e| format!("创建文件失败: {}", e))?;
    
    file.write_all(&image_data)
        .map_err(|e| format!("写入图像数据失败: {}", e))?;
    
    Ok(ImagePath {
        path: file_path.to_string_lossy().to_string(),
    })
}

// 清理临时图像
#[tauri::command]
async fn cleanup_temp_image(path: &str) -> Result<(), String> {
    if let Err(e) = fs::remove_file(path) {
        return Err(format!("删除临时图像失败: {}", e));
    }
    Ok(())
}

// 清空所有临时图片
#[tauri::command]
async fn clear_all_temp_images(app_handle: tauri::AppHandle) -> Result<(), String> {
    // 获取应用数据目录
    let app_dir = app_handle.path().app_data_dir().unwrap();
    let temp_dir = app_dir.join("temp");
    
    // 如果临时目录不存在，直接返回成功
    if !temp_dir.exists() {
        return Ok(());
    }
    
    // 读取目录中的所有文件
    let entries = match fs::read_dir(&temp_dir) {
        Ok(entries) => entries,
        Err(e) => return Err(format!("读取临时目录失败: {}", e)),
    };
    
    // 删除所有文件
    for entry in entries {
        if let Ok(entry) = entry {
            let path = entry.path();
            if path.is_file() {
                if let Err(e) = fs::remove_file(&path) {
                    return Err(format!("删除文件失败 {}: {}", path.display(), e));
                }
            }
        }
    }
    
    Ok(())
}

// 运行应用程序
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            save_image_data,
            cleanup_temp_image,
            clear_all_temp_images
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
