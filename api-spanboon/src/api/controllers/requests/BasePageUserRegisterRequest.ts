/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';

export class BasePageUserRegisterRequest {

    public fbUserId: string;
    public fbToken: string;
    public fbAccessExpirationTime: number;
    public fbSignedRequest: string;
    public googleUserId: string;
    public authToken: string;
    public idToken: string;
    public twitterUserId: string;
    public twitterOauthToken: string;
    public twitterTokenSecret: string;
}
