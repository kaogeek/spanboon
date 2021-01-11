/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { BaseModel } from './BaseModel';

export class StandardItemCategory extends BaseModel {
    public id: any
    public name: any
    public description: any
    public parent: string;
    public imageURL: any
    public asset: any
}