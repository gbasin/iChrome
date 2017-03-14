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


			if (this._cache[from + "-" + to] || this._cache[to + "-" + from]) {
				cb.call(ctx, this._cache[from + "-" + to] ? value * this._cache[from + "-" + to] : value / this._cache[to + "-" + from]);
			}
			else {
				$.getJSON('https://query.yahooapis.com/v1/public/yql?format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%3D"' + from + to + '"', function(d) {
					if (d && d.query && d.query.results && d.query.results.rate && d.query.results.rate.Rate) {
						this._cache[from + "-" + to] = parseFloat(d.query.results.rate.Rate);

						cb.call(ctx, value * this._cache[from + "-" + to]);
					}
				}.bind(this));
			}
		}
	});
});