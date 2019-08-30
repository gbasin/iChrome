/**
 * The introduction modal
 */
define(["jquery", "backbone", "i18n/i18n", "core/analytics", "core/render"], function($, Backbone, Translate, Track, render) {
	var View = Backbone.View.extend({
		tagName: "div",
		className: "onboarding-flat blue widget-introduction",

		events: {
			"click button.done": function() {
				this.transitionOut(function() {
					this.remove();

					//this.$targetEl.parent().removeClass("hovered");

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

		/*transitionIn: function() {
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
		},*/

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


		/*showSecondScreen: function() {
			this.$targetEl = this.$targetEl.siblings(".handle");

			this.render(true);

			this.transitionIn();

			Track.pageview("Widget onboarding: Screen 2", "/onboarding/widgets/screen2");
		},*/

		/*handleWidgetSettings: function() {
			this.transitionOut(function() {
				this.$el.css("display", "none");
			});

			$(".modal-overlay.widget-settings").addClass("tutorial").html('<p class="caption">' + Translate("onboarding.widgets.settings") + '</p>');

			Track.pageview("Widget onboarding: Settings screen", "/onboarding/widgets/introduction");

			this.listenToOnce(this.widgetView, "settings:hide", this.showSecondScreen);
		},*/

		initialize: function() {
			/*retry = retry === true;

			this.$targetEl = $(".widget.weather > .settings").first();

			if (!this.$targetEl.length && !retry) {
				if (retry) {
					this.trigger("complete");
				}
				else {
					setTimeout(this.initialize.bind(this, true), 1000);
				}

				return;
			}

			this.widgetView = this.$targetEl.parent().data("view");

			this.listenToOnce(this.widgetView, "settings:show", this.handleWidgetSettings);*/

			this.render();

			this.$el.appendTo(document.body);

			//this.transitionIn();

			Track.pageview("Widget onboarding: Screen 1", "/onboarding/widgets/screen1");
		},

		render: function() {
			this.$el.html(render("onboarding/introduction"));
		}
	});

	return View;
});