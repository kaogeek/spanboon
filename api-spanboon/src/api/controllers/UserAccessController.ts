/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Get, Req, Authorized, QueryParam } from 'routing-controllers';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { PageService } from '../services/PageService';
import { ObjectID } from 'mongodb';
import { SearchFilter } from './requests/SearchFilterRequest';
import { PageAccessLevelResponse } from './responses/PageAccessLevelResponse';
import { UserService } from '../services/UserService';
import { PageAccessLevelService } from '../services/PageAccessLevelService';
import { User } from '../models/User';
import { Page } from '../models/Page';

@JsonController('/useraccess')
export class UserAccessController {

    constructor(
        private pageService: PageService,
        private userService: UserService,
        private pageAccessLevelService: PageAccessLevelService
    ) { }

    // Get User Page Access API
    /**
     * @api {get} /api/useraccess/page/ Get User Page Access API
     * @apiGroup UserAccess
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get User Page Access"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/useraccess/page
     * @apiErrorExample {json} Page error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/page')
    @Authorized('user')
    public async getPageAccess(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @Req() req: any, @Res() res: any): Promise<any> {
        const result: PageAccessLevelResponse[] = [];
        const userObjId = req.user.id;

        const accSearchFilter = new SearchFilter();
        accSearchFilter.whereConditions = { user: new ObjectID(userObjId) };
        accSearchFilter.limit = limit;
        accSearchFilter.offset = offset;
        const pageAccessResult: any[] = await this.pageAccessLevelService.search(accSearchFilter);

        for (const pg of pageAccessResult) {
            const userAccLV: PageAccessLevelResponse = new PageAccessLevelResponse();

            const pgObjId = new ObjectID(pg.page);
            const pageStmt = { where: { _id: pgObjId } };
            const page: Page = await this.pageService.findOne(pageStmt);
            if (page !== undefined) {
                userAccLV.page = {
                    id: page.id,
                    name: page.name,
                    pageUsername: page.pageUsername,
                    imageURL: page.imageURL,
                    isOfficial: page.isOfficial
                };
            }

            const pguserObjId = new ObjectID(pg.user);
            const userStmt = { where: { _id: pguserObjId } };
            const pguser: User = await this.userService.findOne(userStmt);

            if (pguser !== undefined) {
                userAccLV.user = {
                    id: pg.user,
                    displayName: pguser.displayName,
                    imageURL: pguser.imageURL
                };
                userAccLV.level = pg.level;
            }

            result.push(userAccLV);
        }

        const successResponse = ResponseUtil.getSuccessResponse('Successfully get User Page Access', result);
        return res.status(200).send(successResponse);
    }
}