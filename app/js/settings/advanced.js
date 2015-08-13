/**
 * This is the Advanced tab in the settings
 */
define(["backbone", "settings/debug", "storage/storage", "i18n/i18n", "core/render", "lib/jquery.spectrum"], function(Backbone, Debug, Storage, Translate, render) {
	var Model = Backbone.Model.extend({
			init: function() {
				Storage.on("done updated", function(storage) {
					this.set(storage);
				}, this);
			}
		}),
		View = Backbone.View.extend({
			tagName: "div",
			className: "tab advanced",
			events: {
				"click .debug" :"debug"
			},
			debug: function(e) {
				if (confirm(Translate("settings.advanced.debug_confirm"))) {
					if (!this.Debug) {
						this.Debug = new Debug();
					}
					else {
						this.Debug.show();
					}
				}
			},
			initialize: function() {
				this.model = new Model();

				this.model.on("change", this.render, this).init();
			},
			remove: function() {
				this.$("input.color").spectrum("destroy");
				
				Backbone.View.prototype.remove.call(this);
			},
			render: function() {
				this.$("input.color").spectrum("destroy");

				this.$el
					.html(render("settings/advanced", {
						backups: this.model.get("backups"),
						settings: this.model.get("settings")
					}))
					.find("input.color").spectrum({
						showInput: true,
						showAlpha: true,
						showInitial: true,
						showButtons: false,
						preferredFormat: "rgb",
						clickoutFiresChange: true
					});

				return this;
			}
		});

	return View;
});