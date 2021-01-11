/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { IsNotEmpty, IsMongoId } from 'class-validator';
import { Column, Entity, ObjectIdColumn, Index } from 'typeorm';
import { ObjectID } from 'mongodb';

@Entity('StandardItemCategory')
export class StandardItemCategory {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Index({ unique: true })
    @Column({ name: 'name' })
    public name: string;

    @Column({ name: 'unit' })
    public unit: string;

    @Column({ name: 'imageURL' })
    public imageURL: string;

    @Column({ name: 'description' })
    public description: string;

    @Column({ name: 'parent' })
    public parent: string;
}
