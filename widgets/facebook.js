/*
 * The Facebook widget.
 */
define(["jquery"], function($) {
	return {
		id: 31,
		nicename: "facebook",
		sizes: ["variable"],
		settings: [
			{
				type: "number",
				label: "Widget Height",
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