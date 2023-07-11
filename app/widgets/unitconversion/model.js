define(["jquery", "lodash", "browser/api", "widgets/model"], function($, _, Browser, WidgetModel) {
	return WidgetModel.extend({
		widgetClassname: "tabbed",

		qty: 1,
		result_value: "55.55",
		result_currency: "GBP",
		// category: "Select a category...",

		defaults: {
			config: {
				title: "i18n.default_title",
				category: ""
			},
			data: {
			}
		},

		/**
		 * We override this so we only refresh once on init
		 */
		initialize: function() {
			if (this.config) {
				if (this.config.from) {
					this.from = this.config.from.k;
				}
				if (this.config.to) {
					this.to = this.config.to.k;
				}
				this.area = this.config.area;
			}	
		}
	});
});