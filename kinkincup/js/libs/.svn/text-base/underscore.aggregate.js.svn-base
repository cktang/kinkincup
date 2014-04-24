_.mixin({
	sum : function (obj, iterator, context) {
		'use strict';
		var result = 0;
		if (!iterator && _.isEmpty(obj)) {
			return 0;
		}
		_.each(obj, function (value, index, list) {
			var computed = iterator ? iterator.call(context, value, index, list) : value;
			result += computed;
		});
		return result;
	},

	avg : function (obj, iterator, context) {
		'use strict';
		return _.sum(obj, iterator, context) / obj.length;
	},

	sumKey : function (obj, formula) {
		'use strict';
		var result = 0;
		if (_.isEmpty(obj)) return 0;

		_.each(obj, function (value) {
			var computed = formula(value);
			result += computed;
		});
		return result;
	}

});