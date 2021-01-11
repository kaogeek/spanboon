/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { BaseModel } from './BaseModel';
import 'reflect-metadata';

export class PageApproveRequest extends BaseModel {

    public name: string;
    public pageUsername: string;
    public subTitle: string;
    public backgroundStory: string;
    public detail: string;
    public imageURL: any;
    public coverURL: any;
    public color: string;
    public category: string;
    public asset: any;
    public pageAccessLevel: number;
}