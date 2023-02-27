/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Post, Body, Req, Delete, Authorized, Param, Put, Get } from 'routing-controllers';
import { ResponseUtil } from '../../../utils/ResponseUtil';
import { PageService } from '../../services/PageService';
import moment from 'moment';
import { Page } from '../../models/Page';
import { ObjectID } from 'mongodb';
import { BanRequest } from './requests/BanRequest';
import { AdminUserActionLogsService } from '../../services/AdminUserActionLogsService';
import { AdminUserActionLogs } from '../../models/AdminUserActionLogs';
import { LOG_TYPE, PAGE_LOG_ACTION } from '../../../constants/LogsAction';
import { DeletePageService } from '../../services/DeletePageService';
import { PostsService } from '../../services/PostsService';
import { KaokaiToday } from '../../models/KaokaiToday';
import { KaokaiTodayService } from '../../services/KaokaiTodayService';
import { CreateKaokaiTodayRequest } from '../requests/CreateKaokaiTodayRequest';
import { PageObjectiveService } from '../../services/PageObjectiveService';
@JsonController('/admin/page')
export class AdminPageController {
    constructor(private pageService: PageService, private actionLogService: AdminUserActionLogsService, private deletePageService: DeletePageService,
        private kaokaiTodayService: KaokaiTodayService,
        private pageObjectiveService: PageObjectiveService,
        private postsService: PostsService) { }

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

