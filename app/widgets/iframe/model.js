define(["widgets/model"], function(WidgetModel) {
	return WidgetModel.extend({
		defaults: {
			config: {
				height: 400,
				padding: "false",
				size: "variable",
				url: "https://en.m.wikipedia.org/"
			}
		}
	});
});