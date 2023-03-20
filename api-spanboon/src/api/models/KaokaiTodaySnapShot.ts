import { IsNotEmpty, IsMongoId } from 'class-validator';
import { BeforeInsert, BeforeUpdate, Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectID } from 'mongodb';
import { BaseModel } from './BaseModel';
import moment from 'moment';

@Entity('KaokaiTodaySnapShot')
export class KaokaiTodaySnapShot extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'data'})
    public data: any;

    @Column({ name: 'startDateTime'})
    public startDateTime:Date;

    @Column({ name: 'endDateTime'})
    public endDateTime:Date;

    @Column({ name: 'userId'})
    public userId:ObjectID;
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