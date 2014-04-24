App.PaperTypeView = App.SelectView.extend({ 
	sqlTemplate: "SELECT DISTINCT paper_type FROM paper",
	map: function(val) {
		if (val === 'TEST') return '測驗';
		if (val === 'EX') return '功課';
		if (val === 'UPGRADE') return '增潤';
		if (val === 'DOWNGRADE') return '補充';
		return val;
	}
});

App.QuestionLevelView = App.SelectView.extend({ 
	sqlTemplate: "SELECT DISTINCT qb_level FROM qb",
	map: function(val) {
		if (val === '1') return '低';
		if (val === '2') return '中';
		if (val === '3') return '高';
		return val;
	}
});

App.PaperDetailsView = App.TableView.extend({
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

	sqlTemplate: "Select s.submission_id, c.class_name, cs.cs_number,u.user_chi_name, s.submission_completed, s.submission_time, s.submission_final_score, pl.paper_instance_max_score, s.submission_comment \
		from pl_paper_instance pl \
		  LEFT OUTER JOIN pl_group g ON pl.paper_instance_targetgroup_id=g.group_auto_id \
		  LEFT OUTER JOIN pl_group_student gs ON gs.group_auto_id=g.group_auto_id \
		  LEFT OUTER JOIN pl_user u ON gs.user_auto_id=u.user_auto_id \
		  LEFT OUTER JOIN pl_class_student cs ON cs.user_auto_id=u.user_auto_id \
		  LEFT OUTER JOIN pl_class c ON c.class_auto_id=cs.class_auto_id \
		  LEFT OUTER JOIN pl_submission s ON s.paper_instance_id=pl.paper_instance_id AND u.user_auto_id=s.student_id \
		WHERE pl.paper_instance_id = '{{paperInstanceId}}'",
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
  			return '<a href=# >'+ bean.submission_final_score +'/'+ bean.paper_instance_max_score +'</a>';
  		} },
  		{ name: 'submission_comment', header:'評語', content:App.TableRow.content }
  	]
});

App.SubmissionView = App.TableView.extend({
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

	sqlTemplate: "SELECT * FROM pl_paper_instance pl, paper p, \
				(SELECT paper_instance_id as sid, Count(*) AS submissionCount \
					FROM pl_submission GROUP BY paper_instance_id) s, \
				(SELECT s.group_auto_id as gid, count(*) as studentCount FROM pl_group g, pl_group_student s \
					WHERE g.group_auto_id=s.group_auto_id AND g.user_auto_id='{{ownerId}}' \
					GROUP BY s.group_auto_id \
					) g \
		WHERE 	pl.paper_id = p.paper_id \
				AND sid = pl.paper_instance_id \
				AND gid = pl.paper_instance_targetgroup_id \
				AND pl.owner_id='{{ownerId}}'",
  	fields: [
  		{ name: 'paper_instance_name', header:'名稱', content:App.TableRow.content },
  		{ name: 'paper_type', header:'類型', content:function(bean) { return App.PaperTypeView.prototype.map(bean.paper_type); } },
  		{ name: 'paper_instance_is_manual', header:'評分形式', content:App.TableRow.content },
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
  			return "<a href='#'>" + bean.submissionCount + "/" + bean.studentCount + "</a>";
  		} },
  		{ name: '', header:'額外試卷', content:function(bean) {
  			var html = "";
  			if (bean.paper_instance_upgrade_instance_id) {
	  			html += "<a href='#'>增潤卷</a><Br>";
  			}

  			if (bean.paper_instance_upgrade_instance_id) {
	  			html += "<a href='#'>補充卷</a>";
  			}
  			return html;
  		} },
  		{ name: '', header:'額外試卷<br>提交情況', content:function(bean) {
  			var html = "";
  			if (bean.paper_instance_upgrade_instance_id) {
	  			html += "-<Br>";
  			}

  			if (bean.paper_instance_upgrade_instance_id) {
	  			html += "-";
  			}
  			return html;

  		} },
  		{ name: '', header:'選項', content:App.TableRow.content }		 
  	]
});

App.PaperListView = App.ListView.extend({
	sqlTemplate: "\
		SELECT q.* FROM qb q, paper_qb pq, paper p \
		WHERE q.qb_id=pq.qb_id AND p.paper_id=pq.paper_id \
			AND p.paper_title='{{paperTitle}}'",
	rowTemplate: "\
		<div class=question>\
			<div class='btn showAnswerButton'> A </div>\
			<div>{{qb_id}} 難度:{{qb_level}}</div> \
			<div>{{qb_ques}}</div>\
		</div> \
		<div class='answer hide'><div style='padding:10px'>{{qb_opt}}</div></div> \
		",
	afterSQLFetch: function(beans) {
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
});

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