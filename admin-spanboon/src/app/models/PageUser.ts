/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { BaseModel } from './BaseModel';

export class PageUser extends BaseModel{
  public id: number;
  public citizenId: string;
  public firstName: string;
  public lastName: string;
  public username: string;
  public password: string;
  public email: string;
  public mobileNumber: number;
  public oauthData: string;
  public avatar: string;
  public avatarPath: string;
  public customerGroupId: number;
  public lastLogin: string;
  public safe: number;
  public ip: number;
  public mailStatus: number;
  public deleteFlag: number;
  public isActive: number;
  public displayName: string;
  public gender: number;
  public birthday: Date;
  public province: string;
  public postcode: number;
  public career: string;
  public level: number;
  public currentExp: number;
  public classId: number;
  public fbUserId: string;
  public fbToken: string;
  public fbAccessExpirationTime: number;
  public fbSignedRequest: string; 
  public banned:boolean
  public asset:any
  public imageURL:any
}
