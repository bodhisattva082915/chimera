import mongoose from 'mongoose';
import factory from 'factory-girl';

describe('ChimeraAssociation', function () {
	before(async function () {
		this.ChimeraAssociation = mongoose.model('ChimeraAssociation');
		this.OneToMany = mongoose.model('ChimeraOneToMany');
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
				relatedName: 'aModel',
				relatedSetName: 'bModels'
			});
		});

		after(async function () {
			await this.OneToMany.findByIdAndDelete(this.oneToMany.id);
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

	});

});
