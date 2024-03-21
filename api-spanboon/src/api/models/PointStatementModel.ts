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

@Entity('PointStatement')
export class PointStatementModel extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'title' })
    public title: string;

    @Column({ name: 'detail' })
    public detail: string;

    @Column({ name: 'point' })
    public point: number;

    @Column({ name: 'productId' })
    public productId: ObjectID;

    @Column({ name: 'pointEventId' })
    public pointEventId: ObjectID;

    @Column({ name: 'type' })
    public type: any;

    @Column({ name: 'userId' })
    public userId: ObjectID;

    @Column({ name: 'createdUser'})
    public createdUser: string;

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
