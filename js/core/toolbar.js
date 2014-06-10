/**
 * This generates the toolbar and its submodules
 */
define(["backbone", "storage/storage", "search/search", "settings/settings", "core/templates"], function(Backbone, Storage, Search, Settings, render) {
	var Model = Backbone.Model.extend({
			init: function() {
				Storage.on("done updated", function(storage) {
					this.set(storage.settings);
				}, this);
			}
		}),
		View = Backbone.View.extend({
			tagName: "header",
			className: "toolbar",
			events: {
				"click .icon.settings": function() { // This has to be proxied since Backbone event handlers are bound to this
					this.Settings.show();
				}
			},
			initialize: function() {
				this.model = new Model();

				this.Search = new Search();

				this.Search
					.on("typing:start", function() {
						this.$el.toggleClass("typing", true);
					}, this)
					.on("typing:end", function() {
						this.$el.toggleClass("typing", false);
					}, this);

				this.Settings = Settings;

				// init() needs to be called after the listener is attached to prevent a race condition when storage is already loaded.
				// It also needs to be here instead of attached directly to new Model() otherwise this.model might not be set yet.
				this.model.on("change", this.render, this).init();
			},
			render: function() {
				this.$el
					.toggleClass("hidden", this.model.get("toolbar"))
					.html(render("toolbar", this.model.toJSON()));

				this.$(".search").replaceWith(this.Search.el);

				return this;
			}
		});

	return View;
});