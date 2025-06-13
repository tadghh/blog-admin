import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Tag, Category } from "./interfaces";
import TagSelector from "./TagSelector";
import { LoadingSpinner, ContentCard, SearchInput } from "./components";
import { Notification, ConfirmationDialog } from "./components/index";

const CategoryManagement = () => {
	const [categories, setCategories] = useState<
		(Category & { isEditing?: boolean })[]
	>([]);
	const [newCategoryName, setNewCategoryName] = useState("");
	const [newCategoryDescription, setNewCategoryDescription] = useState("");
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [loading, setLoading] = useState(true);
	const [tagsByCategory, setTagsByCategory] = useState<Record<number, Tag[]>>(
		{}
	);
	const [searchQuery, setSearchQuery] = useState("");

	// Confirmation dialog state
	const [confirmDialog, setConfirmDialog] = useState<{
		isOpen: boolean;
		categoryId: number | null;
		categoryName: string;
	}>({
		isOpen: false,
		categoryId: null,
		categoryName: "",
	});

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
			setSuccessMessage(`Category "${newCategory.name}" created successfully!`);
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
			setSuccessMessage(`Category "${category.name}" updated successfully!`);
		} catch (err) {
			setError("Failed to update category");
		}
	};

	const showDeleteConfirmation = (category: Category) => {
		setConfirmDialog({
			isOpen: true,
			categoryId: category.id,
			categoryName: category.name,
		});
	};

	const handleConfirmedDelete = async () => {
		if (!confirmDialog.categoryId) return;

		try {
			await invoke("delete_category", { id: confirmDialog.categoryId });
			setCategories(
				categories.filter(
					(category) => category.id !== confirmDialog.categoryId
				)
			);

			// Clean up tags associated with this category
			const { [confirmDialog.categoryId]: _, ...remainingTags } =
				tagsByCategory;
			setTagsByCategory(remainingTags);
			setSuccessMessage(
				`Category "${confirmDialog.categoryName}" deleted successfully!`
			);
		} catch (err) {
			setError("Failed to delete category");
		} finally {
			setConfirmDialog({ isOpen: false, categoryId: null, categoryName: "" });
		}
	};

	const filteredCategories = categories.filter((category) =>
		searchQuery
			? category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			  (category.description &&
					category.description
						.toLowerCase()
						.includes(searchQuery.toLowerCase()))
			: true
	);

	if (loading) {
		return <LoadingSpinner />;
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-800">Categories</h1>
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

			{/* Create new category section */}
			<ContentCard>
				<div className="p-6">
					<h2 className="mb-4 text-lg font-medium text-gray-700">
						Add New Category
					</h2>
					<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
									className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
						</div>
						<div className="space-y-4">
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
									className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
									rows={3}
								/>
							</div>
						</div>
					</div>
					<div className="flex justify-between items-center mt-4">
						<button
							type="button"
							onClick={createCategory}
							disabled={!newCategoryName.trim()}
							className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
							Add Category
						</button>
					</div>
				</div>
			</ContentCard>

			{/* Search */}
			<ContentCard>
				<div className="p-4">
					<SearchInput
						value={searchQuery}
						onChange={setSearchQuery}
						placeholder="Search categories..."
					/>
				</div>
			</ContentCard>

			{/* Category list */}
			<div className="space-y-4">
				{filteredCategories.length === 0 ? (
					<ContentCard>
						<div className="p-6 text-center text-gray-500">
							{searchQuery
								? "No categories match your search"
								: "No categories found. Create your first category above."}
						</div>
					</ContentCard>
				) : (
					filteredCategories.map((category) => (
						<ContentCard key={category.id}>
							<div className="p-6">
								<div className="flex justify-between items-start mb-4">
									<div className="flex-1">
										{category.isEditing ? (
											<div className="space-y-3">
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
													className="px-3 py-2 w-full text-lg font-semibold rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
												/>
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
													className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
													rows={2}
													placeholder="Category description (optional)"
												/>
											</div>
										) : (
											<div>
												<h3 className="text-lg font-semibold text-gray-800">
													{category.name}
												</h3>
												{category.description && (
													<p className="mt-1 text-sm text-gray-600">
														{category.description}
													</p>
												)}
											</div>
										)}
									</div>

									<div className="flex gap-2 ml-4">
										{category.isEditing ? (
											<button
												onClick={() => updateCategory(category)}
												className="p-2 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
												title="Save changes">
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
												className="p-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
												title="Edit category">
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
											onClick={() => showDeleteConfirmation(category)}
											className="p-2 text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
											title="Delete category">
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
									<h4 className="mb-3 text-sm font-medium text-gray-700">
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
												setSuccessMessage(
													"Category tags updated successfully!"
												);
											} catch (e) {
												setError(e as string);
											}
										}}
									/>
								</div>
							</div>
						</ContentCard>
					))
				)}
			</div>

			{/* Confirmation Dialog */}
			<ConfirmationDialog
				isOpen={confirmDialog.isOpen}
				onClose={() =>
					setConfirmDialog({
						isOpen: false,
						categoryId: null,
						categoryName: "",
					})
				}
				onConfirm={handleConfirmedDelete}
				title="Delete Category"
				message={`Are you sure you want to delete the category "${confirmDialog.categoryName}"? This action cannot be undone.`}
				confirmText="Delete Category"
				cancelText="Cancel"
				variant="danger"
			/>
		</div>
	);
};

export default CategoryManagement;
