define(["lodash", "jquery", "widgets/views/settings", "lib/parseurl", "jquery.serializejson"], function(_, $, WidgetView, parseUrl) {
	return WidgetView.extend({
		events: {
			"click header button.save": function() {
				var add = this.$("form").find(".feeds input.add");
				var url = add.val();
				if (!_.isEmpty(url)) {
					this.addUrl(url, function() {
						this.serialize();
					}.bind(this));

					return;
				}

				this.serialize();
			},

			"keydown label.input > input": function(e) {
				if (e.which === 13) {
					this.serialize();
				}
			},

			"click .feeds li .delete": function(e) {
				e.currentTarget.parentNode.parentNode.removeChild(e.currentTarget.parentNode);
			},

			"keydown .feeds input.add": function(e) {
				if (e.which === 13) {
					var url = e.currentTarget.value;
					e.currentTarget.value = "";
					this.addUrl(url);
				}
			}
		},

		addUrl: function(urlText, callback) {
			var url = parseUrl(urlText);

			var itm = $('<li>' +
				'<button type="button" class="material toggle delete"><svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-' +
				'3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg></button>' +

				'<input type="text" name="feeds[][name]" class="name" placeholder="' + this.translate("settings.feed_name_placeholder") + '" />' +

				'<input type="text" name="feeds[][url]" class="url" placeholder="' + this.translate("settings.feed_url_placeholder") + '" />' +
				'</li>');

			itm.children(".name").val((new URL(url)).host.replace(/^www\./, "").replace(/\.com$/, ""));

			itm.children(".url").val(url);

			$.getJSON("https://cloud.feedly.com/v3/feeds/feed%2F" + encodeURIComponent(url), function(d) {
				if (d && d.title) {
					itm.children(".name").val(d.title);
				}
			})
			.always(function() {
				if (typeof callback !== 'undefined') {
					callback();
				}
			});

			this.$(".feeds ul").append(itm).scrollTop(this.$(".feeds ul")[0].scrollHeight);

			itm.children(".name").focus();
		},

		/**
		 * Serializes and saves the contents of the settings form
		 */
		serialize: function() {
			this.model.set({
				state: "default",
				config: _.assign({}, this.model.config, this.$("form").serializeJSON())
			});
		},


		initialize: function() {
			this.listenTo(this.model, "change:config change:data", _.ary(this.render, 0));

			this.render();
		}
	});
});