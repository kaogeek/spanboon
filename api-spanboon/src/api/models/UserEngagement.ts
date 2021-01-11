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

@Entity('UserEngagement')
export class UserEngagement extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'contentId' })
    public contentId: string;

    @Column({ name: 'contentType' })
    public contentType: string;

    @Column({ name: 'ip' })
    public ip: string;

    @Column({ name: 'userId' })
    public userId: string;

    @Column({ name: 'clientId' })
    public clientId: string;

    @Column({ name: 'isFirst' })
    public isFirst: boolean;

    @Column({ name: 'action' })
    public action: string;

    @Column({ name: 'reference' })
    public reference: string;

    @Column({ name: 'likeAsPage' })
    public likeAsPage: ObjectID;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().toDate();
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.updateDate = moment().toDate();
    }
}
