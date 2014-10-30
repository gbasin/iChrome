/**
 * This generates the toolbar button style
 */
define(["backbone", "core/menu"], function(Backbone, Menu) {
	var View = Backbone.View.extend({
		tagName: "div",
		className: "menu-toggle",

		events: {
			"click": Menu.toggle.bind(Menu),
		},

		initialize: function() {
			this.$el.append('<div class="menu-button"></div>', Menu.$el);
		}
	});

	return View;
});