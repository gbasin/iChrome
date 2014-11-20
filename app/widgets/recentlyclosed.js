/*
 * The Recently Closed widget.
 */
define(["jquery"], function($) {
	return {
		id: 32,
		size: 4,
		order: 21,
		interval: 60000,
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
		render: function() {
			var data = {
				newTab: this.config.target == "_blank"
			};

			if (localStorage.recentlyClosed) {
				var tabs = JSON.parse(localStorage.recentlyClosed).slice(0, this.config.tabs || 5);

				data.tabs = [];

				tabs.forEach(function(e, i) {
					data.tabs.push({
						title: e[0],
						url: e[1]
					});
				});
			}

			if (this.config.title && this.config.title !== "") {
				data.title = this.config.title;
			}

			this.utils.render(data);
		}
	};
});