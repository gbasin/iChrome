/*
 * The Wolfram|Alpha widget.
 */
define(["jquery"], function($) {
	return {
		id: 5,
		size: 1,
		order: 16,
		name: "Wolfram|Alpha",
		nicename: "wolfram",
		desc: "Inserts a small Wolfram|Alpha search box.",
		sizes: ["small"],
		config: {
			size: "small"
		},
		render: function() {
			this.utils.render();
		}
	};
});