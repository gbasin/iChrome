/**
 * This generates global CSS overrides based on settings and user defined custom CSS
 */
define(["backbone", "storage/storage", "core/render"], function(Backbone, Storage, render) {
	var Model = Backbone.Model.extend({
			defaults: {
				custom: "",
				wcolor: "#FFF",
				animation: true/*,
				hcolor: "#F1F1F1"*/
			},
			init: function() {
				Storage.on("done updated", function(storage) {
					this.set({
						animation: storage.settings.animation,
						wcolor: storage.settings.wcolor || "#FFF",
						// hcolor: storage.settings.hcolor || "#F1F1F1",
						custom: storage.settings["custom-css"] || ""
					});
				}, this);

				return this;
			}
		}),
		View = Backbone.View.extend({
			tagName: "style",
			className: "customcss",
			initialize: function() {
				this.model = new Model().on("change", this.render, this);

				// This can't be in the same statement since init might be synchronous
				this.model.init();
			},
			render: function() {
				this.$el.html(render("css", this.model.toJSON()));

				return this;
			}
		});

	return View;
});