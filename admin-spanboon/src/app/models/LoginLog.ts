/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { BaseModel } from './BaseModel';

export class LoginLog extends BaseModel {
    public id: number;
    public userId: number;
    public emailId: string;
    public firstName: string;
    public ipAddress: string;
}