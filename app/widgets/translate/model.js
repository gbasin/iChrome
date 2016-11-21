define(["jquery", "lodash", "widgets/model"], function($, _, WidgetModel) {
	return WidgetModel.extend({
		defaults: {
			data: {
				from: "auto"
			}
		},

		getTranslation: function(text, from, to, cb) {
			$.ajax({
				type: "POST",
				dataType: "text",
				url: "https://www.google.com/async/translate?nocache=" + new Date().getTime(),
				data: "async=translate,sl:" + from + ",tl:" + to + ",st:" + encodeURIComponent(text) + ",qc:true,ac:true,id:1,_pms:qd,_fmt:json",
				success: function(d) {
					try {
						d = JSON.parse(d.replace(")]}'", "").trim());
					}
					catch (e) {}

					if (!d || !d.translateData || !d.translateData.response || !d.translateData.response.sentences || !d.translateData.response.sentences.length) {
						return cb(true);
					}

					d = d.translateData.response;

					var text = _.pluck(d.sentences, "trans").join("\n").trim();

					if (text === "") {
						return cb(true);
					}

					cb(null, {
						text: text,
						language: from === "auto" ? ((d.detected_languages && d.detected_languages.srclangs && d.detected_languages.srclangs[0]) || from) : from
					});
				}.bind(this)
			}).fail(function() {
				cb(true);
			});
		}
	});
});