var driverNeeds = require('../driverNeeds');
var assert = require("assert");
var sinon = require('sinon')

describe('driverNeeds', function(){
  describe('#setFoodCategories()', function(){
    it('should convert catagories into yelp style catagories', function(){
      assert.equal(driverNeeds.setFoodCategories('American'), 'tradamerican');
      assert.equal(driverNeeds.setFoodCategories('Asian,Pizza')[11],','); 
    })
  })
})

describe('driverNeeds', function(){
  describe('#filterGasFeed()', function(){
    it('should create a new list of gas station objects', function(){
      assert.deepEqual(driverNeeds.filterGasFeed([{
					station: 'Exon-Mobil',
					reg_price: '3.65', 
					lat: '45.492367', 
					lng: '-73'
				}]), 
      			[{
					name: 'Exon-Mobil',
					price: '3.65', 
					lat: '45.492367', 
					lon: '-73'
				}]);
    })
  })
})

describe('driverNeeds', function(){
  describe('#filterGasFeed()', function(){
    it('should create a new list of gas station objects', function(){
    assert.deepEqual(driverNeeds.filterGasFeed([{
					station: 'Exon-Mobil',
					reg_price: 'N/A', 
					lat: '45.492367', 
					lng: '-73'
				}]), []);
    })
  })
})

describe('driverNeeds', function(){
  describe('#getStations()', function(){
    it('should call res.send to get gas', function(done){
     	var res = {
        send: function(arg){ console.log('The spy is called.')}
      };
      var spy = sinon.spy(res,'send');
      driverNeeds.getStations(45,'-73', res);
      setTimeout(function(){
        var signifiesError = []; //sends an empty array on api call error
         assert( spy.calledOnce);
         assert( spy.neverCalledWith(signifiesError));
         res.send.restore();
        done();
      },1500)
     })
   })
 })



describe('driverNeeds', function(){
  describe('#getNeeds', function(){
    it('should call res.sends given a food input and Fast Food category', function(done){
      var res = {
        send: function(arg){ console.log('The spy is called.')}
      };
      var spy = sinon.spy(res,'send')

      var yelp = require("yelp").createClient({
        consumer_key: "T0VjCY0WkEUOuyC5U46qMw", 
        consumer_secret: "LwzcaQMBcdE2cz-iv5M3KDxHwCk",
        token: "QF86lSA004Z3R5mbKmXLGVFaUGfLSTET",
        token_secret: "HedWTyztvJe_cuVgPL0IwqsHYjs"
      });
      
      driverNeeds.getNeeds( res , 'food', 45,'-73',yelp,'Fast Food');
      setTimeout(function(){
        var signifiesError = []; //sends an empty array on api call error
         assert( spy.calledOnce);
         assert( spy.neverCalledWith(signifiesError));
         res.send.restore();
        done();
      },1500)

    })
  })
})



      