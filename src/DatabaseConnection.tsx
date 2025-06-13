import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
	DatabaseConnectionProps,
	Profile,
	DatabaseConnectionInfo,
} from "./interfaces";
import { ProfileManager } from "./ProfileManager";

interface ManualConnectionFormData extends DatabaseConnectionInfo {
	saveAsProfile: boolean;
	profileName: string;
}

const DatabaseConnection = ({ onConnected }: DatabaseConnectionProps) => {
	const [showManualForm, setShowManualForm] = useState(false);
	const [formData, setFormData] = useState<ManualConnectionFormData>({
		host: "localhost",
		port: "5432",
		database: "tadgh_blog_db",
		username: "postgres",
		password: "",
		saveAsProfile: false,
		profileName: "",
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const connectWithProfile = async (profile: Profile) => {
		setLoading(true);
		setError("");

		try {
			// Set as current profile
			await invoke("set_current_profile", { profileName: profile.name });

			// Connect to database
			await invoke("connect_db", {
				connectionConfig: {
					connection_string: `postgres://${profile.database_connection.username}:${profile.database_connection.password}@${profile.database_connection.host}:${profile.database_connection.port}/${profile.database_connection.database}`,
				},
			});

			onConnected(true);
		} catch (err) {
			setError((err as Error).toString());
		} finally {
			setLoading(false);
		}
	};

	const handleManualConnect = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			// Connect to database first
			await invoke("connect_db", {
				connectionConfig: {
					connection_string: `postgres://${formData.username}:${formData.password}@${formData.host}:${formData.port}/${formData.database}`,
				},
			});

			// If user wants to save as profile, create the profile
			if (formData.saveAsProfile && formData.profileName.trim()) {
				const profile: Profile = {
					name: formData.profileName.trim(),
					database_connection: {
						host: formData.host,
						port: formData.port,
						database: formData.database,
						username: formData.username,
						password: formData.password,
					},
					blog_images_path: null,
					blog_folder_path: null,
				};

				await invoke("save_profile", { profile });
				await invoke("set_current_profile", { profileName: profile.name });
			}

			onConnected(true);
		} catch (err) {
			setError((err as Error).toString());
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target;
		const newValue = type === "checkbox" ? checked : value;

		setFormData((prev) => ({
			...prev,
			[name]: newValue,
		}));
	};

	if (showManualForm) {
		return (
			<div className="flex justify-center items-center min-h-screen bg-gray-100">
				<div className="p-8 w-96 bg-white rounded-lg shadow-md">
					<h2 className="mb-6 text-2xl font-bold text-center">
						Manual Database Connection
					</h2>

					{error && (
						<div className="p-3 mb-4 text-red-700 bg-red-100 rounded border border-red-400">
							<div className="flex">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="flex-shrink-0 mr-3 w-5 h-5"
									viewBox="0 0 20 20"
									fill="currentColor">
									<path
										fillRule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
										clipRule="evenodd"
									/>
								</svg>
								<p>{error}</p>
							</div>
						</div>
					)}

					<form onSubmit={handleManualConnect} className="space-y-4">
						<div>
							<label className="block mb-1 text-sm font-medium">Host</label>
							<input
								type="text"
								name="host"
								value={formData.host}
								onChange={handleChange}
								className="p-2 w-full rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							/>
						</div>

						<div>
							<label className="block mb-1 text-sm font-medium">Port</label>
							<input
								type="text"
								name="port"
								value={formData.port}
								onChange={handleChange}
								className="p-2 w-full rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							/>
						</div>

						<div>
							<label className="block mb-1 text-sm font-medium">Database</label>
							<input
								type="text"
								name="database"
								value={formData.database}
								onChange={handleChange}
								className="p-2 w-full rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							/>
						</div>

						<div>
							<label className="block mb-1 text-sm font-medium">Username</label>
							<input
								type="text"
								name="username"
								value={formData.username}
								onChange={handleChange}
								className="p-2 w-full rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							/>
						</div>

						<div>
							<label className="block mb-1 text-sm font-medium">Password</label>
							<input
								type="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								className="p-2 w-full rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Enter your database password"
							/>
						</div>

						{/* Save as Profile Option */}
						<div className="pt-2 border-t border-gray-200">
							<div className="flex items-center mb-3">
								<input
									type="checkbox"
									id="saveAsProfile"
									name="saveAsProfile"
									checked={formData.saveAsProfile}
									onChange={handleChange}
									className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
								/>
								<label
									htmlFor="saveAsProfile"
									className="ml-2 text-sm text-gray-700">
									Save as profile for future use
								</label>
							</div>

							{formData.saveAsProfile && (
								<div>
									<label className="block mb-1 text-sm font-medium">
										Profile Name
									</label>
									<input
										type="text"
										name="profileName"
										value={formData.profileName}
										onChange={handleChange}
										className="p-2 w-full rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="Enter a name for this profile"
										required
									/>
								</div>
							)}
						</div>

						<div className="flex gap-2 pt-4">
							<button
								type="submit"
								disabled={loading}
								className="flex-1 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300">
								{loading ? (
									<div className="flex justify-center items-center">
										<div className="w-5 h-5 rounded-full border-t-2 border-white animate-spin"></div>
										<span className="ml-2">Connecting...</span>
									</div>
								) : (
									"Connect"
								)}
							</button>

							<button
								type="button"
								onClick={() => setShowManualForm(false)}
								className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300">
								Back
							</button>
						</div>
					</form>

					<div className="mt-6 text-center">
						<p className="text-xs text-gray-500">
							Make sure your PostgreSQL server is running and accessible from
							this application.
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<ProfileManager
			onProfileSelected={connectWithProfile}
			onCreateNew={() => setShowManualForm(true)}
		/>
	);
};

export default DatabaseConnection;
