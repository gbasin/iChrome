/*
 * The Apps widget.
 */
define(["jquery"], function($) {
	return {
		id: 11,
		nicename: "apps",
		sizes: ["variable"],
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "Widget Title",
				placeholder: "Enter a widget title or leave blank to hide"
			},
			{
				type: "select",
				nicename: "view",
				label: "Widget Format",
				options: {
					tiles: "Tiles",
					list: "List"
				}
			},
			{
				type: "radio",
				nicename: "show",
				label: "Show",
				options: {
					all: "All apps",
					enabled: "Only enabled apps"
				}
			},
			{
				type: "select",
				nicename: "sort",
				label: "Sort",
				options: {
					id: "ID",
					alpha: "Alphabetically",
					offline: "Offline Enabled",
					available: "Availability"
				}
			},
			{
				type: "radio",
				nicename: "target",
				label: "Open apps in",
				options: {
					_self: "The current tab",
					_blank: "A new tab"
				}
			}
		],
		config: {
			title: "",
			sort: "id",
			show: "all",
			view: "list",
			target: "_blank",
			size: "variable"
		},
		refresh: function() {
			this.render();
		},
		render: function() {
			chrome.management.getAll(function(d) {
				var list = d.filter(function(e) {
						return e.type !== "extension" && e.type !== "theme";
					}),
					apps = {
						items: []
					},
					id = chrome.app.getDetails().id,
					self = this.config.target == "_self",
					all = this.config.show == "all";

				list.unshift({
					enabled: true,
					shortName: "Store",
					offlineEnabled: false,
					id: "ahfgeienlihckogmohjhadlkjgocpleb",
					appLaunchUrl: "https://chrome.google.com/webstore?utm_source=iChrome-apps-widget"
				});

				switch (this.config.sort) {
					case "alpha":
						list.sort(function(a, b) {
							var c = a.shortName.toLowerCase(),
								d = b.shortName.toLowerCase();

							return c < d ? -1 : c > d;
						});
					break;
					case "offline":
						list.sort(function(a, b) {
							return a.offlineEnabled;
						});
					break;
					case "available":
						list.sort(function(a, b) {
							return ((!navigator.onLine && a.offlineEnabled) + a.enabled) - ((!navigator.onLine && b.offlineEnabled) + b.enabled);
						});
					break;
				}

				list.forEach(function(e, i) {
					if (e.id !== id && (all || e.enabled)) {
						apps.items.push({
							name: e.shortName,
							id: e.id,
							thumb: "chrome://extension-icon/" + e.id + "/64/1",
							available: (navigator.onLine && e.enabled) || (!navigator.onLine && e.offlineEnabled)
						});
					}
				});

				if (this.config.title && this.config.title !== "") {
					apps.title = this.config.title;
				}

				if (this.config.view == "tiles") {
					apps.tiles = true;
				}

				this.utils.render(apps);

				this.elm.off("click").on("click", ".app", function(e) {
					e.preventDefault();

					var id = this.getAttribute("data-id");

					chrome.management.launchApp(id, function() {
						if (self) {
							chrome.tabs.getCurrent(function(d) {
								chrome.tabs.remove(d.id);
							});
						}
					});
				});

				$(window).one("offline.apps online.apps", function() {
					this.render();
				}.bind(this));
			}.bind(this));
		}
	};
});