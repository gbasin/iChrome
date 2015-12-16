/**
 * The snackbar view
 *
 * This is nearly 100% Material spec compliant (except positioning, centered just doesn't work).
 *
 * It accepts text, a timeout, and a single button and callback. This does _not_ handle multiple snackbars properly.
 */
define(["jquery", "lodash", "backbone"], function($, _, Backbone) {
	var openSnackbar;

	var Snackbar = Backbone.View.extend({
		tagName: "div",
		className: "snackbar",

		events: {
			"click button": function() {
				this.cb();

				this.trigger("actionClick");
			}
		},

		close: function(cb) {
			if (this._isPending) {
				this._isPendingClose = true;

				this._pendingCloseCB = cb;

				return;
			}

			this.animationPlayer.onfinish = function() {
				this.remove();

				this.trigger("destroy");

				if (openSnackbar === this) {
					openSnackbar = null;
				}

				if (typeof cb === "function") {
					cb();
				}
			}.bind(this);

			// If we're just starting to open, don't reverse the whole animation, just remove
			if (this.animationPlayer.currentTime > 50) {
				this.animationPlayer.reverse();
			}
			else {
				this.animationPlayer.pause();

				this.animationPlayer.onfinish();
			}

			return this;
		},

		text: "",
		cb: _.noop,
		duration: 6000,

		constructor: function(options, cb) {
			this.cid = _.uniqueId("view");

			this._ensureElement();

			if (typeof options === "string") {
				this.text = options;
			}
			else {
				_.assign(this, options);
			}

			if (typeof cb === "function") {
				this.cb = cb;
			}

			if (openSnackbar) {
				this._isPending = true;

				openSnackbar.close(function() {
					if (this._isPendingClose) {
						this.remove();

						if (typeof this._pendingCloseCB === "function") {
							this._pendingCloseCB();
						}

						return;
					}

					this.initialize();
				}.bind(this));
			}
			else {
				this.initialize();
			}

			openSnackbar = this;
		},

		initialize: function() {
			this._isPending = false;

			$('<span class="text"></span>').text(this.text).appendTo(this.$el);

			if (this.button && this.button.text) {
				var btn = document.createElement("button");

				btn.setAttribute("type", "button");
				btn.setAttribute("class", "material flat " + (this.button.classes || "green"));

				btn.textContent = this.button.text;

				this.el.appendChild(btn);
			}

			this.$el.appendTo(document.body).on("click", this.close.bind(this));


			// Animate into view
			this.animationPlayer = this.el.animate([{
				opacity: 0,
				transform: "translateY(40px)"
			}, {
				opacity: 1,
				transform: "translateY(0)"
			}], {
				duration: 300,
				easing: "cubic-bezier(.165, .84, .44, 1)"
			});

			setTimeout(this.close.bind(this), this.duration);
		}
	});

	return Snackbar;
});