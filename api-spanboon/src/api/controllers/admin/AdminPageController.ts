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
import { PostsService } from '../../services/PostsService';
import { KaokaiToday } from '../../models/KaokaiToday';
import { SearchFilter } from '../requests/SearchFilterRequest';
import { KaokaiTodayService } from '../../services/KaokaiTodayService';
import { CreateKaokaiTodayRequest } from '../requests/CreateKaokaiTodayRequest';
import { PageObjectiveService } from '../../services/PageObjectiveService';
import { PageGroupRequest } from '../requests/PageGroupRequest';
import { PageGroup } from '../../models/PageGroup';
import { PageGroupService } from '../../services/PageGroupService';
import { SearchRequest } from '../requests/SearchRequest';
import { SEARCH_TYPE } from '../../../constants/SearchType';
import { EmergencyEventService } from '../../services/EmergencyEventService';
import { HashTagService } from '../../services/HashTagService';
import { KaokaiTodaySnapShotService } from '../../services/KaokaiTodaySnapShot';
import { NotificationNewsService } from '../../services/NotificationNewsService';
import { ManipulatePostService } from '../../services/ManipulatePostService';
@JsonController('/admin/page')
export class AdminPageController {
    constructor(
        private pageService: PageService,
        private actionLogService: AdminUserActionLogsService,
        private kaokaiTodayService: KaokaiTodayService,
        private pageObjectiveService: PageObjectiveService,
        private emergencyEventService: EmergencyEventService,
        private hashTagService: HashTagService,
        private postsService: PostsService,
        private pageGroupService: PageGroupService,
        private kaokaiTodaySnapShotService: KaokaiTodaySnapShotService,
        private notificationNewsService: NotificationNewsService,
        private manipulatePostService: ManipulatePostService
    ) { }

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

