/*
 * Site Link
 */
define(["lodash"], function(_) {
	return {
		id: 38,
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
			image: "/images/sitelink_demo.png"
		},
		render: function() {
			var data = _.clone(this.config);

			data.hasIcon = data.image || data.color;

			this.utils.render(data);
		}
	};
});