import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Tag } from "./interfaces";

const TagManagement = () => {
	const [tags, setTags] = useState<(Tag & { isEditing?: boolean })[]>([]);
	const [newTagName, setNewTagName] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

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

		setLoading(true);
		try {
			const newTag = await invoke<Tag>("create_tag", {
				name: newTagName.trim(),
			});
			setTags([...tags, { ...newTag, isEditing: false }]);
			setNewTagName("");
			setError("");
		} catch (err) {
			setError("Failed to create tag");
			console.error(err);
		} finally {
			setLoading(false);
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
		if (!tag.name.trim()) {
			setError("Tag name cannot be empty");
			return;
		}

		setLoading(true);
		try {
			await invoke("update_tag", { id: tag.id, name: tag.name });
			setTags(
				tags.map((t) => (t.id === tag.id ? { ...tag, isEditing: false } : t))
			);
			setError("");
		} catch (err) {
			setError("Failed to update tag");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const deleteTag = async (id: number) => {
		if (!confirm("Are you sure you want to delete this tag?")) return;

		setLoading(true);
		try {
			await invoke("delete_tag", { id });
			setTags(tags.filter((tag) => tag.id !== id));
			setError("");
		} catch (err) {
			setError("Failed to delete tag");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			createTag();
		}
	};

	const filteredTags = tags.filter((tag) =>
		tag.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	if (loading && !tags.length) {
		return (
			<div className="flex justify-center items-center h-full">
				<div className="w-10 h-10 rounded-full border-b-2 border-blue-500 animate-spin"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-800">Tags</h1>
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

			{/* Create new tag and search section */}
			<div className="p-6 bg-white rounded-lg shadow">
				<div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
					<div className="flex-1">
						<label
							htmlFor="newTag"
							className="block mb-1 text-sm font-medium text-gray-700">
							New Tag
						</label>
						<div className="flex">
							<input
								id="newTag"
								type="text"
								value={newTagName}
								onChange={(e) => setNewTagName(e.target.value)}
								onKeyPress={handleKeyPress}
								placeholder="Enter new tag name"
								className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								disabled={loading && !tags.length}
							/>
							<button
								type="button"
								onClick={createTag}
								disabled={!newTagName.trim() || loading}
								className={`px-4 py-2 text-white bg-blue-600 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
									!newTagName.trim() || loading
										? "opacity-50 cursor-not-allowed"
										: ""
								}`}>
								Add
							</button>
						</div>
					</div>

					<div className="flex-1">
						<label
							htmlFor="searchTags"
							className="block mb-1 text-sm font-medium text-gray-700">
							Search Tags
						</label>
						<div className="relative">
							<input
								id="searchTags"
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search tags..."
								className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="w-4 h-4 text-gray-400"
									viewBox="0 0 20 20"
									fill="currentColor">
									<path
										fillRule="evenodd"
										d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Tag list */}
			<div className="p-6 bg-white rounded-lg shadow">
				<h2 className="mb-4 text-lg font-medium text-gray-700">All Tags</h2>

				{loading && tags.length > 0 ? (
					<div className="flex justify-center py-4">
						<div className="w-8 h-8 rounded-full border-b-2 border-blue-500 animate-spin"></div>
					</div>
				) : filteredTags.length === 0 ? (
					<div className="py-8 text-center text-gray-500">
						{searchQuery
							? "No tags match your search"
							: "No tags found. Create your first tag above."}
					</div>
				) : (
					<div className="flex flex-wrap gap-2">
						{filteredTags.map((tag) => (
							<div
								key={tag.id}
								className={`group relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${
									tag.isEditing
										? "border-2 border-blue-500"
										: "bg-gray-100 hover:bg-gray-200"
								}`}>
								{tag.isEditing ? (
									<div className="flex items-center">
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
											className="w-32 px-2 bg-transparent border-none focus:outline-none"
											onKeyPress={(e) => {
												if (e.key === "Enter") {
													updateTag(tag);
												}
											}}
											autoFocus
										/>
										<div className="flex ml-2">
											<button
												type="button"
												onClick={() => updateTag(tag)}
												className="p-1 text-green-600 hover:text-green-800">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													className="w-4 h-4"
													viewBox="0 0 20 20"
													fill="currentColor">
													<path
														fillRule="evenodd"
														d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
														clipRule="evenodd"
													/>
												</svg>
											</button>
											<button
												type="button"
												onClick={() => toggleEdit(tag.id)}
												className="p-1 text-gray-600 hover:text-gray-800">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													className="w-4 h-4"
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
									</div>
								) : (
									<>
										<span>{tag.name}</span>
										<div className="hidden absolute top-1 right-1 group-hover:flex items-center space-x-1">
											<button
												type="button"
												onClick={() => toggleEdit(tag.id)}
												className="p-1 text-xs bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
												title="Edit tag">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													className="w-3 h-3"
													viewBox="0 0 20 20"
													fill="currentColor">
													<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
												</svg>
											</button>
											<button
												type="button"
												onClick={() => deleteTag(tag.id)}
												className="p-1 text-xs bg-red-100 text-red-600 rounded-full hover:bg-red-200"
												title="Delete tag">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													className="w-3 h-3"
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
									</>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default TagManagement;
