use chrono::NaiveDate;
use serde::{Deserialize, Serialize};
use sqlx::postgres::{PgPool, PgPoolOptions};
use tauri::{Manager, State};
use tokio::sync::Mutex;
use tokio::*;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
struct Tag {
    id: i32,
    name: String,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
struct BlogPost {
    id: i32,
    title: String,
    blog_date: Option<NaiveDate>,
    description: String,
    image_path: Option<String>,
    file_name: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct CreateBlogPost {
    title: String,
    blog_date: NaiveDate,
    description: String,
    image_path: Option<String>,
    file_name: String,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
struct Project {
    id: Option<i32>,
    title: String,
    project_description: Option<String>,
    image_path: Option<String>,
    project_url: Option<String>,
    date_created: Option<NaiveDate>,
    project_status: Option<String>,
    license: Option<String>,
}

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

#[derive(Debug, Serialize, Deserialize)]
struct Settings {
    #[serde(skip_serializing_if = "Option::is_none")]
    blog_images_path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    blog_folder_path: Option<String>,
}

#[tauri::command]
async fn save_settings(settings: Settings, app: tauri::AppHandle) -> Result<(), String> {
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
            }),
            Err(_) => Settings {
                blog_images_path: None,
                blog_folder_path: None,
            },
        }
    } else {
        Settings {
            blog_images_path: None,
            blog_folder_path: None,
        }
    };

    // Update existing settings with new values if they are Some
    if let Some(images_path) = settings.blog_images_path {
        current_settings.blog_images_path = Some(images_path);
    }
    if let Some(folder_path) = settings.blog_folder_path {
        current_settings.blog_folder_path = Some(folder_path);
    }

    // Write updated settings back to file
    fs::write(
        &settings_path,
        serde_json::to_string(&current_settings).map_err(|e| e.to_string())?,
    )
    .await
    .expect("Failed to write settings");

    println!("Settings saved at: {:?}", settings_path);
    Ok(())
}

