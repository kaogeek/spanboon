/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Column, Entity, BeforeInsert, BeforeUpdate, ObjectIdColumn } from 'typeorm';
import { BaseModel } from './BaseModel';
import moment = require('moment/moment');
import { IsNotEmpty, IsMongoId } from 'class-validator';

@Entity('emailTemplate')
export class EmailTemplate extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: number;

    @Column({ name: 'shortname' })
    public title: string;

    @Column({ name: 'subject' })
    public subject: string;

    @Column({ name: 'message' })
    public content: string;

    @Column({ name: 'isActive' })
    public isActive: number;

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
