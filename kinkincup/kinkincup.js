App = {};

App.params = Backbone.Model.extend({
	initialize: function() {
		if (localStorage && localStorage['kinkincup-params']) {
			this.set(JSON.parse(localStorage['kinkincup-params']));
		}
		this.on('change', this.save, this);
	},

	save: function() {
		if (localStorage) {
			localStorage['kinkincup-params'] = JSON.stringify(this);
		}	
	}
});
App.param = new App.params;

App.Player = Backbone.Model.extend();
App.Players = Backbone.Firebase.Collection.extend({
    model: App.Player,
    firebase: "https://kinkincup.firebaseio.com/players"
});

App.SpecificRoom = Backbone.Firebase.Model.extend({ 
    firebase: "https://kinkincup.firebaseio.com/rooms/<roomid>",

    initialize: function() {
        var self = this;
        var RoomPlayers = Backbone.Firebase.Collection.extend({ firebase: self.firebase + "/players" });
        this.players = new RoomPlayers;
    },

    addPlayer: function(player) {
        var players = this.players;
        var seatOccupied = players.where({ position: player.position }).length > 0;
        var alreadySat = players.where({ id: player.id }).length > 0;
        if (!seatOccupied && !alreadySat) {
            players.create(player);
        }
        // else alert('seatOccupied:' + seatOccupied + " alreadySat:" + alreadySat);
    }
})

App.Room = Backbone.Model.extend();
App.Rooms = Backbone.Firebase.Collection.extend({
	model: App.Room,
	firebase: "https://kinkincup.firebaseio.com/rooms"
})

App.Hand = Backbone.Model.extend({
    shuffleCards: function() {
        var suit = ['s', 'h', 'c', 'd'];
        var value = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
        var cards = [];
        _(suit).each(function(s) { _(value).each(function(v) { cards.push(v+s); }); });
        return _.shuffle(cards);
    },

    initialize: function(options) {
        this.set('deck', this.shuffleCards());
    }
});

