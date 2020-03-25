define(["lodash", "browser/api", "widgets/model"], function(_, Browser, WidgetModel) {
	return WidgetModel.extend({
		defaults: {
			config: {
				show: 5,
				size: "variable",
				title: "i18n.name"
			},
			data: {
				sites: [{
					title: "Google",
					url: "https://www.google.com/",
					favicon: "https://www.google.com/s2/favicons?domain=www.google.com&sz=32"
				}, {
					title: "Facebook",
					url: "https://www.facebook.com/",
					favicon: "https://www.google.com/s2/favicons?domain=www.facebook.com&sz=16"
				}, {
					title: "Youtube",
					url: "https://www.youtube.com/",
					favicon: "https://www.google.com/s2/favicons?domain=www.youtube.com&sz=32"
				}, {
					title: "Amazon",
					url: "https://www.amazon.com/",
					favicon: "https://www.google.com/s2/favicons?domain=www.amazon.com&sz=32"
				}, {
					title: "Wikipedia",
					url: "https://www.wikipedia.org/",
					favicon: "https://www.google.com/s2/favicons?domain=www.wikipedia.org&sz=32"
				}]
			}
		},

		initialize: function() {
			if (this.config && this.config.target) {
				delete this.config.target;
			}

			WidgetModel.prototype.initialize.call(this);
		},

		refresh: function() {
			Browser.topSites.get(function(sites) {
				this.saveData({
					sites: _.take(_.map(sites, function(e) {
						e.favicon = Browser.getFavicon(e.url);

						return e;
					}), this.config.show)
				});
			}.bind(this));
		}
	});
});