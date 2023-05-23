/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { IsNotEmpty, IsMongoId } from 'class-validator';
import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectID } from 'mongodb';

@Entity('UserProvideItems')
export class UserProvideItems {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'standardItemId' })
    public standardItemId: ObjectID;

    @Column({ name: 'customItemId' })
    public customItemId: ObjectID;

    @Column({ name: 'user' })
    public user: string;

    @Column({ name: 'itemName' })
    public itemName: string;

    @Column({ name: 'quantity' })
    public quantity: number;

    @Column({ name: 'unit' })
    public unit: string;

    @Column({ name: 'description' })
    public description: string;

    @Column({ name: 'active' })
    public active: boolean;
}
