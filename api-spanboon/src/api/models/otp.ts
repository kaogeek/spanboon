import { IsNotEmpty, IsMongoId } from 'class-validator';
import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectID } from 'mongodb';

@Entity('Otp')
export class Otp {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'email' })
    public email: string;

    @Column({ name: 'otp' })
    public otp: number;

    @Column({ name: 'limit' })
    public limit: number;

    @Column({ name: 'expiration' })
    public expiration: Date;
}