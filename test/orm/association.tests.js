import mongoose from 'mongoose';
import factory from 'factory-girl';

describe('ChimeraAssociation', function () {
	before(async function () {
		this.ChimeraAssociation = mongoose.model('ChimeraAssociation');
		this.OneToMany = mongoose.model('OneToMany');
		this.OneToOne = mongoose.model('OneToOne');
		this.ManyToMany = mongoose.model('ManyToMany');

		this.testModelADoc = await factory.create('ChimeraModel');
		this.testModelBDoc = await factory.create('ChimeraModel');
	});

	describe('schema', function () {
		it('should enforce required fields and discrimination', async function () {
			const isInvalid = await new this.ChimeraAssociation().validate().should.be.rejected;
			should.exist(isInvalid);

			isInvalid.should.be.an.instanceOf(mongoose.Error.ValidationError);
			isInvalid.errors.should.containSubset({
				type: { kind: 'required' },
				fromModelId: { kind: 'required' },
				toModelId: { kind: 'required' }
			});
		});

		it('should enforce valid discriminator values', async function () {
			const isInvalid = await new this.ChimeraAssociation({ type: 'manyyTooManyy' }).validate().should.be.rejected;
			should.exist(isInvalid);

			isInvalid.should.be.an.instanceOf(mongoose.Error.ValidationError);
			isInvalid.errors.should.containSubset({
				type: { kind: 'enum' }
			});
		});
	});

	describe('OneToMany', function () {
		before(async function () {
			this.oneToMany = await this.OneToMany.create({
				fromModelId: this.testModelADoc.id,
				toModelId: this.testModelBDoc.id,
				foreignKey: 'aModelId',
				relatedName: 'aModel',
				reverseName: 'bModels'
			});
		});

		after(async function () {
			await this.OneToMany.findByIdAndDelete(this.oneToMany.id);
		});

		it('should enforce uniquness constraint {fromModelId, toModelId, foreignKey}', async function () {
			// Let's come back to this, we might be able to get away with not using discrimination here and just
			// using a required type field
			// const isInvalid = await new this.OneToMany(this.oneToMany.toJSON()).validate().should.be.rejected;
		});

		it(`should define hasMany cardinality on the 'from' model when compiled`, async function () {
			const testModelA = await this.testModelADoc.compile();
			testModelA.schema.virtuals.should.have.property('bModels');
		});

		it(`should define belongsTo cardinality on the 'to' model when compiled`, async function () {
			const testModelB = await this.testModelBDoc.compile();
			testModelB.schema.virtuals.should.have.property(`aModel`);
		});
	});

	describe('OneToOne', function () {
		before(async function () {
			this.oneToOne = await this.OneToOne.create({
				fromModelId: this.testModelADoc.id,
				toModelId: this.testModelBDoc.id,
				foreignKey: 'aModelId',
				relatedName: 'aModel',
				reverseName: 'bModel'
			});
		});

		after(async function () {
			await this.OneToOne.findByIdAndDelete(this.oneToOne.id);
		});

		it(`should define hasOne cardinality on the 'from' model when compiled`, async function () {
			const testModelA = await this.testModelADoc.compile();
			testModelA.schema.virtuals.should.have.property('bModel');
		});

		it(`should define belongsTo cardinality on the 'to' model when compiled`, async function () {
			const testModelB = await this.testModelBDoc.compile();
			testModelB.schema.virtuals.should.have.property(`aModel`);
		});
	});

	describe('ManyToMany', function () {
		before(async function () {
			this.manyToMany = await this.ManyToMany.create({
				fromModelId: this.testModelADoc.id,
				toModelId: this.testModelBDoc.id,
				fromConfig: {
					key: 'aModelId',
					relatedName: 'aModel',
					reverseName: 'bModels'
				},
				toConfig: {
					key: 'bModelId',
					relatedName: 'bModel',
					reverseName: 'aModels'
				}
			});
		});

		after(async function () {
			await this.ManyToMany.findByIdAndDelete(this.manyToMany.id);
		});

		it(`should define hasOne cardinality on the 'from' model when compiled`, async function () {
			const testModelA = await this.testModelADoc.compile();
			testModelA.schema.virtuals.should.have.property('bModels');
		});

		it(`should define belongsTo cardinality on the 'to' model when compiled`, async function () {
			const testModelB = await this.testModelBDoc.compile();
			testModelB.schema.virtuals.should.have.property(`aModels`);
		});

		it(`should define a new model for the junction collection when 'through' is not explicitly defined`, function () {

		});

		it(`should use an existing model for the junction collection when 'through' is explicitly defined`, function () {

		});
	});
});
