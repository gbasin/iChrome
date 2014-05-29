/**
 * This generates the toolbar and soon its submodules
 */
define(["backbone", "storage/storage", "core/templates"], function(Backbone, Storage, render) {
	var model = Backbone.Model.extend({
			initialize: function() {
				Storage.on("done updated", function(storage) {
					this.set(storage.settings);
				}, this);
			}
		}),
		view = Backbone.View.extend({
			model: new model(),
			tagName: "header",
			className: "toolbar",
			initialize: function() {
				this.model.on("change", this.render, this);
			},
			render: function() {
				this.$el
					.toggleClass("hidden", this.model.get("toolbar"))
					.html(render("toolbar", this.model.toJSON()));

				return this;
			}
		});

	return view;
});