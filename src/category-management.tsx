import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Tag, Category } from "./interfaces";
import TagSelector from "./tag-selector";

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

			// Fetch tags for each category correctly
			for (const category of fetchedCategories) {
				const categoryTags = await invoke<Tag[]>("get_category_tags", {
					categoryId: category.id, // Fixed parameter name
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
		try {
			await invoke("delete_category", { id });
			setCategories(categories.filter((category) => category.id !== id));
			const { [id]: _, ...remainingTags } = tagsByCategory;
			setTagsByCategory(remainingTags);
		} catch (err) {
			setError("Failed to delete category");
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="w-12 h-12 rounded-full border-b-2 border-blue-500 animate-spin"></div>
			</div>
		);
	}

	return (
		<div className="container p-6 mx-auto">
			<h1 className="mb-6 text-2xl font-bold">Category Management</h1>

			{error && (
				<div className="relative px-4 py-3 mb-4 text-red-700 bg-red-100 rounded border border-red-400">
					{error}
					<button
						className="absolute top-0 right-0 px-4 py-3"
						onClick={() => setError("")}>
						×
					</button>
				</div>
			)}

			{/* Create new category */}
			<div className="mb-8">
				<div className="flex flex-col gap-2">
					<input
						type="text"
						value={newCategoryName}
						onChange={(e) => setNewCategoryName(e.target.value)}
						placeholder="Enter new category name"
						className="px-3 py-2 rounded border"
					/>
					<textarea
						value={newCategoryDescription}
						onChange={(e) => setNewCategoryDescription(e.target.value)}
						placeholder="Enter category description (optional)"
						className="px-3 py-2 rounded border"
						rows={3}
					/>
					<button
						type="button"
						onClick={createCategory}
						className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
						Add Category
					</button>
				</div>
			</div>

			{/* Category list */}
			<div className="space-y-4">
				{categories.map((category) => (
					<div key={category.id} className="p-4 rounded-lg border">
						<div className="flex justify-between items-center mb-2">
							<div className="flex-1">
								<h3 className="text-lg font-semibold">{category.name}</h3>
								{category.description && (
									<p className="text-gray-600">{category.description}</p>
								)}
							</div>
							<div className="flex gap-2">
								{category.isEditing ? (
									<button
										onClick={() => updateCategory(category)}
										className="p-1 text-green-500 hover:text-green-700">
										Save
									</button>
								) : (
									<button
										onClick={() => toggleEdit(category.id)}
										className="p-1 text-blue-500 hover:text-blue-700">
										Edit
									</button>
								)}
								<button
									onClick={() => deleteCategory(category.id)}
									className="p-1 text-red-500 hover:text-red-700">
									×
								</button>
							</div>
						</div>

						<div className="mt-4">
							<div className="p-4 mb-4 border-b">
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
				))}
			</div>
		</div>
	);
};

export default CategoryManagement;
