/*
 * The Gmail widget.
 */
define(["jquery"], function($) {
	return {
		id: 25,
		size: 4,
		order: 9,
		nicename: "gmail",
		sizes: ["variable"],
		settings: [
			{
				type: "text",
				nicename: "user",
				label: "i18n.settings.account",
				help: "i18n.settings.account_help",
				placeholder: "i18n.settings.account_placeholder"
			},
			{
				type: "number",
				label: "i18n.settings.height",
				nicename: "height",
				min: 100,
				max: 800
			}
		],
		config: {
			user: "0",
			height: 400,
			size: "variable"
		},
		render: function() {
			this.utils.render({
				user: this.config.user || 0,
				height: this.config.height || 400
			});

			this.elm.addClass("tabbed");
		}
	};
});