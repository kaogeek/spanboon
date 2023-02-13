import { IsNotEmpty, IsMongoId } from 'class-validator';
import { BeforeInsert, BeforeUpdate, Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectID } from 'mongodb';
import { BaseModel } from './BaseModel';
import moment from 'moment';

@Entity('Otp')
export class Otp extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'userId' })
    public userId: ObjectID;

    @Column({ name: 'email' })
    public email: string;

    @Column({ name: 'otp' })
    public otp: number;

    @Column({ name: 'limit' })
    public limit: number;

    @Column({ name: 'expiration' })
    public expiration: Date;

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