import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { LoadingSpinner, ContentCard } from "./components";
import { Notification } from "./components/index";

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
	const [savingImages, setSavingImages] = useState(false);
	const [savingFiles, setSavingFiles] = useState(false);
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

			setSavingImages(true);
			await invoke("save_settings", {
				settings: { blog_images_path: data },
			});

			setSettings((prev) => ({
				...prev,
				blog_images_path: data,
			}));

			setSuccessMessage("Blog images directory updated successfully!");
		} catch (err) {
			setError(`Failed to update image path: ${err}`);
		} finally {
			setSavingImages(false);
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

			setSavingFiles(true);
			await invoke("save_settings", {
				settings: { blog_folder_path: data },
			});

			setSettings((prev) => ({
				...prev,
				blog_folder_path: data,
			}));

			setSuccessMessage("Blog files directory updated successfully!");
		} catch (err) {
			setError(`Failed to update blog path: ${err}`);
		} finally {
			setSavingFiles(false);
		}
	};

	if (loading && !settings.blog_images_path && !settings.blog_folder_path) {
		return <LoadingSpinner />;
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-800">Settings</h1>
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

			{/* Settings Form */}
			<ContentCard>
				<div className="p-6">
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
							{/* Blog Images Directory */}
							<div className="space-y-2">
								<label className="block text-sm font-medium text-gray-700">
									Blog Images Directory
								</label>
								<div className="flex gap-2">
									<input
										type="text"
										value={settings.blog_images_path || ""}
										readOnly
										className="flex-1 px-3 py-2 bg-gray-50 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="No directory selected"
									/>
									<button
										onClick={selectImagePath}
										disabled={savingImages}
										className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50">
										{savingImages ? (
											<>
												<svg
													className="mr-2 w-4 h-4 text-white animate-spin"
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
												Saving...
											</>
										) : (
											<>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													className="mr-2 w-4 h-4"
													viewBox="0 0 20 20"
													fill="currentColor">
													<path
														fillRule="evenodd"
														d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
														clipRule="evenodd"
													/>
													<path d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z" />
												</svg>
												Browse
											</>
										)}
									</button>
								</div>
								<p className="text-xs text-gray-500">
									Directory where blog post images will be stored
								</p>
							</div>

							{/* Blog Files Directory */}
							<div className="space-y-2">
								<label className="block text-sm font-medium text-gray-700">
									Blog Files Directory
								</label>
								<div className="flex gap-2">
									<input
										type="text"
										value={settings.blog_folder_path || ""}
										readOnly
										className="flex-1 px-3 py-2 bg-gray-50 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="No directory selected"
									/>
									<button
										onClick={selectBlogPath}
										disabled={savingFiles}
										className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50">
										{savingFiles ? (
											<>
												<svg
													className="mr-2 w-4 h-4 text-white animate-spin"
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
												Saving...
											</>
										) : (
											<>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													className="mr-2 w-4 h-4"
													viewBox="0 0 20 20"
													fill="currentColor">
													<path
														fillRule="evenodd"
														d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
														clipRule="evenodd"
													/>
													<path d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z" />
												</svg>
												Browse
											</>
										)}
									</button>
								</div>
								<p className="text-xs text-gray-500">
									Directory where blog post content files will be stored
								</p>
							</div>
						</div>
					</div>
				</div>
			</ContentCard>

			{/* Configuration Status */}
			<ContentCard>
				<div className="p-6">
					<h3 className="mb-4 text-lg font-medium text-gray-900">
						Configuration Status
					</h3>
					<div className="space-y-3">
						<div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
							<span className="text-sm font-medium text-gray-700">
								Blog Images Directory
							</span>
							<div className="flex items-center">
								{settings.blog_images_path ? (
									<>
										<svg
											className="mr-2 w-5 h-5 text-green-500"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
										<span className="text-sm text-green-600">Configured</span>
									</>
								) : (
									<>
										<svg
											className="mr-2 w-5 h-5 text-yellow-500"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
											/>
										</svg>
										<span className="text-sm text-yellow-600">Not Set</span>
									</>
								)}
							</div>
						</div>

						<div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
							<span className="text-sm font-medium text-gray-700">
								Blog Files Directory
							</span>
							<div className="flex items-center">
								{settings.blog_folder_path ? (
									<>
										<svg
											className="mr-2 w-5 h-5 text-green-500"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
										<span className="text-sm text-green-600">Configured</span>
									</>
								) : (
									<>
										<svg
											className="mr-2 w-5 h-5 text-yellow-500"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
											/>
										</svg>
										<span className="text-sm text-yellow-600">Not Set</span>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</ContentCard>

			{/* Tips and Help */}
			<ContentCard>
				<div className="p-6">
					<h3 className="mb-4 text-lg font-medium text-gray-900">
						Tips & Information
					</h3>
					<div className="space-y-4">
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
								The blog images directory should be accessible to your website
								and will store all uploaded blog post images.
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
								blog posts (Markdown, HTML, etc.).
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
						<div className="flex">
							<div className="flex-shrink-0">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="w-5 h-5 text-green-500"
									viewBox="0 0 20 20"
									fill="currentColor">
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<p className="ml-3 text-sm text-gray-600">
								Changes are saved automatically when you select a directory.
							</p>
						</div>
					</div>
				</div>
			</ContentCard>
		</div>
	);
}
