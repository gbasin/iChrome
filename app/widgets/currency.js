/*
 * The Currency widget.
 */
define(["jquery"], function($) {
	return {
		id: 21,
		size: 1,
		order: 29,
		nicename: "currency",
		sizes: ["small"],
		config: {
			size: "small"
		},
		data: {
			from: "USD",
			to: "USD"
		},
		render: function() {
			this.utils.render();

			var from = this.elm.find("select.from"),
				to = this.elm.find("select.to"),
				selects = this.elm.find("select"),
				fval = this.elm.find("input.fromval"),
				tval = this.elm.find("input.toval"),
				inputs = this.elm.find("input"),
				caching = false,
				cache = {},
				ctrlDown = false;

			var load = function(from, to, cb) {
					caching = true;

					$.get("http://rate-exchange.appspot.com/currency?from=" + from + "&to=" + to + "&q=1", function(d) {
						if (d && d.from == from && d.to == to && d.rate) {
							cache[from + "-" + to] = d.rate;
						}

						caching = false;

						cb();
					});
				},
				convert = function(reverse) {
					this.data.from = from.val();
					this.data.to = to.val();

					var rev = false,
						conv = 0;

					if (reverse) {
						var fr = to.val(),
							tov = from.val(),
							f = tval.val(),
							t = fval;
					}
					else {
						var fr = from.val(),
							tov = to.val(),
							f = fval.val(),
							t = tval;
					}


					if (fr == tov) {
						return t.val(f);
					}


					if (cache[fr + "-" + tov]) {
						conv = f * cache[fr + "-" + tov];
					}
					else if (cache[tov + "-" + fr]) {
						conv = f / cache[tov + "-" + fr];
					}
					else {
						return load(fr, tov, function() {
							convert(reverse);
						});
					}

					t.val(conv);

					this.utils.saveData(this.data);
				}.bind(this);
				

			from.val(this.data.from);
			to.val(this.data.to);

			load(this.data.from, this.data.to, convert);


			inputs.on("keydown", function(e) {
				if (e.which == 17) {
					ctrlDown = true;
				}

				if (e.which == 13) {
					e.preventDefault();

					convert();
				}
				else if (!(ctrlDown ||
						((e.which > 47 && e.which < 58) ||
						(e.which > 36 && e.which < 41) ||
						(e.which > 95 && e.which < 106) ||
						e.which == 8 ||
						e.which == 9 ||
						e.which == 46 ||
						e.which == 17 ||
						e.which == 65 ||
						e.which == 190))) e.preventDefault();
			}).on("keyup", function(e) {
				if (e.which == 17) {
					ctrlDown = false;
				}
			});

			fval.on("input", function(e) {
				convert();
			});

			tval.on("input", function(e) {
				convert(true);
			});

			selects.on("change", function(e) {
				if (cache[from.val() + "-" + to.val()]) {
					convert();
				}
				else {
					load(from.val(), to.val(), convert);
				}
			});
		}
	};
});