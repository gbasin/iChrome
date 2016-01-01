/**
 * The Pro settings page
 */
define(["i18n/i18n", "settings/page", "settings/pro-checkout"], function(Translate, Page, Checkout) {
	var View = Page.extend({
		id: "pro",

		events: {
			"click button.upgrade": function() {
				new Checkout({
					container: this.$el
				});
			}
		},

		onInputChange: function(elm, name, val) {
			if (name === "pay") {
				this.$("footer .notice .recurring").text(Translate("settings.pro.checkout." + (val === "monthly" ? "monthly" : "yearly") + "_notice"));
			}
		},

		onBeforeRender: function(data) {
			if (this._rendered) {
				return false;
			}

			this._rendered = true;

			return data;
		}
	});

	return View;
});