    @Post('/edit/search')
    public async searchGet(@Body({ validate: true }) data: SearchRequest, @Res() res: any, @Req() req: any): Promise<any> {
        if (data.type === 'page' && data.field === 'id') {
            const bucketSAll = [];
            const chuckSize = [];
            const bucket = [];
            // roundRobin.buckets[0] !== undefined 
            if (data.buckets.length >= 0) {
                for (const IdAll of data.buckets) {
                    bucketSAll.push(IdAll.values);
                }
            }

            const groups = [];
            if (bucketSAll.length > 0) {
                for (let i = 0; i < bucketSAll.length; i++) {
                    chuckSize.push(bucketSAll[i].length);
                }
                const flatten = bucketSAll.flat().map(id => new ObjectID(id));
                let startIndex = 0;
                for (let j = 0; j < chuckSize.length; j++) {
                    const endIndex = startIndex + chuckSize[j];
                    groups.push(flatten.slice(startIndex, endIndex));
                    startIndex = endIndex;
                }
            }
            if (groups.length > 0) {
                for (const group of groups) {
                    const pageF = await this.pageService.aggregate([{ $match: { _id: { $in: group } } }]);
                    bucket.push(pageF);
                }
            }
            const successResponseGroup = ResponseUtil.getSuccessResponse('Search Page Group Success.', bucket);
            return res.status(200).send(successResponseGroup);

        } if (data.type === 'post' && data.field === 'objective') {
            const bucketSAll = [];
            const chuckSize = [];
            const bucket = [];
            // roundRobin.buckets[0] !== undefined 
            if (data.buckets.length >= 0) {
                for (const IdAll of data.buckets) {
                    bucketSAll.push(IdAll.values);
                }
            }
            const groups = [];
            if (bucketSAll.length > 0) {
                for (let i = 0; i < bucketSAll.length; i++) {
                    chuckSize.push(bucketSAll[i].length);
                }
                const flatten = bucketSAll.flat().map(id => new ObjectID(id));
                let startIndex = 0;
                for (let j = 0; j < chuckSize.length; j++) {
                    const endIndex = startIndex + chuckSize[j];
                    groups.push(flatten.slice(startIndex, endIndex));
                    startIndex = endIndex;
                }
            }
            if (groups.length > 0) {
                for (const group of groups) {
                    const pageF = await this.pageObjectiveService.aggregate([{ $match: { _id: { $in: group } } }]);
                    bucket.push(pageF);
                }
            }
            const successResponseGroup = ResponseUtil.getSuccessResponse('Search Page Group Success.', bucket);
            return res.status(200).send(successResponseGroup);
        } if (data.type === 'post' && data.field === 'emergencyEvent') {
            const bucketSAll = [];
            const chuckSize = [];
            const bucket = [];
            // roundRobin.buckets[0] !== undefined 
            if (data.buckets.length >= 0) {
                for (const IdAll of data.buckets) {
                    bucketSAll.push(IdAll.values);
                }
            }
            const groups = [];
            if (bucketSAll.length > 0) {
                for (let i = 0; i < bucketSAll.length; i++) {
                    chuckSize.push(bucketSAll[i].length);
                }
                const flatten = bucketSAll.flat().map(id => new ObjectID(id));
                let startIndex = 0;
                for (let j = 0; j < chuckSize.length; j++) {
                    const endIndex = startIndex + chuckSize[j];
                    groups.push(flatten.slice(startIndex, endIndex));
                    startIndex = endIndex;
                }
            }
            if (groups.length > 0) {
                for (const group of groups) {
                    const pageF = await this.emergencyEventService.aggregate([{ $match: { _id: { $in: group } } }]);
                    bucket.push(pageF);
                }
            }
            const successResponseGroup = ResponseUtil.getSuccessResponse('Search Page Group Success.', bucket);
            return res.status(200).send(successResponseGroup);
        }
    }
    @Post('/request/search')
    @Authorized()
    public async searchAll(@Body({ validate: true }) data: SearchRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const search: any = {};
        const keywords = data.keyword;
        const exp = { $regex: '.*' + keywords + '.*', $options: 'si' };
        const limit = 10;
        const searchResults = [];
        const bucketF = [];
        if (data.type === '' && data.field === '') {
            const errorResponse = ResponseUtil.getErrorResponse('Please Select Type and Field..', undefined);
            return res.status(400).send(errorResponse);
        }
        if (data.type === 'page' && data.field === 'id') {
            const filterIds = [];
            const objIds = [];
            if (data.values.length > 0) {
                for (let i = 0; i < data.values.length; i++) {
                    filterIds.push(data.values[i].values);
                }
            }
            if (filterIds.length > 0) {
                const flatten = filterIds.flat();
                if (flatten.length > 0) {
                    for (let j = 0; j < flatten.length; j++) {
                        if (flatten[j].id !== '' && flatten[j].id !== undefined && flatten[j].id !== null) {
                            objIds.push(new ObjectID(flatten[j].id));
                        } else {
                            continue;
                        }
                    }
                }
            }
            let pageQuery = undefined;
            if (objIds.length > 0) {
                pageQuery = [
                    { $match: { isOfficial: true, banned: false, name: exp, _id: { $nin: objIds } } },
                    { $limit: 10 }
                ];
            } else {
                pageQuery = [
                    { $match: { isOfficial: true, banned: false, name: exp } },
                    { $limit: 10 }
                ];
            }
            const pages: any[] = await this.pageService.aggregate(pageQuery);
            let pageId = undefined;
            let pageName = undefined;
            for (const page of pages) {
                pageId = page._id;
                pageName = page.name;
                searchResults.push({ value: pageId, label: pageName, type: SEARCH_TYPE.PAGE });
            }
        } else if (data.type === 'page' && data.field === 'group') {
            const pages: any[] = await this.pageGroupService.find({});
            const successResponseGroup = ResponseUtil.getSuccessResponse('Search Page Group Success.', pages);
            return res.status(200).send(successResponseGroup);
        } else if (data.type === 'page' && data.field === 'province') {
            const pageQuery = [
                { $match: { isOfficial: true, banned: false, province: exp } },
                { $limit: 10 }
            ];
            const pages: any[] = await this.pageService.aggregate(pageQuery);
            let pageId = undefined;
            let pageName = undefined;
            for (const page of pages) {
                pageId = page._id;
                pageName = page.name;
                searchResults.push({ value: pageId, label: pageName, type: SEARCH_TYPE.PAGE });
            }
        } else if (data.type === 'post' && data.field === 'emergencyEvent') {
            const filterIds = [];
            const objIds = [];
            if (data.values.length > 0) {
                for (let i = 0; i < data.values.length; i++) {
                    filterIds.push(data.values[i].values);
                }
            }
            if (filterIds.length > 0) {
                const flatten = filterIds.flat();
                if (flatten.length > 0) {
                    for (let j = 0; j < flatten.length; j++) {
                        if (flatten[j].id !== '' && flatten[j].id !== undefined && flatten[j].id !== null) {
                            objIds.push(new ObjectID(flatten[j].id));
                        } else {
                            continue;
                        }
                    }
                }
            }
            let pageQuery = undefined;
            if (objIds.length > 0) {
                pageQuery = [
                    {
                        $match: { title: exp, _id: { $nin: objIds } }
                    },
                ];
            } else {
                pageQuery = [
                    {
                        $match: { title: exp }
                    },
                ];
            }
            const postEmergencys = await this.emergencyEventService.aggregate(pageQuery);
            let postId = undefined;
            let postTitle = undefined;
            for (const postStmd of postEmergencys) {
                postId = postStmd._id;
                postTitle = postStmd.title;
                searchResults.push({ value: postId, label: postTitle, type: SEARCH_TYPE.PAGE });
            }

        } else if (data.type === 'post' && data.field === 'objective') {
            const filterIds = [];
            const objIds = [];
            if (data.values.length > 0) {
                for (let i = 0; i < data.values.length; i++) {
                    filterIds.push(data.values[i].values);
                }
            }
            if (filterIds.length > 0) {
                const flatten = filterIds.flat();
                if (flatten.length > 0) {
                    for (let j = 0; j < flatten.length; j++) {
                        if (flatten[j].id !== '' && flatten[j].id !== undefined && flatten[j].id !== null) {
                            objIds.push(new ObjectID(flatten[j].id));
                        } else {
                            continue;
                        }
                    }
                }
            }
            let pageQuery = undefined;
            if (objIds.length > 0) {
                pageQuery = [
                    {
                        $match: { title: exp, _id: { $nin: objIds } }
                    },
                ];
            } else {
                pageQuery = [
                    {
                        $match: { title: exp }
                    },
                ];
            }
            const postObjectiveS = await this.pageObjectiveService.aggregate(pageQuery);

            let postId = undefined;
            let postTitle = undefined;
            for (const postStmd of postObjectiveS) {
                postId = postStmd._id;
                postTitle = postStmd.title;
                searchResults.push({ value: postId, label: postTitle, type: SEARCH_TYPE.PAGE });
            }

        } else if (data.type === 'post' && data.field === 'score') {
            const returnUnderfined = undefined;
            searchResults.push({ value: returnUnderfined, label: returnUnderfined, type: SEARCH_TYPE.PAGE });
        } else if (data.type === 'post' && data.field === 'hashtag') {
            const hashTagSearch = await this.hashTagService.aggregate(
                [
                    {
                        $match: { name: exp }
                    },
                    {
                        $limit: 10
                    }
                ]);
            let postId = undefined;
            let postTitle = undefined;
            for (const postStmd of hashTagSearch) {
                postId = postStmd._id;
                postTitle = postStmd.name;
                searchResults.push({ value: postId, label: postTitle, type: SEARCH_TYPE.PAGE });
            }

        } else {
            const hashTagMost = await this.hashTagService.searchHashSec(limit);
            if (hashTagMost.length >= 0) {
                for (const hashTagMostS of hashTagMost) {
                    bucketF.push(new ObjectID(hashTagMostS.id));
                }
            }
            const postStmts = [
                { $match: { isDraft: false, deleted: false, hidden: false, postsHashTags: { $ne: null, $in: bucketF } } },
                { $limit: 10 }
            ];
            const postAggregateSet1 = await this.postsService.aggregate(postStmts);

            let postId = undefined;
            let postTitle = undefined;
            for (const postStmd of postAggregateSet1) {
                postId = postStmd._id;
                postTitle = postStmd.title;
                searchResults.push({ value: postId, label: postTitle, type: SEARCH_TYPE.PAGE });
            }

        }
        search.result = searchResults;
        if (search !== null && search !== undefined && Object.keys(search).length > 0) {
            const successResponse = ResponseUtil.getSuccessResponse('Search Success', search);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Search Failed', undefined);
            return res.status(400).send(errorResponse);
        }

    }

