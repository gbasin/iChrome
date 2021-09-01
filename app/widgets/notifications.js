/*
 * Google+ Notifications
 */
define(["jquery", "lodash", "widgets/framefix"], function($, _, frameFix) {
	return {
		id: 37,
		sort: 470,
		size: 5,
		order: 14,
		unlisted: true,
		nicename: "notifications",
		sizes: ["variable"],
		settings: [
			{
				type: "number",
				nicename: "user",
				label: "i18n.settings.account",
				help: "i18n.settings.account_help",
				placeholder: "i18n.settings.account_placeholder"
			}
		],
		config: {
			user: 0,
			size: "variable"
		},
		render: function() {
			if (!frameFix(this.render, this, arguments)) {
				return;
			}

			if (!this.frameId) {
				this.frameId = _.uniqueId(this.nicename);
			}

			this.utils.render({
				config: encodeURIComponent(JSON.stringify({
					maxHeight: 385,
					user: this.config.user || 0
				}))
			});

			this.elm.addClass("tabbed").css("height", "326px");

			var frame = this.elm.find("iframe")[0];

			$(window).off("message." + this.frameId).on("message." + this.frameId, function(e) {
				if (e.originalEvent.data && e.originalEvent.source === frame.contentWindow) {
					var data = e.originalEvent.data;

					if (data && data.height && data.height <= 415) {
						this.elm.css("height", data.height + "px");
					}
				}
			}.bind(this));
		}
	};
});