/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { JsonController, Res, Post, Body } from 'routing-controllers';
import { AdminUserActionLogsService } from '../../services/AdminUserActionLogsService';
import { ResponseUtil } from '../../../utils/ResponseUtil';
import { SearchFilter } from '../requests/SearchFilterRequest';

@JsonController('/admin/log')
export class AdminUserActionLogsController {
    constructor(private actionLogService: AdminUserActionLogsService) { }

    /**
     * @api {post} /api/admin/log Create Search History API
     * @apiGroup Admin Log
     * @apiParam (Request body) {number} limit limit
     * @apiParam (Request body) {number} offset offset
     * @apiParam (Request body) {String} select select
     * @apiParam (Request body) {String} relation relation
     * @apiParam (Request body) {String} whereConditions whereConditions
     * @apiParam (Request body) {boolean} count count (0=false, 1=true)
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Search Admin Log Success",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/admin/log
     * @apiErrorExample {json} Search Admin Log Failed
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/')
    public async searchHistory(@Body({ validate: true }) filter: SearchFilter, @Res() res: any): Promise<any> {
        const historyLists: any = await this.actionLogService.search(filter);

        if (historyLists) {
            const successResponse = ResponseUtil.getSuccessResponse('Search History Success', historyLists);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Search History Failed', undefined);
            return res.status(400).send(errorResponse);
        }
    }
}
