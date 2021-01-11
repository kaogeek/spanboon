/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { IsNotEmpty, IsMongoId } from 'class-validator';
import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectID } from 'mongodb';

@Entity('FulfillmentAllocateStatement')
export class FulfillmentAllocateStatement {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'needsId' })
    public needsId: ObjectID;

    @Column({ name: 'postId' })
    public postId: ObjectID;

    @Column({ name: 'amount' })
    public amount: number;

    @Column({ name: 'fulfillmentRequest' })
    public fulfillmentRequest: ObjectID;

    @Column({ name: 'deleted' })
    public deleted: boolean;
}
