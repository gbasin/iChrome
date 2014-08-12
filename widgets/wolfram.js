/*
 * The Wolfram|Alpha widget.
 */
define(["jquery"], function($) {
	return {
		id: 5,
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