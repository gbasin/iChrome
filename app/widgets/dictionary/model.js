define(["jquery", "lodash", "browser/api", "widgets/model"], function($, _, Browser, WidgetModel) {
	return WidgetModel.extend({
		defaults: {
			config: {
				title: "i18n.name",
				lang: "en",
			},

			data: {
				defaultWord: "test",
				definition: [
					{
						"word": "test",
						"first": 1,
						"phonetics": [
							{
								"text": "/tɛst/",
								"audio": "https://lex-audio.useremarkable.com/mp3/test_us_1.mp3"
							}
						],
						"meanings": [
							{
								"partOfSpeech": "noun",
								"definitions": [
									{
										"definition": "A procedure intended to establish the quality, performance, or reliability of something, especially before it is taken into widespread use.",
										"example": "no sparking was visible during the tests",
										"synonyms": [
											"trial",
											"experiment",
											"pilot study",
											"try-out"
										]
									},
									{
										"definition": "A movable hearth in a reverberating furnace, used for separating gold or silver from lead.",
										"example": "When fully prepared, the test is allowed to dry, and is then placed in a  furnace, constructed in all respects like a common reverberator)' furnace,  except that a space is left open in the bed of it to receive the test, and that  the width of the arch is much reduced."
									}
								]
							},
							{
								"partOfSpeech": "transitive verb",
								"definitions": [
									{
										"definition": "Take measures to check the quality, performance, or reliability of (something), especially before putting it into widespread use or practice.",
										"example": "this range has not been tested on animals",
										"synonyms": [
											"try out",
											"trial",
											"carry out trials on",
											"put to the test",
											"put through its paces",
											"experiment with",
											"pilot"
										]
									}
								]
							}
						]
					},
					{
						"word": "test",
						"phonetics": [
							{
								"text": "/tɛst/",
								"audio": "https://lex-audio.useremarkable.com/mp3/test_us_1.mp3"
							}
						],
						"meanings": [
							{
								"partOfSpeech": "noun",
								"definitions": [
									{
										"definition": "The shell or integument of some invertebrates and protozoans, especially the chalky shell of a foraminiferan or the tough outer layer of a tunicate.",
										"example": "The tests of the shells are recrystallized, but the original ornamentation is preserved in very good detail."
									}
								]
							}
						]
					}
				]
			}
		},

		getDefinition: function(term, lang, cb) {
			lang = lang || this.config.lang || Browser.language || "en";
			$.ajax({
				type: "GET",
				dataType: "json",
				url: "https://api.dictionaryapi.dev/api/v2/entries/" + lang + "/" + encodeURIComponent(term),
				success: function(d) {
					if (!d || !Array.isArray(d) || !d[0].word) {
						return cb.call(this, true);
					}

					d[0].first = 1;
					cb.call(this, null, d);
				}.bind(this),
			}).fail(function() {
				cb.call(this, true);
			});
		},

		getWordOfDay: function(cb) {
			$.getJSON("https://cloud.feedly.com/v3/streams/contents?count=1&streamId=feed%2Fhttp%3A%2F%2Fwww.thefreedictionary.com%2F_%2FWoD%2Frss.aspx", function(d) {
				if (d && d.items && d.items[0] && d.items[0].title) {
					cb.call(this, null, d.items[0].title.trim());
				}
				else {
					cb.call(this, true);
				}
			}.bind(this)).fail(cb.bind(this, true, null));
		},

		/**
		 * We override this so we only refresh once on init
		 */
		initialize: function() {
			this.getWordOfDay(function(err, word) {
				if (!err && word) {
					this.getDefinition(word, "en", function(err, definition) {
						if (!err && definition) {
							this.saveData({
								defaultWord: word,
								definition: definition
							});
						}
					});
				}
			});
		}
	});
});