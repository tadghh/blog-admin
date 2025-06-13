import React from "react";

interface CountryFlagProps {
	country: string;
	size?: "sm" | "md" | "lg";
}

const flagMap: Record<string, string> = {
	"United States": "🇺🇸",
	Canada: "🇨🇦",
	"United Kingdom": "🇬🇧",
	Germany: "🇩🇪",
	France: "🇫🇷",
	Ireland: "🇮🇪",
	Netherlands: "🇳🇱",
	Spain: "🇪🇸",
	Italy: "🇮🇹",
	Poland: "🇵🇱",
	Sweden: "🇸🇪",
	Belgium: "🇧🇪",
	Austria: "🇦🇹",
	China: "🇨🇳",
	Japan: "🇯🇵",
	Russia: "🇷🇺",
	Brazil: "🇧🇷",
	Australia: "🇦🇺",
	Singapore: "🇸🇬",
	"South Africa": "🇿🇦",
	India: "🇮🇳",
	Mexico: "🇲🇽",
	"South Korea": "🇰🇷",
	Norway: "🇳🇴",
	Denmark: "🇩🇰",
	Finland: "🇫🇮",
	Switzerland: "🇨🇭",
	Portugal: "🇵🇹",
	Greece: "🇬🇷",
	Turkey: "🇹🇷",
	Argentina: "🇦🇷",
	Chile: "🇨🇱",
	Peru: "🇵🇪",
	Colombia: "🇨🇴",
	Venezuela: "🇻🇪",
	Ecuador: "🇪🇨",
	Uruguay: "🇺🇾",
	Paraguay: "🇵🇾",
	Bolivia: "🇧🇴",
	"Czech Republic": "🇨🇿",
	Slovakia: "🇸🇰",
	Hungary: "🇭🇺",
	Romania: "🇷🇴",
	Bulgaria: "🇧🇬",
	Croatia: "🇭🇷",
	Slovenia: "🇸🇮",
	Serbia: "🇷🇸",
	"Bosnia and Herzegovina": "🇧🇦",
	Montenegro: "🇲🇪",
	"North Macedonia": "🇲🇰",
	Albania: "🇦🇱",
	Ukraine: "🇺🇦",
	Belarus: "🇧🇾",
	Lithuania: "🇱🇹",
	Latvia: "🇱🇻",
	Estonia: "🇪🇪",
	Iceland: "🇮🇸",
	Luxembourg: "🇱🇺",
	Malta: "🇲🇹",
	Cyprus: "🇨🇾",
	Thailand: "🇹🇭",
	Vietnam: "🇻🇳",
	Malaysia: "🇲🇾",
	Indonesia: "🇮🇩",
	Philippines: "🇵🇭",
	"New Zealand": "🇳🇿",
	Israel: "🇮🇱",
	"Saudi Arabia": "🇸🇦",
	"United Arab Emirates": "🇦🇪",
	Egypt: "🇪🇬",
	Morocco: "🇲🇦",
	Nigeria: "🇳🇬",
	Kenya: "🇰🇪",
	Ghana: "🇬🇭",
	"Costa Rica": "🇨🇷",
	Panama: "🇵🇦",
	"Dominican Republic": "🇩🇴",
	"Puerto Rico": "🇵🇷",
	Jamaica: "🇯🇲",
	"Trinidad and Tobago": "🇹🇹",
	Barbados: "🇧🇧",
	Local: "🏠",
	"Private Network": "🏠",
	Unknown: "❓",
	Europe: "🇪🇺",
};

export const CountryFlag: React.FC<CountryFlagProps> = ({
	country,
	size = "md",
}) => {
	const getSizeClass = () => {
		switch (size) {
			case "sm":
				return "text-base";
			case "lg":
				return "text-3xl";
			case "md":
			default:
				return "text-2xl";
		}
	};

	const getFlag = (countryName: string) => {
		// Handle IPv6 countries
		if (countryName.includes("(IPv6)")) {
			const baseCountry = countryName.replace(" (IPv6)", "");
			return flagMap[baseCountry] || "🌐";
		}

		return flagMap[countryName] || "🌍";
	};

	return (
		<span className={getSizeClass()} role="img" aria-label={`${country} flag`}>
			{getFlag(country)}
		</span>
	);
};
