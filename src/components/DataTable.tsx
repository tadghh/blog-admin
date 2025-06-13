import { ReactNode } from "react";
import { ContentCard } from "../components";
import { SortIcon, SortAscIcon, SortDescIcon } from "../Icons";

interface Column<T> {
	key: keyof T | string;
	header: string;
	render?: (item: T, index: number) => ReactNode;
	width?: string;
	align?: "left" | "center" | "right";
	sortable?: boolean;
}

interface DataTableProps<T> {
	data: T[];
	columns: Column<T>[];
	loading?: boolean;
	emptyMessage?: string;
	onSort?: (key: string, direction: "asc" | "desc") => void;
	sortKey?: string;
	sortDirection?: "asc" | "desc";
	className?: string;
}

export function DataTable<T extends Record<string, any>>({
	data,
	columns,
	loading = false,
	emptyMessage = "No data available",
	onSort,
	sortKey,
	sortDirection,
	className = "",
}: DataTableProps<T>) {
	const handleSort = (columnKey: string) => {
		if (!onSort) return;

		const newDirection =
			sortKey === columnKey && sortDirection === "asc" ? "desc" : "asc";
		onSort(columnKey, newDirection);
	};

	const getSortIcon = (columnKey: string) => {
		if (sortKey !== columnKey) {
			return <SortIcon />;
		}

		if (sortDirection === "asc") {
			return <SortAscIcon />;
		}

		return <SortDescIcon />;
	};

	const getAlignmentClass = (align?: "left" | "center" | "right") => {
		switch (align) {
			case "center":
				return "text-center";
			case "right":
				return "text-right";
			default:
				return "text-left";
		}
	};

	const getCellValue = (item: T, column: Column<T>, index: number) => {
		if (column.render) {
			return column.render(item, index);
		}

		const value = item[column.key as keyof T];
		if (value === null || value === undefined) {
			return "-";
		}

		return String(value);
	};

	if (loading) {
		return (
			<ContentCard>
				<div className="flex justify-center items-center p-8">
					<div className="w-8 h-8 rounded-full border-b-2 border-blue-500 animate-spin"></div>
				</div>
			</ContentCard>
		);
	}

	return (
		<ContentCard>
			<div className={`overflow-x-auto ${className}`}>
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							{columns.map((column, index) => (
								<th
									key={`${String(column.key)}-${index}`}
									className={`px-6 py-3 text-xs font-medium tracking-wider text-gray-500 uppercase ${getAlignmentClass(
										column.align
									)} ${column.width ? column.width : ""}`}
									style={column.width ? { width: column.width } : undefined}>
									{column.sortable ? (
										<button
											onClick={() => handleSort(String(column.key))}
											className="flex gap-1 items-center hover:text-gray-700 focus:outline-none">
											<span>{column.header}</span>
											{getSortIcon(String(column.key))}
										</button>
									) : (
										column.header
									)}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{data.length === 0 ? (
							<tr>
								<td
									colSpan={columns.length}
									className="px-6 py-8 text-center text-gray-500">
									{emptyMessage}
								</td>
							</tr>
						) : (
							data.map((item, rowIndex) => (
								<tr
									key={rowIndex}
									className="transition-colors hover:bg-gray-50">
									{columns.map((column, colIndex) => (
										<td
											key={`${String(column.key)}-${colIndex}`}
											className={`px-6 py-4 text-sm text-gray-900 ${getAlignmentClass(
												column.align
											)}`}>
											{getCellValue(item, column, rowIndex)}
										</td>
									))}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</ContentCard>
	);
}
