ShiftHistory = Backbone.Model.extend({ 
	idAttribute:'code',
});
ShiftHistories = Backbone.Collection.extend({ 
	model: ShiftHistory,
	parse: function(msg) {
		var that = this;
		// try {
		  msg = _.isObject(msg)? msg: JSON.parse(msg);
		  $(msg).each(function() {
		  	this.className = this.code.replace(".","");
		  	this.underlying = that.underlying(this.code);
		  	this.mat = that.mat(this.code);

		    var bean = that.get(this.code);
		    bean? bean.set(this): that.add(this);
		  });
		// } catch (e) {
		//   console.log(e);
		// }
	},

	underlying: function(code) {
		return code.substring(0,3);
	},

	mat: function(code) {
		var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
		var month = code.substring(code.length-2, code.length-1);
		var year = "1" + code.substring(code.length-1);
		return months[("ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(month) % 12)] + "-" + year ;
	}
}); 

ShiftHistoryView = Backbone.View.extend({
	sort: function() {
	    var trs = $(this.el).find('tbody>tr');
	    trs = _.sortBy(trs, function(tr) { 
	    	var code = $(tr).find('td').first().text();
	    	return code.substr(0,3) + code.substr(code.length-2) + code.substr(code.length-5); 
	    });
	    $(this.el).find('tbody').html(trs);
	},

	calMaturity: function(mat) {
		var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
		var month = mat[0];
		var year = "1" + mat[1];
		return months[("ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(month) % 12)] + "-" + year ;
	},

	calCallput: function(mat) {
		return mat[0] < "M"? "C": "P";
	},

	addRow: function(obj) {
		if (obj.get('shift') === 0) return;

		$(this.el).find('table tbody').append(
			'<tr name="'+obj.get('className')+'">' +
				'<td>' + obj.get('code') + '</td>' +
				'<td>' + this.calCallput(obj.get('code').substr(obj.get('code').length-2)) + '</td>' +
				'<td>' + obj.get('code').substr(3, obj.get('code').length-5) + '</td>' +
				'<td>' + this.calMaturity(obj.get('code').substr(obj.get('code').length-2)) + '</td>' +
				'<td>' + obj.get("shift") + '</td>' +
				'<td>' + obj.get('timestamp') + '</td>' +
				'<td>' + obj.get('msg') + '</td>' +
			'</tr>'
		)

		this.sort();
	},

	changeRow: function(obj) {
		var tr = $(this.el).find('table tbody tr[name=' + obj.get('className') + ']');
		if (tr.length === 0) this.addRow(obj);
		else {
			$(tr).find('td:eq(0)').html(obj.get('code'));
			$(tr).find('td:eq(1)').html(this.calCallput(obj.get('code').substr(obj.get('code').length-2)));
			$(tr).find('td:eq(2)').html(obj.get('code').substr(3, obj.get('code').length-5));
			$(tr).find('td:eq(3)').html(this.calMaturity(obj.get('code').substr(obj.get('code').length-2)));
			$(tr).find('td:eq(4)').html(obj.get("shift"));
			$(tr).find('td:eq(5)').html(obj.get('timestamp'));
			$(tr).find('td:eq(6)').html(obj.get('msg'));
			$(tr).stop(true,true).effect('hightlight', {}, 2000);
		}

		this.sort();
	},

	removeRow: function(obj) {
		$(this.el).find('table tbody tr[name="' + obj.get('className') + '"]').remove();
	},

	initialize: function() {
		var that = this;

		this.collection.on('add', function(obj) { that.addRow(obj); });

		this.collection.on('change', function(obj) {
			obj.get('shift') === 0? that.removeRow(obj): that.changeRow(obj);
		});
	}
});

ShiftHistoryView2 = Backbone.View.extend({

	changeRow: function(obj) {
		var list = this.collection.where({ 
			mat: obj.get('mat'), underlying: obj.get('underlying')
		});
		list = _.filter(list, function(e) { return e.get('shift') != 0; });	

		var e = $('.'+obj.get('mat')).find('.toshift')[_(this.headers).indexOf(obj.get('underlying'))];
		if (e) {
			$(e).text(list.length);
			a.cheshire({"elems": ['.'+obj.get('mat')+'.toshift-w.'+obj.get('underlying')],"delay": {"value": "0ms","randomness": "80%"},"duration": {"value": "500ms","randomness": "80%"},"timing": "ease","iteration": "1","direction": "normal","playstate": "running","move": "","rotate": "0%","flip": "","turns": "1","fade": "","scale": {"from": "70%","to": "100%"},"shadow": "true","overshoot": "0%","perspective": "1000","perspectiveOrigin": "center","backfaceVisibility": "visible"});
		}
	},

	events: {
		'click .btn-danger': 'clicked'
	},

	clicked: function(obj) {
		var ss = $(obj.currentTarget).attr('class').split(' ');
		var u = _(ss).last(); 
		var m = _(ss).chain().pop().last().value();

		var list = this.collection.where({ 
			mat: m, underlying: u
		});
		list = _.filter(list, function(e) { return e.get('shift') != 0; });

		$(obj.currentTarget).popover({
			title: 'Instruments',
			content: function() {
			    var table_obj = "<table class='table table-condensed' >";
			    $.each(JSON.parse(JSON.stringify(list)), function(index, item){
			         table_obj += '<tr><td>'+item.code+'</td><td>'+item.shift+'</td><td>'+item.msg+'</tr>';
			    })
			    table_obj += "</table>";
			    return table_obj;
			}
		});
		$(obj.currentTarget).popover('toggle');	

	},

	initialize: function() {
		var that = this;

		this.collection.on('add change', function(obj) { that.changeRow(obj); });
		this.headers = _.map($('thead th'), function(e) { return $(e).text().trim(); });
	}
})