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

		describe('indexes', function () {
			// it('should enforce uniquness constraint on NonHierarchical associations {fromModelId, toModelId, fromModel.relatedName}', async function () {
			// 	const assoc = await factory.create('NonHierarchicalAssociation', {
			// 		fromModelId: this.testModelADoc.id,
			// 		toModelId: this.testModelBDoc.id
			// 	});

			// 	// Should fail because not specifying the relatedName on a second association will cause a namespace collision
			// 	const isInvalid = await new this.NonHierarchical(assoc.toJSON()).validate().should.be.rejected;
			// 	isInvalid.errors.should.containSubset({
			// 		fromModelId: { kind: 'unique' },
			// 		toModelId: { kind: 'unique' },
			// 		'fromModel.relatedName': { kind: 'unique' }
			// 	});

			// 	// Should succeed because the association specifies the relatedName
			// 	await new this.NonHierarchical({
			// 		fromModelId: this.testModelADoc.id,
			// 		toModelId: this.testModelBDoc.id,
			// 		fromModel: {
			// 			relatedName: 'fromModelDifferent'
			// 		}
			// 	}).validate().should.be.fulfilled;

			// 	// Should succeed because the uniqueness constraint is partial, only applies to NonHierarchical associations
			// 	await new this.Hierarchical({
			// 		fromModelId: this.testModelADoc.id,
			// 		toModelId: this.testModelBDoc.id
			// 	}).validate().should.be.fulfilled;
			// });
		});
	});

	describe('validators', function () {
		afterEach(async function () {
			await this.ChimeraAssociation.deleteMany({});
		});

		describe('fromModelReverseNameUniqueUniversally', function () {
			it('should enforce uniqueness {fromModelId, fromModel.reverseName}', async function () {
				const assoc = await factory.create('HierarchicalAssociation', {
					fromModelId: this.testModelADoc.id
				});

				// Should fail because reverseName should be unique value between all associations with fromModelId
				const isInvalid = await new this.Hierarchical({
					...assoc.toJSON(),
					toModelId: this.testModelBDoc.id
				}).validate().should.be.rejected;

				isInvalid.errors.should.containSubset({
					'fromModel.reverseName': { kind: 'unique' }
				});

				// Should succeed because association specifies a unique reverseName
				await new this.Hierarchical({
					fromModelId: this.testModelADoc.id,
					toModelId: this.testModelBDoc.id,
					fromModel: {
						reverseName: 'reverseNameUnique'
					}
				}).validate().should.be.fulfilled;
			});
		});

		describe('fromModelReverseNameUniqueSecondary', function () {
			it('should enforce uniqueness {fromModelId, toModelId, fromModel.reverseName}', async function () {
				const assoc = await factory.create('HierarchicalAssociation', {
					fromModelId: this.testModelADoc.id,
					toModelId: this.testModelBDoc.id,
					fromModel: {
						reverseName: ''
					}
				});

				// Should fail because reverseName must be specified when a secondary association is created
				// between fromModelId / toModelId
				const isInvalid = await new this.Hierarchical({
					...assoc.toJSON()
				}).validate().should.be.rejected;

				isInvalid.errors.should.containSubset({
					'fromModel.reverseName': { kind: 'unique' }
				});

				// Should succeed because association specifies a unique reverseName
				await new this.Hierarchical({
					...assoc.toJSON(),
					fromModel: {
						reverseName: 'reverseNameUnique'
					}
				}).validate().should.be.fulfilled;
			});
		});

		describe('foreignKeyUniqueUniversally', function () {
			it('should enforce uniqueness {fromModelId}', async function () {

			});
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
		});

		after(async function () {
			await this.NonHierarchical.findByIdAndDelete(this.nonHierarchical.id);
			await factory.cleanUp();
		});

		it(`should define hasMany cardinality on the 'from' model when compiled`, async function () {
			await orm.compile(this.testModelADoc.id);

			const model = orm.model(this.testModelADoc.namespace);
			model.schema.virtuals.should.have.property('bModels');
		});

		it(`should define hasMany cardinality on the 'to' model when compiled`, async function () {
			await orm.compile(this.testModelBDoc.id);

			const model = orm.model(this.testModelBDoc.namespace);
			model.schema.virtuals.should.have.property('aModels');
		});

		it(`should define a new model for the junction collection when 'through' is not explicitly defined`, async function () {
			const models = [this.testModelADoc, this.testModelBDoc];
			await orm.compile(models.map(s => s.id));
			orm.isRegistered(`${models[0].namespace}_${models[1].namespace}`).should.be.true;

			const throughModel = orm.model(`${models[0].namespace}_${models[1].namespace}`);
			throughModel.schema.paths.should.have.property(`aModelId`);
			throughModel.schema.paths.should.have.property(`bModelId`);
			throughModel.schema.virtuals.should.have.property(`aModel`);
			throughModel.schema.virtuals.should.have.property(`bModel`);
		});

		it(`should use an existing model for the junction collection when 'through' is explicitly defined`, async function () {
			await this.nonHierarchical.updateOne({ throughModelId: this.through.id });

			const models = [this.testModelADoc, this.testModelBDoc, this.through];
			const scope = models.map(model => model.id);

			await orm.compile(scope);
			orm.isRegistered(this.through.namespace);

			const throughModel = orm.model(this.through.namespace);
			throughModel.schema.paths.should.have.property(`aModelId`);
			throughModel.schema.paths.should.have.property(`bModelId`);
			throughModel.schema.virtuals.should.have.property(`aModel`);
			throughModel.schema.virtuals.should.have.property(`bModel`);
		});
	});
});
