/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { BaseModel } from './BaseModel';

export class Asset extends BaseModel {
    public userId: string
    public scope: string
    public data: string
    public mimeType: string
    public fileName: string
    public size: number
    public ordering: number
  }
