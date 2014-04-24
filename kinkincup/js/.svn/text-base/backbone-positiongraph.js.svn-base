$.fn.graphup.colorMaps.myColorMap = [[230,200,230], [130,100,130]]; 
$.fn.graphup.colorMaps.redMap = [[200,0,0], [245,210,210]]; 
$.fn.graphup.colorMaps.blueMap = [[210,210,245],[0,0,200]]; 

Backbone.sync = function(method, model, option) {
  console.log(method + "|" + JSON.stringify(model) + "|" + JSON.stringify(option));
  //sendMsg(option);
};

PositionGraph = Backbone.View.extend({

  initialize: function(options) {    
    _.bindAll(this);
    this.header = $(this.el).find('.renderheader');
    this.table = $(this.el).find('.rendertable');
    this.aType = $(this.el).find('.aggregateType');
    this.type = "position";
  },

  valueSelect: function(type, reply) {
    console.log('PositionGraph: valueSelect('+type+')');
    type = type || "position";
    reply = reply || positions;
    
    this.type = type;
    var newPositions = new Array();

    var spot = parseFloat($('#limit .last').text()); 
    var usd = parseFloat($('[name=usd]').val());
    $(reply).each(function() {
      if (type === "vega") this[5] = this[11] * this[10] / usd;
      if (type === "gamma") this[5] = this[12] * spot * spot * this[10] / usd / 100.0 / 1000.0;
      if (type === "position") this[5] = this[10];
      this[5] = Math.round(this[5]);
      newPositions.push(this);
    });
    return newPositions;
  },

  aggregateByType: function(aggregateType, rows) {
    $.each(_.flatten(rows), function(i, subrow) {
      if (aggregateType == 'C-P' && subrow[3]=='P') {
        subrow[5] = subrow[5] * -1;
      } else if (aggregateType == 'P-C' && subrow[3]=='C') {
        subrow[5] = subrow[5] * -1;
      }
    });

    return rows;
  },

  reRender: function(e) {
    if ($(this.el).find('[name=valueType]').length > 0 &&
        $(this.el).find('[name=valueType]').val() != "position") {
      $(this.el).find('[name=aggregateType]').val("C+P");
    }

    this.render();
    return true;
  }, 

  render: function(reply) { 
    // console.log("Render PositionGraph()");
    var that = this;

    // try {
      var valueType = $(this.el).find('[name=valueType]').val();
      reply = this.valueSelect(valueType, reply);

      var ee = reply;
      ee = _.filter(ee, function(i) { return i[6]==ul.get('value'); });
      //positions = ee;

      /***************** process table ****************/
      /***************** process table ****************/
      var rowsHeader = _.chain(ee)
                .map(function(i) { return groupByCondition(i); })
                .uniq()
                .sortBy(function(i){return i;}).value();
      var colsHeader = _.chain(ee)
                .map(function(i) { return groupCondition(i[4], i[6]); })
                .uniq()
                .sortBy(function(i) { return i; }).value();



      var rows = _.groupBy(ee, function(i) { return groupByCondition(i); });

      var aggregateType = $(this.aType).val();
      rows = this.aggregateByType(aggregateType, rows);

      var table = this.table;
      $(table).empty();

      var header = this.header;
      $(header).empty();
      if (aggregateType == 'Syn') {
        $(header).html("<th colspan=2></th>");
      } else {
        $(header).html("<th></th>");
      }
      $(table).empty().append(header);
      
      //print header
      $.each(colsHeader, function(i, e) {
        $(header).append('<th>'+e+'</th>');
      });     
      $(header).append('<th>Sum</th>');

      //print rows
      var slong, sshort;
      $.each(rowsHeader, function(i, e) {
        //print row header
        var tr = $('<tr></tr>');    
        var count = 0;
        $.each(e.split('-'), function(ii, field) {
          $(tr).append('<th>'+e+'</th>');
          count++;
        });
        if (aggregateType == 'Syn') {
          $(tr).append('<td><table><tr><th>Call-Put</th></tr><tr><th>Put-Call</th></tr></table></td>');
          count++;
        }
        
        $(this.table).find('th').first().attr('colspan', count);

        // print cells
        $.each(colsHeader, function(iii, strike) {
          //var source = _.filter(rows[e], function(i) { return (groupCondition(i[4]) == strike) });

          if (aggregateType == 'C') {
            var qty = 0;
            $.each(rows[e], function(i, e) { 
              if (groupCondition(e[4]) == strike && e[3] === 'C') qty += e[5];
            });
            
            if (qty) { //found
              var td = $('<td class=cp>'+qty+'</td>');
              $(tr).append(td);
              $(td).on('mouseover', function(event) { 
                pop(COMMON.jsonToTable(
                  _.map(
                    _.filter(rows[e], function(i) { return (groupCondition(i[4], i[6]) == strike) }), 
                    that.popFunction
                  )
                ), event);
              });
              $(td).on('mouseout', function(event) { unpop(); });
            } else {
              $(tr).append('<td class=empty></td>');
            }
          } else if (aggregateType == 'P') {
            var qty = 0;
            $.each(rows[e], function(i, e) { 
              if (groupCondition(e[4]) == strike && e[3] === 'P') qty += e[5];
            });
            
            if (qty) { //found
              var td = $('<td class=cp>'+qty+'</td>');
              $(tr).append(td);
              $(td).on('mouseover', function(event) { 
                pop(COMMON.jsonToTable(
                  _.map(
                    _.filter(rows[e], function(i) { return (groupCondition(i[4], i[6]) == strike) }), 
                    that.popFunction
                  )
                ), event);
              });
              $(td).on('mouseout', function(event) { unpop(); });
            } else {
              $(tr).append('<td class=empty></td>');
            }
          } else if (aggregateType == 'C+P') {
            var qty = _.map(rows[e], function(i) { if (groupCondition(i[4], i[6]) == strike) return i[5]; else return 0; });

            if (_.filter(qty, function(e) { return e!=0; }).length > 0) { //found
              qty = _.reduce(qty, function(a,b) { return a+b; }, 0);
              var td = $('<td class=cp>'+qty+'</td>');
              $(tr).append(td);
              $(td).on('mouseover', function(event) { 
                pop(COMMON.jsonToTable(
                  _.map(
                    _.filter(rows[e], function(i) { return (groupCondition(i[4], i[6]) == strike) }), 
                    that.popFunction
                  )
                ), event);
              });
              $(td).on('mouseout', function(event) {
                unpop();
              });
            } else {
              $(tr).append('<td class=empty></td>');
            }
          } else {
            // C + Math.abs(-P)
            slong = _.map(rows[e], function(i) { 
              if (groupCondition(i[4], i[6]) == strike) {
                if (i[3] == "C" && i[5] > 0) return Math.abs(i[5]);
                if (i[3] == "P" && i[5] < 0) return Math.abs(i[5]);
                return 0;
              }                     
              else return 0; 
            });
            slong = _.reduce(slong, function(a,b) { return a+b; }, 0);
            
            // C + Math.abs(-P)
            sshort = _.map(rows[e], function(i) { 
              if (groupCondition(i[4], i[6]) == strike) {
                if (i[3] == "C" && i[5] < 0) return Math.abs(i[5]);
                if (i[3] == "P" && i[5] > 0) return Math.abs(i[5]);
                return 0;
              }                     
              else return 0; 
            });
            sshort = _.reduce(sshort, function(a,b) { return a+b; }, 0);
            
            if (slong > 0 || sshort > 0) {
              var tt = $('<table class=syn></table>');
              if (slong > 0) $(tt).append('<tr><td class=sl>'+slong+'</td></tr>');
              else $(tt).append('<tr><td class=empty>&nbsp;</td></tr>');
              
              if (sshort > 0) $(tt).append('<tr><td class=ss>'+sshort+'</td></tr>');
              else $(tt).append('<tr><td class=empty>&nbsp;</td></tr>');

              var ttwrap = $('<td style="padding:0px"></td>').append(tt);
              
              $(tr).append(ttwrap);
            } else {
              $(tr).append('<td class=empty></td>');
            }
          }        
        });             

        $(table).append(tr);

        //rename the row th to suit display
        var tt = $(tr).find('th').first().html().split(" ");
        $(tr).find('th').first().html(tt[2] + "-" + tt[0].substring(2)).addClass('row');
        
      });
          
      //apply coloring
      try { $(table).find('table.syn td.ss').graphup({colorMap: 'myColorMap', painter:'fill', cleaner:'strip'}); } catch(e) {  }
      try { $(table).find('table.syn td.sl').graphup({colorMap: 'greenPower', painter:'fill', cleaner:'strip'}); } catch(e) {  }
      try { 
        // $(table).find('td.cp').graphup({colorMap: 'redMap', painter:'fill', cleaner:'strip'}); 
        try { var list = $(_.filter($(table).find('td.cp'), function(e) { return $(e).html() > 0; })); if (list.length > 1) $(list).graphup({colorMap: 'blueMap', painter:'fill', cleaner:'basic'});} catch(e) {  }
        try { var list = $(_.filter($(table).find('td.cp'), function(e) { return $(e).html() <= 0; })); if (list.length > 1) $(list).graphup({colorMap: 'redMap', painter:'fill', cleaner:'basic'});} catch(e) {  }
        //apply text coloroing
        $(table).find('td.cp, td.sl, td.ss').each(function() {
          try {
            var bg = $(this).css('background-color');
            bg = bg.substr(4).replace('(','').replace(')','').replace(/\s+/igm,'').split(',');
            bg = (parseInt(bg[0])+parseInt(bg[1])+parseInt(bg[2])) / 3;
            if (bg < 150 && bg > 0) {
              $(this).css('color', '#FFF');
            } else {
              $(this).css('color', '#000');
            }
          }catch(e) { console.log(e); }
        });
      } catch(e) { console.log(e); }

      //fill empty rows alternatively
      $(table).find('>tbody>tr:even .empty').addClass('empty1');
      $(table).find('>tbody>tr:odd .empty').addClass('empty2');

      //add total field at edge
      this.addTotal($(table), ee);

      //display
      $(table).parents('.window').show();

      //update chart 
      // var list = _.map($(table).find('.row'), function(e) { return "<option value='" + $(e).html() + "'>" + $(e).html() + "</option>"; }); 
      // $('select[name=monthChoice]').each(function() {
      //   $(this).html(list.join(" "));
      //   $(this).val($(this).val());
      // });

      //potential mem leak
      // $(table).find('tr').click(function(e) {
      //   if(e.target.nodeName === "SELECT") return;

      //   var newValue = $(this).find('th').first().text();
      //   $('select[name=monthChoice]').val(newValue);
      //   $(this).find('.row').effect('highlight');
      //   generateGraph();
      //   generatePnLGraph();
      // });
      
      //this.filterTable(table, $(this.el).find('[name=low]').val(), $(this.el).find('[name=high]').val());
    // }catch(e) {
    //   console.log(e);
    // }
  },

  addTotal: function(table, data) {
  
    //row
    $(table).find('>tbody>tr').each(function(i, e) {
      var tr = this;
      var sum0 = 0;
      var sum1 = 0;
      var sum2 = 0;

      $(tr).find('td.cp').each(function() {
        sum0 += parseFloat($(this).text());
      });

      sum0 = Math.round(sum0*1000) / 1000.0;
      if (sum0 != 0) {
        $(tr).append('<td class=rowsum>'+sum0+'</td>');
        return;
      }

      //for the synthetics
      $(tr).find('td.sl').each(function() {
        sum1 += parseFloat($(this).text());
      });
      $(tr).find('td.ss').each(function() {
        sum2 += parseFloat($(this).text());
      });

      sum1 = Math.round(sum1*1000) / 1000.0;
      sum2 = Math.round(sum2*1000) / 1000.0;

      if(sum1 != 0 || sum2 != 0) {
        $(tr).append('<td class=rowsum><table><tr><td class=sl>'+sum1
            +'</td></tr><tr><td class=ss>'+sum2+'</td></tr></table></td>');
      } else {
        //default
        if (i > 0) $(tr).append('<td class=rowsum></td>');
      }               
    });
  
    //column
    var tr = $('<tr></tr>');
    $(tr).append('<th>Sum</th>');
    
    var tdLength = $(table).find('tr:eq(1)>td').length;
    $(_.range(tdLength)).each(function(i) {
      var count = 0;
      var sum0 = 0;
      var sum1 = 0;
      var sum2 = 0;
      $(table).find('>tbody>tr').find('>td:eq('+i+')').each(function() {
        var num = parseFloat($(this).text());
        if (!_.isNaN(num)) {
          sum0 += num;
        }
        
        $(this).find('td.sl').each(function() {
          sum1 += parseFloat($(this).text());
        });
        
        $(this).find('td.ss').each(function() {
          sum2 += parseFloat($(this).text());
        });

      });   
      sum1 = Math.round(sum1*1000) / 1000.0;
      sum2 = Math.round(sum2*1000) / 1000.0;
      sum0 = Math.round(sum0*1000) / 1000.0;    
      
      if(sum1 != 0 || sum2 != 0) {
        $(tr).append('<td class=rowsum><table><tr><td>'+sum1
            +'</td></tr><tr><td>'+sum2+'</td></tr></table></td>');
      } else if (sum0 != 0) {
        $(tr).append('<td class=rowsum>'+sum0+'</td>');
      } else {      
        if ($('#aggregateType').val() == 'Syn') {
          $(tr).append('<td><table><tr><th>Call-Put</th></tr><tr><th>Put-Call</th></tr></table></td>');
          count++;
        } else {
          $(tr).append('<td class=rowsum></td>');
        }           
      }
    });
    
    $(table).append(tr);    
  },

  popFunction: function(e) {
    return [e[3], e[10]];
  },

  filterTable: function(table, low, high) {
    var toHide = new Array();
    $(table).find('tr:eq(0)').find('th').each(function(i, e) {
      var strike = parseInt($(this).text());
      if (strike === "Sum") return;
      if (strike < low || strike > high) toHide.push(i);
    });
    $(toHide).each(function(i, e) {
      $(table).find('>tbody>tr').each(function(ii, ee) {
        if (ii==0) $(this).find('>th:eq('+(e)+')').hide();
        else {
          var num = $('#aggregateType').val() == 'Syn'? e: e-1;
          $(this).find('>td:eq('+(num)+')').hide();
        } 
      });
    });

    $(this.el).find('content').effect('highlight');
  },

  events: {
    'change select,input': 'reRender'
  }
});

TodayPositionGraph = PositionGraph.extend({

  popFunction: function(e) {
    return [e[3], e[10]-e[7]];
  },

  valueSelect: function(type, reply) {
    console.log('PositionGraph: valueSelect('+type+')');
    type = type || "position";
    reply = reply || positions;
    
    this.type = type;
      var newPositions = new Array();

      var spot = parseFloat($('#limit .last').text()); 
      var usd = parseFloat($('[name=usd]').val());
      //console.log("Spot: " + spot);
      $(reply).each(function() {
        if (type === "vega") this[5] = this[8] * (this[10] - this[7]) / usd;
        if (type === "gamma") this[5] = this[9] * spot * spot * (this[10] - this[7]) / usd / 100.0 / 1000.0;
        if (type === "position") this[5] = this[10] - this[7];
        this[5] = Math.round(this[5]);
        newPositions.push(this);
      });
      return newPositions;
  }
});