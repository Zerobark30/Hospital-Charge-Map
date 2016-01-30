var h = 300;
var w = 500;
var barPadding = 1;
var darkGreen = "rgb(0,109,44)";

var projection = d3.geo.albersUsa()
	.translate([w/2,h/2])
	.scale([500]);


var path = d3.geo.path()
	.projection(projection);

var color = d3.scale.quantize()
	.range(["rgb(237,248,233)", "rgb(186,228,179)",
		"rgb(116,196,118)", "rgb(49,163,84)",darkGreen]);

var svg = d3.select("#map")
	.append("svg")
	.attr("width",w)
	.attr("height",h);

var svg1 = d3.select("#chart")
	.append("svg")
	.attr("width",w)
	.attr("height",h);

var table = d3.select("#tableDiv")
	.append("table")
		.attr("class","table table-striped")
var thead = table.append("thead")
var tbody = table.append("tbody");


d3.csv("background/Joint_charges_by_state.csv",function(data) {
	color.domain([
		d3.min(data, function(d) {return d.Charges;}),
		d3.max(data, function(d) {return d.Charges;})
	]);

	var chartScale = d3.scale.linear()
	.domain([d3.min(data, function(d) {return d.Charges;}),
		d3.max(data, function(d) {return d.Charges;})])
	.range([0,h]);

	d3.json("js/Us_States.json",function(json) {
		for (var i = 0; i < data.length; i++) {
			var dataState = data[i].State;

			var dataValue = parseFloat(data[i].Charges);

			for (var j = 0; j < json.features.length; j++) {
				var jsonState = json.features[j].properties.name;

				if (dataState == jsonState) {
					json.features[j].properties.value = dataValue;
					break;
				}
			}
		}

		svg.selectAll("path")
			.data(json.features)
			.enter()
			.append("path")
			.attr("d",path)
			.attr("class","unselected")
			.style("fill",function(d) {
				var value = d.properties.value;

				if (value) {
					return color(value);
				} else {return "#ccc"};
			})
			.on("mouseover", function(d,i) {
				d3.select(this)
					.attr("class","selected");
				d3.select("#chart")
					.selectAll("rect")
					.attr("class", function(e,j) {
						if (e.properties.name==d.properties.name)
							return "selected";
					});
				d3.select("#tableDiv")
					.selectAll("td")
					.attr("class", function(e,j) {
						if (e.value==d.properties.name || e.value == d.properties.value)
							return "selectedRow";
					});
			})
			.on("mouseout", function(d) {
				d3.select(this)
					.attr("class","unselected");
				d3.select("#chart")
					.selectAll("rect")
					.attr("class", function(e,j) {
						if (e.properties.name==d.properties.name)
							return "unselected";});
				d3.select("#tableDiv")
					.selectAll("td")
					.attr("class", function(e,j) {
						if (e.value==d.properties.name || e.value == d.properties.value)
							return "unselected";
					});
			});

		svg1.selectAll("path")
			.data(json.features
				.sort(function(a,b) {return b.properties.value - a.properties.value}))
			.enter()
			.append("rect")
			.style("fill",darkGreen)
			.attr("x",function(d,i) {
				return i * (w/json.features.length);
			})
			.attr("y",function(d) {
				return h - chartScale(d.properties.value);
			})
			.attr("width",w/json.features.length - barPadding)
			.attr("height",function(d) {
				return chartScale(d.properties.value);})
			.on("mouseover", function(d,i) {
				d3.select(this)
					.attr("class","selected")
				d3.select("#map")
					.selectAll("path")
					.attr("class", function(e,j) {
						if (e.properties.name==d.properties.name)
							return "selected";});
				d3.select("#tableDiv")
					.selectAll("td")
					.attr("class", function(e,j) {
						if (e.value==d.properties.name || e.value == d.properties.value)
							return "selectedRow";
					});
			})
			.on("mouseout", function(d) {
				d3.select(this)
					.attr("class","unselected");
				d3.select("#map")
					.selectAll("path")
					.attr("class", function(e,j) {
						if (e.properties.name==d.properties.name)
							return "unselected";});
				d3.select("#tableDiv")
					.selectAll("td")
					.attr("class", function(e,j) {
						if (e.value==d.properties.name || e.value == d.properties.value)
							return "unselected";
					});
			});

		var columns = ["State", "Charges"];

		thead.append("tr")
			.selectAll("th")
			.data(columns)
			.enter()
			.append("th")
				.text(function(column) {return column;});

		var rows = tbody.selectAll("tr")
			.data(data)
			.enter()
			.append("tr")

		var finder = function(stateOrCharge) {
			for (var i = 0;i < rows[0].length;i++) {
				if (rows.data()[i].State === stateOrCharge || rows.data()[i].Charges === stateOrCharge)
				{
					return i;
				}
			}
		}

		console.log(finder("33444"));


		var cells = rows.selectAll("td")
			.data(function(row) {
				return columns.map(function(column) {
					return {column: column, value:row[column]};
				});
			})
			.enter()
			.append("td")
			//.attr("class",function(d) { return d.value;})
			.html(function(d) {return d.value;})
			.on("mouseover", function(d,i) {
				d3.select(this)
					.attr("class","selectedRow")
				d3.select("#map")
					.selectAll("path")
					.attr("class", function(e,j) {
						if (e.properties.name == d.value || e.properties.value == d.value)
							return "selected";});
				d3.select("#chart")
					.selectAll("rect")
					.attr("class", function(e,j) {
						if (e.properties.name==d.value || e.properties.value == d.value)
						return "selected";
					});
				d3.select("#tableDiv")
					.selectAll("td")
					.attr("class", function(e,j) {
						var spot1 = finder(e.value);
						var spot2 = finder(d.value);
						if (spot1 === spot2)
						return "selectedRow";
					});
			})
			.on("mouseout", function(d) {
				d3.select(this)
					.attr("class","unselected");
				d3.select("#map")
					.selectAll("path")
					.attr("class", function(e,j) {
						if (e.properties.name == d.value || e.properties.value == d.value)
							return "unselected";});
				d3.select("#chart")
					.selectAll("rect")
					.attr("class", function(e,j) {
						if (e.properties.name == d.value || e.properties.value == d.value)
							return "unselected";});
				d3.select("#tableDiv")
					.selectAll("td")
					.attr("class", function(e,j) {
						if (e.value == d.value || e.value == d.value)
							return "unselected";})
			});;

	});
});
