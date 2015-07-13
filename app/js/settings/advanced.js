/**
 * This is the Advanced tab in the settings
 */
define(["jquery", "backbone", "settings/debug", "storage/storage", "i18n/i18n", "core/render", "lib/jquery.spectrum"], function($, Backbone, Debug, Storage, Translate, render) {
	var Model = Backbone.Model.extend({
			save: function(d, cb) {
				if (d.tabs)		this.storage.tabs = d.tabs;
				if (d.themes)	this.storage.themes = d.themes;
				if (d.settings)	this.storage.settings = d.settings;

				this.get("sync")(true, cb);
			},
			init: function() {
				Storage.on("done updated", function(storage) {
					this.set(storage);

					this.storage = storage;
				}, this);
			}
		}),
		View = Backbone.View.extend({
			tagName: "div",
			className: "tab advanced",
			events: {
				"click .btn.backup": function(e) {
					e.preventDefault();

					this.$("#backup").val(JSON.stringify({
						themes: this.model.get("themes"),
						settings: this.model.get("settings"),
						tabs: this.model.get("tabsSync")
					}));
				},
				"click .btn.restore": "restore",
				"click .reset": "reset",
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
			restore: function(e) {
				e.preventDefault();

				if (!confirm(Translate("settings.advanced.restore_confirm"))) {
					return;
				}

				try {
					var settings = JSON.parse(this.$("#backup").val());

					// Calling this.model.set will break the inheritance chain (a change to this.model.settings.search will instantly change all
					// other copies of settings across iChrome) so this needs to be set directly onto the storage object
					this.model.save(settings, function() {
						this.trigger("restore");
					}.bind(this));
				}
				catch(err) {
					alert(Translate("settings.advanced.restore_error"));
				}
			},
			reset: function(e) {
				e.preventDefault();

				if (!confirm(Translate("settings.advanced.reset_confirm"))) {
					return;
				}

				Storage.reset(function() { // Disable the onbeforeunload sync save and reload
					window.onbeforeunload = null;

					chrome.extension.getBackgroundPage().setReload();

					location.reload();
				});
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
					.html(render("settings/advanced", this.model.get("settings")))
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