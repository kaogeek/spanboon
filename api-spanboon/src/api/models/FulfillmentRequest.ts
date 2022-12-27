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

@Entity('FulfillmentRequest')
export class FulfillmentRequest extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'needsId' })
    public needsId: ObjectID;

    @Column({ name: 'standardItemId' })
    public standardItemId: ObjectID;
    
    @Column({ name: 'customItemId' })
    public customItemId: ObjectID;

    @Column({ name: 'quantity' })
    public quantity: number;

    @Column({ name: 'fulfillmentCase' })
    public fulfillmentCase: ObjectID;

    @Column({ name: 'deleted' })
    public deleted: boolean;

    @Column({ name: 'statementIds' })
    public statementIds: ObjectID[];

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().toDate();
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.updateDate = moment().toDate();
    }
}
