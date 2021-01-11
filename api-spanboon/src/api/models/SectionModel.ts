/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { BaseModel } from './BaseModel';

export class SectionModel extends BaseModel {
    public title: string;
    public subtitle: string;
    public description: string;
    public link: string;
    public contents: any[];
    public iconUrl: string;
    public contentCount: number;
    public dateTime: Date;
    public templateType: string;
    public data: any;
    public isList = false;
}