/**
 * The Pro settings page
 */
define([
	"lodash", "moment", "core/auth", "modals/alert", "i18n/i18n", "settings/page", "core/uservoice", "settings/pro-checkout"
], function(_, moment, Auth, Alert, Translate, Page, UserVoice, Checkout) {
	if (!Auth.isPro) {
		var PromoView = Page.extend({
			id: "pro",
			className: "promo",

			events: {
				"click button.upgrade": function() {
					new Checkout({
						container: this.$el
					});
				},

				"click header .business a": function(e) {
					e.preventDefault();

					UserVoice("show", { mode: "contact" });
				}
			},

			onInputChange: _.noop,

			onBeforeRender: function(data) {
				if (this._rendered) {
					return false;
				}

				this._rendered = true;

				return data;
			}
		});

		return PromoView;
	}

	var View = Page.extend({
		id: "pro",

		events: {
			"click section.plan button.update-plan, section.plan button.update-billing": function() {
				new Checkout({
					update: true,
					container: this.$el
				});
			},

			"click section.plan button.cancel": function() {
				Alert({
					confirm: true,
					contents: [Translate("settings.pro.plan.cancel_notice"), Translate("settings.pro.plan.cancel_notice2")]
				}, function() {
					Auth.ajax({
						method: "PUT",
						url: "/billing/v1/plan",
						data: {
							plan: "free"
						},
						success: function(d) {
							if (!d || !d.authToken) {
								return;
							}

							Auth.set("token", d.authToken);

							location.reload();
						}
					});
				});
			}
		},

		// If no properties are provided then all changes will be monitored
		monitorProps: ["nonExistentProperty"],

		loadPlan: function() {
			Auth.ajax({
				method: "GET",
				url: "/billing/v1/plan",
				success: function(d) {
					if (!d) {
						return;
					}

					this._subscriptionInfo = {
						status: Translate("settings.pro.plan.status_" + d.status),
						subscriptionDate: moment(d.subscribed).format("LL"),
						paidThrough: moment(d.paidThrough).format("LL"),
						nextBill: Translate("settings.pro.plan.next_bill_value", d.nextBillAmount * 1, moment(d.paidThrough).format("LL"))
					};

					this.render();
				}.bind(this)
			});
		},

		initialize: function() {
			this.listenTo(Auth, "change", function() {
				this._subscriptionInfo = null;

				this.render();

				this.loadPlan();
			});

			this.loadPlan();
		},

		onInputChange: _.noop,

		onBeforeRender: function() {
			var plan = (Auth.get("plan") || "").replace("pro_", "");

			var ret = {
				uneditable: plan && plan !== "monthly" && plan !== "yearly",
				desc: Translate("settings.pro.plan.desc", Translate("settings.pro.plan.types." + plan))
			};

			if (this._subscriptionInfo) {
				_.assign(ret, this._subscriptionInfo);
			}

			return ret;
		}
	});

	return View;
});