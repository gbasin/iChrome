/*
 * The Top Sites widget.
 */
define(["jquery"], function($) {
	return {
		id: 12,
		nicename: "topsites",
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "Widget Title",
				placeholder: "Enter a widget title or leave blank to hide"
			},
			{
				type: "number",
				nicename: "show",
				label: "Number of sites shown",
				min: 1,
				max: 20
			},
			{
				type: "radio",
				nicename: "target",
				label: "Open sites in",
				options: {
					_self: "The current tab",
					_blank: "A new tab"
				}
			}
		],
		config: {
			show: 5,
			target: "_self",
			size: "variable"
		},
		refresh: function() {
			this.render();
		},
		render: function() {
			var that = this;

			chrome.topSites.get(function(sites) {
				var sites = sites.slice(0, that.config.show),
					data = {
						title: that.config.title || false,
						newTab: that.config.target == "_blank",
						sites: sites
					};

				that.utils.render(data);
			});
		}
	};
});