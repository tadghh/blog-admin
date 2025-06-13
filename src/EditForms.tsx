import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Tag, Settings } from "./interfaces";
import {
	ContentCard,
	SearchInput,
	Tabs,
	LoadingSpinner,
	EmptyState,
} from "./components";
import { ConfirmationDialog, Notification } from "./components/index";
import {
	BlogPost,
	Project,
	BlogPostItem,
	ProjectItem,
	createBlogImageUploader,
	createProjectImageUploader,
} from "./entityComponents";

const EditForms = () => {
	const [activeTab, setActiveTab] = useState("blog");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
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
	const [searchQuery, setSearchQuery] = useState("");

	// Confirmation dialog state
	const [confirmDialog, setConfirmDialog] = useState<{
		isOpen: boolean;
		title: string;
		message: string;
		itemId: number | null;
		itemType: "blog" | "project" | null;
	}>({
		isOpen: false,
		title: "",
		message: "",
		itemId: null,
		itemType: null,
	});

	useEffect(() => {
		loadSettings();
		fetchData();
	}, []);

	const loadSettings = async () => {
		try {
			const saved = await invoke<Settings>("load_settings");
			setSettings(saved);
		} catch (err) {
			setError(`Failed to load settings: ${err}`);
		}
	};

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

	// Blog Post Operations
	const updateBlogPost = (id: number, field: keyof BlogPost, value: any) => {
		setBlogPosts(
			blogPosts.map((post) =>
				post.id === id ? { ...post, [field]: value } : post
			)
		);
	};

	const toggleBlogEdit = (id: number) => {
		setBlogPosts(
			blogPosts.map((post) =>
				post.id === id ? { ...post, isEditing: !post.isEditing } : post
			)
		);
	};

	const saveBlogChanges = async (post: BlogPost) => {
		setLoading(true);
		setError("");
		setSuccessMessage("");
		try {
			await invoke("update_blog_post", { blogPost: post });
			toggleBlogEdit(post.id);
			setSuccessMessage("Blog post updated successfully!");
			await fetchData(); // Refresh data after update
		} catch (err) {
			setError(`Failed to update blog post: ${err}`);
		} finally {
			setLoading(false);
		}
	};

	const updateBlogTags = async (blogId: number, tags: Tag[]) => {
		try {
			await invoke("update_blog_tags", {
				blogId,
				tagIds: tags.map((t) => t.id),
			});
			setTagsByBlogId({
				...tagsByBlogId,
				[blogId]: tags,
			});
			setSuccessMessage("Blog post tags updated successfully!");
		} catch (err) {
			setError(`Failed to update blog tags: ${err}`);
		}
	};

	// Project Operations
	const toggleProjectEdit = (id: number) => {
		setProjects(
			projects.map((project) =>
				project.id === id
					? { ...project, isEditing: !project.isEditing }
					: project
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
		setError("");
		setSuccessMessage("");
		try {
			await invoke("update_project", { project });
			toggleProjectEdit(project.id);
			setSuccessMessage("Project updated successfully!");
			await fetchData(); // Refresh data after update
		} catch (err) {
			setError(`Failed to update project: ${err}`);
		} finally {
			setLoading(false);
		}
	};

	const updateProjectTags = async (projectId: number, tags: Tag[]) => {
		try {
			await invoke("update_project_tags", {
				projectId,
				tagIds: tags.map((t) => t.id),
			});
			setTagsByProjectId({
				...tagsByProjectId,
				[projectId]: tags,
			});
			setSuccessMessage("Project tags updated successfully!");
		} catch (err) {
			setError(`Failed to update project tags: ${err}`);
		}
	};

	// Show confirmation dialog for deletion
	const showDeleteConfirmation = async (
		id: number,
		type: "blog" | "project"
	) => {
		const itemName =
			type === "blog"
				? blogPosts.find((p) => p.id === id)?.title || "this blog post"
				: projects.find((p) => p.id === id)?.title || "this project";

		setConfirmDialog({
			isOpen: true,
			title: `Delete ${type === "blog" ? "Blog Post" : "Project"}`,
			message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
			itemId: id,
			itemType: type,
		});
	};

	// Handle confirmed deletion
	const handleConfirmedDelete = async () => {
		if (!confirmDialog.itemId || !confirmDialog.itemType) return;

		setLoading(true);
		setError("");
		setSuccessMessage("");

		try {
			if (confirmDialog.itemType === "blog") {
				await invoke("delete_blog_post", { blogPostId: confirmDialog.itemId });
				setBlogPosts(
					blogPosts.filter((post) => post.id !== confirmDialog.itemId)
				);

				// Clean up tags associated with this blog
				const { [confirmDialog.itemId]: _, ...remainingTags } = tagsByBlogId;
				setTagsByBlogId(remainingTags);
				setSuccessMessage("Blog post deleted successfully!");
			} else {
				await invoke("delete_project", { projectId: confirmDialog.itemId });
				setProjects(
					projects.filter((project) => project.id !== confirmDialog.itemId)
				);

				// Clean up tags associated with this project
				const { [confirmDialog.itemId]: _, ...remainingTags } = tagsByProjectId;
				setTagsByProjectId(remainingTags);
				setSuccessMessage("Project deleted successfully!");
			}
		} catch (err) {
			setError(`Failed to delete ${confirmDialog.itemType}: ${err}`);
		} finally {
			setLoading(false);
			setConfirmDialog({
				isOpen: false,
				title: "",
				message: "",
				itemId: null,
				itemType: null,
			});
		}
	};

	// Create image uploader functions with current settings
	const blogImageUpdater = createBlogImageUploader(settings);
	const projectImageUpdater = createProjectImageUploader(settings);

	// Handler functions for image updates
	const handleBlogImageUpdate = (post: BlogPost) => {
		blogImageUpdater(post, setLoading, setError, updateBlogPost);
	};

	const handleProjectImageUpdate = (project: Project) => {
		projectImageUpdater(project, setLoading, setError, updateProject);
	};

	// Filter items based on search query
	const filteredBlogPosts = searchQuery
		? blogPosts.filter(
				(post) =>
					post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					post.description.toLowerCase().includes(searchQuery.toLowerCase())
		  )
		: blogPosts;

	const filteredProjects = searchQuery
		? projects.filter(
				(project) =>
					project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					(project.description &&
						project.description
							.toLowerCase()
							.includes(searchQuery.toLowerCase()))
		  )
		: projects;

	if (loading && !blogPosts.length && !projects.length) {
		return <LoadingSpinner />;
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-800">Edit Content</h1>
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

			{/* Search and Tabs */}
			<ContentCard>
				<div className="p-4 border-b">
					<div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
						<SearchInput
							value={searchQuery}
							onChange={setSearchQuery}
							placeholder="Search content..."
						/>
					</div>
				</div>

				<Tabs
					tabs={[
						{ id: "blog", label: "Blog Posts" },
						{ id: "project", label: "Projects" },
					]}
					activeTab={activeTab}
					onTabChange={setActiveTab}
				/>
			</ContentCard>

			{/* Blog Posts Content */}
			{activeTab === "blog" && (
				<div className="space-y-4">
					{filteredBlogPosts.length === 0 ? (
						<EmptyState searchQuery={searchQuery} entityName="blog posts" />
					) : (
						filteredBlogPosts.map((post) => (
							<ContentCard key={post.id}>
								<BlogPostItem
									post={post}
									imagesPath={settings.blog_images_path || ""}
									tagsByBlogId={tagsByBlogId}
									loading={loading}
									onEdit={toggleBlogEdit}
									onSave={saveBlogChanges}
									onDelete={showDeleteConfirmation}
									onUpdate={updateBlogPost}
									onUpdateImage={handleBlogImageUpdate}
									onUpdateTags={updateBlogTags}
									setError={setError}
								/>
							</ContentCard>
						))
					)}
				</div>
			)}

			{/* Projects Content */}
			{activeTab === "project" && (
				<div className="space-y-4">
					{filteredProjects.length === 0 ? (
						<EmptyState searchQuery={searchQuery} entityName="projects" />
					) : (
						filteredProjects.map((project) => (
							<ContentCard key={project.id}>
								<ProjectItem
									project={project}
									imagesPath={settings.blog_images_path || ""}
									tagsByProjectId={tagsByProjectId}
									loading={loading}
									onEdit={toggleProjectEdit}
									onSave={saveProjectChanges}
									onDelete={showDeleteConfirmation}
									onUpdate={updateProject}
									onUpdateImage={handleProjectImageUpdate}
									onUpdateTags={updateProjectTags}
									setError={setError}
								/>
							</ContentCard>
						))
					)}
				</div>
			)}

			{/* Confirmation Dialog */}
			<ConfirmationDialog
				isOpen={confirmDialog.isOpen}
				onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
				onConfirm={handleConfirmedDelete}
				title={confirmDialog.title}
				message={confirmDialog.message}
				confirmText="Delete"
				cancelText="Cancel"
				variant="danger"
				isLoading={loading}
			/>
		</div>
	);
};

export default EditForms;
