define(["widgets/model"], function(WidgetModel) {
	return WidgetModel.extend({
		refreshInterval: 6000000,
		defaults: {
			config: {
				user: "0",
				height: 400,
				size: "variable"
			}
		}
	});
});