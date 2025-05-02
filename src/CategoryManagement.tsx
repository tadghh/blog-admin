import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Tag, Category } from "./interfaces";
import TagSelector from "./TagSelector";

const CategoryManagement = () => {
	const [categories, setCategories] = useState<
		(Category & { isEditing?: boolean })[]
	>([]);
	const [newCategoryName, setNewCategoryName] = useState("");
	const [newCategoryDescription, setNewCategoryDescription] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);
	const [tagsByCategory, setTagsByCategory] = useState<Record<number, Tag[]>>(
		{}
	);

	useEffect(() => {
		fetchCategories();
	}, []);

	const fetchCategories = async () => {
		try {
			const fetchedCategories = await invoke<Category[]>("get_categories");
			setCategories(
				fetchedCategories.map((category) => ({ ...category, isEditing: false }))
			);

			// Fetch tags for each category
			for (const category of fetchedCategories) {
				const categoryTags = await invoke<Tag[]>("get_category_tags", {
					categoryId: category.id,
				});
				setTagsByCategory((prev) => ({
					...prev,
					[category.id]: categoryTags,
				}));
			}
		} catch (err) {
			setError("Failed to fetch categories");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const createCategory = async () => {
		if (!newCategoryName.trim()) return;

		try {
			const newCategory = await invoke<Category>("create_category", {
				name: newCategoryName.trim(),
				description: newCategoryDescription.trim() || null,
			});
			setCategories([...categories, { ...newCategory, isEditing: false }]);
			setNewCategoryName("");
			setNewCategoryDescription("");
		} catch (err) {
			setError("Failed to create category");
			console.error(err);
		}
	};

	const toggleEdit = (id: number) => {
		setCategories(
			categories.map((category) =>
				category.id === id
					? { ...category, isEditing: !category.isEditing }
					: category
			)
		);
	};

	const updateCategory = async (
		category: Category & { isEditing?: boolean }
	) => {
		try {
			await invoke("update_category", {
				id: category.id,
				name: category.name,
				description: category.description,
			});
			setCategories(
				categories.map((c) =>
					c.id === category.id ? { ...category, isEditing: false } : c
				)
			);
		} catch (err) {
			setError("Failed to update category");
		}
	};

	const deleteCategory = async (id: number) => {
		if (!confirm("Are you sure you want to delete this category?")) return;

		try {
			await invoke("delete_category", { id });
			setCategories(categories.filter((category) => category.id !== id));

			// Clean up tags associated with this category
			const { [id]: _, ...remainingTags } = tagsByCategory;
			setTagsByCategory(remainingTags);
		} catch (err) {
			setError("Failed to delete category");
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-full">
				<div className="w-10 h-10 rounded-full border-b-2 border-blue-500 animate-spin"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-800">Categories</h1>
			</div>

			{error && (
				<div className="relative p-4 text-red-700 bg-red-100 rounded border border-red-400">
					<span>{error}</span>
					<button
						className="absolute top-3 right-3 text-red-700 hover:text-red-900"
						onClick={() => setError("")}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="w-5 h-5"
							viewBox="0 0 20 20"
							fill="currentColor">
							<path
								fillRule="evenodd"
								d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
								clipRule="evenodd"
							/>
						</svg>
					</button>
				</div>
			)}

			{/* Create new category section */}
			<div className="p-6 bg-white rounded-lg shadow">
				<h2 className="mb-4 text-lg font-medium text-gray-700">
					Add New Category
				</h2>
				<div className="space-y-4">
					<div>
						<label
							htmlFor="categoryName"
							className="block mb-1 text-sm font-medium text-gray-700">
							Name
						</label>
						<input
							id="categoryName"
							type="text"
							value={newCategoryName}
							onChange={(e) => setNewCategoryName(e.target.value)}
							placeholder="Enter category name"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<div>
						<label
							htmlFor="categoryDescription"
							className="block mb-1 text-sm font-medium text-gray-700">
							Description (optional)
						</label>
						<textarea
							id="categoryDescription"
							value={newCategoryDescription}
							onChange={(e) => setNewCategoryDescription(e.target.value)}
							placeholder="Enter category description"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							rows={3}
						/>
					</div>
					<button
						type="button"
						onClick={createCategory}
						className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
						Add Category
					</button>
				</div>
			</div>

			{/* Category list */}
			<div className="space-y-4">
				{categories.length === 0 ? (
					<div className="p-6 text-center text-gray-500 bg-white rounded-lg shadow">
						No categories found. Create your first category above.
					</div>
				) : (
					categories.map((category) => (
						<div
							key={category.id}
							className="overflow-hidden bg-white rounded-lg shadow">
							<div className="p-6">
								<div className="flex justify-between items-center mb-4">
									<div className="flex-1">
										{category.isEditing ? (
											<input
												type="text"
												value={category.name}
												onChange={(e) =>
													setCategories(
														categories.map((c) =>
															c.id === category.id
																? { ...c, name: e.target.value }
																: c
														)
													)
												}
												className="px-2 py-1 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
											/>
										) : (
											<h3 className="text-lg font-semibold text-gray-800">
												{category.name}
											</h3>
										)}

										{category.isEditing ? (
											<textarea
												value={category.description || ""}
												onChange={(e) =>
													setCategories(
														categories.map((c) =>
															c.id === category.id
																? { ...c, description: e.target.value }
																: c
														)
													)
												}
												className="mt-2 px-2 py-1 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
												rows={2}
											/>
										) : (
											category.description && (
												<p className="mt-1 text-sm text-gray-600">
													{category.description}
												</p>
											)
										)}
									</div>

									<div className="flex gap-2 ml-4">
										{category.isEditing ? (
											<button
												onClick={() => updateCategory(category)}
												className="p-2 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													className="w-5 h-5"
													viewBox="0 0 20 20"
													fill="currentColor">
													<path
														fillRule="evenodd"
														d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
														clipRule="evenodd"
													/>
												</svg>
											</button>
										) : (
											<button
												onClick={() => toggleEdit(category.id)}
												className="p-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													className="w-5 h-5"
													viewBox="0 0 20 20"
													fill="currentColor">
													<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
												</svg>
											</button>
										)}
										<button
											onClick={() => deleteCategory(category.id)}
											className="p-2 text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="w-5 h-5"
												viewBox="0 0 20 20"
												fill="currentColor">
												<path
													fillRule="evenodd"
													d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
													clipRule="evenodd"
												/>
											</svg>
										</button>
									</div>
								</div>

								{/* Tags section */}
								<div className="pt-4 mt-4 border-t border-gray-200">
									<h4 className="mb-2 text-sm font-medium text-gray-700">
										Associated Tags
									</h4>
									<TagSelector
										selectedTags={tagsByCategory[category.id] || []}
										onTagsChange={async (tags: Tag[]) => {
											try {
												await invoke("update_category_tags", {
													categoryId: category.id,
													tagIds: tags.map((t) => t.id),
												});
												setTagsByCategory({
													...tagsByCategory,
													[category.id]: tags,
												});
											} catch (e) {
												setError(e as string);
											}
										}}
									/>
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};

export default CategoryManagement;
