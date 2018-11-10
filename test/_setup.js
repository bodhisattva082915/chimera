import chai from 'chai';
import store from 'app/orm';

should = chai.should();

before(function () {
	this.store = store;
});
