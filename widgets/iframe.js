/*
 * The iFrame widget.
 */
define(["jquery"], function($) {
	return {
		id: 7,
		nicename: "iframe",
		sizes: ["variable"],
		settings: [
			{
				type: "text",
				nicename: "url",
				label: "Frame URL",
				placeholder: "http://www.google.com/"
			},
			{
				type: "number",
				label: "Frame Height",
				nicename: "height",
				min: 100,
				max: 800
			},
			{
				type: "radio",
				nicename: "padding",
				label: "Padding",
				options: {
					"true": "On",
					"false": "Off"
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