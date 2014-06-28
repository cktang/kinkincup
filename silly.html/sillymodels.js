App.Model = Backbone.Firebase.Model.extend({
    initialize: function(options) {
    	if (options.id) this.firebase = this.firebase + options.id
    }
});
App.Collection = Backbone.Firebase.Collection.extend({ });


App.Activity = App.Model.extend({ firebase: "https://silly.firebaseio.com/activity/" });
App.ActivityCollection = App.Collection.extend({ firebase: "https://silly.firebaseio.com/activity" });

App.People = App.Model.extend({ firebase: "https://silly.firebaseio.com/people/" });
App.PeopleCollection = App.Collection.extend({ firebase: "https://silly.firebaseio.com/people" });
