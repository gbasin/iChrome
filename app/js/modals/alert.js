/**
 * This is the alert dialog view
 *
 * It follows the Material design guidelines so it only allows "boolean buttons" and basic content.
 *
 * The element is displayed immediately and destroyed once an option is chosen
 */
define(["jquery", "lodash", "backbone", "i18n/i18n", "core/render"], function($, _, Backbone, Translate, render) {
	var Alert = Backbone.View.extend({
		tagName: "dialog",

		events: {
			"click button": function(e) {
				var positive = e.currentTarget.getAttribute("data-action") == "positive";

				// If this is a confirmation, don't call the cb on failure
				if (this.cb && (!this.confirm || positive)) {
					this.cb(positive);
				}

				this.trigger("select", positive);

				this.close();
			}
		},

		close: function() {
			this.el.open = false;

			setTimeout(function() {
				this.el.open = true;

				this.el.close();

				this.stopListening();

				this.$el.remove();

				this.trigger("destroy");
			}.bind(this), 300);

			return this;
		},

		initialize: function() {
			if (this.confirm) {
				if (!this.title) {
					this.title = Translate("alert.confirm_title");
				}

				this.buttons = this.buttons || {};

				if (!this.buttons.negative) {
					this.buttons.negative = Translate("alert.confirm_cancel");
				}

				if (!this.buttons.positive) {
					this.buttons.positive = Translate("alert.confirm_continue");
				}
			}

			var data = {
				buttons: [],
				title: this.title,
				html: this.html || undefined,
				contents: this.contents || undefined
			};

			var btns = this.buttons || {};

			if (btns.negative) {
				data.buttons.push({
					action: "negative",
					label: btns.negative
				});
			}

			data.buttons.push({
				class: btns.positive ? "blue" : "",
				action: "positive",
				label: btns.positive
			});

			this.$el.addClass(this.classes).html(render("alert", data)).appendTo(document.body);


			// This method is necessary for the transitions to animate
			this.el.showModal();

			this.$el.addClass("no-transition");

			this.el.open = false;

			setTimeout(function() {
				this.$el.removeClass("no-transition");

				this.el.open = true;
			}.bind(this), 0);

			// Chrome creates a new focus layer for dialogs, focusing the first
			// focusable element.  This disables that.
			this.$("a, button, :input, [tabindex]").first().blur();
		}
	});

	return function(options, cb) {
		if (typeof options !== "object") {
			options = {
				contents: Array.isArray(options) ? options : [options]
			};
		}

		if (cb) {
			options.cb = cb;
		}

		return new (Alert.extend(options))();
	};
});