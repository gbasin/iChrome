define(["widgets/model"], function(WidgetModel) {
	return WidgetModel.extend({
		defaults: {
			config: {
				user: "0",
				height: 400,
				size: "variable",
				type: "new"
			}
		}
	});
});