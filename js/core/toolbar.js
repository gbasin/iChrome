/**
 * This generates the toolbar and soon its submodules
 */
define(["backbone", "storage/storage", "core/templates"], function(Backbone, Storage, render) {
	var model = Backbone.Model.extend({
			initialize: function() {
				Storage.done(function(storage) {
					this.set(storage.settings);

					Storage.on("updated", function() {
						// storage itself is only a reference, therefore when it's updated in the Storage module the value here is also changed
						this.set(storage.settings);
					}, this);
				}.bind(this));
			}
		}),
		view = Backbone.View.extend({
			model: new model(),
			tagName: "header",
			className: "toolbar",
			initialize: function() {
				this.model.on("change", function() {
					this.render();
				}, this);
			},
			render: function() {
				this.$el
					.toggleClass("hidden", this.model.get("toolbar"))
					.html(render("toolbar", this.model.attributes));

				return this;
			}
		});

	return view;
});