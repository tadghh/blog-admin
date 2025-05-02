import { useState, useEffect } from "react";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { open as openFs } from "@tauri-apps/plugin-fs";
import TagSelector from "./TagSelector";
import { BlogPost, Project, Settings, Tag } from "./interfaces";
import {
	ActionButton,
	ContentCard,
	ErrorMessage,
	FormField,
	Tabs,
	ToggleSwitch,
	SectionDivider,
	ImageIcon,
} from "./components";

const AdminForms = () => {
	const [activeTab, setActiveTab] = useState("blog");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [settings, setSettings] = useState<Settings>({
		blog_images_path: "",
		blog_folder_path: "",
	});

	// Blog post form state
	const [imageFileName, setImageFileName] = useState<string>("");
	const [blogFileName, setBlogFileName] = useState<string>("");
	const [blogImage, setImage] = useState<any>();
	const [blogFile, setBlog] = useState<any>();
	const [blogSelectedTags, setBlogSelectedTags] = useState<Tag[]>([]);
	const [blogPost, setBlogPost] = useState({
		title: "",
		blog_date: new Date().toISOString().split("T")[0],
		description: "",
		file_name: "",
		image_name: "", // Changed from image_path to match the API
	});

	// Project form state
	const [projectImageFileName, setProjectImageFileName] = useState<string>("");
	const [projectImage, setProjectImage] = useState<any>();
	const [projectSelectedTags, setProjectSelectedTags] = useState<Tag[]>([]);
	const [project, setProject] = useState({
		title: "",
		description: "",
		image_name: "", // Changed from image_path to match the API
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

	// Image uploaders
	const updateBlogImage = async () => {
		try {
			const data = await open({
				directory: false,
				multiple: false,
				filters: [
					{
						name: "Images",
						extensions: ["png", "jpg", "jpeg", "gif", "webp"],
					},
				],
			});

			if (data) {
				const fileName = data.substring(data.lastIndexOf("\\") + 1);
				setImageFileName(fileName);
				setImage(new URL(convertFileSrc(data)));
				// Update the blogPost state with the new image name
				setBlogPost((prev) => ({
					...prev,
					image_name: fileName,
				}));
			}
		} catch (err) {
			setError(`Error selecting image: ${err}`);
		}
	};

	const updateProjectImage = async () => {
		try {
			const data = await open({
				directory: false,
				multiple: false,
				filters: [
					{
						name: "Images",
						extensions: ["png", "jpg", "jpeg", "gif", "webp"],
					},
				],
			});

			if (data) {
				const fileName = data.substring(data.lastIndexOf("\\") + 1);
				setProjectImageFileName(fileName);
				setProjectImage(new URL(convertFileSrc(data)));
				// Update the project state with the new image name
				setProject((prev) => ({
					...prev,
					image_name: fileName,
				}));
			}
		} catch (err) {
			setError(`Error selecting image: ${err}`);
		}
	};

	const updateBlogFile = async () => {
		try {
			const data = await open({
				directory: false,
				multiple: false,
				filters: [
					{
						name: "Markdown",
						extensions: ["md", "markdown", "txt", "html"],
					},
				],
			});

			if (data) {
				const fileName = data.substring(data.lastIndexOf("\\") + 1);
				setBlogFileName(fileName);
				setBlog(new URL(convertFileSrc(data)));
				// Update the blogPost state with the new file name
				setBlogPost((prev) => ({
					...prev,
					file_name: fileName,
				}));
			}
		} catch (err) {
			setError(`Error selecting file: ${err}`);
		}
	};

	// File upload functions
	async function uploadFile(
		webFile: URL,
		fileName: string,
		destPath: string | null
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

	// Form submission handlers
	const handleBlogSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			// Validate required fields
			if (!blogPost.title.trim()) {
				throw new Error("Title is required");
			}
			if (!blogPost.description.trim()) {
				throw new Error("Description is required");
			}

			const formattedBlogPost = {
				...blogPost,
				created: new Date(blogPost.blog_date).toISOString().split("T")[0],
				image_name: imageFileName || blogPost.image_name,
				file_name: blogFileName || blogPost.file_name,
			};

			console.log("Submitting blog post:", formattedBlogPost);

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

			// Reset form
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

			// Show success message or navigate
			alert("Blog post created successfully!");
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

		try {
			// Validate required fields
			if (!project.title.trim()) {
				throw new Error("Title is required");
			}

			const formattedProject = {
				...project,
				created: new Date(project.created).toISOString().split("T")[0],
				image_name: projectImageFileName || project.image_name,
			};

			console.log("Submitting project:", formattedProject);

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
					settings.blog_images_path // Make sure this is correct for project images
				);
			}

			// Reset form
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

			// Show success message or navigate
			alert("Project created successfully!");
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

			{/* Error Display */}
			<ErrorMessage message={error} onDismiss={() => setError("")} />

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
						<h2 className="mb-6 text-xl font-semibold">New Blog Post</h2>
						<form onSubmit={handleBlogSubmit} className="space-y-6">
							{/* Image Upload */}
							<div className="space-y-2">
								<label className="block text-sm font-medium text-gray-700">
									Featured Image
								</label>
								<div
									onClick={updateBlogImage}
									className="cursor-pointer border-2 border-dashed border-gray-300 rounded-md p-4 hover:border-blue-500 transition-colors">
									{blogImage ? (
										<div className="flex flex-col items-center">
											<img
												alt="Blog thumbnail"
												src={blogImage.toString()}
												className="max-h-48 object-contain mb-2"
											/>
											<span className="text-sm text-gray-500">
												{imageFileName}
											</span>
										</div>
									) : (
										<div className="flex flex-col items-center py-6">
											<ImageIcon />
											<span className="mt-2 text-sm text-gray-500">
												Click to upload image
											</span>
										</div>
									)}
								</div>
							</div>

							{/* Title */}
							<FormField
								label="Title"
								isEditing={true}
								editComponent={
									<input
										type="text"
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
										className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
							<div className="space-y-2">
								<label className="block text-sm font-medium text-gray-700">
									Content File
								</label>
								<div
									onClick={updateBlogFile}
									className="cursor-pointer border-2 border-dashed border-gray-300 rounded-md p-4 hover:border-blue-500 transition-colors">
									{blogFile ? (
										<div className="flex flex-col items-center">
											<div className="bg-gray-100 p-4 rounded-md">
												<span className="font-mono">{blogFileName}</span>
											</div>
										</div>
									) : (
										<div className="flex flex-col items-center py-6">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-10 w-10 text-gray-400"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor">
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
												/>
											</svg>
											<span className="mt-2 text-sm text-gray-500">
												Click to upload content file
											</span>
										</div>
									)}
								</div>
							</div>

							{/* Tags */}
							<SectionDivider title="Tags">
								<TagSelector
									selectedTags={blogSelectedTags}
									onTagsChange={setBlogSelectedTags}
								/>
							</SectionDivider>

							{/* Submit Button */}
							<div className="mt-4">
								<ActionButton
									onClick={() => {}}
									disabled={loading}
									variant="primary"
									isLoading={loading}>
									{loading ? "Creating..." : "Create Blog Post"}
								</ActionButton>
							</div>
						</form>
					</div>
				</ContentCard>
			)}

			{/* Project Form */}
			{activeTab === "project" && (
				<ContentCard>
					<div className="p-6">
						<h2 className="mb-6 text-xl font-semibold">New Project</h2>
						<form onSubmit={handleProjectSubmit} className="space-y-6">
							{/* Project Image Upload */}
							<div className="space-y-2">
								<label className="block text-sm font-medium text-gray-700">
									Project Image
								</label>
								<div
									onClick={updateProjectImage}
									className="cursor-pointer border-2 border-dashed border-gray-300 rounded-md p-4 hover:border-blue-500 transition-colors">
									{projectImage ? (
										<div className="flex flex-col items-center">
											<img
												alt="Project thumbnail"
												src={projectImage.toString()}
												className="max-h-48 object-contain mb-2"
											/>
											<span className="text-sm text-gray-500">
												{projectImageFileName}
											</span>
										</div>
									) : (
										<div className="flex flex-col items-center py-6">
											<ImageIcon />
											<span className="mt-2 text-sm text-gray-500">
												Click to upload project image
											</span>
										</div>
									)}
								</div>
							</div>

							{/* Title */}
							<FormField
								label="Title"
								isEditing={true}
								editComponent={
									<input
										type="text"
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
										type="input"
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
										className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
							<div className="mt-4">
								<ActionButton
									onClick={() => {}}
									disabled={loading}
									variant="primary"
									isLoading={loading}>
									{loading ? "Creating..." : "Create Project"}
								</ActionButton>
							</div>
						</form>
					</div>
				</ContentCard>
			)}
		</div>
	);
};

export default AdminForms;
