/*
 * The Facebook widget.
 */
define(["jquery"], function($) {
	return {
		id: 31,
		size: 5,
		order: 13,
		nicename: "facebook",
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