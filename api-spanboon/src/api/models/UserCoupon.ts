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

@Entity('UserCoupon')
export class UserCouponModel extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'active' })
    public active: boolean;

    @Column({ name: 'userId' })
    public userId: ObjectID;

    @Column({ name: 'couponId' })
    public couponId: ObjectID;

    @Column({ name: 'productId' })
    public productId: ObjectID;

    @Column({ name: 'expireDate' })
    public expireDate: Date;

    @Column({ name: 'activeDate' })
    public activeDate: Date;

    @Column({ name: 'flag' })
    public flag: boolean;

    @Column({ name: 'username' })
    public username: string;

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
