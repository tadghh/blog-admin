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

		// Maybe add reverse ssh checkbox later
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
		<div className="flex justify-center items-center min-h-screen bg-gray-100">
			<div className="p-8 w-96 bg-white rounded-lg shadow-md">
				<h2 className="mb-6 text-2xl font-bold text-center">
					Connect to Database
				</h2>

				{error && (
					<div className="p-3 mb-4 text-red-700 bg-red-100 rounded">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block mb-1 text-sm font-medium">Host</label>
						<input
							type="text"
							name="host"
							value={formData.host}
							onChange={handleChange}
							className="p-2 w-full rounded border"
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
							className="p-2 w-full rounded border"
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
							className="p-2 w-full rounded border"
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
							className="p-2 w-full rounded border"
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
							className="p-2 w-full rounded border"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="px-4 py-2 w-full text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300">
						{loading ? (
							<div className="flex justify-center items-center">
								<div className="w-5 h-5 rounded-full border-t-2 border-white animate-spin"></div>
								<span className="ml-2">Connecting...</span>
							</div>
						) : (
							"Connect"
						)}
					</button>
				</form>
			</div>
		</div>
	);
};

export default DatabaseConnection;
