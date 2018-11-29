import mongoose from "mongoose";
import ChimeraSchema from "app/orm/schema";

describe('ChimeraSchema', function () {
    describe('associations', function(){
        describe('hasOne', function(){
            before(function(){
                this.testSchemaA = new ChimeraSchema('ModelA');
                this.testSchemaB = new ChimeraSchema('ModelB');

                this.testSchemaA.hasOne('ModelB', {
                    foreignField: 'modelAId',
                    as: 'modelB'
                });

                this.testSchemaB.belongsTo('ModelA', {
                    localField: 'modelAId',
                    as: 'modelA'
                });

                this.testModelA = mongoose.model(this.testSchemaA.name, this.testSchemaA);
                this.testModelB = mongoose.model(this.testSchemaB.name, this.testSchemaB);
            });

            after(function(){
                mongoose.deleteModel('ModelA');
                mongoose.deleteModel('ModelB');
            })

            it('should represent a one-to-one relationship between two schemas', function(){
                this.testSchemaA.virtuals.should.have.property('modelB');
                this.testSchemaA.virtuals.modelB.options.should.include({ref: 'ModelB'});
            });

            it('should successfully populate across the association', async function(){
                const a = await this.testModelA.create({});
                const b = await this.testModelB.create({modelAId: a._id});
                
                const populated = await this.testModelA.findById(a._id).populate('modelB').exec();

                populated.should.have.property('modelB');
                populated.modelB.should.exist;
                populated.modelB.id.should.equal(b.id);
            })
        })

        describe('belongsToMany', function(){
            before(function(){
                this.testSchemaA = new ChimeraSchema('ModelA');
                this.testSchemaB = new ChimeraSchema('ModelB');

                this.testSchemaA.belongsToMany('ModelB', {
                    as: 'bModels'
                });

                this.testSchemaB.belongsToMany('ModelA', {
                    as: 'aModels',
                    through: 'ModelA_ModelB'
                });

                this.testSchemaAB = new ChimeraSchema('ModelA_ModelB');

                this.testSchemaAB.belongsTo('ModelA', {}, {required: true});
                this.testSchemaAB.belongsTo('ModelB', {}, {required: true});

                this.testModelA = mongoose.model(this.testSchemaA.name, this.testSchemaA);
                this.testModelB = mongoose.model(this.testSchemaB.name, this.testSchemaB);
                this.testModelAB = mongoose.model(this.testSchemaAB.name, this.testSchemaAB);
            });

            after(function(){
                mongoose.deleteModel('ModelA');
                mongoose.deleteModel('ModelB');
            })

            it('should represent a many-to-many relationship between two schemas', function(){
                this.testSchemaA.virtuals.should.have.property('bModels');
                this.testSchemaA.virtuals.bModels.options.should.include({ref: `ModelA_ModelB`});

                this.testSchemaB.virtuals.should.have.property('aModels');
                this.testSchemaB.virtuals.aModels.options.should.include({ref: `ModelA_ModelB`});
            });

            it('should successfully populate across the association', async function(){
                const a = await this.testModelA.create({});
                const b = await this.testModelB.create({});
                
                const ab = await this.testModelAB.create({
                    modelAId: a.id,
                    modelBId: b.id
                });
                
                const populatedA = await this.testModelA.findById(a.id).populate({
                    path: 'bModels',
                    populate: {
                        path: 'modelB',
                    }
                }).exec();
                
                populatedA.should.have.property('bModels');
                populatedA.bModels.should.be.an('array');
                populatedA.bModels.should.containSubset([
                    {
                        id: ab.id,
                        modelB: {
                            id: b.id
                        }
                    }
                ]);

                const populatedB = await this.testModelB.findById(b.id).populate({
                    path: 'aModels',
                    populate: {
                        path: 'modelA'
                    }
                });

                populatedB.should.have.property('aModels');
                populatedB.aModels.should.be.an('array');
                populatedB.aModels.should.containSubset([
                    {
                        id: ab.id,
                        modelA: {
                            id: a.id
                        }
                    }
                ]);
            })
        })
    });
});
