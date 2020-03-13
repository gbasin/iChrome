define(["widgets/model"], function(WidgetModel) {
	return WidgetModel.extend({
		defaults: {
			config: {
				height: 400,
				padding: "false",
				size: "variable",
				url: "https://mail.google.com/mail/mu/mp/?source=ig&mui=igh"
			}
		}
	});
});