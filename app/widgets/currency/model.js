define(["lodash", "jquery", "widgets/model"], function(_, $, WidgetModel) {
	return WidgetModel.extend({
		defaults: {
			syncData: {
				from: "USD",
				to: "EUR",
				recentFrom: ["USD"],
				recentTo: ["EUR"]
			}
		},

		rates: null,

		initialize: function() {
			if (typeof this.data === "object" && this.data.from) {
				this.set("syncData", this.data);

				this.unset("data");
			}
		},

		getConversion: function(value, from, to, cb, ctx) {
			ctx = ctx || this;

			if (from === to) {
				return cb.call(ctx, value * 1);
			}

			if (this.rates) {
				cb.call(ctx, Math.round((value / this.rates[from]) * this.rates[to] * 10000) / 10000);
			}
			else {
				$.getJSON("https://api.ichro.me/currency/v1/rates", function(d) {
					if (d) {
						this.rates = d;

						cb.call(ctx, Math.round((value / this.rates[from]) * this.rates[to] * 10000) / 10000);
					}
				}.bind(this));
			}
		}
	});
});