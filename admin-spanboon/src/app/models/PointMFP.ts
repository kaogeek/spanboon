/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { BaseModel } from './BaseModel';

export class PointMFP extends BaseModel {
    public id: string;
    public title: string;
    public detail: string;
    public link: string;
    public coverPageURL: string;
    public asset: any;
    public ordering: number;
    public expiredDate: string;
    public activeDate: string;
    public limit: number;
    public point: number;
    public condition: any[] = [];
    public category: any = {};
    // image
    public mimeType: string;
    public data: string;
    public size: string;
    public fileName: string;
}