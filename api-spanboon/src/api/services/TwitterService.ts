/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */
import * as https from 'https';
import * as oauthSignature from 'oauth-signature';
import * as querystring from 'querystring';
import moment from 'moment';
import { Service } from 'typedi';
import { twitter_setup } from '../../env';
import { AuthenticationIdService } from './AuthenticationIdService';
import { SocialPostLogsService } from './SocialPostLogsService';
import { UserService } from './UserService';
import { ObjectID } from 'mongodb';
import { PROVIDER } from '../../constants/LoginProvider';
import { AuthenticationId } from '../models/AuthenticationId';
import { User } from '../models/User';
import { OAuthUtil } from '../../utils/OAuthUtil';

@Service()
export class TwitterService {

    public static readonly ROOT_URL: string = 'https://api.twitter.com';

    constructor(private authenIdService: AuthenticationIdService, private userService: UserService, private socialPostLogsService: SocialPostLogsService) { }

    public async requestToken(calbackUrl?: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let callback = '';
            if (calbackUrl !== undefined && calbackUrl !== null && calbackUrl !== '') {
                callback = '?oauth_callback=' + encodeURIComponent(calbackUrl);
            }

            const url: string = TwitterService.ROOT_URL + '/oauth/request_token' + callback;
            const oauth_timestamp = Math.floor((new Date()).getTime() / 1000).toString();
            const oauth_nonce = OAuthUtil.generateNonce(); // unique token your application should generate for each unique request

            // generate oauth
            const parameters = {
                oauth_consumer_key: twitter_setup.TWITTER_API_KEY,
                oauth_token: twitter_setup.TWITTER_ACCESS_TOKEN,
                oauth_signature_method: 'HMAC-SHA1',
                oauth_timestamp,
                oauth_nonce,
                oauth_version: '1.0'
            };
            if (calbackUrl !== undefined && calbackUrl !== null && calbackUrl !== '') {
                parameters['oauth_callback'] = calbackUrl;
            }
            const options = {};

            let oauth_signature = '';
            try {
                oauth_signature = oauthSignature.default.generate('POST', url, parameters, twitter_setup.TWITER_API_SECRET_KEY, twitter_setup.TWITTER_TOKEN_SECRET, options);
            } catch (error: any) {
                reject(error.message);
                return;
            }

            const httpOptions: any = {
                method: 'POST',
                responseType: 'text'
            };

            const req = https.request(url, httpOptions, (res) => {
                const { statusCode, statusMessage } = res;

                if (statusCode !== 200) {
                    reject('statusCode ' + statusCode + ' ' + statusMessage);
                    return;
                }

                let rawData = '';
                res.on('data', (chunk) => { rawData += chunk; });
                res.on('end', () => {
                    try {
                        resolve(rawData);
                    } catch (e: any) {
                        reject(e.message);
                    }
                });
            });
            const auth = 'OAuth oauth_consumer_key="' + twitter_setup.TWITTER_API_KEY + '",oauth_token="' + twitter_setup.TWITTER_ACCESS_TOKEN + '",oauth_signature_method="HMAC-SHA1",oauth_timestamp="' + oauth_timestamp + '",oauth_nonce="' + oauth_nonce + '",oauth_version="1.0",oauth_signature="' + oauth_signature + '"';
            req.setHeader('Accept', '*/*');
            req.setHeader('Authorization', auth);
            req.flushHeaders();
            req.on('error', (e) => {
                reject(e);
            });
            req.end();
        });
    }

    public getAccessToken(oauthToken: string, oauthVerifier: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (oauthToken === undefined || oauthToken === null || oauthToken === '') {
                reject('oauthToken was required');
                return;
            }

            if (oauthVerifier === undefined || oauthVerifier === null || oauthVerifier === '') {
                reject('oauthVerifier was required');
                return;
            }

            const postData = querystring.stringify({
                oauth_token: oauthToken,
                oauth_verifier: oauthVerifier
            });

            let queryParam = postData;
            if (queryParam !== '') {
                queryParam = '?' + queryParam;
            }

            const url: string = TwitterService.ROOT_URL + '/oauth/access_token' + queryParam;

            const httpOptions: any = {
                method: 'GET',
                responseType: 'text'
            };

            const req = https.request(url, httpOptions, (res) => {
                const { statusCode, statusMessage } = res;

                if (statusCode !== 200) {
                    console.log('statusMessage: ' + statusMessage);
                    reject('statusCode ' + statusCode + ' ' + statusMessage);
                    return;
                }

                let rawData = '';
                res.on('data', (chunk) => { rawData += chunk; });
                res.on('end', () => {
                    try {
                        resolve(rawData);
                    } catch (e: any) {
                        reject(e.message);
                    }
                });
            });
            req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
            req.setHeader('Accept', '*/*');
            req.flushHeaders();
            req.on('error', (e) => {
                reject(e);
            });
            req.end();
        });
    }

    public getTwitterUserTimeLine(twitterUserId: string, paramsOption?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            // paramsOption = since_id, until_id, start_time, end_time

            this.getOauth2AppAccessToken().then((twitterResult: any) => {
                if (twitterResult === undefined || !twitterResult['access_token']) {
                    reject('Access token was not found');
                    return;
                }
                let url: string = TwitterService.ROOT_URL + '/2/users/' + twitterUserId + '/tweets?tweet.fields=created_at';
                if (paramsOption !== undefined && paramsOption !== null && paramsOption !== '') {
                    let appendString = '';
                    for (const key of Object.keys(paramsOption)) {
                        appendString += '&' + key + '=' + paramsOption[key];
                    }

                    if (appendString !== '') {
                        url = url + '&' + appendString;
                    }
                }

                const httpOptions: any = {
                    method: 'GET',
                    json: true
                };

                const req = https.request(url, httpOptions, (res) => {
                    const { statusCode, statusMessage } = res;
                    if (statusCode !== 200) {
                        reject('statusCode ' + statusCode + ' ' + statusMessage);
                        return;
                    }

                    let rawData = '';
                    res.on('data', (chunk) => { rawData += chunk; });
                    res.on('end', () => {
                        try {
                            const parsedData = JSON.parse(rawData);
                            resolve(parsedData);
                        } catch (e: any) {
                            reject(e.message);
                        }
                    });
                });

                const accessToken = twitterResult['access_token'];
                const auth = 'Bearer ' + accessToken;

                req.setHeader('Content-Type', 'application/json');
                req.setHeader('Accept', '*/*');
                req.setHeader('Authorization', auth);
                req.flushHeaders();
                req.on('error', (e) => {
                    reject(e);
                });
                req.end();
            }).catch((error) => {
                reject(error);
            });
        });
    }

    public async verifyUserCredentials(userId: string): Promise<any> {
        const user = await this.userService.findOne({ _id: new ObjectID(userId) });

        if (user === undefined) {
            return 'User was not found.';
        }

        if (user.banned) {
            return 'User was not banned.';
        }

        const authenId: AuthenticationId = await this.authenIdService.findOne({ user: new ObjectID(userId), providerName: PROVIDER.TWITTER });
        if (authenId === undefined) {
            return 'Twitter registration was not found.';
        }

        let accessToken = '';
        let tokenSecret = '';
        if (authenId.properties !== undefined) {
            accessToken = authenId.properties.oauthToken;
            tokenSecret = authenId.properties.oauthTokenSecret;
        }

        return await this.verifyCredentials(accessToken, tokenSecret);
    }

    public verifyCredentials(accessToken: string, tokenSecret: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (accessToken === undefined || accessToken === null || accessToken === '') {
                reject('accessToken was required');
                return;
            }

            if (tokenSecret === undefined || tokenSecret === null || tokenSecret === '') {
                reject('tokenSecret was required');
                return;
            }

            const url: string = TwitterService.ROOT_URL + '/1.1/account/verify_credentials.json';
            const oauth_timestamp = Math.floor((new Date()).getTime() / 1000).toString();
            const oauth_nonce = OAuthUtil.generateNonce(); // unique token your application should generate for each unique request

            // generate oauth
            const parameters = {
                oauth_consumer_key: twitter_setup.TWITTER_API_KEY,
                oauth_token: accessToken,
                oauth_signature_method: 'HMAC-SHA1',
                oauth_timestamp,
                oauth_nonce,
                oauth_version: '1.0'
            };
            const options = {};

            let oauth_signature = '';
            try {
                oauth_signature = oauthSignature.default.generate('GET', url, parameters, twitter_setup.TWITER_API_SECRET_KEY, tokenSecret, options);
            } catch (error: any) {
                reject(error.message);
                return;
            }

            const httpOptions: any = {
                method: 'GET',
                json: true
            };

            const req = https.request(url, httpOptions, (res) => {
                const { statusCode, statusMessage } = res;

                if (statusCode !== 200) {
                    reject('statusCode ' + statusCode + ' ' + statusMessage);
                    return;
                }

                let rawData = '';
                res.on('data', (chunk) => { rawData += chunk; });
                res.on('end', () => {
                    try {
                        const parsedData = JSON.parse(rawData);
                        resolve(parsedData);
                    } catch (e: any) {
                        reject(e.message);
                    }
                });
            });
            const auth = 'OAuth oauth_consumer_key="' + twitter_setup.TWITTER_API_KEY + '",oauth_token="' + accessToken + '",oauth_signature_method="HMAC-SHA1",oauth_timestamp="' + oauth_timestamp + '",oauth_nonce="' + oauth_nonce + '",oauth_version="1.0",oauth_signature="' + oauth_signature + '"';
            req.setHeader('Content-Type', 'application/json');
            req.setHeader('Accept', '*/*');
            req.setHeader('Authorization', auth);
            req.flushHeaders();
            req.on('error', (e) => {
                reject(e);
            });
            req.end();
        });
    }

    public getTwitterUserFromToken(accessToken: string, tokenSecret: string): Promise<User> {
        return new Promise(async (resolve, reject) => {
            try {
                const value: any = await this.verifyCredentials(accessToken, tokenSecret);

                const twUserId = value.id_str;
                if (twUserId === undefined || twUserId === '') {
                    reject('Twitter User Id was not found.');
                    return;
                }

                const authenId = await this.authenIdService.findOne({ providerUserId: twUserId, providerName: PROVIDER.TWITTER });
                if (authenId === undefined) {
                    reject('User was not found.');
                    return;
                }

                const user = await this.userService.findOne({ _id: authenId.user });

                resolve(user);
            } catch (err) {
                reject(err);
            }

            return undefined;
        });
    }

    public async getTwitterUserAuthenId(twitterUserId: string): Promise<AuthenticationId> {
        return await this.authenIdService.findOne({ providerName: PROVIDER.TWITTER, providerUserId: twitterUserId });
    }

    public async getTwitterUser(twitterUserId: string): Promise<User> {
        if (twitterUserId === undefined || twitterUserId === null || twitterUserId === '') {
            return Promise.resolve(undefined);
        }
        const authenId = await this.getTwitterUserAuthenId(twitterUserId);
        if (authenId === undefined) {
            return Promise.resolve(undefined);
        }
        return await this.userService.findOne({ _id: authenId.user }, { signURL: true });
    }

    public postImageByToken(accessToken: string, tokenSecret: string, imageBase64: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (accessToken === undefined || accessToken === null || accessToken === '') {
                reject('accessToken was required');
                return;
            }

            if (tokenSecret === undefined || tokenSecret === null || tokenSecret === '') {
                reject('accessToken was required');
                return;
            }

            if (imageBase64 === undefined || imageBase64 === '') {
                reject('imageBase64 was required');
                return;
            }

            const url = 'https://upload.twitter.com/1.1/media/upload.json';

            const oauth_timestamp = Math.floor((new Date()).getTime() / 1000).toString();
            const oauth_nonce = OAuthUtil.generateNonce(); // unique token your application should generate for each unique request

            const writeBody = 'media_data=' + encodeURIComponent(imageBase64);

            // generate oauth
            const parameters = {
                oauth_consumer_key: twitter_setup.TWITTER_API_KEY,
                oauth_token: accessToken,
                oauth_signature_method: 'HMAC-SHA1',
                oauth_timestamp,
                oauth_nonce,
                oauth_version: '1.0',
                media_data: imageBase64

            };
            const options = {};

            let oauth_signature = '';
            try {
                oauth_signature = oauthSignature.default.generate('POST', url, parameters, twitter_setup.TWITER_API_SECRET_KEY, tokenSecret, options);
            } catch (error: any) {
                reject(error.message);
                return;
            }

            const httpOptions: any = {
                method: 'POST',
                json: true
            };

            const req = https.request(url, httpOptions, (res) => {
                const { statusCode, statusMessage } = res;

                if (statusCode !== 200) {
                    reject('statusCode ' + statusCode + ' ' + statusMessage);
                    return;
                }

                let rawData = '';
                res.on('data', (chunk) => { rawData += chunk; });
                res.on('end', () => {
                    try {
                        const parsedData = JSON.parse(rawData);
                        resolve(parsedData);
                    } catch (e: any) {
                        reject(e.message);
                    }
                });
            });
            const auth = 'OAuth oauth_consumer_key="' + twitter_setup.TWITTER_API_KEY + '",oauth_token="' + accessToken + '",oauth_signature_method="HMAC-SHA1",oauth_timestamp="' + oauth_timestamp + '",oauth_nonce="' + oauth_nonce + '",oauth_version="1.0",oauth_signature="' + oauth_signature + '"';
            req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
            req.setHeader('Accept', '*/*');
            req.setHeader('Authorization', auth);
            req.flushHeaders();
            req.write(writeBody);
            req.on('error', (e) => {
                reject(e);
            });
            req.end();
        });
    }

    // return true if post success, false if not success
    public postStatusByToken(accessToken: string, tokenSecret: string, message: string, imageIds?: string[]): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (accessToken === undefined || accessToken === null || accessToken === '') {
                reject('accessToken was required');
                return;
            }

            if (tokenSecret === undefined || tokenSecret === null || tokenSecret === '') {
                reject('accessToken was required');
                return;
            }

            if (message === undefined) {
                message = '';
            }

            let mediaIdString = '';
            if (imageIds !== undefined && imageIds !== null && imageIds.length > 0) {
                for (const mid of imageIds) {
                    mediaIdString += (mid + ',');
                }

                if (mediaIdString !== '') {
                    mediaIdString = mediaIdString.substring(0, mediaIdString.length - 1);
                }
            }

            let mediaIdForUrl = '';
            if (mediaIdString !== '') {
                mediaIdForUrl = '&media_ids=' + encodeURIComponent(mediaIdString);
            }

            const url: string = TwitterService.ROOT_URL + '/1.1/statuses/update.json?status=' + encodeURIComponent(message) + mediaIdForUrl;
            const oauth_timestamp = Math.floor((new Date()).getTime() / 1000).toString();
            const oauth_nonce = OAuthUtil.generateNonce(); // unique token your application should generate for each unique request

            // generate oauth
            const parameters = {
                oauth_consumer_key: twitter_setup.TWITTER_API_KEY,
                oauth_token: accessToken,
                oauth_signature_method: 'HMAC-SHA1',
                oauth_timestamp,
                oauth_nonce,
                oauth_version: '1.0',
                status: message
            };

            if (mediaIdForUrl !== '') {
                parameters['media_ids'] = mediaIdString;
            }

            const options = {};

            let oauth_signature = '';
            try {
                oauth_signature = oauthSignature.default.generate('POST', url, parameters, twitter_setup.TWITER_API_SECRET_KEY, tokenSecret, options);
            } catch (error: any) {
                reject(error.message);
                return;
            }

            const httpOptions: any = {
                method: 'POST',
                json: true
            };

            const req = https.request(url, httpOptions, (res) => {
                const { statusCode, statusMessage } = res;

                if (statusCode !== 200) {
                    reject('statusCode ' + statusCode + ' ' + statusMessage);
                    return;
                }

                let rawData = '';
                res.on('data', (chunk) => { rawData += chunk; });
                res.on('end', () => {
                    try {
                        const parsedData = JSON.parse(rawData);
                        resolve(parsedData);
                    } catch (e: any) {
                        reject(e.message);
                    }
                });
            });
            const auth = 'OAuth oauth_consumer_key="' + twitter_setup.TWITTER_API_KEY + '",oauth_token="' + accessToken + '",oauth_signature_method="HMAC-SHA1",oauth_timestamp="' + oauth_timestamp + '",oauth_nonce="' + oauth_nonce + '",oauth_version="1.0",oauth_signature="' + oauth_signature + '"';
            req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
            req.setHeader('Accept', '*/*');
            req.setHeader('Authorization', auth);
            req.flushHeaders();
            req.on('error', (e) => {
                reject(e);
            });
            req.end();
        });
    }

    // return true if post success, false if not success
    public postStatus(userId: string, message: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (userId === undefined || userId === null || userId === '') {
                reject('userId was required');
                return;
            }

            const authenId = await this.authenIdService.findOne({ user: new ObjectID(userId), providerName: PROVIDER.TWITTER });
            if (authenId === undefined) {
                reject('Twitter register was not found.');
                return;
            }

            if (authenId.properties === undefined || authenId.properties.oauthToken === undefined || authenId.properties.oauthTokenSecret === undefined) {
                reject('Twitter propertites was not found.');
                return;
            }

            if (message === undefined) {
                message = '';
            }

            const accessToken = authenId.properties.oauthToken;
            const tokenSecret = authenId.properties.oauthTokenSecret;
            try {
                const result = await this.postStatusByToken(accessToken, tokenSecret, message);
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }

    public postStatusWithImageByToken(accessToken: string, tokenSecret: string, message: string, imageBase64s?: string[]): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (accessToken === undefined || accessToken === null || accessToken === '') {
                reject('accessToken was required');
                return;
            }

            if (tokenSecret === undefined || tokenSecret === null || tokenSecret === '') {
                reject('tokenSecret was required');
                return;
            }

            if (message === undefined) {
                message = '';
            }

            try {
                const mediaIds: string[] = [];
                if (imageBase64s !== undefined && imageBase64s !== null && imageBase64s.length > 0) {
                    for (const imageBase64 of imageBase64s) {
                        try {
                            const twMediaIdObj = await this.postImageByToken(accessToken, tokenSecret, imageBase64);
                            if (twMediaIdObj === undefined) {
                                continue;
                            }

                            const mediaId = twMediaIdObj.media_id_string;
                            if (mediaId === undefined) {
                                continue;
                            }

                            mediaIds.push(mediaId);
                        } catch (err) {
                            console.log(err);
                        }
                    }
                }

                const result = await this.postStatusByToken(accessToken, tokenSecret, message, mediaIds);
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }

    public postStatusWithImage(userId: string, message: string, imageBase64s?: string[]): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (userId === undefined || userId === null || userId === '') {
                reject('userId was required');
                return;
            }

            const authenId = await this.authenIdService.findOne({ user: new ObjectID(userId), providerName: PROVIDER.TWITTER });
            if (authenId === undefined) {
                reject('Twitter register was not found.');
                return;
            }

            if (authenId.properties === undefined || authenId.properties.oauthToken === undefined || authenId.properties.oauthTokenSecret === undefined) {
                reject('Twitter propertites was not found.');
                return;
            }

            if (message === undefined) {
                message = '';
            }

            const accessToken = authenId.properties.oauthToken;
            const tokenSecret = authenId.properties.oauthTokenSecret;
            try {
                const result = await this.postStatusWithImageByToken(accessToken, tokenSecret, message, imageBase64s);
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }

    public async fetchPostByTwitterUser(twitterUserId: string): Promise<any> {
        const result = {
            postCount: 0,
            enable: false,
            NewPostId:{},
            dataFeedTwi:{}
        };

        if (twitterUserId === undefined || twitterUserId === null || twitterUserId === '') {
            return result;
        }

        // find log
        const socialPostLog = await this.socialPostLogsService.findOne({ providerName: PROVIDER.TWITTER, providerUserId: twitterUserId });
        try {
            let params = undefined;
            if (socialPostLog !== undefined && socialPostLog !== null) {
                if (!socialPostLog.enable) {
                    return result;
                }
                result.enable = socialPostLog.enable;
                params = { since_id: socialPostLog.lastSocialPostId };
            } else {
                // no socialPostLogs so this is enable = false mode;
                return result;
            }

            const twitterResults: any = await this.getTwitterUserTimeLine(twitterUserId);
            result.dataFeedTwi = twitterResults;
            if (twitterResults !== undefined && twitterResults.errors === undefined) {
                const data = (twitterResults.data === undefined) ? [] : twitterResults.data;
                const meta = (twitterResults.meta === undefined) ? {} : twitterResults.meta;
                const newestId = meta.newest_id;

                // create post from twitter
                if (data.length > 0) {
                    // update logs if logs found, if not exist create one.
                    await this.socialPostLogsService.update({ _id: socialPostLog.id }, { $set: { properties: meta, lastSocialPostId: newestId, lastUpdated: moment().toDate() } });
                    result.NewPostId = { _id: socialPostLog.id , properties: meta, lastSocialPostId: newestId, lastUpdated: moment().toDate() };
                    result.postCount = data.length;
                } else {
                    // update last update
                    await this.socialPostLogsService.update({ _id: socialPostLog.id }, { $set: { lastUpdated: moment().toDate() } });
                }
                // end create post
            } else {
                await this.socialPostLogsService.update({ _id: socialPostLog.id }, { $set: { lastUpdated: moment().toDate() } });
            }
        } catch (error) {
            console.log(error);
        }

        return result;
    }

    private getOauth2AppAccessToken(): Promise<any> {
        return new Promise((resolve, reject) => {
            const url: string = TwitterService.ROOT_URL + '/oauth2/token?grant_type=client_credentials';
            const httpOptions: any = {
                method: 'POST',
                json: true
            };

            const req = https.request(url, httpOptions, (res) => {
                const { statusCode, statusMessage } = res;

                if (statusCode !== 200) {
                    reject('statusCode ' + statusCode + ' ' + statusMessage);
                    return;
                }

                let rawData = '';
                res.on('data', (chunk) => { rawData += chunk; });
                res.on('end', () => {
                    try {
                        const parsedData = JSON.parse(rawData);
                        resolve(parsedData);
                    } catch (e: any) {
                        reject(e.message);
                    }
                });
            });

            const base64 = Buffer.from(twitter_setup.TWITTER_API_KEY + ':' + twitter_setup.TWITER_API_SECRET_KEY).toString('base64');
            const auth = 'Basic ' + base64;

            req.setHeader('Content-Type', 'application/json');
            req.setHeader('Accept', '*/*');
            req.setHeader('Authorization', auth);
            req.flushHeaders();
            req.on('error', (e) => {
                reject(e);
            });
            req.end();
        });
    }
}