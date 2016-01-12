/**
 * The checkout dialog. An actual <dialog> can't be used here since the drop in UI might need to show an overlay.
 */
define(["lodash", "jquery", "i18n/i18n", "backbone", "core/auth", "core/render"], function(_, $, Translate, Backbone, Auth, render) {
	var View = Backbone.View.extend({
		tagName: "div",
		className: "checkout-container",

		events: {
			"click button.cancel": function() {
				this.el.animate([
					{ opacity: 1 },
					{ opacity: 0 }
				], {
					duration: 300,
					easing: "cubic-bezier(.4, 0, .2, 1)"
				});

				this.$(".dialog")[0].animate([
					{ transform: "scale(1)" },
					{ transform: "scale(.9)" }
				], {
					duration: 300,
					easing: "cubic-bezier(.4, 0, .2, 1)"
				}).onfinish = function() {
					this.remove();
				}.bind(this);

				return this;
			},

			"change input[name=pay]": function(e) {
				var msg = "";

				if (!this.isUpdating) {
					msg = Translate("settings.pro.checkout." + (e.currentTarget.value === "monthly" ? "monthly" : "yearly") + "_notice");
				}
				else if (Auth.get("plan") !== ("pro_" + e.currentTarget.value)) {
					msg = Translate("settings.pro.checkout.update_notice");
				}

				this.$("footer .notice span").text(msg);
			}
		},

		initialize: function(options) {
			if (!options || !options.container) {
				return this.remove();
			}

			this.isUpdating = !!options.update;

			this.$overlay = $('<div class="checkout-dialog-overlay></div>').appendTo(options.container);

			this.$el.html(render("settings/pro-checkout", {
				form: true,
				loading: true,
				updating: this.isUpdating
			})).appendTo(options.container);

			this.getClientToken();


			this.el.animate([
				{ opacity: 0 },
				{ opacity: 1 }
			], {
				duration: 300,
				easing: "cubic-bezier(.4, 0, .2, 1)"
			});

			this.$(".dialog")[0].animate([
				{ transform: "scale(.9)" },
				{ transform: "scale(1)" }
			], {
				duration: 300,
				easing: "cubic-bezier(.4, 0, .2, 1)"
			});
		},

		subscribe: function(paymentNonce) {
			var plan = "pro_" + this.$("input[name=pay]:checked").val();

			this.$el.html(render("settings/pro-checkout", {
				form: true,
				loading: true,
				updating: this.isUpdating
			}));

			Auth.ajax({
				method: "PUT",
				url: "/billing/v1/plan",
				data: {
					plan: plan,
					paymentNonce: paymentNonce
				},
				success: function(d) {
					if (d && d.success) {
						if (d.authToken) {
							Auth.set("token", d.authToken);
						}

						this.$el.html(render("settings/pro-checkout", {
							success: true,
							updating: this.isUpdating
						}));

						// Changes to the Pro state require a reload since it's used during initialization
						if (!this.isUpdating) {
							setTimeout(function() {
								location.reload();
							}, 4000);
						}
					}
					else {
						this.$el.html(render("settings/pro-checkout", {
							error: true,
							updating: this.isUpdating
						}));
					}
				}.bind(this)
			}).fail(function() {
				this.$el.html(render("settings/pro-checkout", {
					error: true,
					updating: this.isUpdating
				}));
			}.bind(this));
		},

		getClientToken: function() {
			// The Braintree library is loaded remotely
			require(["braintree"], function(braintree) {
				Auth.ajax({
					type: "GET",
					url: "/billing/v1/clientToken",
					success: function(d) {
						if (!d || !d.token) {
							return;
						}

						this.$el.html(render("settings/pro-checkout", {
							form: true,
							updating: this.isUpdating
						}));

						if (Auth.get("plan") === "pro_yearly") {
							this.$("input[name=pay][value=yearly]").prop("checked", true);
						}

						braintree.setup(d.token, "dropin", {
							enableCORS: true,
							container: this.$(".braintree-dropin"),
							onPaymentMethodReceived: function(obj) {
								this.subscribe(obj.nonce);
							}.bind(this)
						});
					}.bind(this)
				});
			}.bind(this));
		}
	});

	return View;
});