import React, { ReactNode, useEffect } from "react";
import { CloseIcon } from "../Icons";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
	size?: "sm" | "md" | "lg" | "xl";
}

export const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	title,
	children,
	size = "md",
}) => {
	const sizeClasses = {
		sm: "max-w-sm",
		md: "max-w-md",
		lg: "max-w-lg",
		xl: "max-w-xl",
	};

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
			<div
				className={`p-6 mx-4 w-full bg-white rounded-lg shadow-xl ${sizeClasses[size]}`}>
				{/* Header */}
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-medium text-gray-900">{title}</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 focus:outline-none">
						<CloseIcon className="w-6 h-6" />
					</button>
				</div>

				{/* Content */}
				<div>{children}</div>
			</div>
		</div>
	);
};
