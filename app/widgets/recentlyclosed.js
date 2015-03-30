/*
 * The Recently Closed widget.
 */
define(["jquery", "lodash"], function($, _) {
	return {
		id: 32,
		size: 4,
		order: 21,
		permissions: ["tabs"],
		nicename: "recentlyclosed",
		sizes: ["variable"],
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "i18n.settings.title",
				placeholder: "i18n.settings.title_placeholder"
			},
			{
				type: "number",
				label: "i18n.settings.tabs",
				nicename: "tabs",
				min: 1,
				max: 20
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
			tabs: 5,
			target: "_blank",
			size: "variable",
			title: "i18n.name"
		},
		render: function(demo) {
			if (!this.listening && !demo) {
				this.listening = true;

				chrome.sessions.onChanged.addListener(function() {
					this.render();
				}.bind(this));
			}

			var data = {};

			if (this.config.title) {
				data.title = this.config.title;
			}

			if (demo) {
				data.tabs = [
					{
						title: "Google",
						url: "http://www.google.com/"
					},
					{
						title: "Facebook",
						url: "http://www.facebook.com/"
					},
					{
						title: "Youtube",
						url: "http://www.youtube.com/"
					},
					{
						title: "Amazon",
						url: "http://www.amazon.com/"
					},
					{
						title: "Wikipedia",
						url: "http://www.wikipedia.org/"
					}
				];

				return this.utils.render(data);
			}

			chrome.sessions.getRecentlyClosed({
				maxResults: parseInt(this.config.tabs || 5)
			}, function(sessions) {
				data.tabs = _.compact(sessions.map(function(e, i) {
					var ret = {};

					if (e.tab) {
						ret.id = e.tab.sessionId;

						ret.url = e.tab.url;
						ret.title = e.tab.title;
					}
					else if (e.window && e.window.tabs.length) {
						ret.id = e.window.sessionId;

						ret.url = e.window.tabs[0].url;
						ret.title = e.window.tabs[0].title + (e.window.tabs.length > 1 ? ", " + (e.window.tabs.length - 1) + " more" : "");
					}

					if (ret.id) {
						return ret;
					}
					else {
						return null;
					}
				}));

				this.utils.render(data);
			}.bind(this));


			var target = this.config.target;

			this.elm.off("click.recentlyclosed").on("click.recentlyclosed", "a.item", function(e) {
				e.preventDefault();

				chrome.sessions.restore(this.getAttribute("data-id"), function(session) {
					if (target == "_self") {
						chrome.tabs.getCurrent(function(tab) {
							if (tab) chrome.tabs.remove(tab.id);
						});
					}
				});
			});
		}
	};
});