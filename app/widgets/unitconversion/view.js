define(["widgets/views/main", "core/settings", "lodash", "jquery"], function(WidgetView, settings, _, $) {
	return WidgetView.extend({
		events: {
			"change select.uc-category": "updateCategory",
			"click .uc-refresh a": "updateCategory",
			"change select.uc-from": function(e) {
				var widget = this.getWidget(e);
				this.model.from = $(e.currentTarget).find("option:selected").val();
				this.updateConfig();
				this.directUpdate(widget);
			},
			"change select.uc-to": function(e) {
				var widget = this.getWidget(e);
				this.model.to = $(e.currentTarget).find("option:selected").val();
				this.updateConfig();
				this.directUpdate(widget);
			},
			"input input.uc-input": function(e) {
				this.model.input = $(e.currentTarget).closest(".uc-wrapper").find(".uc-input").val(); 
				this.directUpdate(this.getWidget(e));
			},
			"click div.uc-copy a": function(e) {
				var elem = $(e.currentTarget).closest(".uc-wrapper").find(".uc-result .value")[0];
				var range = document.createRange();
				range.selectNode(elem);
				window.getSelection().removeAllRanges();
				window.getSelection().addRange(range);
				document.execCommand("copy");
				window.getSelection().removeAllRanges();		
				e.preventDefault();
				e.stopPropagation();
			},
			"click div.uc-swap a": function(e) {
				var widget = this.getWidget(e);
				e.preventDefault();
				e.stopPropagation();
				var temp = this.model.from;
				this.model.from = this.model.to;
				this.model.to = temp;
				this.updateConfig();
				this.directUpdate(widget);
			}
		},

		updateCategory: function(e) {
			e.preventDefault();
			e.stopPropagation();
			var category = $(e.currentTarget).closest(".uc-wrapper").find(".uc-category").find("option:selected").val();

			if (!category) {
				this.model.area = null;
				this.render();
				return;
			}

			if (this.getCachedCategory(category)) {
				this.model.area = category;
				this.render();
				return;
			}

			$.ajax({
				type: "GET",
				url: settings.apidomain + "/unitconv/list?cat=" + category,
				headers: { 
					Accept : "application/json",
					"Content-Type": "application/json"
				},
				beforeSend: function() {
					this.render({
						loading: true
					});
				}.bind(this),
				complete: function() {
					this.render({
						loading: false
					});
				}.bind(this),
				fail: function() {
					this.model.error = true;
				}.bind(this),
				success: function(d) {
					if (typeof d !== "object") {
						d = JSON.parse(d);
					}

					var units = [{
						"k": "",
						"n": this.widget.strings.units.select_unit,
						"s": true
					}].concat(
						d.map(function(item) {
							return {
								"k": item.a,
								"n": (item.a === item.n) ? item.a : (item.a + ", " + item.n),
								"coeff": item.c
							};
						})
					);
					
					this.model.cache[category] = units;
					this.model.area = category;
					this.updateConfig(e.currentTarget);
				}.bind(this)
			});
		},

		getWidget: function(event) {
			return $(event.currentTarget).closest(".widget");
		},

		getCachedCategory: function(name) {
			this.model.cache = this.model.cache || {};
			return this.model.cache[name];
		},

		updateConfig: function() {
			if (!this.model.from || !this.model.to || !this.model.area) {
				return;
			}

			var itemFrom = this.getItem(this.model.area, this.model.from);
			var itemTo = this.getItem(this.model.area, this.model.to);
			if (!itemFrom || !itemTo) {
				return;
			}

			var config = this.model.config;
			if (config.area === this.model.area) {
				if (_.isEqual(config.from, itemFrom)) {
					if (_.isEqual(config.to, itemTo)) {
						return;
					}
				}
			}

			config.area = this.model.area;
			config.from = itemFrom;
			config.to = itemTo;

			this.model.saveConfig();
		},

		getItem: function(area, key) {
			var units = this.getCachedCategory(area);
			if (!units) {
				if (this.model.cacheTemp) {
					units = this.model.cacheTemp[area];
				}
			}

			if (!units) {
				return null;
			}

			return units.find(function(item) {
				return item.k === key;
			}.bind(this));
		},

		calculate: function(from, to, input) {
			return input / from.coeff * to.coeff;
		},

		directUpdate: function(widget) {
			var value = "";
			var unit = "";
			var fromItem = this.getItem(this.model.area, this.model.from);
			var toItem = this.getItem(this.model.area, this.model.to);
			if (fromItem && toItem) {
				var input = this.model.input;
				if (input && input !== "") {
					input = Number(input);
					if (isNaN(input)) {
						value = "ERR";
					} else {
						var calculated = this.calculate(fromItem, toItem, input);
						if (!isNaN(calculated)) {
							value = calculated > 1 ? calculated.toFixed(7) : calculated.toFixed(12);
							var parts = value.split('.');
							if (parts.length === 2 && value.indexOf('e') < 0) {
								var part1 = parts[1].replace(new RegExp("[0,.]+$"), "");
								value = parts[0];
								if (part1.length > 0) {
									value += "." + part1;
								}
							}
							
							unit = toItem.k;
						}
					}
				}
			}

			var wrapper = $(widget).find(".uc-result");
			wrapper.find('.value').text(value);
			wrapper.find('.unit').text(unit);
		},

		onBeforeRender: function(data) {
			data.config = this.model.config;
			data.area = this.model.area;
			data.from = this.model.from;
			data.to = this.model.to;
			data.input = this.model.input;

			var cats = ",acceleration,angle,apparentPower,area,charge,current,digital,each,energy,force,frequency,illuminance,length,mass,pace,partsPer,power,pressure,reactiveEnergy,reactivePower,speed,temperature,time,voltage,volume,volumeFlowRate";
			data.cat_options = cats.split(",").map(function(cat){ 
				return {
					"k": cat,
					"n": data.i18n.cat[cat || "select_category"],
					"s": data.area === cat
				};
			});

			var units = this.getCachedCategory(data.area);
			if (!units && this.model.area) {
				if (data.config && data.config.from) {
					units = [];

					units.push(data.config.from);
					if (data.config.to) {
						units.push(data.config.to);
					}
				}				

				this.model.cacheTemp = this.model.cacheTemp || {};
				this.model.cacheTemp[this.model.area] = units;
				data.offline = true;
			}

			if (!units) {
				data.froms = [];
				data.toes = [];
			} else {
				data.froms = units.map(function(item) {
					return {
						"k": item.k,
						"n": item.n,
						"s": item.k === data.from
					};
				});

				data.toes = units.map(function(item) {
					return {
						"k": item.k,
						"n": item.n,
						"s": item.k === data.to
					};
				});
			}
 
			 return data;
		}
	});
});