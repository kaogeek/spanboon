import { Column, Entity, BeforeInsert, ObjectIdColumn, ObjectID } from 'typeorm';
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
    public async createDetails(): Promise<void> {
        this.createdDate = moment().toDate();
    }
}