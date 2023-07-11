/*
 * The Facebook widget.
 */
define(["jquery", "widgets/framefix"], function($, frameFix) {
	return {
		id: 31,
		sort: 240,
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
			if (!frameFix(this.render, this, arguments)) {
				return;
			}

			this.utils.render({
				height: this.config.height || 500
			});

			this.elm.addClass("tabbed");
		}
	};
});