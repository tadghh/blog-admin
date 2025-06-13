import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "../Icons";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	showInfo?: boolean;
	totalItems?: number;
	itemsPerPage?: number;
	className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
	currentPage,
	totalPages,
	onPageChange,
	showInfo = true,
	totalItems = 0,
	itemsPerPage = 10,
	className = "",
}) => {
	if (totalPages <= 1) return null;

	const getVisiblePages = () => {
		const delta = 2;
		const range = [];
		const rangeWithDots = [];

		for (
			let i = Math.max(2, currentPage - delta);
			i <= Math.min(totalPages - 1, currentPage + delta);
			i++
		) {
			range.push(i);
		}

		if (currentPage - delta > 2) {
			rangeWithDots.push(1, "...");
		} else {
			rangeWithDots.push(1);
		}

		rangeWithDots.push(...range);

		if (currentPage + delta < totalPages - 1) {
			rangeWithDots.push("...", totalPages);
		} else {
			rangeWithDots.push(totalPages);
		}

		return rangeWithDots;
	};

	const visiblePages = getVisiblePages();

	const getItemsInfo = () => {
		const startItem = (currentPage - 1) * itemsPerPage + 1;
		const endItem = Math.min(currentPage * itemsPerPage, totalItems);
		return `Showing ${startItem}-${endItem} of ${totalItems} items`;
	};

	return (
		<div
			className={`flex flex-col gap-4 justify-between items-center sm:flex-row ${className}`}>
			{/* Items info */}
			{showInfo && totalItems > 0 && (
				<div className="text-sm text-gray-500">{getItemsInfo()}</div>
			)}

			{/* Pagination buttons */}
			<div className="flex items-center space-x-1">
				{/* Previous button */}
				<button
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
					<ChevronLeftIcon className="mr-1 w-4 h-4" />
					Previous
				</button>

				{/* Page numbers */}
				<div className="flex items-center space-x-1">
					{visiblePages.map((page, index) => {
						if (page === "...") {
							return (
								<span
									key={`dots-${index}`}
									className="px-3 py-2 text-sm text-gray-500">
									...
								</span>
							);
						}

						const pageNumber = page as number;
						const isActive = pageNumber === currentPage;

						return (
							<button
								key={pageNumber}
								onClick={() => onPageChange(pageNumber)}
								className={`px-3 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
									isActive
										? "text-white bg-blue-600 border border-blue-600"
										: "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
								}`}>
								{pageNumber}
							</button>
						);
					})}
				</div>

				{/* Next button */}
				<button
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
					Next
					<ChevronRightIcon className="ml-1 w-4 h-4" />
				</button>
			</div>
		</div>
	);
};
