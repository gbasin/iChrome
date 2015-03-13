/*
 * The Keep widget.
 */
define(["jquery", "widgets/framefix"], function($, frameFix) {
	return {
		id: 23,
		size: 4,
		order: 16,
		nicename: "keep",
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
			height: 400,
			size: "variable"
		},
		render: function() {
			if (!frameFix(this.render, this, arguments)) return;
			
			this.utils.render({
				url: "https://keep.google.com/keep/u/0/",
				height: this.config.height || 400
			});

			this.elm.addClass("tabbed");
		}
	};
});