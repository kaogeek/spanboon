import { IsNotEmpty, IsMongoId, IsBoolean, IsNumber } from 'class-validator';
import { BeforeInsert, BeforeUpdate, Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectID } from 'mongodb';
import { BaseModel } from './BaseModel';
import moment from 'moment';

@Entity('MfpAct')
export class MfpAct extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @IsNotEmpty()
    @IsNumber()
    @Column({ name: 'phone' })
    public phone: number;
    
    @IsNotEmpty()
    @Column({ name: 'users' })
    public users: ObjectID;

    @IsNotEmpty()
    @Column({ name: 'actId' })
    public actId: string;

    @IsNotEmpty()
    @IsBoolean()
    @Column({ name: 'isBinding' })
    public isBinding: boolean;

    @BeforeInsert()
    public createDetails(): any {
        this.createdDate = moment().toDate();
        this.createdTime = moment().toDate();
    }

    @BeforeUpdate()
    public updateDetails(): any {
        this.updateDate = moment().toDate();
    }
}