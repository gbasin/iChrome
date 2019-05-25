/*
 * Site Link
 */
define(["jquery", "lodash", "browser/api"], function($, _, Browser) {
	return {
		id: 38,
		sort: 100,
		size: 1,
		nicename: "sitelink",
		sizes: ["tiny", "medium"],
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "i18n.settings.title",
				placeholder: "i18n.settings.title_placeholder"
			},
			{
				type: "size"
			},
			{
				type: "text",
				nicename: "link",
				label: "i18n.settings.link",
				placeholder: "i18n.settings.link_placeholder"
			},
			{
				type: "text",
				nicename: "image",
				label: "i18n.settings.image",
				placeholder: "i18n.settings.image_placeholder"
			},
			{
				type: "color",
				label: "i18n.settings.color",
				nicename: "color"
			},
			{
				type: "select",
				nicename: "style",
				label: "i18n.settings.style",
				options: {
					fill: "i18n.settings.style_fill",
					center: "i18n.settings.style_center"
				}
			},
		],
		config: {
			size: "tiny",
			style: "center",
			color: "#E62D27",
			title: "YouTube",
			link: "https://www.youtube.com/",
			image: "images/sitelink_demo.png"
		},
		render: function() {
			var data = _.clone(this.config);

			data.hasIcon = data.image || data.color;

			this.utils.render(data);

			this.elm.off("click.sitelink").on("click.sitelink", "a", function(e) {
				var href = this.getAttribute("href");

				if (href.indexOf("chrome") === 0) { // chrome:// links can't be opened directly for security reasons, this bypasses that feature.
					e.preventDefault();

					Browser.tabs.getCurrent(function(d) {
						if (e.which === 2 || (e.currentTarget.target || $("base").attr("target")) === "_blank") {
							Browser.tabs.create({
								url: href,
								index: d.index + 1
							});
						}
						else {
							Browser.tabs.update(d.id, {
								url: href
							});
						}
					});
				}
			});
		}
	};
});