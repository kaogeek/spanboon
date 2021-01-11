/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { BaseModel } from './BaseModel';

export class StandardItemCustom extends BaseModel {
    public id: string
    public userId: any
    public items: any[]
    public name: string
    public unit: any
    public imageURL: any
    public category: any
    public categoryId: any
    public description: any
    public createdDate: Date
    public updateDate: Date
    public asset: any
}