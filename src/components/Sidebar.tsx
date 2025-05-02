import { NavLink } from "react-router-dom";
import { useState } from "react";

// Icons
const AdminIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="w-5 h-5"
		viewBox="0 0 20 20"
		fill="currentColor">
		<path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
	</svg>
);

const EditIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="w-5 h-5"
		viewBox="0 0 20 20"
		fill="currentColor">
		<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
	</svg>
);

const SettingsIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="w-5 h-5"
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
			clipRule="evenodd"
		/>
	</svg>
);

const TagIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="w-5 h-5"
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
			clipRule="evenodd"
		/>
	</svg>
);

const CategoryIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="w-5 h-5"
		viewBox="0 0 20 20"
		fill="currentColor">
		<path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
	</svg>
);

const Sidebar = () => {
	const [collapsed, setCollapsed] = useState(false);

	const menuItems = [
		{ path: "/admin", name: "Create Content", icon: <AdminIcon /> },
		{ path: "/edit", name: "Edit Content", icon: <EditIcon /> },
		{ path: "/tags", name: "Tags", icon: <TagIcon /> },
		{ path: "/categories", name: "Categories", icon: <CategoryIcon /> },
		{ path: "/settings", name: "Settings", icon: <SettingsIcon /> },
	];

	return (
		<div
			className={`bg-white shadow-lg transition-all duration-100 ${
				collapsed ? "w-16" : "w-64"
			} h-screen`}>
			{/* Logo / App Title */}
			<div className="flex justify-between items-center p-4 border-b">
				{!collapsed && (
					<h1 className="text-xl font-bold text-gray-800 text-nowrap">
						Content Manager
					</h1>
				)}
				<button
					onClick={() => setCollapsed(!collapsed)}
					className="p-1 rounded-full hover:bg-gray-200 focus:outline-none">
					{collapsed ? (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="w-5 h-5"
							viewBox="0 0 20 20"
							fill="currentColor">
							<path
								fillRule="evenodd"
								d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
								clipRule="evenodd"
							/>
						</svg>
					) : (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="w-5 h-5"
							viewBox="0 0 20 20"
							fill="currentColor">
							<path
								fillRule="evenodd"
								d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
								clipRule="evenodd"
							/>
						</svg>
					)}
				</button>
			</div>

			{/* Navigation Menu */}
			<nav className="mt-6">
				<ul className="space-y-2">
					{menuItems.map((item) => (
						<li key={item.path}>
							<NavLink
								to={item.path}
								className={({ isActive }) =>
									`flex items-center px-4 py-3.5 text-gray-600 transition-colors duration-300 ${
										isActive
											? "bg-blue-50 text-blue-600 border-r-4 border-blue-500"
											: "hover:bg-gray-100"
									}`
								}>
								<span className="mr-3">{item.icon}</span>
								{!collapsed && (
									<span className="text-nowrap ">{item.name}</span>
								)}
							</NavLink>
						</li>
					))}
				</ul>
			</nav>
		</div>
	);
};

export default Sidebar;
