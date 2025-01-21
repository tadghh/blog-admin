use chrono::NaiveDate;
use serde::{Deserialize, Serialize};
use tauri::State;
use tokio::sync::Mutex;

use crate::AppState;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct BlogPost {
    id: i32,
    title: String,
    blog_date: Option<NaiveDate>,
    description: String,
    image_path: Option<String>,
    file_name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateBlogPost {
    title: String,
    blog_date: NaiveDate,
    description: String,
    image_path: Option<String>,
    file_name: String,
}
#[tauri::command]
pub async fn get_blog_posts(state: State<'_, Mutex<AppState>>) -> Result<Vec<BlogPost>, String> {
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
pub async fn create_blog_post(
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
pub async fn update_blog_post(
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
pub async fn delete_blog_post(
    state: State<'_, Mutex<AppState>>,
    blog_post_id: i32,
) -> Result<(), String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;

    sqlx::query!(
        r#"
        DELETE FROM tadgh_blog.blog_posts
        WHERE id = $1
        "#,
        blog_post_id
    )
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}