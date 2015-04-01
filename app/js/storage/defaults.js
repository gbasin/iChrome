/**
 * This stores the storage defaults.  It's mainly used for comparisons, unextends and resetting iChrome.
 */
define(["i18n/i18n"], function(Translate) {
	return {
		tabs: [
			{
				columns: [
					[
						{
							id: 9,
							size: 1
						}, {
							id: 14,
							size: 1
						}, {
							id: 1,
							size: 3
						}
					], [
						{
							id: 35,
							size: 5
						},
						{
							id: 11,
							size: 5
						}, {
							id: 17,
							size: 5
						}
					], [
						{
							id: 4,
							size: 4
						}
					]
				],
				id: 1,
				name: Translate("defaults.tab")
			}
		],
		widgets: [9, 14, 1, 11, 17, 4], // These are the widget IDs from the default tab layout
		settings: {
			links: [],
			ok: false,
			apps: true,
			plus: true,
			ltab: false,
			stab: false,
			voice: true,
			gmail: true,
			editing: true,
			wcolor: "#FFF",
			toolbar: "full",
			animation: true,
			theme: "default",
			"custom-css": "",
			columns: "3-fixed",
			alignment: "center",
			name: Translate("defaults.me"),
			profile: "/images/profile.png",
			"logo-url": "/images/logo.svg",
			"search-url": "https://google.com/search?q=%s"
		},
		themes: [],
		cached: {},
		tab: {
			fixed: true,
			medley: false,
			theme: "default",
			alignment: "center",
			name: Translate("defaults.tab")
		}
	};
});