/*
 * HTML
 */
define(function() {
	return {
		id: 36,
		size: 4,
		order: 4,
		nicename: "html",
		sizes: ["variable"],
		settings: [
			{
				type: "textarea",
				nicename: "html",
				label: "i18n.settings.html",
				placeholder: "i18n.settings.html_placeholder"
			},
			{
				type: "textarea",
				nicename: "js",
				label: "i18n.settings.js"
			},
			{
				type: "number",
				label: "i18n.settings.height",
				nicename: "height",
				min: 100,
				max: 800
			},
			{
				type: "number",
				label: "i18n.settings.refresh",
				nicename: "refresh",
				min: 0,
				max: 100000
			},
		],
		config: {
			js: "",
			height: 400,
			refresh: 0,
			size: "variable",
			html: '<svg xmlns="http://www.w3.org/2000/svg" fill="#4CAF50" viewBox="0 0 24 24"><path d="M19 4h-4l-7.89 12.63-2.61-4.63 4.5-8h-4l-4.5 8 4.5 8h4l7.89-12.63 2.61 4.63-4.5 8h4l4.5-8z"/></svg>'
		},
		render: function() {
			//The legacy widget refresh functionality is not used because it does not allow to dynamically change the interval
			var currentRefresh = this.refreshInterval || 0;
			var expectedRefresh = this.config && this.config.refresh ? Number(this.config.refresh) : 0;

			if (currentRefresh !== expectedRefresh) {
				if (this.refreshTimerId) {
					window.clearInterval(this.refreshTimerId);
					delete this.refreshTimerId;
				}

				if (expectedRefresh > 0) {
					this.refreshTimerId = window.setInterval(function() {
						var iframes = this.elm.find("iframe");
						if (iframes.length > 0) {
							var iframe = iframes[0];
							if (iframe.contentWindow.location.protocol !== "chrome-extension:") {
								iframe.contentWindow.location.reload(true);
							}
						}
					}.bind(this), expectedRefresh * 1000);
				}

				this.refreshInterval = expectedRefresh;
			}

			this.utils.render({
				height: this.config.height || 400
			});

			var iframe = document.createElement("iframe");

			iframe.setAttribute("seamless", "seamless");
			iframe.style.height = (this.config.height || 400) + "px";

			iframe.onload = function() {
				iframe.contentWindow.document.open();
				iframe.contentWindow.document.write(this.config.html);
				iframe.contentWindow.document.close();

				if (this.config.js) {
					// Using the contentWindow's Function causes execution to happen in the frame
					(new (iframe.contentWindow.Function)(this.config.js))();
				}
			}.bind(this);

			// Future-proofing, instead of insertAfter
			this.elm.find("span.replace").replaceWith(iframe);

			this.elm.addClass("tabbed").css("height", this.config.height || 400); // This prevents a weird 5px gap at the bottom of the widget
		}
	};
});