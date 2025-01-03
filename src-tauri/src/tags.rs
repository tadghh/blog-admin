use serde::{Deserialize, Serialize};

use tauri::State;
use tokio::sync::Mutex;

use crate::AppState;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Tag {
    pub id: i32,
    pub name: String,
}

#[tauri::command]
pub async fn get_tags(state: State<'_, Mutex<AppState>>) -> Result<Vec<Tag>, String> {
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
pub async fn create_tag(state: State<'_, Mutex<AppState>>, name: String) -> Result<Tag, String> {
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
pub async fn add_tags_to_blog(
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
pub async fn add_tags_to_project(
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
pub async fn update_blog_tags(
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
pub async fn update_project_tags(
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
pub async fn get_blog_tags(
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
pub async fn get_project_tags(
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
pub async fn update_tag(
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
pub async fn delete_tag(state: State<'_, Mutex<AppState>>, id: i32) -> Result<(), String> {
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
