import {
	HashRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import AdminForms from "./AdminForms";
import EditForms from "./EditForms";
import Settings from "./settings";
import DatabaseConnection from "./bootup";
import TagManagement from "./TagManagement";
import CategoryManagement from "./CategoryManagement";
import Views from "./Views";
import Analytics from "./Analytics";
import { Sidebar } from "./components/index";
import "./App.css";

function App() {
	const [isConnected, setIsConnected] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Check if database connection exists on app start
		const checkConnection = async () => {
			try {
				const connected = await invoke<boolean>("check_db_connection");
				setIsConnected(connected);
			} catch (err) {
				console.error("Failed to check connection:", err);
				setIsConnected(false);
			} finally {
				setIsLoading(false);
			}
		};

		checkConnection();
	}, []);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center min-h-screen bg-gray-50">
				<div className="flex flex-col items-center space-y-4">
					<div className="w-12 h-12 rounded-full border-b-2 border-blue-500 animate-spin"></div>
					<p className="text-sm text-gray-600">Loading application...</p>
				</div>
			</div>
		);
	}

	if (!isConnected) {
		return <DatabaseConnection onConnected={setIsConnected} />;
	}

	return (
		<Router>
			<div className="flex overflow-hidden h-screen bg-gray-50">
				{/* Sidebar */}
				<Sidebar />

				{/* Main Content */}
				<div className="overflow-auto flex-1">
					<div className="p-6 mx-auto max-w-7xl">
						<Routes>
							<Route path="/admin" element={<AdminForms />} />
							<Route path="/edit" element={<EditForms />} />
							<Route path="/views" element={<Views />} />
							<Route path="/analytics" element={<Analytics />} />
							<Route path="/settings" element={<Settings />} />
							<Route path="/tags" element={<TagManagement />} />
							<Route path="/categories" element={<CategoryManagement />} />
							<Route path="/" element={<Navigate to="/admin" replace />} />
						</Routes>
					</div>
				</div>
			</div>
		</Router>
	);
}

export default App;
