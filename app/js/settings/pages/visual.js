/**
 * The visual settings page
 */
define(["jquery", "i18n/i18n", "modals/alert", "core/pro", "settings/page", "themes/utils", "themes/themes"], function($, Translate, Alert, Pro, Page, Utils, themePicker) {
	var View = Page.extend({
		id: "visual",

		radios: {
			theme: "style",
			layout: "layout",
			column_width: "column_width"
		},

		monitorProps: ["theme", "backgroundURL", "columns", "style"],

		events: {
			"click .background button.select": function() {
				themePicker().show().once("use", function(theme, id) {
					this.model.set("theme", id || theme.id);

					this.$(".current-background").text(theme.name || (typeof theme.id === "number" ? Translate("settings.visual.unnamed", theme.id) : ""));
				}, this);
			},

			"click .theme button.preview": function(e) {
				this.previewStyle(e.currentTarget.parentNode.getAttribute("data-id"));
			}
		},


		/**
		 * General input change handler
		 *
		 * @param   {HTMLElement}  elm    The input element
		 * @param   {String}       name   The name of the input
		 * @param   {String}       value  The value of the input
		 */
		onInputChange: function(elm, name, value) {
			switch (name) {
				case "background-url":
					// TODO: Implement
				break;

				case "layout":
					var next = function() {
						this.model.set("columns", value === "columns" ? this.$("input[name=columns]").val() + "-" + this.$("input[name=column_width]:checked").val() : "medley");

						$(elm).parents(".input").siblings(".input")[value === "columns" ? "slideDown" : "slideUp"](300);
					};

					if ((value === "columns" && this.model.get("columns") === "medley") || (value === "grid" && this.model.get("columns") !== "medley")) {
						Alert({
							confirm: true,
							contents: [Translate("settings.visual.layout.column_warning." + (value === "columns" ? "grid_to_column" : "column_to_grid"))]
						}).on("select", function(confirmed) {
							if (confirmed) {
								next.call(this);
							}
							else {
								this.$("input[name=layout]:not(:checked)")[0].checked = true;
							}
						}, this);
					}
					else {
						next.call(this);
					}
				break;

				case "columns":
					this.model.set("columns", value + "-" + this.$("input[name=column_width]:checked").val());
				break;

				case "column_width":
					this.model.set("columns", parseInt(this.$("input[name=columns]").val() || 3) + "-" + value);
				break;

				case "theme":
					this.model.set("style", (Pro.isPro && value) || "light");
				break;
			}
		},


		/**
		 * Displays a preview of an app style
		 *
		 * @param   {String}  style  The style to preview
		 */
		previewStyle: function(style) {
			var body = $(document.body);

			// Adaptive themes such as the transparent one need to
			// restore the base style after they've been previewed
			var oldClass = body.attr("class");

			body.removeClass(this.model.get("style")).addClass(style);

			var hidePreview = function() {
				clearTimeout(removeTimeout);

				$(".previewHidden").removeClass("previewHidden").addClass("visible");

				previewOverlay.remove();

				body.attr("class", oldClass);
			};

			// App themes are a pro feature. Anyone can preview them, but we don't
			// want them to "preview" one forever, so we need to stop after 2 minutes
			var removeTimeout = setTimeout(hidePreview, 120000);

			var previewOverlay = $('<div class="preview-overlay visible"></div>').one("click", hidePreview).appendTo(body);

			$(".modal.visible, .settings.visible, .modal-overlay.visible").removeClass("visible").addClass("previewHidden");
		},


		onBeforeRender: function(data) {
			return {
				// Background
				currentBackground: (Utils.get(data.theme) || {}).name,
				backgroundURL: data.theme === "custom" ? data.backgroundURL : null,

				// Layout
				columns: parseInt(data.columns.split("-")[0]) || 1,
				layout: data.columns === "medley" ? "grid" : "columns",
				column_width: data.columns.split("-")[1] === "fluid" ? "fluid" : "fixed",

				// Style
				style: Pro.isPro ? data.style : "light"
			};
		}
	});

	return View;
});