/**
 * This generates global CSS overrides based on settings and user defined custom CSS
 */
define(["backbone", "storage/storage", "core/templates"], function(Backbone, Storage, render) {
	var CSS = Backbone.View.extend({
		tagName: "style",
		className: "customcss",
		settings: {
			custom: "",
			wcolor: "#FFF",
			animation: true,
			hcolor: "#F1F1F1"
		},
		initialize: function() {
			Storage.done(function(storage) {
				this.settings = {
					animation: storage.settings.animation,
					wcolor: storage.settings.wcolor || "#FFF",
					hcolor: storage.settings.hcolor || "#F1F1F1",
					custom: storage.settings["custom-css"] || ""
				};

				this.render();
			}.bind(this));
		},
		render: function() {
			this.$el.html(render("css", this.settings));

			return this;
		}
	});

	return CSS;
});