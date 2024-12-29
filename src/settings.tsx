// settings.tsx
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

import { open } from "@tauri-apps/plugin-dialog";

interface Settings {
	blog_images_path: string | null;
	blog_folder_path: string | null;
}

export default function Settings() {
	const [settings, setSettings] = useState<Settings>({
		blog_images_path: "",
		blog_folder_path: "",
	});

	useEffect(() => {
		loadSettings();
	}, []);

	const loadSettings = async () => {
		const saved = await invoke<Settings>("load_settings");
		console.log("Settings:", saved);
		setSettings(saved);
	};
	const selectImagePath = (data: string) => {
		invoke("save_settings", {
			settings: { blog_images_path: data },
		});
		setSettings((settings) => ({
			...settings,
			blog_images_path: data,
		}));
	};
	const selectBlogPath = (data: string) => {
		invoke("save_settings", {
			settings: { blog_folder_path: data },
		});
		setSettings((settings) => ({
			...settings,
			blog_folder_path: data,
		}));
	};

	return (
		<div className="p-6">
			<h2 className="mb-4 text-2xl font-bold">Settings</h2>
			<div className="space-y-4">
				<div>
					<label className="block mb-2 text-sm font-medium">
						Blog Images Directory
					</label>
					<div className="flex gap-2">
						<input
							type="text"
							value={settings.blog_images_path || ""}
							readOnly
							className="flex-1 p-2 rounded border"
						/>
						<button
							onClick={async () => {
								open({
									directory: true,
									multiple: false,
								}).then((data) => {
									if (data) {
										selectImagePath(data);
									}
								});
							}}
							className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
							Select Directory
						</button>
					</div>
				</div>
				<div>
					<label className="block mb-2 text-sm font-medium">
						Blog Directory
					</label>
					<div className="flex gap-2">
						<input
							type="text"
							value={settings.blog_folder_path || ""}
							readOnly
							className="flex-1 p-2 rounded border"
						/>
						<button
							onClick={async () => {
								open({
									directory: true,
									multiple: false,
								}).then((data) => {
									if (data) {
										selectBlogPath(data);
									}
								});
							}}
							className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
							Select Directory
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
