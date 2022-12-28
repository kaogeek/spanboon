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

@Entity('Needs')
export class Needs extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;
    
    @Column({ name: 'standardItemId' })
    public standardItemId: ObjectID;
    
    @Column({ name: 'customItemId' })
    public customItemId: ObjectID;
    
    @Column({ name: 'pageId' })
    public pageId: ObjectID;

    @Column({ name: 'name' })
    public name: string;

    @Column({ name: 'active' })
    public active: boolean;

    @Column({ name: 'fullfilled' })
    public fullfilled: boolean;

    @Column({ name: 'quantity' })
    public quantity: number;

    @Column({ name: 'unit' })
    public unit: string;

    @Column({ name: 'post' })
    public post: ObjectID;

    @Column({ name: 'description' })
    public description: string;

    @Column({ name: 'fulfillQuantity' })
    public fulfillQuantity: number;

    @Column({ name: 'pendingQuantity' })
    public pendingQuantity: number;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().toDate();
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.updateDate = moment().toDate();
    }
}
