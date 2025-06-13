import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { LoadingSpinner, ContentCard } from "./components";
import { Notification, Modal, ConfirmationDialog } from "./components/index";
import { Profile } from "./interfaces";
import {
	EditIcon,
	DeleteIcon,
	FolderIcon,
	PlusIcon,
	SuccessIcon,
	WarningIcon,
} from "./Icons";

interface ProfileFormData {
	name: string;
	database_connection: {
		host: string;
		port: string;
		database: string;
		username: string;
		password: string;
	};
	blog_images_path: string;
	blog_folder_path: string;
}

export default function SettingsPage() {
	const [profiles, setProfiles] = useState<Profile[]>([]);
	const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
	const [confirmDialog, setConfirmDialog] = useState<{
		isOpen: boolean;
		profileName: string;
	}>({
		isOpen: false,
		profileName: "",
	});

	const [formData, setFormData] = useState<ProfileFormData>({
		name: "",
		database_connection: {
			host: "localhost",
			port: "5432",
			database: "tadgh_blog_db",
			username: "postgres",
			password: "",
		},
		blog_images_path: "",
		blog_folder_path: "",
	});

	useEffect(() => {
		loadProfiles();
		loadCurrentProfile();
	}, []);

	const loadProfiles = async () => {
		try {
			const profileList = await invoke<Profile[]>("get_profiles");
			setProfiles(profileList);
		} catch (err) {
			setError(`Failed to load profiles: ${err}`);
		}
	};

	const loadCurrentProfile = async () => {
		setLoading(true);
		try {
			const current = await invoke<Profile | null>("get_current_profile");
			setCurrentProfile(current);
		} catch (err) {
			setError(`Failed to load current profile: ${err}`);
		} finally {
			setLoading(false);
		}
	};

	const saveProfile = async () => {
		if (!formData.name.trim()) {
			setError("Profile name is required");
			return;
		}

		try {
			const profile: Profile = {
				name: formData.name.trim(),
				database_connection: formData.database_connection,
				blog_images_path: formData.blog_images_path || null,
				blog_folder_path: formData.blog_folder_path || null,
			};

			await invoke("save_profile", { profile });
			await loadProfiles();

			// If this is the current profile, update it
			if (currentProfile && currentProfile.name === profile.name) {
				setCurrentProfile(profile);
			}

			resetForm();
			setSuccessMessage(`Profile "${profile.name}" saved successfully!`);
		} catch (err) {
			setError(`Failed to save profile: ${err}`);
		}
	};

	const deleteProfile = async (profileName: string) => {
		try {
			await invoke("delete_profile", { profileName });
			await loadProfiles();

			// If we deleted the current profile, clear it
			if (currentProfile && currentProfile.name === profileName) {
				setCurrentProfile(null);
			}

			setSuccessMessage(`Profile "${profileName}" deleted successfully!`);
		} catch (err) {
			setError(`Failed to delete profile: ${err}`);
		}
	};

	const switchToProfile = async (profileName: string) => {
		try {
			await invoke("set_current_profile", { profileName });
			await loadCurrentProfile();
			setSuccessMessage(`Switched to profile "${profileName}"`);
		} catch (err) {
			setError(`Failed to switch profile: ${err}`);
		}
	};

	const resetForm = () => {
		setFormData({
			name: "",
			database_connection: {
				host: "localhost",
				port: "5432",
				database: "tadgh_blog_db",
				username: "postgres",
				password: "",
			},
			blog_images_path: "",
			blog_folder_path: "",
		});
		setShowCreateModal(false);
		setEditingProfile(null);
	};

	const startEdit = (profile: Profile) => {
		setEditingProfile(profile);
		setFormData({
			name: profile.name,
			database_connection: { ...profile.database_connection },
			blog_images_path: profile.blog_images_path || "",
			blog_folder_path: profile.blog_folder_path || "",
		});
		setShowCreateModal(true);
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		section?: "database_connection"
	) => {
		const { name, value } = e.target;

		if (section === "database_connection") {
			setFormData((prev) => ({
				...prev,
				database_connection: {
					...prev.database_connection,
					[name]: value,
				},
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	const selectDirectory = async (
		field: "blog_images_path" | "blog_folder_path"
	) => {
		try {
			const result = await open({
				directory: true,
				multiple: false,
				title: `Select ${
					field === "blog_images_path" ? "Images" : "Files"
				} Directory`,
			});

			if (result) {
				setFormData((prev) => ({
					...prev,
					[field]: result,
				}));
			}
		} catch (err) {
			setError(`Failed to select directory: ${err}`);
		}
	};

	const showDeleteConfirmation = (profileName: string) => {
		setConfirmDialog({
			isOpen: true,
			profileName,
		});
	};

	const handleConfirmedDelete = async () => {
		if (confirmDialog.profileName) {
			await deleteProfile(confirmDialog.profileName);
		}
		setConfirmDialog({ isOpen: false, profileName: "" });
	};

	if (loading && !currentProfile && profiles.length === 0) {
		return <LoadingSpinner />;
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-800">Profile Management</h1>
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

			{/* Current Profile */}
			<ContentCard>
				<div className="p-6">
					<div className="flex justify-between items-center mb-4">
						<h3 className="text-lg font-medium text-gray-900">
							Current Profile
						</h3>
						{currentProfile && (
							<button
								onClick={() => startEdit(currentProfile)}
								className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">
								<EditIcon className="mr-2 w-4 h-4" />
								Edit Current Profile
							</button>
						)}
					</div>

					{currentProfile ? (
						<div className="p-4 bg-green-50 rounded-lg border border-green-200">
							<div className="flex items-center mb-3">
								<SuccessIcon className="mr-2 w-5 h-5 text-green-600" />
								<h4 className="text-lg font-semibold text-green-800">
									{currentProfile.name}
								</h4>
							</div>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div>
									<p className="text-sm text-green-700">
										<span className="font-medium">Host:</span>{" "}
										{currentProfile.database_connection.host}
									</p>
									<p className="text-sm text-green-700">
										<span className="font-medium">Database:</span>{" "}
										{currentProfile.database_connection.database}
									</p>
								</div>
								<div>
									<p className="text-sm text-green-700">
										<span className="font-medium">Images:</span>{" "}
										{currentProfile.blog_images_path || "Not configured"}
									</p>
									<p className="text-sm text-green-700">
										<span className="font-medium">Files:</span>{" "}
										{currentProfile.blog_folder_path || "Not configured"}
									</p>
								</div>
							</div>
						</div>
					) : (
						<div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
							<div className="flex items-center">
								<WarningIcon className="mr-2 w-5 h-5 text-yellow-600" />
								<span className="text-sm text-yellow-700">
									No profile is currently active. Select a profile from the list
									below.
								</span>
							</div>
						</div>
					)}
				</div>
			</ContentCard>

			{/* All Profiles */}
			<ContentCard>
				<div className="p-6">
					<div className="flex justify-between items-center mb-4">
						<h3 className="text-lg font-medium text-gray-900">All Profiles</h3>
						<button
							onClick={() => setShowCreateModal(true)}
							className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
							<PlusIcon className="mr-2 w-4 h-4" />
							Create New Profile
						</button>
					</div>

					{profiles.length === 0 ? (
						<div className="p-8 text-center text-gray-500">
							No profiles found. Create your first profile to get started.
						</div>
					) : (
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
							{profiles.map((profile) => (
								<div
									key={profile.name}
									className={`p-4 rounded-lg border-2 transition-colors ${
										currentProfile?.name === profile.name
											? "border-green-500 bg-green-50"
											: "border-gray-200 bg-white hover:border-gray-300"
									}`}>
									<div className="flex justify-between items-start mb-3">
										<h4 className="font-semibold text-gray-800">
											{profile.name}
										</h4>
										<div className="flex gap-1">
											<button
												onClick={() => startEdit(profile)}
												className="p-1 text-blue-600 rounded hover:bg-blue-50"
												title="Edit profile">
												<EditIcon className="w-4 h-4" />
											</button>
											<button
												onClick={() => showDeleteConfirmation(profile.name)}
												className="p-1 text-red-600 rounded hover:bg-red-50"
												title="Delete profile">
												<DeleteIcon className="w-4 h-4" />
											</button>
										</div>
									</div>

									<div className="mb-4 space-y-2 text-sm text-gray-600">
										<div>
											<span className="font-medium">Host:</span>{" "}
											{profile.database_connection.host}
										</div>
										<div>
											<span className="font-medium">Database:</span>{" "}
											{profile.database_connection.database}
										</div>
										<div>
											<span className="font-medium">Images:</span>{" "}
											{profile.blog_images_path ? "✓" : "Not set"}
										</div>
										<div>
											<span className="font-medium">Files:</span>{" "}
											{profile.blog_folder_path ? "✓" : "Not set"}
										</div>
									</div>

									{currentProfile?.name !== profile.name && (
										<button
											onClick={() => switchToProfile(profile.name)}
											className="px-3 py-2 w-full text-sm font-medium text-blue-600 rounded-md border border-blue-600 hover:bg-blue-50">
											Switch to this Profile
										</button>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			</ContentCard>

			{/* Create/Edit Profile Modal */}
			<Modal
				isOpen={showCreateModal}
				onClose={resetForm}
				title={editingProfile ? "Edit Profile" : "Create New Profile"}
				size="lg">
				<div className="space-y-6">
					{/* Profile Name */}
					<div>
						<label className="block mb-1 text-sm font-medium text-gray-700">
							Profile Name
						</label>
						<input
							type="text"
							name="name"
							value={formData.name}
							onChange={handleInputChange}
							className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Enter profile name"
							required
						/>
					</div>

					{/* Database Connection */}
					<div>
						<h4 className="mb-3 text-sm font-medium text-gray-700">
							Database Connection
						</h4>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<label className="block mb-1 text-xs text-gray-600">Host</label>
								<input
									type="text"
									name="host"
									value={formData.database_connection.host}
									onChange={(e) => handleInputChange(e, "database_connection")}
									className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
									required
								/>
							</div>
							<div>
								<label className="block mb-1 text-xs text-gray-600">Port</label>
								<input
									type="text"
									name="port"
									value={formData.database_connection.port}
									onChange={(e) => handleInputChange(e, "database_connection")}
									className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
									required
								/>
							</div>
							<div>
								<label className="block mb-1 text-xs text-gray-600">
									Database
								</label>
								<input
									type="text"
									name="database"
									value={formData.database_connection.database}
									onChange={(e) => handleInputChange(e, "database_connection")}
									className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
									required
								/>
							</div>
							<div>
								<label className="block mb-1 text-xs text-gray-600">
									Username
								</label>
								<input
									type="text"
									name="username"
									value={formData.database_connection.username}
									onChange={(e) => handleInputChange(e, "database_connection")}
									className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
									required
								/>
							</div>
						</div>
						<div className="mt-4">
							<label className="block mb-1 text-xs text-gray-600">
								Password
							</label>
							<input
								type="password"
								name="password"
								value={formData.database_connection.password}
								onChange={(e) => handleInputChange(e, "database_connection")}
								className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Enter database password"
							/>
						</div>
					</div>

					{/* Blog Directories */}
					<div>
						<h4 className="mb-3 text-sm font-medium text-gray-700">
							Blog Directories
						</h4>
						<div className="space-y-4">
							<div>
								<label className="block mb-1 text-xs text-gray-600">
									Blog Images Directory
								</label>
								<div className="flex gap-2">
									<input
										type="text"
										value={formData.blog_images_path}
										readOnly
										className="flex-1 px-3 py-2 bg-gray-50 rounded-md border border-gray-300"
										placeholder="Select directory for blog images"
									/>
									<button
										type="button"
										onClick={() => selectDirectory("blog_images_path")}
										className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
										<FolderIcon className="mr-2 w-4 h-4" />
										Browse
									</button>
								</div>
							</div>
							<div>
								<label className="block mb-1 text-xs text-gray-600">
									Blog Files Directory
								</label>
								<div className="flex gap-2">
									<input
										type="text"
										value={formData.blog_folder_path}
										readOnly
										className="flex-1 px-3 py-2 bg-gray-50 rounded-md border border-gray-300"
										placeholder="Select directory for blog files"
									/>
									<button
										type="button"
										onClick={() => selectDirectory("blog_folder_path")}
										className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
										<FolderIcon className="mr-2 w-4 h-4" />
										Browse
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* Modal Actions */}
					<div className="flex gap-3 justify-end pt-4 border-t">
						<button
							type="button"
							onClick={resetForm}
							className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50">
							Cancel
						</button>
						<button
							type="button"
							onClick={saveProfile}
							className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
							{editingProfile ? "Update Profile" : "Create Profile"}
						</button>
					</div>
				</div>
			</Modal>

			{/* Confirmation Dialog */}
			<ConfirmationDialog
				isOpen={confirmDialog.isOpen}
				onClose={() => setConfirmDialog({ isOpen: false, profileName: "" })}
				onConfirm={handleConfirmedDelete}
				title="Delete Profile"
				message={`Are you sure you want to delete the profile "${confirmDialog.profileName}"? This action cannot be undone.`}
				confirmText="Delete Profile"
				cancelText="Cancel"
				variant="danger"
			/>
		</div>
	);
}
