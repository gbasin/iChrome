/*
 * The Google+ widget.
 */
define(["jquery"], function($) {
	return {
		id: 30,
		size: 5,
		order: 7.75,
		nicename: "plus",
		sizes: ["variable"],
		settings: [
			{
				type: "number",
				label: "i18n.settings.height",
				nicename: "height",
				min: 100,
				max: 800
			}
		],
		config: {
			height: 500,
			size: "variable"
		},
		render: function() {
			this.utils.render({
				height: this.config.height || 500
			});

			this.elm.addClass("tabbed");
		}
	};
});