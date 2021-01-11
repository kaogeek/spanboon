/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { BaseModel } from './BaseModel';

export class User extends BaseModel {
  public id: any;
  public email: string;
  public password: string;
  public firstName: string;
  public lastName: string;
  public displayName: string;
  public birthdate: Date;
  public citizenId: string;
  public gender: number;
  public customGender: string;
  public data: string;
  public mimeType: string;
  public size: number;
  public fileName: string;
  public banned: boolean;

}