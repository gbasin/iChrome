/**
 * This stores the storage defaults.  It's mainly used for comparisons, unextends and resetting iChrome.
 */
define(["i18n/i18n"], function(Translate) {
	return {
		tabs: [{
			columns: [
				[
					{
						id: 1,
						size: "variable"
					}, {
						id: 9,
						size: "tiny"
					}, {
						id: 14,
						size: "tiny",
						config: {
							title: "Google, Inc."
						}
					}, {
						id: 17,
						size: "variable"
					}
				], [
					{
						id: 35,
						size: "variable"
					}, {
						id: 15,
						size: "variable"
					}
				], [
					{
						id: 4,
						size: "large"
					}, {
						id: 46,
						size: "medium"
					}
				]
			],
			id: 1,
			name: Translate("defaults.tab")
		}],

		user: {
			fname: Translate("defaults.me"),
			image: "images/profile.png"
		},

		// Settings. Check deprecate.js when adding or removing any settings
		settings: {
			openLinksInNewTab: false,

			links: [],
			ok: false,
			apps: true,
			plus: true,
			voice: true,
			gmail: true,
			toolbar: "full",
			searchInNewTab: false,
			searchURL: "https://google.com/search?q=%s",

			editing: true,
			customCSS: "",
			style: "light",
			theme: "default",

			columns: 3,
			defaultTab: 1,
			layout: "columns",
			columnWidth: "fixed"
		},
		themes: [],

		// Keep the default theme spec in sync with the background page's fallback
		cached: {
			0: {
				id: 0,
				type: "feed",
				offline: true,
				name: "Default theme",
				format: "{{res.url}}",
				image: "images/defaulttheme.jpg",
				url: "https://api.ichro.me/themes/v1/default/getImage"
			}
		},
		tab: {
			name: Translate("defaults.tab")
		}
	};
});