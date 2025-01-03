use chrono::NaiveDate;
use serde::{Deserialize, Serialize};

use tauri::State;
use tokio::sync::Mutex;

use crate::AppState;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Project {
    id: Option<i32>,
    title: String,
    project_description: Option<String>,
    image_path: Option<String>,
    project_url: Option<String>,
    date_created: Option<NaiveDate>,
    project_status: Option<String>,
    license: Option<String>,
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
