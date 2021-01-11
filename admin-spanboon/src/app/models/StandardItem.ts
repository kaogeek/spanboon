/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { BaseModel } from './BaseModel';

export class StandardItem extends BaseModel {
    public _id: any
    public name: any
    public unit: any
    public category: any
    public categoryId: any
    public customItems: any
    public updateDate: Date
    public imageURL: any
    public asset: any;
}