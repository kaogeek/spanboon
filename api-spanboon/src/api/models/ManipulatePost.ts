import { IsNotEmpty, IsMongoId } from 'class-validator';
import { BeforeInsert, BeforeUpdate, Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectID } from 'mongodb';
import { BaseModel } from './BaseModel';
import moment from 'moment';

@Entity('ManipulatePost')
export class ManipulatePost extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'userId' })
    public userId: ObjectID;

    @Column({ name: 'postId' })
    public postId: any;

    @Column({ name: 'pageIdOwner' })
    public pageIdOwner: ObjectID;

    @Column({ name: 'userIdOwner' })
    public userIdOwner: ObjectID;

    @Column({ name: 'type' })
    public type: ObjectID;

    @Column({ name: 'detail' })
    public detail: ObjectID;
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