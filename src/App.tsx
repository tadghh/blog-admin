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
import Sidebar from "./components/Sidebar";
import "./app.css";

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
				<div className="w-12 h-12 rounded-full border-b-2 border-blue-500 animate-spin"></div>
			</div>
		);
	}

	if (!isConnected) {
		return <DatabaseConnection onConnected={setIsConnected} />;
	}

	return (
		<Router>
			<div className="flex h-screen bg-gray-50 overflow-hidden">
				{/* Sidebar */}
				<Sidebar />

				{/* Main Content */}
				<div className="flex-1 overflow-auto">
					<div className="p-6 mx-auto max-w-7xl">
						<Routes>
							<Route path="/admin" element={<AdminForms />} />
							<Route path="/edit" element={<EditForms />} />
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
