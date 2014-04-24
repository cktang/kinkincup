App.GroupTypeView = App.SelectView.extend({ 
	sqlTemplate: "SELECT DISTINCT group_auto_id AS value, group_name AS name FROM pl_group WHERE user_auto_id={{userAutoId}}",
	map: function(val) {
		return val;
	}
});

App.ClassTypeView = App.SelectView.extend({ 
	sqlTemplate: "SELECT DISTINCT class_auto_id AS value, class_name AS name FROM pl_class",
	map: function(val) {
		return val;
	}
});

App.PaperTypeView = App.SelectView.extend({ 
	sqlTemplate: "SELECT DISTINCT paper_type AS value, paper_type AS name FROM paper",
	map: function(val) {
		if (val === 'TEST') return '測驗';
		if (val === 'EX') return '功課';
		if (val === 'UPGRADE') return '增潤';
		if (val === 'DOWNGRADE') return '補充';
		return val;
	}
});

App.QuestionLevelView = App.SelectView.extend({ 
	sqlTemplate: "SELECT DISTINCT qb_level AS value, qb_level AS name FROM qb",
	map: function(val) {
		if (val === '1') return '低';
		if (val === '2') return '中';
		if (val === '3') return '高';
		return val;
	}
});

App.SearchClassTableView = App.TableView.extend( 
	_.extend({},
		App.Mixins.DirectSQLFetch, {

	sqlTemplate: "\
		SELECT gr.grade_name_chi, c.class_name, cs.cs_number, u.user_chi_name \
		FROM pl_user u \
			LEFT OUTER JOIN pl_class_student cs ON cs.user_auto_id=u.user_auto_id \
			LEFT OUTER JOIN pl_class c ON c.class_auto_id=cs.class_auto_id \
			LEFT OUTER JOIN pl_grade_school gsh ON gsh.grade_auto_id=c.grade_auto_id \
			LEFT OUTER JOIN pl_grade gr ON gr.grade_code=gsh.grade_code \
		WHERE c.class_auto_id IN ({{classAutoId}}) \
	",

	fields: [
  		{ name: '', header:'', content: function(bean) { return "<i class=icon-align-justify ></i>"; } },
  		{ name: 'grade_name_chi', header:'年級', content:App.TableRow.content },
  		{ name: 'class_name', header:'班別', content:App.TableRow.content },
  		{ name: 'cs_number', header:'編號', content:App.TableRow.content },
  		{ name: 'user_chi_name', header:'姓名', content:App.TableRow.content }
	]
}));

App.StudentsByGroupView = App.TableView.extend(
	_.extend({},
		App.Mixins.DirectSQLFetch, {

	sqlTemplate: "\
		SELECT g.group_name, gr.grade_name_chi, c.class_name, cs.cs_number, u.user_chi_name \
		FROM pl_group g \
			LEFT OUTER JOIN pl_group_student gs ON g.group_auto_id=gs.group_auto_id \
			LEFT OUTER JOIN pl_user u ON u.user_auto_id=gs.user_auto_id \
			LEFT OUTER JOIN pl_class_student cs ON cs.user_auto_id=u.user_auto_id \
			LEFT OUTER JOIN pl_class c ON c.class_auto_id=cs.class_auto_id \
			LEFT OUTER JOIN pl_grade_school gsh ON gsh.grade_auto_id=c.grade_auto_id \
			LEFT OUTER JOIN pl_grade gr ON gr.grade_code=gsh.grade_code \
		WHERE g.group_auto_id='{{groupAutoId}}' \
	",

	fields: [
  		{ name: '', header:'', content: function(bean) { return "<i class=icon-remove ></i>"; } },
  		{ name: '', header:'', content: function(bean) { return "<i class=icon-resize-vertical ></i>"; } },
  		{ name: 'grade_name_chi', header:'年級', content:App.TableRow.content },
  		{ name: 'class_name', header:'班別', content:App.TableRow.content },
  		{ name: 'cs_number', header:'編號', content:App.TableRow.content },
  		{ name: 'user_chi_name', header:'姓名', content:App.TableRow.content }
	]
}));

