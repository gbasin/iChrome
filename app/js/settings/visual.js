/**
 * This is the Visual tab in the settings
 */
define(["lodash", "jquery", "backbone", "storage/storage", "i18n/i18n", "core/render"], function(_, $, Backbone, Storage, Translate, render) {
	var Model = Backbone.Model.extend({
			getRender: function() {
				var settings = _.clone(this.get("settings"));

				settings.themename = (this.get("cached")[settings.theme] || this.get("themes")[settings.theme.replace("custom", "")] || {}).name;

				if (typeof settings.toolbar == "boolean") {
					if (settings.toolbar) {
						settings.toolbar = "full";
					}
					else {
						settings.toolbar = "button";
					}
				}

				return settings;
			},
			init: function() {
				Storage.on("done updated", function(storage) {
					this.set({
						themes: storage.themes,
						cached: storage.cached,
						settings: storage.settings
					});
				}, this);
			}
		}),
		View = Backbone.View.extend({
			tagName: "div",
			className: "tab visual",
			events: {
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
				var data = this.model.getRender();

				this.$el
					.html(render("settings/visual", data))
					.find("#columns").val(this.model.get("settings").columns).end()
					.find(".toolbar-style input").filter(function() { return this.value == data.toolbar; }).prop("checked", true);

				return this;
			}
		});

	return View;
});