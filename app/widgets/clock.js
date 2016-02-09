/*
 * The Clock widget.
 */
define(["jquery", "lodash", "moment", "backbone"], function($, _, moment, Backbone) {
	var View = Backbone.View.extend({
		events: {
			"click header.tabs .item": function(e) {
				var tab = e.currentTarget.getAttribute("data-id");

				$(e.currentTarget).add(this.$(".section." + tab)).addClass("active").siblings().removeClass("active");

				this.data.tab = tab;

				this.utils.saveData();
			},

			"click .alert .dismiss": function(e) {
				$(e.currentTarget).parents(".alert").first().removeClass("visible");

				if (this.audio) {
					this.audio.pause();
				}
			},

			"change .audio input[type=checkbox]": function(e) {
				this.config.audio = e.currentTarget.checked;

				this.utils.saveConfig();
			},

			"click .stopwatch .start-stop": function(e) {
				if (this.data.stopwatch && this.data.stopwatch.start) {
					this.data.stopwatch.running = !this.data.stopwatch.running;

					if (!this.data.stopwatch.running) {
						this.data.stopwatch.paused = new Date().getTime();
					}
					else if (this.data.stopwatch.paused) {
						this.data.stopwatch.start += new Date().getTime() - this.data.stopwatch.paused;

						delete this.data.stopwatch.paused;
					}
				}
				else {
					this.data.stopwatch = {
						running: true,
						start: new Date().getTime()
					};
				}

				e.currentTarget.classList.toggle("started", this.data.stopwatch.running);

				this.utils.saveData();
			},

			"click .stopwatch .reset": function() {
				delete this.data.stopwatch;

				this.stopwatchElm.innerHTML = "0:00";

				this.$(".stopwatch .start-stop").removeClass("started");

				this.utils.saveData();
			},

			"click .timer .start-stop": "startTimer",

			"keydown .timer input.time": function(e) {
				if (e.which === 13) {
					this.startTimer(e);
				}
			},

			"click .timer .reset": function() {
				delete this.data.timer;

				this.timerElm.innerHTML = "0:00";

				this.$(".section.timer").removeClass("running");
				this.$(".timer .start-stop").removeClass("started");

				this.utils.saveData();
			},

			"keydown .alarm input.time": function(e) {
				if (e.which === 13) {
					this.startAlarm(e);
				}
			},

			"click .alarm .set": "startAlarm"
		},

		intervalUpdateClock: null,
		intervalUpdate: null,
		intervalUpdateStopwatch: null,

		formatTime: function(rTime, ms) {
			var time = Math.floor(rTime / 1000);

			var days = parseInt(time / 86400),
				hours = parseInt((time % 86400) / 3600),
				minutes = parseInt((time % 3600) / 60);

			if (days) {
				return days + ":" + _.padLeft(hours, 2, "0") + ":" + _.padLeft(minutes, 2, "0") + ":" + _.padLeft(time % 60, 2, "0");
			}
			else if (hours) {
				return hours + ":" + _.padLeft(minutes, 2, "0") + ":" + _.padLeft(time % 60, 2, "0");
			}
			else {
				return minutes + ":" + _.padLeft(time % 60, 2, "0") + (ms ? "." + _.padLeft(rTime % 1000, 3, "0") : "");
			}
		},

		updateClock: function(returnHTML) {
			var html = '<div class="time',
				dt = new Date();

			if (this.config.timezone !== "auto") {
				dt = new Date(dt.getTime() + dt.getTimezoneOffset() * 60000 + parseInt(this.config.timezone) * 60000);
			}

			var hours = dt.getHours(),
				minutes = dt.getMinutes(),
				seconds = dt.getSeconds(),
				am = hours < 12;

			if (this.config.format.indexOf("ampm") === 0) {
				hours = (hours > 12 ? hours - 12 : hours);

				if (hours === 0) {
					hours = 12;
				}

				html += (am ? " am" : " pm") + (this.config.format === "ampms" ? " no-seconds" : "");
			}
			else {
				html += " full" + (this.config.format === "fulls" ? " no-seconds" : "");
			}

			html += '">' + hours + ":" + _.padLeft(minutes, 2, "0");

			if (this.config.size === "tiny" && this.config.format.indexOf("ampm") === 0) {
				html += "<span>" + (this.config.format === "ampm" ? _.padLeft(seconds, 2, "0") : "") + "</span></div>";
			}
			else if (this.config.size !== "tiny") {
				// moment(dt) is slower so avoid it when possible
				var date = (this.config.timezone !== "auto" ? moment(dt).format("dddd, MMMM Do YYYY") : moment().format("dddd, MMMM Do YYYY"));

				if (this.config.format === "ampm" || this.config.format === "full") {
					html += ":" + _.padLeft(seconds, 2, "0");
				}

				html += '</div><div class="date">' + date + "</div>";
			}

			if (returnHTML) {
				return html;
			}
			else {
				this.clockElm.innerHTML = html;
			}
		},

		updateStopwatch: function(ret, force) {
			if (this.data.stopwatch && (this.data.stopwatch.running || force)) {
				var time = new Date().getTime() - this.data.stopwatch.start;

				var formatted = this.formatTime(time, time < 6E5);

				if (ret) {
					return formatted;
				}

				this.stopwatchElm.innerHTML = formatted;
			}
		},

		startTimer: function() {
			if (this.data.timer && this.data.timer.start) {
				this.data.timer.running = !this.data.timer.running;

				if (!this.data.timer.running) {
					this.data.timer.paused = new Date().getTime();
				}
				else if (this.data.timer.paused) {
					this.data.timer.start += new Date().getTime() - this.data.timer.paused;

					delete this.data.timer.paused;
				}
			}
			else {
				var input = this.$(".timer input.time")[0];

				input.value = input.value.replace(/[^0-9:\.]/g, "");


				var multiples = [1E3, 6E4, 36E5, 864E5];

				// This splits 0:00:00:00.00 into ["0", "00", "00", "00.00"].
				//
				// Then it reverses it, so it's [seconds, minutes, hours, days] and limits
				// it to 4 values.
				//
				// Each value is then multiplied in order by its ms multiplier. They're combined
				// leaving a single total ms value for the time input
				var duration = _(input.value.split(":")).compact().reverse().take(4).reduce(function(total, e, i) {
					total += Math.floor(e * multiples[i]);

					return total;
				}, 0);

				if (duration) {
					input.value = "";

					this.data.timer = {
						running: true,
						duration: duration,
						start: new Date().getTime()
					};
				}
			}

			var running = !!(this.data.timer && this.data.timer.running);

			this.$(".timer .start-stop").toggleClass("started", running);
			this.$(".section.timer").toggleClass("running", !!this.data.timer);

			if (running) {
				this.updateTimer();
			}

			this.utils.saveData();
		},

		updateTimer: function(ret) {
			var formatted,
				time = (this.data.timer.start + this.data.timer.duration) - new Date().getTime();

			if (time <= 0) {
				formatted = "0:00";

				this.trigger("timer:ended");

				delete this.data.timer;

				this.$(".section.timer").removeClass("running");
				this.$(".timer .start-stop").removeClass("started");

				this.utils.saveData();
			}
			else {
				formatted = this.formatTime(time);
			}

			if (ret) {
				return formatted;
			}

			this.timerElm.innerHTML = formatted;
		},

		startAlarm: function() {
			if (this.data.alarm && this.data.alarm.set) {
				this.data.alarm.set = !this.data.alarm.set;
			}
			else {
				var time = new Date().setHours(0, 0, 0, 0) + this.$(".alarm input.time")[0].valueAsNumber;

				if (time <= new Date().getTime()) {
					time += 86400000;
				}

				this.data.alarm = {
					set: true,
					time: time
				};
			}

			this.$(".alarm .set").text(this.data.alarm && this.data.alarm.set ? this.utils.translate("unset") : this.utils.translate("set"));
			this.$(".section.alarm").toggleClass("running", this.data.alarm && this.data.alarm.set);

			if (this.data.alarm && this.data.alarm.set) {
				this.updateAlarm();
			}

			this.utils.saveData();
		},

		updateAlarm: function(ret) {
			var formatted,
				time = this.data.alarm.time - new Date().getTime();

			if (this.data.alarm.time <= new Date().getTime()) {
				formatted = "0:00";

				this.trigger("alarm:ended");

				// Don't delete the entire element, preserve the last used time
				this.data.alarm.set = false;

				this.$(".alarm .set").text(this.utils.translate("set"));
				this.$(".section.alarm").removeClass("running");

				this.utils.saveData();
			}
			else {
				formatted = this.formatTime(time);
			}

			if (ret) {
				return formatted;
			}

			this.alarmElm.innerHTML = formatted;
		},

		setCache: function() {
			this.timerElm = this.$(".timer div.time")[0];
			this.alarmElm = this.$(".alarm div.time")[0];
			this.stopwatchElm = this.$(".stopwatch .time")[0];
		},

		update: function() {
			this.updateClock();

			if (this.data.alarm && this.data.alarm.set) {
				this.updateAlarm();
			}

			if (this.data.timer && this.data.timer.running) {
				this.updateTimer();
			}
		},

		playAudio: function() {
			if (this.config.audio) {
				this.audio = new Audio();

				this.audio.loop = true;
				this.audio.volume = 0.3;
				this.audio.autoplay = true;
				this.audio.src = "https://ichro.me/widgets/clock/audio/" + this.config.sound + ".ogg";
			}
		},

		initialize: function() {
			this.on("alarm:ended", function() {
				this.$(".alert.alarm .time").text(moment(this.data.alarm.time).format("h:mm A"));

				this.$(".alert.alarm").addClass("visible");

				this.playAudio();
			}).on("timer:ended", function() {
				this.$(".alert.timer .time").text(this.formatTime(this.data.timer.duration));

				this.$(".alert.timer").addClass("visible");

				this.playAudio();
			});
		},

		render: function() {
			if (this.intervalUpdateClock) {
				clearInterval(this.intervalUpdateClock);
			}

			if (this.intervalUpdate) {
				clearInterval(this.intervalUpdate);
			}

			if (this.intervalUpdateStopwatch) {
				clearInterval(this.intervalUpdateStopwatch);
			}


			this.isAnalog = (this.config.format === "analog");

			this.$el.toggleClass("analog", this.isAnalog);


			var data;

			if (this.isAnalog) {
				var dt = new Date();

				if (this.config.timezone !== "auto") {
					dt = new Date(dt.getTime() + dt.getTimezoneOffset() * 60000 + parseInt(this.config.timezone) * 60000);
				}

				data = {
					analog: true,
					mPos: dt.getMinutes() * 6 + (dt.getSeconds() / 60 * 6),
					hPos: dt.getHours() * 30 + (dt.getMinutes() / 60 * 30),
					sPos: dt.getSeconds() * 6
				};

				return this.utils.render(data);
			}

			data = JSON.parse(JSON.stringify(this.data));

			data.html = this.updateClock(true);

			data.audio = this.config.audio;

			if (this.config.size === "tiny") {
				if (this.config.title) {
					data.title = this.config.title;
				}
			}
			else {
				if (data.stopwatch) {
					if (data.stopwatch.paused) {
						data.stopwatch.start += new Date().getTime() - data.stopwatch.paused;
					}

					data.stopwatch.html = this.updateStopwatch.call({ data: data, formatTime: this.formatTime }, true, true);
				}

				if (data.timer) {
					if (data.timer.paused) {
						data.timer.start += new Date().getTime() - data.timer.paused;
					}

					data.timer.html = this.updateTimer.call({ data: data, formatTime: this.formatTime }, true);
				}

				if (data.alarm) {
					if (data.alarm.set) {
						data.alarm.html = this.updateTimer.call({ data: data, formatTime: this.formatTime }, true);
					}
				}

				data.alarm = data.alarm || {};

				data.alarm.timeStr = data.alarm.time ? _.padLeft(new Date(data.alarm.time).getHours(), 2, "0") + ":" + _.padLeft(new Date(data.alarm.time).getMinutes(), 2, "0") : "07:00";
			}

			this.utils.render(data);

			if (this.data.tab) {
				this.$(".tabs .item[data-id=" + this.data.tab + "], .section." + this.data.tab).addClass("active").siblings().removeClass("active");
			}


			this.clockElm = this.$(".clock")[0];

			if (this.config.size === "tiny") {
				this.intervalUpdateClock = setInterval(this.updateClock.bind(this), 1000);
			}
			else {
				this.setCache();

				this.intervalUpdate = setInterval(this.update.bind(this), 1000);

				// The stopwatch displays milliseconds so it needs to update every ~50 ms
				// instead of every 1000 to display a smooth progression
				//
				// This uses 53 instead of 50 so the numbers displayed aren't continuously
				// repeated
				this.intervalUpdateStopwatch = setInterval(this.updateStopwatch.bind(this), 53);
			}
		}
	});

	return {
		id: 2,
		size: 2,
		nicename: "clock",
		sizes: ["tiny", "small"],
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "i18n.settings.title",
				placeholder: "i18n.settings.title_placeholder"
			},
			{
				type: "size"
			},
			{
				type: "select",
				nicename: "timezone",
				label: "i18n.settings.timezone",
				options: {
					auto: "i18n.settings.timezone_local",
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
				label: "i18n.settings.format",
				options: {
					ampm: "i18n.settings.format_options.ampm",
					full: "i18n.settings.format_options.24hour",
					analog: "i18n.settings.format_options.analog",
					ampms: "i18n.settings.format_options.ampmseconds",
					fulls: "i18n.settings.format_options.24hourseconds",
				}
			},
			{
				type: "select",
				nicename: "sound",
				label: "i18n.settings.sound",
				options: {
					urban_beat: "Urban Beat",
					argon: "Argon",
					ariel: "Ariel",
					carbon: "Carbon",
					carme: "Carme",
					ceres: "Ceres",
					dione: "Dione",
					elara: "Elara",
					europa: "Europa",
					ganymede: "Ganymede",
					helium: "Helium",
					iapetus: "Iapetus",
					io: "Io",
					krypton: "Krypton",
					luna: "Luna",
					neon: "Neon",
					oberon: "Oberon",
					osmium: "Osmium",
					oxygen: "Oxygen",
					phobos: "Phobos",
					platinum: "Platinum",
					rhea: "Rhea",
					salacia: "Salacia",
					sedna: "Sedna",
					tethys: "Tethys",
					titan: "Titan",
					triton: "Triton",
					umbriel: "Umbriel"
				}
			}
		],
		config: {
			title: "i18n.title",
			size: "small",
			timezone: "auto",
			format: "ampm",
			audio: true,
			sound: "urban_beat"
		},
		data: {},
		render: function() {
			if (!this.view) {
				this.view = new (View.extend({
					utils: this.utils,
					config: this.config,
					data: this.data || {}
				}))({
					el: this.elm
				});
			}

			this.view.config = this.config;
			this.view.data = this.data || {};

			this.view.render();
		}
	};
});
