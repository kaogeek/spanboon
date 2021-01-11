/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { BaseModel } from './BaseModel';

export class PageCategory extends BaseModel {
    public id: any;
    public name: string;
    public description: string;
    public iconURL: string;
    public asset: any;

    // image
    // public mimeType: string;
    // public data: string;
    // public size: number;
}