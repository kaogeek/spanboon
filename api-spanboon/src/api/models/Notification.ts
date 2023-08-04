/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { IsNotEmpty, IsMongoId } from 'class-validator';
import { BeforeInsert, BeforeUpdate, Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectID } from 'mongodb';
import { BaseModel } from './BaseModel';
import moment from 'moment';

@Entity('Notification')
export class Notification extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'title' })
    public title: string;

    @Column({ name: 'fromUser' })
    public fromUser: ObjectID;

    @Column({ name: 'toUser' })
    public toUser: ObjectID;

    @Column({ name: 'isRead' })
    public isRead: boolean;

    @Column({ name: 'toUserType' })
    public toUserType: string;

    @Column({ name: 'fromUserType' })
    public fromUserType: string;

    @Column({ name: 'link' })
    public link: string;

    @Column({ name: 'type' })
    public type: string;

    @Column({ name: 'deleted' })
    public deleted: boolean;

    @Column({ name: 'data' })
    public data: any;

    @Column({ name: 'mode' })
    public mode: string;

    @Column({ name: 'pageId' })
    public pageId: ObjectID;

    @Column({ name: 'imageURL' })
    public imageURL:string;

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
