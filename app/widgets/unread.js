/*
 * The Unread widget.
 */
define(["jquery"], function($) {
	return {
		id: 6,
		size: 2,
		order: 6,
		name: "Unread",
		interval: 120000,
		nicename: "unread",
		sizes: ["tiny", "small"],
		desc: "Displays the current number of unread emails in your Gmail inbox.",
		settings: [
			{
				type: "text",
				nicename: "user",
				label: "Account ID",
				help: "If you're signed into multiple accounts, this is the \"authuser=\" value.<br /><br />For example, if you're signed into two accounts, jsmith1@gmail.com and jsmith2@gmail.com, the \"authuser\" value for jsmith2@gmail.com would be 1 since it's the second account (counting from zero) that you're signed into.",
				placeholder: "Your \"authuser=\" value"
			},
			{
				type: "size"
			},
			{
				type: "text",
				nicename: "label",
				label: "Label",
				help: "This is the label that's shown under the unread message count where <b>%m</b> is either <b>message</b> or <b>messages</b>.",
				placeholder: "unread %m"
			},
			{
				type: "radio",
				nicename: "open",
				label: "When clicked open",
				options: {
					inbox: "Inbox",
					gmail: "Gmail"
				}
			}
		],
		config: {
			size: "tiny",
			user: "0",
			label: "unread %m",
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
				label: "messages",
				messages: this.data.messages,
				user: (this.config.user || 0),
				inbox: this.config.open == "inbox"
			};

			var m = "emails";

			if (data.count == 1) {
				m = "email";
			}

			data.label = (this.config.label || "unread %m").replace(/%m/g, m);

			this.utils.render(data);
		}
	};
});