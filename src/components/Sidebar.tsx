import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getVersion } from "@tauri-apps/api/app";

interface SidebarItem {
	id: string;
	label: string;
	path?: string;
	icon: React.ReactNode;
	badge?: string;
	onClick?: () => void;
}

interface SidebarSection {
	title?: string;
	items: SidebarItem[];
}

interface SidebarProps {
	sections?: SidebarSection[];
	className?: string;
	onLogout?: () => void;
}

import {
	AppIcon,
	DocumentTextIcon,
	EditIcon,
	EyeIcon,
	ChartBarIcon,
	SettingsIcon,
	TagIcon,
	CategoryIcon,
} from "../Icons";

// Logout icon component
const LogoutIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="w-5 h-5"
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 01-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
			clipRule="evenodd"
		/>
	</svg>
);

export const Sidebar: React.FC<SidebarProps> = ({
	sections,
	className = "",
	onLogout,
}) => {
	const location = useLocation();
	const [version, setVersion] = useState<string>("v1.0.0");

	useEffect(() => {
		const fetchVersion = async () => {
			try {
				const appVersion = await getVersion();
				setVersion(`v${appVersion}`);
			} catch (error) {
				console.error("Failed to get app version:", error);
				// Keep the default version if fetching fails
			}
		};

		fetchVersion();
	}, []);

	const handleLogout = async () => {
		try {
			// Call the logout handler passed from parent (App component)
			// This will set isConnected to false and show the DatabaseConnection component
			if (onLogout) {
				onLogout();
			}
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	const defaultSections: SidebarSection[] = [
		{
			title: "Content Management",
			items: [
				{
					id: "create",
					label: "Create Content",
					path: "/admin",
					icon: <DocumentTextIcon />,
				},
				{
					id: "edit",
					label: "Edit Content",
					path: "/edit",
					icon: <EditIcon />,
				},
			],
		},
		{
			title: "Analytics & Views",
			items: [
				{
					id: "views",
					label: "Manage Views",
					path: "/views",
					icon: <EyeIcon />,
				},
				{
					id: "analytics",
					label: "Analytics",
					path: "/analytics",
					icon: <ChartBarIcon />,
				},
			],
		},
		{
			title: "Organization",
			items: [
				{
					id: "tags",
					label: "Tags",
					path: "/tags",
					icon: <TagIcon />,
				},
				{
					id: "categories",
					label: "Categories",
					path: "/categories",
					icon: <CategoryIcon />,
				},
			],
		},
		{
			title: "System",
			items: [
				{
					id: "settings",
					label: "Settings",
					path: "/settings",
					icon: <SettingsIcon />,
				},
				{
					id: "logout",
					label: "Logout",
					icon: <LogoutIcon />,
					onClick: handleLogout,
				},
			],
		},
	];

	const sectionsToRender = sections || defaultSections;

	const isActive = (path?: string) => {
		return path ? location.pathname === path : false;
	};

	const renderItem = (item: SidebarItem) => {
		if (item.onClick) {
			// Render as button for items with onClick handlers
			return (
				<button
					key={item.id}
					onClick={item.onClick}
					className={`flex items-center px-2 py-2 w-full text-sm font-medium text-left text-gray-600 rounded-md transition-colors hover:text-gray-900 hover:bg-gray-50`}>
					<span className="mr-3">{item.icon}</span>
					<span className="flex-1">{item.label}</span>
					{item.badge && (
						<span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
							{item.badge}
						</span>
					)}
				</button>
			);
		}

		// Render as Link for items with paths
		return (
			<Link
				key={item.id}
				to={item.path || "#"}
				className={`flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
					isActive(item.path)
						? "text-blue-700 bg-blue-100 border-r-2 border-blue-700"
						: "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
				}`}>
				<span className="mr-3">{item.icon}</span>
				<span className="flex-1">{item.label}</span>
				{item.badge && (
					<span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
						{item.badge}
					</span>
				)}
			</Link>
		);
	};

	return (
		<div
			className={`flex flex-col w-64 h-screen bg-white border-r border-gray-200 ${className}`}>
			{/* Header */}
			<div className="flex items-center px-6 py-4 border-b border-gray-200">
				<div className="flex items-center">
					<div className="flex justify-center items-center w-8 h-8 bg-blue-600 rounded-lg">
						<AppIcon />
					</div>
					<div className="ml-3">
						<h1 className="text-lg font-semibold text-gray-800">
							Content Manager
						</h1>
					</div>
				</div>
			</div>

			{/* Navigation */}
			<nav className="overflow-y-auto flex-1 px-4 py-4">
				<div className="space-y-6">
					{sectionsToRender.map((section, sectionIndex) => (
						<div key={sectionIndex}>
							{section.title && (
								<h3 className="px-2 mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
									{section.title}
								</h3>
							)}
							<div className="space-y-1">
								{section.items.map((item) => renderItem(item))}
							</div>
						</div>
					))}
				</div>
			</nav>

			{/* Footer */}
			<div className="px-4 py-4 border-t border-gray-200">
				<div className="flex items-center px-2 py-2 text-sm text-gray-500">
					<svg
						className="mr-2 w-4 h-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span>{version}</span>
				</div>
			</div>
		</div>
	);
};
