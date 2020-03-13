/*
 * The Notes widget.
 */
define(["jquery"], function($) {
	return {
		id: 13,
		sort: 140,
		size: 2,
		order: 17,
		nicename: "notes",
		sizes: ["tiny", "variable"],
		settings: [
			{
				type: "size"
			},
			{
				type: "select",
				nicename: "color",
				label: "i18n.settings.color",
				options: {
					yellow: "i18n.settings.color_options.yellow",
					orange: "i18n.settings.color_options.orange",
					red: "i18n.settings.color_options.red",
					blue: "i18n.settings.color_options.blue",
					green: "i18n.settings.color_options.green",
					white: "i18n.settings.color_options.white",
				}
			},
			{
				type: "select",
				nicename: "face",
				label: "i18n.settings.font",
				options: {
					arial: "Arial",
					times: "Times New Roman",
					sans: "Open Sans",
					tahoma: "Tahoma",
					calibri: "Calibri",
					georgia: "Georgia"
				}
			},
			{
				type: "number",
				nicename: "fontsize",
				label: "i18n.settings.fontsize",
				min: 8,
				max: 45
			}
		],
		config: {
			fontsize: 14,
			face: "arial",
			color: "yellow",
			size: "variable"
		},
		syncData: {
			title: "Sample note title",
			content: 'This is sample note content.<br><br>This note widget can contain and display many things including images, <a href="https://www.google.com">links</a>, <b>bold</b>, <i>italic</i>&nbsp;and <u>underlined</u>&nbsp;text.<br><br>Via the settings menu (click the wrench icon in the top right) you can set the note color, font face and font size.<br><br>Have fun!'
		},
		saveNote: function() {
			if (this.titleElm && this.noteElm) {
				clearTimeout(this.timeout);

				// Speed is of the essence, use mostly vanilla JS here
				this.div.innerHTML = this.noteElm[0].innerHTML;

				[].forEach.call(this.div.querySelectorAll("div"), function(e) {
					$(e).replaceWith("<br>" + e.innerHTML);
				});

				[].forEach.call(this.div.querySelectorAll(":not(pre):not(blockquote):not(figure):not(hr):not(a):not(b):not(u):not(i):not(img):not(strong):not(p):not(sub):not(sup):not(br)"), function(e) {
					$(e).replaceWith(e.innerHTML);
				});

				[].forEach.call(this.div.querySelectorAll("pre, blockquote, figure, hr, a, b, u, i, img, strong, p, sub, sup, br"), function(e) {
					[].forEach.call(e.attributes, function(a) {
						if (a.name === "style" && a.value.indexOf("block;") !== -1) {
							e.innerHTML = "<br>" + e.innerHTML;

							e.removeAttribute(a.name);
						}
						else if (a.name !== "href" && a.name !== "src") {
							e.removeAttribute(a.name);
						}
					});
				});

				this.syncData.title = this.titleElm.val();
				this.syncData.content = this.div.innerHTML;

				this.timeout = setTimeout(function() {
					this.utils.saveConfig(this.syncData);
				}.bind(this), 500);
			}
		},
		render: function() {
			if (this.data) {
				this.syncData = $.extend(true, {}, this.data);

				delete this.data;
			}

			var data = {
				title: this.syncData.title,
				content: this.syncData.content
			},
			faces = {
				arial: "Arial, sans-serif",
				times: "Times New Roman, serif",
				sans: "Open Sans, sans-serif",
				tahoma: "Tahoma, sans-serif",
				calibri: "Calibri, sans-serif",
				georgia: "Georgia, serif"
			};

			data.size = this.config.fontsize || 14;
			data.face = faces[this.config.face || "arial"];
			data.color = this.config.color || "yellow";

			this.utils.render(data);

			this.titleElm = this.elm.find("input.header").on("input", this.saveNote.bind(this));
			this.noteElm = this.elm.find(".note .content").on("input", this.saveNote.bind(this));

			this.div = document.createElement("div");
		}
	};
});