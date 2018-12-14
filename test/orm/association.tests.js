import mongoose from 'mongoose';
import factory from 'factory-girl';
import orm from 'app/orm';

describe('ChimeraAssociation', function () {
	before(async function () {
		this.ChimeraAssociation = mongoose.model('ChimeraAssociation');
		this.Hierarchical = mongoose.model('HierarchicalAssociation');
		this.NonHierarchical = mongoose.model('NonHierarchicalAssociation');

		this.testModelADoc = await factory.create('ChimeraModel');
		this.testModelBDoc = await factory.create('ChimeraModel');
	});

	after(async function () {
		await factory.cleanUp();
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

		it('should enforce uniquness constraint {fromModelId, toModelId, foreignKey}', async function () {
			// Let's come back to this, we might be able to get away with not using discrimination here and just
			// using a required type field
			// const isInvalid = await new this.OneToMany(this.oneToMany.toJSON()).validate().should.be.rejected;
		});
	});

	describe('Hierarchical', function () {
		before(async function () {
			this.hierarchical = await this.Hierarchical.create({
				fromModelId: this.testModelADoc.id,
				toModelId: this.testModelBDoc.id,
				fromModel: {
					reverseName: 'bModels'
				},
				toModel: {
					foreignKey: 'aModelId',
					relatedName: 'aModel'
				}
			});
		});

		after(async function () {
			await this.Hierarchical.findByIdAndDelete(this.hierarchical.id);
		});

		it(`should define hasMany cardinality on the 'from' model when compiled`, async function () {
			const testModelA = await this.testModelADoc.compile();
			testModelA.schema.virtuals.should.have.property('bModels');
		});

		it(`should define belongsTo cardinality on the 'to' model when compiled`, async function () {
			const testModelB = await this.testModelBDoc.compile();
			testModelB.schema.virtuals.should.have.property(`aModel`);
		});

		it(`should define hasOne cardinality on the 'from' model when compiled with 'many: false'`, async function () {
			await this.hierarchical.updateOne({ many: false, fromModel: { reverseName: 'bModel' } });

			const testModelA = await this.testModelADoc.compile();
			testModelA.schema.virtuals.should.have.property('bModel');
			testModelA.schema.virtuals.bModel.options.should.include({
				justOne: true
			});
		});
	});

	describe('NonHierarchical', function () {
		before(async function () {
			this.nonHierarchical = await this.NonHierarchical.create({
				fromModelId: this.testModelADoc.id,
				toModelId: this.testModelBDoc.id,
				fromModel: {
					foreignKey: 'aModelId',
					relatedName: 'aModel',
					reverseName: 'bModels'
				},
				toModel: {
					foreignKey: 'bModelId',
					relatedName: 'bModel',
					reverseName: 'aModels'
				}
			});

			this.through = await factory.create('ChimeraModel', {
				name: 'm2mThru'
			}, {
				autoCreate: {
					fields: 1
				}
			});

			await orm.loadDynamicSchemas({
				_id: {
					$in: [this.testModelADoc.id, this.testModelBDoc.id]
				}
			});
		});

		after(async function () {
			await this.NonHierarchical.findByIdAndDelete(this.nonHierarchical.id);
			await factory.cleanUp();
		});

		it(`should define hasMany cardinality on the 'from' model when compiled`, async function () {
			const _model = this.testModelADoc;
			orm.applyAssociations(_model.name);
			orm.compile(_model.name);

			const model = orm.model(_model.name);
			model.schema.virtuals.should.have.property('bModels');
		});

		it(`should define hasMany cardinality on the 'to' model when compiled`, async function () {
			const _model = this.testModelBDoc;
			orm.applyAssociations(_model.name);
			orm.compile(_model.name);

			const model = orm.model(_model.name);
			model.schema.virtuals.should.have.property('aModels');
		});

		it(`should define a new model for the junction collection when 'through' is not explicitly defined`, function () {
			const scope = [this.testModelADoc.name, this.testModelBDoc.name];
			orm.applyAssociations(scope);
			orm.compile(scope);
			orm.isRegistered(`${scope[0]}_${scope[1]}`).should.be.true;

			const throughModel = orm.model(`${scope[0]}_${scope[1]}`);
			throughModel.schema.paths.should.have.property(`aModelId`);
			throughModel.schema.paths.should.have.property(`bModelId`);
			throughModel.schema.virtuals.should.have.property(`aModel`);
			throughModel.schema.virtuals.should.have.property(`bModel`);
		});

		it(`should use an existing model for the junction collection when 'through' is explicitly defined`, async function () {
			const models = [this.testModelADoc, this.testModelBDoc, this.through];

			await this.nonHierarchical.updateOne({ throughModelId: this.through.id });
			await orm.loadDynamicSchemas({
				_id: {
					$in: models.map(model => model.id)
				}
			});

			const scope = models.map(model => model.name);

			orm.applyAssociations(scope);
			orm.compile(scope);
			orm.isRegistered(this.through.name);

			const throughModel = orm.model(this.through.name);
			throughModel.schema.paths.should.have.property(`aModelId`);
			throughModel.schema.paths.should.have.property(`bModelId`);
			throughModel.schema.virtuals.should.have.property(`aModel`);
			throughModel.schema.virtuals.should.have.property(`bModel`);
		});
	});
});
