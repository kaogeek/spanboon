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
import { Asset } from '../models/Asset';
import moment from 'moment';
import axios from 'axios';

@Service()
export class FacebookService {
    constructor(private authenIdService: AuthenticationIdService, private userService: UserService,

    ) { }

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
                const expires = (res.expires_in === undefined) ? undefined : moment().add(res.expires_in, 'seconds').toDate();
                resolve({
                    token: accessToken,
                    type: res.token_type,
                    expires_in: res.expires_in,
                    expires
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
        return new Promise((resolve, reject) => {
            const facebook = this.createFB();
            facebook.setAccessToken(accessToken);
            facebook.api('me', { fields: ['id'], accessToken: 'accessToken' }, (response: any) => {
                if (!response || response.error) {
                    // console.log(!response ? 'error occurred' : response.error);
                    reject(response.error);
                    return;
                }
                resolve(response);
            });
        });
    }
    public async fetchFacebook(accessToken: string): Promise<any> {
        try {
            const { data } = await axios({
                url: 'https://graph.facebook.com/me?fields=id,name,email,picture&access_token=' + accessToken
            });
            return data;
        } catch (err) {
            // console.log('Error :', err);
        }
    }
    // check subscribe 
    public async checkSubscribe(pageId: string, access_token: string): Promise<any> {
        try {
            const { data } = await axios.get('https://graph.facebook.com/' + pageId + '/subscribed_apps&access_token=' + access_token);
            return data;
        } catch (err) {
            console.log('fail to subscribe webhook', err);
        }
    }

    public async getPagePicture(pageId: string, access_token: string): Promise<any> {
        try {
            const { data } = await axios.get('https://graph.facebook.com/v14.0/' + pageId + '/picture?redirect=0&type=large&access_token=' + access_token);
            return data;
        } catch (err) {
            return err;
        }
    }

    public async getPageId(userId: string, access_token: string): Promise<any> {
        try {
            const { data } = await axios.get('https://graph.facebook.com/' + userId + '/accounts?access_token=' + access_token);
            return data;
        } catch (err) {
            return err;
        }
    }
    // Get post from page on facebook
    public async pullIngPostFromFacebook(pageId: string, access_token: string): Promise<any> {
        try {
            const { data } = await axios.get('https://graph.facebook.com/' + pageId + '/feed?access_token=' + access_token);
            return data;
        } catch (err) {
            return err;
        }
    }

    // Get Photo from page on facebook
    public async pullingPhotoFromFacebook(pageId: string, access_token: string): Promise<any> {
        try {
            const { data } = await axios.get('https://graph.facebook.com/' + pageId + '/photos?url=link&access_token=' + access_token);
            return data;
        } catch (err) {
            return err;
        }
    }
    public getFacebookUserFromToken(accessToken: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.fetchFacebook(accessToken).then((result: any) => {
                if (result.error) { reject(result.error); return; }
                this.authenIdService.findOne({ where: { providerUserId: result.id, providerName:PROVIDER.FACEBOOK } }).then((auth) => {
                    if (auth === null || auth === undefined) {
                        resolve(undefined);
                        return;
                    }
                    this.userService.findOne({ where: { _id: new ObjectID(auth.user) } }).then((authUser) => {
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
    public async getRefreshToken(accessToken: string): Promise<any> {
        try {
            const { data } = await axios.post('https://graph.facebook.com/v14.0/oauth/access_token?grant_type=fb_exchange_token&client_id=' + facebook_setup.FACEBOOK_APP_ID + '&client_secret=' + facebook_setup.FACEBOOK_APP_SECRET + '&fb_exchange_token=' + accessToken);
            return data;
        } catch (err) {
            return err;
        }
    }
    public async appAccessToken(): Promise<any> {
        try {
            const { data } = await axios.get('https://graph.facebook.com/oauth/access_token?client_id=' + facebook_setup.FACEBOOK_APP_ID + '&client_secret=' + facebook_setup.FACEBOOK_APP_SECRET + '&grant_type=client_credentials');
            return data;
        } catch (err) {
            console.log('Cannot get AppAccessToken', err);
            return err;
        }
    }
    public async expireToken(inputToken: string, appAccessToken: any): Promise<any> {
        try {
            const { data } = await axios.get('https://graph.facebook.com/v14.0/debug_token?fields=data,expires_at,data_access_expires_at,is_valid&input_token=' + inputToken + '&access_token=' + appAccessToken);
            return data;
        } catch (err) {
            console.log('Cannot debug token', err);
            return err;
        }
    }

    // Callback_URL 

    public async subScriptionWbApp(verifyToken: string): Promise<any> {
        try {
            const { data } = await axios.post('https://graph.facebook.com/v14.0/' + facebook_setup.FACEBOOK_APP_ID + '/subscriptions?object=page&include_values=true&verify_token= ' + verifyToken + '&callback_url=' + process.env.FACEBOOK_CALLBACK_URL + '/&access_token= ' + facebook_setup.FACEBOOK_APP_ID + '|' + facebook_setup.FACEBOOK_APP_SECRET);
            return data;
        } catch (err) {
            console.log('Cannot subscribetion Webhooks ', err);
            return err;
        }
    }
    public checkAccessToken(inputToken: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.getAppAccessToken().then((result: any) => {
                const facebook = this.createFB();
                facebook.setAccessToken(result.token);

                facebook.api('debug_token?input_token=' + inputToken, 'get', (response: any) => {
                    if (!response || response.error) {
                        // console.log(!response ? 'error occurred' : response.error);
                        reject(response.error);
                        return;
                    }

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
                const result = await this.publishMessage(fbUserId, accessToken, message);
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }

    public publishImage(fbUserId: string, accessToken: string, imageBase64: string, mimeType: string, filename: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (fbUserId === undefined || fbUserId === null || fbUserId === '') {
                reject('Facebook User id is required.');
                return;
            }

            if (accessToken === undefined || accessToken === null || accessToken === '') {
                reject('Access token is required.');
                return;
            }

            if (imageBase64 === undefined || imageBase64 === null || imageBase64 === '') {
                reject('imageBase64 is required.');
                return;
            }

            if (mimeType === undefined || mimeType === null || mimeType === '') {
                reject('mimeType is required.');
                return;
            }

            if (filename === undefined || filename === null || filename === '') {
                reject('filenameis required.');
                return;
            }

            const facebook = this.createFB();
            facebook.setAccessToken(accessToken);

            let photoBuffer = undefined;
            try {
                photoBuffer = Buffer.from(imageBase64, 'base64');
            } catch (error) {
                // console.log(error);
            }

            if (photoBuffer === undefined) {
                reject('Cannot convert image file.');
                return;
            }

            const formData: any = { source: { value: photoBuffer, options: { filename, contentType: mimeType } } };

            facebook.api(fbUserId + '/photos?published=false', 'post', formData, (response: any) => {
                if (!response || response.error) {
                    // console.log(!response ? 'error occurred' : response.error);
                    reject(response.error);
                    return;
                }
                resolve(response);
            });
        });
    }
    public publishMessage(fbPageId: string, accessToken: string, message: string, imageIds?: string[]): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (fbPageId === undefined || fbPageId === null || fbPageId === '') {
                reject('Facebook User id is required.');
                return;
            }

            if (accessToken === undefined || accessToken === null || accessToken === '') {
                reject('Access token is required.');
                return;
            }

            if (message === undefined || message === null) {
                message = '';
            }

            const facebook = this.createFB();
            facebook.setAccessToken(accessToken);

            const formData: any = { message };
            if (imageIds !== null && imageIds !== undefined && imageIds.length > 0) {
                for (let i = 0; i < imageIds.length; i++) {
                    const key = 'attached_media[' + i + ']';
                    const id = imageIds[i];

                    formData[key] = {
                        media_fbid: id
                    };
                }
            }
            // xaxios.post('https://graph.facebook.com/'+ accessToken + '/feed');

            this.publishPageId(fbPageId, accessToken).then((res) => {
                console.log('res_facebook', res);
                try {
                    if (imageIds !== null && imageIds !== undefined && imageIds.length > 0 && imageIds.length === 1) {
                        axios.post(`https://graph.facebook.com/${res.id}/feed?message=${encodeURI(message)}&attached_media[0]={media_fbid:${imageIds[0]}}&access_token=${res.access_token}`).then((resFacebook) => {
                            resolve(resFacebook.data);
                        });
                    } else if (imageIds !== null && imageIds !== undefined && imageIds.length > 0 && imageIds.length === 2) {
                        axios.post(`https://graph.facebook.com/${res.id}/feed?message=${encodeURI(message)}&attached_media[0]={media_fbid:${imageIds[0]}}&attached_media[1]={media_fbid:${imageIds[1]}}&access_token=${res.access_token}`).then((resFacebook) => {
                            resolve(resFacebook.data);
                        });
                    } else if (imageIds !== null && imageIds !== undefined && imageIds.length > 0 && imageIds.length === 3) {
                        axios.post(`https://graph.facebook.com/${res.id}/feed?message=${encodeURI(message)}&attached_media[0]={media_fbid:${imageIds[0]}}&attached_media[1]={media_fbid:${imageIds[1]}}&attached_media[2]={media_fbid:${imageIds[2]}}&access_token=${res.access_token}`).then((resFacebook) => {
                            resolve(resFacebook.data);
                        });
                    } else if (imageIds !== null && imageIds !== undefined && imageIds.length > 0 && imageIds.length === 4) {
                        axios.post(`https://graph.facebook.com/${res.id}/feed?message=${encodeURI(message)}&attached_media[0]={media_fbid:${imageIds[0]}}&attached_media[1]={media_fbid:${imageIds[1]}}&attached_media[2]={media_fbid:${imageIds[2]}}&attached_media[3]={media_fbid:${imageIds[3]}}&access_token=${res.access_token}`).then((resFacebook) => {
                            resolve(resFacebook.data);
                        });
                    } else {
                        axios.post(`https://graph.facebook.com/${res.id}/feed?message=${encodeURI(message)}!&access_token=${res.access_token}`).then((resFacebook) => {
                            resolve(resFacebook.data);
                        });
                    }
                } catch (err) {
                    console.log('Error Feed Message', err);
                }
            });
        });
    }

    public async publishPageId(fbUserId: string, accessToken: string): Promise<any> {
        try {
            const { data } = await axios.get(`https://graph.facebook.com/${fbUserId}?fields=access_token&access_token=${accessToken}`);
            console.log('publishPageId', data);
            return data;
        } catch (err) {
            // console.log('Error publishPageId :'+ err);
        }
    }

    public async coverImagePage(fbUserId: string, accessToken: string): Promise<any> {
        try {
            const { data } = await axios.get(`https://graph.facebook.com/v14.0/${fbUserId}?fields=cover&access_token=${accessToken}`);
            return data;
        } catch (err) {
            console.log('Error CoverImagePage :' + err);
        }
    }

    public async subScribeWebhook(fbUserId: string, accessToken: string): Promise<any> {
        try {
            const { data } = await axios.post('https://graph.facebook.com/' + fbUserId + '/subscribed_apps?subscribed_fields=feed&access_token=' + accessToken);
            return data;
        } catch (err) {
            console.log('Error SubScribeWebhooks :' + err);
        }
    }

    public async getPageFb(fbPageId: string, accessToken: string): Promise<any> {
        try {
            const { data } = await axios.get('https://graph.facebook.com/' + fbPageId + '?access_token=' + accessToken + '&fields=id,name,username,description,emails,category,birthday,about,cover,link,phone');
            return data;
        } catch (err) {
            console.log('Error cannot get page detail :' + err);
        }
    }

    public publishPost(fbUserId: string, accessToken: string, message: string, assets?: Asset[]): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (fbUserId === undefined || fbUserId === null || fbUserId === '') {
                reject('Facebook User id is required.');
                return;
            }

            if (accessToken === undefined || accessToken === null || accessToken === '') {
                reject('Access token is required.');
                return;
            }

            let hasMsg = false;
            if (message !== undefined && message !== null) {
                hasMsg = true;
            }
            let hasImage = false;
            if (assets !== undefined && assets !== null && assets.length > 0) {
                hasImage = true;
            }

            try {
                if (hasMsg && !hasImage) {
                    // only message
                    const result = await this.publishMessage(fbUserId, accessToken, message);
                    resolve(result);
                } else if (hasImage) {
                    const imagesIds = [];
                    for (const asset of assets) {
                        try {
                            const idObject = await this.publishImage(fbUserId, accessToken, asset.data, asset.mimeType, asset.fileName);
                            if (idObject.id !== undefined) {
                                imagesIds.push(idObject.id);
                            }
                        } catch (err) {
                            // console.log(err);
                        }
                    }

                    const result = await this.publishMessage(fbUserId, accessToken, message, imagesIds);
                    resolve(result);
                } else {
                    reject('Can not publishPost');
                    return;
                }
            } catch (error) {
                reject(error);
            }
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
                if (!response || response.error) {
                    // console.log(!response ? 'error occurred' : response.error);
                    reject(response.error);
                    return;
                }
                resolve(response);
            });
        });
    }

    /* 
    * accessToken is usertoken who can access fbPage
    */
    public extendsPageAccountToken(userAccessToken: string, fbPageId: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (userAccessToken === undefined || userAccessToken === null || userAccessToken === '') {
                reject('Access token is required.');
                return;
            }

            if (fbPageId === undefined || fbPageId === null || fbPageId === '') {
                reject('Facebook pageId is required.');
                return;
            }

            try {
                let pageAccessToken;
                const pageAccounts = await this.getFBPageAccounts(userAccessToken);
                if (pageAccounts !== undefined) {
                    for (const pageAccount of pageAccounts.data) {
                        if (pageAccount.id === fbPageId) {
                            pageAccessToken = pageAccount.access_token;
                            break;
                        }
                    }
                }

                if (pageAccessToken === undefined) {
                    reject('You cannot access Facebook page.');
                    return;
                }

                const longLiveToken = await this.extendsAccessToken(pageAccessToken);
                resolve(longLiveToken);
            } catch (err) {
                reject(err);
            }
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
