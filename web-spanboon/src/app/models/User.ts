/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { BaseModel } from "./BaseModel"

export class User extends BaseModel {
    public username: string;
    public email: string;
    public firstName: string;
    public lastName: string;
    public citizenId: string;
    public birthdate: Date;
    public gender: number;
    public isAdmin: boolean;
    public password: string;
    public displayName: string;
    public customGender: string;
    public imageURL: string;
    public uniqueId: string;
    //fb
    public fbUserId: string;
    public fbToken: string;
    public fbAccessExpirationTime: number;
    public fbSignedRequest: string;
    //Google
    public googleUserId: string;
    public authToken: string;
    public idToken: string;
    //Twitter
    public twitterOauthToken: string;
    public twitterOauthTokenSecret: string;
    public twitterUserId: string;
}
