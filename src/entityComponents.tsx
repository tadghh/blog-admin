import React from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import TagSelector from "./TagSelector";
import { Tag } from "./interfaces";
import {
	ActionButton,
	FormField,
	SectionDivider,
	TagDisplay,
	ToggleSwitch,
} from "./components";
import { EditIcon, SaveIcon, DeleteIcon, ImageIcon } from "./Icons";

// Types
export interface BlogPost {
	id: number;
	title: string;
	created: string;
	description: string;
	image_name: string | "";
	file_name: string;
	isEditing?: boolean;
}

export interface Project {
	id: number;
	title: string;
	description: string | null;
	image_name: string | null;
	url: string | null;
	created: string;
	released: boolean | false;
	live: boolean | false;
	isEditing?: boolean;
}

// Type guard to check if entity is BlogPost or Project
function isBlogPost(entity: BlogPost | Project): entity is BlogPost {
	return (
		(entity as BlogPost).file_name !== undefined &&
		(entity as Project).released === undefined
	);
}

// BlogPost component
interface BlogPostProps {
	post: BlogPost;
	imagesPath: string;
	tagsByBlogId: Record<number, Tag[]>;
	loading: boolean;
	onEdit: (id: number) => void;
	onSave: (post: BlogPost) => Promise<void>;
	onDelete: (id: number, type: "blog" | "project") => Promise<void>;
	onUpdate: (id: number, field: keyof BlogPost, value: any) => void;
	onUpdateImage: (post: BlogPost) => void;
	onUpdateTags: (blogId: number, tags: Tag[]) => Promise<void>;
	setError: (error: string) => void;
}

export const BlogPostItem: React.FC<BlogPostProps> = ({
	post,
	imagesPath,
	tagsByBlogId,
	loading,
	onEdit,
	onSave,
	onDelete,
	onUpdate,
	onUpdateImage,
	onUpdateTags,
	setError,
}) => {
	return (
		<div className="p-6">
			<div className="flex flex-col gap-4 sm:flex-row">
				{/* Thumbnail */}
				<div
					onClick={() => !post.isEditing && onUpdateImage(post)}
					className={`flex-shrink-0 ${
						!post.isEditing ? "cursor-pointer" : ""
					}`}>
					{post.image_name ? (
						<img
							alt={post.title}
							src={`${convertFileSrc(imagesPath + "/" + post.image_name)}`}
							className="object-cover w-24 h-24 rounded-md border border-gray-200"
						/>
					) : (
						<div className="flex justify-center items-center w-24 h-24 bg-gray-100 rounded-md border border-gray-200">
							<ImageIcon />
						</div>
					)}
				</div>

				{/* Content */}
				<div className="flex-1 space-y-3">
					<FormField
						label="Title"
						isEditing={post.isEditing || false}
						editComponent={
							<input
								type="text"
								className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
								value={post.title}
								onChange={(e) => onUpdate(post.id, "title", e.target.value)}
							/>
						}
						displayComponent={
							<h3 className="text-lg font-medium text-gray-800">
								{post.title}
							</h3>
						}
					/>

					<FormField
						label="Date"
						isEditing={post.isEditing || false}
						editComponent={
							<input
								type="date"
								className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
								value={post.created}
								onChange={(e) => onUpdate(post.id, "created", e.target.value)}
							/>
						}
						displayComponent={
							<p className="text-sm text-gray-600">
								{new Date(post.created).toLocaleDateString()}
							</p>
						}
					/>

					<FormField
						label="Description"
						isEditing={post.isEditing || false}
						editComponent={
							<textarea
								className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
								value={post.description}
								onChange={(e) =>
									onUpdate(post.id, "description", e.target.value)
								}
								rows={3}
							/>
						}
						displayComponent={
							<p className="text-sm text-gray-600">{post.description}</p>
						}
					/>
				</div>

				{/* Actions */}
				<div className="flex flex-row gap-2 justify-end sm:flex-col">
					{post.isEditing ? (
						<>
							<ActionButton
								onClick={() => onSave(post)}
								disabled={loading}
								variant="success"
								icon={<SaveIcon />}
								isLoading={loading}>
								Save
							</ActionButton>
							<ActionButton
								onClick={() => onEdit(post.id)} // Toggle editing off
								disabled={loading}
								variant="danger"
								icon={<DeleteIcon />}>
								Cancel
							</ActionButton>
						</>
					) : (
						<ActionButton
							onClick={() => onEdit(post.id)}
							variant="primary"
							icon={<EditIcon />}>
							Edit
						</ActionButton>
					)}
					<ActionButton
						onClick={() => onDelete(post.id, "blog")}
						disabled={loading}
						variant="danger"
						icon={<DeleteIcon />}>
						Delete
					</ActionButton>
				</div>
			</div>

			{/* Tags section */}
			<SectionDivider title="Tags">
				{post.isEditing ? (
					<TagSelector
						selectedTags={tagsByBlogId[post.id] || []}
						onTagsChange={async (tags) => {
							try {
								await onUpdateTags(post.id, tags);
							} catch (e) {
								setError(e as string);
							}
						}}
					/>
				) : (
					<TagDisplay tags={tagsByBlogId[post.id] || []} />
				)}
			</SectionDivider>
		</div>
	);
};

