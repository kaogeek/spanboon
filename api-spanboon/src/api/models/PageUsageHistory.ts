/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Column, Entity, BeforeInsert, ObjectIdColumn, BeforeUpdate } from 'typeorm';
import { ObjectID } from 'mongodb';
import moment from 'moment';
import { IsNotEmpty, IsMongoId } from 'class-validator';
import { BaseModel } from './BaseModel';

@Entity('PageUsageHistory')
export class PageUsageHistory extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'pageId' })
    public pageId: ObjectID;

    @Column({ name: 'userId' })
    public userId: ObjectID;

    @Column({ name: 'contentId' })
    public contentId: string;

    @Column({ name: 'contentType' })
    public contentType: string;

    @Column({ name: 'data' })
    public data: any;

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
