import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
	DatabaseConnectionProps,
	Settings,
	DatabaseConnectionInfo,
} from "./interfaces";

const DatabaseConnection = ({ onConnected }: DatabaseConnectionProps) => {
	const [formData, setFormData] = useState<DatabaseConnectionInfo>({
		host: "localhost",
		port: "5432",
		database: "tadgh_blog_db",
		username: "postgres",
		password: "",
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [saveConnection, setSaveConnection] = useState(false);
	const [hasSavedConnection, setHasSavedConnection] = useState(false);
	const [autoConnecting, setAutoConnecting] = useState(false);
	const [showManualForm, setShowManualForm] = useState(false);
	const [loadingSettings, setLoadingSettings] = useState(true);

	useEffect(() => {
		loadSavedConnection();
	}, []);

	const loadSavedConnection = async () => {
		setLoadingSettings(true);
		try {
			const settings = await invoke<Settings>("load_settings");
			if (settings.database_connection && settings.save_database_connection) {
				setFormData(settings.database_connection);
				setHasSavedConnection(true);
				setSaveConnection(true);

				// Don't show manual form initially if we have saved credentials
				setShowManualForm(false);
			} else {
				setShowManualForm(true);
			}
		} catch (err) {
			console.warn("No saved connection settings found:", err);
			setShowManualForm(true);
		} finally {
			setLoadingSettings(false);
		}
	};

	const saveConnectionSettings = async (
		connectionInfo: DatabaseConnectionInfo
	) => {
		if (saveConnection) {
			try {
				await invoke("save_settings", {
					settings: {
						database_connection: connectionInfo,
						save_database_connection: true,
					},
				});
			} catch (err) {
				console.error("Failed to save connection settings:", err);
			}
		} else {
			// Clear saved connection if user unchecked save option
			try {
				await invoke("save_settings", {
					settings: {
						database_connection: null,
						save_database_connection: false,
					},
				});
			} catch (err) {
				console.error("Failed to clear connection settings:", err);
			}
		}
	};

	const connectToDatabase = async (connectionInfo: DatabaseConnectionInfo) => {
		try {
			await invoke("connect_db", {
				connectionConfig: {
					connection_string: `postgres://${connectionInfo.username}:${connectionInfo.password}@${connectionInfo.host}:${connectionInfo.port}/${connectionInfo.database}`,
				},
			});

			// Save connection settings if requested
			await saveConnectionSettings(connectionInfo);
			onConnected(true);
		} catch (err) {
			throw err;
		}
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value, type } = e.target;
		const newValue =
			type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

		if (name === "saveConnection") {
			setSaveConnection(newValue as boolean);
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: newValue,
			}));
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			await connectToDatabase(formData);
		} catch (err) {
			setError((err as Error).toString());
		} finally {
			setLoading(false);
		}
	};

	const handleAutoConnect = async () => {
		setAutoConnecting(true);
		setError("");

		try {
			await connectToDatabase(formData);
		} catch (err) {
			setError((err as Error).toString());
			setShowManualForm(true);
		} finally {
			setAutoConnecting(false);
		}
	};

	const handleForgetConnection = async () => {
		try {
			await invoke("save_settings", {
				settings: {
					database_connection: null,
					save_database_connection: false,
				},
			});
			setHasSavedConnection(false);
			setSaveConnection(false);
			setFormData({
				host: "localhost",
				port: "5432",
				database: "tadgh_blog_db",
				username: "postgres",
				password: "",
			});
			setShowManualForm(true);
		} catch (err) {
			setError("Failed to clear saved connection");
		}
	};

	if (loadingSettings) {
		return (
			<div className="flex justify-center items-center min-h-screen bg-gray-100">
				<div className="flex flex-col items-center space-y-4">
					<div className="w-8 h-8 rounded-full border-b-2 border-blue-500 animate-spin"></div>
					<p className="text-sm text-gray-600">
						Loading connection settings...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex justify-center items-center min-h-screen bg-gray-100">
			<div className="p-8 w-96 bg-white rounded-lg shadow-md">
				<h2 className="mb-6 text-2xl font-bold text-center">
					Connect to Database
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

				{/* Saved Connection Options */}
				{hasSavedConnection && !showManualForm && (
					<div className="mb-6 space-y-4">
						<div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
							<div className="flex items-center mb-3">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="mr-2 w-5 h-5 text-blue-600"
									viewBox="0 0 20 20"
									fill="currentColor">
									<path
										fillRule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
										clipRule="evenodd"
									/>
								</svg>
								<h3 className="text-sm font-medium text-blue-800">
									Saved Connection Found
								</h3>
							</div>
							<div className="space-y-1 text-sm text-blue-700">
								<p>
									<span className="font-medium">Host:</span> {formData.host}
								</p>
								<p>
									<span className="font-medium">Port:</span> {formData.port}
								</p>
								<p>
									<span className="font-medium">Database:</span>{" "}
									{formData.database}
								</p>
								<p>
									<span className="font-medium">Username:</span>{" "}
									{formData.username}
								</p>
								<p>
									<span className="font-medium">Password:</span>{" "}
									{"•".repeat(formData.password.length)}
								</p>
							</div>
						</div>

						<div className="flex gap-2">
							<button
								onClick={handleAutoConnect}
								disabled={autoConnecting}
								className="flex-1 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300">
								{autoConnecting ? (
									<div className="flex justify-center items-center">
										<div className="w-5 h-5 rounded-full border-t-2 border-white animate-spin"></div>
										<span className="ml-2">Connecting...</span>
									</div>
								) : (
									"Connect"
								)}
							</button>
							<button
								onClick={() => setShowManualForm(true)}
								className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300">
								Manual
							</button>
						</div>

						<div className="flex justify-center">
							<button
								onClick={handleForgetConnection}
								className="text-sm text-red-600 underline hover:text-red-800">
								Forget saved connection
							</button>
						</div>
					</div>
				)}

				{/* Manual Connection Form */}
				{showManualForm && (
					<form onSubmit={handleSubmit} className="space-y-4">
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

						{/* Save Connection Checkbox */}
						<div className="flex items-center">
							<input
								type="checkbox"
								id="saveConnection"
								name="saveConnection"
								checked={saveConnection}
								onChange={handleChange}
								className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
							/>
							<label
								htmlFor="saveConnection"
								className="ml-2 text-sm text-gray-700">
								Save connection for next time
							</label>
						</div>

						<div className="flex gap-2">
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

							{hasSavedConnection && (
								<button
									type="button"
									onClick={() => setShowManualForm(false)}
									className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300">
									Back
								</button>
							)}
						</div>
					</form>
				)}

				<div className="mt-6 text-center">
					<p className="text-xs text-gray-500">
						Make sure your PostgreSQL server is running and accessible from this
						application.
					</p>
				</div>
			</div>
		</div>
	);
};

export default DatabaseConnection;