App.PaperDetailsView = App.TableView.extend(
	_.extend({},
	App.Mixins.ServerFetch, {

	init: function() {
	},

	renderRow: function(bean) {
		this.logDebug('PaperDetailsView.renderRow()');
		var row = $('<tr></tr>');
		if (bean.paper_instance_is_ranked === "1") {
			$(row).addClass('ranked');
		}
		return row;
	},

	fetchURLTemplate: "paperDetailsQuery/{{paperInstanceId}}",
  	fields: [
  		{ name: 'class_name', header:'班別', content:App.TableRow.content },
  		{ name: 'cs_number', header:'編號', content:App.TableRow.content },
  		{ name: 'user_chi_name', header:'姓名', content:App.TableRow.content },
  		{ name: 'status', header:'狀態', content:function(bean) {
  			switch (bean.submission_completed) {
  				case '0': return '未完成';
  				case '1': return '完成';
  			} 
 			return '/';
  		}},
  		{ name: 'submission_time', header:'提交日期', content:function(bean) {
  			try { return bean.submission_time.substring(0,10) } catch(e) { return "" };
  		}},
  		{ name: 'attachment', header:'附件', content:App.TableRow.content },
  		{ name: 'submission_final_score', header:'成績', content:function(bean) {
  			if (!bean.submission_completed) return "/"; 
  			return '<a href="'+App.urlBase+'paper/'+bean.paper_instance_id+'/Teacher/'+bean.user_auto_id+'" >'+ bean.submission_final_score +'/'+ bean.paper_instance_max_score +'</a>';
  		} },
  		{ name: 'submission_comment', header:'評語', content:App.TableRow.content }
  	]
}));

App.SubmissionView = App.TableView.extend(
	_.extend({},
	App.Mixins.ServerFetch, {

	init: function() {
		this.on('renderBodyFinished', this.postProcess, this);
	},

	postProcess: function() {
		//more events after render
		//like popups
	},

	renderRow: function(bean) {
		this.logDebug('SubmissionView.renderRow()');
		var row = $('<tr></tr>');
		if (bean.paper_instance_is_ranked === "1") {
			$(row).addClass('ranked');
		}
		return row;
	},

	fetchURLTemplate: "submissionQuery/{{ownerId}}",

  	fields: [
  		{ name: 'paper_instance_name', header:'名稱', content:function(bean) {
  			return "<a href='"+App.urlBase+"paper/"+bean.paper_instance_id+"/Teacher/0'>"+bean.paper_instance_name+"</a>";
  		} },
  		{ name: 'paper_type', header:'類型', content:function(bean) { return App.PaperTypeView.prototype.map(bean.paper_type); } },
  		{ name: 'paper_instance_is_manual', header:'評分形式', content: function(bean) { return bean.paper_instance_is_manual==1? '手動': '自動'; } },
  		{ name: 'paper_instance_status', header:'狀態', content:function(bean) {
  			if (bean.paper_instance_status === 'PENDING') 
  				return '<span style="margin-left:10px" class="label label-warning status">&nbsp;&nbsp;</span>';
  			else 
  				return '<span style="margin-left:10px" class="label status">&nbsp;&nbsp;</span>';
  		} },
  		{ name: 'paper_instance_starttime', header:'開始時間', content: function(bean) { 
  			return bean.paper_instance_starttime.substring(0,10); } },
  		{ name: 'paper_instance_endtime', header:'結束時間', content:function(bean) { 
  			return bean.paper_instance_endtime.substring(0,10); } },
  		{ name: 'submissions', header:'提交情況', content:function(bean) {
  			return "<a href='"+App.urlBase+"submit/"+bean.paper_instance_id+"'>" + bean.submissionCount + "/" + bean.studentCount + "</a>";
  		} },
  		{ name: '', header:'額外試卷', content:function(bean) {
  			var html = "";
  			if (bean.su) {
	  			html += "<a href='"+App.urlBase+"paper/"+bean.paper_instance_upgrade_instance_id+"/Teacher/0'>增潤卷</a>";
  			} 

  			if (bean.paper_instance_downgrade_instance_id) {
  				if (html.length > 0) html += "<Br>";
	  			html += "<a href='"+App.urlBase+"paper/"+bean.paper_instance_downgrade_instance_id+"/Teacher/0'>補充卷</a>";
  			}
  			return html;
  		} },
  		{ name: '', header:'額外試卷<br>提交情況', content:function(bean) {
  			var html = "";
  			if (bean.paper_instance_upgrade_instance_id) {
	  			html += "-";
  			}

  			if (bean.paper_instance_downgrade_instance_id) {
  				if (html.length > 0) html += "<Br>";
	  			html += "-";
  			}
  			return html;

  		} },
  		{ name: '', header:'選項', content:App.TableRow.content }		 
  	]
}));

