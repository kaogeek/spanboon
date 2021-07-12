/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { IsNotEmpty, IsMongoId } from 'class-validator';
import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectID } from 'mongodb';

@Entity('PostsGallery')
export class PostsGallery {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'post' })
    public post: ObjectID;

    @Column({ name: 'fileId' })
    public fileId: ObjectID;

    @Column({ name: 'ordering' })
    public ordering: number;

    @Column({ name: 'imageURL' })
    public imageURL: string;

    @Column({ name: 's3ImageURL' })
    public s3ImageURL: string;
}