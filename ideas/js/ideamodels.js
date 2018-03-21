App.Model = Backbone.Firebase.Model.extend({ });
App.Collection = Backbone.Firebase.Collection.extend({ });

var host = "https://ideashk.firebaseio.com/";

App.Ideas = App.Collection.extend({ firebase: host + "ideas/" });
App.Ratings = App.Collection.extend({ firebase: host + "ratings/" });
App.Users = App.Collection.extend({ firebase: host + "users/" });

App.User = App.Model.extend({ firebase: host + "users/" + App.access('user-id') });
