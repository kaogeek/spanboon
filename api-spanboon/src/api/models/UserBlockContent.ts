import { IsNotEmpty, IsMongoId } from 'class-validator';
import moment from 'moment';
import { ObjectIdColumn, Column, BeforeInsert, BeforeUpdate, Entity } from 'typeorm';
import { BaseModel } from './BaseModel';
import { ObjectID } from 'mongodb';

@Entity('UserBlockcontent')
export class UserBlockContent extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'userId' })
    public userId: ObjectID;

    @Column({ name: 'subjectId' })
    public subjectId: ObjectID;

    @Column({ name: 'subjectType' })
    public subjectType: string;

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