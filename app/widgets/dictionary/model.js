define(["jquery", "lodash", "browser/api", "widgets/model"], function($, _, Browser, WidgetModel) {
	return WidgetModel.extend({
		defaults: {
			data: {
				definition: {
					word: "test",
					pronunciation: "test",
					audio: "https://ssl.gstatic.com/dictionary/static/sounds/de/0/test.mp3",
					uses: [{
						form: "noun",
						forms: [{
							desc: "noun",
							form: "test"
						}, {
							desc: "plural noun",
							form: "tests"
						}],
						definitions: [{
							definition: "a procedure intended to establish the quality, performance, or reliability of something, especially before it is taken into widespread use.",
							example: "no sparking was visible during the tests",
							synonymGroups: [{
								synonyms: [{
									text: "trial"
								}, {
									text: "experiment"
								}, {
									text: "test case"
								}, {
									text: "case study"
								}, {
									noDef: true,
									text: "pilot study"
								}, {
									text: "trial run"
								}, {
									text: "tryout"
								}, {
									text: "dry run"
								}]
							}, {
								register: "technical",
								synonyms: [{
									text: "assay"
								}]
							}],
							antonymGroups: [{
								antonyms: [{
									text: "break"
								}, {
									text: "repair"
								}]
							}]
						}, {
							labels: ["Metallurgy"],
							definition: "a movable hearth in a reverberating furnace, used for separating gold or silver from lead."
						}]
					}, {
						form: "verb",
						forms: [{
							desc: "verb",
							form: "test"
						}, {
							desc: "3rd person present",
							form: "tests"
						}, {
							desc: "past tense",
							form: "tested"
						}, {
							desc: "past participle",
							form: "tested"
						}, {
							desc: "gerund or present participle",
							form: "testing"
						}],
						definitions: [{
							definition: "take measures to check the quality, performance, or reliability of (something), especially before putting it into widespread use or practice.",
							example: "this range has not been tested on animals",
							synonymGroups: [{
								synonyms: [{
									noDef: true,
									text: "try out"
								}, {
									noDef: true,
									text: "put to the test"
								}, {
									noDef: true,
									text: "put through its paces"
								}, {
									noDef: true,
									text: "experiment with"
								}, {
									text: "check"
								}, {
									text: "examine"
								}, {
									text: "assess"
								}, {
									text: "evaluate"
								}]
							}, {
								register: "technical",
								synonyms: [{
									text: "assay"
								}]
							}],
						}]
					}]
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