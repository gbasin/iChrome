/*
 * The Wolfram|Alpha widget.
 */
define(["jquery"], function($) {
	return {
		id: 5,
		size: 1,
		order: 32,
		name: "Wolfram|Alpha",
		nicename: "wolfram",
		sizes: ["small"],
		config: {
			size: "small"
		},
		render: function() {
			this.utils.render();
		}
	};
});