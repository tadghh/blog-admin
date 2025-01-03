import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import AdminForms from "./admin-forms";
import EditForms from "./edit-forms";
import "./app.css";
import Settings from "./settings";
import DatabaseConnection from "./bootup";
import { useState } from "react";
import TagManagement from "./tag-management";
import CategoryManagement from "./category-management";

function App() {
	const [isConnected, setIsConnected] = useState(false);
	if (!isConnected) {
		return <DatabaseConnection onConnected={setIsConnected} />;
	}

	return (
		<Router>
			<div className="min-h-screen bg-gray-50">
				{/* Navigation */}
				<nav className="bg-white shadow-sm">
					<div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
						<div className="flex justify-between h-16">
							<div className="flex space-x-8">
								<Link
									to="/admin"
									className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-500">
									Admin Forms
								</Link>
								<Link
									to="/edit"
									className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-500">
									Edit Content
								</Link>
								<Link
									to="/settings"
									className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-500">
									Settings
								</Link>
								<Link
									to="/tags"
									className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-500">
									Tags
								</Link>
								<Link
									to="/categories"
									className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-500">
									Categories
								</Link>
							</div>
						</div>
					</div>
				</nav>

				{/* Routes */}
				<div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
					<Routes>
						<Route path="/admin" element={<AdminForms />} />
						<Route path="/edit" element={<EditForms />} />
						<Route path="/" element={<AdminForms />} />
						<Route path="/settings" element={<Settings />} />
						<Route path="/tags" element={<TagManagement />} />
						<Route path="/categories" element={<CategoryManagement />} />
					</Routes>
				</div>
			</div>
		</Router>
	);
}

export default App;
