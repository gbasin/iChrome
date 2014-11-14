/*
 * The Unread widget.
 */
define(["jquery"], function($) {
	return {
		id: 6,
		size: 2,
		order: 6,
		interval: 120000,
		nicename: "unread",
		sizes: ["tiny", "small"],
		settings: [
			{
				type: "text",
				nicename: "user",
				label: "i18n.settings.account",
				help: "i18n.settings.account_help",
				placeholder: "i18n.settings.account_placeholder"
			},
			{
				type: "size"
			},
			{
				type: "radio",
				nicename: "open",
				label: "i18n.settings.open",
				options: {
					// Inbox and Gmail are product names, not labels so they shouldn't be translated
					inbox: "Inbox",
					gmail: "Gmail"
				}
			}
		],
		config: {
			size: "tiny",
			user: "0",
			open: "gmail"
		},
		data: {
			count: 0,
			messages: [
				{
					subject: "This is a sample message subject",
					excerpt: "And this is some sample message content!!"
				}
			]
		},
		refresh: function() {
			$.get("http://mail.google.com/mail/feed/atom/?authuser=" + (this.config.user || 0), function(d) {
				try {
					var d = $(d),
						count = parseInt(d.find("fullcount").text()),
						messages = [];

					d.find("entry").each(function(i) {
						if (i > 4) return;

						var msg = $(this);

						messages.push({
							subject: msg.find("title").text(),
							excerpt: msg.find("summary").text()
						});
					});

					this.data.count = count || 0;
					this.data.messages = messages;

					this.render();

					this.utils.saveData(this.data);
				}
				catch (e) {
					this.utils.error("An error occurred while trying to update the Unread widget!");
				}
			}.bind(this));
		},
		render: function() {
			var data = {
				count: this.data.count,
				messages: this.data.messages,
				user: (this.config.user || 0),
				inbox: this.config.open == "inbox"
			};

			if (data.count == 0) {
				data.label = this.utils.translate("unread_none");
			}
			else if (data.count == 1) {
				data.label = this.utils.translate("unread_one");
			}
			else {
				data.label = this.utils.translate("unread_many");
			}

			this.utils.render(data);
		}
	};
});