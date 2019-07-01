import wrap from 'mocha-wrap';
import PrototypeModel from 'chimera/orm/model';

wrap()
	.withTransaction()
	.describe('Prototype Model', function () {
		before(async function () {
			this.ORM = this.txnORM;
			this.ORM.set('defaultSession', await this.ORM.startSession());
			this.Animal = this.ORM.model('Animal', new this.ORM.Schema('Animal', {
				species: String,
				subSpecies: String,
				age: Number,
				isPet: Boolean
			}));
			await this.Animal.$init;
			Object.getPrototypeOf(this.Animal).should.equal(PrototypeModel);
		});

		after(function () {
			this.ORM.options.defaultSession.endSession(null);
			this.ORM.deleteModel('Animal');
		});

		describe('create', function () {
			it('it should inject a default db session into the original create method options, if a default session exists', async function () {
				// const lionsAndTigers = await this.Animal.create([
				// 	{
				// 		species: 'lion',
				// 		subSpecies: 'african',
				// 		age: 12,
				// 		isPet: false
				// 	},
				// 	{
				// 		species: 'tiger',
				// 		subSpecies: 'wired',
				// 		age: 8,
				// 		isPet: false
				// 	}
				// ]);

				// this.ORM.options.defaultSession.startTransaction();
				// const bears = await this.Animal.create([
				// 	{
				// 		species: 'bear',
				// 		subSpecies: 'grizzly',
				// 		age: 4,
				// 		isPet: true
				// 	}
				// ]);

				// lionsAndTigers.forEach(animal => this.ORM.options.defaultSession.should.equal(animal.$session()));
				// bears.forEach(animal => this.ORM.options.defaultSession.should.equal(animal.$session()));

				// (await this.Animal.countDocuments()).should.equal(2);
				// await this.ORM.options.defaultSession.commitTransaction();
				// (await this.Animal.countDocuments()).should.equal(3);
			});
		});
	});
