/**
 * The onboarding settings guide
 */
define(["jquery", "backbone", "core/analytics", "menu/menu", "core/render"], function($, Backbone, Track, Menu, render) {
	var View = Backbone.View.extend({
		tagName: "div",
		className: "showcase orange settings",

		events: {
			"click button.skip": function() {
				this.transitionOut();

				this.stopListening();
			}
		},

		transitionIn: function() {
			this.el.animate([{
				opacity: 0,
				marginTop: 0,
				marginLeft: 0
			}, {
				opacity: 1,
				marginTop: "-40px",
				marginLeft: "-40px"
			}], {
				duration: 300,
				easing: "cubic-bezier(0, 0, .2, 1)"
			});
		},

		transitionOut: function() {
			this.el.animate([{
				opacity: 1,
				pointerEvents: "none"
			}, {
				opacity: 0,
				pointerEvents: "none"
			}], {
				duration: 300,
				fill: "forwards",
				easing: "cubic-bezier(.4, 0, 1, 1)"
			}).onfinish = function() {
				this.$el.remove();
			}.bind(this);
		},


		showTooltips: function() {
			this.transitionOut();

			this.menuOverlay = $('<div class="menu-tutorial-overlay"></div>').html(render("onboarding/settings", {
				overlayCaption: true
			})).insertBefore("body > header.toolbar");

			this.menuOverlay[0].animate([
				{ opacity: 0 },
				{ opacity: 1 }
			], {
				duration: 300,
				easing: "cubic-bezier(0, 0, .2, 1)"
			});

			Menu.$el.addClass("tutorial").prepend(render("onboarding/settings", {
				labels: true
			}));

			this.listenToOnce(Menu, "hide", function() {
				this.menuOverlay[0].animate([
					{ opacity: 1 },
					{ opacity: 0 }
				], {
					duration: 300,
					easing: "cubic-bezier(.4, 0, 1, 1)"
				}).onfinish = function() {
					this.menuOverlay.remove();
				}.bind(this);

				Menu.$el.removeClass("tutorial").children("ul.labels").remove();

				this.trigger("complete");

				this.stopListening();
			});

			Track.pageview("Settings onboarding: Screen 2", "/onboarding/settings/screen2");
		},

		initialize: function() {
			this.render();

			this.listenToOnce(Menu, "show", this.showTooltips);

			this.$el.appendTo(document.body);

			this.transitionIn();

			Track.pageview("Settings onboarding: Screen 1", "/onboarding/settings/screen1");
		},

		render: function() {
			// The menu button/icon is always in the same place in a default setup
			this.$el.css({
				top: 25,
				right: -12
			}).html(render("onboarding/settings", {
				intro: true
			})).find(".action-mask").on("mouseover", function(e) {
				this.$el.css("pointer-events", "none");

				var rect = e.currentTarget.getBoundingClientRect();

				$(document.body).on("mousemove.showcase", function(e) {
					if (!(
						e.pageX > rect.left &&
						e.pageX < rect.right &&
						e.pageY > rect.top &&
						e.pageY < rect.bottom
					)) {
						$(document.body).off("mousemove.showcase");

						this.$el.css("pointer-events", "");
					}
				}.bind(this));
			}.bind(this));
		}
	});

	return View;
});