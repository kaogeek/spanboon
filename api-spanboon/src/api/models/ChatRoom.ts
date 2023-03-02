/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { IsNotEmpty, IsMongoId } from 'class-validator';
import { Entity, Column, BeforeInsert, BeforeUpdate, ObjectIdColumn } from 'typeorm';
import { ObjectID } from 'mongodb';
import { BaseModel } from './BaseModel';
import moment = require('moment');

@Entity('ChatRoom')
export class ChatRoom extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'name' })
    public name: string;

    @Column({ name: 'type' })
    public type: string;

    @Column({ name: 'typeId' })
    public typeId: ObjectID;

    @Column({ name: 'deleted' })
    public deleted: boolean;

    @Column({ name: 'participants' })
    public participants: any[]; // data pattern is { sender: ObjectID, senderType: string}

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