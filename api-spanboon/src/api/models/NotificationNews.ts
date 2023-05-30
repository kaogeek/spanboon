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

@Entity('NotificationNews')
export class NotificationNews extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'kaokaiTodaySnapShotId'})
    public kaokaiTodaySnapShotId:ObjectID;

    @Column({ name: 'data'})
    public data: any;

    @Column({ name: 'tokenFCM' })
    public tokenFCM: string;

    @Column({ name: 'total' })
    public toUser: number;
    
    @Column({ name: 'send'})
    public send:number;

    @Column({ name: 'startDateTime'})
    public startDateTime:Date;

    @Column({ name: 'endDateTime'})
    public endDateTime:Date;

    @Column({ name: 'finish' })
    public finish: boolean;

    @Column({ name: 'type' })
    public type: string;

    @Column({ name: 'status'})
    public status: boolean;

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