App.HandStrength = Backbone.Model.extend({
    cardOrder: "23456789TJQKA|A2345",
    cardOrderReverse: "AKQJT98765432",

    order: function(cards) {
        return _(cards).chain().groupBy(function(e) { return e[0]; }).sortBy(function(v, k) { return (10-v.length)*100 + "AKQJT98765432".indexOf(k); }).flatten().value();
    },

    isStraightFlush: function(cards) {
        var self = this;
        cards = _(cards).chain()
                        .groupBy(function(c){ return c[1]; })
                        .sortBy(function(e) { return 10-e.length }).first().value();
        
        if (cards.length >= 5) {
            return this.isStraight(cards);
        } else return false;
    },

    isFourOfAKind: function(cards) {
        var has4 = _(cards).chain()
                    .map(function(c) { return c[0]; }).groupBy()
                    .map(function(e) { return e.length; })
                    .contains(4).value();
        return has4? _(this.order(cards)).chain().first(5).pluck(0).value().join(""): false;
    },

    isFullHouse: function(cards) {
        var combo = _(cards).chain()
                    .map(function(c) { return c[0]; }).groupBy()
                    .map(function(e) { return e.length; }).value();
        return _.countBy(combo)['3'] == 2 || _.intersection(combo, [2,3]).length == 2? _(this.order(cards)).chain().first(5).pluck(0).value().join(""): false;
    },

    isFlush: function(cards) {
        var self = this;
        var cards = _(cards).chain()
                        .groupBy(function(c){ return c[1]; })
                        .sortBy(function(e) { return 10-e.length }).first().value();
        return cards.length >= 5? _(cards).chain().sortBy(function(c) { return self.cardOrder.indexOf(c[0]); }).last(5).pluck(0).reverse().value().join(""): false;
    },

    isStraight: function(cards) {
        var self = this;
        var oCards = cards;
        var result = [];
        cards = _(cards).chain()
                    .map(function(c) { return c[0]; })
                    .uniq()
                    .sortBy(function(c) { return self.cardOrder.indexOf(c); })
                    .value().join("");
        //handle A2345 case
        if (cards.indexOf('A') >= 0) cards = "A" + cards;

        var temp;
        var straight = "";
        var self = this;
        _(cards.length).times(function(n) {
            temp = cards.substring(n, n+5);
            if (temp.length != 5) return;
            if (self.cardOrder.indexOf(temp) >= 0) straight = temp; 
        });

        return straight == ""? false: straight.split("").reverse().join("");
    },

    isThreeOfAKind: function(cards) {
        var combo = _(cards).chain()
                    .map(function(c) { return c[0]; }).groupBy()
                    .map(function(e) { return e.length; }).value();
        return _(combo).contains(3) ? _(this.order(cards)).chain().first(5).pluck(0).value().join(""): false;
    },


    isTwoPairs: function(cards) {
        var combo = _(cards).chain()
                    .map(function(c) { return c[0]; }).groupBy()
                    .map(function(e) { return e.length; }).value();
        return _.countBy(combo)['2'] >= 2 ? _(this.order(cards)).chain().first(5).pluck(0).value().join(""): false;
    },

    isPair: function(cards) {
        var combo = _(cards).chain()
                    .map(function(c) { return c[0]; }).groupBy()
                    .map(function(e) { return e.length; }).value();
        return _(combo).contains(2) ? _(this.order(cards)).chain().first(5).pluck(0).value().join(""): false;
    },

    findResultScore: function(result) {
        var score = 0;
        var self = this;
        _(result.cards.split("").reverse()).each(function(c, i) {
            score += Math.pow(15, i) * self.cardOrder.indexOf(c[0]);
        });
        score += Math.pow(15, 5) * result.order;
        return score;
    },

    measure: function(cards) {
        var result = {};

        if ((result.cards = this.isStraightFlush(cards))) {
            result.order = 10;
        } else if ((result.cards = this.isFourOfAKind(cards))) {
            result.order = 9;
        } else if ((result.cards = this.isFullHouse(cards))) {
            result.order = 8;
        } else if ((result.cards = this.isFlush(cards))) {
            result.order = 7;
        } else if ((result.cards = this.isStraight(cards))) {
            result.order = 6;
        } else if ((result.cards = this.isThreeOfAKind(cards))) {
            result.order = 5;
        } else if ((result.cards = this.isTwoPairs(cards))) {
            result.order = 4;
        } else if ((result.cards = this.isPair(cards))) {
            result.order = 3;
        } else {
            result.order = 2;
            result.cards = _(this.order(cards)).chain().first(5).pluck(0).value().join("")
        }

        result.score = this.findResultScore(result);
        return result;
    },

    chooseWinners: function(players, communityCards) {
        var winners = [];
        var winnerScore;
        var self = this;

        players.each(function(p, i) {
            var condition = self.measure(_.union(p.get('holdcards'), communityCards));
            if (winners.length == 0 || (condition.score > winnerCondition.score)) {
                winners = [p];
                winnerCondition = condition;
            } else if (condition.score==winnerCondition.score) {
                winners.push(p);
            }
        });
        return winners;
    },

    compareResults: function(results) {
        var self = this;
        return _(results).chain()
            .groupBy(function(r) { return r.score })
            .sortBy(function(r) { return r.score; })
            .reverse()
            .first()
            .value();
    }


});

App.MontyCarlo = Backbone.Model.extend({

    guess: function(heroCards, communityCards, villianCards, times) {

        var deck = new App.Hand().get('deck');
        communityCards = communityCards || [];
        deck = _.difference(deck, heroCards, communityCards, villianCards);

        var hs = new App.HandStrength();
        var win = 0;
        var draw = 0;
        var lose = 0;

        _(times || 100).times(function(n) {
            var randomDeck = _.shuffle(deck);
            var hc = heroCards;
            var vc = villianCards || [randomDeck.shift(), randomDeck.shift()];
            var randomCommunityCards = _.union([], communityCards);

            _(5 - randomCommunityCards.length).times(function(nn) {
                randomCommunityCards.push(randomDeck.shift());
            });

            var heroResult = hs.measure(_.union(hc, randomCommunityCards));
            var villianResult = hs.measure(_.union(vc, randomCommunityCards));
            var winners = hs.compareResults([heroResult, villianResult]);
            //console.log("c:" + communityCards + " rc:" + randomCommunityCards + " h:" + JSON.stringify(heroResult) + " v:" + JSON.stringify(villianResult) + " w:" + JSON.stringify(winners));
            
            if (_(winners).contains(heroResult)) {
                if (winners.length == 1) win++;
                else draw++;
            }
            else lose++;
        });

        return {win: 100*win/(win+lose+draw), draw: 100*draw/(win+lose+draw), lose: 100*lose/(win+lose+draw)};
    }

});
