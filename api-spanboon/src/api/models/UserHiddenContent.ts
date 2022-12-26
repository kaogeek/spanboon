import { IsNotEmpty, IsMongoId } from 'class-validator';
import moment from 'moment';
import { ObjectIdColumn, Column, BeforeInsert, BeforeUpdate, Entity } from 'typeorm';
import { BaseModel } from './BaseModel';
import { ObjectID } from 'mongodb';

@Entity('UserHiddencontent')
export class UserHiddenContent extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'userId' })
    public userId: ObjectID;

    @Column({ name: 'pageId' })
    public pageId: ObjectID;

    @Column({ name: 'postId' })
    public postId: ObjectID;

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