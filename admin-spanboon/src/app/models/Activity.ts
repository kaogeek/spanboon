/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { BaseModel } from './BaseModel';

export class Activity extends BaseModel {
    public id: any;
    public title: string;
    public coverImageUrl: string;
    public coverVideoUrl: string;
    public startDateTime: Date;
    public endDateTime: Date;
    public latitude: number;
    public longitude: number;
    public placeName: string;
    public content: string;
    public description: string;
}