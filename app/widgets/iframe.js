/*
 * The iFrame widget.
 */
define(["jquery"], function($) {
	return {
		id: 7,
		size: 4,
		order: 5,
		nicename: "iframe",
		sizes: ["variable"],
		settings: [
			{
				type: "text",
				nicename: "url",
				label: "i18n.settings.url",
				placeholder: "i18n.settings.url_placeholder"
			},
			{
				type: "number",
				label: "i18n.settings.height",
				nicename: "height",
				min: 100,
				max: 800
			},
			{
				type: "radio",
				nicename: "padding",
				label: "i18n.settings.padding",
				options: {
					"true": "i18n.settings.on",
					"false": "i18n.settings.off"
				}
			}
		],
		config: {
			height: 400,
			padding: "false",
			size: "variable",
			url: "http://mail.google.com/mail/mu/mp/?source=ig&mui=igh"
		},
		render: function() {
			this.utils.render({
				url: (this.config.url && this.config.url.parseUrl()) || "http://mail.google.com/mail/mu/mp/?source=ig&mui=igh",
				padding: (this.config.padding === "true"),
				height: this.config.height || 400
			});

			this.elm.addClass("tabbed").css("height", this.config.height || 400); // This prevents a weird 5px gap at the bottom of the widget
		}
	};
});