/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import { JsonController, Res, Post, QueryParam, Get, Body } from 'routing-controllers';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { TwitterService } from '../services/TwitterService';
import { TwitterVerifyRequest } from './requests/TwitterVerifyRequest';

@JsonController('/twitter')
export class TwitterController {
    constructor(private twitterService: TwitterService) { }

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
}
