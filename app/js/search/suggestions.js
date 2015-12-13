/**
 * This handles and fetches search suggestions
 */
define(["jquery", "underscore", "backbone", "core/analytics"], function($, _, Backbone, Track) {
	var Suggestions = Backbone.View.extend({
			tagName: "div",
			className: "suggestions",
			events: {
				"mousedown .suggestion": function(e) {
					Track.event("Search", "Suggestions", "Click");

					this.trigger("select", e.currentTarget.innerText);
				}
			},
			current: 0,
			visible: false,
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
							var html = '<div class="suggestion active">' + _.escape(val) + '</div>',
								num = 1;

							d[1].forEach(function(e) {
								if (num > 10) return;

								if (e[0] !== val) {
									html += '<div class="suggestion">' + _.escape(e[0]) + '</div>';

									num++;
								}
							});

							this.current = 0;

							this.$el.html(html);

							if (this.visible) this.show(); // If hide() has been called since the request has been sent this will be false, therefore the list shouldn't be shown
						}.bind(this)
					});
				}
			},
			show: function() {
				this.visible = true;

				this.$el.addClass("visible");
			},
			hide: function() {
				this.visible = false;

				this.$el.removeClass("visible");
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

				this.trigger("focuschange", active.text());
			},
			clearFocus: function(skipVar) {
				this.$("div.active").removeClass("active");

				if (!skipVar) this.current = 0; // If we're in the middle of changing the focus, preserve the old current val
			}
		});

	return Suggestions;
});