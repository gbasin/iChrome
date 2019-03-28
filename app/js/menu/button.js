/**
 * This generates the toolbar button style
 */
define(["backbone", "menu/menu", "core/announcements"], function(Backbone, Menu, Announcements) {
	var View = Backbone.View.extend({
		tagName: "div",
		className: "menu-toggle",

		events: {
			"click .menu-container": Menu.toggle.bind(Menu),

			"click .menu-button, .announcements": function(e) {
				Menu.toggle(e);
			}
		},

		initialize: function() {
			this.render();

			Announcements.on("countchange", this.render, this);
		},

		render: function() {
			Menu.$el.detach();

			this.$el.html('<div class="menu-button"></div>' + (Announcements.count ? '<div class="announcements">' + Announcements.count + '</div>' : "")).append(Menu.el);

			return this;
		}
	});

	return View;
});