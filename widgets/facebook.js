/*
 * The Facebook widget.
 */
define(["jquery"], function($) {
	return {
		id: 31,
		size: 5,
		order: 7.9,
		name: "Facebook",
		nicename: "facebook",
		sizes: ["variable"],
		desc: "Embeds Facebook in a widget",
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