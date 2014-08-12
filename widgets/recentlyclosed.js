/*
 * The Recently Closed widget.
 */
define(["jquery"], function($) {
	return {
		id: 32,
		interval: 60000,
		permissions: ["tabs"],
		nicename: "recentlyclosed",
		sizes: ["variable"],
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "Widget Title",
				placeholder: "Enter a widget title or leave blank to hide"
			},
			{
				type: "number",
				label: "Tabs Shown",
				nicename: "tabs",
				min: 1,
				max: 20
			},
			{
				type: "radio",
				nicename: "target",
				label: "Open tabs in",
				options: {
					_self: "The current tab",
					_blank: "A new tab"
				}
			}
		],
		config: {
			tabs: 5,
			target: "_blank",
			size: "variable",
			title: "Recently Closed"
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