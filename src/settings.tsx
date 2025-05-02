import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

interface Settings {
	blog_images_path: string | null;
	blog_folder_path: string | null;
}

export default function SettingsPage() {
	const [settings, setSettings] = useState<Settings>({
		blog_images_path: "",
		blog_folder_path: "",
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	useEffect(() => {
		loadSettings();
	}, []);

	const loadSettings = async () => {
		setLoading(true);
		try {
			const saved = await invoke<Settings>("load_settings");
			setSettings(saved);
		} catch (err) {
			setError(`Failed to load settings: ${err}`);
		} finally {
			setLoading(false);
		}
	};

	const selectImagePath = async () => {
		try {
			const data = await open({
				directory: true,
				multiple: false,
				title: "Select Blog Images Directory",
			});

			if (!data) return; // User cancelled

			setLoading(true);
			await invoke("save_settings", {
				settings: { blog_images_path: data },
			});

			setSettings((prev) => ({
				...prev,
				blog_images_path: data,
			}));

			showSuccess("Blog images directory updated successfully!");
		} catch (err) {
			setError(`Failed to update image path: ${err}`);
		} finally {
			setLoading(false);
		}
	};

	const selectBlogPath = async () => {
		try {
			const data = await open({
				directory: true,
				multiple: false,
				title: "Select Blog Files Directory",
			});

			if (!data) return; // User cancelled

			setLoading(true);
			await invoke("save_settings", {
				settings: { blog_folder_path: data },
			});

			setSettings((prev) => ({
				...prev,
				blog_folder_path: data,
			}));

			showSuccess("Blog files directory updated successfully!");
		} catch (err) {
			setError(`Failed to update blog path: ${err}`);
		} finally {
			setLoading(false);
		}
	};

	const showSuccess = (message: string) => {
		setSuccessMessage(message);
		setError("");

		// Clear the success message after 3 seconds
		setTimeout(() => {
			setSuccessMessage("");
		}, 3000);
	};

	if (loading && !settings.blog_images_path && !settings.blog_folder_path) {
		return (
			<div className="flex justify-center items-center h-full">
				<div className="w-10 h-10 rounded-full border-b-2 border-blue-500 animate-spin"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-800">Settings</h1>
			</div>

			{/* Notification Messages */}
			{error && (
				<div className="relative p-4 text-red-700 bg-red-100 rounded-md border border-red-400">
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

			{successMessage && (
				<div className="relative p-4 text-green-700 bg-green-100 rounded-md border border-green-400">
					<span>{successMessage}</span>
					<button
						className="absolute top-3 right-3 text-green-700 hover:text-green-900"
						onClick={() => setSuccessMessage("")}>
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

			{/* Settings Form */}
			<div className="p-6 bg-white rounded-lg shadow">
				<div className="space-y-6">
					<div>
						<h3 className="text-lg font-medium text-gray-900">
							Directory Paths
						</h3>
						<p className="mt-1 text-sm text-gray-500">
							Configure the directories where your blog images and files are
							stored
						</p>
					</div>

					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div className="space-y-2">
							<label className="block text-sm font-medium text-gray-700">
								Blog Images Directory
							</label>
							<div className="flex gap-2">
								<input
									type="text"
									value={settings.blog_images_path || ""}
									readOnly
									className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="No directory selected"
								/>
								<button
									onClick={selectImagePath}
									disabled={loading}
									className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50">
									{loading ? (
										<svg
											className="w-5 h-5 mr-2 text-white animate-spin"
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
									) : (
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="w-5 h-5 mr-2"
											viewBox="0 0 20 20"
											fill="currentColor">
											<path
												fillRule="evenodd"
												d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
												clipRule="evenodd"
											/>
											<path d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z" />
										</svg>
									)}
									Browse
								</button>
							</div>
							<p className="text-xs text-gray-500">
								Directory where blog post images will be stored
							</p>
						</div>

						<div className="space-y-2">
							<label className="block text-sm font-medium text-gray-700">
								Blog Files Directory
							</label>
							<div className="flex gap-2">
								<input
									type="text"
									value={settings.blog_folder_path || ""}
									readOnly
									className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="No directory selected"
								/>
								<button
									onClick={selectBlogPath}
									disabled={loading}
									className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50">
									{loading ? (
										<svg
											className="w-5 h-5 mr-2 text-white animate-spin"
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
									) : (
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="w-5 h-5 mr-2"
											viewBox="0 0 20 20"
											fill="currentColor">
											<path
												fillRule="evenodd"
												d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
												clipRule="evenodd"
											/>
											<path d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z" />
										</svg>
									)}
									Browse
								</button>
							</div>
							<p className="text-xs text-gray-500">
								Directory where blog post content files will be stored
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Tips and Help */}
			<div className="p-6 bg-white rounded-lg shadow">
				<h3 className="text-lg font-medium text-gray-900">Tips</h3>
				<div className="mt-4 space-y-4">
					<div className="flex">
						<div className="flex-shrink-0">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="w-5 h-5 text-blue-500"
								viewBox="0 0 20 20"
								fill="currentColor">
								<path
									fillRule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						<p className="ml-3 text-sm text-gray-600">
							The blog images directory should be accessible to your website and
							will store all uploaded blog post images.
						</p>
					</div>
					<div className="flex">
						<div className="flex-shrink-0">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="w-5 h-5 text-blue-500"
								viewBox="0 0 20 20"
								fill="currentColor">
								<path
									fillRule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						<p className="ml-3 text-sm text-gray-600">
							The blog files directory will store the content files for your
							blog posts.
						</p>
					</div>
					<div className="flex">
						<div className="flex-shrink-0">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="w-5 h-5 text-yellow-500"
								viewBox="0 0 20 20"
								fill="currentColor">
								<path
									fillRule="evenodd"
									d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						<p className="ml-3 text-sm text-gray-600">
							Make sure you have write permissions for both directories.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
