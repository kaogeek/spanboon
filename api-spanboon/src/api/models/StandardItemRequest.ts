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

@Entity('StandardItemRequest')
export class StandardItemRequest extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @IsNotEmpty()
    @Column({ name: 'name' })
    public name: string;

    @Column({ name: 'description' })
    public description: string;

    @IsNotEmpty()
    @Column({ name: 'userId' })
    public userId: ObjectID;

    @IsNotEmpty()
    @Column({ name: 'username' })
    public username: string;

    @IsNotEmpty()
    @Column({ name: 'status' })
    public status: string;

    @Column({ name: 'approveUser' })
    public approveUser: string;

    @Column({ name: 'approveDateTime' })
    public approveDateTime: Date;

    @Column({ name: 'approveDescription' })
    public approveDescription: string;

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
