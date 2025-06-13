import React, { useEffect } from "react";
import {
	SuccessIcon,
	ErrorIcon,
	WarningIcon,
	InfoIcon,
	CloseIcon,
} from "../Icons";

interface NotificationProps {
	message: string;
	type: "success" | "error" | "warning" | "info";
	onDismiss: () => void;
	autoClose?: boolean;
	autoCloseDelay?: number;
}

export const Notification: React.FC<NotificationProps> = ({
	message,
	type,
	onDismiss,
	autoClose = true,
	autoCloseDelay = 5000,
}) => {
	useEffect(() => {
		if (autoClose && message) {
			const timer = setTimeout(() => {
				onDismiss();
			}, autoCloseDelay);
			return () => clearTimeout(timer);
		}
	}, [message, autoClose, autoCloseDelay, onDismiss]);

	if (!message) return null;

	const getStyles = () => {
		switch (type) {
			case "success":
				return {
					container: "text-green-700 bg-green-100 border-green-400",
					icon: "text-green-600",
				};
			case "error":
				return {
					container: "text-red-700 bg-red-100 border-red-400",
					icon: "text-red-600",
				};
			case "warning":
				return {
					container: "text-yellow-700 bg-yellow-100 border-yellow-400",
					icon: "text-yellow-600",
				};
			case "info":
				return {
					container: "text-blue-700 bg-blue-100 border-blue-400",
					icon: "text-blue-600",
				};
			default:
				return {
					container: "text-gray-700 bg-gray-100 border-gray-400",
					icon: "text-gray-600",
				};
		}
	};

	const getIcon = () => {
		const iconClass = `mr-3 w-5 h-5 ${getStyles().icon}`;

		switch (type) {
			case "success":
				return <SuccessIcon className={iconClass} />;
			case "error":
				return <ErrorIcon className={iconClass} />;
			case "warning":
				return <WarningIcon className={iconClass} />;
			case "info":
			default:
				return <InfoIcon className={iconClass} />;
		}
	};

	const styles = getStyles();

	return (
		<div
			className={`relative p-4 rounded border ${styles.container}`}
			role="alert">
			<div className="flex items-center">
				{getIcon()}
				<span className="flex-1">{message}</span>
			</div>
			<button
				className={`absolute top-3 right-3 hover:opacity-75 ${
					type === "success" ? "text-green-700" : ""
				}${type === "error" ? "text-red-700" : ""}${
					type === "warning" ? "text-yellow-700" : ""
				}${type === "info" ? "text-blue-700" : ""}`}
				onClick={onDismiss}
				aria-label="Dismiss notification">
				<CloseIcon className="w-5 h-5" />
			</button>
		</div>
	);
};
