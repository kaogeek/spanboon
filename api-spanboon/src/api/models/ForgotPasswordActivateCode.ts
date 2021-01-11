/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { IsNotEmpty, IsMongoId } from 'class-validator';
import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectID } from 'mongodb';

@Entity('ForgotPasswordActivateCode')
export class ForgotPasswordActivateCode {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'userId' })
    public userId: ObjectID;

    @Column({ name: 'username' })
    public username: string;

    @Column({ name: 'email' })
    public email: string;

    @Column({ name: 'code' })
    public code: string;

    @Column({ name: 'expirationDate' })
    public expirationDate: Date;

    @Column({ name: 'activate' })
    public activate: boolean;

    @Column({ name: 'activateDate' })
    public activateDate: Date;
}
