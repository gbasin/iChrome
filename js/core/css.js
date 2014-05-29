/**
 * This generates global CSS overrides based on settings and user defined custom CSS
 */
define(["backbone", "storage/storage", "core/templates"], function(Backbone, Storage, render) {
	var model = Backbone.Model.extend({
			defaults: {
				custom: "",
				wcolor: "#FFF",
				animation: true,
				hcolor: "#F1F1F1"
			},
			initialize: function() {
				Storage.on("done updated", function(storage) {
					this.set({
						animation: storage.settings.animation,
						wcolor: storage.settings.wcolor || "#FFF",
						hcolor: storage.settings.hcolor || "#F1F1F1",
						custom: storage.settings["custom-css"] || ""
					});
				}, this);
			}
		}),
		view = Backbone.View.extend({
			model: new model(),
			tagName: "style",
			className: "customcss",
			initialize: function() {
				this.model.on("change", this.render, this);
			},
			render: function() {
				this.$el.html(render("css", this.model.toJSON()));

				return this;
			}
		});

	return view;
});