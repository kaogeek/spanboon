/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { FB, Facebook } from 'fb';
import { facebook_setup } from '../../env';
import { AuthenticationIdService } from './AuthenticationIdService';
import { UserService } from './UserService';
import { ObjectID } from 'mongodb';
import { PROVIDER } from '../../constants/LoginProvider';
import { AuthenticationId } from '../models/AuthenticationId';
import { User } from '../models/User';

@Service()
export class FacebookService {

    constructor(private authenIdService: AuthenticationIdService, private userService: UserService) { }

    public createFB(): Facebook {
        const options = FB.options();
        options.appId = facebook_setup.FACEBOOK_APP_ID;
        options.version = facebook_setup.FACEBOOK_VERSION;
        options.appSecret = facebook_setup.FACEBOOK_APP_SECRET;
        options.cookie = facebook_setup.FACEBOOK_COOKIE;
        options.xfbml = facebook_setup.FACEBOOK_XFBML;

        return new Facebook(options);
    }

    // get App Access token
    public getAppAccessToken(): Promise<any> {
        return new Promise((resolve, reject) => {
            FB.api('oauth/access_token', {
                client_id: facebook_setup.FACEBOOK_APP_ID,
                client_secret: facebook_setup.FACEBOOK_APP_SECRET,
                grant_type: 'client_credentials'
            }, (res: any) => {
                if (!res || res.error) {
                    reject({ error: res.error });
                    return;
                }

                const accessToken = res.access_token;
                resolve({ token: accessToken });
            });
        });
    }

    // extends live time of token
    public extendsAccessToken(fbExchangeToken: string): Promise<any> {
        return new Promise((resolve, reject) => {
            FB.api('oauth/access_token', {
                client_id: facebook_setup.FACEBOOK_APP_ID,
                client_secret: facebook_setup.FACEBOOK_APP_SECRET,
                grant_type: 'fb_exchange_token',
                fb_exchange_token: fbExchangeToken
            }, (res: any) => {
                if (!res || res.error) {
                    reject({
                        error: res.error
                    });
                    return;
                }
                const accessToken = res.access_token;
                resolve({
                    token: accessToken,
                    type: res.token_type,
                    expires: res.expires_in
                });
            });
        });
    }

    // getLoginStatus return id if valid
    public getLoginStatus(accessToken: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.getFBUserId(accessToken).then((result: any) => {
                const loginResult = {
                    isLogin: (result.id !== undefined ? true : false)
                };
                resolve(loginResult);
            }).catch((error: any) => { reject(error); });
        });
    }

    // get FB Id
    public getFBUserId(accessToken: string): Promise<any> {
        return new Promise((resolve) => {
            const facebook = this.createFB();
            facebook.setAccessToken(accessToken);

            facebook.api('me/?fields=id&access_token=\'+accessToken+\'', 'post', (response: any) => {
                resolve(response);
            });
        });
    }

    public getFacebookUserFromToken(accessToken: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.getFBUserId(accessToken).then((result: any) => {
                if (result.error) { reject(result.error); return; }

                this.authenIdService.findOne({ where: { providerUserId: result.id } }).then((auth) => {
                    console.log('auth >>> ', auth);
                    if (auth === null || auth === undefined) {
                        resolve(undefined);
                        return;
                    }

                    this.userService.findOne({ where: { _id: new ObjectID(auth.user) } }).then((authUser) => {
                        console.log('authUser >>> ', authUser);
                        if (authUser) {
                            authUser = this.cleanFBUserField(authUser);
                            resolve({ token: accessToken, authId: auth, user: authUser });
                        } else {
                            resolve(undefined);
                        }
                    }).catch((userError) => { reject(userError); });
                }).catch((authError) => { reject(authError); });
            }).catch((error: any) => { reject(error); });
        });
    }

    // getUserInfo
    public getUserInfo(userId: string, accessToken: string, fields?: any[]): Promise<any> {
        return new Promise((resolve) => {
            const facebook = this.createFB();
            facebook.setAccessToken(accessToken);

            let userFields = ['id', 'name', 'email'];
            if (fields !== undefined && fields !== null) {
                userFields = fields;
            }

            facebook.api(userId, { fields: userFields }, (response: any) => {
                resolve(response);
            });
        });
    }

    public checkAccessToken(inputToken: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.getAppAccessToken().then((result: any) => {
                const facebook = this.createFB();
                facebook.setAccessToken(result.token);

                facebook.api('debug_token?input_token=' + inputToken, 'get', (response: any) => {
                    resolve(response);
                });
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public async getFacebookUserAuthenId(facebookUserId: string): Promise<AuthenticationId> {
        return await this.authenIdService.findOne({ providerName: PROVIDER.FACEBOOK, providerUserId: facebookUserId });
    }

    public async getFacebookUser(facebookUserId: string): Promise<User> {
        if (facebookUserId === undefined || facebookUserId === null || facebookUserId === '') {
            return Promise.resolve(undefined);
        }
        const authenId = await this.getFacebookUserAuthenId(facebookUserId);
        if (authenId === undefined) {
            return Promise.resolve(undefined);
        }

        return await this.userService.findOne({ _id: authenId.user });
    }

    public publishPostByUser(userId: string, message: string): Promise<any> {
        return new Promise(async (resolve, reject) => {

            const spanboonUser = await this.userService.findOne({ _id: new ObjectID(userId), banned: false });
            if (!spanboonUser) {
                reject('User was not found or was baned.');
                return;
            }

            const userAuthen: AuthenticationId = await this.authenIdService.findOne({ user: spanboonUser.username, providerName: PROVIDER.FACEBOOK });
            if (!userAuthen) {
                reject('User Auten by facebook was not found.');
                return;
            }

            const fbUserId = userAuthen.providerUserId;
            const accessToken = userAuthen.storedCredentials;

            try {
                const result = await this.publishPost(fbUserId, accessToken, message);
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }

    public publishPost(fbUserId: string, accessToken: string, message: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (fbUserId === undefined || fbUserId === null || fbUserId === '') {
                reject('Facebook User id is required.');
                return;
            }

            if (accessToken === undefined || accessToken === null || accessToken === '') {
                reject('Access token is required.');
                return;
            }

            if (message !== undefined && message !== null) {
                message = encodeURIComponent(message);
            }

            const facebook = this.createFB();
            facebook.setAccessToken(accessToken);

            facebook.api(fbUserId + '/feed?message=' + message + '&access_token=\'+accessToken+\'', 'post', (response: any) => {
                resolve(response);
            });
        });
    }

    public getFBPageAccounts(accessToken: string): Promise<any> {
        return new Promise(async (resolve, reject) => {

            if (accessToken === undefined || accessToken === null || accessToken === '') {
                reject('Access token is required.');
                return;
            }

            const facebook = this.createFB();
            facebook.setAccessToken(accessToken);

            facebook.api('/me/accounts', 'get', (response: any) => {
                resolve(response);
            });
        });
    }

    private cleanFBUserField(user: any): any {
        if (user !== undefined && user !== null) {
            if (user !== undefined && user !== null) {
                const clearItem = {
                    id: user.id,
                    username: user.username,
                    uniqueId: user.uniqueId,
                    email: user.email,
                    displayName: user.displayName,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    birthdate: user.birthdate,
                    gender: user.gender,
                    customGender: user.customGender,
                    imageURL: user.imageURL,
                    coverURL: user.coverURL,
                    coverPosition: user.coverPosition,
                    banned: user.banned,
                    isAdmin: user.isAdmin,
                    isSubAdmin: user.isSubAdmin
                };
                user = clearItem;
            }
        }
        return user;
    }
}