#[tauri::command]
async fn load_settings(app: tauri::AppHandle) -> Result<Settings, String> {
    // Use the app's path resolver to get the config directory
    let path_resolver = app.path();
    let config_dir = path_resolver.app_config_dir().map_err(|e| e.to_string())?;
    let settings_path = config_dir.join("settings.json");

    // Check if the settings file exists
    if !settings_path.exists() {
        return Ok(Settings {
            blog_images_path: Some(String::new()),
            blog_folder_path: Some(String::new()),
        });
    }

    // Read the settings file and parse it
    let content = std::fs::read_to_string(settings_path).map_err(|e| e.to_string())?;
    serde_json::from_str(&content).map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_tags(state: State<'_, Mutex<AppState>>) -> Result<Vec<Tag>, String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;
    sqlx::query_as!(
        Tag,
        r#"
        SELECT id, name
        FROM tadgh_blog.tags
        ORDER BY name ASC
        "#
    )
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
async fn create_tag(state: State<'_, Mutex<AppState>>, name: String) -> Result<Tag, String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;
    sqlx::query_as!(
        Tag,
        r#"
        INSERT INTO tadgh_blog.tags (name)
        VALUES ($1)
        RETURNING id, name
        "#,
        name
    )
    .fetch_one(pool)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
async fn add_tags_to_blog(
    state: State<'_, Mutex<AppState>>,
    blog_id: i32,
    tag_ids: Vec<i32>,
) -> Result<(), String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;
    for tag_id in tag_ids {
        sqlx::query!(
            r#"
            INSERT INTO tadgh_blog.blog_post_tags (blog_post_id, tag_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
            "#,
            blog_id,
            tag_id
        )
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn add_tags_to_project(
    state: State<'_, Mutex<AppState>>,
    project_id: i32,
    tag_ids: Vec<i32>,
) -> Result<(), String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;
    for tag_id in tag_ids {
        sqlx::query!(
            r#"
            INSERT INTO tadgh_blog.project_tags (project_id, tag_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
            "#,
            project_id,
            tag_id
        )
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}
#[tauri::command]
async fn update_blog_tags(
    state: State<'_, Mutex<AppState>>,
    blog_id: i32,
    tag_ids: Vec<i32>,
) -> Result<(), String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;
    // First delete existing tags

    sqlx::query!(
        "DELETE FROM tadgh_blog.blog_post_tags WHERE blog_post_id = $1",
        blog_id
    )
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    // Then insert new tags
    for tag_id in tag_ids {
        sqlx::query!(
            "INSERT INTO tadgh_blog.blog_post_tags (blog_post_id, tag_id) VALUES ($1, $2)",
            blog_id,
            tag_id
        )
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
async fn update_project_tags(
    state: State<'_, Mutex<AppState>>,
    project_id: i32,
    tag_ids: Vec<i32>,
) -> Result<(), String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;
    // First delete existing tags
    sqlx::query!(
        "DELETE FROM tadgh_blog.project_tags WHERE project_id = $1",
        project_id
    )
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    // Then insert new tags
    for tag_id in tag_ids {
        sqlx::query!(
            "INSERT INTO tadgh_blog.project_tags (project_id, tag_id) VALUES ($1, $2)",
            project_id,
            tag_id
        )
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;
    }

    Ok(())
}
#[tauri::command]
async fn get_blog_tags(
    state: State<'_, Mutex<AppState>>,
    blog_id: i32,
) -> Result<Vec<Tag>, String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;
    sqlx::query_as!(
        Tag,
        r#"
        SELECT t.id, t.name
        FROM tadgh_blog.tags t
        JOIN tadgh_blog.blog_post_tags bpt ON bpt.tag_id = t.id
        WHERE bpt.blog_post_id = $1
        ORDER BY t.name
        "#,
        blog_id
    )
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_project_tags(
    state: State<'_, Mutex<AppState>>,
    project_id: i32,
) -> Result<Vec<Tag>, String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;
    sqlx::query_as!(
        Tag,
        r#"
        SELECT t.id, t.name
        FROM tadgh_blog.tags t
        JOIN tadgh_blog.project_tags pt ON pt.tag_id = t.id
        WHERE pt.project_id = $1
        ORDER BY t.name
        "#,
        project_id
    )
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_projects(state: State<'_, Mutex<AppState>>) -> Result<Vec<Project>, String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;
    sqlx::query_as!(
        Project,
        r#"
        SELECT
            id,
            title,
            project_description,
            image_path,
            project_url,
            date_created,
            project_status,
            license
        FROM tadgh_blog.projects
        ORDER BY date_created DESC
        "#
    )
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_blog_posts(state: State<'_, Mutex<AppState>>) -> Result<Vec<BlogPost>, String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;
    sqlx::query_as!(
        BlogPost,
        r#"
        SELECT
            id,
            title,
            blog_date,
            description,
            image_path,
            file_name
        FROM tadgh_blog.blog_posts
        ORDER BY blog_date DESC
        "#
    )
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
async fn create_blog_post(
    state: State<'_, Mutex<AppState>>,
    blog_post: CreateBlogPost,
) -> Result<BlogPost, String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;
    sqlx::query_as!(
        BlogPost,
        r#"
        INSERT INTO tadgh_blog.blog_posts (title, blog_date, description, image_path, file_name)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, title, blog_date, description, image_path, file_name
        "#,
        blog_post.title,
        blog_post.blog_date,
        blog_post.description,
        blog_post.image_path,
        blog_post.file_name
    )
    .fetch_one(pool)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
async fn create_project(
    state: State<'_, Mutex<AppState>>,
    project: Project,
) -> Result<Project, String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;
    sqlx::query_as!(
        Project,
        r#"
        INSERT INTO tadgh_blog.projects
        (title, project_description, image_path, project_url, date_created, project_status, license)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, title, project_description, image_path, project_url, date_created, project_status, license
        "#,
        project.title,
        project.project_description,
        project.image_path,
        project.project_url,
        project.date_created,
        project.project_status,
        project.license
    )
    .fetch_one(pool)
    .await
    .map_err(|e| e.to_string())
}
#[tauri::command]
async fn update_blog_post(
    state: State<'_, Mutex<AppState>>,
    blog_post: BlogPost,
) -> Result<(), String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;
    sqlx::query!(
        r#"
        UPDATE tadgh_blog.blog_posts
        SET title = $1,
            blog_date = $2,
            description = $3,
            image_path = $4,
            file_name = $5
        WHERE id = $6
        "#,
        blog_post.title,
        blog_post.blog_date,
        blog_post.description,
        blog_post.image_path,
        blog_post.file_name,
        blog_post.id
    )
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
async fn update_project(state: State<'_, Mutex<AppState>>, project: Project) -> Result<(), String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;
    sqlx::query!(
        r#"
        UPDATE tadgh_blog.projects
        SET title = $1,
            project_description = $2,
            image_path = $3,
            project_url = $4,
            date_created = $5,
            project_status = $6,
            license = $7
        WHERE id = $8
        "#,
        project.title,
        project.project_description,
        project.image_path,
        project.project_url,
        project.date_created,
        project.project_status,
        project.license,
        project.id
    )
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
async fn update_tag(
    state: State<'_, Mutex<AppState>>,
    id: i32,
    name: String,
) -> Result<(), String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;
    sqlx::query!(
        r#"
        UPDATE tadgh_blog.tags
        SET name = $1
        WHERE id = $2
        "#,
        name,
        id
    )
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
async fn delete_tag(state: State<'_, Mutex<AppState>>, id: i32) -> Result<(), String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;
    sqlx::query!(
        r#"
        DELETE FROM tadgh_blog.tags
        WHERE id = $1
        "#,
        id
    )
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
async fn connect_db(
    state: State<'_, Mutex<AppState>>,
    connection_config: ConnectionConfig,
) -> Result<bool, String> {
    let pool = PgPoolOptions::new()
        .max_connections(5)
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
            update_project_tags
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
