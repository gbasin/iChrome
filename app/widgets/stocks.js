/*
 * The Stocks widget.
 */
define(["jquery", "moment"], function($, moment) {
	return {
		id: 14,
		size: 2,
		order: 10,
		interval: 30000,
		nicename: "stocks",
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
				type: "text",
				nicename: "symbol",
				label: "i18n.settings.symbols",
				placeholder: "i18n.settings.symbols_placeholder",
				help: "i18n.settings.symbols_help"
			}
		],
		config: {
			title: "Google, Inc.",
			size: "small",
			symbol: "NASDAQ:GOOG"
		},
		data: [{
			value: "1<b>,</b>100.62",
			ticker: "GOOG",
			exchange: "NASDAQ",
			up: true,
			date: "Dec 20th 4:00 PM",
			change: "+14.40 (1.33%)",
			open: "1088.30",
			high: "1101.17",
			low: "1088.00",
			volume: "3.27M",
			extra: false
		}],
		refresh: function() {
			$.ajax({
				type: "GET",
				url: "https://clients1.google.com/finance/info?client=ob&hl=en&infotype=infoonebox&q=" + encodeURIComponent((this.config.symbol || "NASDAG:GOOG").trim()),
				success: function(d) {
					d = JSON.parse(d
							.replace("// [", "[") // Undo Google's escaping
							.replace(/\\x([A-z0-9]{2})/g, function(match, $1) { // This replaces \x escapes so the JSON doesn't have to be eval'd
								try {
									return String.fromCharCode(parseInt($1, 16));
								}
								catch(e) {
									return "?";
								}
							})
						);

					var stocks = [],
						stock,
						min = (d.length > 1 ? 1000000 : 10000);

					d.forEach(function(e, i) {
						stock = {
							value: parseFloat((e.el_fix || e.l_fix).replace(/[^0-9\.\-]/g, "")),
							ticker: e.t,
							exchange: e.e,
							up: (e.ec || e.c).indexOf("-") !== 0,
							date: moment(e.elt_dts || e.lt_dts || e.elt || e.lt).format("MMM Do h:mm A"),
							change: (e.ec || e.c) + " (" + (e.ecp_fix || e.cp_fix) + "%)",
							open: parseFloat((e.op || "0").replace(/[^0-9\.\-]/g, "")),
							high: parseFloat((e.hi || "0").replace(/[^0-9\.\-]/g, "")),
							low: parseFloat((e.lo || "0").replace(/[^0-9\.\-]/g, "")),
							volume: parseFloat(e.vo.replace(/[^0-9\.\-]/g, "")),
							extra: (e.s == "1" ? "Pre Market" : e.s == "2" ? "After Hours" : false)
						};

						stock.value = ((stock.value || 0) < min ? $.formatNumber((stock.value || 0), { locale: navigator.locale }) : (stock.value || 0).abbr(min)).replace(/,/g, "<b>,</b>");

						stock.open = $.formatNumber((stock.open || 0), { locale: navigator.locale, format: "#0.00" });
						stock.high = $.formatNumber((stock.high || 0), { locale: navigator.locale, format: "#0.00" });
						stock.low = $.formatNumber((stock.low || 0), { locale: navigator.locale, format: "#0.00" });

						stock.volume = (stock.volume || 0).abbr(1000000);

						stocks.push(stock);
					});

					this.data = stocks;

					this.render();

					this.utils.saveData(this.data);
				}.bind(this),
				dataType: "text" // Google comments out the opening array tag so the JSON parser crashes
			});
		},
		render: function() {
			if (Array.isArray(this.data)) {
				if (this.data.length > 1) {
					var data = {
						multiple: true,
						stocks: $.extend({}, { data: this.data || [] }).data
					};
				}
				else {
					var data = $.extend({}, { data: this.data || [] }).data[0];
				}
			}
			else {
				var data = $.extend({}, this.data || {});
			}

			if (this.config.title && this.config.title !== "") {
				data.title = this.config.title;
			}

			this.utils.render(data);
		}
	};
});