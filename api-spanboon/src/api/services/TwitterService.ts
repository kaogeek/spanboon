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

    public async verifyUserCredentials(userId: string): Promise<string> {
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

    public verifyCredentials(accessToken: string, tokenSecret: string): Promise<string> {

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
                oauth_token: twitter_setup.TWITER_API_SECRET_KEY,
                oauth_signature_method: 'HMAC-SHA1',
                oauth_timestamp,
                oauth_nonce,
                oauth_version: '1.0'
            };
            const options = {};

            let oauth_signature = '';
            try {
                oauth_signature = oauthSignature.default.generate('GET', url, parameters, accessToken, tokenSecret, options);
            } catch (error) {
                reject(error.message);
                return;
            }

            const httpOptions: any = {
                method: 'GET',
                json: true
            };

            // headers: {
            //     'Authorization': 'OAuth oauth_consumer_key="' + twitter_setup.TWITTER_API_KEY + '",oauth_token="' + twitter_setup.TWITER_API_SECRET_KEY + '",oauth_signature_method="HMAC-SHA1",oauth_timestamp="' + oauth_timestamp + '",oauth_nonce="' + oauth_nonce + '",oauth_version="1.0",oauth_signature="' + oauth_signature + '"'
            // },

            // auth: {
            //     oauth_consumer_key: twitter_setup.TWITTER_API_KEY,
            //     oauth_token: twitter_setup.TWITER_API_SECRET_KEY,
            //     oauth_signature_method: 'HMAC-SHA1',
            //     oauth_timestamp,
            //     oauth_nonce,
            //     oauth_version: '1.0',
            //     oauth_signature
            // }

            console.log('https://cors-anywhere.herokuapp.com/' + url);

            const req = https.request('https://cors-anywhere.herokuapp.com/' + url, httpOptions, (res) => {
                console.log('---> 5.1');
                const { statusCode, statusMessage } = res;
                console.log('---> 5.2');

                if (statusCode !== 200) {
                    reject('statusCode ' + statusCode + ' ' + statusMessage);
                    return;
                }

                console.log('---> 5.3');

                let rawData = '';
                res.on('data', (chunk) => { rawData += chunk; });
                res.on('end', () => {
                    try {
                        // const parsedData = JSON.parse(rawData);
                        console.log('rawData', rawData);
                        resolve(rawData);
                    } catch (e) {
                        console.log('errorrrrrr', e);
                        reject(e.message);
                    }
                });
            });
            const auth = 'OAuth oauth_consumer_key="' + twitter_setup.TWITTER_API_KEY + '",oauth_token="' + twitter_setup.TWITER_API_SECRET_KEY + '",oauth_signature_method="HMAC-SHA1",oauth_timestamp="' + oauth_timestamp + '",oauth_nonce="' + oauth_nonce + '",oauth_version="1.0",oauth_signature="' + oauth_signature + '"';
            console.log('req h1: ', req.getHeaderNames());
            req.setHeader('Content-Type', 'application/json');
            req.setHeader('Accept', '*/*');
            // req.setHeader('Origin', []);
            // req.setHeader('X-Requested-With', []);
            // req.setHeader('Access-Control-Allow-Headers', '*');
            // req.setHeader('Access-Control-Request-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            // req.setHeader('Authorization', ['OAuth oauth_consumer_key='+twitter_setup.TWITTER_API_KEY, 'oauth_token='+twitter_setup.TWITER_API_SECRET_KEY, 'oauth_signature_method=HMAC-SHA1', 'oauth_timestamp='+oauth_timestamp, 'oauth_nonce='+oauth_nonce, 'oauth_version=1.0', 'oauth_signature='+oauth_signature]);
            req.setHeader('Authorization', auth);
            console.log('req h2: ', req.getHeaderNames());
            console.log('req h3: ', req.getHeader('Authorization'));
            req.flushHeaders();
            req.on('error', (e) => {
                console.log('errorrrrrr2', e);
                reject(e);
            });
            req.end();

            // http.request(options, (res) => {
            //     console.log(`VERRIFY TW:`, res);
            // }).on('error', (err) => {
            //     // Handle error
            //     console.log('err: ' + err);
            // }).end();
        });
    }

    public getTwitterUserFromToken(accessToken: string, tokenSecret: string): Promise<User> {
        return new Promise((resolve, reject) => {
            if (accessToken === undefined || accessToken === null || accessToken === '') {
                return undefined;
            }

            if (tokenSecret === undefined || tokenSecret === null || tokenSecret === '') {
                return undefined;
            }

            const url = 'https://api.twitter.com/1.1/account/verify_credentials.json';

            const options: any = {
                headers: []
            };

            https.get('https://cors-anywhere.herokuapp.com/' + url, options, (res) => {
                console.error('res', res);
            }).on('error', (e) => {
                console.error(`Got error: ${e.message}`);
            });

            // http.request(options, (res) => {
            //     console.log(`VERRIFY TW:`, res);
            // }).on('error', (err) => {
            //     // Handle error
            //     console.log('err: ' + err);
            // }).end();

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
    public async postStatus(userId: string, message: string): Promise<boolean> {
        return false;
    }
}