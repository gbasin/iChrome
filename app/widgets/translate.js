/*
 * The Translate widget.
 */
define(["jquery"], function($) {
	return {
		id: 20,
		size: 1,
		order: 26,
		nicename: "translate",
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

					if (!untranslate.trim().length) return;

					btn.text(this.utils.translate("untranslate"));

					this.data.from = from.val();
					this.data.to = to.val();

					$.ajax({
						type: "GET",
						url: "https://translate.google.com/translate_a/single?client=t&sl=" + encodeURIComponent(this.data.from) + "&tl=" + encodeURIComponent(this.data.to) + "&dt=t&q=" + encodeURIComponent(untranslate),
						complete: function(d) {
							d = d.responseText;

							if (typeof d === "string" && (d = eval("(" + d + ")")) && d[0] && d[0].length) {
								if (d[2] && accepted.indexOf(d[2]) !== -1) {
									var text = _.map(d[0], _.first).join("");

									if (text === "") {
										text = this.utils.translate("error");
									}

									textarea.val(text);

									if (from.val() === "auto") {
										auto.text(this.utils.translate("auto", from.find('option[value="' + d[2] + '"]').text()));

										autochanged = true;
									}
								}
								else {
									auto.text(this.utils.translate("unknown"));

									autochanged = true;
								}
							}
							else {
								textarea.val(this.utils.translate("error"));
							}
						}.bind(this)
					});

					this.utils.saveData(this.data);
				}.bind(this),
				autochange = function(e) {
					untranslate = false;

					btn.text(this.utils.translate("button"));

					if (autochanged) {
						auto.text("Auto");

						autochanged = false;
					}
				}.bind(this),
				untranslate = false,
				btnText = this.utils.translate("button");

			btn.on("click", function(e) {
				e.preventDefault();

				if (untranslate && untranslate !== "") {
					textarea.val(untranslate);

					untranslate = false;

					btn.text(btnText);
				}
				else {
					submit(e);
				}
			});

			from.val(this.data.from);
			to.val(this.data.to);

			from.add(to).on("keydown", function(e) {
				if (e.which === 13 && (!untranslate || untranslate === "")) {
					e.preventDefault();

					submit(e);
				}
			});

			from.on("change", autochange);

			to.on("change", function() {
				untranslate = false;

				btn.text(btnText);
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