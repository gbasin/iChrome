define(["lodash", "jquery", "browser/api", "widgets/views/main"], function(_, $, Browser, WidgetView) {
	var languages = [
		["af", "Afrikaans"],
		["af", "Afrikaans"],
		["sq", "Albanian"],
		["ar", "Arabic"],
		["hy", "Armenian"],
		["az", "Azerbaijani"],
		["eu", "Basque"],
		["be", "Belarusian"],
		["bn", "Bengali"],
		["bs", "Bosnian"],
		["bg", "Bulgarian"],
		["my", "Burmese"],
		["ca", "Catalan"],
		["ceb", "Cebuano"],
		["zh-CN", "Chinese (Simplified)"],
		["zh-TW", "Chinese (Traditional)"],
		["hr", "Croatian"],
		["cs", "Czech"],
		["da", "Danish"],
		["nl", "Dutch"],
		["en", "English"],
		["eo", "Esperanto"],
		["et", "Estonian"],
		["tl", "Filipino"],
		["fi", "Finnish"],
		["fr", "French"],
		["gl", "Galician"],
		["ka", "Georgian"],
		["de", "German"],
		["el", "Greek"],
		["gu", "Gujarati"],
		["ht", "Haitian"],
		["ha", "Hausa"],
		["iw", "Hebrew"],
		["hi", "Hindi"],
		["hmn", "Hmong"],
		["hu", "Hungarian"],
		["is", "Icelandic"],
		["ig", "Igbo"],
		["id", "Indonesian"],
		["ga", "Irish"],
		["it", "Italian"],
		["ja", "Japanese"],
		["jv", "Javanese"],
		["kn", "Kannada"],
		["kk", "Kazakh"],
		["km", "Khmer"],
		["ko", "Korean"],
		["lo", "Lao"],
		["la", "Latin"],
		["lv", "Latvian"],
		["lt", "Lithuanian"],
		["mk", "Macedonian"],
		["mg", "Malagasy"],
		["ms", "Malay"],
		["ml", "Malayalam"],
		["mt", "Maltese"],
		["mi", "Maori"],
		["mr", "Marathi"],
		["mn", "Mongolian"],
		["no", "Norwegian"],
		["ny", "Nyanja"],
		["fa", "Persian"],
		["pl", "Polish"],
		["pt", "Portuguese"],
		["pa", "Punjabi"],
		["ro", "Romanian"],
		["ru", "Russian"],
		["sr", "Serbian"],
		["si", "Sinhala"],
		["sk", "Slovak"],
		["sl", "Slovenian"],
		["so", "Somali"],
		["es", "Spanish"],
		["su", "Sundanese"],
		["sw", "Swahili"],
		["sv", "Swedish"],
		["tg", "Tajik"],
		["ta", "Tamil"],
		["te", "Telugu"],
		["th", "Thai"],
		["tr", "Turkish"],
		["uk", "Ukrainian"],
		["ur", "Urdu"],
		["uz", "Uzbek"],
		["vi", "Vietnamese"],
		["cy", "Welsh"],
		["yi", "Yiddish"],
		["yo", "Yoruba"],
		["zu", "Zulu"]
	];

	return WidgetView.extend({
		events: {
			"input textarea.from": "exec",

			"change select.from, select.to": function() {
				this.model.saveData({
					from: this.from.val(),
					to: this.to.val()
				});

				this.exec();
			},

			"click button.swap": function() {
				var currFrom = this.from.val(),
					currTo = this.to.val();

				this.from.val(currTo);
				this.to.val(currFrom === "auto" ? (Browser.language === "pt-PT" ? "pt" : Browser.language) : currFrom);

				this.from.trigger("change");
			}
		},

		_lastTranslated: "",

		exec: _.throttle(function() {
			var toLang = this.to.val(),
				fromLang = this.from.val(),
				value = this.fromArea.val().trim();

			if (fromLang + "|" + toLang + "|" + value !== this._lastTranslated) {
				this._lastTranslated = fromLang + "|" + toLang + "|" + value;

				if (value === "") {
					this.status.text("");

					this.toArea.val("");

					return;
				}

				this.status.text(this.translate("translating"));

				this.model.getTranslation(value, fromLang, toLang, function(err, d) {
					// If we aren't still translating with the same parameters, abort
					if (fromLang + "|" + toLang + "|" + value !== this._lastTranslated) {
						return;
					}

					if (err || !d || !d.text) {
						this.status.text("");

						return this.toArea.val(this.translate("unknown"));
					}

					this.status.text(_.find(languages, [d.language])[1]);

					this.toArea.val(d.text);
				}.bind(this));
			}
		}, 500),

		initialize: function() {
			this.render();
		},

		onBeforeRender: function(data) {
			data.languages = languages;

			return data;
		},

		onRender: function(data) {
			this.to = this.$("select.to");
			this.status = this.$(".status");
			this.from = this.$("select.from");
			this.toArea = this.$("textarea.to");
			this.fromArea = this.$("textarea.from");

			this.from.val(data.from || "auto");
			this.to.val(data.to || (Browser.language === "pt-PT" ? "pt" : Browser.language));
		}
	});
});