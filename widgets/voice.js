/*
 * The Voice widget.
 */
define(["jquery"], function($) {
	return {
		id: 22,
		size: 2,
		order: 6,
		name: "Voice",
		interval: 120000,
		nicename: "voice",
		sizes: ["tiny", "small"],
		desc: "Displays the current number of missed calls and texts in your Google Voice account.",
		settings: [
			{
				type: "text",
				nicename: "user",
				label: "Account ID",
				help: "If you're signed into multiple accounts, this is the number right after \"/b/\" in the URL when on Google Voice.<br /><br />For example, if you're signed into two accounts, jsmith1@gmail.com and jsmith2@gmail.com, the \"/b/\" value for jsmith2@gmail.com would be 1 since it's the second account (counting from zero) that you're signed into.",
				placeholder: "Your \"/b/\" value"
			},
			{
				type: "size"
			}
		],
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
						},
						messages = [],
						id, msg, type;

					for (id in d.messages) {
						msg = d.messages[id];

						if (messages.length > 4 || !msg || msg.isRead == true) continue;

						switch (msg.type) {
							case 10: case 11: 
								type = "Text message";
							break;
							default: 
								type = "Call";
							break;
						}

						messages.push({
							from: msg.displayNumber || "Unknown",
							date: msg.relativeStartTime || "Unknown Date",
							excerpt: msg.messageText || msg.note || false,
							type: type || "Call"
						});

						type = false;
					}

					data.messages = messages;

					this.data = data;

					this.render();

					this.utils.saveData(this.data);
				}
				catch (e) {
					this.utils.error("An error occurred while trying to update the Voice widget!");
				}
			}.bind(this));
		},
		render: function() {
			var data = {
				count: this.data.count,
				texts: this.data.texts,
				missed: this.data.missed,
				user: (this.config.user || 0),
				messages: this.data.messages
			};

			this.utils.render(data);
		}
	};
});