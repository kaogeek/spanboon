/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { BaseModel } from './BaseModel';

export class Manipulate extends BaseModel {
    public id: any;
    public name: string;
    public tag: string;
    public iconURL: string
    public lastActiveDate: string;
    public asset: any;
}