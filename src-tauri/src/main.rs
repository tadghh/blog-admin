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
mod views;
use views::*;
mod analytics;
use analytics::*;

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

#[tauri::command]
async fn check_db_connection(state: State<'_, Mutex<AppState>>) -> Result<bool, String> {
    let state = state.lock().await;
    match &state.pool {
        Some(pool) => match sqlx::query("SELECT 1").execute(pool).await {
            Ok(_) => Ok(true),
            Err(_) => Ok(false),
        },
        None => Ok(false),
    }
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
            save_profile,
            delete_profile,
            set_current_profile,
            get_profiles,
            get_current_profile,
            connect_db,
            check_db_connection,
            update_blog_tags,
            update_project_tags,
            get_categories,
            create_category,
            update_category,
            delete_category,
            update_tag_categories,
            update_category_tags,
            remove_category_from_tag,
            get_category_tags,
            delete_blog_post,
            delete_project,
            get_blog_posts_with_views,
            add_view_to_blog_post,
            add_multiple_views_to_blog_post,
            get_blog_post_views,
            get_view_analytics
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
