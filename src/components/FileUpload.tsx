import React from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { convertFileSrc } from "@tauri-apps/api/core";
import { ImageIcon, FileIcon } from "../Icons";

interface FileUploadProps {
	label: string;
	fileName?: string;
	fileUrl?: string | URL | null;
	onFileSelect: (fileName: string, fileUrl: URL) => void;
	onError: (error: string) => void;
	accept?: "images" | "documents" | "all";
	placeholder?: string;
	preview?: boolean;
	disabled?: boolean;
}

const getFileFilters = (accept: "images" | "documents" | "all") => {
	switch (accept) {
		case "images":
			return [
				{
					name: "Images",
					extensions: ["png", "jpg", "jpeg", "gif", "webp"],
				},
			];
		case "documents":
			return [
				{
					name: "Documents",
					extensions: ["md", "markdown", "txt", "html", "pdf", "doc", "docx"],
				},
			];
		case "all":
		default:
			return [];
	}
};

const getDefaultPlaceholder = (accept: "images" | "documents" | "all") => {
	switch (accept) {
		case "images":
			return "Click to upload image";
		case "documents":
			return "Click to upload document";
		default:
			return "Click to upload file";
	}
};

const getFileIcon = (accept: "images" | "documents" | "all") => {
	if (accept === "images") {
		return <ImageIcon />;
	}

	return <FileIcon />;
};

export const FileUpload: React.FC<FileUploadProps> = ({
	label,
	fileName,
	fileUrl,
	onFileSelect,
	onError,
	accept = "all",
	placeholder,
	preview = true,
	disabled = false,
}) => {
	const handleFileSelect = async () => {
		if (disabled) return;

		try {
			const result = await open({
				directory: false,
				multiple: false,
				filters: getFileFilters(accept),
			});

			if (result) {
				const selectedFileName = result.substring(result.lastIndexOf("\\") + 1);
				const selectedFileUrl = new URL(convertFileSrc(result));
				onFileSelect(selectedFileName, selectedFileUrl);
			}
		} catch (err) {
			onError(`Error selecting file: ${err}`);
		}
	};

	const displayPlaceholder = placeholder || getDefaultPlaceholder(accept);

	return (
		<div className="space-y-2">
			<label className="block text-sm font-medium text-gray-700">{label}</label>
			<div
				onClick={handleFileSelect}
				className={`p-4 rounded-md border-2 border-gray-300 border-dashed transition-colors ${
					disabled
						? "opacity-50 cursor-not-allowed"
						: "cursor-pointer hover:border-blue-500"
				}`}>
				{fileUrl && fileName && preview && accept === "images" ? (
					// Image preview
					<div className="flex flex-col items-center">
						<img
							alt="Preview"
							src={fileUrl.toString()}
							className="object-contain mb-2 max-h-48"
						/>
						<span className="text-sm text-gray-500">{fileName}</span>
					</div>
				) : fileName ? (
					// File name display
					<div className="flex flex-col items-center">
						<div className="p-4 bg-gray-100 rounded-md">
							<span className="font-mono">{fileName}</span>
						</div>
					</div>
				) : (
					// Empty state
					<div className="flex flex-col items-center py-6">
						{getFileIcon(accept)}
						<span className="mt-2 text-sm text-gray-500">
							{displayPlaceholder}
						</span>
					</div>
				)}
			</div>
		</div>
	);
};
