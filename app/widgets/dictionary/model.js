define(["jquery", "lodash", "browser/api", "widgets/model"], function($, _, Browser, WidgetModel) {
	return WidgetModel.extend({
		defaults: {
			data: {
				defaultWord: "test",
				definition: {
					term: "test",
					uses: [{
						form: "noun",
						forms: [
							{
								form: "test",
								desc: "noun"
							},
							{
								form: "tests",
								desc: "plural noun"
							}
						],
						definitions: [
							{
								definition: "a procedure intended to establish the quality, performance, or reliability of something, especially before it is taken into widespread use.",
								synonymGroups: [{
									synonyms: [
										{ text: "trial" },
										{ text: "experiment" },
										{ text: "test case" },
										{ text: "case study" },
										{
											text: "pilot study",
											noDef: true
										},
										{ text: "trial run" },
										{ text: "tryout" },
										{ text: "dry run" }
									]
								}, {
									synonyms: [
										{ text: "check" },
										{ text: "examination" },
										{ text: "assessment" },
										{ text: "evaluation" },
										{ text: "appraisal" },
										{ text: "investigation" },
										{ text: "inspection" },
										{ text: "analysis" },
										{ text: "scrutiny" },
										{ text: "study" },
										{ text: "probe" },
										{ text: "exploration" }
									]
								}, {
									synonyms: [
										{ text: "screening" },
										{ text: "workup" }
									]
								}, {
									register: "technical",
									synonyms: [
										{ text: "assay" }
									]
								}],
								example: "no sparking was visible during the tests"
							},
							{
								labels: ["Metallurgy"],
								definition: "a movable hearth in a reverberating furnace, used for separating gold or silver from lead."
							}
						]
					}, {
						form: "verb",
						forms: [{
							form: "test",
							desc: "verb"
						}, {
							form: "tests",
							desc: "3rd person present"
						}, {
							form: "tested",
							desc: "past tense"
						}, {
							form: "tested",
							desc: "past participle"
						}, {
							form: "testing",
							desc: "gerund or present participle"
						}],
						definitions: [
							{
								definition: "take measures to check the quality, performance, or reliability of (something), especially before putting it into widespread use or practice.",
								synonymGroups: [{
									synonyms: [
										{
											text: "try out",
											noDef: true
										}, {
											text: "put to the test",
											noDef: true
										}, {
											text: "put through its paces",
											noDef: true
										}, {
											text: "experiment with",
											noDef: true
										},
										{ text: "pilot" }
									]
								},
								{
									synonyms: [
										{ text: "check" },
										{ text: "examine" },
										{ text: "assess" },
										{ text: "evaluate" },
										{ text: "appraise" },
										{ text: "investigate" },
										{ text: "analyze" },
										{ text: "scrutinize" },
										{ text: "study" },
										{ text: "probe" },
										{ text: "explore" },
										{ text: "trial" }
									]
								},
								{
									synonyms: [
										{ text: "sample" }
									]
								},
								{
									synonyms: [
										{ text: "screen" }
									]
								},
								{
									register: "technical",
									synonyms: [
										{ text: "assay" }
									]
								}],
								example: "this range has not been tested on animals"
							}
						]
					}],
					webDefinitions: ["put to the test, as for its quality, or give experimental use to; \"This approach has been tried with good results\"; \"Test this recipe\""],
					audio: "https://ssl.gstatic.com/dictionary/static/sounds/de/0/test.mp3",
					pronunciation: "test"
				}
			}
		},

		getDefinition: function(term, cb) {
			this.Auth.ajax({
				type: "GET",
				url: "/dictionary/v1/definition/" + encodeURIComponent(term),
				data: {
					lang: Browser.language
				},
				success: function(d) {
					if (!d || !d.term) {
						return cb.call(this, true);
					}

					cb.call(this, null, d);
				}.bind(this)
			}).fail(cb.bind(this, true, null));
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
					this.getDefinition(word, function(err, definition) {
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