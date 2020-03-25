/**
 * This stores the storage defaults.  It's mainly used for comparisons, unextends and resetting ProductivityTab.
 */
define(["i18n/i18n"], function(Translate) {
	return {
		tabs: [{
			columns: [
				[
					{ 
						id: 54,
						size: "medium"
					},
					{ 
						id: 1,
						size: "variable"
					}, 
				], [
					{ 
						id: 38,
						size: "tiny"
					}, 
					{ 
						id: 38,
						size: "tiny",
						config: {
							color: "rgb(255, 255, 255)",
							title: "Leave a 5* Review? :)",
							link: "https://chrome.google.com/webstore/detail/ichrome-new-tab-ultimate/###productivitytab###/related?hl=en",
							image: "images/sitelink_logo.png"
						}
					}, 
					{ 
						id: 4,
						size: "variable"
					}
				], [
					{ 
						id: 13,
						size: "variable"
					},
					{ 
						id: 8,
						size: "variable",
						config: {
							feeds: [
								{
									url:  "https://lifehacker.com/rss",
									name: "Lifehacker"
								}
							]
						}
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
			openLinksInNewTab: true,

			links: [],
			ok: false,
			apps: true,
			plus: true,
			voice: true,
			gmail: true,
			toolbar: "button",
			captureFocus: true,
			searchInNewTab: false,
			searchEngine: "default",
			adPlacement: "footer_leaderboard",

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