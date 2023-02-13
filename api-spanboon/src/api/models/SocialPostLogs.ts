/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import { IsNotEmpty, IsMongoId } from 'class-validator';
import { BeforeInsert, BeforeUpdate, Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectID } from 'mongodb';
import { BaseModel } from './BaseModel';
import moment from 'moment';

@Entity('SocialPostLogs')
export class SocialPostLogs extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'user' })
    public user: ObjectID;

    @Column({ name: 'pageId' })
    public pageId: ObjectID;

    @Column({ name: 'providerName' })
    public providerName: string;

    @Column({ name: 'providerUserId' })
    public providerUserId: any;

    @Column({ name: 'lastSocialPostId' })
    public lastSocialPostId: string;

    @Column({ name: 'properties' })
    public properties: any;

    @Column({ name: 'enable' })
    public enable: boolean;

    @Column({ name: 'lastUpdated' })
    public lastUpdated: Date;

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
