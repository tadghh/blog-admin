import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { open as openFs } from "@tauri-apps/plugin-fs";
import { convertFileSrc } from "@tauri-apps/api/core";
import TagSelector from "./tag-selector";
import { Settings, Tag } from "./interfaces";

interface BlogPost {
	id: number;
	title: string;
	blog_date: string;
	description: string;
	image_path: string | "";
	file_name: string;
	isEditing?: boolean;
}

interface Project {
	id: number;
	title: string;
	project_description: string | null;
	image_path: string | null;
	project_url: string | null;
	date_created: string;
	project_status: string | null;
	license: string | null;
	isEditing?: boolean;
}

const EditForms = () => {
	const [activeTab, setActiveTab] = useState("blog");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [settings, setSettings] = useState<Settings>({
		blog_images_path: "",
		blog_folder_path: "",
	});
	const [tagsByBlogId, setTagsByBlogId] = useState<Record<number, Tag[]>>({});
	const [tagsByProjectId, setTagsByProjectId] = useState<Record<number, Tag[]>>(
		{}
	);

	const updateBlogPost = (id: number, field: keyof BlogPost, value: any) => {
		setBlogPosts(
			blogPosts.map((post) =>
				post.id === id ? { ...post, [field]: value } : post
			)
		);
	};

	const updateBlogImage = (post: BlogPost) => {
		open({
			directory: false,
			multiple: false,
		}).then(async (data) => {
			if (data) {
				let webImage = new URL(convertFileSrc(data));
				const fileName = data.substring(data.lastIndexOf("\\") + 1);
				updateBlogPost(post.id, "image_path", fileName);

				const formattedBlogPost = {
					...post,
					image_path: fileName,
				};

				if (webImage) {
					uploadBlogImage(webImage, fileName);
					await invoke("update_blog_post", { blogPost: formattedBlogPost });
				}
			}
		});
	};

	const loadSettings = async () => {
		const saved = await invoke<Settings>("load_settings");
		setSettings(saved);
	};

	async function uploadBlogImage(webImage: URL, imageName: String) {
		const response = await fetch(webImage);
		const imagePathRoot = settings.blog_images_path;
		const imageU8 = new Uint8Array(await response.arrayBuffer());

		const file = await openFs(imagePathRoot + "\\" + imageName, {
			write: true,
			create: true,
		});
		await file.write(imageU8);
		await file.close();
	}

	const fetchData = async () => {
		setLoading(true);
		try {
			const [blogData, projectData] = await Promise.all([
				invoke<BlogPost[]>("get_blog_posts"),
				invoke<Project[]>("get_projects"),
			]);

			// Fetch tags for each blog post
			const blogTags = await Promise.all(
				blogData.map(async (post) => {
					const tags = await invoke<Tag[]>("get_blog_tags", {
						blogId: post.id,
					});
					return { id: post.id, tags };
				})
			);

			// Fetch tags for each project
			const projectTags = await Promise.all(
				projectData.map(async (project) => {
					const tags = await invoke<Tag[]>("get_project_tags", {
						projectId: project.id,
					});
					return { id: project.id, tags };
				})
			);

			setTagsByBlogId(
				Object.fromEntries(blogTags.map(({ id, tags }) => [id, tags]))
			);
			setTagsByProjectId(
				Object.fromEntries(projectTags.map(({ id, tags }) => [id, tags]))
			);
			setBlogPosts(blogData.map((post) => ({ ...post, isEditing: false })));
			setProjects(projectData.map((proj) => ({ ...proj, isEditing: false })));
		} catch (err) {
			setError(err as string);
		} finally {
			setLoading(false);
		}
	};

	const saveBlogChanges = async (post: BlogPost) => {
		setLoading(true);
		try {
			await invoke("update_blog_post", { blogPost: post });
			toggleBlogEdit(post.id);
			await fetchData(); // Refresh data after update
		} catch (err) {
			setError(err as string);
		} finally {
			setLoading(false);
		}
	};

	// Project editing functions
	const toggleProjectEdit = (id: number) => {
		setProjects(
			projects.map((project) =>
				project.id === id
					? { ...project, isEditing: !project.isEditing }
					: project
			)
		);
	};

	// Blog post editing functions
	const toggleBlogEdit = (id: number) => {
		setBlogPosts(
			blogPosts.map((post) =>
				post.id === id ? { ...post, isEditing: !post.isEditing } : post
			)
		);
	};

	const updateProject = (id: number, field: keyof Project, value: any) => {
		setProjects(
			projects.map((project) =>
				project.id === id ? { ...project, [field]: value } : project
			)
		);
	};

	const saveProjectChanges = async (project: Project) => {
		setLoading(true);
		try {
			await invoke("update_project", { project });
			toggleProjectEdit(project.id);
			await fetchData(); // Refresh data after update
		} catch (err) {
			setError(err as string);
		} finally {
			setLoading(false);
		}
	};

	const deleteItem = async (id: number, type: "blog" | "project") => {
		if (!confirm("Are you sure you want to delete this item?")) return;

		setLoading(true);
		try {
			if (type === "blog") {
				await invoke("delete_blog_post", { id });
				setBlogPosts(blogPosts.filter((post) => post.id !== id));
			} else {
				await invoke("delete_project", { id });
				setProjects(projects.filter((project) => project.id !== id));
			}
		} catch (err) {
			setError(err as string);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadSettings();
		fetchData();
	}, []);

	if (loading && !blogPosts.length && !projects.length) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="w-12 h-12 rounded-full border-b-2 border-blue-500 animate-spin"></div>
			</div>
		);
	}

	return (
		<div className="container p-4 mx-auto">
			{/* Error Display */}
			{error && (
				<div className="relative px-4 py-3 mb-4 text-red-700 bg-red-100 rounded border border-red-400">
					{error}
				</div>
			)}

			{/* Tabs */}
			<div className="flex mb-6">
				<button
					className={`flex-1 py-2 px-4 text-center border-b-2 ${
						activeTab === "blog"
							? "border-blue-500 text-blue-500"
							: "border-gray-200 text-gray-500 hover:text-gray-700"
					}`}
					onClick={() => setActiveTab("blog")}>
					Blog Posts
				</button>
				<button
					className={`flex-1 py-2 px-4 text-center border-b-2 ${
						activeTab === "project"
							? "border-blue-500 text-blue-500"
							: "border-gray-200 text-gray-500 hover:text-gray-700"
					}`}
					onClick={() => setActiveTab("project")}>
					Projects
				</button>
			</div>

			{/* Blog Posts Table */}

			{activeTab === "blog" && (
				<div className="overflow-x-auto">
					<div className="space-y-4">
						{blogPosts.map((post) => (
							<div>
								<div
									key={post.id}
									className="flex flex-wrap gap-4 items-center p-4 bg-white rounded-md border">
									{/* Thumbnail */}
									<div
										onClick={() => updateBlogImage(post)}
										className="flex-shrink-0 cursor-pointer">
										<img
											alt={post.title}
											src={`${convertFileSrc(
												settings.blog_images_path + "/" + post.image_path
											)}`}
											className="object-cover w-20 h-20 rounded border-2 border-gray-300 hover:border-gray-400"
										/>
									</div>

									{/* Title */}
									<div className="flex-1 min-w-[150px]">
										{post.isEditing ? (
											<input
												type="text"
												className="px-2 py-1 w-full rounded border"
												value={post.title}
												onChange={(e) =>
													updateBlogPost(post.id, "title", e.target.value)
												}
											/>
										) : (
											<span className="text-sm text-gray-500">
												{post.title}
											</span>
										)}
									</div>

									{/* Date */}
									<div className="flex-1 min-w-[100px]">
										{post.isEditing ? (
											<input
												type="date"
												className="px-2 py-1 w-full rounded border"
												value={post.blog_date}
												onChange={(e) =>
													updateBlogPost(post.id, "blog_date", e.target.value)
												}
											/>
										) : (
											<span className="text-sm text-gray-500">
												{post.blog_date}
											</span>
										)}
									</div>

									{/* Description */}
									<div className="flex-1 min-w-[200px]">
										{post.isEditing ? (
											<textarea
												className="px-2 py-1 w-full rounded border"
												value={post.description}
												onChange={(e) =>
													updateBlogPost(post.id, "description", e.target.value)
												}
											/>
										) : (
											<span className="text-sm text-gray-500">
												{post.description}
											</span>
										)}
									</div>

									{/* Actions */}
									<div className="flex gap-2">
										{post.isEditing ? (
											<button
												onClick={() => saveBlogChanges(post)}
												disabled={loading}
												className="px-3 py-1 text-green-600 hover:text-green-900 disabled:opacity-50">
												Save
											</button>
										) : (
											<button
												onClick={() => toggleBlogEdit(post.id)}
												className="px-3 py-1 text-blue-600 hover:text-blue-900">
												Edit
											</button>
										)}
										<button
											onClick={() => deleteItem(post.id, "blog")}
											disabled={loading}
											className="px-3 py-1 text-red-600 hover:text-red-900 disabled:opacity-50">
											Delete
										</button>
									</div>
								</div>
								<div className="mt-4">
									<div key={post.id} className="p-4 mb-4 border-b">
										{post.isEditing ? (
											<TagSelector
												selectedTags={tagsByBlogId[post.id] || []}
												onTagsChange={async (tags) => {
													await invoke("update_blog_tags", {
														blogId: post.id,
														tagIds: tags.map((t) => t.id),
													});
													setTagsByBlogId({
														...tagsByBlogId,
														[post.id]: tags,
													});
												}}
											/>
										) : (
											<div className="flex flex-wrap gap-1">
												{(tagsByBlogId[post.id] || []).map((tag) => (
													<span
														key={tag.id}
														className="px-2 py-1 text-xs bg-gray-100 rounded-full">
														{tag.name}
													</span>
												))}
											</div>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
			{/* Projects Table */}
			{activeTab === "project" && (
				<div className="overflow-x-auto">
					<div className="space-y-4">
						{projects.map((project) => (
							<div key={project.id}>
								<div className="flex flex-wrap gap-4 items-center p-4 bg-white rounded-md border">
									{/* Title */}
									<div className="flex-1 px-6">
										{project.isEditing ? (
											<input
												type="text"
												className="px-2 py-1 w-full rounded border"
												value={project.title}
												onChange={(e) =>
													updateProject(project.id, "title", e.target.value)
												}
											/>
										) : (
											<span className="text-sm font-medium text-gray-900">
												{project.title}
											</span>
										)}
									</div>

									{/* Status */}
									<div className="flex-1 px-6">
										{project.isEditing ? (
											<input
												type="text"
												className="px-2 py-1 w-full rounded border"
												value={project.project_status || ""}
												onChange={(e) =>
													updateProject(
														project.id,
														"project_status",
														e.target.value
													)
												}
											/>
										) : (
											<span className="text-sm text-gray-500">
												{project.project_status}
											</span>
										)}
									</div>

									{/* Description */}
									<div className="flex-1 px-6">
										{project.isEditing ? (
											<textarea
												className="px-2 py-1 w-full rounded border"
												value={project.project_description || ""}
												onChange={(e) =>
													updateProject(
														project.id,
														"project_description",
														e.target.value
													)
												}
											/>
										) : (
											<span className="text-sm text-gray-500">
												{project.project_description}
											</span>
										)}
									</div>

									{/* URL */}
									<div className="flex-1 px-6">
										{project.isEditing ? (
											<input
												type="url"
												className="px-2 py-1 w-full rounded border"
												value={project.project_url || ""}
												onChange={(e) =>
													updateProject(
														project.id,
														"project_url",
														e.target.value
													)
												}
											/>
										) : (
											<a
												href={project.project_url || "#"}
												className="text-blue-600 hover:text-blue-900"
												target="_blank"
												rel="noopener noreferrer">
												{project.project_url?.substring(0, 29)}
											</a>
										)}
									</div>

									{/* Actions */}
									<div className="flex gap-2">
										{project.isEditing ? (
											<button
												onClick={() => saveProjectChanges(project)}
												disabled={loading}
												className="text-green-600 hover:text-green-900 disabled:opacity-50">
												Save
											</button>
										) : (
											<button
												onClick={() => toggleProjectEdit(project.id)}
												className="text-blue-600 hover:text-blue-900">
												Edit
											</button>
										)}
										<button
											onClick={() => deleteItem(project.id, "project")}
											disabled={loading}
											className="ml-2 text-red-600 hover:text-red-900 disabled:opacity-50">
											Delete
										</button>
									</div>
								</div>
								<div className="mt-4">
									<div key={project.id} className="p-4 mb-4 border-b">
										{project.isEditing ? (
											<TagSelector
												selectedTags={tagsByProjectId[project.id] || []}
												onTagsChange={async (tags) => {
													await invoke("update_project_tags", {
														projectId: project.id,
														tagIds: tags.map((t) => t.id),
													});
													setTagsByProjectId({
														...tagsByProjectId,
														[project.id]: tags,
													});
												}}
											/>
										) : (
											<div className="flex flex-wrap gap-1 w-auto h-auto">
												{(tagsByProjectId[project.id] || []).map((tag) => (
													<span
														key={tag.id}
														className="px-2 py-1 text-xs bg-gray-100 rounded-full">
														{tag.name}
													</span>
												))}
											</div>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default EditForms;
