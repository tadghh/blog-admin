import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { DatabaseConnectionProps } from "./interfaces";

const DatabaseConnection = ({ onConnected }: DatabaseConnectionProps) => {
	const [formData, setFormData] = useState({
		host: "localhost",
		port: "5432",
		database: "tadgh_blog_db",
		username: "postgres",
		password: "",
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value, type } = e.target;
		const newValue =
			type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
		setFormData((prev) => ({
			...prev,
			[name]: newValue,
		}));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			await invoke("connect_db", {
				connectionConfig: {
					connection_string: `postgres://${formData.username}:${formData.password}@${formData.host}:${formData.port}/${formData.database}`,
				},
			});
			onConnected(true);
		} catch (err) {
			setError((err as Error).toString());
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex justify-center items-center min-h-screen bg-gray-50">
			<div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
				<div className="text-center">
					<h2 className="text-3xl font-extrabold text-gray-900">
						Content Manager
					</h2>
					<p className="mt-2 text-sm text-gray-600">
						Connect to your PostgreSQL database to get started
					</p>
				</div>

				{error && (
					<div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
						<div className="flex">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="flex-shrink-0 w-5 h-5 mr-3"
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

				<form onSubmit={handleSubmit} className="mt-8 space-y-6">
					<div className="space-y-4 rounded-md">
						<div>
							<label
								htmlFor="host"
								className="block text-sm font-medium text-gray-700">
								Host
							</label>
							<input
								id="host"
								name="host"
								type="text"
								value={formData.host}
								onChange={handleChange}
								className="relative block px-3 py-2 mt-1 w-full text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
								required
							/>
						</div>

						<div>
							<label
								htmlFor="port"
								className="block text-sm font-medium text-gray-700">
								Port
							</label>
							<input
								id="port"
								name="port"
								type="text"
								value={formData.port}
								onChange={handleChange}
								className="relative block px-3 py-2 mt-1 w-full text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
								required
							/>
						</div>

						<div>
							<label
								htmlFor="database"
								className="block text-sm font-medium text-gray-700">
								Database
							</label>
							<input
								id="database"
								name="database"
								type="text"
								value={formData.database}
								onChange={handleChange}
								className="relative block px-3 py-2 mt-1 w-full text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
								required
							/>
						</div>

						<div>
							<label
								htmlFor="username"
								className="block text-sm font-medium text-gray-700">
								Username
							</label>
							<input
								id="username"
								name="username"
								type="text"
								value={formData.username}
								onChange={handleChange}
								className="relative block px-3 py-2 mt-1 w-full text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
								required
							/>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700">
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								value={formData.password}
								onChange={handleChange}
								className="relative block px-3 py-2 mt-1 w-full text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
								placeholder="Enter your database password"
							/>
						</div>
					</div>

					<div>
						<button
							type="submit"
							disabled={loading}
							className="group relative flex justify-center py-2 px-4 w-full text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
							{loading ? (
								<div className="flex items-center">
									<svg
										className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
									Connecting...
								</div>
							) : (
								<span>Connect to Database</span>
							)}
						</button>
					</div>
				</form>

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
