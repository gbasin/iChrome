/*
 * The Wolfram|Alpha widget.
 */
define(function() {
	return {
		id: 5,
		size: 1,
		order: 32,
		nicename: "wolfram",
		sizes: ["small"],
		config: {
			size: "small"
		},
		render: function() {
			this.utils.render();
			this.elm.addClass("tabbed");
		}
	};
});