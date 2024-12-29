import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Tag } from "./interfaces";

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

	useEffect(() => {
		fetchTags();
	}, []);

	const fetchTags = async () => {
		try {
			const fetchedTags = await invoke<Tag[]>("get_tags");
			setTags(fetchedTags);
		} catch (err) {
			setError("Failed to fetch tags");
			console.error(err);
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

		try {
			const newTag = await invoke<Tag>("create_tag", {
				name: newTagName.trim(),
			});
			setTags([...tags, newTag]);
			onTagsChange([...selectedTags, newTag]);
			setNewTagName("");
			setIsAddingTag(false);
		} catch (err) {
			setError("Failed to create tag");
			console.error(err);
		}
	};

	return (
		<div className="space-y-2">
			<div className="flex flex-wrap gap-2">
				{tags.map((tag) => (
					<button
						key={tag.id}
						type="button"
						onClick={() => toggleTag(tag)}
						className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
              ${
								selectedTags.some((t) => t.id === tag.id)
									? "bg-blue-500 text-white"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}>
						{tag.name}
					</button>
				))}
				<button
					onClick={() => setIsAddingTag(true)}
					type="button"
					className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200">
					+ Add Tag
				</button>
			</div>

			{isAddingTag && (
				<div className="flex gap-2 items-center">
					<input
						type="text"
						value={newTagName}
						onChange={(e) => setNewTagName(e.target.value)}
						placeholder="Enter tag name"
						className="px-3 py-1 rounded border"
						onKeyPress={(e) => e.key === "Enter" && createNewTag()}
					/>
					<button
						type="button"
						onClick={createNewTag}
						className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600">
						Add
					</button>
					<button
						type="button"
						onClick={() => {
							setIsAddingTag(false);
							setNewTagName("");
						}}
						className="px-3 py-1 text-gray-700 bg-gray-300 rounded hover:bg-gray-400">
						Cancel
					</button>
				</div>
			)}

			{error && <div className="text-sm text-red-500">{error}</div>}
		</div>
	);
};

export default TagSelector;
