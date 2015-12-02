define(["jquery", "lodash", "browser/api", "widgets/model"], function($, _, Browser, WidgetModel) {
	return WidgetModel.extend({
		defaults: {
			data: {
				definition: {
					word: "test",
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
					audio: "//ssl.gstatic.com/dictionary/static/sounds/de/0/test.mp3",
					pronunciation: "test"
				}
			}
		},

		getDefinition: function(word, cb) {
			$.ajax({
				type: "GET",
				headers: {
					// The API is referrer locked to the dictionary extension
					"X-Origin": "chrome-extension://mgijmajocgfcbeboacabfgobmjgjcoja",
					"X-Referer": "chrome-extension://mgijmajocgfcbeboacabfgobmjgjcoja"
				},
				url: "https://content.googleapis.com/dictionaryextension/v1/knowledge/search",
				data: {
					term: word,
					language: Browser.language,
					country: "US",
					key: "__API_KEY_dictionary__"
				},
				success: function(d) {
					if (!d || !d.dictionaryData || !d.dictionaryData[0]) {
						return cb.call(this, true);
					}

					var webDefinitions = _.pluck(d.dictionaryData[0].webDefinitions, "definition");

					if ((!d.dictionaryData[0].entries || !d.dictionaryData[0].entries[0]) && webDefinitions && webDefinitions.length) {
						cb.call(this, null, {
							word: word,
							webDefinitions: webDefinitions
						});
					}

					d = d.dictionaryData[0].entries[0];

					var ret = {
						word: d.headword,
						uses: _.map(d.senseFamilies, function(e) {
							return {
								form: _.pluck(e.partsOfSpeechs, "value").join(", "),

								forms: _.map(e.morphUnits, function(e) {
									return {
										form: e.wordForm,
										desc: e.formType && e.formType.description
									};
								}),

								definitions: _.map(e.senses, function(e) {
									var ret = {
										labels: _.flatten(_.values(e.labelSet)),
										definition: e.definition && e.definition.text,
										synonymGroups: _(e.thesaurusEntries).pluck("synonyms").flatten().compact().map(function(e) {
											return {
												register: e.register || undefined,
												synonyms: _.map(e.nyms, function(e) {
													return {
														text: e.nym,
														noDef: e.numEntries ? undefined : true
													};
												})
											};
										}).value(),
										antonymGroups:  _(e.thesaurusEntries).pluck("antonyms").flatten().compact().map(function(e) {
											return {
												register: e.register || undefined,
												antonyms: _.map(e.nyms, function(e) {
													return {
														text: e.nym,
														noDef: e.numEntries ? undefined : true
													};
												})
											};
										}).value()
									};

									if (e.exampleGroups && e.exampleGroups[0] && e.exampleGroups[0].examples && e.exampleGroups[0].examples[0]) {
										ret.example = e.exampleGroups[0].examples[0];
									}

									if (!ret.labels.length) {
										delete ret.labels;
									}

									return ret;
								})
							};
						})
					};

					if (webDefinitions && webDefinitions.length) {
						ret.webDefinitions = webDefinitions;
					}

					if (d.phonetics && d.phonetics[0]) {
						ret.audio = d.phonetics[0].drEyeAudio;
						ret.pronunciation = d.phonetics[0].text;
					}

					cb.call(this, null, ret);
				}.bind(this)
			});
		},

		refresh: function() {
			this.getDefinition("test", function(err, definition) {
				this.saveData({
					definition: definition
				});
			});
		}
	});
});