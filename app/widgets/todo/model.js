define(["widgets/model"], function(WidgetModel) {
	return WidgetModel.extend({
		widgetClassname: "tabbed",
		
		defaults: {
			config: {
				title: "i18n.title",
				size: "variable",
				tags: [],
				font: "dark"
			},
			syncData: {
				items: [
					{
						title: "These are sample to-do items"
					},
					{
						title: "This one is important",
						important: true
					},
					{
						title: "This one is done",
						done: true
					},
					{
						title: "And this one is undone"
					}
				]
			}
		},

		initialize: function() {
			if (typeof this.data === "object" && this.data.items) {
				this.saveSyncData(this.data);

				delete this.data;
			}

			WidgetModel.prototype.initialize.call(this);
		}
	});
});