// Project component
interface ProjectProps {
	project: Project;
	tagsByProjectId: Record<number, Tag[]>;
	loading: boolean;
	onEdit: (id: number) => void;
	onSave: (project: Project) => Promise<void>;
	onDelete: (id: number, type: "blog" | "project") => Promise<void>;
	onUpdate: (id: number, field: keyof Project, value: any) => void;
	onUpdateImage?: (project: Project) => void;
	onUpdateTags: (projectId: number, tags: Tag[]) => Promise<void>;
	setError: (error: string) => void;
	imagesPath: string;
}

export const ProjectItem: React.FC<ProjectProps> = ({
	project,
	tagsByProjectId,
	loading,
	onEdit,
	onSave,
	onDelete,
	onUpdate,
	onUpdateImage,
	onUpdateTags,
	setError,
	imagesPath,
}) => {
	return (
		<div className="p-6">
			<div className="flex flex-col gap-4 lg:flex-row">
				{/* Project Image (if image upload enabled) */}
				{onUpdateImage && (
					<div
						onClick={() => !project.isEditing && onUpdateImage(project)}
						className={`flex-shrink-0 ${
							!project.isEditing ? "cursor-pointer" : ""
						}`}>
						{project.image_name ? (
							<img
								alt={project.title}
								src={`${convertFileSrc(imagesPath + "/" + project.image_name)}`}
								className="object-cover w-24 h-24 rounded-md border border-gray-200"
							/>
						) : (
							<div className="flex justify-center items-center w-24 h-24 bg-gray-100 rounded-md border border-gray-200">
								<ImageIcon />
							</div>
						)}
					</div>
				)}

				{/* Main Content */}
				<div className="flex-1 space-y-4">
					<FormField
						label="Title"
						isEditing={project.isEditing || false}
						editComponent={
							<input
								type="text"
								className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
								value={project.title}
								onChange={(e) => onUpdate(project.id, "title", e.target.value)}
							/>
						}
						displayComponent={
							<h3 className="text-lg font-medium text-gray-800">
								{project.title}
							</h3>
						}
					/>

					<FormField
						label="Description"
						isEditing={project.isEditing || false}
						editComponent={
							<textarea
								className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
								value={project.description || ""}
								onChange={(e) =>
									onUpdate(project.id, "description", e.target.value)
								}
								rows={3}
							/>
						}
						displayComponent={
							<p className="text-sm text-gray-600">
								{project.description || "No description provided"}
							</p>
						}
					/>

					<FormField
						label="Project URL"
						isEditing={project.isEditing || false}
						editComponent={
							<input
								type="url"
								className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
								value={project.url || ""}
								onChange={(e) => onUpdate(project.id, "url", e.target.value)}
							/>
						}
						displayComponent={
							<div>
								{project.url ? (
									<a
										href={project.url}
										className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
										target="_blank"
										rel="noopener noreferrer">
										{project.url}
									</a>
								) : (
									<span className="text-sm text-gray-500">No URL provided</span>
								)}
							</div>
						}
					/>
				</div>

				{/* Status and Actions */}
				<div className="space-y-4 lg:w-64">
					{/* Status Toggles */}
					<div className="space-y-2">
						<ToggleSwitch
							label="Released"
							checked={project.released}
							onChange={(checked) => onUpdate(project.id, "released", checked)}
							disabled={!project.isEditing}
						/>

						<ToggleSwitch
							label="Live"
							checked={project.live}
							onChange={(checked) => onUpdate(project.id, "live", checked)}
							disabled={!project.isEditing}
						/>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col gap-2 mt-4">
						{project.isEditing ? (
							<>
								<ActionButton
									onClick={() => onSave(project)}
									disabled={loading}
									variant="success"
									icon={<SaveIcon />}
									isLoading={loading}>
									Save
								</ActionButton>

								<ActionButton
									onClick={() => onEdit(project.id)} // Toggle editing off
									disabled={loading}
									variant="danger"
									icon={<DeleteIcon />}>
									Cancel
								</ActionButton>
							</>
						) : (
							<ActionButton
								onClick={() => onEdit(project.id)}
								variant="primary"
								icon={<EditIcon />}>
								Edit
							</ActionButton>
						)}
						<ActionButton
							onClick={() => onDelete(project.id, "project")}
							disabled={loading}
							variant="danger"
							icon={<DeleteIcon />}>
							Delete
						</ActionButton>
					</div>
				</div>
			</div>

			{/* Tags section */}
			<SectionDivider title="Tags">
				{project.isEditing ? (
					<TagSelector
						selectedTags={tagsByProjectId[project.id] || []}
						onTagsChange={async (tags) => {
							try {
								await onUpdateTags(project.id, tags);
							} catch (e) {
								setError(e as string);
							}
						}}
					/>
				) : (
					<TagDisplay tags={tagsByProjectId[project.id] || []} />
				)}
			</SectionDivider>
		</div>
	);
};

