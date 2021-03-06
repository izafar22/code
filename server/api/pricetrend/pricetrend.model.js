'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TrendvalSchema = {
 	oemPrice:{},
 	marketPrice:{},
 	highestRealisedPrice:{},
};

var PTrendSchema = new Schema({
  category: {},
  brand: {},
  model: {},
  mfgYear:Number,
  saleYear:Number,
  user:{},
  trendValue:TrendvalSchema,
  createdAt: {type:Date,default:Date.now},
  updatedAt: {type:Date,default:Date.now}
});

module.exports = mongoose.model('PriceTrend', PTrendSchema);