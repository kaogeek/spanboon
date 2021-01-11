/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { IsNotEmpty, IsMongoId } from 'class-validator';
import { BeforeInsert, BeforeUpdate, Column, Entity, ObjectIdColumn, Index } from 'typeorm';
import { ObjectID } from 'mongodb';
import { BaseModel } from './BaseModel';
import moment from 'moment';

@Entity('StandardItem')
export class StandardItem extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Index({ unique: true })
    @Column({ name: 'name' })
    public name: string;

    @Column({ name: 'unit' })
    public unit: string;

    @Column({ name: 'category' })
    public category: string;

    @Column({ name: 'imageURL' })
    public imageURL: string;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().toDate();
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.updateDate = moment().toDate();
    }
}
