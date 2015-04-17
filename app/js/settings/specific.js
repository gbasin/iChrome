/**
 * This is the Tab Specific tab in the settings
 */
define(["jquery", "backbone", "core/analytics", "storage/storage", "i18n/i18n", "core/render"], function($, Backbone, Track, Storage, Translate, render) {
	var Model = Backbone.Model.extend({
			init: function() {
				Storage.on("done updated", function(storage) {
					this.set(storage);

					this.storage = storage; // This is set so tab splices affect the referenced version
				}, this);
			}
		}),
		View = Backbone.View.extend({
			tagName: "div",
			className: "tab specific",
			events: {
				"click .btns .btn.delete": function(e) {
					e.preventDefault();

					if (
						this.$("form").length !== 1 &&
						confirm(Translate("settings.specific.delete_confirm"))
					) {
						var tab = this.$("form.active").attr("data-tab") - 1;

						this.$("form.active").remove();

						this.model.storage.tabs.splice(tab, 1);
						this.model.storage.tabsSync.splice(tab, 1);

						this.model.storage.tabs.forEach(function(e, i) {
							e.id = i + 1;
						});

						Storage.trigger("updated");

						Track.event("Tabs", "Remove", this.model.storage.tabs.length);

						this.trigger("tab:removed");
					}
					else if (this.$("form").length == 1) {
						alert(Translate("settings.specific.delete_disallowed"));
					}
				},
				"click .btns .btn.default": function(e) {
					e.preventDefault();

					var tab = this.$("form.active").attr("data-tab");

					if (tab) {
						this.model.get("settings").def = parseInt(tab);

						Track.event("Tabs", "Set as default", tab);

						Storage.trigger("updated");

						this.trigger("tab:default");
					}
				},
				"click .btn.theme": function(e) {
					e.preventDefault();

					this.themes.show();

					this.themes.once("use", function(theme, id) {
						$(e.currentTarget).prev("input").val(id || theme.id).end()
							.next(".current").text(theme.name || (typeof theme.id == "number" ? Translate("settings.visual.theme_placeholder", theme.id) : ""));
					}, this);
				}
			},
			initialize: function(options) {
				this.themes = options.themes;

				this.model = new Model();

				this.model.on("change", this.render, this).init();
			},
			render: function() {
				var data = {
					tabs: []
				};

				this.model.get("tabs").forEach(function(tab, i) {
					var theme = tab.theme || this.get("settings").theme || "default";
					data.tabs.push({
						name: tab.name || "Home",
						theme: theme,
						id: tab.id,
						fixed: !!tab.fixed,
						columns: (tab.medley ? "medley" : (tab.columns.length || 3)),
						active: (i === 0 ? "active" : ""),
						themename: (
							theme == "default" ?
								Translate("settings.visual.theme") :
							(
								this.get("cached")[theme] || this.get("themes")[(theme).replace("custom", "")] || {}
							).name
						)
					});
				}.bind(this.model));

				this.$el.html(render("settings/tab-specific", data));

				data.tabs.forEach(function(tab, i) {
					this.$("form[data-tab='" + tab.id + "']")
						.find("#columns" + tab.id).val(tab.columns == "medley" ? "medley" : tab.columns + (tab.fixed ? "-fixed" : "-fluid"));
				}.bind(this));

				return this;
			}
		});

	return View;
});