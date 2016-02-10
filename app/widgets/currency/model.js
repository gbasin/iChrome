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

		_cache: {},

		initialize: function() {
			if (this.data) {
				this.set("syncData", this.data);

				this.unset("data");
			}
		},

		getConversion: function(value, from, to, cb, ctx) {
			ctx = ctx || this;

			if (from === to) {
				return cb.call(ctx, value * 1);
			}


			if (this._cache[from + "-" + to] || this._cache[to + "-" + from]) {
				cb.call(ctx, this._cache[from + "-" + to] ? value * this._cache[from + "-" + to] : value / this._cache[to + "-" + from]);
			}
			else {
				$.getJSON("https://rate-exchange.herokuapp.com/fetchRate?from=" + from + "&to=" + to, function(d) {
					if (d && d.From === from && d.To === to && d.Rate) {
						this._cache[from + "-" + to] = parseFloat(d.Rate);

						cb.call(ctx, value * this._cache[from + "-" + to]);
					}
				}.bind(this));
			}
		}
	});
});