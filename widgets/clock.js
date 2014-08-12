/*
 * The Clock widget.
 */
define(["jquery"], function($) {
	return {
		id: 2,
		interval: 1000,
		nicename: "clock",
		sizes: ["tiny", "small"],
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "Widget Title",
				placeholder: "Enter a widget title or leave blank to hide"
			},
			{
				type: "size"
			},
			{
				type: "select",
				nicename: "timezone",
				label: "Time Zone",
				placeholder: "Enter a zone to show the current time for",
				options: {
					auto: "Local",
					"-720": "UTC -12:00",
					"-660": "UTC -11:00",
					"-600": "UTC -10:00",
					"-570": "UTC -09:30",
					"-540": "UTC -09:00",
					"-480": "UTC -08:00",
					"-420": "UTC -07:00",
					"-360": "UTC -06:00",
					"-300": "UTC -05:00",
					"-270": "UTC -04:30",
					"-240": "UTC -04:00",
					"-210": "UTC -03:30",
					"-180": "UTC -03:00",
					"-120": "UTC -02:00",
					"-60": "UTC -01:00",
					0: "UTC +00:00",
					60: "UTC +01:00",
					120: "UTC +02:00",
					180: "UTC +03:00",
					210: "UTC +03:30",
					240: "UTC +04:00",
					270: "UTC +04:30",
					300: "UTC +05:00",
					330: "UTC +05:30",
					345: "UTC +05:45",
					360: "UTC +06:00",
					390: "UTC +06:30",
					420: "UTC +07:00",
					480: "UTC +08:00",
					525: "UTC +08:45",
					540: "UTC +09:00",
					570: "UTC +09:30",
					600: "UTC +10:00",
					630: "UTC +10:30",
					660: "UTC +11:00",
					690: "UTC +11:30",
					720: "UTC +12:00",
					765: "UTC +12:45",
					780: "UTC +13:00",
					840: "UTC +14:00"
				}
			},
			{
				type: "select",
				nicename: "format",
				label: "Clock View",
				options: {
					ampm: "AM/PM - Digital",
					full: "24 Hour - Digital",
					analog: "12 Hour - Analog",
					ampms: "AM/PM - Digital, No Seconds",
					fulls: "24 Hour - Digital, No Seconds"
				}
			}
		],
		config: {
			title: "Clock",
			size: "small",
			timezone: "auto",
			format: "ampm"
		},
		isAnalog: false,
		getHTML: function() {
			var html = '<div class="time',
				dt = new Date();

			if (this.config.timezone !== "auto") {
				dt = new Date(dt.getTime() + dt.getTimezoneOffset() * 60000 + parseInt(this.config.timezone) * 60000);
			}

			var hours = dt.getHours(),
				minutes = dt.getMinutes(),
				seconds = dt.getSeconds(),
				am = hours < 12;

			if (this.config.format.indexOf("ampm") == 0) {
				hours = (hours > 12 ? hours - 12 : hours);

				if (hours == 0) hours = 12;

				html += (am ? " am" : " pm") + (this.config.format == "ampms" ? " no-seconds" : "");
			}
			else {
				html += " full" + (this.config.format == "fulls" ? " no-seconds" : "");
			}
			
			html += '">' + hours + ":" + minutes.pad();

			if (this.config.size == "tiny" && this.config.format.indexOf("ampm") == 0) {
				html += "<span>" + (this.config.format == "ampm" ? seconds.pad() : "") + "</span></div>";
			}
			else if (this.config.size != "tiny") {
				// moment(dt) is slower so avoid it when possible
				var date = (this.config.timezone !== "auto" ? moment(dt).format("dddd, MMMM Do YYYY") : moment().format("dddd, MMMM Do YYYY"));

				if (this.config.format == "ampm" || this.config.format == "full") {
					html += ":" + seconds.pad();
				}

				html += '</div><div class="date">' + date + "</div>";
			}

			return html;
		},
		refresh: function(settings) {
			if (settings) {
				this.elm.removeClass("analog");

				this.render();
			}
			else if (!this.isAnalog) {
				this.clockElm.innerHTML = this.getHTML();
			}
		},
		render: function() {
			var data = {
				analog: this.config.format == "analog"
			};

			this.isAnalog = data.analog;

			if (data.analog) {
				var dt = new Date();

				if (this.config.timezone !== "auto") {
					dt = new Date(dt.getTime() + dt.getTimezoneOffset() * 60000 + parseInt(this.config.timezone) * 60000);
				}

				var min = dt.getMinutes();

				data = {
					analog: true,
					mPos: min * 6 + (dt.getSeconds() / 60 * 6),
					hPos: dt.getHours() * 30 + (min / 60 * 30),
					sPos: dt.getSeconds() * 6
				};

				this.elm.addClass("analog");

				this.utils.render(data);
			}
			else {
				data.html = this.getHTML();

				if (this.config.title && !(this.config.title === "" || (this.config.size === "tiny" && this.config.title === "Time in New York, NY"))) {
					data.title = this.config.title;
				}

				this.utils.render(data);

				this.clockElm = this.elm.find(".clock")[0];
			}
		}
	};
});