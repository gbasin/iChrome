define(["lodash", "jquery", "browser/api", "widgets/views/main"], function(_, $, Browser, WidgetView) {
	return WidgetView.extend({
		events: {
		},

		onBeforeRender: function(data) {
			return data;
		}
	});
});