/**
 * Generic image uploader that works for both blog posts and projects
 */
export const createImageUploader = (settings: {
	blog_images_path?: string | null;
	blog_folder_path?: string | null;
}) => {
	return async <T extends BlogPost | Project>(
		entity: T,
		setLoading: (loading: boolean) => void,
		setError: (error: string) => void,
		updateEntity: (id: number, field: string, value: any) => void
	) => {
		try {
			const result = await open({
				directory: false,
				multiple: false,
				filters: [
					{
						name: "Images",
						extensions: ["png", "jpg", "jpeg", "gif", "webp"],
					},
				],
			});

			if (!result) return; // User cancelled

			const webImage = new URL(convertFileSrc(result));
			const fileName = result.substring(result.lastIndexOf("\\") + 1);

			// Update entity with new image name
			updateEntity(entity.id, "image_name", fileName);

			// Create updated entity with new image name
			const formattedEntity = {
				...entity,
				image_name: fileName,
			};

			if (webImage) {
				setLoading(true);
				try {
					// Upload image
					const response = await fetch(webImage);
					const imagePathRoot = settings.blog_images_path;
					if (!imagePathRoot) {
						throw new Error("Image path not set in settings");
					}

					const imageU8 = new Uint8Array(await response.arrayBuffer());

					// Use Tauri fs API to write the file
					const { open: openFs } = await import("@tauri-apps/plugin-fs");
					const file = await openFs(imagePathRoot + "\\" + fileName, {
						write: true,
						create: true,
					});
					await file.write(imageU8);
					await file.close();

					// Update entity in database
					if (isBlogPost(entity)) {
						await invoke("update_blog_post", { blogPost: formattedEntity });
					} else {
						await invoke("update_project", { project: formattedEntity });
					}
				} catch (err) {
					setError(`Failed to update image: ${err}`);
				} finally {
					setLoading(false);
				}
			}
		} catch (err) {
			setError(`Error selecting image: ${err}`);
		}
	};
};

/**
 * Blog-specific image uploader
 */
export const createBlogImageUploader = (settings: {
	blog_images_path?: string | null;
	blog_folder_path?: string | null;
}) => {
	const imageUploader = createImageUploader(settings);

	return (
		post: BlogPost,
		setLoading: (loading: boolean) => void,
		setError: (error: string) => void,
		updateBlogPost: (id: number, field: keyof BlogPost, value: any) => void
	) => {
		// Create a wrapper function that converts the strongly-typed function to a more generic one
		const genericUpdateFn = (id: number, field: string, value: any) => {
			// Cast the field to keyof BlogPost since we're working with a blog post
			updateBlogPost(id, field as keyof BlogPost, value);
		};

		return imageUploader<BlogPost>(post, setLoading, setError, genericUpdateFn);
	};
};

/**
 * Project-specific image uploader
 */
export const createProjectImageUploader = (settings: {
	blog_images_path?: string | null;
	blog_folder_path?: string | null;
}) => {
	const imageUploader = createImageUploader(settings);

	return (
		project: Project,
		setLoading: (loading: boolean) => void,
		setError: (error: string) => void,
		updateProject: (id: number, field: keyof Project, value: any) => void
	) => {
		// Create a wrapper function that converts the strongly-typed function to a more generic one
		const genericUpdateFn = (id: number, field: string, value: any) => {
			// Cast the field to keyof Project since we're working with a project
			updateProject(id, field as keyof Project, value);
		};

		return imageUploader<Project>(
			project,
			setLoading,
			setError,
			genericUpdateFn
		);
	};
};
