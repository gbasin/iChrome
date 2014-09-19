/**
 * This is the Visual tab in the settings
 */
define(["lodash", "jquery", "backbone", "storage/storage", "core/templates"], function(_, $, Backbone, Storage, render) {
	var Model = Backbone.Model.extend({
			getRender: function() {
				var settings = _.clone(this.get("settings"));

				settings.themename = (this.get("cached")[settings.theme] || this.get("themes")[settings.theme.replace("custom", "")] || {}).name;

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

					iChrome.Themes.show(); // DEPENDENCY: Themes

					iChrome.Themes.elm = e.currentTarget;

					iChrome.Themes.show(function(theme, id) {
						this.prev("input").val(id || theme.id).end()
							.next(".current").text(theme.name || (typeof theme.id == "number" ? "Theme " + theme.id : ""));

						iChrome.Themes.hide();
					}.bind($(e.currentTarget)), function(theme) {
						this.attr("data-style", this.attr("style")).attr("style", iChrome.Tabs.getCSS({theme:theme}));

						iChrome.Themes.overlay.addClass("visible").one("click", function() {
							$(".modal.previewHidden, .modal-overlay.previewHidden").removeClass("previewHidden").addClass("visible");

							this.attr("style", this.attr("data-style")).attr("data-style", "");
						}.bind(this));

						$(".modal.visible, .modal-overlay.visible").removeClass("visible").addClass("previewHidden");
					}.bind($(document.body)));
				}
			},
			initialize: function() {
				this.model = new Model();

				this.model.on("change", this.render, this).init();
			},
			render: function() {
				this.$el
					.html(render("settings/visual", this.model.getRender()))
					.find("#alignment").val(this.model.get("settings").alignment).end()
					.find("#columns").val(this.model.get("settings").columns);

				return this;
			}
		});

	return View;
});