/*
 * The Apps widget.
 */
define(["jquery", "lodash", "browser/api"], function($, _, Browser) {
	return {
		id: 11,
		size: 2,
		order: 25,
		nicename: "apps",
		sizes: ["variable"],
		environments: ["chrome"],
		permissions: ["management"],
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "i18n.settings.title",
				placeholder: "i18n.settings.title_placeholder"
			},
			{
				type: "select",
				nicename: "view",
				label: "i18n.settings.format",
				options: {
					tiles: "i18n.settings.format_options.tiles",
					list: "i18n.settings.format_options.list"
				}
			},
			{
				type: "radio",
				nicename: "show",
				label: "i18n.settings.display",
				options: {
					all: "i18n.settings.display_options.all",
					enabled: "i18n.settings.display_options.enabled"
				}
			},
			{
				type: "select",
				nicename: "sort",
				label: "i18n.settings.sort",
				options: {
					id: "i18n.settings.sort_options.id",
					alpha: "i18n.settings.sort_options.alphabetically",
					offline: "i18n.settings.sort_options.offline",
					available: "i18n.settings.sort_options.available"
				}
			},
			{
				type: "radio",
				nicename: "target",
				label: "i18n.settings.open",
				options: {
					_self: "i18n.settings.open_options.current",
					_blank: "i18n.settings.open_options.blank"
				}
			}
		],
		config: {
			title: "",
			sort: "id",
			show: "all",
			view: "list",
			target: "_self",
			size: "variable"
		},

		syncData: {},

		refresh: function() {
			this.render();
		},


		/**
		 * Gets, filters and sorts the listing of apps
		 *
		 * @api     private
		 * @param   {Function}  cb
		 */
		getApps: function(cb) {
			Browser.management.getAll(function(d) {
				var list = d.filter(function(e) {
						return e.type !== "extension" && e.type !== "theme";
					}),
					apps = [],
					all = this.config.show === "all";

				list.unshift({
					enabled: true,
					offlineEnabled: false,
					id: "ahfgeienlihckogmohjhadlkjgocpleb",
					shortName: this.utils.translate("store_app"),
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
						list.sort(function(a) {
							return a.offlineEnabled;
						});
					break;
					case "available":
						list.sort(function(a, b) {
							return ((!navigator.onLine && a.offlineEnabled) + a.enabled) - ((!navigator.onLine && b.offlineEnabled) + b.enabled);
						});
					break;
				}

				list.forEach(function(e) {
					if (e.id !== Browser.app.id && (all || e.enabled)) {
						apps.push({
							name: e.shortName,
							id: e.id,
							thumb: "chrome://extension-icon/" + e.id + "/64/1",
							available: (navigator.onLine && e.enabled) || (!navigator.onLine && e.offlineEnabled)
						});
					}
				});

				if (this.syncData && this.syncData.order) {
					// This creates an hash that can be used to look up the
					// _.sortBy compatible sort value of a given app id.
					//
					// This method with negative reversed indexes causes apps
					// that are sorted to stay in position while new apps get
					// appended to the end of the list in their original order.
					var order = this.syncData.order.slice().reverse();

					order = _.zipObject(order, order.map(function(e, i) {
						return -i;
					}));

					apps = _.sortBy(apps, function(e) {
						return order[e.id] || 1;
					});
				}

				cb.call(this, {
					items: apps
				});
			}.bind(this));
		},

		render: function(demo) {
			if (demo) {
				return this.utils.render({
					items: [
						{
							"name": this.utils.translate("store_app"),
							"id": "ahfgeienlihckogmohjhadlkjgocpleb",
							"thumb": "chrome://extension-icon/ahfgeienlihckogmohjhadlkjgocpleb/64/1",
							"available": true
						},
						{
							"name": "Google Drive",
							"id": "apdfllckaahabafndbhieahigkjlhalf",
							"thumb": "chrome://extension-icon/apdfllckaahabafndbhieahigkjlhalf/64/1",
							"available": true
						},
						{
							"name": "YouTube",
							"id": "blpcfgokakmgnkcojhhkbfbldkacnbeo",
							"thumb": "chrome://extension-icon/blpcfgokakmgnkcojhhkbfbldkacnbeo/64/1",
							"available": true
						},
						{
							"name": "Google Search",
							"id": "coobgpohoikkiipiblmjeljniedjpjpf",
							"thumb": "chrome://extension-icon/coobgpohoikkiipiblmjeljniedjpjpf/64/1",
							"available": true
						}
					]
				});
			}
			else if (!Browser.management.getAll) {
				return;
			}

			this.getApps(function(apps) {
				if (this.config.title && this.config.title !== "") {
					apps.title = this.config.title;
				}

				if (this.config.view === "tiles") {
					apps.tiles = true;
				}

				this.utils.render(apps);


				var that = this,
					self = this.config.target === "_self";

				this.sortable = this.elm.off("click.apps").on("click.apps", ".app", function(e) {
					e.preventDefault();

					var id = this.getAttribute("data-id");

					Browser.management.launchApp(id, function() {
						if (self) {
							Browser.tabs.getCurrent(function(d) {
								Browser.tabs.remove(d.id);
							});
						}
					});
				}).find(".list, .tiles").sortable({
					distance: 20,
					itemSelector: ".app",
					placeholder: "<div class=\"app holder\"/>",
					onDragStart: function(item) {
						var width = item.outerWidth(),
							height = item.outerHeight();

						item.css({
							width: width,
							height: height,
							transform: "translate(-" + width / 2 + "px, -" + height / 2 + "px)"
						});

						item.addClass("dragged");
					},
					onDrop: function(item, container, _super) {
						_super(item, container);

						that.syncData.order = that.sortable.sortable("serialize").get();

						that.utils.save();
					},
					serialize: function(item, children, isContainer) {
						if (isContainer) {
							return children;
						}
						else {
							return item.attr("data-id");
						}
					},
				});

				$(window).one("offline.apps online.apps", function() {
					this.render();
				}.bind(this));
			});
		}
	};
});