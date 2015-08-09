/**
 * This is the alert dialog view
 *
 * It follows the Material design guidelines so it only allows "boolean buttons" and basic content.
 *
 * The element is displayed immediately and destroyed once an option is chosen
 */
define(["jquery", "lodash", "backbone", "core/render"], function($, _, Backbone, render) {
	var Alert = Backbone.View.extend({
		tagName: "dialog",

		events: {
			"click button": function(e) {
				var positive = e.currentTarget.getAttribute("data-action") == "positive";

				if (this.cb) {
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
			var data = {
				buttons: [],
				title: this.title,
				contents: this.contents
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

			this.$el.addClass((this.classes || []).join(" ")).html(render("alert", data)).appendTo(document.body);


			// This method is necessary for the transitions to animate
			this.el.showModal();

			this.$el.addClass("no-transition");

			this.el.open = false;

			setTimeout(function() {
				this.$el.removeClass("no-transition");

				this.el.open = true;
			}.bind(this), 0);

			this.$("button:first").blur();
		}
	});

	return function(options, cb) {
		if (typeof options !== "object") {
			options = {
				contents: options
			};
		}

		if (cb) {
			options.cb = cb;
		}

		return new (Alert.extend(options))();
	};
});