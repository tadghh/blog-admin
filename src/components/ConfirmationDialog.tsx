import React from "react";
import { Modal } from "./Modal";
import { ErrorIcon, WarningIcon, InfoIcon } from "../Icons";

interface ActionButtonProps {
	onClick: () => void;
	disabled?: boolean;
	variant: "primary" | "success" | "danger" | "warning";
	icon?: React.ReactNode;
	children: React.ReactNode;
	isLoading?: boolean;
}

// Local ActionButton component to avoid circular dependency
const ActionButton: React.FC<ActionButtonProps> = ({
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
					className="mr-2 w-4 h-4 text-white animate-spin"
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

interface ConfirmationDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	variant?: "danger" | "warning" | "primary";
	isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = "Confirm",
	cancelText = "Cancel",
	variant = "danger",
	isLoading = false,
}) => {
	const getIcon = () => {
		switch (variant) {
			case "danger":
				return (
					<div className="flex justify-center items-center mx-auto w-12 h-12 bg-red-100 rounded-full">
						<ErrorIcon className="w-6 h-6 text-red-600" />
					</div>
				);
			case "warning":
				return (
					<div className="flex justify-center items-center mx-auto w-12 h-12 bg-yellow-100 rounded-full">
						<WarningIcon className="w-6 h-6 text-yellow-600" />
					</div>
				);
			default:
				return (
					<div className="flex justify-center items-center mx-auto w-12 h-12 bg-blue-100 rounded-full">
						<InfoIcon className="w-6 h-6 text-blue-600" />
					</div>
				);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
			<div className="text-center">
				{/* Icon */}
				<div className="mb-4">{getIcon()}</div>

				{/* Message */}
				<p className="mb-6 text-sm text-gray-600">{message}</p>

				{/* Actions */}
				<div className="flex gap-3 justify-center">
					<ActionButton
						onClick={onClose}
						variant="primary"
						disabled={isLoading}>
						{cancelText}
					</ActionButton>
					<ActionButton
						onClick={onConfirm}
						variant={variant}
						isLoading={isLoading}
						disabled={isLoading}>
						{confirmText}
					</ActionButton>
				</div>
			</div>
		</Modal>
	);
};
