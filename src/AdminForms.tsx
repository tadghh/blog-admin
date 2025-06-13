import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open as openFs } from "@tauri-apps/plugin-fs";
import TagSelector from "./TagSelector";
import { BlogPost, Project, Settings, Tag } from "./interfaces";
import {
	ActionButton,
	ContentCard,
	FormField,
	Tabs,
	ToggleSwitch,
	SectionDivider,
} from "./components";
import { FileUpload, Notification } from "./components/index";

const AdminForms = () => {
	const [activeTab, setActiveTab] = useState("blog");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [settings, setSettings] = useState<Settings>({
		blog_images_path: "",
		blog_folder_path: "",
	});

	// Blog post form state
	const [imageFileName, setImageFileName] = useState<string>("");
	const [blogFileName, setBlogFileName] = useState<string>("");
	const [blogImage, setImage] = useState<URL | null>(null);
	const [blogFile, setBlog] = useState<URL | null>(null);
	const [blogSelectedTags, setBlogSelectedTags] = useState<Tag[]>([]);
	const [blogPost, setBlogPost] = useState({
		title: "",
		blog_date: new Date().toISOString().split("T")[0],
		description: "",
		file_name: "",
		image_name: "",
	});

	// Project form state
	const [projectImageFileName, setProjectImageFileName] = useState<string>("");
	const [projectImage, setProjectImage] = useState<URL | null>(null);
	const [projectSelectedTags, setProjectSelectedTags] = useState<Tag[]>([]);
	const [project, setProject] = useState({
		title: "",
		description: "",
		image_name: "",
		url: "",
		created: new Date().toISOString().split("T")[0],
		live: false,
		released: false,
	});

	useEffect(() => {
		loadSettings();
	}, []);

	const loadSettings = async () => {
		try {
			const saved = await invoke<Settings>("load_settings");
			setSettings(saved);
		} catch (err) {
			setError(`Failed to load settings: ${err}`);
		}
	};

	// File upload functions
	async function uploadFile(
		webFile: URL,
		fileName: string,
		destPath: string | null | undefined
	) {
		if (!destPath) {
			throw new Error("Destination path not set");
		}

		try {
			const response = await fetch(webFile);
			const contentU8 = new Uint8Array(await response.arrayBuffer());

			const file = await openFs(destPath + "\\" + fileName, {
				write: true,
				create: true,
			});
			await file.write(contentU8);
			await file.close();
		} catch (err) {
			throw new Error(`Failed to upload file: ${err}`);
		}
	}

	// Reset blog form
	const resetBlogForm = () => {
		setBlogSelectedTags([]);
		setBlogPost({
			title: "",
			blog_date: new Date().toISOString().split("T")[0],
			description: "",
			file_name: "",
			image_name: "",
		});
		setBlog(null);
		setImage(null);
		setImageFileName("");
		setBlogFileName("");
	};

	// Reset project form
	const resetProjectForm = () => {
		setProjectSelectedTags([]);
		setProject({
			title: "",
			description: "",
			image_name: "",
			url: "",
			created: new Date().toISOString().split("T")[0],
			live: false,
			released: false,
		});
		setProjectImage(null);
		setProjectImageFileName("");
	};

	// File upload handlers
	const handleBlogImageSelect = (fileName: string, fileUrl: URL) => {
		setImageFileName(fileName);
		setImage(fileUrl);
		setBlogPost((prev) => ({
			...prev,
			image_name: fileName,
		}));
	};

	const handleBlogFileSelect = (fileName: string, fileUrl: URL) => {
		setBlogFileName(fileName);
		setBlog(fileUrl);
		setBlogPost((prev) => ({
			...prev,
			file_name: fileName,
		}));
	};

	const handleProjectImageSelect = (fileName: string, fileUrl: URL) => {
		setProjectImageFileName(fileName);
		setProjectImage(fileUrl);
		setProject((prev) => ({
			...prev,
			image_name: fileName,
		}));
	};

	// Form submission handlers
	const handleBlogSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccessMessage("");

		try {
			// Validate required fields
			if (!blogPost.title.trim()) throw new Error("Title is required");
			if (!blogPost.description.trim())
				throw new Error("Description is required");

			const formattedBlogPost = {
				...blogPost,
				created: new Date(blogPost.blog_date).toISOString().split("T")[0],
				image_name: imageFileName || blogPost.image_name,
				file_name: blogFileName || blogPost.file_name,
			};

			const createdBlogData = await invoke<BlogPost>("create_blog_post", {
				blogPost: formattedBlogPost,
			});

			if (blogSelectedTags.length > 0) {
				await invoke("add_tags_to_blog", {
					blogId: createdBlogData.id,
					tagIds: blogSelectedTags.map((tag) => tag.id),
				});
			}

			if (blogImage) {
				await uploadFile(blogImage, imageFileName, settings.blog_images_path);
			}

			if (blogFile) {
				await uploadFile(blogFile, blogFileName, settings.blog_folder_path);
			}

			// Reset form and show success message
			resetBlogForm();
			setSuccessMessage("Blog post created successfully!");
		} catch (err) {
			setError(`Failed to create blog post: ${err}`);
		} finally {
			setLoading(false);
		}
	};

	const handleProjectSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccessMessage("");

		try {
			// Validate required fields
			if (!project.title.trim()) throw new Error("Title is required");

			const formattedProject = {
				...project,
				created: new Date(project.created).toISOString().split("T")[0],
				image_name: projectImageFileName || project.image_name,
			};

			const createdProjectData = await invoke<Project>("create_project", {
				project: formattedProject,
			});

			if (projectSelectedTags.length > 0) {
				await invoke("add_tags_to_project", {
					projectId: createdProjectData.id,
					tagIds: projectSelectedTags.map((tag) => tag.id),
				});
			}

			if (projectImage) {
				await uploadFile(
					projectImage,
					projectImageFileName,
					settings.blog_images_path
				);
			}

			// Reset form and show success message
			resetProjectForm();
			setSuccessMessage("Project created successfully!");
		} catch (err) {
			setError(`Failed to create project: ${err}`);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-800">Create Content</h1>
			</div>

			{/* Notifications */}
			<Notification
				message={error}
				type="error"
				onDismiss={() => setError("")}
			/>
			<Notification
				message={successMessage}
				type="success"
				onDismiss={() => setSuccessMessage("")}
			/>

			{/* Tabs */}
			<ContentCard>
				<Tabs
					tabs={[
						{ id: "blog", label: "Blog Posts" },
						{ id: "project", label: "Projects" },
					]}
					activeTab={activeTab}
					onTabChange={setActiveTab}
				/>
			</ContentCard>

			{/* Blog Post Form */}
			{activeTab === "blog" && (
				<ContentCard>
					<div className="p-6">
						<div className="flex justify-between items-center mb-6">
							<h2 className="text-xl font-semibold">New Blog Post</h2>
							<button
								type="button"
								onClick={resetBlogForm}
								className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500">
								Clear Form
							</button>
						</div>
						<form onSubmit={handleBlogSubmit} className="space-y-6">
							{/* Image Upload */}
							<FileUpload
								label="Featured Image"
								fileName={imageFileName}
								fileUrl={blogImage}
								onFileSelect={handleBlogImageSelect}
								onError={setError}
								accept="images"
								placeholder="Click to upload blog image"
								preview={true}
							/>

							{/* Title */}
							<FormField
								label="Title"
								isEditing={true}
								editComponent={
									<input
										type="text"
										required
										className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
										value={blogPost.title}
										onChange={(e) =>
											setBlogPost({ ...blogPost, title: e.target.value })
										}
										placeholder="Enter blog post title"
									/>
								}
								displayComponent={null}
							/>

							{/* Date */}
							<FormField
								label="Date"
								isEditing={true}
								editComponent={
									<input
										type="date"
										className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
										value={blogPost.blog_date}
										onChange={(e) =>
											setBlogPost({ ...blogPost, blog_date: e.target.value })
										}
									/>
								}
								displayComponent={null}
							/>

							{/* Description */}
							<FormField
								label="Description"
								isEditing={true}
								editComponent={
									<textarea
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
										value={blogPost.description}
										onChange={(e) =>
											setBlogPost({ ...blogPost, description: e.target.value })
										}
										placeholder="Enter blog post description"
									/>
								}
								displayComponent={null}
							/>

							{/* Blog File Upload */}
							<FileUpload
								label="Content File"
								fileName={blogFileName}
								fileUrl={blogFile}
								onFileSelect={handleBlogFileSelect}
								onError={setError}
								accept="documents"
								placeholder="Click to upload content file"
								preview={false}
							/>

							{/* Tags */}
							<SectionDivider title="Tags">
								<TagSelector
									selectedTags={blogSelectedTags}
									onTagsChange={setBlogSelectedTags}
								/>
							</SectionDivider>

							{/* Submit Button */}
							<div className="flex gap-3 mt-6">
								<ActionButton
									onClick={() => {}}
									disabled={loading}
									variant="primary"
									isLoading={loading}>
									{loading ? "Creating..." : "Create Blog Post"}
								</ActionButton>
								<button
									type="button"
									onClick={resetBlogForm}
									disabled={loading}
									className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50">
									Reset
								</button>
							</div>
						</form>
					</div>
				</ContentCard>
			)}

			{/* Project Form */}
			{activeTab === "project" && (
				<ContentCard>
					<div className="p-6">
						<div className="flex justify-between items-center mb-6">
							<h2 className="text-xl font-semibold">New Project</h2>
							<button
								type="button"
								onClick={resetProjectForm}
								className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500">
								Clear Form
							</button>
						</div>
						<form onSubmit={handleProjectSubmit} className="space-y-6">
							{/* Project Image Upload */}
							<FileUpload
								label="Project Image"
								fileName={projectImageFileName}
								fileUrl={projectImage}
								onFileSelect={handleProjectImageSelect}
								onError={setError}
								accept="images"
								placeholder="Click to upload project image"
								preview={true}
							/>

							{/* Title */}
							<FormField
								label="Title"
								isEditing={true}
								editComponent={
									<input
										type="text"
										required
										className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
										value={project.title}
										onChange={(e) =>
											setProject({ ...project, title: e.target.value })
										}
										placeholder="Enter project title"
									/>
								}
								displayComponent={null}
							/>

							{/* Description */}
							<FormField
								label="Description"
								isEditing={true}
								editComponent={
									<textarea
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
										value={project.description}
										onChange={(e) =>
											setProject({
												...project,
												description: e.target.value,
											})
										}
										placeholder="Enter project description"
									/>
								}
								displayComponent={null}
							/>

							{/* Project URL */}
							<FormField
								label="Project URL"
								isEditing={true}
								editComponent={
									<input
										type="url"
										className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
										value={project.url}
										onChange={(e) =>
											setProject({ ...project, url: e.target.value })
										}
										placeholder="Enter project URL"
									/>
								}
								displayComponent={null}
							/>

							{/* Date Created */}
							<FormField
								label="Date Created"
								isEditing={true}
								editComponent={
									<input
										type="date"
										className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
										value={project.created}
										onChange={(e) =>
											setProject({ ...project, created: e.target.value })
										}
									/>
								}
								displayComponent={null}
							/>

							{/* Status Toggles */}
							<div className="space-y-4">
								<ToggleSwitch
									label="Released"
									checked={project.released}
									onChange={(checked) =>
										setProject({ ...project, released: checked })
									}
								/>

								<ToggleSwitch
									label="Live"
									checked={project.live}
									onChange={(checked) =>
										setProject({ ...project, live: checked })
									}
								/>
							</div>

							{/* Tags */}
							<SectionDivider title="Tags">
								<TagSelector
									selectedTags={projectSelectedTags}
									onTagsChange={setProjectSelectedTags}
								/>
							</SectionDivider>

							{/* Submit Button */}
							<div className="flex gap-3 mt-6">
								<ActionButton
									onClick={() => {}}
									disabled={loading}
									variant="primary"
									isLoading={loading}>
									{loading ? "Creating..." : "Create Project"}
								</ActionButton>
								<button
									type="button"
									onClick={resetProjectForm}
									disabled={loading}
									className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50">
									Reset
								</button>
							</div>
						</form>
					</div>
				</ContentCard>
			)}
		</div>
	);
};

export default AdminForms;
