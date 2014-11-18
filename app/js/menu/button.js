/**
 * This generates the toolbar button style
 */
define(["backbone", "menu/menu"], function(Backbone, Menu) {
	var View = Backbone.View.extend({
		tagName: "div",
		className: "menu-toggle",

		events: {
			"click": Menu.toggle.bind(Menu),
		},

		initialize: function() {
			this.render();
		},

		render: function() {
			Menu.$el.detach();

			this.$el.html('<div class="menu-button"></div>').append(Menu.el);

			return this;
		}
	});

	return View;
});