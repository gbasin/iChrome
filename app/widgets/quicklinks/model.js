define(["lodash", "widgets/model"], function(_, WidgetModel) {
	return WidgetModel.extend({
		widgetClassname: "tabbed",

		defaults: {
			config: {
				view: "icons",
				title: "i18n.name"
			},
			data: {
					sites: [{
					title: "Google",
					url: "http://www.google.com/",
					icon: "google"
				}, {
					title: "Facebook",
					url: "http://www.facebook.com/",
					icon: "facebook"
				}, {
					title: "Youtube",
					url: "http://www.youtube.com/",
					icon: "youtube"
				}, {
					title: "Amazon",
					url: "https://amzn.to/2NQaf8A",
					icon: "amazon"
				}, {
					title: "Wikipedia",
					url: "http://www.wikipedia.org/",
					icon: "wikipedia"
				}]
			}
		}
	});
});