import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import React, { useState, useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import TagSelector from "./tag-selector";
import { open as openFs } from "@tauri-apps/plugin-fs";
import { BlogPost, Project, Settings, Tag } from "./interfaces";

const AdminForms = () => {
	const [activeTab, setActiveTab] = useState("blog");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [settings, setSettings] = useState<Settings>({
		blog_images_path: "",
		blog_folder_path: "",
	});
	const [imageFileName, setImageFileName] = useState<string>("");
	const [blogFileName, setBlogFileName] = useState<string>("");
	const [blogImage, setImage] = useState<URL>();
	const [blogFile, setBlog] = useState<URL>();
	const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
	const [blogPost, setBlogPost] = useState({
		title: "",
		blog_date: new Date().toISOString().split("T")[0],
		description: "",
		file_name: "",
		image_path: "",
	});

	const [project, setProject] = useState({
		title: "",
		project_description: "",
		image_path: "",
		project_url: "",
		date_created: new Date().toISOString().split("T")[0],
		project_status: "",
		license: "",
	});

	const loadSettings = async () => {
		const saved = await invoke<Settings>("load_settings");
		console.log(saved);
		setSettings(saved);
	};

	const updateBlogImage = () => {
		open({
			directory: false,
			multiple: false,
		}).then(async (data) => {
			if (data) {
				setImageFileName(data.substring(data.lastIndexOf("\\")));
				const imagePath = data; // Assuming open() returns an array of file paths
				let webImage = new URL(convertFileSrc(imagePath));
				setImage(webImage);
			}
		});
	};
	const updateBlogFile = () => {
		open({
			directory: false,
			multiple: false,
		}).then(async (data) => {
			if (data) {
				setBlogFileName(data.substring(data.lastIndexOf("\\")));

				let blogFile = new URL(convertFileSrc(data));
				setBlog(blogFile);
			}
		});
	};

	useEffect(() => {
		loadSettings();
	}, []);

	async function uploadBlogFile(webBlog: URL, blogName: String) {
		const response = await fetch(webBlog);
		const imagePathRoot = settings.blog_folder_path;
		const imageU8 = new Uint8Array(await response.arrayBuffer());

		// Write changes to file
		const file = await openFs(imagePathRoot + "\\" + blogName, {
			write: true,
			create: true,
		});
		await file.write(imageU8);
		await file.close();
	}
	async function uploadBlogImage(webImage: URL, imageName: String) {
		const response = await fetch(webImage);
		const imagePathRoot = settings.blog_images_path;
		const imageU8 = new Uint8Array(await response.arrayBuffer());

		// Write changes to file
		const file = await openFs(imagePathRoot + "\\" + imageName, {
			write: true,
			create: true,
		});
		await file.write(imageU8);
		await file.close();
	}

	const handleBlogSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const formattedBlogPost = {
				...blogPost,
				blog_date: new Date(blogPost.blog_date).toISOString().split("T")[0],
				image_path: imageFileName,
				file_path: blogFile,
			};
			const createdBlogData = await invoke<BlogPost>("create_blog_post", {
				blogPost: formattedBlogPost,
			});
			console.log(createdBlogData.id);
			if (selectedTags.length > 0) {
				await invoke("add_tags_to_blog", {
					blogId: createdBlogData.id,
					tagIds: selectedTags.map((tag) => tag.id),
				});
			}
			if (blogImage) {
				uploadBlogImage(blogImage, imageFileName);
			}
			if (blogFile) {
				uploadBlogFile(blogFile, blogFileName);
			}

			setSelectedTags([]);
			// Reset form
			setBlogPost({
				title: "",
				blog_date: new Date().toISOString().split("T")[0],
				description: "",
				file_name: "",
				image_path: "",
			});
		} catch (err) {
			setError((err as Error).toString());
		} finally {
			setLoading(false);
		}
	};

	const handleProjectSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const createdProjectData = await invoke<Project>("create_project", {
				project,
			});
			if (selectedTags.length > 0) {
				await invoke("add_tags_to_project", {
					project_id: createdProjectData.id,
					tag_ids: selectedTags.map((tag) => tag.id),
				});
			}
			setSelectedTags([]);

			// Reset form
			setProject({
				title: "",
				project_description: "",
				image_path: "",
				project_url: "",
				date_created: new Date().toISOString().split("T")[0],
				project_status: "",
				license: "",
			});
		} catch (err) {
			setError((err as Error).toString());
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container p-4 mx-auto max-w-4xl">
			{/* Tabs */}
			{error && (
				<div className="relative px-4 py-3 mb-4 text-red-700 bg-red-100 rounded border border-red-400">
					{error}
				</div>
			)}
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
			{/* Blog Post Form */}
			{activeTab === "blog" && (
				<div className="p-6 bg-white rounded-lg shadow">
					<h2 className="mb-6 text-2xl font-bold">New Blog Post</h2>
					<form onSubmit={handleBlogSubmit} className="space-y-4">
						<div onClick={() => updateBlogImage()} className="cursor-pointer">
							{blogImage ? (
								<img
									alt="Thumbnail"
									src={blogImage.toString()}
									className="object-cover h-auto rounded border-2 border-gray-300 hover:border-gray-400 min-h-20 min-w-20"
								/>
							) : (
								<div className="flex justify-center items-center bg-gray-50 rounded border-2 border-gray-300 border-dashed hover:border-gray-400 min-h-20 min-w-20">
									<span className="text-sm text-gray-500">
										Click to upload image
									</span>
								</div>
							)}
						</div>

						<div>
							<label className="block mb-1 text-sm font-medium text-gray-700">
								Title
							</label>
							<input
								type="text"
								required
								className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								value={blogPost.title}
								onChange={(e) =>
									setBlogPost({ ...blogPost, title: e.target.value })
								}
								placeholder="Enter blog post title"
							/>
						</div>

						<div>
							<label className="block mb-1 text-sm font-medium text-gray-700">
								Date
							</label>
							<input
								type="date"
								className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								value={blogPost.blog_date}
								onChange={(e) =>
									setBlogPost({ ...blogPost, blog_date: e.target.value })
								}
							/>
						</div>

						<div>
							<label className="block mb-1 text-sm font-medium text-gray-700">
								Description
							</label>
							<textarea
								required
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
								value={blogPost.description}
								onChange={(e) =>
									setBlogPost({ ...blogPost, description: e.target.value })
								}
								placeholder="Enter blog post description"
							/>
						</div>

						<div>
							<label className="block mb-1 text-sm font-medium text-gray-700">
								File Name
							</label>
							<div onClick={() => updateBlogFile()} className="cursor-pointer">
								{blogFile ? (
									<div className="flex justify-center items-center bg-gray-50 rounded border-2 border-gray-300 border-dashed hover:border-gray-400 min-h-20 min-w-20">
										{blogFile.toString()}
									</div>
								) : (
									<div className="flex justify-center items-center bg-gray-50 rounded border-2 border-gray-300 border-dashed hover:border-gray-400 min-h-20 min-w-20">
										<span className="text-sm text-gray-500">
											Click to upload file
										</span>
									</div>
								)}
							</div>
						</div>

						<div className="space-y-2">
							<label className="block text-sm font-medium text-gray-700">
								Tags
							</label>
							<TagSelector
								selectedTags={selectedTags}
								onTagsChange={setSelectedTags}
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className={`w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
								loading ? "opacity-50 cursor-not-allowed" : ""}`}>
							{loading ? "Submitting..." : "Submit"}
						</button>
					</form>
				</div>
			)}

			{/* Project Form */}
			{activeTab === "project" && (
				<div className="p-6 bg-white rounded-lg shadow">
					<h2 className="mb-6 text-2xl font-bold">New Project</h2>
					<form onSubmit={handleProjectSubmit} className="space-y-4">
						<div>
							<label className="block mb-1 text-sm font-medium text-gray-700">
								Title
							</label>
							<input
								type="text"
								required
								className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								value={project.title}
								onChange={(e) =>
									setProject({ ...project, title: e.target.value })
								}
								placeholder="Enter project title"
							/>
						</div>

						<div>
							<label className="block mb-1 text-sm font-medium text-gray-700">
								Description
							</label>
							<textarea
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
								value={project.project_description}
								onChange={(e) =>
									setProject({
										...project,
										project_description: e.target.value,
									})
								}
								placeholder="Enter project description"
							/>
						</div>

						<div>
							<label className="block mb-1 text-sm font-medium text-gray-700">
								Project URL
							</label>
							<input
								type="url"
								className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								value={project.project_url}
								onChange={(e) =>
									setProject({ ...project, project_url: e.target.value })
								}
								placeholder="Enter project URL"
							/>
						</div>

						<div>
							<label className="block mb-1 text-sm font-medium text-gray-700">
								Date Created
							</label>
							<input
								type="date"
								className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								value={project.date_created}
								onChange={(e) =>
									setProject({ ...project, date_created: e.target.value })
								}
							/>
						</div>

						<div>
							<label className="block mb-1 text-sm font-medium text-gray-700">
								Project Status
							</label>
							<input
								type="text"
								className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								value={project.project_status}
								onChange={(e) =>
									setProject({ ...project, project_status: e.target.value })
								}
								placeholder="Enter project status"
							/>
						</div>

						<div>
							<label className="block mb-1 text-sm font-medium text-gray-700">
								License
							</label>
							<input
								type="text"
								className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								value={project.license}
								onChange={(e) =>
									setProject({ ...project, license: e.target.value })
								}
								placeholder="Enter license information"
							/>
						</div>

						<div className="space-y-2">
							<label className="block text-sm font-medium text-gray-700">
								Tags
							</label>
							<TagSelector
								selectedTags={selectedTags}
								onTagsChange={setSelectedTags}
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className={`w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
								loading ? "opacity-50 cursor-not-allowed" : ""}`}>
							{loading ? "Submitting..." : "Submit"}
						</button>
					</form>
				</div>
			)}
		</div>
	);
};

export default AdminForms;
