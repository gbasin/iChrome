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
			// this.getWordOfDay(function(err, word) {
			// 	if (!err && word) {
			// 		this.getDefinition(word, function(err, definition) {
			// 			if (!err && definition) {
			// 				this.saveData({
			// 					defaultWord: word,
			// 					definition: definition
			// 				});
			// 			}
			// 		});
			// 	}
			// });
		}
	});
});