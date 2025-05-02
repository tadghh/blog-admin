import React, { ReactNode } from "react";
import { Tag } from "./interfaces";

interface ActionButtonProps {
	onClick: () => void;
	disabled?: boolean;
	variant: "primary" | "success" | "danger" | "warning";
	icon?: ReactNode;
	children: ReactNode;
	isLoading?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
	onClick,
	disabled = false,
	variant,
	icon,
	children,
	isLoading = false,
}) => {
	const getVariantClasses = () => {
		switch (variant) {
			case "primary":
				return "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";
			case "success":
				return "bg-green-600 hover:bg-green-700 focus:ring-green-500";
			case "warning":
				return "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500";
			case "danger":
				return "bg-red-600 hover:bg-red-700 focus:ring-red-500";
			default:
				return "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";
		}
	};

	return (
		<button
			onClick={onClick}
			disabled={disabled || isLoading}
			className={`inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${getVariantClasses()}`}>
			{isLoading ? (
				<svg
					className="w-4 h-4 mr-2 text-white animate-spin"
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
			) : (
				icon && <span className="mr-2">{icon}</span>
			)}
			{isLoading ? "Loading..." : children}
		</button>
	);
};

export const ContentCard: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	return (
		<div className="overflow-hidden bg-white rounded-lg shadow">
			<div className="p-6">{children}</div>
		</div>
	);
};

interface EmptyStateProps {
	searchQuery: string;
	entityName: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
	searchQuery,
	entityName,
}) => {
	return (
		<div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow">
			{searchQuery
				? `No ${entityName} match your search query`
				: `No ${entityName} found. Add some from the Create Content page.`}
		</div>
	);
};

// Form field component
interface FormFieldProps {
	label: string;
	isEditing: boolean;
	editComponent: ReactNode;
	displayComponent: ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
	label,
	isEditing,
	editComponent,
	displayComponent,
}) => {
	return (
		<div>
			<label className="block mb-1 text-xs font-medium text-gray-500">
				{label}
			</label>
			{isEditing ? editComponent : displayComponent}
		</div>
	);
};

// Tag display component
interface TagDisplayProps {
	tags: Tag[];
}

export const TagDisplay: React.FC<TagDisplayProps> = ({ tags }) => {
	return (
		<div className="flex flex-wrap gap-2">
			{tags.length > 0 ? (
				tags.map((tag) => (
					<span
						key={tag.id}
						className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
						{tag.name}
					</span>
				))
			) : (
				<span className="text-sm text-gray-500">No tags assigned</span>
			)}
		</div>
	);
};

// Toggle switch component
interface ToggleSwitchProps {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
	label,
	checked,
	onChange,
	disabled = false,
}) => {
	const handleToggle = () => {
		if (!disabled) {
			onChange(!checked);
		}
	};

	return (
		<div className="flex items-center justify-between">
			<label className="text-sm font-medium text-gray-700">{label}</label>
			{/* Make the entire toggle clickable */}
			<div
				className={`relative inline-flex items-center ${
					disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
				}`}
				onClick={handleToggle}>
				<input
					type="checkbox"
					className="sr-only"
					checked={checked}
					onChange={(e) => onChange(e.target.checked)}
					disabled={disabled}
				/>
				<div
					className={`w-10 h-5 transition rounded-full ${
						checked ? "bg-green-500" : "bg-gray-300"
					}`}></div>
				<div
					className={`absolute left-0.5 top-0.5 w-4 h-4 transition transform bg-white rounded-full ${
						checked ? "translate-x-5" : ""
					}`}></div>
			</div>
		</div>
	);
};

// Error message component
interface ErrorMessageProps {
	message: string;
	onDismiss: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
	message,
	onDismiss,
}) => {
	if (!message) return null;

	return (
		<div className="relative p-4 text-red-700 bg-red-100 rounded border border-red-400">
			<span>{message}</span>
			<button
				className="absolute top-3 right-3 text-red-700 hover:text-red-900"
				onClick={onDismiss}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="w-5 h-5"
					viewBox="0 0 20 20"
					fill="currentColor">
					<path
						fillRule="evenodd"
						d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
						clipRule="evenodd"
					/>
				</svg>
			</button>
		</div>
	);
};

// Search input component
interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
	value,
	onChange,
	placeholder = "Search...",
}) => {
	return (
		<div className="relative flex-1">
			<input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
			<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="w-4 h-4 text-gray-400"
					viewBox="0 0 20 20"
					fill="currentColor">
					<path
						fillRule="evenodd"
						d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
						clipRule="evenodd"
					/>
				</svg>
			</div>
		</div>
	);
};

// Tab component
interface TabProps {
	tabs: { id: string; label: string }[];
	activeTab: string;
	onTabChange: (tabId: string) => void;
}

export const Tabs: React.FC<TabProps> = ({ tabs, activeTab, onTabChange }) => {
	return (
		<div className="flex border-b">
			{tabs.map((tab) => (
				<button
					key={tab.id}
					className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-colors ${
						activeTab === tab.id
							? "text-blue-600 border-b-2 border-blue-500 bg-blue-50"
							: "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
					}`}
					onClick={() => onTabChange(tab.id)}>
					{tab.label}
				</button>
			))}
		</div>
	);
};

// Loading spinner
export const LoadingSpinner: React.FC<{ size?: string }> = ({
	size = "10",
}) => {
	return (
		<div className="flex justify-center items-center h-full">
			<div
				className={`w-${size} h-${size} rounded-full border-b-2 border-blue-500 animate-spin`}></div>
		</div>
	);
};

// Section divider with title
interface SectionDividerProps {
	title: string;
	children: ReactNode;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({
	title,
	children,
}) => {
	return (
		<div className="pt-4 mt-4 border-t border-gray-200">
			<h4 className="mb-2 text-sm font-medium text-gray-700">{title}</h4>
			{children}
		</div>
	);
};

// Icons
export const EditIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="w-4 h-4"
		viewBox="0 0 20 20"
		fill="currentColor">
		<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
	</svg>
);

export const SaveIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="w-4 h-4"
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
			clipRule="evenodd"
		/>
	</svg>
);

export const DeleteIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="w-4 h-4"
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
			clipRule="evenodd"
		/>
	</svg>
);

export const CancelIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="w-4 h-4"
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
			clipRule="evenodd"
		/>
	</svg>
);

export const ImageIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="w-8 h-8 text-gray-400"
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
			clipRule="evenodd"
		/>
	</svg>
);
