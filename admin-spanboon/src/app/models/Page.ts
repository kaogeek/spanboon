/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { BaseModel } from './BaseModel';

export class Page extends BaseModel {
    public id: any
    public name: string
    public updateDate: Date
    public ownerUser: string
    public banned: boolean;
    public group: string;
    public province: string;
    public detail: string
    length: number;
}