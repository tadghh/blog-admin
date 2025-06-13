use serde::{Deserialize, Serialize};
use tauri::Manager;
use tokio::*;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DatabaseConnectionInfo {
    host: String,
    port: String,
    database: String,
    username: String,
    password: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Profile {
    name: String,
    database_connection: DatabaseConnectionInfo,
    blog_images_path: Option<String>,
    blog_folder_path: Option<String>,
    created_at: Option<String>, // ISO timestamp for sorting
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Settings {
    profiles: Vec<Profile>,
    current_profile: Option<String>, // Name of the currently selected profile
    #[serde(skip_serializing_if = "Option::is_none")]
    blog_images_path: Option<String>, // Legacy field - will be migrated to profiles
    #[serde(skip_serializing_if = "Option::is_none")]
    blog_folder_path: Option<String>, // Legacy field - will be migrated to profiles
    #[serde(skip_serializing_if = "Option::is_none")]
    database_connection: Option<DatabaseConnectionInfo>, // Legacy field
    #[serde(skip_serializing_if = "Option::is_none")]
    save_database_connection: Option<bool>, // Legacy field
}

impl Default for Settings {
    fn default() -> Self {
        Settings {
            profiles: Vec::new(),
            current_profile: None,
            blog_images_path: None,
            blog_folder_path: None,
            database_connection: None,
            save_database_connection: None,
        }
    }
}

impl Settings {
    // Migrate legacy settings to profile-based settings
    fn migrate_legacy_settings(&mut self) {
        if let (Some(db_conn), Some(true)) =
            (&self.database_connection, self.save_database_connection)
        {
            // Create a default profile from legacy settings
            let default_profile = Profile {
                name: "Default".to_string(),
                database_connection: db_conn.clone(),
                blog_images_path: self.blog_images_path.clone(),
                blog_folder_path: self.blog_folder_path.clone(),
                created_at: Some(chrono::Utc::now().to_rfc3339()),
            };

            // Add to profiles if not already exists
            if !self.profiles.iter().any(|p| p.name == "Default") {
                self.profiles.push(default_profile);
                self.current_profile = Some("Default".to_string());
            }

            // Clear legacy fields
            self.database_connection = None;
            self.save_database_connection = None;
            self.blog_images_path = None;
            self.blog_folder_path = None;
        }
    }

    pub fn get_current_profile(&mut self) -> Option<Profile> {
        let profile_name = self.current_profile.as_ref()?;
        self.profiles
            .iter()
            .find(|p| &p.name == profile_name)
            .cloned()
    }
}

#[tauri::command]
pub async fn save_profile(profile: Profile, app: tauri::AppHandle) -> Result<(), String> {
    let path_resolver = app.path();
    let config_dir = path_resolver.app_config_dir().map_err(|e| e.to_string())?;
    let settings_path = config_dir.join("settings.json");

    // Create directory if it doesn't exist
    fs::create_dir_all(&config_dir)
        .await
        .expect("Failed to create config directory");

    // Load existing settings
    let mut settings = if settings_path.exists() {
        match fs::read_to_string(&settings_path).await {
            Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
            Err(_) => Settings::default(),
        }
    } else {
        Settings::default()
    };

    // Migrate legacy settings if needed
    settings.migrate_legacy_settings();

    // Add or update the profile
    let mut profile_with_timestamp = profile;
    if profile_with_timestamp.created_at.is_none() {
        profile_with_timestamp.created_at = Some(chrono::Utc::now().to_rfc3339());
    }

    if let Some(index) = settings
        .profiles
        .iter()
        .position(|p| p.name == profile_with_timestamp.name)
    {
        settings.profiles[index] = profile_with_timestamp;
    } else {
        settings.profiles.push(profile_with_timestamp);
    }

    // Write updated settings back to file
    fs::write(
        &settings_path,
        serde_json::to_string(&settings).map_err(|e| e.to_string())?,
    )
    .await
    .expect("Failed to write settings");

    Ok(())
}

#[tauri::command]
pub async fn delete_profile(profile_name: String, app: tauri::AppHandle) -> Result<(), String> {
    let path_resolver = app.path();
    let config_dir = path_resolver.app_config_dir().map_err(|e| e.to_string())?;
    let settings_path = config_dir.join("settings.json");

    if !settings_path.exists() {
        return Err("No settings file found".to_string());
    }

    // Load existing settings
    let mut settings: Settings = match fs::read_to_string(&settings_path).await {
        Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
        Err(_) => return Err("Failed to read settings file".to_string()),
    };

    // Remove the profile
    settings.profiles.retain(|p| p.name != profile_name);

    // Clear current profile if it was the deleted one
    if settings.current_profile.as_ref() == Some(&profile_name) {
        settings.current_profile = None;
    }

    // Write updated settings back to file
    fs::write(
        &settings_path,
        serde_json::to_string(&settings).map_err(|e| e.to_string())?,
    )
    .await
    .expect("Failed to write settings");

    Ok(())
}

#[tauri::command]
pub async fn set_current_profile(
    profile_name: String,
    app: tauri::AppHandle,
) -> Result<(), String> {
    let path_resolver = app.path();
    let config_dir = path_resolver.app_config_dir().map_err(|e| e.to_string())?;
    let settings_path = config_dir.join("settings.json");

    if !settings_path.exists() {
        return Err("No settings file found".to_string());
    }

    // Load existing settings
    let mut settings: Settings = match fs::read_to_string(&settings_path).await {
        Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
        Err(_) => return Err("Failed to read settings file".to_string()),
    };

    // Verify the profile exists
    if !settings.profiles.iter().any(|p| p.name == profile_name) {
        return Err("Profile not found".to_string());
    }

    settings.current_profile = Some(profile_name);

    // Write updated settings back to file
    fs::write(
        &settings_path,
        serde_json::to_string(&settings).map_err(|e| e.to_string())?,
    )
    .await
    .expect("Failed to write settings");

    Ok(())
}

#[tauri::command]
pub async fn get_profiles(app: tauri::AppHandle) -> Result<Vec<Profile>, String> {
    let path_resolver = app.path();
    let config_dir = path_resolver.app_config_dir().map_err(|e| e.to_string())?;
    let settings_path = config_dir.join("settings.json");

    if !settings_path.exists() {
        return Ok(Vec::new());
    }

    let mut settings: Settings = match fs::read_to_string(&settings_path).await {
        Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
        Err(_) => return Ok(Vec::new()),
    };

    // Migrate legacy settings if needed
    settings.migrate_legacy_settings();

    // If we migrated, save the updated settings
    if !settings.profiles.is_empty() && settings.database_connection.is_none() {
        let _ = fs::write(
            &settings_path,
            serde_json::to_string(&settings).map_err(|e| e.to_string())?,
        )
        .await;
    }

    Ok(settings.profiles)
}

#[tauri::command]
pub async fn get_current_profile(app: tauri::AppHandle) -> Result<Option<Profile>, String> {
    let path_resolver = app.path();
    let config_dir = path_resolver.app_config_dir().map_err(|e| e.to_string())?;
    let settings_path = config_dir.join("settings.json");

    if !settings_path.exists() {
        return Ok(None);
    }

    let mut settings: Settings = match fs::read_to_string(&settings_path).await {
        Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
        Err(_) => return Ok(None),
    };

    // Migrate legacy settings if needed
    settings.migrate_legacy_settings();

    Ok(settings.get_current_profile())
}

// Legacy command for backward compatibility
#[tauri::command]
pub async fn save_settings(settings: Settings, app: tauri::AppHandle) -> Result<(), String> {
    // This is kept for backward compatibility but now just updates paths for current profile
    if let Some(_) = &settings.current_profile {
        if let Some(current_profile) = get_current_profile(app.clone()).await? {
            let updated_profile = Profile {
                name: current_profile.name,
                database_connection: current_profile.database_connection,
                blog_images_path: settings
                    .blog_images_path
                    .or(current_profile.blog_images_path),
                blog_folder_path: settings
                    .blog_folder_path
                    .or(current_profile.blog_folder_path),
                created_at: current_profile.created_at,
            };
            save_profile(updated_profile, app).await?;
        }
    }
    Ok(())
}

// Legacy command for backward compatibility
#[tauri::command]
pub async fn load_settings(app: tauri::AppHandle) -> Result<Settings, String> {
    let path_resolver = app.path();
    let config_dir = path_resolver.app_config_dir().map_err(|e| e.to_string())?;
    let settings_path = config_dir.join("settings.json");

    if !settings_path.exists() {
        return Ok(Settings {
            profiles: Vec::new(),
            current_profile: None,
            blog_images_path: Some(String::new()),
            blog_folder_path: Some(String::new()),
            database_connection: None,
            save_database_connection: None,
        });
    }

    let mut settings: Settings = match std::fs::read_to_string(settings_path) {
        Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
        Err(_) => Settings::default(),
    };

    // Migrate legacy settings if needed
    settings.migrate_legacy_settings();

    // For backward compatibility, populate legacy fields from current profile
    if let Some(current_profile) = settings.get_current_profile() {
        settings.blog_images_path = current_profile.blog_images_path.clone();
        settings.blog_folder_path = current_profile.blog_folder_path.clone();
        settings.database_connection = Some(current_profile.database_connection.clone());
        settings.save_database_connection = Some(true);
    }

    Ok(settings)
}