    @Post('/group')
    @Authorized()
    public async createPageGroups(@Body({ validate: true }) PageGroupRequests: PageGroupRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const createPageGroup = new PageGroup();
        createPageGroup.name = PageGroupRequests.name;
        createPageGroup.detail = PageGroupRequests.detail;
        const createPageGroups = await this.pageGroupService.create(createPageGroup);
        if (createPageGroups) {
            const successResponse = ResponseUtil.getSuccessResponse('Create KaokaiToday is successfully.', createPageGroups);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot Create Page Group Request Name.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Put('/:id/group')
    @Authorized()
    public async editPageGroup(@Body({ validate: true }) EditPageGroupRequest: PageGroupRequest, @Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const objId = new ObjectID(id);
        const pageGroup = await this.pageGroupService.findOne({ _id: objId });
        if (pageGroup) {
            const query = { _id: pageGroup.id };
            const newValues = { $set: { name: EditPageGroupRequest.name, detail: EditPageGroupRequest.detail } };
            const update = await this.pageGroupService.update(query, newValues);
            if (update) {
                const successResponse = ResponseUtil.getSuccessResponse('Update Page Group is successfully.', undefined);
                return res.status(200).send(successResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find object ID.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Delete('/:id/group')
    @Authorized()
    public async deletePageGroup(@Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const objId = new ObjectID(id);
        if (objId) {
            const deletePageGroup = await this.pageGroupService.delete({ _id: objId });
            if (deletePageGroup) {
                const successResponse = ResponseUtil.getSuccessResponse('Update KaokaiToday is successfully.', undefined);
                return res.status(200).send(successResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find object ID.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Get('/group')
    public async getPageGroup(@Res() res: any, @Req() req: any): Promise<any> {
        const findPageGroup = await this.pageGroupService.find({});
        if (findPageGroup.length > 0) {
            const successResponse = ResponseUtil.getSuccessResponse('Page Group.', findPageGroup);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find Page Group', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Post('/receive/bucket')
    @Authorized()
    public async receiveBucket(@Body({ validate: true }) filter: SearchFilter, @Res() res: any, @Req() req: any): Promise<any> {
        const bucketAll = await this.kaokaiTodayService.search(filter);
        if (bucketAll.length > 0) {
            const successResponse = ResponseUtil.getSuccessResponse('Here this is your bucket boi.', bucketAll);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot find KaokaiToday Bucket', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Post('/processor')
    @Authorized()
    public async createKaokaiToday(@Body({ validate: true }) createKaokaiTodayRequest: CreateKaokaiTodayRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const titleRequest = createKaokaiTodayRequest.title;
        const positionNumber = createKaokaiTodayRequest.position;

        if (createKaokaiTodayRequest.position > 5) {
            const successResponse = ResponseUtil.getSuccessResponse('Position must less or equal than 4.', undefined);
            return res.status(200).send(successResponse);
        }

        const checkKaokai = await this.kaokaiTodayService.findOne({ position: positionNumber });
        if (checkKaokai !== null && checkKaokai !== undefined) {
            const query = { _id: checkKaokai.id };
            const newValues = { $set: { position: null } };
            const update = await this.kaokaiTodayService.update(query, newValues);
            if (update) {
                const createKaokaiToday = new KaokaiToday();
                createKaokaiToday.title = titleRequest;
                createKaokaiToday.type = createKaokaiTodayRequest.type;
                createKaokaiToday.field = createKaokaiTodayRequest.field;
                createKaokaiToday.flag = createKaokaiTodayRequest.flag;
                createKaokaiToday.pics = createKaokaiTodayRequest.pics;
                createKaokaiToday.limit = createKaokaiTodayRequest.limit;
                createKaokaiToday.position = createKaokaiTodayRequest.position;
                createKaokaiToday.buckets = createKaokaiTodayRequest.buckets;

                const CKaokaiToday = await this.kaokaiTodayService.create(createKaokaiToday);
                if (CKaokaiToday) {
                    const successResponse = ResponseUtil.getSuccessResponse('Create KaokaiToday is successfully.', createKaokaiToday);
                    return res.status(200).send(successResponse);
                }
            }
        }
        if (checkKaokai === undefined) {
            const createKaokaiToday = new KaokaiToday();
            createKaokaiToday.title = titleRequest;
            createKaokaiToday.type = createKaokaiTodayRequest.type;
            createKaokaiToday.field = createKaokaiTodayRequest.field;
            createKaokaiToday.flag = createKaokaiTodayRequest.flag;
            createKaokaiToday.pics = createKaokaiTodayRequest.pics;
            createKaokaiToday.limit = createKaokaiTodayRequest.limit;
            createKaokaiToday.position = createKaokaiTodayRequest.position;
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
    @Authorized()
    public async updateKaokaiToday(@Body({ validate: true }) createKaokaiTodayRequest: CreateKaokaiTodayRequest, @Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const compareF = [];
        const compareS = [];
        if (createKaokaiTodayRequest.buckets.length > 0) {
            compareF.push(createKaokaiTodayRequest.buckets.length);
        }
        const objId = new ObjectID(id);
        const kaoKaiToday = await this.kaokaiTodayService.findOne({ _id: objId });
        if (kaoKaiToday.buckets.length > 0) {
            compareS.push(kaoKaiToday.buckets.length);
        }
        if (createKaokaiTodayRequest.buckets.length < kaoKaiToday.buckets.length) {
            if (kaoKaiToday) {
                const query = { _id: objId };
                const newValues = {
                    $unset: {
                    }
                };
                for (let i = 0; i < createKaokaiTodayRequest.deleteIndex.length; i++) {
                    const bucketNameProp = `buckets.${createKaokaiTodayRequest.deleteIndex[i]}`;
                    newValues.$unset[bucketNameProp] = createKaokaiTodayRequest.deleteIndex[i];
                }
                const update = await this.kaokaiTodayService.update(query, newValues);

                if (update) {
                    // check if bucket is null
                    const kaokaiTodayNull = await this.kaokaiTodayService.findOne({ _id: objId });
                    if (kaokaiTodayNull) {
                        const queryNull = { _id: kaokaiTodayNull.id };
                        const newValuesNull = {
                            $set: {
                                title: createKaokaiTodayRequest.title,
                                type: createKaokaiTodayRequest.type,
                                field: createKaokaiTodayRequest.field,
                                position: createKaokaiTodayRequest.position,
                                limit: createKaokaiTodayRequest.limit,
                                flag: createKaokaiTodayRequest.flag,
                                pics: createKaokaiTodayRequest.pics
                            },
                            $pull: {
                                buckets: null,
                            },
                        };
                        const updateNull = await this.kaokaiTodayService.update(queryNull, newValuesNull);

                        if (updateNull) {
                            const successResponse = ResponseUtil.getSuccessResponse('Update KaokaiToday is successfully.', updateNull);
                            return res.status(200).send(successResponse);
                        }
                    }
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Cannot find object ID.', undefined);
                return res.status(400).send(errorResponse);
            }

        } else {
            if (kaoKaiToday) {
                const query = { _id: objId };
                const newValues = {
                    $set: {
                        title: createKaokaiTodayRequest.title,
                        type: createKaokaiTodayRequest.type,
                        field: createKaokaiTodayRequest.field,
                        position: createKaokaiTodayRequest.position,
                        limit: createKaokaiTodayRequest.limit,
                        flag: createKaokaiTodayRequest.flag
                    }
                };
                createKaokaiTodayRequest.buckets.forEach((bucket, index) => {
                    const bucketNameProp = `buckets.${index}.name`;
                    const bucketValuesProp = `buckets.${index}.values`;

                    newValues.$set[bucketNameProp] = bucket.name;
                    newValues.$set[bucketValuesProp] = bucket.values;
                });

                const update = await this.kaokaiTodayService.update(query, newValues);

                if (update) {
                    // check if bucket is null 
                    const successResponse = ResponseUtil.getSuccessResponse('Update KaokaiToday is successfully.', update);
                    return res.status(200).send(successResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Cannot find object ID.', undefined);
                return res.status(400).send(errorResponse);
            }
        }
    }

    @Delete('/:id/processor')
    @Authorized()
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
    public async deleteGroup(@Param('id') groupId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const groupObjId = new ObjectID(groupId);
        if (groupObjId !== undefined) {
            await this.pageGroupService.delete({ _id: groupObjId });
            return res.status(200).send(ResponseUtil.getSuccessResponse('Delete page is successfully.', true));
        } else {
            const errorResponse: any = { status: 0, message: 'Sorry cannnot delete page.' };
            return res.status(400).send(errorResponse);
        }
    }

    @Put('/:id/roundrobin')
    @Authorized()
    public async editPageRoundRobin(@Param('id') groupId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const groupObjId = new ObjectID(groupId);
        const body = req.body;
        if (body.roundRobin < 0) {
            const errorResponse: any = { status: 0, message: 'RoundRobin must greater than 0 ' };
            return res.status(400).send(errorResponse);
        }
        if (body.roundRobin > 3) {
            const errorResponse: any = { status: 0, message: 'RoundRobin must less than 3 ' };
            return res.status(400).send(errorResponse);
        }
        if (groupObjId === undefined && groupObjId === null) {
            const errorResponse: any = { status: 0, message: 'Page was not found.' };
            return res.status(400).send(errorResponse);
        }
        if (body !== undefined) {
            const query = { _id: groupObjId };
            const newValues = { $set: { name: body.name, detail: body.detail } };
            const update = await this.pageGroupService.update(query, newValues);
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

    @Post('/notification/news/search')
    @Authorized()
    public async notificationNews(@Body({ validate: true }) filter: SearchFilter, @Res() res: any, @Req() req: any): Promise<any> {
        const notificationNews = await this.notificationNewsService.search(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy, filter.count);
        if (notificationNews.length > 0) {
            const successResponse = ResponseUtil.getSuccessResponse('Get notification news is sucessfully.', notificationNews);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('There are no notification news.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Post('/post/report/search')
    @Authorized()
    public async postReport(@Body({ validate: true }) filter: SearchFilter, @Res() res: any, @Req() req: any): Promise<any> {
        const postReport = await this.manipulatePostService.search(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy, filter.count);
        if (postReport.length > 0) {
            const successResponse = ResponseUtil.getSuccessResponse('Search report post successfully.', postReport);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('There are no report posts.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Post('/page/report/search')
    @Authorized()
    public async pageReport(@Body({ validate: true }) filter: SearchFilter, @Res() res: any, @Req() req: any): Promise<any> {
        const pageReport = await this.manipulatePostService.search(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy, filter.count);
        if (pageReport.length > 0) {
            const successResponse = ResponseUtil.getSuccessResponse('Search report page is sucessfully.', pageReport);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('There are no report page.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Post('/snapshot/search')
    @Authorized()
    public async searchSnapShot(@Body({ validate: true }) filter: SearchFilter, @Res() res: any): Promise<any> {
        const snapShots = await this.kaokaiTodaySnapShotService.search(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy, filter.count);
        if (snapShots.length > 0) {
            const successResponse = ResponseUtil.getSuccessResponse('Get snapshot is sucessfully.', snapShots);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('There are no snapshot.', undefined);
            return res.status(400).send(errorResponse);
        }
    }
    @Delete('/:id/snapshot')
    @Authorized()
    public async deleteSnapShot(@Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const idObj = new ObjectID(id);
        if (idObj !== undefined) {
            const deleteSnapShot = await this.kaokaiTodaySnapShotService.delete({ _id: idObj });
            if (deleteSnapShot) {
                const successResponse = ResponseUtil.getSuccessResponse('Delete snapshot is sucessfully.', undefined);
                return res.status(200).send(successResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot delete snapshot.', undefined);
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
