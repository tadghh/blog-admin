export interface BlogPost {
	id: number; // Serial primary key from PostgreSQL
	title: string; // Required
	blog_date: string; // Required, date in ISO format
	description: string; // Required
	image_path: string | null; // Optional
	file_name: string; // Required
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

export interface Settings {
	blog_images_path: string | null;
	blog_folder_path: string | null;
}

export interface DatabaseConnectionProps {
	onConnected: (connected: boolean) => void;
}

export interface Tag {
	id: number;
	name: string;
}
