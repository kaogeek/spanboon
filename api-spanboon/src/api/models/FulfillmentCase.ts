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

@Entity('FulfillmentCase')
export class FulfillmentCase extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'status' })
    public status: string;

    @Column({ name: 'pageId' })
    public pageId: ObjectID;

    @Column({ name: 'postId' })
    public postId: ObjectID;

    @Column({ name: 'description' })
    public description: string;

    @Column({ name: 'approveUser' })
    public approveUser: ObjectID;

    @Column({ name: 'approveDateTime' })
    public approveDateTime: Date;

    @Column({ name: 'requester' })
    public requester: ObjectID;

    @Column({ name: 'deleted' })
    public deleted: boolean;

    @Column({ name: 'updatedByPageDate' })
    public updatedByPageDate: Date;

    @Column({ name: 'updatedByUserDate' })
    public updatedByUserDate: Date;

    @Column({ name: 'fulfillmentPost' })
    public fulfillmentPost: ObjectID;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().toDate();
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.updateDate = moment().toDate();
    }
}