App.PaperListView = App.ListView.extend(
	_.extend({},
	App.Mixins.ServerFetch, {

	fetchURLTemplate: "paperListQuery/{{paperTitle}}",
	rowTemplate: "\
		<div class=question>\
			<div class='btn showAnswerButton'> A </div>\
			<div>{{qb_id}} 難度:{{qb_level}}</div> \
			<div>{{qb_ques}}</div>\
		</div> \
		<div class='answer hide'><div style='padding:10px'>{{qb_opt}}</div></div> \
		",
	afterFetch: function(beans) {
		_(beans).each(function(e,i) {
			try {
				//format answers
				//trying to highlight correct answer (doesnt work if answer is not one simple choice)
				if (_.contains(['MC','TF','MT'], e.qb_type)) {
					e.qb_opt = e.qb_opt.split('&||&');
					e.qb_opt[e.qb_correct] = '<span class=red>' + e.qb_opt[e.qb_correct] + '</span>';
					e.qb_opt = e.qb_opt.join(' | ');
				}

				//map qb_level
				e.qb_level = App.QuestionLevelView.prototype.map(e.qb_level);
			}catch(e) {}
		});

		return beans;
	},

	events: {
		'click .showAnswerButton': 'toggleAnswer'
	},

	toggleAnswer: function(e) {
		this.logDebug('showAnswer: ' + e.target);
		$(e.target).parent().next('.answer').toggle('blind');
	}
}));

App.SelectedQuestionView = App.BaseView.extend({

	initialize: function(options) {
		this.fromView = this.options.fromView;
		this.fromView.on('rendered', this.addDraggable, this);
	},

	addDraggable: function() {
		var self = this;

		this.$('.dragFrom ul>li')
			.prepend("<span class='label handle'>Drag Me</span>")
			.draggable({
				handle: '.handle',
				helper: 'clone'
			});

		this.$('.dragTo').droppable({
			drop: function(event, ui) {
				self.logDebug('dropped:' + event + "|" + ui);
				self.$('.dragTo ul').append($('<li></li>').append($(ui.draggable)));
			}
		});
	}
}); 

App.URLManager = Backbone.View.extend({
	URL_PREFIX: 6,

	get: function(param) {
		if(window.location.search){
	        var query_string = {};            
	        (function () {
	            var e,
	                a = /\+/g,  // Regex for replacing addition symbol with a space
	                r = /([^&=]+)=?([^&]*)/g,
	                d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
	                q = window.location.search.substring(1);

	            while (e = r.exec(q)){
	               query_string[d(e[1])] = d(e[2]);
	            }
	        })();
	    } else {
	    	try {
		    	if (window.location.pathname.indexOf('paper') > 0) {
		        	var arr = window.location.pathname.split('paper')[1].split('/').slice(1);
		        	try {
			        	if (param === 'pl_id') return arr[0];
			        	if (param === 'mode') return arr[1];
			        	if (param === 's_id') return arr[2];
			        }catch(e) { return 0; }
		    	}

		    	if (window.location.pathname.indexOf('home') > 0) {
		        	var arr = window.location.pathname.split('home')[1].split('/').slice(1);
		        	if (param === 't_id') return arr[0];
		    	}

		    	if (window.location.pathname.indexOf('submit') > 0) {
		        	var arr = window.location.pathname.split('submit')[1].split('/').slice(1);
		        	if (param === 'pl_id') return arr[0];
		    	}
		    }catch(e) {}

	    	return 0;
	        // return window.location.pathname.split('/').slice(this.URL_PREFIX, -1)[param];
	    }
	    return query_string[param];
	}
});

App.MainController = App.BaseView.extend({ 

	initialize: function() {
		log('MainController: initialize');
		this.el = document;
		this.loadHeaders();

		//variables management
		this.pl_id = this.options.pl_id || this.urlManager.get('pl_id') || 0;
		this.t_id = this.options.t_id || this.urlManager.get('t_id') || 0;
		this.s_id = this.options.s_id || this.urlManager.get('s_id') || 0;
		this.logInfo('pl_id:'+ this.pl_id + ' t_id:'+this.t_id + ' s_id:'+this.s_id);
 
		try {
			$('.dateTimePicker').datetimepicker({ pickTime: false });
		} catch (e) {}
	},

	events: {
		'click .homelink': function() {
			location.href=App.urlBase + 'home';
		}
	},

	loadHeaders: function() {
		var submenu = '<div class="container-fluid"> \
			  <div class="affix-top"> \
			  	<a href="http://projects.palapple.com/popularqb/index.php/go/index/logout" class="pull-right">登出</a> \
			    <a class="brand" href="./index.html">大眾</a> \
				<ul class="nav menu0" style="max-height:2.8em; overflow:hidden;"> \
				  <li class="span2"><a href="#">首頁</a></li> \
				  <li class="span2 active"><a href="#">網上教學</a></li> \
				  <li class="span2"><a href="#">教學資源</a></li> \
				  <li class="span2"><a href="#">教學工具</a></li> \
				  <li class="span2"><a href="#">交流平台</a></li> \
				</ul> \
			  </div>\
			</div>';
		$(this.el).find('#submenu').append(submenu);
		var footer = '<div class="row"> 2012 Education Publishing House Limited. </div>';
		$(this.el).find('#footer').append(footer);
	},

	urlManager: new App.URLManager
});

