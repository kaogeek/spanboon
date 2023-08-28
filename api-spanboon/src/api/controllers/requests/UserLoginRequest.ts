/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';

export class UserLoginRequest {

    public username: string;
    public password: string;
    public token: string;
    public idToken: string;
    public authToken: string;
    public twitterOauthToken: string;
    public twitterOauthTokenSecret: string;
    public twitterUserId: string; // ! remove when fix a bug when verify
    public apple: string;
    public membership:boolean;
}
