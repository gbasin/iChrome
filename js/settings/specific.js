/**
 * This is the Tab Specific tab in the settings
 */
define(["backbone", "core/analytics", "storage/storage", "core/templates"], function(Backbone, Track, Storage, render) {
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
						confirm("Are you really sure you want to delete this tab?\r\n" + 
								"This action is not reversible and all data from all " + 
								"widgets in this tab will be lost.")
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
						alert("You cannot delete the only remaining tab.");
					}
				},
				"click .btns .btn.default": function(e) {
					e.preventDefault();

					var tab;

					if (tab = this.$("form.active").attr("data-tab")) {
						this.model.get("settings").def = parseInt(tab);

						Track.event("Tabs", "Set as default", tab);

						Storage.trigger("updated");

						this.trigger("tab:default");
					}
				},
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
				var data = {
					tabs: []
				};

				this.model.get("tabs").forEach(function(tab, i) {
					data.tabs.push({
						name: tab.name || "Home",
						theme: tab.theme || this.get("settings").theme || "default",
						id: tab.id,
						fixed: !!tab.fixed,
						alignment: tab.alignment || "center",
						columns: (tab.medley ? "medley" : (tab.columns.length || 3)),
						active: (i == 0 ? "active" : ""),
						themename: (
							(tab.theme || this.get("settings").theme || "default") == "default" ?
								"Default Theme" :
							(
								this.get("cached")[tab.theme] || this.get("themes")[tab.theme.replace("custom", "")] || {}
							).name
						)
					});
				}.bind(this.model));

				this.$el.html(render("settings/tab-specific", data));

				data.tabs.forEach(function(tab, i) {
					this.$("form[data-tab='" + tab.id + "']")
						.find("#columns" + tab.id).val(tab.columns == "medley" ? "medley" : tab.columns + (tab.fixed ? "-fixed" : "-fluid")).end()
						.find("#alignment" + tab.id).val(tab.alignment);
				}.bind(this));

				return this;
			}
		});

	return View;
});