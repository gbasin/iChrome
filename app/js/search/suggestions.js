/**
 * This handles and fetches search suggestions
 */
define(["jquery", "underscore", "browser/api", "backbone", "core/analytics", "i18n/i18n"], function($, _, Browser, Backbone, Track, Translate) {
	var captureNotice = '<div class="capture-notice">' + Translate("toolbar.suggestions.capture_notice") + '</div>';

	var Suggestions = Backbone.View.extend({
			tagName: "div",
			className: "suggestions",
			events: {
				"mousedown .suggestion": function(e) {
					Track.event("Search", "Suggestions", "Click");

					this.trigger("select", e.currentTarget.textContent);
				}
			},
			current: 0,
			visible: false,

			/**
			 * Determines if the provided `val` is a URL, returning the normalized URL if
			 * it is and false if it isn't
			 *
			 * @param   {String}          val  The value entered in the search box
			 * @return  {Boolean|String}       `false` if the text isn't a URL and a normalized URL if it is
			 */
			isURL: function(val) {
				val = val.trim().toLowerCase();

				// If there are spaces, this isn't a URL
				if (val.indexOf(" ") > -1) {
					return false;
				}

				if (val.indexOf("http://") === 0 ||
					val.indexOf("https://") === 0 ||
					val.indexOf("ftp://") === 0 ||
					val.indexOf("file://") === 0 ||
					val.indexOf("chrome://") === 0 ||
					val.indexOf("chrome-extension://") === 0 ||
					val.indexOf("about:") === 0
				) {
					return val;
				}

				// If the input ends with a slash or matches an ab.cd.ef format, say it's a URL
				if (val.slice(-1) === "/" || /^([a-z]+\.)+[a-z]{2,}(?!\.)\b/.test(val)) {
					return "http://" + val;
				}

				return false;
			},

			initialize: function() {
				if (Browser.storage.showOmniboxNotice === "true") {
					this._showingNotice = true;

					this.on("element:updated", function() {
						if (this._showingNotice) {
							this.$el.html(captureNotice);

							this.show();
						}
					});
				}
			},

			load: function(val) {
				if (val) {
					this.visible = true;

					$.ajax({
						url: "https://www.google.com/complete/search?callback=?",
						dataType: "jsonp",
						data:{
							q: val,
							client: "youtube",
							hl: navigator.language
						},
						success: function(d) {
							var html = "";

							if (this.isURL(val)) {
								html = '<div class="suggestion url active">' + _.escape(val) + '<span class="subtext">' + Translate("toolbar.suggestions.url_subtext") + '</span></div>';
							}
							else {
								html = '<div class="suggestion active">' + _.escape(val) + '</div>';
							}

							var num = 1;

							d[1].forEach(function(e) {
								if (num > 10) {
									return;
								}

								if (e[0] !== val) {
									html += '<div class="suggestion' + (this.isURL(e[0]) ? " url" : "") + '">' + _.escape(e[0]) + '</div>';

									num++;
								}
							}.bind(this));

							this.current = 0;

							if (this._showingNotice) {
								delete Browser.storage.showOmniboxNotice;

								html += captureNotice;
							}

							this.$el.html(html);

							if (this.visible) {
								this.show(); // If hide() has been called since the request has been sent this will be false, therefore the list shouldn't be shown
							}
						}.bind(this)
					});
				}
			},
			show: function() {
				this.visible = true;

				this.$el.addClass("visible");

				this.trigger("show");
			},
			hide: function() {
				this.visible = false;

				this.$el.removeClass("visible");

				this.trigger("hide");
			},
			setFocus: function(which) {
				var active;

				if (which === "next") {
					this.clearFocus(true);

					this.current++;

					active = this.$("div").eq(this.current).addClass("active");

					if (!active.length) {
						active = this.$("div:first").addClass("active");

						this.current = 0;
					}
				}
				else if (which === "prev") {
					this.clearFocus(true);

					this.current--;

					active = this.$("div").eq(this.current).addClass("active");
				}
				else if (typeof which === "number") {
					this.clearFocus();

					active = this.$("div").eq(which).addClass("active");

					this.current = which;
				}

				this.trigger("focuschange", active[0].childNodes[0].nodeValue);
			},
			clearFocus: function(skipVar) {
				this.$("div.active").removeClass("active");

				if (!skipVar) {
					this.current = 0; // If we're in the middle of changing the focus, preserve the old current val
				}
			}
		});

	return Suggestions;
});