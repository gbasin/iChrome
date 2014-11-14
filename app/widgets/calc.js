/*
 * The Calculator widget.
 */
define(["jquery"], function($) {
	return {
		id: 28,
		size: 4,
		order: 5.5,
		nicename: "calc",
		sizes: ["tiny", "small", "medium"],
		settings: [
			{
				type: "size"
			}
		],
		config: {
			size: "medium"
		},
		render: function() {
			/*
				This calculator works for the most part, but can't really be expanded.

				If it needs to be it should be rewritten so problems are stored as an array, like so:

					["2", " x ", "3.14", " + ", ["2", " x ", ["sqrt", ["2", " + ", "3"]]]]

				That would be rendered as: 2 x 3.14 + (2 x √(2 + 3)).

				The syntax can be easily expanded so the calculator supports sin, cos, tan, square roots, exponents, etc.

				This also makes decimal point validation easier, and makes sure there are no missing parentheses or consecutive operators.

				But, right now it's unnecessary.
			*/

			this.utils.render();

			var btns = this.elm.find("button"),
				display = this.elm.find(".display"),
				d0 = display[0],
				overwrite = false,
				nums = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
				f;

			var calculate = function() {
				var problem = d0.value
					.replace(/×/g, "*") // Multiplication symbol with *
					.replace(/x/gi, "*") // x with *
					.replace(/÷/g, "/") // Division symbol with /
					.replace(/[^ +\-()1234567890*\/\.]|[\-+\/\*\.]{2}/g, "") // Replace all invalid characters
					.replace(/ {1,}/g, " ") // Multiple spaces
					.replace(/([0-9]) ([0-9])/g, "$1$2") // Spaces in numbers
					.replace(/[0-9\.]+/g, function(match) { // Handle multiple decimal places within a number
						f = true;

						return " " +
								match.replace(/\./g, function() {
									return (f && !(f = false)) ? "." : "";
								})
							+ " ";
					})
					.replace(/ {1,}/g, " ") // Multiple spaces
					.replace(/([0-9]) ?\(/g, "$1 * (") // Handle parentheses adjacent to numbers by multiplying them
					.replace(/\) ?([0-9])/g, ") * $1") // Again
					.trim();

				if (problem.indexOf("(") !== -1 || problem.indexOf(")") !== -1) {
					// Modified from: http://stackoverflow.com/a/14369329/900747
					var check = function(str) {
						var s;

						str = str.replace(/[^()]/g, "");

						while (s != str) { 
							s = str;

							str = str.replace(/\(\)/g, "");
						}

						return !str;
					};

					while ((problem.match(/\(/g) || "").length > (problem.match(/\)/g) || "").length) {
						problem += ")";
					}

					while ((problem.match(/\)/g) || "").length > (problem.match(/\(/g) || "").length) {
						problem = "(" + problem;
					}

					if (!check(problem)) {
						d0.value = this.utils.translate("mismatch");
					}
				}

				try {
					var answer = eval(problem);

					if (typeof answer !== "number" || isNaN(answer)) {
						d0.value = this.utils.translate("error");
					}
					else if (answer == Infinity || answer == -Infinity) {
						d0.value = this.utils.translate("infinity");
					}
					else {
						d0.value = +answer.toFixed(8); // Maximum of 8 decimal places
					}
				}
				catch(e) {
					d0.value = this.utils.translate("error");
				}

				overwrite = true;
			};

			btns.on("click", function(e) {
				e.preventDefault();

				var which = this.getAttribute("data-id"),
					value,
					num = false;

				if (nums.indexOf(which) !== -1) {
					value = which;

					num = true;
				}
				else {
					switch (which) {
						case "oparen":
							value = "(";
						break;
						case "cparen":
							value = ")";
						break;
						case "plus":
							value = " + ";
						break;
						case "minus":
							value = " - ";
						break;
						case "multiply":
							value = " × ";
						break;
						case "divide":
							value = " ÷ ";
						break;
						case "decimal":
							value = ".";
						break;
						case "clear":
							d0.value = "";
						break;
						case "equals":
							calculate();
						break;
					}
				}

				if (value) {
					if ((overwrite && !num) || !overwrite) {
						/*var start = d0.selectionStart;

						d0.value = d0.value.slice(0, start) + value + d0.value.slice(d0.selectionEnd);

						d0.setSelectionRange(start, start);*/

						d0.value += value;
					}
					else {
						d0.value = value;
					}

					overwrite = false;
					
					d0.focus();
				}
			});

			display.on("keydown", function(e) {
				if (e.which == 13) {
					calculate();
				}
			}).on("input", function(e) {
				var val = d0.value.replace(/[^ +\-()1234567890*\/×x\.÷]/g, "");

				if (d0.value != val) {
					var start = d0.selectionStart - 1, // These are -1 since the cursor is just after the entered text and we want to be before
						end = d0.selectionEnd - 1;

					d0.value = val;

					d0.setSelectionRange(start, end);
				}
			}).on("focusout", function(e) {
				d0.value = d0.value // See calculate() for comments
					.replace(/[^ +\-()1234567890*\/x\.×÷]|[\-+\/\*\.]{2}/g, "")
					.replace(/[0-9\.]+/g, function(match) {
						f = true;

						return " " +
								match.replace(/\./g, function() {
									return (f && !(f = false)) ? "." : "";
								})
							+ " ";
					})
					.replace(/ {1,}/g, " ")
					.replace(/\( /g, "(")
					.replace(/ \)/g, ")")
					.replace(/([+\-x×÷*\/])(\()|(\))([+\-x×÷*\/])/g, "$1 $2")
					.trim();
			});
		}
	};
});