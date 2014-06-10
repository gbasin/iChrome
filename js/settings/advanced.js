/**
 * This is the Advanced tab in the settings
 */
define(["jquery", "backbone", "storage/storage", "core/templates"], function($, Backbone, Storage, render) {
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
				"click .reset": "reset"
			},
			restore: function(e) {
				e.preventDefault();

				if (!confirm("Are you really, really sure you want to do this?\r\nThis will overwrite all local" + 
							 " and synced data, there is no backup and no way to undo this.  You will lose your" +
							 " ENTIRE current configuration on all computers signed into this Google account.")) {
					return;
				}

				try {
					var settings = JSON.parse(this.$("#backup").val());

					// Calling this.model.set will break the inheritance chain (a change to this.model.settings.search will instantly change all
					// other copies of settings across iChrome) so this needs to be set directly onto the storage object
					this.model.save(settings, function() {
						modal.hide();
					});
				}
				catch(e) {
					alert("An error occurred while trying to parse the provided data, please make sure you entered the EXACT text you backed up.");
				}
			},
			reset: function(e) {
				e.preventDefault();

				if (!confirm("Are you really sure you want to reset iChrome?\r\nThis will erase all local" + 
							 " and synced data, there is no backup and no way to undo this.  You will lose your" +
							 " ENTIRE current configuration on all computers signed into this Google account.")) {
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
			render: function() {
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