/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { BaseModel } from './BaseModel';

export class StandardItemRequest extends BaseModel {
    public name: string
    public description: string
    public userId: string
    public username: string
    public status: string
    public approveUser: string
    public approveDateTime: Date
    public approveDescription: string
}