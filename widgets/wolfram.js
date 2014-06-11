/*
 * The Wolfram|Alpha widget.
 */
define(["jquery"], function($) {
	return {
		id: 5,
		nicename: "wolfram",
		config: {
			size: "small"
		},
		render: function() {
			this.utils.render();
		}
	};
});