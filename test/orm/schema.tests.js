import mongoose from "mongoose";
import ChimeraSchema from "app/orm/schema";

describe('ChimeraSchema', function () {
    describe('associations', function(){
        before(function(){
            this.testSchemaA = new ChimeraSchema();
            this.testSchemaB = new ChimeraSchema();
        });

        describe('hasOne', function(){
            before(function(){
                this.testSchemaA.hasOne('ModelB', {
                    foreignField: 'modelAId',
                    as: 'modelB'
                });

                this.testSchemaB.belongsTo('ModelA', {
                    localField: 'modelAId',
                    as: 'modelA'
                });

                this.testModelA = mongoose.model('ModelA', this.testSchemaA);
                this.testModelB = mongoose.model('ModelB', this.testSchemaB);
            });

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
    });
});
