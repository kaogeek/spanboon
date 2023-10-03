import { IsNotEmpty, IsMongoId } from 'class-validator';
import { BeforeInsert, BeforeUpdate, Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectID } from 'mongodb';
import { BaseModel } from './BaseModel';
import moment from 'moment';

@Entity('NewsClickModel')
export class NewsClickModel extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'kaokaiTodaySnapShotId' })
    public kaokaiTodaySnapShotId: ObjectID;

    @Column({ name: 'userId' })
    public userId: ObjectID;

    @Column({ name: 'ipAddress' })
    public ipAddress: string;

    @Column({ name: 'onClickDate' })
    public onClickDate: Date;

    @Column({ name: 'count'})
    public count: number;

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