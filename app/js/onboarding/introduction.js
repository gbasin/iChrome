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

					this.trigger("next");
				});
			},

			"click button.skip": function() {
				this.transitionOut(function() {
					this.remove();

					this.trigger("skip");

					this.stopListening();
				});
			},

			"click .terms_checkbox": function() {
				var checked = this.$(".terms_checkbox:checked");
				var buttons = this.$(".tutorial-buttons button");
				if (checked.length > 0) {
					buttons.removeClass("invisible");
				}else{
					buttons.addClass("invisible");
				}
			}

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

		initialize: function() {
			this.render();

			this.$el.appendTo(document.body);

			Track.pageview("Widget onboarding: Screen 1", "/onboarding/widgets/screen1");
		},

		render: function() {
			this.$el.html(render("onboarding/introduction"));
		}
	});

	return View;
});