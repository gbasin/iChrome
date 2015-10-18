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
							size: "tiny"
						}, {
							id: 14,
							size: "tiny"
						}, {
							id: 1,
							size: "medium"
						}
					], [
						{
							id: 35,
							size: "variable"
						}, {
							id: 17,
							size: "variable"
						}
					], [
						{
							id: 4,
							size: "large"
						}
					]
				],
				id: 1,
				name: Translate("defaults.tab")
			}
		],
		widgets: [9, 14, 1, 35, 17, 4], // These are the widget IDs from the default tab layout
		user: {
			fname: Translate("defaults.me"),
			image: "images/profile.png"
		},
		settings: {
			def: 1,
			links: [],
			ok: false,
			apps: true,
			plus: true,
			ltab: true,
			stab: false,
			voice: true,
			gmail: true,
			editing: true,
			wcolor: "#FFF",
			toolbar: "full",
			theme: "default",
			"custom-css": "",
			columns: "3-fixed",
			"search-url": "https://google.com/search?q=%s"
		},
		themes: [],
		cached: {},
		tab: {
			fixed: true,
			medley: false,
			theme: "default",
			name: Translate("defaults.tab")
		}
	};
});