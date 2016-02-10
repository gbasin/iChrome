/**
 * The visual settings page
 */
define(["jquery", "i18n/i18n", "modals/alert", "core/auth", "settings/page", "themes/utils", "themes/themes"], function($, Translate, Alert, Auth, Page, Utils, themePicker) {
	var View = Page.extend({
		id: "visual",

		dynamicControls: {
			theme: "style",
			layout: "layout",
			column_width: "column_width"
		},

		monitorProps: ["theme", "backgroundImage", "layout", "columns", "columnWidth", "style"],

		events: {
			"click .background button.select": function() {
				themePicker().show().once("use", function(theme, id) {
					this.model.set("theme", id || theme.id, {
						noRender: true
					});

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
					if (value && value.trim()) {
						this.model.set("theme", "custom");

						this.model.set("backgroundImage", value);
					}
					else {
						this.model.unset("backgroundImage", {
							noRender: true
						});

						// If the theme was a custom one and there now isn't an image, set it to the default
						if (this.model.get("theme") === "custom") {
							this.model.set("theme", "default");
						}
					}
				break;

				case "layout":
					var next = function() {
						this.model.set("layout", value, {
							noRender: true
						});

						$(elm).parents(".input").siblings(".input")[value === "columns" ? "slideDown" : "slideUp"](300);
					};

					if ((value === "columns" && this.model.get("layout") === "grid") || (value === "grid" && this.model.get("layout") === "columns")) {
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
					var columns = parseInt(value) || 3;

					if (columns < 1) {
						columns = 1;
					}
					else if (columns > 5) {
						columns = 5;
					}

					if (columns.toString() !== value.trim()) {
						this.$("input[name=columns]").val(columns);
					}

					this.model.set("columns", columns, {
						noRender: true
					});
				break;

				case "column_width":
					this.model.set("columnWidth", value, {
						noRender: true
					});
				break;

				case "theme":
					this.model.set("style", (Auth.isPro && value) || "light", {
						noRender: true
					});
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
				backgroundURL: data.theme === "custom" ? data.backgroundImage : null,

				// Layout
				layout: data.layout,
				columns: data.columns,
				column_width: data.columnWidth,

				// Style
				style: Auth.isPro ? data.style : "light"
			};
		},

		onRender: function(data) {
			if (data.layout === "grid") {
				this.$("section.layout .input.main").siblings(".input").css("display", "none");
			}
		}
	});

	return View;
});