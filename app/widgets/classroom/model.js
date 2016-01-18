define(["widgets/model"], function(WidgetModel) {
	return WidgetModel.extend({
		defaults: {
			config: {
				user: "0",
				mode: "student",
				size: "variable"
			}
		}
	});
});