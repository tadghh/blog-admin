import React, { ReactNode } from "react";
import { ContentCard } from "../components";
import { TrendUpIcon, TrendDownIcon } from "../Icons";

interface StatsCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	icon?: ReactNode;
	color?: "blue" | "green" | "purple" | "yellow" | "red" | "gray";
	trend?: {
		value: number;
		isPositive: boolean;
		label: string;
	};
}

export const StatsCard: React.FC<StatsCardProps> = ({
	title,
	value,
	subtitle,
	icon,
	color = "blue",
	trend,
}) => {
	const getColorClasses = () => {
		switch (color) {
			case "blue":
				return {
					value: "text-blue-600",
					icon: "text-blue-500 bg-blue-100",
				};
			case "green":
				return {
					value: "text-green-600",
					icon: "text-green-500 bg-green-100",
				};
			case "purple":
				return {
					value: "text-purple-600",
					icon: "text-purple-500 bg-purple-100",
				};
			case "yellow":
				return {
					value: "text-yellow-600",
					icon: "text-yellow-500 bg-yellow-100",
				};
			case "red":
				return {
					value: "text-red-600",
					icon: "text-red-500 bg-red-100",
				};
			case "gray":
			default:
				return {
					value: "text-gray-600",
					icon: "text-gray-500 bg-gray-100",
				};
		}
	};

	const colorClasses = getColorClasses();

	const formatValue = (val: string | number) => {
		if (typeof val === "number") {
			return val.toLocaleString();
		}
		return val;
	};

	return (
		<ContentCard>
			<div className="p-6">
				<div className="flex items-center">
					{icon && (
						<div
							className={`flex items-center justify-center w-12 h-12 rounded-lg ${colorClasses.icon}`}>
							{icon}
						</div>
					)}
					<div className={icon ? "ml-4" : ""}>
						<div className={`text-3xl font-bold ${colorClasses.value}`}>
							{formatValue(value)}
						</div>
						<div className="mt-1 text-sm text-gray-600">{title}</div>
						{subtitle && (
							<div className="text-xs text-gray-500">{subtitle}</div>
						)}
						{trend && (
							<div className="flex items-center mt-2">
								{trend.isPositive ? (
									<TrendUpIcon className="mr-1 w-4 h-4 text-green-500" />
								) : (
									<TrendDownIcon className="mr-1 w-4 h-4 text-red-500" />
								)}
								<span
									className={`text-xs font-medium ${
										trend.isPositive ? "text-green-600" : "text-red-600"
									}`}>
									{Math.abs(trend.value)}% {trend.label}
								</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</ContentCard>
	);
};
