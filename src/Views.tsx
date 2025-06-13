import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { convertFileSrc } from "@tauri-apps/api/core";
import {
	ActionButton,
	ContentCard,
	LoadingSpinner,
	SearchInput,
} from "./components";
import { Modal, Notification } from "./components/index";
import {
	ImageIcon,
	EyeIcon,
	PlusIcon,
	ChevronDownIcon,
	ChevronUpIcon,
} from "./Icons";

interface BlogPostWithViews {
	id: number;
	title: string;
	created: string;
	description: string;
	image_name: string | null;
	file_name: string;
	view_count: number;
}

interface BlogPostView {
	id: number;
	blog_post_id: number;
	ip_address: string;
	viewed_at: string | null;
}

interface Settings {
	blog_images_path: string | null;
	blog_folder_path: string | null;
}

const Views = () => {
	const [blogPosts, setBlogPosts] = useState<BlogPostWithViews[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [settings, setSettings] = useState<Settings>({
		blog_images_path: "",
		blog_folder_path: "",
	});
	const [expandedPost, setExpandedPost] = useState<number | null>(null);
	const [postViews, setPostViews] = useState<Record<number, BlogPostView[]>>(
		{}
	);
	const [addingView, setAddingView] = useState<number | null>(null);
	const [showAddViewModal, setShowAddViewModal] = useState<number | null>(null);
	const [viewCountToAdd, setViewCountToAdd] = useState<number>(1);

	useEffect(() => {
		fetchData();
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

	const fetchData = async () => {
		setLoading(true);
		try {
			const posts = await invoke<BlogPostWithViews[]>(
				"get_blog_posts_with_views"
			);
			setBlogPosts(posts);
		} catch (err) {
			setError(`Failed to fetch blog posts: ${err}`);
		} finally {
			setLoading(false);
		}
	};

	const addViewToBlogPost = async (blogPostId: number, count: number = 1) => {
		setAddingView(blogPostId);
		try {
			if (count === 1) {
				await invoke("add_view_to_blog_post", { blogPostId });
			} else {
				await invoke("add_multiple_views_to_blog_post", {
					blogPostId,
					viewCount: count,
				});
			}
			// Refresh the data to show updated view count
			await fetchData();
			// If this post's views are expanded, refresh them too
			if (expandedPost === blogPostId) {
				await fetchPostViews(blogPostId);
			}
			setSuccessMessage(
				`Successfully added ${count} view${count !== 1 ? "s" : ""} to blog post`
			);
		} catch (err) {
			setError(`Failed to add view(s): ${err}`);
		} finally {
			setAddingView(null);
		}
	};

	const handleAddViewSubmit = async () => {
		if (showAddViewModal && viewCountToAdd > 0) {
			await addViewToBlogPost(showAddViewModal, viewCountToAdd);
			setShowAddViewModal(null);
			setViewCountToAdd(1);
		}
	};

	const openAddViewModal = (blogPostId: number) => {
		setShowAddViewModal(blogPostId);
		setViewCountToAdd(1);
	};

	const fetchPostViews = async (blogPostId: number) => {
		try {
			const views = await invoke<BlogPostView[]>("get_blog_post_views", {
				blogPostId,
			});
			setPostViews((prev) => ({
				...prev,
				[blogPostId]: views,
			}));
		} catch (err) {
			setError(`Failed to fetch post views: ${err}`);
		}
	};

	const toggleExpandPost = async (blogPostId: number) => {
		if (expandedPost === blogPostId) {
			setExpandedPost(null);
		} else {
			setExpandedPost(blogPostId);
			if (!postViews[blogPostId]) {
				await fetchPostViews(blogPostId);
			}
		}
	};

	// Filter posts based on search query
	const filteredPosts = searchQuery
		? blogPosts.filter(
				(post) =>
					post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					post.description.toLowerCase().includes(searchQuery.toLowerCase())
		  )
		: blogPosts;

	if (loading && !blogPosts.length) {
		return <LoadingSpinner />;
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-800">Blog Post Views</h1>
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

			{/* Search */}
			<ContentCard>
				<div className="p-4">
					<SearchInput
						value={searchQuery}
						onChange={setSearchQuery}
						placeholder="Search blog posts..."
					/>
				</div>
			</ContentCard>

			{/* Blog Posts with Views */}
			<div className="space-y-4">
				{filteredPosts.length === 0 ? (
					<ContentCard>
						<div className="p-8 text-center text-gray-500">
							{searchQuery
								? "No blog posts match your search query"
								: "No blog posts found"}
						</div>
					</ContentCard>
				) : (
					filteredPosts.map((post) => (
						<ContentCard key={post.id}>
							<div className="p-6">
								<div className="flex flex-col gap-4 sm:flex-row">
									{/* Thumbnail */}
									<div className="flex-shrink-0">
										{post.image_name && settings.blog_images_path ? (
											<img
												alt={post.title}
												src={convertFileSrc(
													`${settings.blog_images_path}/${post.image_name}`
												)}
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
										<h3 className="text-lg font-medium text-gray-800">
											{post.title}
										</h3>
										<p className="text-sm text-gray-600">
											{new Date(post.created).toLocaleDateString()}
										</p>
										<p className="text-sm text-gray-600">{post.description}</p>

										{/* View Count */}
										<div className="flex gap-4 items-center">
											<div className="flex gap-2 items-center">
												<EyeIcon className="w-5 h-5 text-gray-500" />
												<span className="text-sm font-medium text-gray-700">
													{post.view_count} views
												</span>
											</div>
										</div>
									</div>

									{/* Actions */}
									<div className="flex flex-col gap-2 sm:w-auto">
										<ActionButton
											onClick={() => addViewToBlogPost(post.id, 1)}
											disabled={addingView === post.id}
											variant="primary"
											isLoading={addingView === post.id}
											icon={<PlusIcon className="w-4 h-4" />}>
											+1 View
										</ActionButton>

										<ActionButton
											onClick={() => openAddViewModal(post.id)}
											disabled={addingView === post.id}
											variant="success"
											icon={<PlusIcon className="w-4 h-4" />}>
											Add Views
										</ActionButton>

										<ActionButton
											onClick={() => toggleExpandPost(post.id)}
											variant="warning"
											icon={
												expandedPost === post.id ? (
													<ChevronUpIcon className="w-4 h-4" />
												) : (
													<ChevronDownIcon className="w-4 h-4" />
												)
											}>
											{expandedPost === post.id
												? "Hide Details"
												: "View Details"}
										</ActionButton>
									</div>
								</div>

								{/* Expanded View Details */}
								{expandedPost === post.id && (
									<div className="pt-6 mt-6 border-t border-gray-200">
										<h4 className="mb-4 font-medium text-gray-700 text-md">
											View Details ({post.view_count} total views)
										</h4>
										{postViews[post.id] ? (
											<div className="overflow-y-auto space-y-2 max-h-60">
												{postViews[post.id].length === 0 ? (
													<p className="text-sm text-gray-500">
														No views recorded yet
													</p>
												) : (
													postViews[post.id].map((view, _) => (
														<div
															key={view.id}
															className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
															<div className="flex gap-3 items-center">
																<span className="font-mono text-sm text-gray-600">
																	#{view.id}
																</span>
																<span className="text-sm text-gray-700">
																	{view.ip_address}
																</span>
															</div>
															<div className="text-right">
																{view.viewed_at && (
																	<span className="text-xs text-gray-500">
																		{new Date(view.viewed_at).toLocaleString()}
																	</span>
																)}
															</div>
														</div>
													))
												)}
											</div>
										) : (
											<div className="flex justify-center py-4">
												<div className="w-6 h-6 rounded-full border-b-2 border-blue-500 animate-spin"></div>
											</div>
										)}
									</div>
								)}
							</div>
						</ContentCard>
					))
				)}
			</div>

			{/* Add View Modal */}
			<Modal
				isOpen={showAddViewModal !== null}
				onClose={() => {
					setShowAddViewModal(null);
					setViewCountToAdd(1);
				}}
				title="Add Views to Blog Post"
				size="md">
				<div className="mb-4">
					<label
						htmlFor="viewCount"
						className="block mb-2 text-sm font-medium text-gray-700">
						Number of views to add
					</label>
					<input
						id="viewCount"
						type="number"
						min="1"
						max="1000"
						value={viewCountToAdd}
						onChange={(e) =>
							setViewCountToAdd(Math.max(1, parseInt(e.target.value) || 1))
						}
						className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Enter number of views"
					/>
					<p className="mt-1 text-xs text-gray-500">
						Maximum 1000 views can be added at once
					</p>
				</div>

				<div className="flex gap-3 justify-end">
					<ActionButton
						onClick={() => {
							setShowAddViewModal(null);
							setViewCountToAdd(1);
						}}
						variant="danger"
						disabled={addingView !== null}>
						Cancel
					</ActionButton>
					<ActionButton
						onClick={handleAddViewSubmit}
						variant="primary"
						disabled={addingView !== null || viewCountToAdd < 1}
						isLoading={addingView === showAddViewModal}>
						Add {viewCountToAdd} View{viewCountToAdd !== 1 ? "s" : ""}
					</ActionButton>
				</div>
			</Modal>
		</div>
	);
};

export default Views;
