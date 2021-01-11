/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Post, Body, Req, Authorized, Param } from 'routing-controllers';
import { ResponseUtil } from '../../../utils/ResponseUtil';
import { PageService } from '../../services/PageService';
import moment from 'moment';
import { Page } from '../../models/Page';
import { ObjectID } from 'mongodb';
import { BanRequest } from './requests/BanRequest';
import { AdminUserActionLogsService } from '../../services/AdminUserActionLogsService';
import { AdminUserActionLogs } from '../../models/AdminUserActionLogs';
import { LOG_TYPE, PAGE_LOG_ACTION } from '../../../constants/LogsAction';

@JsonController('/admin/page')
export class AdminPageController {
    constructor(private pageService: PageService, private actionLogService: AdminUserActionLogsService) { }

    /**
     * @api {post} /api/admin/page/:id/approve Approve Page API
     * @apiGroup Admin Page API
     * @apiParamExample {json} Input
     * {
     *      "id" : ""
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Approve Official Page Success",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin/page/:id/approve
     * @apiErrorExample {json} Approve Official Page Failed
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:id/approve')
    @Authorized()
    public async approvePage(@Param('id') pageId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const pageObjId = new ObjectID(pageId);
        const username = req.user.username;
        const data = await this.pageService.findOne({ where: { _id: pageObjId, isOfficial: false } });

        if (!data) {
            const errorResponse = ResponseUtil.getErrorResponse('This Page is Official', data);
            return res.status(400).send(errorResponse);
        }

        const query = { _id: pageObjId };
        const newValue = { $set: { isOfficial: true, updateDate: moment().toDate(), updateByUsername: username } };
        const result = await this.pageService.update(query, newValue);

        if (result) {
            const pageUpdated: Page = await this.pageService.findOne({ where: { _id: pageObjId } });
            const userObjId = new ObjectID(req.user.id);

            const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
            const adminLogs = new AdminUserActionLogs();
            adminLogs.userId = userObjId;
            adminLogs.contentId = pageObjId;
            adminLogs.action = PAGE_LOG_ACTION.APPROVE;
            adminLogs.contentType = LOG_TYPE.PAGE;
            adminLogs.ip = ipAddress;
            adminLogs.data = pageUpdated;
            await this.actionLogService.create(adminLogs);

            const successResponse = ResponseUtil.getSuccessResponse('Approve Official Page Success', pageUpdated);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Approve Official Page Failed', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/admin/page/:id/unapprove UnApprove Page API
     * @apiGroup Admin Page API
     * @apiParamExample {json} Input
     * {
     *      "id" : ""
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "UnApprove Official Page Success",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin/page/:id/unapprove
     * @apiErrorExample {json} UnApprove Official Page Failed
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:id/unapprove')
    @Authorized()
    public async unApprovePage(@Param('id') pageId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const pageObjId = new ObjectID(pageId);
        const username = req.user.username;
        const data = await this.pageService.findOne({ where: { _id: pageObjId, isOfficial: true } });

        if (!data) {
            const errorResponse = ResponseUtil.getErrorResponse('This Page is Official', data);
            return res.status(400).send(errorResponse);
        }

        const query = { _id: pageObjId };
        const newValue = { $set: { isOfficial: false, updateDate: moment().toDate(), updateByUsername: username } };
        const result = await this.pageService.update(query, newValue);

        if (result) {
            const pageUpdated: Page = await this.pageService.findOne({ where: { _id: pageObjId } });
            const userObjId = new ObjectID(req.user.id);

            const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
            const adminLogs = new AdminUserActionLogs();
            adminLogs.userId = userObjId;
            adminLogs.contentId = pageObjId;
            adminLogs.action = PAGE_LOG_ACTION.UNAPPROVE;
            adminLogs.contentType = LOG_TYPE.PAGE;
            adminLogs.ip = ipAddress;
            adminLogs.data = pageUpdated;
            await this.actionLogService.create(adminLogs);

            const successResponse = ResponseUtil.getSuccessResponse('UnApprove Official Page Success', pageUpdated);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('UnApprove Official Page Failed', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/admin/page/:id/ban Ban Page API
     * @apiGroup Admin Page API
     * @apiParamExample {json} Input
     * {
     *      "id" : ""
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Ban Page Success",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin/page/:id/ban
     * @apiErrorExample {json} Ban Page Failed
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:id/ban')
    @Authorized()
    public async banPage(@Body({ validate: true }) ban: BanRequest, @Param('id') pageId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const pageObjId = new ObjectID(pageId);
        const username = req.user.username;
        const pageBanned = ban.banned;
        const pageQuery = { where: { _id: pageObjId } };
        const data: Page = await this.pageService.findOne(pageQuery);

        if (!data) {
            const errorResponse = ResponseUtil.getErrorResponse('Page Not Found', data);
            return res.status(400).send(errorResponse);
        }

        if (data.banned === pageBanned) {
            if (pageBanned) {
                const errorResponse = ResponseUtil.getErrorResponse('This Page Already Banned', undefined);
                return res.status(400).send(errorResponse);
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('This Page Already Unbanned', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const query = { _id: pageObjId };
            const newValue = { $set: { banned: pageBanned, updateDate: moment().toDate(), updateByUsername: username } };
            const result = await this.pageService.update(query, newValue);

            if (result) {
                const pageResult: Page = await this.pageService.findOne(pageQuery);
                const userObjId = new ObjectID(req.user.id);

                const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
                const adminLogs = new AdminUserActionLogs();
                adminLogs.userId = userObjId;
                adminLogs.contentId = pageObjId;
                adminLogs.action = pageResult.banned ? PAGE_LOG_ACTION.BAN : PAGE_LOG_ACTION.UNBAN;
                adminLogs.contentType = LOG_TYPE.PAGE;
                adminLogs.ip = ipAddress;
                adminLogs.data = pageResult;
                await this.actionLogService.create(adminLogs);

                const successResponse = ResponseUtil.getSuccessResponse('Ban/Unban Page Success', pageResult);
                return res.status(200).send(successResponse);
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Ban/Unban Page Failed', undefined);
                return res.status(400).send(errorResponse);
            }
        }
    }
} 
