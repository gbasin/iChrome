define(["jquery", "lodash", "browser/api", "widgets/model"], function($, _, Browser, WidgetModel) {
	return WidgetModel.extend({
		defaults: {
			config: {
				tabs: 5,
				target: "_blank",
				size: "variable",
				title: "i18n.name"
			},
			data: {
				tabs: [{
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
			WidgetModel.prototype.initialize.call(this);

			if (!this.isPreview) {
				Browser.sessions.onChanged.addListener(_.ary(this.refresh.bind(this), 0));
			}
		},

		refresh: function() {
			Browser.sessions.getRecentlyClosed(function(sessions) {
				this.saveData({
					tabs: _(sessions).map(function(e) {
						var ret = {};

						if (e.tab) {
							ret.id = e.tab.sessionId;

							ret.url = e.tab.url;
							ret.title = e.tab.title;
						}
						else if (e.window && e.window.tabs.length) {
							ret.id = e.window.sessionId;

							ret.url = e.window.tabs[0].url;
							ret.title = e.window.tabs[0].title + (e.window.tabs.length > 1 ? ", " + (e.window.tabs.length - 1) + " " + this.translate("more") : "");
						}

						if (ret.id) {
							ret.favicon = Browser.getFavicon(ret.url);

							return ret;
						}
						else {
							return null;
						}
					}, this).compact().take(parseInt(this.config.tabs || 5)).value()
				});
			}.bind(this));
		}
	});
});