define(["lodash", "jquery", "widgets/views/main"], function(_, $, WidgetView) {
	return WidgetView.extend({
		events: {
			"click .list .stock": function(e) {
				var stock = this.model.data.stocks[$(e.currentTarget).index()];

				this.model.activeSymbol = [stock.ticker, stock.exchange];

				this.model.set("state", "detail");
			}
		},

		onBeforeRender: function(data) {
			if (this.model.config.title) {
				data.title = this.model.config.title;
			}

			return data;
		}
	});
});