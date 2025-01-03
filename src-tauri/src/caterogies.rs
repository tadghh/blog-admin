use crate::{AppState, Tag};
use serde::{Deserialize, Serialize};
use tauri::State;
use tokio::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Category {
    id: i32,
    name: String,
    description: Option<String>,
}

#[tauri::command]
pub async fn get_categories(state: State<'_, Mutex<AppState>>) -> Result<Vec<Category>, String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;
    sqlx::query_as!(
        Category,
        r#"
        SELECT id, name, description
        FROM tadgh_blog.categories
        ORDER BY name ASC
        "#
    )
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_category(
    state: State<'_, Mutex<AppState>>,
    name: String,
    description: Option<String>,
) -> Result<Category, String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;
    sqlx::query_as!(
        Category,
        r#"
        INSERT INTO tadgh_blog.categories (name, description)
        VALUES ($1, $2)
        RETURNING id, name, description
        "#,
        name,
        description
    )
    .fetch_one(pool)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_tag_categories(
    state: State<'_, Mutex<AppState>>,
    tag_id: i32,
    category_ids: Vec<i32>,
) -> Result<(), String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;

    // First delete existing categories
    sqlx::query!(
        "DELETE FROM tadgh_blog.tag_categories WHERE tag_id = $1",
        tag_id
    )
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    // Then insert new categories
    for category_id in category_ids {
        sqlx::query!(
            "INSERT INTO tadgh_blog.tag_categories (tag_id, category_id) VALUES ($1, $2)",
            tag_id,
            category_id
        )
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub async fn update_category_tags(
    state: State<'_, Mutex<AppState>>,
    category_id: i32,
    tag_ids: Vec<i32>,
) -> Result<(), String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;

    // First delete existing tags for this category
    sqlx::query!(
        "DELETE FROM tadgh_blog.tag_categories WHERE category_id = $1",
        category_id
    )
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    // Then insert new tags
    for tag_id in tag_ids {
        sqlx::query!(
            "INSERT INTO tadgh_blog.tag_categories (category_id, tag_id) VALUES ($1, $2)",
            category_id,
            tag_id
        )
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub async fn update_category(
    state: State<'_, Mutex<AppState>>,
    id: i32,
    name: String,
    description: Option<String>,
) -> Result<(), String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;
    sqlx::query!(
        r#"
        UPDATE tadgh_blog.categories
        SET name = $1, description = $2
        WHERE id = $3
        "#,
        name,
        description,
        id
    )
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn delete_category(state: State<'_, Mutex<AppState>>, id: i32) -> Result<(), String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;
    sqlx::query!(
        r#"
        DELETE FROM tadgh_blog.categories
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
pub async fn remove_category_from_tag(
    state: State<'_, Mutex<AppState>>,
    tag_id: i32,
    category_id: i32,
) -> Result<(), String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;

    sqlx::query!(
        r#"
        DELETE FROM tadgh_blog.tag_categories
        WHERE tag_id = $1 AND category_id = $2
        "#,
        tag_id,
        category_id
    )
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn get_category_tags(
    state: State<'_, Mutex<AppState>>,
    category_id: i32,
) -> Result<Vec<Tag>, String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;
    sqlx::query_as!(
        Tag,
        r#"
        SELECT t.id, t.name
        FROM tadgh_blog.tags t
        JOIN tadgh_blog.tag_categories tc ON tc.tag_id = t.id
        WHERE tc.category_id = $1
        ORDER BY t.name
        "#,
        category_id
    )
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())
}
