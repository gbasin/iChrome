define(["lodash", "jquery", "widgets/model"], function(_, $, WidgetModel) {
	return WidgetModel.extend({
		refreshInterval: 120000,

		defaults: {
			config: {
				size: "tiny",
				user: "0"
			},
			data: {
				count: 1,
				texts: 0,
				missed: 1,
				messages: [
					{
						type: "Call",
						date: "1 hour ago",
						from: "(123) 456-7890",
						excerpt: "This is a sample transcript from a voicemail"
					}
				]
			}
		},

		refresh: function() {
			$.get("https://www.google.com/voice/b/" + (this.config.user || 0) + "/inbox/recent/all/", function(d) {
				try {
					if (!(d && (d = $(d)) && (d = d.find("json")).length && (d = d.text()) && (d = JSON.parse(d)) && d.unreadCounts)) {
						return;
					}

					var data = {
						count: d.unreadCounts.all || 0,
						texts: d.unreadCounts.sms || 0,
						missed: d.unreadCounts.inbox || 0
					};

					var call = this.translate("call"),
						text = this.translate("text");

					data.messages = _(d.messages).filter("isRead").map(function(e) {
						return {
							from: e.displayNumber,
							date: e.relativeStartTime,
							excerpt: e.messageText || e.note || false,
							type: (e.type === 10 || e.type === 11) ? text : call
						};
					}).compact().take(4).value();

					this.saveData(data);
				}
				catch (e) {
					this.error();
				}
			}.bind(this));
		}
	});
});