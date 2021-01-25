/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */
import * as https from 'https';
import * as oauthSignature from 'oauth-signature';
import { Service } from 'typedi';
import { twitter_setup } from '../../env';
import { AuthenticationIdService } from './AuthenticationIdService';
import { UserService } from './UserService';
import { ObjectID } from 'mongodb';
import { PROVIDER } from '../../constants/LoginProvider';
import { AuthenticationId } from '../models/AuthenticationId';
import { User } from '../models/User';
import { OAuthUtil } from '../../utils/OAuthUtil';

@Service()
export class TwitterService {

    public static readonly ROOT_URL: string = 'https://api.twitter.com';

    constructor(private authenIdService: AuthenticationIdService, private userService: UserService) { }

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
            } catch (error) {
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
                    } catch (e) {
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
        return await this.userService.findOne({ _id: authenId.user });
    }

    // return true if post success, false if not success
    public postStatusByToken(accessToken: string, tokenSecret: string, message: string): Promise<any> {
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

            const url: string = TwitterService.ROOT_URL + '/1.1/statuses/update.json?status=' + encodeURIComponent(message);

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
                status: encodeURIComponent(message)
            };
            const options = {};

            let oauth_signature = '';
            try {
                oauth_signature = oauthSignature.default.generate('POST', url, parameters, twitter_setup.TWITER_API_SECRET_KEY, tokenSecret, options);
            } catch (error) {
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
                    } catch (e) {
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
}