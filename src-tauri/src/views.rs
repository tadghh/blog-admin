use serde::{Deserialize, Serialize};
use tauri::State;
use tokio::sync::Mutex;

use crate::AppState;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct BlogPostView {
    pub id: i32,
    pub blog_post_id: i32,
    pub ip_address: String,
    pub viewed_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BlogPostWithViews {
    pub id: i32,
    pub title: String,
    pub created: Option<chrono::NaiveDate>,
    pub description: String,
    pub image_name: Option<String>,
    pub file_name: String,
    pub view_count: i64,
}

#[tauri::command]
pub async fn get_blog_posts_with_views(
    state: State<'_, Mutex<AppState>>,
) -> Result<Vec<BlogPostWithViews>, String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;

    sqlx::query_as!(
        BlogPostWithViews,
        r#"
        SELECT
            bp.id,
            bp.title,
            bp.created,
            bp.description,
            bp.image_name,
            bp.file_name,
            COALESCE(COUNT(bpi.id), 0) as "view_count!"
        FROM tadgh_blog.blog_posts bp
        LEFT JOIN tadgh_blog.blog_post_ips bpi ON bp.id = bpi.blog_post_id
        GROUP BY bp.id, bp.title, bp.created, bp.description, bp.image_name, bp.file_name
        ORDER BY bp.created DESC
        "#
    )
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn add_view_to_blog_post(
    state: State<'_, Mutex<AppState>>,
    blog_post_id: i32,
) -> Result<(), String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;

    // Use localhost IP as specified
    let ip_address = "127.0.0.1";

    sqlx::query!(
        r#"
        INSERT INTO tadgh_blog.blog_post_ips (blog_post_id, ip_address)
        VALUES ($1, $2)
        "#,
        blog_post_id,
        ip_address
    )
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn add_multiple_views_to_blog_post(
    state: State<'_, Mutex<AppState>>,
    blog_post_id: i32,
    view_count: i32,
) -> Result<(), String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;

    if view_count <= 0 {
        return Err("View count must be greater than 0".to_string());
    }

    if view_count > 1000 {
        return Err("View count cannot exceed 1000 at once".to_string());
    }

    // Use localhost IP as specified
    let ip_address = "127.0.0.1";

    // Insert multiple views in a single transaction
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    for _ in 0..view_count {
        sqlx::query!(
            r#"
            INSERT INTO tadgh_blog.blog_post_ips (blog_post_id, ip_address)
            VALUES ($1, $2)
            "#,
            blog_post_id,
            ip_address
        )
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
    }

    tx.commit().await.map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn get_blog_post_views(
    state: State<'_, Mutex<AppState>>,
    blog_post_id: i32,
) -> Result<Vec<BlogPostView>, String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;

    sqlx::query_as!(
        BlogPostView,
        r#"
        SELECT id, blog_post_id, ip_address, viewed_at
        FROM tadgh_blog.blog_post_ips
        WHERE blog_post_id = $1
        ORDER BY id DESC
        "#,
        blog_post_id
    )
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())
}
