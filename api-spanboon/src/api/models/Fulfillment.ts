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

@Entity('Fulfillment')
export class Fulfillment extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'requestId' })
    public requestId: ObjectID;

    @Column({ name: 'name' })
    public name: string;

    @Column({ name: 'user' })
    public user: string;

    @Column({ name: 'status' })
    public status: string;

    @Column({ name: 'post' })
    public post: ObjectID;

    @Column({ name: 'casePost' })
    public casePost: ObjectID;

    @Column({ name: 'need' })
    public need: string;

    @Column({ name: 'pageId' })
    public pageId: ObjectID;

    @Column({ name: 'quantity' })
    public quantity: number;

    @Column({ name: 'unit' })
    public unit: string;

    @Column({ name: 'description' })
    public description: string;

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
