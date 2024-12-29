import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Tag } from "./interfaces";

const TagManagement = () => {
	const [tags, setTags] = useState<(Tag & { isEditing?: boolean })[]>([]);
	const [newTagName, setNewTagName] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchTags();
	}, []);

	const fetchTags = async () => {
		try {
			const fetchedTags = await invoke<Tag[]>("get_tags");
			setTags(fetchedTags.map((tag) => ({ ...tag, isEditing: false })));
		} catch (err) {
			setError("Failed to fetch tags");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const createTag = async () => {
		if (!newTagName.trim()) return;

		try {
			const newTag = await invoke<Tag>("create_tag", {
				name: newTagName.trim(),
			});
			setTags([...tags, { ...newTag, isEditing: false }]);
			setNewTagName("");
		} catch (err) {
			setError("Failed to create tag");
			console.error(err);
		}
	};

	const toggleEdit = (id: number) => {
		setTags(
			tags.map((tag) =>
				tag.id === id ? { ...tag, isEditing: !tag.isEditing } : tag
			)
		);
	};

	const updateTag = async (tag: Tag & { isEditing?: boolean }) => {
		try {
			await invoke("update_tag", { id: tag.id, name: tag.name });
			setTags(
				tags.map((t) => (t.id === tag.id ? { ...tag, isEditing: false } : t))
			);
		} catch (err) {
			setError("Failed to update tag");
			console.error(err);
		}
	};

	const deleteTag = async (id: number) => {
		if (!confirm("Are you sure you want to delete this tag?")) return;

		try {
			await invoke("delete_tag", { id });
			setTags(tags.filter((tag) => tag.id !== id));
		} catch (err) {
			setError("Failed to delete tag");
			console.error(err);
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
			<h1 className="mb-6 text-2xl font-bold">Tag Management</h1>

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

			{/* Create new tag */}
			<div className="mb-8">
				<div className="flex gap-2">
					<input
						type="text"
						value={newTagName}
						onChange={(e) => setNewTagName(e.target.value)}
						placeholder="Enter new tag name"
						className="flex-grow px-3 py-2 rounded border"
						onKeyPress={(e) => e.key === "Enter" && createTag()}
					/>
					<button
						type="button"
						onClick={createTag}
						className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
						Add Tag
					</button>
				</div>
			</div>

			{/* Tag list */}
			<div className="flex flex-wrap gap-3">
				{tags.map((tag) => (
					<div
						key={tag.id}
						className={`group relative px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${
								tag.isEditing
									? "border-2 border-blue-500"
									: "bg-gray-100 hover:bg-gray-200"
							}`}>
						{tag.isEditing ? (
							<input
								type="text"
								value={tag.name}
								onChange={(e) => {
									setTags(
										tags.map((t) =>
											t.id === tag.id ? { ...t, name: e.target.value } : t
										)
									);
								}}
								className="px-2 bg-transparent border-none focus:outline-none"
								onKeyPress={(e) => {
									if (e.key === "Enter") {
										updateTag(tag);
									}
								}}
								onBlur={() => updateTag(tag)}
								autoFocus
							/>
						) : (
							<>
								<span>{tag.name}</span>
								<div className="hidden absolute top-0 right-0 h-full group-hover:flex">
									<button
										type="button"
										onClick={() => toggleEdit(tag.id)}
										className="px-2 text-blue-500 hover:text-blue-700">
										✎
									</button>
									<button
										type="button"
										onClick={() => deleteTag(tag.id)}
										className="px-2 text-red-500 hover:text-red-700">
										×
									</button>
								</div>
							</>
						)}
					</div>
				))}
			</div>
		</div>
	);
};

export default TagManagement;