    @Post('/request/title')
    public async getTitle(@Res() res: any, @Req() req: any): Promise<any> {
        const title = req.body.title;
        if (title) {
            // one-hot encoding 
            const requestTitle = title;
            if (requestTitle === 'ก้าวไกลวันนี้') {
                for(const roundRobin of req.body.buckets){
                    if(roundRobin.name === 'คณะกรรมการบริหารพรรค'){
                        const page_1 = await this.pageService.find({isOfficial:true,roundRobin:'คณะกรรมการบริหารพรรค'});
                        const successResponse = ResponseUtil.getSuccessResponse('Successfully Bucket KaokaiToday', page_1);
                        return res.status(200).send(successResponse);
                    }else if(roundRobin.name === 'รองหัวหน้าพรรคก้าวไกล'){
                        const page_2 = await this.pageService.find({isOfficial:true,roundRobin:'รองหัวหน้าพรรคก้าวไกล'});
                        const successResponse = ResponseUtil.getSuccessResponse('Successfully Bucket KaokaiToday', page_2);
                        return res.status(200).send(successResponse);
                    }else if(roundRobin.name === 'รองเลขาธิการพรรคก้าวไกล'){
                        const page_3 = await this.pageService.find({isOfficial:true,roundRobin:'รองเลขาธิการพรรคก้าวไกล'});
                        const successResponse = ResponseUtil.getSuccessResponse('Successfully Bucket KaokaiToday', page_3);
                        return res.status(200).send(successResponse);
                    }else if(roundRobin.name === 'กองโฆษกพรรคก้าวไกล'){
                        const page_4 = await this.pageService.find({isOfficial:true,roundRobin:'กองโฆษกพรรคก้าวไกล'});
                        const successResponse = ResponseUtil.getSuccessResponse('Successfully Bucket KaokaiToday', page_4);
                        return res.status(200).send(successResponse);
                    }else if(roundRobin.name === 'ผู้สมัครของพรรคก้าวไกล'){
                        const page_5 = await this.pageService.find({isOfficial:true,roundRobin:'ผู้สมัครของพรรคก้าวไกล'});
                        const successResponse = ResponseUtil.getSuccessResponse('Successfully Bucket KaokaiToday', page_5);
                        return res.status(200).send(successResponse);
                    }
                }
            } else if (requestTitle === 'สภาก้าวไกล') {
                // #HashTag
                // db.Page.aggregate([{
                // $match:{'isOfficial':true}},
                // {'$lookup':
                //  {from:'Posts',
                // 'let':{'id':'$_id'},
                // 'pipeline':[{'$match':{'$expr':{'$eq':['$$id','$pageId']}}},{$limit:1}],as:'Posts'}
                // }
                // ])
                const pageObjStmt = [
                    { // sample post for one
                        $lookup: {
                            from: 'Posts',
                            let: { 'id': '$_id' },
                            pipeline: [
                                { $match: { $expr: { $eq: ['$$id', '$objective'] } } },
                                { $limit: 1 }
                            ],
                            as: 'samplePost'
                        }
                    },
                    {
                        $match: {
                            'samplePost.0': { $exists: true }
                        }
                    },
                    /*
                    {
                        $lookup: {
                            from: 'Page',
                            localField: 'pageId',
                            foreignField: '_id',
                            as: 'page'
                        }
                    }, */
                    {
                        $lookup: {
                            from: 'Page',
                            let: { 'id': '$_id' },
                            pipeline: [{
                                $match: { $expr: { $eq: ['$$', '$pageId'] } }
                            }],
                            as: 'page'
                        }
                    },
                    {
                        $lookup: {
                            from: 'HashTag',
                            localField: 'hashTag',
                            foreignField: '_id',
                            as: 'hashTagObj'
                        }
                    }
                ];
                /* 
                if (searchOfficialOnly) {
                    pageObjStmt.splice(7, 0, { $match: { 'page.isOfficial': true, 'page.banned': false } });
                } */

                const searchResult = await this.pageObjectiveService.aggregate(pageObjStmt);
                const successResponse = ResponseUtil.getSuccessResponse('Successfully Bucket KaokaiToday', searchResult);
                return res.status(200).send(successResponse);
            } else if (requestTitle === 'ก้าวไกลทั่วไทย') {
                // #จังหวัด province
            } else if (requestTitle === 'ก้าวไกลรอบด้าน') {
                // #บริบทเพจ ประเด็น

            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Please select the title.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Get('/receive/bucket')
    @Authorized()
    public async receiveBucket(@Res() res: any, @Req() req: any): Promise<any> {
        const bucketAll = await this.kaokaiTodayService.find();
        if (bucketAll.length > 0) {
            const successResponse = ResponseUtil.getSuccessResponse('Here this is your bucket boi.', bucketAll);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find KaokaiToday Bucket', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Post('/processor')
    public async createKaokaiToday(@Body({ validate: true }) createKaokaiTodayRequest: CreateKaokaiTodayRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const titleRequest = createKaokaiTodayRequest.title;

        if (titleRequest) {
            const createKaokaiToday = new KaokaiToday();
            createKaokaiToday.title = titleRequest;
            createKaokaiToday.type = createKaokaiTodayRequest.type;
            createKaokaiToday.field = createKaokaiTodayRequest.field;
            createKaokaiToday.flag = createKaokaiTodayRequest.flag;
            createKaokaiToday.buckets = createKaokaiTodayRequest.buckets;

            const CKaokaiToday = await this.kaokaiTodayService.create(createKaokaiToday);
            if (CKaokaiToday) {
                const successResponse = ResponseUtil.getSuccessResponse('Create KaokaiToday is successfully.', createKaokaiToday);
                return res.status(200).send(successResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot create KaokaiToday, We request the title.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Put('/:id/processor')
    public async updateKaokaiToday(@Body({ validate: true }) createKaokaiTodayRequest: CreateKaokaiTodayRequest, @Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const objId = new ObjectID(id);
        const kaoKaiToday = await this.kaokaiTodayService.findOne({ _id: objId });
        if (kaoKaiToday) {
            for (const [i, updateKaokaiToday] of createKaokaiTodayRequest.buckets.Entity()) {
                if (updateKaokaiToday.name !== undefined && updateKaokaiToday.values !== null) {
                    const query = { _id: objId };
                    const newValues = {
                        $set: {
                            title: createKaokaiTodayRequest.title,
                            [`buckets.${i}.name`]: `${updateKaokaiToday.name}`,
                            'buckets.0.values': [updateKaokaiToday.values]
                        }
                    };
                    await this.kaokaiTodayService.updateToken(query, newValues);
                } else {
                    continue;
                }
            }

            const successResponse = ResponseUtil.getSuccessResponse('Update KaokaiToday is successfully.', undefined);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find object ID.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Delete('/:id/processor')
    public async deleteKaokaiToday(@Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const objId = new ObjectID(id);
        const kaoKaiToday = await this.kaokaiTodayService.findOne({ _id: objId });
        if (kaoKaiToday) {
            const deleteKaokai = await this.kaokaiTodayService.delete({ _id: objId });
            if (deleteKaokai) {
                const successResponse = ResponseUtil.getSuccessResponse('Delete KaokaiToday is successfully.', undefined);
                return res.status(200).send(successResponse);
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Cannot delete kaokaiToday please check it is correct id.', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find object ID.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Delete('/:id/delete/page')
    @Authorized()
    public async deletePageAd(@Param('id') pageId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const pageObjId = new ObjectID(pageId);
        const findPage = await this.pageService.findOne({ _id: ObjectID(pageObjId) });
        if (findPage !== undefined) {
            await this.deletePageService.deletePage(pageObjId);
            return res.status(200).send(ResponseUtil.getSuccessResponse('Delete page is successfully.', true));
        } else {
            const errorResponse: any = { status: 0, message: 'Sorry cannnot delete page.' };
            return res.status(400).send(errorResponse);
        }
    }

    @Put('/:id/roundrobin')
    @Authorized()
    public async editPageRoundRobin(@Param('id') pageId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const pageObjId = new ObjectID(pageId);
        const body = req.body;

        if (body.roundRobin < 0) {
            const errorResponse: any = { status: 0, message: 'RoundRobin must greater than 0 ' };
            return res.status(400).send(errorResponse);
        }
        if (body.roundRobin > 3) {
            const errorResponse: any = { status: 0, message: 'RoundRobin must less than 3 ' };
            return res.status(400).send(errorResponse);
        }
        if (pageObjId === undefined && pageObjId === null) {
            const errorResponse: any = { status: 0, message: 'Page was not found.' };
            return res.status(400).send(errorResponse);
        }
        if (body !== undefined) {
            const query = { _id: pageObjId };
            const newValues = { $set: { roundRobin: body.roundRobin } };
            const update = await this.pageService.update(query, newValues);
            if (update) {
                return res.status(200).send(ResponseUtil.getSuccessResponse('Delete page is successfully.', true));
            } else {
                const errorResponse: any = { status: 0, message: 'Cannot update.' };
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse: any = { status: 0, message: 'Sorry cannnot delete page.' };
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
            const hiddenPageId = { pageId: pageObjId };
            const hiddenPost = { $set: { hidden: true } };
            await this.postsService.updateMany(hiddenPageId, hiddenPost);
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
