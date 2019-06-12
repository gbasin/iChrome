define(["widgets/views/main", "core/settings"], function(WidgetView, settings) {
	return WidgetView.extend({
		events: {
			"change select.uc-category": function(e) {
				this.model.category = $(e.currentTarget).find("option:selected").val();

				if (!this.model.category) {
					this.model.froms = [];
					this.model.toes = [];
					this.render();
					return;
				};

				this.model.cache = this.model.cache || {};
				var cached = this.model.cache[this.model.category];
				if (cached) {
					this.model.froms = cached;
					this.model.toes = cached;
					this.render()
					return;
				};

				$.ajax({
					type: "GET",
					url: settings.apidomain + "/unitconv/list?cat=" + this.model.category,
					headers: { 
						Accept : "application/json",
						"Content-Type": "application/json"
					},
					beforeSend: function(xhr) {
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
						this.model.error = true
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
						
						this.model.cache[d.cat] = units;
						this.model.froms = units;
						this.model.toes = units;
					}.bind(this)
				});
			},
			"change select.uc-from": function(e) {
				this.model.from = $(e.currentTarget).find("option:selected").val();
				this.updateConfig();
			},
			"change select.uc-to": function(e) {
				this.model.to = $(e.currentTarget).find("option:selected").val();
				this.updateConfig();
			},
			"change input.uc-source": function(e) {
				this.recalculate(e);
			}
		},

		updateConfig: function() {
			if (!this.config.from || !this.config.to) {
				this.recalculate(true);
				return;
			}
		},

		recalculate: function(el, empty) {
			var wrapper = $(el).parent("uc-wrapper"); 

			var value = "";
			if (!empty) {
				var tokens = (this.config.selected || []).split("|");
				if (tokens.length !== 5) {
					value = "ERR";
				}else{
					var coeff1 = Number(tokens[1]);
					var coeff2 = Number(tokens[3]);
					var currency = tokens[4];

					var input = wrapper.find("uc-input").val();
					if (!input) {
						value = "ERR";
					}else{
						value = (input / coeff1 * coeff2) + " " + currency;
					}
				}
			}

			wrapper.find("uc-result").val(value);
		},

		onBeforeRender: function(data) {
			data.config = this.model.config;
			data.category =  this.model.category || "";
			data.froms = this.model.froms;
			data.toes = this.model.toes;

			var cats = ",acceleration,angle,apparentPower,area,charge,current,digital,each,energy,force,frequency,illuminance,length,mass,pace,partsPer,power,pressure,reactiveEnergy,reactivePower,speed,temperature,time,voltage,volume,volumeFlowRate";
			data.cat_options = cats.split(",").map(function(cat){ 
				return {
					"k": cat,
					"n": data.i18n.cat[cat || "select_category"],
					"s": data.category === cat
				};
			 });

			return data;
		}
	});
});