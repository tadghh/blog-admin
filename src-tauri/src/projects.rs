use chrono::NaiveDate;
use serde::{Deserialize, Serialize};

use tauri::State;
use tokio::sync::Mutex;

use crate::AppState;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Project {
    id: Option<i32>,
    title: String,
    description: Option<String>,
    image_name: Option<String>,
    url: Option<String>,
    created: Option<NaiveDate>,
    released: bool,
    live: bool,
}

#[tauri::command]
pub async fn get_projects(state: State<'_, Mutex<AppState>>) -> Result<Vec<Project>, String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;
    sqlx::query_as!(
        Project,
        r#"
        SELECT
            id,
            title,
            description,
            image_name,
            url,
            created,
            released,
            live
        FROM tadgh_blog.projects
        ORDER BY created DESC
        "#
    )
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())
}
#[tauri::command]
pub async fn delete_project(
    state: State<'_, Mutex<AppState>>,
    project_id: i32,
) -> Result<(), String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;

    sqlx::query!(
        r#"
        DELETE FROM tadgh_blog.projects
        WHERE id = $1
        "#,
        project_id
    )
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn create_project(
    state: State<'_, Mutex<AppState>>,
    project: Project,
) -> Result<Project, String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;
    sqlx::query_as!(
        Project,
        r#"
        INSERT INTO tadgh_blog.projects
        (title, description, image_name, url, created, released, live)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, title, description, image_name, url, created, released, live
        "#,
        project.title,
        project.description,
        project.image_name,
        project.url,
        project.created,
        project.released,
        project.live
    )
    .fetch_one(pool)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_project(
    state: State<'_, Mutex<AppState>>,
    project: Project,
) -> Result<(), String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;
    sqlx::query!(
        r#"
        UPDATE tadgh_blog.projects
        SET title = $1,
            description = $2,
            image_name = $3,
            url = $4,
            created = $5,
            released = $6,
            live = $7
        WHERE id = $8
        "#,
        project.title,
        project.description,
        project.image_name,
        project.url,
        project.created,
        project.released,
        project.live,
        project.id
    )
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}
