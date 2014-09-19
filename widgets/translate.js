/*
 * The Translate widget.
 */
define(["jquery"], function($) {
	return {
		id: 20,
		size: 1,
		order: 14.5,
		name: "Translate",
		nicename: "translate",
		desc: "Contains a small inline Google Translate textbox.",
		sizes: ["small"],
		config: {
			size: "small"
		},
		data: {
			from: "auto",
			to: "en"
		},
		render: function() {
			this.utils.render();

			var from = this.elm.find("select.from"),
				to = this.elm.find("select.to"),
				swap = this.elm.find(".switch"),
				btn = this.elm.find(".btn.translate"),
				auto = from.find('option[value="auto"]'),
				textarea = this.elm.find("textarea"),
				autochanged = false;

			var accepted = ["af", "sq", "ar", "hy", "az", "eu", "be", "bn", "bs", "bg", "ca", "ceb", "zh-CN", "hr", "cs", "da", "nl", "en", "eo", "et", "tl", "fi", "fr", "gl", "ka", "de", "el", "gu", "ht", "ha", "iw", "hi", "hmn", "hu", "is", "ig", "id", "ga", "it", "ja", "jw", "kn", "km", "ko", "lo", "la", "lv", "lt", "mk", "ms", "mt", "mi", "mr", "mn", "ne", "no", "fa", "pl", "pt", "pa", "ro", "ru", "sr", "sk", "sl", "so", "es", "sw", "sv", "ta", "te", "th", "tr", "uk", "ur", "vi", "cy", "yi", "yo", "zu"],
				submit = function(e) {
					untranslate = textarea.val();

					btn.text("Untranslate");

					this.data.from = from.val();
					this.data.to = to.val();

					$.ajax({
						type: "GET",
						url: "http://translate.google.com/translate_a/t?client=ichrome&sl=" + encodeURIComponent(this.data.from) + "&tl=" + encodeURIComponent(this.data.to) + "&q=" + encodeURIComponent(textarea.val()) + "",
						complete: function(d) {
							d = d.responseText;

							if (typeof d == "string" && d.indexOf("{") == 0 && (d = JSON.parse(d)) && d.sentences && d.sentences.length) {
								if (d.src && accepted.indexOf(d.src) !== -1) {
									var text = "";

									d.sentences.forEach(function(e, i) {
										if (i !== 0) {
											text += "\r\n";
										}

										text += e.trans;
									});

									if (text == "") {
										text = "Something went wrong while trying to translate that...";
									}

									textarea.val(text);

									if (from.val() == "auto") {
										auto.text("Auto (" + from.find('option[value="' + d.src + '"]').text() + ")");

										autochanged = true;
									}
								}
								else {
									auto.text("Unknown");

									autochanged = true;
								}
							}
							else {
								textarea.val("Something went wrong while trying to translate that...");
							}
						}
					});

					this.utils.saveData(this.data);
				}.bind(this),
				autochange = function(e) {
					untranslate = false;

					btn.text("Translate");

					if (autochanged) {
						auto.text("Auto");

						autochanged = false;
					}
				},
				untranslate = false;

			btn.on("click", function(e) {
				e.preventDefault();

				if (untranslate && untranslate !== "") {
					textarea.val(untranslate);

					untranslate = false;

					btn.text("Translate");
				}
				else {
					submit(e);
				}
			});

			from.val(this.data.from);
			to.val(this.data.to);

			from.add(to).on("keydown", function(e) {
				if (e.which == 13 && (!untranslate || untranslate == "")) {
					e.preventDefault();

					submit(e);
				}
			});

			from.on("change", autochange);

			to.on("change", function() {
				untranslate = false;

				btn.text("Translate");
			});

			swap.click(function(e) {
				e.preventDefault();

				var f = from.val(),
					t = to.val();

				if (f == "auto") {
					f = "en";
				}

				from.val(t);
				to.val(f);
			});

			textarea.on("input", autochange);
		}
	};
});