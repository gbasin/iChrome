/**
 * This module controls theme displaying and previewing
 */
define(["lodash", "jquery", "backbone", "core/auth", "themes/utils"], function(_, $, Backbone, Auth, Utils) {
	var Themes = Backbone.View.extend({
		el: "body",


		initialize: function() {
			this.listenTo(Utils.model, "change:cached change:backgroundImage", function() {
				var newTheme = Utils.get(this.theme);

				// If the theme itself hasn't changed and it's a random one, we
				// don't want to pick a new image
				if (newTheme.image || newTheme.video || JSON.stringify(this.theme) !== JSON.stringify(newTheme)) {
					this.theme = newTheme;

					this.render();

					this.trigger("change:theme");
				}
			});
		},


		/**
		 * Previews a theme, hiding all modals and adding a transparent overlay
		 *
		 * @param   {Object|String}  theme  The theme to preview
		 */
		preview: function(theme) {
			theme = typeof theme === "object" ? theme : Utils.get(theme);

			this.render(theme, true);

			var hidePreview = function() {
				clearTimeout(removeTimeout);

				$(".previewHidden").removeClass("previewHidden").addClass("visible");

				previewOverlay.remove();

				this.render();
			}.bind(this);

			// Some themes are Pro-only. Anyone can preview them, but we don't
			// want them to "preview" one forever, so we hide the preview after
			// 2 minutes
			var removeTimeout = setTimeout(hidePreview, 120000);

			var previewOverlay = $('<div class="preview-overlay visible"></div>').one("click", hidePreview).appendTo(this.el);

			$(".modal.visible, .settings.visible, .modal-overlay.visible").removeClass("visible").addClass("previewHidden");
		},


		/**
		 * Updates the currently active theme
		 *
		 * @param  {Object|String}  theme  The theme or theme ID to make current
		 */
		setTheme: function(theme) {
			// The utils convert a number of inputs into a consistent themes spec
			this.theme = Utils.get(theme);

			this.render();

			this.trigger("change:theme");
		},


		/**
		 * Get a CSS string for the given theme
		 *
		 * @param  {Object} theme The theme to generate CSS for
		 * @return {String}       A CSS string
		 */
		getCSS: function(theme) {
			var css = "",
				image = Utils.getImage(theme);

			if (theme.color) {
				css += "background-color: " + theme.color + ";";
			}

			if (image) {
				css += "background-image: url(\"" + image + "\");";
			}

			if (theme.scaling) {
				css += "background-size: " + theme.scaling + ";";
			}

			if (theme.position) {
				css += "background-position: " + theme.position + ";";
			}

			if (theme.repeat) {
				css += "background-repeat: " + theme.repeat + ";";
			}

			if (theme.fixed) {
				css += "background-attachment: " + theme.fixed + ";";
			}

			if (theme["inline-css"]) {
				css += theme["inline-css"];
			}

			return css;
		},


		render: function(theme, preview) {
			theme = theme || this.theme;

			if ((theme.oType || theme.type) === "video") {
				if (!preview && !Auth.isPro) {
					return;
				}

				if (!this.video) {
					this.video = document.createElement("video");

					this.video.loop = true;
					this.video.autoplay = true;

					this.video.setAttribute("class", "bg-video");

					this.$el.prepend(this.video);
				}

				this.video.src = Utils.getImage(theme);
			}
			else {
				// If a video element is present (from a previous theme), destroy it
				if (this.video) {
					this.video.pause();

					this.video.src = "";

					this.video.load();

					$(this.video).remove();

					delete this.video;
				}

				this.$el.attr("style", this.getCSS(theme || this.theme));
			}
		}
	});

	return new Themes();
});