#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::Deserialize;
use sqlx::postgres::{PgPool, PgPoolOptions};
use tauri::{Manager, State};
use tokio::sync::Mutex;
mod settings;
use settings::*;
mod blog;
use blog::*;
mod tags;
use tags::*;
mod projects;
use projects::*;
mod caterogies;
use caterogies::*;

#[derive(Deserialize)]
struct ConnectionConfig {
    connection_string: String,
}

#[derive(Default)]
pub struct AppState {
    pool: Option<PgPool>,
}

impl AppState {
    fn new() -> Self {
        AppState { pool: None }
    }
}

#[tauri::command]
async fn connect_db(
    state: State<'_, Mutex<AppState>>,
    connection_config: ConnectionConfig,
) -> Result<bool, String> {
    let pool = PgPoolOptions::new()
        .max_connections(1)
        .connect(&connection_config.connection_string)
        .await
        .map_err(|e| e.to_string())?;
    let mut state = state.lock().await;
    state.pool = Some(pool);
    Ok(true)
}

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState::new())
        .setup(|app| {
            app.manage(Mutex::new(AppState::default()));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_projects,
            get_blog_posts,
            create_blog_post,
            create_project,
            update_blog_post,
            update_project,
            get_project_tags,
            get_blog_tags,
            add_tags_to_project,
            add_tags_to_blog,
            create_tag,
            get_tags,
            update_tag,
            delete_tag,
            save_settings,
            load_settings,
            connect_db,
            update_blog_tags,
            update_project_tags,
            get_categories,
            create_category,
            update_category,
            delete_category,
            update_tag_categories,
            update_category_tags,
            remove_category_from_tag,
            get_category_tags
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
