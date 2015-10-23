/**
 * This is the Visual tab in the settings
 */
define(["lodash", "jquery", "backbone", "storage/storage", "i18n/i18n", "core/pro", "core/render"], function(_, $, Backbone, Storage, Translate, Pro, render) {
	var Model = Backbone.Model.extend({
			getRender: function() {
				var data = _.clone(this.get("settings"));

				data.isPro = Pro.isPro;

				data.themename = (this.get("cached")[data.theme] || this.get("themes")[data.theme.replace("custom", "")] || {}).name;

				if (typeof data.toolbar == "boolean") {
					if (data.toolbar) {
						data.toolbar = "full";
					}
					else {
						data.toolbar = "button";
					}
				}

				return data;
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
				},

				"click .style .preview": function(e) {
					e.preventDefault();

					this.previewStyle(e.currentTarget.getAttribute("data-style"));
				}
			},

			initialize: function(options) {
				this.themes = options.themes;

				this.model = new Model();

				this.model.on("change", this.render, this).init();
			},


			/**
			 * Displays a preview of an app style
			 *
			 * @param   {String}  style  The style to preview
			 */
			previewStyle: function(style) {
				// Adaptive themes such as the transparent one need to
				// restore the base style after they've been previewed
				var oldClass = $(document.body).attr("class");

				$(document.body).removeClass(this.model.get("settings").style).addClass(style);

				var hidePreview = function() {
					clearTimeout(removeTimeout);

					$(".modal.previewHidden, .modal-overlay.previewHidden").removeClass("previewHidden").addClass("visible");

					previewOverlay.remove();

					$(document.body).attr("class", oldClass);
				};

				// Styles are a pro feature. Anyone can preview them, but we don't
				// want them to "preview" one forever, so we hide the preview
				// after 2 minutes
				var removeTimeout = setTimeout(hidePreview, 120000);

				var previewOverlay = $('<div class="preview-overlay visible"></div>').one("click", hidePreview).appendTo(document.body);

				$(".modal.visible, .modal-overlay.visible").removeClass("visible").addClass("previewHidden");
			},


			render: function() {
				var data = this.model.getRender();

				this.$el
					.html(render("settings/visual", data))
					.find("#columns").val(this.model.get("settings").columns).end()
					.find(".style input").filter(function() { return this.value == data.style; }).prop("checked", true).end()
					.find(".toolbar-style input").filter(function() { return this.value == data.toolbar; }).prop("checked", true);

				return this;
			}
		});

	return View;
});