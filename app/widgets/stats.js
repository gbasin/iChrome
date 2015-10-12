/*
 * System Stats
 */
define(["lodash", "jquery", "moment", "browser/api"], function(_, $, moment, Browser) {
	return {
		id: 39,
		size: 1,
		interval: 300000,
		nicename: "stats",
		sizes: ["small"],

		config: {
			size: "small"
		},


		/**
		 * These are element and data caches for the CPU usage updater function
		 */
		cpuUsage: null,
		cpuCores: null,
		cpuCoreInfo: [],
		cpuInterval: null,


		/**
		 * Updates the CPU usage indicators
		 */
		updateCPU: function() {
			Browser.system.cpu.getInfo(function(d) {
				var val;

				this.cpuUsage.innerText = Math.floor(
					_.reduce(
						_.map(d.processors, function(d, i) {
							val = ((d.usage.user + d.usage.kernel) - this.cpuCoreInfo[i].usage) / (d.usage.total - this.cpuCoreInfo[i].total) * 100;

							if (val) {
								(this.cpuCores[i] || {}).value = val;
							}

							this.cpuCoreInfo[i] = { usage: (d.usage.user + d.usage.kernel), total: d.usage.total };

							return val;
						}.bind(this)),
						function(r, d) {
							return r + d;
						},
						0
					) / d.processors.length
				);
			}.bind(this));
		},


		refresh: function() {
			clearInterval(this.cpuInterval);

			var battery;

			var queries = {
				battery: function(cb) {
					navigator.getBattery().then(function(d) {
						var data = {
							status: d.charging ? (d.level == 1 ? this.utils.translate("charged") : this.utils.translate("charging")) : (d.level == 1 ? this.utils.translate("idle") : this.utils.translate("discharging")),
							percent: Math.floor(d.level * 100)
						};

						var time = d.dischargingTime == Infinity ? d.chargingTime : d.dischargingTime;

						if (time != Infinity && time !== 0) {
							data.remaining = moment.duration(time, "seconds").humanize();
						}

						battery = d;

						cb.call(this, data);
					}.bind(this));
				},

				cpu: function(cb) {
					Browser.system.cpu.getInfo(function(d) {
						var coreInfo = this.cpuCoreInfo;

						var data = {
							name: d.modelName,
							cores: d.processors.map(function(d, i) {
								if (coreInfo[i]) {
									var val = ((d.usage.user + d.usage.kernel) - coreInfo[i].usage) / (d.usage.total - coreInfo[i].total) * 100;

									coreInfo[i] = { usage: (d.usage.user + d.usage.kernel), total: d.usage.total };

									return val;
								}
								else {
									coreInfo.push({ usage: (d.usage.user + d.usage.kernel), total: d.usage.total });

									return (d.usage.user + d.usage.kernel) / d.usage.total * 100;
								}
							})
						};

						data.usage = Math.floor(_.reduce(data.cores, function(r, d) { return r + d; }, 0) / d.processors.length);

						cb.call(this, data);
					}.bind(this));
				},

				ram: function(cb) {
					Browser.system.memory.getInfo(function(d) {
						var formatNum = function(num) {
							var exp = Math.floor(Math.log(num) / Math.log(1024));

							return (num / Math.pow(1024, exp)).toFixed(2) * 1 + " " + (exp === 0 ? "bytes": "KMGTPEZY"[exp - 1] + "iB");
						};

						var data = {
							usage: formatNum(d.capacity - d.availableCapacity),
							total: formatNum(d.capacity),
							usagePercent: ((d.capacity - d.availableCapacity) / d.capacity) * 100
						};

						cb.call(this, data);
					}.bind(this));
				}
			};


			var i = 0,
				result = {},
				total = Object.keys(queries).length;

			_.each(queries, function(type, key) {
				type.call(this, function(data) {
					result[key] = data;

					if (++i === total) {
						if (battery) {
							var updateStatus = _.throttle(function() {
								battery.removeEventListener("levelchange", updateStatus);
								battery.removeEventListener("chargingchange", updateStatus);
								battery.removeEventListener("chargingtimechange", updateStatus);
								battery.removeEventListener("dischargingtimechange", updateStatus);

								this.refresh();
							}.bind(this), 30000);

							battery.addEventListener("levelchange", updateStatus);
							battery.addEventListener("chargingchange", updateStatus);
							battery.addEventListener("chargingtimechange", updateStatus);
							battery.addEventListener("dischargingtimechange", updateStatus);
						}

						// Cache this so the widget renders immediately instead of flashing
						this.data = result;

						this.render();

						this.utils.saveData(this.data);
					}
				});
			}, this);
		},

		render: function(demo) {
			if (this.cpuInterval) clearInterval(this.cpuInterval);	
			if (demo) this.refresh();

			this.utils.render(this.data);

			if (this.cpuCoreInfo.length) {
				this.cpuUsage = this.elm.find(".cpu .usage")[0];
				this.cpuCores = this.elm.find(".cpu progress");
				this.cpuInterval = setInterval(this.updateCPU.bind(this), 1000);

				this.updateCPU();
			}
		}
	};
});
