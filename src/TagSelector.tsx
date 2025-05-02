import React, { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Tag } from "./interfaces";
import { ErrorMessage } from "./components";

interface TagSelectorProps {
	selectedTags: Tag[];
	onTagsChange: (tags: Tag[]) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({
	selectedTags,
	onTagsChange,
}) => {
	const [tags, setTags] = useState<Tag[]>([]);
	const [newTagName, setNewTagName] = useState("");
	const [isAddingTag, setIsAddingTag] = useState(false);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		fetchTags();
	}, []);

	useEffect(() => {
		if (isAddingTag && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isAddingTag]);

	const fetchTags = async () => {
		setIsLoading(true);
		try {
			const fetchedTags = await invoke<Tag[]>("get_tags");
			setTags(fetchedTags);
		} catch (err) {
			setError("Failed to fetch tags");
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	const toggleTag = (tag: Tag) => {
		const isSelected = selectedTags.some((t) => t.id === tag.id);
		if (isSelected) {
			onTagsChange(selectedTags.filter((t) => t.id !== tag.id));
		} else {
			onTagsChange([...selectedTags, tag]);
		}
	};

	const createNewTag = async () => {
		if (!newTagName.trim()) return;

		setIsLoading(true);
		try {
			const newTag = await invoke<Tag>("create_tag", {
				name: newTagName.trim(),
			});
			setTags([...tags, newTag]);
			onTagsChange([...selectedTags, newTag]);
			setNewTagName("");
			setIsAddingTag(false);
			setError("");
		} catch (err) {
			setError("Failed to create tag");
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			createNewTag();
		} else if (e.key === "Escape") {
			setIsAddingTag(false);
			setNewTagName("");
		}
	};

	// Filter tags based on search query
	const filteredTags = tags.filter((tag) =>
		searchQuery
			? tag.name.toLowerCase().includes(searchQuery.toLowerCase())
			: true
	);

	// Available tags (not already selected)
	const availableTags = filteredTags.filter(
		(tag) => !selectedTags.some((selectedTag) => selectedTag.id === tag.id)
	);

	return (
		<div className="space-y-3">
			{/* Selected Tags */}
			<div className="flex flex-wrap gap-2 mb-3">
				{selectedTags.length > 0 ? (
					selectedTags.map((tag) => (
						<div
							key={tag.id}
							className="flex items-center gap-1 px-3 py-1 text-sm text-white bg-blue-500 rounded-full">
							<span>{tag.name}</span>
							<button
								type="button"
								onClick={() => toggleTag(tag)}
								className="flex items-center justify-center w-4 h-4 text-blue-200 rounded-full hover:bg-blue-600 hover:text-white focus:outline-none">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="w-3 h-3"
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
					))
				) : (
					<div className="text-sm text-gray-500">No tags selected</div>
				)}
			</div>

			{/* Search and Add Tag */}
			<div className="flex gap-2">
				<div className="relative flex-grow">
					<input
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
				<button
					type="button"
					onClick={() => {
						setIsAddingTag(true);
						setSearchQuery("");
					}}
					className="px-3 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
					Add New
				</button>
			</div>

			{/* New Tag Form */}
			{isAddingTag && (
				<div className="p-4 mt-3 border border-gray-300 rounded-md bg-gray-50">
					<h4 className="mb-2 text-sm font-medium text-gray-700">
						Create New Tag
					</h4>
					<div className="flex gap-2">
						<input
							ref={inputRef}
							type="text"
							value={newTagName}
							onChange={(e) => setNewTagName(e.target.value)}
							onKeyDown={handleKeyPress}
							placeholder="Enter tag name"
							className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<button
							type="button"
							onClick={createNewTag}
							disabled={isLoading || !newTagName.trim()}
							className={`px-3 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 ${
								isLoading || !newTagName.trim()
									? "opacity-50 cursor-not-allowed"
									: ""
							}`}>
							{isLoading ? "Adding..." : "Add"}
						</button>
						<button
							type="button"
							onClick={() => {
								setIsAddingTag(false);
								setNewTagName("");
							}}
							className="px-3 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500">
							Cancel
						</button>
					</div>
				</div>
			)}

			{/* Available Tags */}
			{!isAddingTag && (
				<div className="mt-3">
					<h4 className="mb-2 text-sm font-medium text-gray-700">
						Available Tags
					</h4>
					<div className="flex flex-wrap gap-2">
						{isLoading ? (
							<div className="flex items-center text-sm text-gray-500">
								<svg
									className="w-4 h-4 mr-2 text-gray-400 animate-spin"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24">
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Loading tags...
							</div>
						) : availableTags.length > 0 ? (
							availableTags.map((tag) => (
								<button
									key={tag.id}
									type="button"
									onClick={() => toggleTag(tag)}
									className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
									{tag.name}
								</button>
							))
						) : searchQuery ? (
							<div className="text-sm text-gray-500">
								No matching tags found
							</div>
						) : (
							<div className="text-sm text-gray-500">No available tags</div>
						)}
					</div>
				</div>
			)}

			{error && <ErrorMessage message={error} onDismiss={() => setError("")} />}
		</div>
	);
};

export default TagSelector;
