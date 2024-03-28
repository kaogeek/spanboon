/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { IsNotEmpty, IsMongoId } from 'class-validator';
import { ObjectID } from 'mongodb';
import { BeforeInsert, BeforeUpdate, Column, Entity, ObjectIdColumn } from 'typeorm';
import { BaseModel } from './BaseModel';
import moment from 'moment';

@Entity('ProductCategory')
export class ProductCategoryModel extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'title' })
    public title: string;

    @Column({ name: 'username' })
    public username: string;

    @Column({ name: 'userId' })
    public userId: ObjectID;

    @Column({ name: 'assetId' })
    public assetId: ObjectID;

    @Column({ name: 'coverPageURL' })
    public coverPageURL: string;

    @Column({ name: 's3CoverPageURL'})
    public s3CoverPageURL: string;

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
