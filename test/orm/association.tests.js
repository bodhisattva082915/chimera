import factory from 'factory-girl';
import orm from 'chimera/orm';

describe('ChimeraAssociation', function () {
	before(async function () {
		this.ChimeraAssociation = orm.model('ChimeraAssociation');
		this.Hierarchical = orm.model('HierarchicalAssociation');
		this.NonHierarchical = orm.model('NonHierarchicalAssociation');

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

			isInvalid.should.be.an.instanceOf(orm.Error.ValidationError);
			isInvalid.errors.should.containSubset({
				type: { kind: 'required' },
				fromModelId: { kind: 'required' },
				toModelId: { kind: 'required' }
			});
		});

		it('should enforce valid discriminator values', async function () {
			const isInvalid = await new this.ChimeraAssociation({ type: 'manyyTooManyy' }).validate().should.be.rejected;
			should.exist(isInvalid);

			isInvalid.should.be.an.instanceOf(orm.Error.ValidationError);
			isInvalid.errors.should.containSubset({
				type: { kind: 'enum' }
			});
		});
	});

	// TODO: Simplify this into test suite factories
	describe('validators', function () {
		afterEach(async function () {
			await this.ChimeraAssociation.deleteMany({});
		});

		describe('fromModel', function () {
			describe('foreignKey', function () {
				describe('uniqueUniversally', function () {
					it('should enforce uniqueness on NonHierarchical associations {fromModelId, fromModel.foreignKey}', async function () {
						const assoc = await factory.create('NonHierarchicalAssociation', {
							fromModelId: this.testModelADoc.id
						});

						// Should fail because foreignKey should be unique value between all NonHierarchical associations with fromModelId
						const isInvalid = await new this.NonHierarchical({
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id,
							fromModel: {
								foreignKey: assoc.fromModel.foreignKey
							}
						}).validate().should.be.rejected;

						isInvalid.errors.should.containSubset({
							'fromModel.foreignKey': { kind: 'unique' }
						});

						// Should succeed because association specifies a unique foreignKey
						await new this.NonHierarchical({
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id,
							fromModel: {
								foreignKey: 'foreignKeyUnique'
							}
						}).validate().should.be.fulfilled;

						// Should succeed because this validator only applies to NonHierarchical associations
						await new this.Hierarchical({
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id,
							fromModel: {
								foreignKey: assoc.fromModel.foreignKey
							}
						}).validate().should.be.fulfilled;
					});
				});
				describe('uniqueSecondary', function () {
					it('should enforce uniqueness on NonHierarchical associations {fromModelId, toModelId, fromModel.foreignKey}', async function () {
						const assoc = await factory.create('NonHierarchicalAssociation', {
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id,
							fromModel: {
								foreignKey: '',
								relatedName: factory.chance('word', { length: 5 }),
								reverseName: factory.chance('word', { length: 5 })
							}
						});

						// Should fail because foreignKey must be specified when a secondary association is created
						// between fromModelId / toModelId
						const isInvalid = await new this.NonHierarchical({
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id,
							fromModel: {
								foreignKey: assoc.fromModel.foreignKey
							}
						}).validate().should.be.rejected;

						isInvalid.errors.should.containSubset({
							'fromModel.foreignKey': { kind: 'unique' }
						});

						// Should succeed because association specifies a unique foreignKey
						await new this.NonHierarchical({
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id,
							fromModel: {
								foreignKey: factory.chance('word', { length: 5 })
							}
						}).validate().should.be.fulfilled;

						// Should succeed because this validator only applies to NonHierarchical associations
						await new this.Hierarchical({
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id,
							fromModel: {
								foreignKey: ''
							}
						}).validate().should.be.fulfilled;
					});
				});
			});
			describe('relatedName', function () {
				describe('uniqueUniversally', function () {
					it('should enforce uniqueness on NonHierarchical associations {fromModelId, fromModel.relatedName}', async function () {
						const assoc = await factory.create('NonHierarchicalAssociation', {
							fromModelId: this.testModelADoc.id
						});

						// Should fail because relatedName should be unique value between all NonHierarchical associations with fromModelId
						const isInvalid = await new this.NonHierarchical({
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id,
							fromModel: {
								relatedName: assoc.fromModel.relatedName
							}
						}).validate().should.be.rejected;

						isInvalid.errors.should.containSubset({
							'fromModel.relatedName': { kind: 'unique' }
						});

						// Should succeed because association specifies a unique relatedName
						await new this.NonHierarchical({
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id,
							fromModel: {
								foreignKey: 'relatedNameUnique'
							}
						}).validate().should.be.fulfilled;

						// Should succeed because this validator only applies to NonHierarchical associations
						await new this.Hierarchical({
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id,
							fromModel: {
								foreignKey: assoc.fromModel.foreignKey
							}
						}).validate().should.be.fulfilled;
					});
				});
				describe('uniqueSecondary', function () {
					it('should enforce uniqueness on NonHeirarchical associations {fromModelId, toModelId, fromModel.relatedName}', async function () {
						const assoc = await factory.create('NonHierarchicalAssociation', {
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id
						});

						await assoc.updateOne({ 'fromModel.relatedName': '' });

						// Should fail because relatedName must be specified when a secondary association is created
						// between fromModelId / toModelId
						const isInvalid = await new this.NonHierarchical({
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id,
							fromModel: {
								relatedName: ''
							}
						}).validate().should.be.rejected;

						isInvalid.errors.should.containSubset({
							'fromModel.relatedName': { kind: 'unique' }
						});

						// Should succeed because association specifies a unique relatedName
						await new this.NonHierarchical({
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id,
							fromModel: {
								relatedName: factory.chance('word', { length: 5 })
							}
						}).validate().should.be.fulfilled;

						// Should succeed because this validator only applies to NonHierarchical associations
						await new this.Hierarchical({
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id,
							fromModel: {
								relatedName: ''
							}
						}).validate().should.be.fulfilled;
					});
				});
			});
			describe('reverseName', function () {
				describe('uniqueUniversally', function () {
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
				describe('uniqueSecondary', function () {
					it('should enforce uniqueness {fromModelId, toModelId, fromModel.reverseName}', async function () {
						const assoc = await factory.create('HierarchicalAssociation', {
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id
						});

						await assoc.updateOne({ 'fromModel.reverseName': '' });

						// Should fail because reverseName must be specified when a secondary association is created
						// between fromModelId / toModelId
						const isInvalid = await new this.Hierarchical({
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id,
							fromModel: {
								reverseName: ''
							}
						}).validate().should.be.rejected;

						isInvalid.errors.should.containSubset({
							'fromModel.reverseName': { kind: 'unique' }
						});

						// Should succeed because association specifies a unique reverseName
						await new this.Hierarchical({
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id,
							fromModel: {
								reverseName: factory.chance('word', { length: 5 })
							}
						}).validate().should.be.fulfilled;
					});
				});
			});
		});

		describe('toModel', function () {
			describe('foreignKey', function () {
				describe('uniqueUniversally', function () {
					it('should enforce uniqueness {toModelId, toModel.foreignKey}', async function () {
						const assoc = await factory.create('HierarchicalAssociation', {
							toModelId: this.testModelBDoc.id
						});

						// Should fail because foreignKey should be a unique value between all associations with toModelId
						const isInvalid = await new this.Hierarchical({
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id,
							toModel: {
								foreignKey: assoc.toModel.foreignKey
							}
						}).validate().should.be.rejected;

						isInvalid.errors.should.containSubset({
							'toModel.foreignKey': { kind: 'unique' }
						});

						// Should succeed because association specifies a unique foreignKey
						await new this.Hierarchical({
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id,
							toModel: {
								foreignKey: 'foreignKeyUnique'
							}
						}).validate().should.be.fulfilled;
					});
				});
				describe('uniqueSecondary', function () {
					it('should enforce uniqueness {fromModelId, toModelId, toModel.foreignKey}', async function () {
						const assoc = await factory.create('HierarchicalAssociation', {
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id
						});

						await assoc.updateOne({ 'toModel.foreignKey': '' });

						// Should fail because reverseName must be specified when a secondary association is created
						// between fromModelId / toModelId
						const isInvalid = await new this.Hierarchical({
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id,
							toModel: {
								foreignKey: ''
							}
						}).validate().should.be.rejected;

						isInvalid.errors.should.containSubset({
							'toModel.foreignKey': { kind: 'unique' }
						});

						// Should succeed because association specifies a unique reverseName
						await new this.Hierarchical({
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id,
							toModel: {
								foreignKey: factory.chance('word', { length: 5 })
							}
						}).validate().should.be.fulfilled;
					});
				});
			});

			describe('relatedName', function () {
				describe('uniqueUniversally', function () {
					it('should enforce uniqueness {toModelId, toModel.relatedName}', async function () {
						const assoc = await factory.create('HierarchicalAssociation', {
							toModelId: this.testModelBDoc.id
						});

						// Should fail because relatedName should be a unique value between all associations with toModelId
						const isInvalid = await new this.Hierarchical({
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id,
							toModel: {
								relatedName: assoc.toModel.relatedName
							}
						}).validate().should.be.rejected;

						isInvalid.errors.should.containSubset({
							'toModel.relatedName': { kind: 'unique' }
						});

						// Should succeed because association specifies a unique relatedName
						await new this.Hierarchical({
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id,
							toModel: {
								relatedName: 'relatedNameUnique'
							}
						}).validate().should.be.fulfilled;
					});
				});
				describe('uniqueSecondary', function () {
					it('should enforce uniqueness {fromModelId, toModelId, toModel.relatedName}', async function () {
						const assoc = await factory.create('HierarchicalAssociation', {
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id
						});

						await assoc.updateOne({ 'toModel.relatedName': '' });

						// Should fail because relatedName must be specified when a secondary association is created
						// between fromModelId / toModelId
						const isInvalid = await new this.Hierarchical({
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id,
							toModel: {
								relatedName: ''
							}
						}).validate().should.be.rejected;

						isInvalid.errors.should.containSubset({
							'toModel.relatedName': { kind: 'unique' }
						});

						// Should succeed because association specifies a unique reverseName
						await new this.Hierarchical({
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id,
							toModel: {
								relatedName: factory.chance('word', { length: 5 })
							}
						}).validate().should.be.fulfilled;
					});
				});
			});

			describe('reverseName', function () {
				describe('uniqueUniversally', function () {
					it('should enforce uniqueness on NonHierarchical associations {toModelId, toModel.reverseName}', async function () {
						const assoc = await factory.create('NonHierarchicalAssociation', {
							toModelId: this.testModelBDoc.id
						});

						// Should fail because reverseName should be unique value between all NonHierarchical associations with toModelId
						const isInvalid = await new this.NonHierarchical({
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id,
							toModel: {
								reverseName: assoc.toModel.reverseName
							}
						}).validate().should.be.rejected;

						isInvalid.errors.should.containSubset({
							'toModel.reverseName': { kind: 'unique' }
						});

						// Should succeed because association specifies a unique reverseName
						await new this.NonHierarchical({
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id,
							toModel: {
								reverseName: 'reverseNameUnique'
							}
						}).validate().should.be.fulfilled;

						// Should succeed because this validator only applies to NonHierarchical associations
						await new this.Hierarchical({
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id,
							toModel: {
								reverseName: assoc.toModel.reverseName
							}
						}).validate().should.be.fulfilled;
					});
				});
				describe('uniqueSecondary', function () {
					it('should enforce uniqueness on NonHierarchical associations {fromModelId, toModelId, toModel.reverseName}', async function () {
						const assoc = await factory.create('NonHierarchicalAssociation', {
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id
						});

						await assoc.updateOne({ 'toModel.reverseName': '' });

						// Should fail because reverseName must be specified when a secondary association is created
						// between fromModelId / toModelId
						const isInvalid = await new this.NonHierarchical({
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id,
							toModel: {
								reverseName: ''
							}
						}).validate().should.be.rejected;

						isInvalid.errors.should.containSubset({
							'toModel.reverseName': { kind: 'unique' }
						});

						// Should succeed because association specifies a unique reverseName
						await new this.NonHierarchical({
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id,
							toModel: {
								reverseName: factory.chance('word', { length: 5 })
							}
						}).validate().should.be.fulfilled;

						// Should succeed because this validator only applies to NonHierarchical associations
						await new this.Hierarchical({
							fromModelId: this.testModelADoc.id,
							toModelId: this.testModelBDoc.id,
							toModel: {
								reverseName: assoc.toModel.reverseName
							}
						}).validate().should.be.fulfilled;
					});
				});
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
