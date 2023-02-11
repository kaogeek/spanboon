import { Column, Entity, BeforeInsert, ObjectIdColumn, ObjectID, BeforeUpdate } from 'typeorm';
import moment = require('moment/moment');
import { IsNotEmpty, IsMongoId } from 'class-validator';
import { BaseModel } from './BaseModel';

@Entity('FacebookWebhookLogs')
export class FacebookWebhookLogs extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'data' })
    public data: any;

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