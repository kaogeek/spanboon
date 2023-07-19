/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { IsNotEmpty, IsMongoId } from 'class-validator';
import { Column, Entity, ObjectIdColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { ObjectID } from 'mongodb';
import { BaseModel } from './BaseModel';
import moment from 'moment';

@Entity('HashTag')
export class HashTag extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'name' })
    public name: string;

    @Column({ name: 'iconURL' })
    public iconURL: string;

    @Column({ name: 'count' })
    public count: number;

    @Column({ name: 'lastActiveDate' })
    public lastActiveDate: Date;

    @Column({ name: 'pageId' })
    public pageId: ObjectID;

    @Column({ name: 'objectiveId' })
    public objectiveId: ObjectID;

    @Column({ name: 'type' })
    public type: string;

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
