App.Model = Backbone.Firebase.Model.extend({ });
App.Collection = Backbone.Firebase.Collection.extend({ });

App.BaseCollection = App.Collection.extend({ firebase: "https://tessharry.firebaseio.com" });

App.Activity = App.Model.extend({ firebase: "https://tessharry.firebaseio.com/group/" + App.access('group-id') + "/activity/" + App.access('activity-id') });
App.ActivityCollection = App.Collection.extend({ firebase: "https://tessharry.firebaseio.com/group/" + App.access('group-id') + "/activity" });
App.OldActivityCollection = App.Collection.extend({ firebase: "https://tessharry.firebaseio.com/activity" });

App.Group = App.Model.extend({ firebase: "https://tessharry.firebaseio.com/group/" + App.access('group-id') });
App.GroupCollection = App.Collection.extend({ firebase: "https://tessharry.firebaseio.com/group" });

App.People = App.Model.extend({ firebase: "https://tessharry.firebaseio.com/people/" });
App.PeopleCollection = App.Collection.extend({ firebase: "https://tessharry.firebaseio.com/people" });
App.PeopleInActivityCollection = App.Collection.extend({ 
	firebase: "https://tessharry.firebaseio.com/group/" + App.access('group-id') + "/activity/" + App.access('activity-id') + "/people/",
});
