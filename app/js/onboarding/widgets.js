/**
 * The onboarding widget guide
 */
define(["jquery", "backbone", "i18n/i18n", "core/analytics", "core/render"], function($, Backbone, Translate, Track, render) {
	var View = Backbone.View.extend({
		tagName: "div",
		className: "showcase blue widget-settings",

		events: {
			"click button.next": function() {
				this.showSecondScreen();
			},

			"click button.done": function() {
				this.transitionOut(function() {
					this.remove();

					this.$targetEl.parent().removeClass("hovered");

					this.trigger("next");
				});
			},

			"click button.skip": function() {
				this.transitionOut(function() {
					this.remove();

					this.trigger("skip");

					this.stopListening();
				});
			}
		},

		transitionIn: function() {
			this.$el.css("display", "");

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

		transitionOut: function(cb) {
			if (!cb) {
				cb = function() {};
			}

			this.el.animate([{
				opacity: 1,
				pointerEvents: "none"
			}, {
				opacity: 0,
				pointerEvents: "none"
			}], {
				duration: 300,
				easing: "cubic-bezier(.4, 0, 1, 1)"
			}).onfinish = cb.bind(this);
		},


		showSecondScreen: function() {
			this.$targetEl = this.$targetEl.siblings(".handle");

			this.render(true);

			this.transitionIn();

			Track.pageview("Widget onboarding: Screen 2", "/onboarding/widgets/screen2");
		},

		handleWidgetSettings: function() {
			this.transitionOut(function() {
				this.$el.css("display", "none");
			});

			$(".modal-overlay.widget-settings").addClass("tutorial").html('<p class="caption">' + Translate("onboarding.widgets.settings") + '</p>');

			Track.pageview("Widget onboarding: Settings screen", "/onboarding/widgets/settings");

			this.listenToOnce(this.widgetView, "settings:hide", this.showSecondScreen);
		},

		initialize: function(retry) {
			retry = retry === true;

			this.$targetEl = $(".widget.sitelink > .settings").first();
			if (this.$targetEl.length === 0) {
				this.$targetEl =  $(".widget > .settings").first();
			}


			if (!this.$targetEl.length && !retry) {
				if (retry) {
					this.trigger("next");
				}
				else {
					setTimeout(this.initialize.bind(this, true), 1000);
				}

				return;
			}

			this.widgetView = this.$targetEl.parent().data("view");

			this.listenToOnce(this.widgetView, "settings:show", this.handleWidgetSettings);

			this.render();

			this.$el.appendTo(document.body);

			this.transitionIn();

			Track.pageview("Widget onboarding: Screen 1", "/onboarding/widgets/screen1");
		},

		render: function(secondScreen) {
			var offset = this.$targetEl.offset();

			this.$el.css({
				top: offset.top + this.$targetEl.height() / 2 ,
				left: offset.left + this.$targetEl.width() / 2
			}).html(render("onboarding/widgets", {
				screenOne: !secondScreen,
				screenTwo: !!secondScreen
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

			this.$targetEl.parent().addClass("hovered");
		}
	});

	return View;
});