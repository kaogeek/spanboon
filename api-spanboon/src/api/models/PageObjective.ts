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

@Entity('PageObjective')
export class PageObjective extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @ObjectIdColumn({ name: 'pageId' })
    public pageId: ObjectID;

    @Column({ name: 'title' })
    public title: string;

    @Column({ name: 'detail' })
    public detail: string;

    @Column({ name: 'iconURL' })
    public iconURL: string;

    @Column({ name: 'category' })
    public category: string;

    @Column({ name: 'hashTag' })
    public hashTag: ObjectID;

    @Column({ name: 's3IconURL' })
    public s3IconURL: string;

    @Column({ name: 'personal' })
    public personal: boolean;

    @Column({ name: 'timeStamps' })
    public timeStamps: Date;

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
