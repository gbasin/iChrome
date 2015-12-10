/**
 * The settings view
 */
define(["lodash", "jquery", "backbone", "core/analytics", "core/render"], function(_, $, Backbone, Track, render) {
	var View = Backbone.View.extend({
		tagName: "div",
		className: "settings",

		events: {
			"keydown": function(e) {
				if (e.keyCode === 27) {
					this.hide(e);
				}
			}
		},

		show: function() {
			this.render();

			// The settings are a "page", not a modal. The body shouldn't scroll.
			$(document.body).css("overflow", "hidden");

			this.$el.appendTo(document.body);

			requestAnimationFrame(function() {
				this.$el.addClass("visible");
			}.bind(this));

			//Track.pageview("Settings", "/settings");
		},

		hide: function() {
			this.$el.removeClass("visible");

			$(document.body).css("overflow", "");

			setTimeout(this.destroy.bind(this), 400);
		},

		createTab: function() {

		},

		initialize: function() {
			this.show();
		},

		render: function() {
			this.$el.html(render("settings"));

			return this;
		}
	});

	return View;
});