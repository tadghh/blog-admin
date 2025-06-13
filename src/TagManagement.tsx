import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Tag } from "./interfaces";
import { LoadingSpinner, SearchInput, ContentCard } from "./components";
import { Notification, ConfirmationDialog } from "./components/index";

const TagManagement = () => {
	const [tags, setTags] = useState<(Tag & { isEditing?: boolean })[]>([]);
	const [newTagName, setNewTagName] = useState("");
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	// Confirmation dialog state
	const [confirmDialog, setConfirmDialog] = useState<{
		isOpen: boolean;
		tagId: number | null;
		tagName: string;
	}>({
		isOpen: false,
		tagId: null,
		tagName: "",
	});

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
			setSuccessMessage(`Tag "${newTag.name}" created successfully!`);
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
			setSuccessMessage(`Tag "${tag.name}" updated successfully!`);
		} catch (err) {
			setError("Failed to update tag");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const showDeleteConfirmation = (tag: Tag) => {
		setConfirmDialog({
			isOpen: true,
			tagId: tag.id,
			tagName: tag.name,
		});
	};

	const handleConfirmedDelete = async () => {
		if (!confirmDialog.tagId) return;

		setLoading(true);
		try {
			await invoke("delete_tag", { id: confirmDialog.tagId });
			setTags(tags.filter((tag) => tag.id !== confirmDialog.tagId));
			setSuccessMessage(`Tag "${confirmDialog.tagName}" deleted successfully!`);
		} catch (err) {
			setError("Failed to delete tag");
			console.error(err);
		} finally {
			setLoading(false);
			setConfirmDialog({ isOpen: false, tagId: null, tagName: "" });
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
		return <LoadingSpinner />;
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-800">Tags</h1>
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

			{/* Create new tag and search section */}
			<ContentCard>
				<div className="p-6">
					<h2 className="mb-4 text-lg font-medium text-gray-700">
						Tag Management
					</h2>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{/* Create Tag */}
						<div>
							<label
								htmlFor="newTag"
								className="block mb-2 text-sm font-medium text-gray-700">
								Create New Tag
							</label>
							<div className="flex">
								<input
									id="newTag"
									type="text"
									value={newTagName}
									onChange={(e) => setNewTagName(e.target.value)}
									onKeyPress={handleKeyPress}
									placeholder="Enter new tag name"
									className="flex-grow px-3 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
									{loading && tags.length === 0 ? (
										<div className="w-5 h-5 rounded-full border-t-2 border-white animate-spin"></div>
									) : (
										"Add"
									)}
								</button>
							</div>
						</div>

						{/* Search Tags */}
						<div>
							<label
								htmlFor="searchTags"
								className="block mb-2 text-sm font-medium text-gray-700">
								Search Tags
							</label>
							<SearchInput
								value={searchQuery}
								onChange={setSearchQuery}
								placeholder="Search tags..."
							/>
						</div>
					</div>
				</div>
			</ContentCard>

			{/* Tag list */}
			<ContentCard>
				<div className="p-6">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-lg font-medium text-gray-700">
							All Tags ({filteredTags.length})
						</h2>
						{searchQuery && (
							<button
								onClick={() => setSearchQuery("")}
								className="text-sm text-blue-600 hover:text-blue-800">
								Clear search
							</button>
						)}
					</div>

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
											? "border-2 border-blue-500 bg-blue-50"
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
															t.id === tag.id
																? { ...t, name: e.target.value }
																: t
														)
													);
												}}
												className="px-2 py-1 w-32 bg-transparent border-none focus:outline-none"
												onKeyPress={(e) => {
													if (e.key === "Enter") {
														updateTag(tag);
													}
													if (e.key === "Escape") {
														toggleEdit(tag.id);
													}
												}}
												onBlur={() => updateTag(tag)}
												autoFocus
											/>
											<div className="flex ml-2">
												<button
													type="button"
													onClick={() => updateTag(tag)}
													className="p-1 text-green-600 hover:text-green-800"
													title="Save changes">
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
													className="p-1 text-gray-600 hover:text-gray-800"
													title="Cancel editing">
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
											<div className="hidden absolute top-1 right-1 items-center space-x-1 group-hover:flex">
												<button
													type="button"
													onClick={() => toggleEdit(tag.id)}
													className="p-1 text-xs text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200"
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
													onClick={() => showDeleteConfirmation(tag)}
													className="p-1 text-xs text-red-600 bg-red-100 rounded-full hover:bg-red-200"
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
			</ContentCard>

			{/* Confirmation Dialog */}
			<ConfirmationDialog
				isOpen={confirmDialog.isOpen}
				onClose={() =>
					setConfirmDialog({ isOpen: false, tagId: null, tagName: "" })
				}
				onConfirm={handleConfirmedDelete}
				title="Delete Tag"
				message={`Are you sure you want to delete the tag "${confirmDialog.tagName}"? This action cannot be undone.`}
				confirmText="Delete Tag"
				cancelText="Cancel"
				variant="danger"
				isLoading={loading}
			/>
		</div>
	);
};

export default TagManagement;
