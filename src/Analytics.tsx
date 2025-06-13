import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	BarChart,
	Bar,
} from "recharts";
import { ContentCard, LoadingSpinner } from "./components";
import { StatsCard, CountryFlag, Notification } from "./components/index";
import { EyeIcon, UsersIcon, DocumentTextIcon, LoadingIcon } from "./Icons";

interface DailyViews {
	date: string;
	views: number;
	unique_views: number;
}

interface CountryViewCount {
	country: string;
	view_count: number;
	percentage: number;
}

interface BlogPostAnalytics {
	id: number;
	title: string;
	total_views: number;
	unique_ips: number;
	country_breakdown: CountryViewCount[];
	daily_views: DailyViews[];
}

interface ViewAnalytics {
	total_views: number;
	total_unique_ips: number;
	total_blog_posts: number;
	country_breakdown: CountryViewCount[];
	blog_post_analytics: BlogPostAnalytics[];
	daily_views: DailyViews[];
}

const Analytics = () => {
	const [analytics, setAnalytics] = useState<ViewAnalytics | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [activeTab, setActiveTab] = useState("overview");
	const [selectedDuration, setSelectedDuration] = useState(30);

	const durationOptions = [
		{ value: 7, label: "Last 7 days" },
		{ value: 14, label: "Last 14 days" },
		{ value: 30, label: "Last 30 days" },
		{ value: 60, label: "Last 60 days" },
		{ value: 90, label: "Last 3 months" },
		{ value: 180, label: "Last 6 months" },
		{ value: 365, label: "Last year" },
		{ value: 0, label: "All time" },
	];

	useEffect(() => {
		fetchAnalytics();
	}, [selectedDuration]);

	const fetchAnalytics = async () => {
		setLoading(true);
		try {
			const data = await invoke<ViewAnalytics>("get_view_analytics", {
				days: selectedDuration,
			});
			setAnalytics(data);
		} catch (err) {
			setError(`Failed to fetch analytics: ${err}`);
		} finally {
			setLoading(false);
		}
	};

	const formatPercentage = (percentage: number) => {
		return percentage < 0.1 ? "<0.1%" : `${percentage.toFixed(1)}%`;
	};

	if (loading) {
		return <LoadingSpinner />;
	}

	if (!analytics) {
		return (
			<div className="p-8 text-center text-gray-500">
				No analytics data available
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 justify-between items-start sm:flex-row sm:items-center">
				<h1 className="text-2xl font-bold text-gray-800">View Analytics</h1>

				<div className="flex flex-col gap-3 sm:flex-row">
					{/* Duration Selector */}
					<div className="flex gap-2 items-center">
						<label
							htmlFor="duration"
							className="text-sm font-medium text-gray-700">
							Time Period:
						</label>
						<select
							id="duration"
							value={selectedDuration}
							onChange={(e) => setSelectedDuration(Number(e.target.value))}
							className="px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
							{durationOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</div>

					{/* Refresh Button */}
					<button
						onClick={fetchAnalytics}
						disabled={loading}
						className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
						{loading ? (
							<div className="flex gap-2 items-center">
								<LoadingIcon className="w-4 h-4" />
								Loading...
							</div>
						) : (
							"Refresh Data"
						)}
					</button>
				</div>
			</div>

			{/* Error Display */}
			<Notification
				message={error}
				type="error"
				onDismiss={() => setError("")}
			/>

			{/* Overview Stats */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
				<StatsCard
					title="Total Views"
					value={analytics.total_views}
					color="blue"
					icon={<EyeIcon className="w-6 h-6" />}
				/>

				<StatsCard
					title="Unique Visitors"
					value={analytics.total_unique_ips}
					color="green"
					icon={<UsersIcon className="w-6 h-6" />}
				/>

				<StatsCard
					title="Blog Posts with Views"
					value={analytics.total_blog_posts}
					color="purple"
					icon={<DocumentTextIcon className="w-6 h-6" />}
				/>
			</div>

			{/* Tab Navigation */}
			<div className="flex bg-white rounded-lg border-b border-gray-200 shadow-sm">
				{[
					{ id: "overview", label: "Country Overview" },
					{ id: "timeline", label: "Views Timeline" },
					{ id: "posts", label: "By Blog Post" },
				].map((tab) => (
					<button
						key={tab.id}
						className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-colors ${
							activeTab === tab.id
								? "text-blue-600 border-b-2 border-blue-500 bg-blue-50"
								: "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
						}`}
						onClick={() => setActiveTab(tab.id)}>
						{tab.label}
					</button>
				))}
			</div>

			{/* Country Overview Tab */}
			{activeTab === "overview" && (
				<ContentCard>
					<div className="p-6">
						<h3 className="mb-4 text-lg font-medium text-gray-900">
							Views by Country
						</h3>

						{analytics.country_breakdown.length === 0 ? (
							<div className="py-8 text-center text-gray-500">
								No country data available
							</div>
						) : (
							<div className="space-y-3">
								{analytics.country_breakdown.map((country, index) => (
									<div
										key={country.country}
										className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
										<div className="flex gap-3 items-center">
											<CountryFlag country={country.country} size="md" />
											<div>
												<div className="font-medium text-gray-900">
													{country.country}
												</div>
												<div className="text-sm text-gray-500">
													Rank #{index + 1}
												</div>
											</div>
										</div>
										<div className="text-right">
											<div className="font-semibold text-gray-900">
												{country.view_count.toLocaleString()}
											</div>
											<div className="text-sm text-gray-500">
												{formatPercentage(country.percentage)}
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</ContentCard>
			)}

			{/* Views Timeline Tab */}
			{activeTab === "timeline" && (
				<div className="space-y-6">
					{/* Overall Timeline */}
					<ContentCard>
						<div className="p-6">
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-lg font-medium text-gray-900">
									Daily Views Timeline
								</h3>
								<div className="text-sm text-gray-500">
									{selectedDuration === 0
										? "All time"
										: `Last ${selectedDuration} days`}
								</div>
							</div>

							{!analytics.daily_views || analytics.daily_views.length === 0 ? (
								<div className="py-8 text-center text-gray-500">
									<p>No timeline data available</p>
									<p className="mt-2 text-xs">
										{selectedDuration === 0
											? "No views found in the database"
											: `No views found in the last ${selectedDuration} days`}
									</p>
								</div>
							) : (
								<div className="h-80">
									<ResponsiveContainer width="100%" height="100%">
										<LineChart
											data={analytics.daily_views.slice().reverse()}
											margin={{
												top: 5,
												right: 30,
												left: 20,
												bottom: 5,
											}}>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis
												dataKey="date"
												tick={{ fontSize: 12 }}
												angle={-45}
												textAnchor="end"
												height={60}
											/>
											<YAxis />
											<Tooltip
												labelFormatter={(label) => `Date: ${label}`}
												formatter={(value, name) => [
													value,
													name === "views" ? "Total Views" : "Unique Views",
												]}
											/>
											<Legend />
											<Line
												type="monotone"
												dataKey="views"
												stroke="#3B82F6"
												strokeWidth={2}
												name="Total Views"
												dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
												activeDot={{ r: 6 }}
											/>
											<Line
												type="monotone"
												dataKey="unique_views"
												stroke="#10B981"
												strokeWidth={2}
												name="Unique Views"
												dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
												activeDot={{ r: 6 }}
											/>
										</LineChart>
									</ResponsiveContainer>
								</div>
							)}
						</div>
					</ContentCard>

					{/* Individual Blog Post Charts */}
					<div className="space-y-6">
						<div className="flex justify-between items-center">
							<h3 className="text-lg font-medium text-gray-900">
								Views by Blog Post
							</h3>
							<div className="text-sm text-gray-500">
								{selectedDuration === 0
									? "All time data"
									: `${selectedDuration} day period`}
							</div>
						</div>

						{analytics.blog_post_analytics.length === 0 ? (
							<ContentCard>
								<div className="p-8 text-center text-gray-500">
									No blog post timeline data available
								</div>
							</ContentCard>
						) : (
							analytics.blog_post_analytics.map((post) => (
								<ContentCard key={post.id}>
									<div className="p-6">
										<div className="flex justify-between items-center mb-4">
											<h4 className="font-medium text-gray-900 text-md">
												{post.title}
											</h4>
											<div className="text-right">
												<div className="text-lg font-bold text-blue-600">
													{post.total_views.toLocaleString()}
												</div>
												<div className="text-xs text-gray-500">total views</div>
											</div>
										</div>

										{!post.daily_views || post.daily_views.length === 0 ? (
											<div className="py-4 text-center text-gray-500">
												No daily data available for this post
											</div>
										) : (
											<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
												{/* Line Chart */}
												<div>
													<h5 className="mb-2 text-sm font-medium text-gray-700">
														Daily Trend
													</h5>
													<div className="h-64">
														<ResponsiveContainer width="100%" height="100%">
															<LineChart
																data={post.daily_views.slice().reverse()}
																margin={{
																	top: 5,
																	right: 30,
																	left: 20,
																	bottom: 5,
																}}>
																<CartesianGrid strokeDasharray="3 3" />
																<XAxis
																	dataKey="date"
																	tick={{ fontSize: 10 }}
																	angle={-45}
																	textAnchor="end"
																	height={50}
																/>
																<YAxis tick={{ fontSize: 10 }} />
																<Tooltip
																	labelFormatter={(label) => `Date: ${label}`}
																	formatter={(value, name) => [
																		value,
																		name === "views" ? "Views" : "Unique",
																	]}
																/>
																<Line
																	type="monotone"
																	dataKey="views"
																	stroke="#3B82F6"
																	strokeWidth={2}
																	name="Views"
																	dot={{
																		fill: "#3B82F6",
																		strokeWidth: 1,
																		r: 3,
																	}}
																/>
																<Line
																	type="monotone"
																	dataKey="unique_views"
																	stroke="#10B981"
																	strokeWidth={2}
																	name="Unique"
																	dot={{
																		fill: "#10B981",
																		strokeWidth: 1,
																		r: 3,
																	}}
																/>
															</LineChart>
														</ResponsiveContainer>
													</div>
												</div>

												{/* Bar Chart */}
												<div>
													<h5 className="mb-2 text-sm font-medium text-gray-700">
														Daily Breakdown
													</h5>
													<div className="h-64">
														<ResponsiveContainer width="100%" height="100%">
															<BarChart
																data={post.daily_views.slice().reverse()}
																margin={{
																	top: 5,
																	right: 30,
																	left: 20,
																	bottom: 5,
																}}>
																<CartesianGrid strokeDasharray="3 3" />
																<XAxis
																	dataKey="date"
																	tick={{ fontSize: 10 }}
																	angle={-45}
																	textAnchor="end"
																	height={50}
																/>
																<YAxis tick={{ fontSize: 10 }} />
																<Tooltip
																	labelFormatter={(label) => `Date: ${label}`}
																	formatter={(value, name) => [
																		value,
																		name === "views" ? "Views" : "Unique",
																	]}
																/>
																<Bar
																	dataKey="views"
																	fill="#3B82F6"
																	name="Views"
																	radius={[2, 2, 0, 0]}
																/>
																<Bar
																	dataKey="unique_views"
																	fill="#10B981"
																	name="Unique"
																	radius={[2, 2, 0, 0]}
																/>
															</BarChart>
														</ResponsiveContainer>
													</div>
												</div>
											</div>
										)}
									</div>
								</ContentCard>
							))
						)}
					</div>
				</div>
			)}

			{/* Blog Posts Tab */}
			{activeTab === "posts" && (
				<div className="space-y-6">
					{analytics.blog_post_analytics.length === 0 ? (
						<ContentCard>
							<div className="p-8 text-center text-gray-500">
								No blog post analytics available
							</div>
						</ContentCard>
					) : (
						analytics.blog_post_analytics.map((post) => (
							<ContentCard key={post.id}>
								<div className="p-6">
									<div className="flex justify-between items-center mb-4">
										<h3 className="text-lg font-medium text-gray-900">
											{post.title}
										</h3>
										<div className="text-right">
											<div className="text-2xl font-bold text-blue-600">
												{post.total_views.toLocaleString()}
											</div>
											<div className="text-sm text-gray-500">views</div>
										</div>
									</div>

									<div className="mt-4">
										<h4 className="mb-3 font-medium text-gray-700 text-md">
											Views by Country
										</h4>

										{post.country_breakdown.length === 0 ? (
											<div className="text-sm text-gray-500">
												No country data available
											</div>
										) : (
											<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
												{post.country_breakdown.map((country) => (
													<div
														key={country.country}
														className="flex justify-between items-center p-2 bg-gray-50 rounded">
														<div className="flex gap-2 items-center">
															<CountryFlag
																country={country.country}
																size="sm"
															/>
															<span className="text-sm font-medium">
																{country.country}
															</span>
														</div>
														<div className="text-right">
															<div className="text-sm font-semibold">
																{country.view_count}
															</div>
															<div className="text-xs text-gray-500">
																{formatPercentage(country.percentage)}
															</div>
														</div>
													</div>
												))}
											</div>
										)}
									</div>
								</div>
							</ContentCard>
						))
					)}
				</div>
			)}
		</div>
	);
};

export default Analytics;
