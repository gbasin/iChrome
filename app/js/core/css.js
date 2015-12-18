/**
 * This generates global CSS overrides based on settings and user defined custom CSS
 */
define(["backbone", "storage/storage", "core/render"], function(Backbone, Storage, render) {
	var Model = Backbone.Model.extend({
			defaults: {
				custom: ""
			},
			init: function() {
				Storage.on("done updated", function(storage) {
					this.set({
						custom: storage.settings.customCSS || ""
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
				var d = this.model.toJSON();

				this.$el.html(render("css", d));

				return this;
			}
		});

	return View;
});