/*
 * The Currency widget.
 */
define(["lodash", "jquery"], function(_, $) {
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
		currencies: {
			AFN: "Afghan Afghani",
			ALL: "Albanian Lek",
			DZD: "Algerian Dinar",
			AOA: "Angolan Kwanza",
			ARS: "Argentine Peso",
			AMD: "Armenian Dram",
			AWG: "Aruban Florin",
			AUD: "Australian Dollar",
			AZN: "Azerbaijani Manat",
			BSD: "Bahamian Dollar",
			BHD: "Bahraini Dinar",
			BDT: "Bangladeshi Taka",
			BBD: "Barbadian Dollar",
			BYR: "Belarusian Ruble",
			BZD: "Belize Dollar",
			BMD: "Bermudan Dollar",
			BTN: "Bhutanese Ngultrum",
			BTC: "Bitcoin",
			BOB: "Bolivian Boliviano",
			BAM: "Bosnia-Herzegovina Convertible Mark",
			BWP: "Botswanan Pula",
			BRL: "Brazilian Real",
			GBP: "British Pound Sterling",
			BND: "Brunei Dollar",
			BGN: "Bulgarian Lev",
			BIF: "Burundian Franc",
			XOF: "CFA Franc BCEAO",
			XAF: "CFA Franc BEAC",
			XPF: "CFP Franc",
			KHR: "Cambodian Riel",
			CAD: "Canadian Dollar",
			CVE: "Cape Verdean Escudo",
			KYD: "Cayman Islands Dollar",
			CLP: "Chilean Peso",
			CLF: "Chilean Unit of Account (UF)",
			CNY: "Chinese Yuan",
			COP: "Colombian Peso",
			KMF: "Comorian Franc",
			CDF: "Congolese Franc",
			CRC: "Costa Rican Colón",
			HRK: "Croatian Kuna",
			CUC: "Cuban Convertible Peso",
			CUP: "Cuban Peso",
			CZK: "Czech Republic Koruna",
			DKK: "Danish Krone",
			DJF: "Djiboutian Franc",
			DOP: "Dominican Peso",
			XCD: "East Caribbean Dollar",
			EGP: "Egyptian Pound",
			ERN: "Eritrean Nakfa",
			EEK: "Estonian Kroon",
			ETB: "Ethiopian Birr",
			EUR: "Euro",
			FKP: "Falkland Islands Pound",
			FJD: "Fijian Dollar",
			GMD: "Gambian Dalasi",
			GEL: "Georgian Lari",
			GHS: "Ghanaian Cedi",
			GIP: "Gibraltar Pound",
			XAU: "Gold (troy ounce)",
			GTQ: "Guatemalan Quetzal",
			GGP: "Guernsey Pound",
			GNF: "Guinean Franc",
			GYD: "Guyanaese Dollar",
			HTG: "Haitian Gourde",
			HNL: "Honduran Lempira",
			HKD: "Hong Kong Dollar",
			HUF: "Hungarian Forint",
			ISK: "Icelandic Króna",
			INR: "Indian Rupee",
			IDR: "Indonesian Rupiah",
			IRR: "Iranian Rial",
			IQD: "Iraqi Dinar",
			ILS: "Israeli New Sheqel",
			JMD: "Jamaican Dollar",
			JPY: "Japanese Yen",
			JEP: "Jersey Pound",
			JOD: "Jordanian Dinar",
			KZT: "Kazakhstani Tenge",
			KES: "Kenyan Shilling",
			KWD: "Kuwaiti Dinar",
			KGS: "Kyrgystani Som",
			LAK: "Laotian Kip",
			LVL: "Latvian Lats",
			LBP: "Lebanese Pound",
			LSL: "Lesotho Loti",
			LRD: "Liberian Dollar",
			LYD: "Libyan Dinar",
			LTL: "Lithuanian Litas",
			MOP: "Macanese Pataca",
			MKD: "Macedonian Denar",
			MGA: "Malagasy Ariary",
			MWK: "Malawian Kwacha",
			MYR: "Malaysian Ringgit",
			MVR: "Maldivian Rufiyaa",
			MTL: "Maltese Lira",
			IMP: "Manx pound",
			MRO: "Mauritanian Ouguiya",
			MUR: "Mauritian Rupee",
			MXN: "Mexican Peso",
			MDL: "Moldovan Leu",
			MNT: "Mongolian Tugrik",
			MAD: "Moroccan Dirham",
			MZN: "Mozambican Metical",
			MMK: "Myanma Kyat",
			NAD: "Namibian Dollar",
			NPR: "Nepalese Rupee",
			ANG: "Netherlands Antillean Guilder",
			TWD: "New Taiwan Dollar",
			NZD: "New Zealand Dollar",
			NIO: "Nicaraguan Córdoba",
			NGN: "Nigerian Naira",
			KPW: "North Korean Won",
			NOK: "Norwegian Krone",
			OMR: "Omani Rial",
			PKR: "Pakistani Rupee",
			PAB: "Panamanian Balboa",
			PGK: "Papua New Guinean Kina",
			PYG: "Paraguayan Guarani",
			PEN: "Peruvian Nuevo Sol",
			PHP: "Philippine Peso",
			PLN: "Polish Zloty",
			QAR: "Qatari Rial",
			RON: "Romanian Leu",
			RUB: "Russian Ruble",
			RWF: "Rwandan Franc",
			SHP: "Saint Helena Pound",
			SVC: "Salvadoran Colón",
			WST: "Samoan Tala",
			SAR: "Saudi Riyal",
			RSD: "Serbian Dinar",
			SCR: "Seychellois Rupee",
			SLL: "Sierra Leonean Leone",
			XAG: "Silver (troy ounce)",
			SGD: "Singapore Dollar",
			SBD: "Solomon Islands Dollar",
			SOS: "Somali Shilling",
			ZAR: "South African Rand",
			KRW: "South Korean Won",
			XDR: "Special Drawing Rights",
			LKR: "Sri Lankan Rupee",
			SDG: "Sudanese Pound",
			SRD: "Surinamese Dollar",
			SZL: "Swazi Lilangeni",
			SEK: "Swedish Krona",
			CHF: "Swiss Franc",
			SYP: "Syrian Pound",
			STD: "São Tomé and Príncipe Dobra",
			TJS: "Tajikistani Somoni",
			TZS: "Tanzanian Shilling",
			THB: "Thai Baht",
			TOP: "Tongan Paʻanga",
			TTD: "Trinidad and Tobago Dollar",
			TND: "Tunisian Dinar",
			TRY: "Turkish Lira",
			TMT: "Turkmenistani Manat",
			UGX: "Ugandan Shilling",
			UAH: "Ukrainian Hryvnia",
			AED: "United Arab Emirates Dirham",
			USD: "United States Dollar",
			UYU: "Uruguayan Peso",
			UZS: "Uzbekistan Som",
			VUV: "Vanuatu Vatu",
			VEF: "Venezuelan Bolívar Fuerte",
			VND: "Vietnamese Dong",
			YER: "Yemeni Rial",
			ZMK: "Zambian Kwacha (pre-2013)",
			ZMW: "Zambian Kwacha",
			ZWL: "Zimbabwean Dollar",
		},
		render: function() {
			this.utils.render({
				currencies: _.map(this.currencies, function(name, code) {
					return {
						name: name,
						code: code,
						selected: code === "USD"
					};
				})
			});

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

					$.get("https://rate-exchange.herokuapp.com/fetchRate?from=" + from + "&to=" + to, function(d) {
						if (d && d.From == from && d.To == to && d.Rate) {
							cache[from + "-" + to] = parseFloat(d.Rate);
						}

						caching = false;

						cb();
					});
				},
				convert = function(reverse) {
					this.data.from = from.val();
					this.data.to = to.val();

					var conv = 0,
						fr, tov, f, t;

					if (reverse) {
						fr = to.val();
						tov = from.val();
						f = tval.val();
						t = fval;
					}
					else {
						fr = from.val();
						tov = to.val();
						f = fval.val();
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