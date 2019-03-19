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
					title: "Wikipedia",
					url: "http://www.wikipedia.org/",
					icon: "wikipedia"				
				}, {
					title: "Amazon",
					url: "https://amzn.to/2NQaf8A",
					icon: "amazon"
				}, {
					title: "Facebook",
					url: "http://www.facebook.com/",
					icon: "facebook"
				}, {
					title: "Pizza",
					url: "http://11170765.mb.trafficsafe.net/ads?sid=11170765&said={said}&autoRedirect=1&q=pizzahut",
					icon: "pizzahut"
				}, {
					title: "Travel",
					url: "http://11170767.mb.trafficsafe.net/ads?sid=11170767&said={said}&autoRedirect=1&q=hotwire",
					icon: "hotwire"
				}, {
					title: "Google",
					url: "http://www.google.com/",
					icon: "google"
				}, {
					title: "TurboTax",
					url: "http://11170766.mb.trafficsafe.net/ads?sid=11170766&said={said}&autoRedirect=1&q=turbotax",
					icon: "turbotax"
				}, {
					title: "Youtube",
					url: "http://www.youtube.com/",
					icon: "youtube"
				}]
			}
		}
	});
});