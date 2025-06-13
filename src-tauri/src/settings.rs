use serde::{Deserialize, Serialize};
use tauri::Manager;
use tokio::*;

#[derive(Debug, Serialize, Deserialize)]
pub struct DatabaseConnectionInfo {
    host: String,
    port: String,
    database: String,
    username: String,
    password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Settings {
    #[serde(skip_serializing_if = "Option::is_none")]
    blog_images_path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    blog_folder_path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    database_connection: Option<DatabaseConnectionInfo>,
    #[serde(skip_serializing_if = "Option::is_none")]
    save_database_connection: Option<bool>,
}

#[tauri::command]
pub async fn save_settings(settings: Settings, app: tauri::AppHandle) -> Result<(), String> {
    // Use the app's path resolver to get the config directory
    let path_resolver = app.path();
    let config_dir = path_resolver.app_config_dir().map_err(|e| e.to_string())?;
    let settings_path = config_dir.join("settings.json");

    // Create directory if it doesn't exist
    fs::create_dir_all(&config_dir)
        .await
        .expect("Failed to create config directory");

    // Read existing settings if file exists
    let mut current_settings = if settings_path.exists() {
        match fs::read_to_string(&settings_path).await {
            Ok(content) => serde_json::from_str(&content).unwrap_or(Settings {
                blog_images_path: None,
                blog_folder_path: None,
                database_connection: None,
                save_database_connection: None,
            }),
            Err(_) => Settings {
                blog_images_path: None,
                blog_folder_path: None,
                database_connection: None,
                save_database_connection: None,
            },
        }
    } else {
        Settings {
            blog_images_path: None,
            blog_folder_path: None,
            database_connection: None,
            save_database_connection: None,
        }
    };

    // Update existing settings with new values if they are Some
    if let Some(images_path) = settings.blog_images_path {
        current_settings.blog_images_path = Some(images_path);
    }
    if let Some(folder_path) = settings.blog_folder_path {
        current_settings.blog_folder_path = Some(folder_path);
    }
    if let Some(db_connection) = settings.database_connection {
        current_settings.database_connection = Some(db_connection);
    }
    if let Some(save_db_connection) = settings.save_database_connection {
        current_settings.save_database_connection = Some(save_db_connection);

        // If user doesn't want to save connection, clear it
        if !save_db_connection {
            current_settings.database_connection = None;
        }
    }

    // Write updated settings back to file
    fs::write(
        &settings_path,
        serde_json::to_string(&current_settings).map_err(|e| e.to_string())?,
    )
    .await
    .expect("Failed to write settings");

    Ok(())
}

#[tauri::command]
pub async fn load_settings(app: tauri::AppHandle) -> Result<Settings, String> {
    // Use the app's path resolver to get the config directory
    let path_resolver = app.path();
    let config_dir = path_resolver.app_config_dir().map_err(|e| e.to_string())?;
    let settings_path = config_dir.join("settings.json");

    // Check if the settings file exists
    if !settings_path.exists() {
        return Ok(Settings {
            blog_images_path: Some(String::new()),
            blog_folder_path: Some(String::new()),
            database_connection: None,
            save_database_connection: None,
        });
    }

    // Read the settings file and parse it
    let content = std::fs::read_to_string(settings_path).map_err(|e| e.to_string())?;
    serde_json::from_str(&content).map_err(|e| e.to_string())
}
