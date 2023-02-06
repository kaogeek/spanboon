import { IsNotEmpty, IsMongoId } from 'class-validator';
import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectID } from 'mongodb';
import { BaseModel } from './BaseModel';

@Entity('Otp')
export class Otp extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({name:'userId'})
    public userId:ObjectID;

    @Column({ name: 'email' })
    public email: string;

    @Column({ name: 'otp' })
    public otp: number;

    @Column({ name: 'limit' })
    public limit: number;

    @Column({ name: 'expiration' })
    public expiration: Date;
}