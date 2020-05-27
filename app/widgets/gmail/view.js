define(["widgets/views/main"], function(WidgetView) {
	return WidgetView.extend({
		isFrame: true,

		onBeforeRender: function(data) {
			if ( (this.model.config.type || "new") === "old" ) {
				data.url = "https://mail.google.com/mail/mu/mp/?authuser=" + (this.model.config.user || 0);	
			} else{
				data.url = "https://mail.google.com/mail/u/" + (this.model.config.user || 0) + "/x/" + (new Date().getTime())  + "/?f=1";
			}

			return data;
		},

		onRender: function() {
			this.el.style.height = (this.model.config.height || 400) + "px";
		}
	});
});