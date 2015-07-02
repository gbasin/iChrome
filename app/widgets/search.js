/*
 * Search
 */
define([], function() {
	return {
		id: 40,
		size: 1,
		nicename: "search",
		sizes: ["tiny", "small"],

		config: {
			param: "q",
			size: "small",
			url: "https://www.google.com/search",
			placeholder: "i18n.default_placeholder"
		},

		settings: [
			{
				type: "size"
			},
			{
				type: "text",
				nicename: "placeholder",
				label: "i18n.settings.placeholder",
				placeholder: "i18n.default_placeholder"
			},
			{
				type: "text",
				nicename: "url",
				label: "i18n.settings.search_url",
				placeholder: "https://www.google.com/search"
			},
			{
				type: "text",
				nicename: "param",
				label: "i18n.settings.param",
				placeholder: "i18n.settings.param_placeholder"
			}
		],

		render: function() {
			this.utils.render(this.config);
		}
	};
});