/*
 * LinkedIn
 */
define(["jquery", "lodash", "browser/api", "widgets/framefix"], function($, _, Browser, frameFix) {
	var headersListenerSet = false;

	return {
		id: 43,
		size: 5,
		nicename: "linkedin",
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

			if (!headersListenerSet) {
				var tabId = frameFix.getTabId();

				Browser.webRequest.onBeforeSendHeaders.addListener(
					function(info) {
						var newHeaders = _.map(info.requestHeaders, function(e) {
							if (e.name.toLowerCase() === "user-agent") {
								return {
									name: "User-Agent",
									value: "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 " +
											"(KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36"
								};
							}

							return e;
						});

						return {
							requestHeaders: newHeaders
						};
					},
					{
						tabId: tabId,
						urls: [ "*://*.linkedin.com/*" ],
						types: [ "sub_frame" ]
					},
					["blocking", "requestHeaders"]
				);

				headersListenerSet = true;
			}

			this.utils.render({
				height: this.config.height || 500
			});

			this.elm.addClass("tabbed").css("height", this.config.height || 500);
		}
	};
});