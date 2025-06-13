import React from "react";

interface IconProps {
	className?: string;
	size?: number;
}
// Logout icon component
export const LogoutIcon = () => (
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
// Action Icons
export const EditIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 20 20"
		fill="currentColor">
		<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
	</svg>
);

export const SaveIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
			clipRule="evenodd"
		/>
	</svg>
);

export const DeleteIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
			clipRule="evenodd"
		/>
	</svg>
);

export const CancelIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
			clipRule="evenodd"
		/>
	</svg>
);

export const CloseIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
			clipRule="evenodd"
		/>
	</svg>
);

// Content Icons
export const ImageIcon: React.FC<IconProps> = ({
	className = "w-8 h-8 text-gray-400",
}) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
			clipRule="evenodd"
		/>
	</svg>
);

export const DocumentIcon: React.FC<IconProps> = ({
	className = "w-5 h-5",
}) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
			clipRule="evenodd"
		/>
	</svg>
);

export const FileIcon: React.FC<IconProps> = ({
	className = "w-10 h-10 text-gray-400",
}) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor">
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
		/>
	</svg>
);

// Navigation Icons
export const PlusIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
			clipRule="evenodd"
		/>
	</svg>
);

export const SearchIcon: React.FC<IconProps> = ({
	className = "w-4 h-4 text-gray-400",
}) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
			clipRule="evenodd"
		/>
	</svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({
	className = "w-4 h-4",
}) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
			clipRule="evenodd"
		/>
	</svg>
);

export const ChevronUpIcon: React.FC<IconProps> = ({
	className = "w-4 h-4",
}) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
			clipRule="evenodd"
		/>
	</svg>
);

export const ChevronLeftIcon: React.FC<IconProps> = ({
	className = "w-4 h-4",
}) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
			clipRule="evenodd"
		/>
	</svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({
	className = "w-4 h-4",
}) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
			clipRule="evenodd"
		/>
	</svg>
);

// Status & Feedback Icons
export const CheckIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
			clipRule="evenodd"
		/>
	</svg>
);

export const WarningIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
			clipRule="evenodd"
		/>
	</svg>
);

export const ErrorIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
			clipRule="evenodd"
		/>
	</svg>
);

export const InfoIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
			clipRule="evenodd"
		/>
	</svg>
);

export const SuccessIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
			clipRule="evenodd"
		/>
	</svg>
);

// Analytics & Data Icons
export const EyeIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 20 20"
		fill="currentColor">
		<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
		<path
			fillRule="evenodd"
			d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
			clipRule="evenodd"
		/>
	</svg>
);

export const UsersIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor">
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
		/>
	</svg>
);

export const ChartBarIcon: React.FC<IconProps> = ({
	className = "w-6 h-6",
}) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor">
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
		/>
	</svg>
);

export const DocumentTextIcon: React.FC<IconProps> = ({
	className = "w-6 h-6",
}) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor">
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
		/>
	</svg>
);

// System Icons
export const FolderIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
			clipRule="evenodd"
		/>
		<path d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z" />
	</svg>
);

export const SettingsIcon: React.FC<IconProps> = ({
	className = "w-5 h-5",
}) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
			clipRule="evenodd"
		/>
	</svg>
);

export const TagIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 20 20"
		fill="currentColor">
		<path
			fillRule="evenodd"
			d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100 2 1 1 0 000-2z"
			clipRule="evenodd"
		/>
	</svg>
);

export const CategoryIcon: React.FC<IconProps> = ({
	className = "w-5 h-5",
}) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 20 20"
		fill="currentColor">
		<path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
	</svg>
);

// Loading & Status
export const LoadingIcon: React.FC<IconProps> = ({
	className = "w-5 h-5 animate-spin",
}) => (
	<svg
		className={className}
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24">
		<circle
			className="opacity-25"
			cx="12"
			cy="12"
			r="10"
			stroke="currentColor"
			strokeWidth="4"
		/>
		<path
			className="opacity-75"
			fill="currentColor"
			d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
		/>
	</svg>
);

// Sorting Icons
export const SortIcon: React.FC<IconProps> = ({
	className = "w-4 h-4 text-gray-400",
}) => (
	<svg
		className={className}
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor">
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M8 9l4-4 4 4m0 6l-4 4-4-4"
		/>
	</svg>
);

export const SortAscIcon: React.FC<IconProps> = ({
	className = "w-4 h-4 text-blue-600",
}) => (
	<svg
		className={className}
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor">
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M5 15l7-7 7 7"
		/>
	</svg>
);

export const SortDescIcon: React.FC<IconProps> = ({
	className = "w-4 h-4 text-blue-600",
}) => (
	<svg
		className={className}
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor">
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M19 9l-7 7-7-7"
		/>
	</svg>
);

// Trend Icons
export const TrendUpIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
	<svg
		className={className}
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor">
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M5 10l7-7m0 0l7 7m-7-7v18"
		/>
	</svg>
);

export const TrendDownIcon: React.FC<IconProps> = ({
	className = "w-4 h-4 rotate-180",
}) => (
	<svg
		className={className}
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor">
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M5 10l7-7m0 0l7 7m-7-7v18"
		/>
	</svg>
);

// Application Logo
export const AppIcon: React.FC<IconProps> = ({
	className = "w-5 h-5 text-white",
}) => (
	<svg
		className={className}
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor">
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
		/>
	</svg>
);
