(function() {
	/**
	 * The basic structure of the values is as follows:
	 * 
	 *	baseVal: base value for precomputed numbers.  Defaults to 1
	 * 
	 *	var units = {
	 *		type: {
	 *			name: {
	 *				m: multiplier (value * m),
	 *				a: addend (value + a),
	 *				d: dividend (d / value)
	 *			},
	 *			name: multiplier (value * multiplier),
	 *			baseVal: 0 // Required if not 1
	 *		}
	 *	};
	 */
	var units = {
		Temperature: {
			Celsius: 1,
			Fahrenheit: {
				m: 5 / 9,
				a: -32
			},
			Kelvin: {
				m: 1,
				a: -273.15
			},
			baseVal: 0
		},
		Length: {
			Kilometer: 1E3,
			Meter: 1,
			Centimeter: .01,
			Millimeter: .001,
			Mile: 1609.344,
			Yard: .9144,
			Foot: .3048,
			Inch: .0254,
			"Nautical mile": 1852
		},
		Mass: {
			"Metric ton": 1E3,
			Kilogram: 1,
			Gram: .001,
			Milligram: 1E-6,
			Mcg: 1E-9,
			"Long ton": 2240 * .45359237,
			"Short ton": 907.18474,
			Stone: 6.35029318,
			Pound: .45359237,
			Ounce: .028349523125
		},
		Speed: {
			"Miles/hour": 1.609344,
			"Feet/sec": 1.09728,
			"Meters/sec": 3.6,
			"Km/hour": 1,
			Knot: 1.852
		},
		Volume: {
			"US gal": 3.785411784,
			"US quart": .946352946,
			"US pint": .473176473,
			"US cup": .2365882365,
			"US oz": .0295735295625,
			"US tbsp.": .01478676478125,
			"US tsp.": .00492892159375,
			"Cubic meter": 1E3,
			Liter: 1,
			Milliliter: .001,
			"Imperial gal": 4.546091879,
			"Imperial quart": 1.13652296975,
			"Imperial pint": .568261484875,
			"Imperial oz": 4.546091879 / 160,
			"Imperial tbsp.": 4.546091879 / 256,
			"Imperial tsp.": 4.546091879 / 768,
			"Cubic foot": 28.3168466,
			"Cubic inch": .016387064
		},
		Area: {
			"Square km": 1E6,
			Hectare: 1E4,
			"Square meter": 1,
			"Square mile": 2589988.110336,
			Acre: 4046.8564224,
			"Square yard": .83612736,
			"Square foot": .09290304,
			"Square inch": 6.4516E-4
		},
		"Fuel consumption": {
			"MPG (US)": .425143707430272,
			"MPG (imp.)": .35400604361608423,
			"Km/liter": 1,
			"Liter/100km": {
				d: 100
			}
		},
		Time: {
			Nanosecond: 1E-9,
			Microsecond: 1E-6,
			Millisecond: .001,
			Second: 1,
			Minute: 60,
			Hour: 3600,
			Day: 86400,
			Week: 604800,
			Month: 31556926 / 12,
			Year: 31556926,
			Decade: 315569260,
			Century: 3155692600
		},
		"Digital Storage": {
			Bit: 1,
			Byte: 8,
			Kilobit: 1E3,
			Kilobyte: 8E3,
			Kibibit: Math.pow(2, 10),
			Kibibyte: Math.pow(2, 13),
			Megabit: 1E6,
			Megabyte: 8E6,
			Mebibit: Math.pow(2, 20),
			Mebibyte: Math.pow(2, 23),
			Gigabit: 1E9,
			Gigabyte: 8E9,
			Gibibit: Math.pow(2, 30),
			Gibibyte: Math.pow(2, 33),
			Terabit: 1E12,
			Terabyte: 8E12,
			Tebibit: Math.pow(2, 40),
			Tebibyte: Math.pow(2, 43),
			Petabit: 1E15,
			Petabyte: 8E15,
			Pebibit: Math.pow(2, 50),
			Pebibyte: Math.pow(2, 53)
		}
	};


	/**
	 * Given a type, from and to units and an amount, converts the provided amount
	 *
	 * @api    private
	 * @param  {String} type       The type of unit to convert
	 * @param  {String} from       The unit to convert from
	 * @param  {String} to         The unit to convert to
	 * @param  {Number} [amount=1] The amount to convert
	 * @return {String|Number}     The converted number or an error
	 */
	var convert = function(type, from, to, amount) {
		type = units[type];

		if (!type) return "Invalid unit type";

		to = type[to];
		from = type[from];

		if (!to) return "Invalid to unit";
		if (!from) return "Invalid from unit";

		if (typeof type.baseVal === "number") {
			base = type.baseVal;
		}
		else {
			base = 1;
		}

		amount = amount || 1;


		if (typeof from === "number") {
			from = from * amount;
		}
		else if (from.d) {
			from = from.d / amount;
		}
		else {
			from = (amount + (from.a || 0)) * (from.m || 0);
		}

		if (typeof to === "number") {
			amount = from / to;
		}
		else if (to.d) {
			amount = to.d / from;
		}
		else {
			amount = from / (to.m || 0) - (to.a || 0);
		}

		return amount;
	};

	return (window.convert = convert);
})();



for i18n:

var units: {
	typeAbbr: {
		unitAbbr: 1
	}
};

var i18n: {
	typeAbbr: {
		label: "Type",
		unitAbbr: "Unit Name"
	}
};

<select>
	<option value="unitAbbr">i18n.typeAbbr.unitAbbr</option>
</select>