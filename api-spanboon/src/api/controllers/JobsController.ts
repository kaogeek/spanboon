/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import { JsonController, Res, Post, QueryParam } from 'routing-controllers';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { PageSocialAccountService } from '../services/PageSocialAccountService';
import { ConfigService } from '../services/ConfigService';
import { JOB_BEFORE_TOKEN_EXPIRE_MINUTE, DEFAULT_JOB_BEFORE_TOKEN_EXPIRE_MINUTE } from '../../constants/SystemConfig';
import { PROVIDER } from '../../constants/LoginProvider';
import moment from 'moment';

@JsonController('/jobs')
export class JobsController {

    constructor(private pageSocialAccountService: PageSocialAccountService, private configService: ConfigService) { }

    /**
     * @api {post} /api/jobs/extended_token Extended page token API
     * @apiGroup Jobs
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
    @Post('/extended_token')
    public async requestToken(@Res() res: any): Promise<any> {
        try {
            let beforeExp = await this.getTokenBeforeExpiredDays();
            if (beforeExp === undefined) {
                beforeExp = DEFAULT_JOB_BEFORE_TOKEN_EXPIRE_MINUTE;
            }

            const beforeExpDate = moment().add(beforeExp, 'minutes').toDate();
            // search FB pageSpcialAccount 
            const expiredPageList = await this.pageSocialAccountService.find({
                providerName: PROVIDER.FACEBOOK,
                'properties.expires': {
                    $lt: beforeExpDate
                }
            });

            const extendedPageIDs = [];
            for (const account of expiredPageList) {
                try {
                    const pageId = account.page + '';
                    if (extendedPageIDs.indexOf(pageId) >= 0) {
                        continue;
                    }

                    const extendedAcc = await this.pageSocialAccountService.extendsPageSocialAccount(pageId, true, false);
                    if (extendedAcc !== undefined) {
                        extendedPageIDs.push(pageId);
                    }
                } catch (error) {
                    console.log(error);
                }
            }

            return res.status(200).send(extendedPageIDs);
        } catch (err) {
            const errorResponse = ResponseUtil.getSuccessResponse('Cannot request token', err);
            return res.status(400).send(errorResponse);
        }
    }

    private async getTokenBeforeExpiredDays(): Promise<number> {
        const result = DEFAULT_JOB_BEFORE_TOKEN_EXPIRE_MINUTE;

        const config = await this.configService.getConfig(JOB_BEFORE_TOKEN_EXPIRE_MINUTE);
        if (config !== undefined && typeof config.value === 'number') {
            return config.value;
        }

        return result;
    }
}
