App.Model = Backbone.Firebase.Model.extend({ });
App.Collection = Backbone.Firebase.Collection.extend({ });

var host = "https://queencal.firebaseio.com/";

App.Items = App.Collection.extend({ firebase: host + "items/" });
App.Types = App.Collection.extend({ firebase: host + "types/" });
