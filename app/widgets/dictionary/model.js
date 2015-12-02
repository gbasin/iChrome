define(["jquery", "lodash", "widgets/model"], function($, _, WidgetModel) {
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

		refresh: function() {
			
		}
	});
});