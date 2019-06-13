import PrototypeModel from 'chimera/orm/model';
import ORM from 'chimera/orm';

describe('Prototype Model', function () {
	before(async function () {
		this.ORM = ORM;
		this.ORM.set('defaultSession', await this.ORM.startSession());
		this.Animal = this.ORM.model('Animal', {
			species: String,
			age: Number,
			isPet: Boolean
		});

		Object.getPrototypeOf(this.Animal).should.equal(PrototypeModel);
	});

	after(function () {
		this.ORM.options.defaultSession.endSession(null);
		this.ORM.deleteModel('Animal');
	});

	describe('create', function () {
		it('it should inject a default db session into the original create method options, if a default session exists', async function () {
			const animals = await this.Animal.create([{
				species: 'Tiger',
				age: 8,
				isPet: false
			}]);

			animals.forEach(animal => this.ORM.options.defaultSession.should.equal(animal.$session()));
		});
	});
});
