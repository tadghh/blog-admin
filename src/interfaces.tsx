export interface BlogPost {
	id: number; // Serial primary key from PostgreSQL
	title: string; // Required
	blog_date: string; // Required, date in ISO format
	description: string; // Required
	image_path: string | null; // Optional
	file_name: string; // Required
}

export interface BlogPostWithViews {
	id: number;
	title: string;
	created: string;
	description: string;
	image_name: string | null;
	file_name: string;
	view_count: number;
}

export interface BlogPostView {
	id: number;
	blog_post_id: number;
	ip_address: string;
}

export interface Project {
	id: number;
	title: string;
	project_description: string | null;
	image_path: string | null;
	project_url: string | null;
	date_created: string; // ISO date string
	project_status: string | null;
	license: string | null;
}

export interface DatabaseConnectionInfo {
	host: string;
	port: string;
	database: string;
	username: string;
	password: string;
}

export interface Profile {
	name: string;
	database_connection: DatabaseConnectionInfo;
	blog_images_path: string | null;
	blog_folder_path: string | null;
	created_at?: string | null;
}

export interface Settings {
	// New profile-based structure
	profiles?: Profile[];
	current_profile?: string | null;

	// Legacy fields for backward compatibility
	blog_images_path?: string | null | undefined;
	blog_folder_path?: string | null | undefined;
	database_connection?: DatabaseConnectionInfo | null;
	save_database_connection?: boolean | null;
}

export interface DatabaseConnectionProps {
	onConnected: (connected: boolean) => void;
}

export interface Tag {
	id: number;
	name: string;
}

export interface Category {
	id: number;
	name: string;
	description?: string | null;
}
