/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import { JsonController, Res, Post, QueryParam } from 'routing-controllers';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { TwitterService } from '../services/TwitterService';

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
}
