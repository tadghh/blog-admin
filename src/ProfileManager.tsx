import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { Profile, DatabaseConnectionInfo } from "./interfaces";
import { ContentCard, ActionButton } from "./components";
import { Modal, Notification } from "./components/index";
import {
	PlusIcon,
	EditIcon,
	DeleteIcon,
	FolderIcon,
	SuccessIcon,
} from "./Icons";

interface ProfileManagerProps {
	onProfileSelected: (profile: Profile) => void;
	onCreateNew: () => void;
}

interface ProfileFormData {
	name: string;
	database_connection: DatabaseConnectionInfo;
	blog_images_path: string;
	blog_folder_path: string;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({
	onProfileSelected,
	onCreateNew,
}) => {
	const [profiles, setProfiles] = useState<Profile[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
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
	}, []);

	const loadProfiles = async () => {
		setLoading(true);
		try {
			const profileList = await invoke<Profile[]>("get_profiles");
			setProfiles(profileList);
		} catch (err) {
			setError(`Failed to load profiles: ${err}`);
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
			setSuccessMessage(`Profile "${profileName}" deleted successfully!`);
		} catch (err) {
			setError(`Failed to delete profile: ${err}`);
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

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen bg-gray-100">
				<div className="flex flex-col items-center space-y-4">
					<div className="w-8 h-8 rounded-full border-b-2 border-blue-500 animate-spin"></div>
					<p className="text-sm text-gray-600">Loading profiles...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex justify-center items-center min-h-screen bg-gray-100">
			<div className="p-8 w-full max-w-4xl bg-white rounded-lg shadow-md">
				<h2 className="mb-6 text-2xl font-bold text-center">
					Select Connection Profile
				</h2>

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

				{/* Profiles List */}
				{profiles.length > 0 ? (
					<div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-3">
						{profiles.map((profile) => (
							<ContentCard key={profile.name}>
								<div className="p-4">
									<div className="flex justify-between items-start mb-3">
										<h3 className="font-semibold text-gray-800">
											{profile.name}
										</h3>
										<div className="flex gap-1">
											<button
												onClick={() => startEdit(profile)}
												className="p-1 text-blue-600 rounded hover:bg-blue-50"
												title="Edit profile">
												<EditIcon className="w-4 h-4" />
											</button>
											<button
												onClick={() => deleteProfile(profile.name)}
												className="p-1 text-red-600 rounded hover:bg-red-50"
												title="Delete profile">
												<DeleteIcon className="w-4 h-4" />
											</button>
										</div>
									</div>

									<div className="space-y-2 text-sm text-gray-600">
										<div>
											<span className="font-medium">Host:</span>{" "}
											{profile.database_connection.host}
										</div>
										<div>
											<span className="font-medium">Database:</span>{" "}
											{profile.database_connection.database}
										</div>
										<div className="flex items-center">
											<SuccessIcon className="mr-1 w-4 h-4 text-green-500" />
											<span>
												Images: {profile.blog_images_path ? "✓" : "Not set"}
											</span>
										</div>
										<div className="flex items-center">
											<SuccessIcon className="mr-1 w-4 h-4 text-green-500" />
											<span>
												Files: {profile.blog_folder_path ? "✓" : "Not set"}
											</span>
										</div>
									</div>

									<button
										onClick={() => onProfileSelected(profile)}
										className="px-4 py-2 mt-4 w-full text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
										Connect with this Profile
									</button>
								</div>
							</ContentCard>
						))}
					</div>
				) : (
					<div className="p-8 mb-6 text-center bg-gray-50 rounded-lg">
						<p className="mb-4 text-gray-600">
							No profiles found. Create your first profile to get started.
						</p>
					</div>
				)}

				{/* Action Buttons */}
				<div className="flex gap-3 justify-center">
					<ActionButton
						onClick={() => setShowCreateModal(true)}
						variant="primary"
						icon={<PlusIcon />}>
						Create New Profile
					</ActionButton>
					<ActionButton onClick={onCreateNew} variant="warning">
						Manual Connection
					</ActionButton>
				</div>

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
									<label className="block mb-1 text-xs text-gray-600">
										Host
									</label>
									<input
										type="text"
										name="host"
										value={formData.database_connection.host}
										onChange={(e) =>
											handleInputChange(e, "database_connection")
										}
										className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
										required
									/>
								</div>
								<div>
									<label className="block mb-1 text-xs text-gray-600">
										Port
									</label>
									<input
										type="text"
										name="port"
										value={formData.database_connection.port}
										onChange={(e) =>
											handleInputChange(e, "database_connection")
										}
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
										onChange={(e) =>
											handleInputChange(e, "database_connection")
										}
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
										onChange={(e) =>
											handleInputChange(e, "database_connection")
										}
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
							<ActionButton onClick={resetForm} variant="danger">
								Cancel
							</ActionButton>
							<ActionButton onClick={saveProfile} variant="primary">
								{editingProfile ? "Update Profile" : "Create Profile"}
							</ActionButton>
						</div>
					</div>
				</Modal>
			</div>
		</div>
	);
};
