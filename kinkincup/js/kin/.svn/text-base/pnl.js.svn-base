var PnLObj = function() {
	this.strike = 0;
	this.callQty = 0;
	this.putQty = 0;
	this.manualCallQty = 0;
	this.manualPutQty = 0;
}

var Position = function(obj) {
	/** sample data format  [2012,"12","Dec","P",52.5,-90.0,"HKB"] **/
	if (obj) {
		this.year = obj[0];
		this.month = obj[1];
		this.monthName = obj[2];
		this.callPut = obj[3];
		this.strike = obj[4];
		this.position = obj[5];
		this.prefix = obj[6];
	}
}

var PnL = function(option) {
	this.prefix = option.prefix;

	if (option.positions) { this.list = option.positions; return; }

	//list of Position objects
	this.list = new Array();
	var ll = this.list;

	//convert array to Position obj
	$(option.list).each(function() {
		var p = new Position(this);
		if (!this.prefix || p.prefix === this.prefix) ll.push(p);
	});
}


PnL.prototype.getPnLObjects = function(option) {
	var results = new Array();

	$(this.list).each(function(i, e) {
		
		//criteria specified
		if (e.year && option.year != e.year) return;
		if (e.monthName && option.monthName != e.monthName) return;

		var p;
		$(results).each(function(i, ee) {
			if (e.strike == ee.strike) {
				if (e.callPut === "C") ee.callQty += e.position;
				if (e.callPut === "P") ee.putQty += e.position;
				p = ee;
			}
		});

		if (!p) {
			p = new PnLObj();
			p.strike = e.strike;
			if (e.callPut === "C") p.callQty = e.position;
			if (e.callPut === "P") p.putQty = e.position;
			results.push(p);
		}
	});

	return _.sortBy(results, function(e) { return e.strike; });
};

PnL.prototype.getTrades = function(option) {
	var results = new Array();

	$(this.list).each(function(i, e) {
		
		//criteria specified
		if (e.year && option.year != e.year) return;
		if (e.monthName && option.monthName != e.monthName) return;

		results.push(e);
	});

	return _.sortBy(results, function(e) { return e.strike; });
};

PnL.prototype.getValues = function(option) {
	//option should include spot, prevSpot, year, monthName, step, point
	option.step = parseFloat(option.step);
	option.spot = parseFloat(option.spot);
	option.prevSpot = parseFloat(option.prevSpot);
	option.point = parseFloat(option.point);

	var ll = this.list;
	var results = new Array();
	var pnlRangePercentage = 0.1;
	var ranges = _.range(option.spot - option.step*option.point, option.spot + option.step*option.point, option.step);

	$(ranges).each(function(i, newSpot) {
		var result = 0;

		$(ll).each(function(i, e) {
			
			//criteria specified
			if (e.year && option.year != e.year) return;
			if (e.monthName && option.monthName != e.monthName) return;

			if (e.callPut === "C") {
				result += e.position * (Math.max(newSpot - e.strike, 0) - Math.max(option.prevSpot - e.strike, 0));
			} else {
				result += e.position * (Math.max(e.strike - newSpot, 0) - Math.max(e.strike - option.prevSpot, 0));
			}
		});

		//console.log(newSpot + "|" + result);
		results.push(result);
	});

	return _.zip(ranges, results);
};