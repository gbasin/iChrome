/**
 * Displays information about the currently displayed background image or video
 */
define(["lodash", "backbone", "core/pro", "i18n/i18n", "core/analytics", "modals/alert", "themes/controller", "themes/utils", "core/render"], function(_, Backbone, Pro, Translate, Track, Alert, Themes, Utils, render) {
	var View = Backbone.View.extend({
		tagName: "section",
		className: "panel",

		attributes: {
			tabindex: -1
		},

		events: {
			"click button.download": function() {
				if (!Pro.isPro) {
					return Alert(Translate("themes.bginfo.pro_only"));
				}

				var a = document.createElement("a");

				a.href = this.data.downloadUrl;

				// Copy the extension
				a.download = this.data.name + a.pathname.slice(a.pathname.lastIndexOf("."), a.pathname.length);

				a.click();
			},

			"click button.source": function() {
				var a = document.createElement("a");

				a.href = this.data.sourceUrl;

				a.click();
			},

			"click button.view": function(e) {
				this.body.prepend(
					'<style id="theme-view-style-elm">' +
						'body > *:not(.bg-video) {' +
							'opacity: 0!important;' +
							'pointer-events: none;' +
							'transition: opacity .3s ease-in-out!important;' +
						'}' +
					'</style>'
				);

				var startX = e.clientX,
					startY = e.clientY;

				// This delays the attaching till after the events have finished bubbling, otherwise mousemove will get called immediately
				requestAnimationFrame(function() {
					this.body.on("mousemove.menu", function(e) {
						if (Math.abs(e.clientX - startX) >= 30 || Math.abs(e.clientY - startY) >= 30) {
							var tStyle = this.body.off("mousemove.menu").children().first().html(
								"body > *:not(.bg-video) {" +
									"transition: opacity .3s ease-in-out!important;" +
								"}"
							);

							setTimeout(function() { tStyle.remove(); }, 300);
						}
					}.bind(this));
				}.bind(this));

				Track.event("Theme Info", "View Background");
			},

			"click button.close": "close",

			"keydown": function(e) {
				if (e.keyCode === 27) {
					this.close();
				}
			}
		},

		close: function() {
			this.body.off("click.bginfo");

			this.animationPlayer.reverse();

			this.animationPlayer.onfinish = this.remove.bind(this);
		},

		initialize: function(options) {
			this.body = options.body;

			var theme = Themes.theme;

			if (!theme) {
				return this.remove();
			}

			this.render(theme);


			var elms = this.$("*").add(this.$el);

			this.body.on("click.bginfo", function(e) {
				if (!elms.is(e.target)) {
					this.close();
				}
			}.bind(this));


			this.animationPlayer = this.el.animate([
				{ transform: "translateY(calc(100% + 10px))" },
				{ transform: "translateY(0)" }
			], {
				duration: 200,
				easing: "cubic-bezier(.4, 0, .2, 1)"
			});

			Track.event("BG Info", "Show");
		},

		render: function(theme) {
			var preview, downloadUrl;

			// If the theme has multiple images then Utils.getImage might return a random one and
			// not the one that's currently being displayed. Without special logic for each theme
			// type we need to do a reverse lookup for the currently displayed background image.
			//
			// This unfortunately won't handle redirects, but should be OK for almost all cases
			if (theme.images) {
				// Clone so we don't set currentImage on the original
				theme = _.clone(theme);

				theme.currentImage = _.find(Utils.model.get("cached"), {
					image: this.body[0].style.backgroundImage.replace(/.*\s?url\([\'\"]?/, "").replace(/[\'\"]?\).*/, "")
				});

				if (!theme.currentImage) {
					return;
				}

				downloadUrl = Utils.getImage(theme.currentImage);
			}
			else {
				downloadUrl = Utils.getImage(theme);
			}


			if ((theme.oType || theme.type) === "video") {
				var canvas = document.createElement("canvas");

				canvas.width = Themes.video.videoWidth > 800 ? Themes.video.videoWidth / 2 : Themes.video.videoWidth;
				canvas.height = Themes.video.videoHeight > 400 ? Themes.video.videoHeight / 2 : Themes.video.videoHeight;

				var ctx = canvas.getContext("2d");

				ctx.drawImage(Themes.video, 0, 0, canvas.width, canvas.height);

				preview = canvas.toDataURL();
			}
			else {
				preview = downloadUrl;
			}


			this.data = {
				isPro: Pro.isPro,
				preview: preview,
				downloadUrl: downloadUrl
			};


			if (theme.currentImage) {
				if (theme.currentImage.name) {
					this.data.name = theme.currentImage.name;
				}

				if (theme.currentImage.url || (theme.currentImage.source && theme.currentImage.source.url)) {
					this.data.sourceUrl = theme.currentImage.url || (theme.currentImage.source && theme.currentImage.source.url);
				}

				if (theme.currentImage.source) {
					this.data.copyright = theme.currentImage.source.name ? theme.currentImage.source.name : theme.currentImage.source;
				}

				if (theme.currentImage.desc) {
					this.data.desc = theme.currentImage.desc;
				}
			}


			if (!this.data.name) {
				this.data.name = theme.name || Translate("themes.bginfo.unknown");
			}

			if (!this.data.copyright && theme.source && theme.source.name) {
				this.data.copyright = theme.source.name;
			}

			if (!this.data.sourceUrl && theme.source && theme.source.url) {
				this.data.sourceUrl = theme.source.url;
			}


			if (theme.name && theme.name !== this.data.name && theme.name !== this.data.copyright) {
				this.data.themename = theme.name;
			}


			this.$el.html(render("bginfo", this.data));

			// Focus when we're inserted so hitting Esc immediately works
			requestAnimationFrame(this.$el.focus.bind(this.$el));
		}
	});

	return View;
});