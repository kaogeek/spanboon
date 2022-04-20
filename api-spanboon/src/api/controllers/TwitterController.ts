/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import { JsonController, Req, Res, Post, QueryParam, Get, Body, Authorized } from 'routing-controllers';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { TwitterService } from '../services/TwitterService';
import { SocialPostLogsService } from '../services/SocialPostLogsService';
import { TwitterVerifyRequest } from './requests/TwitterVerifyRequest';
import { TwitterFetchEnableRequest } from './requests/TwitterFetchEnableRequest';
import { PROVIDER } from '../../constants/LoginProvider';
import { AuthenticationIdService } from '../services/AuthenticationIdService';
import { SocialPostLogs } from '../models/SocialPostLogs';

@JsonController('/twitter')
export class TwitterController {
    constructor(private twitterService: TwitterService, private socialPostLogsService: SocialPostLogsService, private authenService: AuthenticationIdService) { }

    /**
     * @api {post} /api/twitter/request_token Search Config API
     * @apiGroup Twitter
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully request token",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/twitter/request_token
     * @apiErrorExample {json} config error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/request_token')
    public async requestToken(@QueryParam('callback') callbackUrl: string, @Res() res: any): Promise<any> {
        try {
            const result = await this.twitterService.requestToken(callbackUrl);

            return res.status(200).send(result);
        } catch (err) {
            const errorResponse = ResponseUtil.getSuccessResponse('Cannot request token', err);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {get} /api/twitter/access_token Search Config API
     * @apiGroup Twitter
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully get access token",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/twitter/access_token
     * @apiErrorExample {json} config error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/access_token')
    public async accessToken(@QueryParam('oauth_token') oauthToken: string, @QueryParam('oauth_verifier') oauthVerifier: string, @Res() res: any): Promise<any> {
        try {
            const result = await this.twitterService.getAccessToken(oauthToken, oauthVerifier);

            return res.status(200).send(result);
        } catch (err) {
            const errorResponse = ResponseUtil.getSuccessResponse('Cannot get access token', err);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/twitter/account_verify account_verify API
     * @apiGroup Twitter
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully get account_verify",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/twitter/account_verify
     * @apiErrorExample {json} config error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/account_verify')
    public async accountVerify(@Body({ validate: true }) twitterParam: TwitterVerifyRequest, @Res() res: any): Promise<any> {
        try {
            const result = await this.twitterService.verifyCredentials(twitterParam.twitterOauthToken, twitterParam.twitterOauthTokenSecret);

            return res.status(200).send(result);
        } catch (err) {
            const errorResponse = ResponseUtil.getSuccessResponse('Cannot get access token', err);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/twitter/enable_fetch enable_fetch API
     * @apiGroup Twitter
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully get enable_fetch",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/twitter/enable_fetch
     * @apiErrorExample {json} config error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/enable_fetch')
    @Authorized('user')
    public async fetchTwitterEnable(@Body({ validate: true }) twitterParam: TwitterFetchEnableRequest, @Res() res: any, @Req() req: any): Promise<any> {
        try {
            const userId = req.user.id;
            // find authen with twitter
            const twitterAccount = await this.authenService.findOne({ providerName: PROVIDER.TWITTER, user: userId });

            if (twitterAccount === undefined) {
                const errorResponse = ResponseUtil.getSuccessResponse('Twitter account was not binding', undefined);
                return res.status(400).send(errorResponse);
            }

            // find log
            const socialPostLog = await this.socialPostLogsService.findOne({ providerName: PROVIDER.TWITTER, providerUserId: twitterAccount.providerUserId });
            if (socialPostLog !== undefined) {
                // update old
                await this.socialPostLogsService.update({ _id: socialPostLog.id }, { $set: { enable: twitterParam.enable } });
            } else {
                // create new
                const newSocialPostLog = new SocialPostLogs();
                newSocialPostLog.user = userId;
                newSocialPostLog.lastSocialPostId = undefined;
                newSocialPostLog.providerName = PROVIDER.TWITTER;
                newSocialPostLog.providerUserId = twitterAccount.providerUserId;
                newSocialPostLog.properties = undefined;
                newSocialPostLog.enable = twitterParam.enable;
                newSocialPostLog.lastUpdated = undefined;

                await this.socialPostLogsService.create(newSocialPostLog);
            }

            return res.status(200).send(twitterParam);
        } catch (err) {
            const errorResponse = ResponseUtil.getSuccessResponse('Cannot request token', err);
            return res.status(400).send(errorResponse);
        }
    }
}
