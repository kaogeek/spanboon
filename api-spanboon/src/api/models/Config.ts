/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Entity, Column, BeforeInsert, BeforeUpdate, ObjectIdColumn } from 'typeorm';
import { BaseModel } from './BaseModel';
import moment = require('moment');
import { IsNotEmpty, IsMongoId } from 'class-validator';

@Entity('Config')
export class Config extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: number;

    @Column({ name: 'name' })
    public name: string;

    @Column({ name: 'value' })
    public value: string;

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