App.SearchPaperView = App.BaseView.extend(
	_.extend({},
	App.Mixins.ServerFetch, {

	fetchURLTemplate: "paperSearchQuery/{{paperTitle}}",
	afterFetch: function(beans) {
		this.logDebug(JSON.stringify(beans));
		searchTableView.injectBeans(beans);
	},
	events: {
		'click .searchButton': function(e) {
			this.autoFetch({ paperTitle: $(this.el).find('.searchText').val() });
			e.preventDefault();
			return false;
		},
		'change .searchText': function(e) {
			this.autoFetch({ paperTitle: $(this.el).find('.searchText').val() });
			e.preventDefault();
			return false;
		}
	}
}));

App.SearchTableView = App.TableView.extend({
  	fields: [
  		{ name: 'paper_title', header:'題目名稱', content: function(bean) {
  			return bean.paper_title + " <input type=hidden name=paper_id value='"+bean.paper_id+"'></input>"
  		} },
  		{ name: 'paper_subject', header:'科目', content: App.TableRow.content },
  		{ name: 'paper_level', header:'程度', content:App.TableRow.content },
  		{ name: 'paper_upgrade_id', header:'增潤試卷', content: function(bean) {
  			return bean.paper_upgrade_id + " <input type=hidden name=paper_upgrade_id value='"+bean.paper_upgrade_id+"'></input>"
  		}},
  		{ name: 'paper_downgrade_id', header:'補充試卷', content: function(bean) {
  			return bean.paper_downgrade_id + " <input type=hidden name=paper_downgrade_id value='"+bean.paper_downgrade_id+"'></input>"
  		} }
  	]
});


App.DragDropView = App.BaseView.extend({
	initialize: function(options) {
		this.fromView = this.options.fromView;
		this.fromView.on('rendered', this.addDraggable, this);
		this.toView = this.options.toView;
		this.toView.on('rendered', this.addDroppable, this);
	},

	addDraggable: function() {
		this.logInfo('addDraggable()');
		var self = this;

		this.$('.dragTo ul, .dragTo tbody').sortable({
			handle: '.sort'
		});

		this.$('.dragFrom tr').find('td:eq(0)').addClass('handle');
		this.$('.dragFrom li, .dragFrom tr').draggable({
			handle: '.handle',
			connectToSortable: this.$('.dragTo ul, .dragTo tbody'),
			helper: 'clone',
			revert: "invalid",
			cancel: '.cancel'
		});
	},

	addDroppable: function() {
		this.logInfo('addDroppable()');
		var self = this;

		this.$('.dragTo tr').addClass('dragToTr');
		this.$('.dragTo tr').find('td:eq(0)').addClass('remove').click(function() { $(this).parent().remove(); });

		this.$('.dragTo tr').find('td:eq(1)').addClass('sort');
		this.$('.dragTo').droppable({
			drop: function(event, ui) {
				if ($(ui.draggable).hasClass('dragToTr')) return;
				self.logInfo('dropped:' + event + "|" + ui);

				$(ui.draggable).addClass('dragToTr').addClass('cancel');
				$(ui.draggable).find('td:eq(0)').removeClass('handle').addClass('sort').html('<i class="icon-resize-vertical"></i>');
				$(ui.draggable).prepend('<td class="remove"><i class=icon-remove ></i></td>');
				$(ui.draggable).find('td:eq(0)').click(function() { $(this).parent().remove(); });
				self.$('.dragTo ul').append($(ui.draggable));
				self.$('.dragTo table').append($(ui.draggable));
				self.$('.dragTo table').show('fade');
			}
		});
	}
});
