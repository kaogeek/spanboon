/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { IsNotEmpty, IsMongoId } from 'class-validator';
import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectID } from 'mongodb';

@Entity('PageAbout')
export class PageAbout {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'label' })
    public label: string;

    @Column({ name: 'value' })
    public value: string;

    @Column({ name: 'pageId' })
    public pageId: ObjectID;

    @Column({ name: 'ordering' })
    public ordering: number;
}
