//Singleton class, no need to instantiate
COMMON = new function() {

	this.loading = function(show) {
		if ($('#loading').length == 0) {
			$('body').prepend('<div id=loading><img src="loading.gif"/></div>');
		}
	
		if (show) {
			$('#loading').show('fade');
		} else {
			$('#loading').hide('fade');
		}
	}

	this.msg = function (message, mode, delay) {
		mode = mode? "msg"+mode: "positive";
		delay = delay || 30000;
		
		var div = $('<div style="display:none"></div>');
		$('#ss_notice').prepend($(div).append(JSON.stringify(message)).addClass(mode+""));
		$(div).fadeIn("fast").delay(delay).fadeOut(function() { $(this).remove(); });
	};  	
	
	this.normalfill = function(div, object, effect) {
		effect = effect || "fade";
		var sample = $(div).find(".sample:last").clone().removeClass("sample").hide();
		sample = sample[0];
		sample = COMMON.autofill(sample, object);
		$(sample).data('obj', object);
		$(div).find(".sample").after($(sample));
		$(sample).addClass(object.error).show(effect); //.delay(30000).fadeOut(function() { $(this).remove(); });;
		return sample;
	}
	
	this.fill = function(div, object) {
	
	}
	
	this.autofill = function(div, object, noeffect) {
		noeffect = noeffect || false;
		var sample = $(div).find('.sample:first');
		var e;
		if ($(sample).length > 0) {
			e = $(sample).clone().removeClass('sample').hide().insertAfter(sample);
			if (!noeffect) $(e).toggle('slide').effect('highlight');
			else $(e).show().effect('highlight');
			$(e).data('obj', object);
		} else {
			e = $(div);
		}
		
		var that = this;
		try{
			for (var key in object) {
				if ($.isArray(object[key])) {
					for (var i=0; i<object[key].length; i++) {
						$.each($(e).find('.'+key+"-"+i+""), function() {
							$(this).empty().html(object[key][i]);
							COMMON.format(this);
						});
					}
					$(e).find('.'+key).empty().html(JSON.stringify(object[key]));
				} else if (typeof(object[key]) == "object") {
					for (var keyy in object[key]) {
						$.each($(e).find('.'+keyy), function() {
							$(this).empty().html((object[key][keyy]+"").replace(/\r\n/g, "<br>"));
							//COMMON.format(this);
						});
					}
				} else {
					$.each($(e).find('.'+key), function() {
						var value = (object[key]+"").replace(/\r\n/g, "<br>");
						$(this).empty().html(that.isNumber(value)? $.formatNumber(value, {format:"#,##0.###"}): value);
						//COMMON.format(this);
					});
				}
			}		
		}catch(e) { alert(e); }
		
		return e;
	}
	
	this.isNumber = function(n) {
  		return !isNaN(parseFloat(n)) && isFinite(n);
	}

	this.format = function(e) {
		var newValue = oldValue = parseFloat($(e).html());
	
		if ($(e).hasClass('dec2')) newValue = newValue.toFixed(2);
		if ($(e).hasClass('dec3')) newValue = newValue.toFixed(3);

		if (oldValue+"" != newValue+"") {
			$(e).empty().html(newValue);
			if ($(e).hasClass('highlight')) $(e).stop(true,true).effect('highlight', {color:'black'}, 150);
		}
		
		return e;		
	}	
	
	this.jsonToTable = function(object) {
		var table = $('<table></table>');
		$(table).attr('title', JSON.stringify(object));

		//object = _.flatten(object);
		
		//print header
		if (typeof(object)=='object') {
			var header = $('<tr></tr>');
			for (var key in object) {
				$(header).append('<th>'+key+'</th>');
			}
			$(table).append(header);
		} else if (object[0]) {
			if (typeof(object[0])=='string') {
				$(table).append("<tr><th>String</th></tr>");
			} else {			
				var header = $('<tr></tr>');
				for (var key in _.flatten(object[0])) {
					$(header).append('<th>'+key+'</th>');
				}
				$(table).append(header);
			}
		}
		
		if (object[0] && typeof(object)!='string') {
			$.each(object, function() {			
				if (typeof(object[0])=='string') {
					var s = this.replace(/\\n/mgi, "<br>");
					var s = s.replace(/\\"/mgi, '"');
					$(table).append("<tr><td>"+s+"</td></tr>");
				} else {
					var obj = _.flatten(this);
					var row = $('<tr></tr>');
					for (var key in obj) {
						$(row).append('<td>'+obj[key]+'</td>');
					}
					$(table).append(row);
				}
			});
		} else if (typeof(object)=='object') {
			var row = $('<tr></tr>');
			for (var key in object) {
				$(row).append('<td>'+object[key]+'</td>');
			}
			$(table).append(row);
		} else if (typeof(object)=='string') {
			var lines = object.match(/\n/g).length + 1;
			var s = object.replace(/\\n/mgi, "<br>");
			var s = s.replace(/\\"/mgi, '"');
			var e = $("<textarea></textarea>").css('height', 15 * lines).css('width','400px').val(s);
			$(table).append("<tr><td></td></tr>");
			$(table).find('td').append(e);
			
		} else {
			console.log("unknown message format.");
		}
		
		return table;
	}	
};