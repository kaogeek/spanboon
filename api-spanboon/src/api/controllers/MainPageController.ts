/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Get, Body, Post, Req, QueryParam } from 'routing-controllers';
import MainPageResponse from './responses/MainPageResponse';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { ProcessorUtil } from '../../utils/ProcessorUtil';
import { ObjectID } from 'mongodb';
import { PageService } from '../services/PageService';
import { HashTagService } from '../services/HashTagService';
import { UserService } from '../services/UserService';
import { SearchHistoryService } from '../services/SearchHistoryService';
import { SearchRequest } from './requests/SearchRequest';
import { ContentSearchRequest } from './requests/ContentSearchRequest';
import { SearchContentResponse } from './responses/SearchContentResponse';
import { PostsService } from '../services/PostsService';
import { UserFollowService } from '../services/UserFollowService';
import { PageObjectiveService } from '../services/PageObjectiveService';
import { SUBJECT_TYPE } from '../../constants/FollowType';
import { SEARCH_TYPE, SORT_SEARCH_TYPE } from '../../constants/SearchType';
import { SearchFilter } from './requests/SearchFilterRequest';
import { LastestLookingSectionProcessor } from '../processors/LastestLookingSectionProcessor';
// import { StillLookingSectionProcessor } from '../processors/StillLookingSectionProcessor';
import { EmergencyEventSectionProcessor } from '../processors/EmergencyEventSectionProcessor';
import { PostSectionProcessor } from '../processors/PostSectionProcessor';
import { ObjectiveProcessor } from '../processors/ObjectiveProcessor';
import { NeedsService } from '../services/NeedsService';
import { EmergencyEventService } from '../services/EmergencyEventService';
import { UserRecommendSectionProcessor } from '../processors/UserRecommendSectionProcessor';
import { UserFollowSectionProcessor } from '../processors/UserFollowSectionProcessor';
import { UserPageLookingSectionProcessor } from '../processors/UserPageLookingSectionProcessor';
import { LastestObjectiveProcessor } from '../processors/LastestObjectiveProcessor';
import { EmergencyEventPinProcessor } from '../processors/EmergencyEventPinProcessor';
// import { TEMPLATE_TYPE } from '../../constants/TemplateType';
// import { SearchFilter } from './requests/SearchFilterRequest';
// import { SearchHistory } from '../models/SearchHistory';
// import { MAX_SEARCH_ROWS } from '../../constants/Constants';
// import { SectionModel } from '../models/SectionModel';
import { User } from '../models/User';
import { Page } from '../models/Page';
import { MAX_SEARCH_ROWS } from '../../constants/Constants';
import { HashTag } from '../models/HashTag';
import { PageObjective } from '../models/PageObjective';
import { EmergencyEvent } from '../models/EmergencyEvent';
import { DateTimeUtil } from '../../utils/DateTimeUtil';

@JsonController('/main')
export class MainPageController {
    constructor(
        private emergencyEventService: EmergencyEventService,
        private pageService: PageService,
        private hashTagService: HashTagService,
        private userService: UserService,
        private searchHistoryService: SearchHistoryService,
        private postsService: PostsService,
        private needsService: NeedsService,
        private userFollowService: UserFollowService,
        private pageObjectiveService: PageObjectiveService,
    ) { }

    // Find Page API
    /**
     * @api {get} /api/main/content Find Main Page Data API
     * @apiGroup MainPage
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get Page"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/main/content
     * @apiErrorExample {json} Page error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/content')
    public async getContentList(@QueryParam('offset') offset: number, @QueryParam('section') section: string, @QueryParam('date') date: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userId = req.headers.userid;

        if (section !== undefined && section !== '') {
            if (section === 'EMERGENCYEVENT') {
                const emerProcessorSec: EmergencyEventSectionProcessor = new EmergencyEventSectionProcessor(this.emergencyEventService, this.postsService);
                emerProcessorSec.setConfig({
                    showUserAction: true,
                    offset,
                    date
                });
                const emerSectionModelSec = await emerProcessorSec.process();

                const emerResult: any = {};
                emerResult.contents = emerSectionModelSec.contents;

                if (emerResult) {
                    const successResponse = ResponseUtil.getSuccessResponse('Successfully Main Page Data', emerResult);
                    return res.status(200).send(successResponse);
                } else {
                    const errorResponse = ResponseUtil.getErrorResponse('Unable got Main Page Data', undefined);
                    return res.status(400).send(errorResponse);
                }
            } else if (section === 'LASTEST') {
                const lastestLKProcessorSec: LastestLookingSectionProcessor = new LastestLookingSectionProcessor(this.postsService, this.needsService, this.userFollowService);
                lastestLKProcessorSec.setData({
                    userId,
                    startDateTime: undefined,
                    endDateTime: undefined
                });
                lastestLKProcessorSec.setConfig({
                    showUserAction: true,
                    offset,
                    date
                });
                const lastestLookSectionModelSec = await lastestLKProcessorSec.process();

                const lKresult: any = {};
                lKresult.contents = lastestLookSectionModelSec.contents;

                if (lKresult) {
                    const successResponse = ResponseUtil.getSuccessResponse('Successfully Main Page Data', lKresult);
                    return res.status(200).send(successResponse);
                } else {
                    const errorResponse = ResponseUtil.getErrorResponse('Unable got Main Page Data', undefined);
                    return res.status(400).send(errorResponse);
                }
            } else if (section === 'STILLLOOKING') {
                // const stillLKProcessorSec: StillLookingSectionProcessor = new StillLookingSectionProcessor(this.postsService, this.needsService, this.userFollowService);
                // stillLKProcessorSec.setData({
                //     userId
                // });
                // stillLKProcessorSec.setConfig({
                //     showUserAction: true,
                //     offset,
                //     date
                // });
                // const stillLKSectionModelSec = await stillLKProcessorSec.process();
                // const slResult: any = {};
                // slResult.contents = stillLKSectionModelSec.contents;

                // if (slResult) {
                //     const successResponse = ResponseUtil.getSuccessResponse('Successfully Main Page Data', slResult);
                //     return res.status(200).send(successResponse);
                // } else {
                //     const errorResponse = ResponseUtil.getErrorResponse('Unable got Main Page Data', undefined);
                //     return res.status(400).send(errorResponse);
                // }
                const errorResponse = ResponseUtil.getErrorResponse('Unable got Main Page Data', undefined);
                return res.status(400).send(errorResponse);
            } else if (section === 'RECOMMEND') {
                const userRecProcessorSec: UserRecommendSectionProcessor = new UserRecommendSectionProcessor(this.postsService, this.userFollowService);
                userRecProcessorSec.setData({
                    userId,
                    startDateTime: undefined,
                    endDateTime: undefined
                });
                userRecProcessorSec.setConfig({
                    showUserAction: true,
                    offset,
                    date
                });
                const userRecSectionModelSec = await userRecProcessorSec.process();
                userRecSectionModelSec.isList = true;

                const urResult: any = {};
                urResult.contents = userRecSectionModelSec.contents;

                if (urResult) {
                    const successResponse = ResponseUtil.getSuccessResponse('Successfully Main Page Data', urResult);
                    return res.status(200).send(successResponse);
                } else {
                    const errorResponse = ResponseUtil.getErrorResponse('Unable got Main Page Data', undefined);
                    return res.status(400).send(errorResponse);
                }
            } else if (section === 'USERFOLLOW') {
                const userFollowProcessors: UserFollowSectionProcessor = new UserFollowSectionProcessor(this.postsService, this.userFollowService, this.pageService);
                userFollowProcessors.setData({
                    userId
                });
                userFollowProcessors.setConfig({
                    showUserAction: true,
                    offset,
                    date
                });
                const userFollowSectionModelSec = await userFollowProcessors.process();
                userFollowSectionModelSec.isList = true;

                const urResult: any = {};
                urResult.contents = userFollowSectionModelSec.contents;

                if (urResult) {
                    const successResponse = ResponseUtil.getSuccessResponse('Successfully Main Page Data', urResult);
                    return res.status(200).send(successResponse);
                } else {
                    const errorResponse = ResponseUtil.getErrorResponse('Unable got Main Page Data', undefined);
                    return res.status(400).send(errorResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Unable got Main Page Data', undefined);
                return res.status(400).send(errorResponse);
            }
        }

        let processorList: any[] = [];

        const weekRanges: Date[] = DateTimeUtil.generatePreviousDaysPeriods(new Date(), 7);
        const emerProcessor: EmergencyEventSectionProcessor = new EmergencyEventSectionProcessor(this.emergencyEventService, this.postsService);
        emerProcessor.setConfig({
            showUserAction: true,
            offset,
            date
        });
        const emerSectionModel = await emerProcessor.process();

        const postProcessor: PostSectionProcessor = new PostSectionProcessor(this.postsService);
        postProcessor.setData({
            startDateTime: weekRanges[0],
            endDateTime: weekRanges[1]
        });
        const postSectionModel = await postProcessor.process();

        const lastestLKProcessor: LastestLookingSectionProcessor = new LastestLookingSectionProcessor(this.postsService, this.needsService, this.userFollowService);
        lastestLKProcessor.setData({
            userId,
            startDateTime: weekRanges[0],
            endDateTime: weekRanges[1]
        });
        lastestLKProcessor.setConfig({
            showUserAction: true,
            offset,
            date
        });
        processorList.push(lastestLKProcessor);

        // const stillLKProcessor: StillLookingSectionProcessor = new StillLookingSectionProcessor(this.postsService, this.needsService, this.userFollowService);
        // if (userId !== undefined) {
        //     stillLKProcessor.setData({
        //         userId
        //     });
        // }
        // stillLKProcessor.setConfig({
        //     showUserAction: true,
        //     offset,
        //     date
        // });
        // processorList.push(stillLKProcessor);

        const userRecProcessor: UserRecommendSectionProcessor = new UserRecommendSectionProcessor(this.postsService, this.userFollowService);
        userRecProcessor.setData({
            userId,
            startDateTime: weekRanges[0],
            endDateTime: weekRanges[1]
        });
        userRecProcessor.setConfig({
            showUserAction: true,
            offset,
            date
        });
        processorList.push(userRecProcessor);

        const emergencyPinProcessor: EmergencyEventPinProcessor = new EmergencyEventPinProcessor(this.emergencyEventService, this.postsService);
        const emergencyPinModel = await emergencyPinProcessor.process();

        const objectiveProcessor: ObjectiveProcessor = new ObjectiveProcessor(this.pageObjectiveService, this.postsService);
        objectiveProcessor.setData({
            userId,
            startDateTime: weekRanges[0],
            endDateTime: weekRanges[1]
        });
        objectiveProcessor.setConfig({
            showUserAction: true
        });
        const objectiveSectionModel = await objectiveProcessor.process();

        const userFollowProcessor: UserFollowSectionProcessor = new UserFollowSectionProcessor(this.postsService, this.userFollowService, this.pageService);
        userFollowProcessor.setData({
            userId,
            startDateTime: weekRanges[0],
            endDateTime: weekRanges[1]
        });
        userFollowProcessor.setConfig({
            limit: 4,
            showUserAction: true
        });
        processorList.push(userFollowProcessor);

        const userPageLookingProcessor: UserPageLookingSectionProcessor = new UserPageLookingSectionProcessor(this.postsService, this.userFollowService);
        userPageLookingProcessor.setData({
            userId,
            startDateTime: weekRanges[0],
            endDateTime: weekRanges[1]
        });
        userPageLookingProcessor.setConfig({
            limit: 2,
            showUserAction: true
        });
        processorList.push(userPageLookingProcessor);

        // open when main icon template show
        const lastestObjProcessor = new LastestObjectiveProcessor(this.pageObjectiveService, this.userFollowService);
        lastestObjProcessor.setData({
            userId,
            startDateTime: weekRanges[0],
            endDateTime: weekRanges[1]
        });
        lastestObjProcessor.setConfig({
            limit: 5,
            showUserAction: true
        });
        processorList.push(lastestObjProcessor);

        const result: any = {};
        result.emergencyEvents = emerSectionModel;
        result.emergencyPin = emergencyPinModel;
        result.postSectionModel = postSectionModel;
        result.objectiveEvents = objectiveSectionModel;
        // result.lastest = lastestLookSectionModel;
        // result.looking = stillLKSectionModel;
        // result.viewSection = userRecSectionModel;
        result.sectionModels = [];

        processorList = ProcessorUtil.randomProcessorOrdering(processorList);

        // ! remove random function when fishished testing
        const randIdx = Math.floor(Math.random() * processorList.length);
        for (let i = 0; i < processorList.length; i++) {
            const processor = processorList[i];
            const model = await processor.process();
            if (model !== undefined && model.contents.length > 0) {
                // !remove random function when fishished testing
                if (randIdx === i) {
                    model.isHighlight = true;
                    // fix content to 3
                    if (model.contents.length > 3) {
                        model.contents = model.contents.slice(0, 3);
                    }
                }
                result.sectionModels.push(model);
            }
        }

        if (result) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully Main Page Data', result);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable got Main Page Data', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Find User and Page API
    /**
     * @api {get} /api/main/account Find Main Page Data API
     * @apiGroup MainPage
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Get User Or Page Success"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/main/account
     * @apiErrorExample {json} Cannot Get User Or Page 
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/account')
    public async getUserAndPageAccount(@QueryParam('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        let pageObjId: ObjectID;
        let userObjId: ObjectID;
        let pageStmt: any;
        let userStmt: any;
        let result: any;

        if (id === null || id === undefined || id === '') {
            return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Get User Or Page', undefined));
        }

        try {
            userObjId = new ObjectID(id);
            pageObjId = new ObjectID(id);

            userStmt = { _id: userObjId };
            pageStmt = { _id: pageObjId };
        } catch (ex) {
            userStmt = { uniqueId: id };
            pageStmt = { pageUsername: id };
        } finally {
            if (userObjId === undefined || userObjId === 'undefined') {
                userObjId = null;
            }

            if (pageObjId === undefined || pageObjId === 'undefined') {
                pageObjId = null;
            }

            userStmt = { $or: [{ _id: userObjId }, { uniqueId: id }] };
            pageStmt = { $or: [{ _id: pageObjId }, { pageUsername: id }] };
        }

        let user: User = await this.userService.findOne(userStmt);
        const page: Page = await this.pageService.findOne(pageStmt);

        if (user !== null && user !== undefined) {
            user = await this.userService.cleanUserField(user);
            result = user;
            result.type = SEARCH_TYPE.USER;
        }

        if (page !== null && page !== undefined) {
            result = page;
            result.type = SEARCH_TYPE.PAGE;
        }

        if (result !== null && result !== undefined) {
            return res.status(200).send(ResponseUtil.getSuccessResponse('Get User Or Page Success', result));
        } else {
            return res.status(200).send(ResponseUtil.getSuccessResponse('User Or Page Not Found', undefined));
        }
    }

    // Search User and Page API
    /**
     * @api {post} /api/main/account/search Search Main Page Data API
     * @apiGroup MainPage
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Get User Or Page Success"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/main/account/search
     * @apiErrorExample {json} Cannot Get User Or Page 
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/account/search')
    public async searchUserAndPageAutocomp(@Body({ validate: true }) data: SearchRequest, @Res() res: any, @Req() req: any): Promise<any> {
        try {
            let result: any;
            const resultData: any[] = [];
            const keyword = data.keyword;
            const regex = { $regex: '.*' + keyword + '.*', $options: 'si' };
            const userStmt = { $or: [{ firstName: regex }, { lastName: regex }, { displayName: regex }, { uniqueId: regex }, { email: regex }], banned: false };
            const pageStmt = { $or: [{ name: regex }, { pageUsername: regex }], banned: false };

            const pages: Page[] = await this.pageService.find(pageStmt);
            const users: User[] = await this.userService.find(userStmt);

            if (users !== null && users !== undefined && users.length > 0) {
                for (let user of users) {
                    user = await this.userService.cleanUserField(user);
                    result = user;
                    result.type = SEARCH_TYPE.USER;
                    resultData.push(result);
                }
            }

            if (pages !== null && pages !== undefined && pages.length > 0) {
                for (const page of pages) {
                    result = page;
                    result.type = SEARCH_TYPE.PAGE;
                    resultData.push(result);
                }
            }

            if (resultData !== null && resultData !== undefined && resultData.length > 0) {
                return res.status(200).send(ResponseUtil.getSuccessResponse('Get User Or Page Success', resultData));
            } else {
                return res.status(200).send(ResponseUtil.getSuccessResponse('User Or Page Not Found', undefined));
            }
        } catch (error) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Search Error', error.message));
        }
    }

    // Search API
    /**
     * @api {get} /api/main/search Search API
     * @apiGroup MainPage
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Search Success",
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/main/search
     * @apiErrorExample {json} Search Failed
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/search')
    public async searchAll(@Body({ validate: true }) data: SearchRequest, @Res() res: any, @Req() req: any): Promise<any> {
        try {
            const search: any = {};
            const userId = data.userId;
            const keyword = data.keyword;
            const exp = { $regex: '.*' + keyword + '.*', $options: 'si' };
            const pageResultStmt = [];
            const userResultStmt = [];
            const hashTagResultStmt = [];
            const searchResults = [];
            const historyLimit = 10;
            let pageLimit;
            let userLimit;
            let hashTagLimit;
            let historyRows = 0;
            let pageRows = 0;
            let userRows = 0;
            let hashTagRows = 0;
            let userObjId;
            let historyQuery = {};

            if (userId !== '' && userId !== null && userId !== undefined) {
                userObjId = new ObjectID(userId);
                historyQuery = [
                    { $match: { keyword: exp, userId: userObjId } },
                    { $sort: { createdDate: -1 } },
                    { $limit: historyLimit },
                    { $group: { _id: '$keyword', result: { $first: '$$ROOT' } } },
                    { $replaceRoot: { newRoot: '$result' } }
                ];
            } else {
                historyQuery = [
                    { $match: { keyword: exp } },
                    { $sort: { createdDate: -1 } },
                    { $limit: historyLimit },
                    { $group: { _id: '$keyword', result: { $first: '$$ROOT' } } },
                    { $replaceRoot: { newRoot: '$result' } }
                ];
            }

            const histories = await this.searchHistoryService.aggregate(historyQuery);
            historyRows = histories.length;
            pageLimit = historyLimit - historyRows;
            if (historyRows !== null && historyRows !== undefined && historyRows > 0) {
                for (const history of histories) {
                    searchResults.push({ historyId: history._id, value: history.resultId, label: history.keyword, type: history.resultType });

                    if (history.resultType === SEARCH_TYPE.PAGE) {
                        pageResultStmt.push(new ObjectID(history.resultId));
                    } else if (history.resultType === SEARCH_TYPE.USER) {
                        userResultStmt.push(new ObjectID(history.resultId));
                    } else if (history.resultType === SEARCH_TYPE.HASHTAG) {
                        hashTagResultStmt.push(new ObjectID(history.resultId));
                    }
                }
            }

            if (pageLimit !== null && pageLimit !== undefined && pageLimit > 0) {
                // const pageQuery = { $and: [{ _id: { $not: { $in: pageResultStmt } } }, { $or: [{ name: exp }, { pageUsername: exp }] }] };
                const pageQuery = [
                    { $match: { $and: [{ _id: { $not: { $in: pageResultStmt } } }, { $or: [{ name: exp }, { pageUsername: exp }] }] } },
                    { $limit: pageLimit }
                ];
                const pages: any[] = await this.pageService.aggregate(pageQuery);

                pageRows = pages.length;
                userLimit = pageLimit - pageRows;
                if (pageRows !== null && pageRows !== undefined && pageRows > 0) {
                    let pageId;
                    let pageName;

                    for (const page of pages) {
                        pageId = page._id;
                        pageName = page.name;
                        searchResults.push({ value: pageId, label: pageName, type: SEARCH_TYPE.PAGE });
                    }
                }
            }

            if (userLimit !== null && userLimit !== undefined && userLimit > 0) {
                // const userQuery = { $and: [{ _id: { $not: { $in: userResultStmt } } }, { $or: [{ displayName: exp }, { firstName: exp }, { lastName: exp }] }] };
                const userQuery = [
                    { $match: { $and: [{ _id: { $not: { $in: userResultStmt } } }, { isAdmin: false, isSubAdmin: false, banned: false }, { $or: [{ displayName: exp }, { firstName: exp }, { lastName: exp }] }] } },
                    { $limit: userLimit }
                ];
                const users = await this.userService.aggregate(userQuery);

                userRows = users.length;
                hashTagLimit = userLimit - userRows;
                if (userRows !== null && userRows !== undefined && userRows > 0) {
                    for (const user of users) {
                        searchResults.push({ value: user._id, label: user.displayName, type: SEARCH_TYPE.USER });
                    }
                }
            }

            if (hashTagLimit !== null && hashTagLimit !== undefined && hashTagLimit > 0) {
                // const hashTagQuery = { $and: [{ _id: { $not: { $in: hashTagResultStmt } } }, { $or: [{ name: exp }] }] };
                const hashTagQuery = [
                    { $match: { $and: [{ _id: { $not: { $in: hashTagResultStmt } } }, { $or: [{ name: exp }] }] } },
                    { $limit: hashTagLimit }
                ];
                const hashTags = await this.hashTagService.aggregate(hashTagQuery);

                hashTagRows = hashTags.length;
                if (hashTagRows !== null && hashTagRows !== undefined && hashTagRows > 0) {
                    let tagName;
                    let fullTagName;

                    for (const tag of hashTags) {
                        tagName = tag.name;
                        fullTagName = '#' + tagName;
                        searchResults.push({ value: tagName, label: fullTagName, type: SEARCH_TYPE.HASHTAG });
                    }
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
        } catch (error) {
            const errorResponse = ResponseUtil.getErrorResponse('Search Error', error.message);
            return res.status(400).send(errorResponse);
        }
    }

    // Search API
    /**
     * @api {get} /api/main/content/search Search API
     * @apiGroup MainPage
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Search Success",
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/main/content/search
     * @apiErrorExample {json} Search Failed
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/content/search')
    public async searchContentAll(@Body({ validate: true }) data: ContentSearchRequest, @Res() res: any, @Req() req: any): Promise<SearchContentResponse> {
        try {
            let search: any = {};
            const searchResults = [];
            const postStmt = [];
            let searchPostStmt: any[] = [];
            let filter: SearchFilter = data.filter;

            if (filter === undefined) {
                filter = new SearchFilter();
            }

            let keyword: string[];
            let hashTag: string[];
            let type: string;
            let onlyFollowed: boolean;
            let createBy: any; // {id,type}
            let objective: string;
            let emergencyEvent: string;
            let startDate: string;
            let endDate: string;
            let startViewCount: number;
            let endViewCount: number;
            // Count All Action
            let startActionCount: number;
            let endActionCount: number;
            // Count Comment
            let startCommentCount: number;
            let endCommentCount: number;
            // Count Repost
            let startRepostCount: number;
            let endRepostCount: number;
            // Count Like
            let startLikeCount: number;
            let endLikeCount: number;
            // Count Share
            let startShareCount: number;
            let endShareCount: number;
            // Location
            // let locations: string[];
            // Page Catgory
            let pageCategories: string[];
            let sortBy: string;

            if (data !== undefined) {
                // search all post by keyword or hashTag
                keyword = data.keyword;
                hashTag = data.hashtag;
                onlyFollowed = data.onlyFollowed;
                type = data.type;
                createBy = data.createBy;
                objective = data.objective;
                emergencyEvent = data.emergencyEvent;
                startDate = data.startDate;
                endDate = data.endDate;
                startViewCount = data.startViewCount;
                endViewCount = data.endViewCount;
                startActionCount = data.startActionCount;
                endActionCount = data.endActionCount;
                startCommentCount = data.startCommentCount;
                endCommentCount = data.endCommentCount;
                startRepostCount = data.startRepostCount;
                endRepostCount = data.endRepostCount;
                startLikeCount = data.startLikeCount;
                endLikeCount = data.endLikeCount;
                startShareCount = data.startShareCount;
                endShareCount = data.endShareCount;
                // locations = data.locations;
                pageCategories = data.pageCategories;
                sortBy = data.sortBy;
            }

            postStmt.push({ $match: { deleted: false } });

            if (keyword !== undefined && keyword !== null && keyword.length > 0) {
                let matchKeywordTitleStmt: any = {};
                let matchKeywordTitleStmtResult: any = {};
                let matchKeywordDetailStmt: any = {};
                let matchKeywordDetailStmtResult: any = {};
                const matchKeywordTitleStmtList: any[] = [];
                const matchKeywordDetailStmtList: any[] = [];
                const matchKeywordStmtResult: any[] = [];

                for (const kw of keyword) {
                    matchKeywordTitleStmt = {};
                    matchKeywordDetailStmt = {};

                    matchKeywordTitleStmt = { title: { $regex: '.*' + kw + '.*', $options: 'si' } };
                    matchKeywordDetailStmt = { detail: { $regex: '.*' + kw + '.*', $options: 'si' } };

                    matchKeywordTitleStmtList.push(matchKeywordTitleStmt);
                    matchKeywordDetailStmtList.push(matchKeywordDetailStmt);

                    matchKeywordTitleStmtResult = { $and: matchKeywordTitleStmtList };
                    matchKeywordDetailStmtResult = { $and: matchKeywordDetailStmtList };
                }

                matchKeywordStmtResult.push(matchKeywordTitleStmtResult, matchKeywordDetailStmtResult);

                if (matchKeywordStmtResult !== null && matchKeywordStmtResult !== undefined && matchKeywordStmtResult.length > 0) {
                    postStmt.push({ $match: { $or: matchKeywordStmtResult } });
                }
            }

            if (hashTag !== undefined && hashTag !== null && hashTag.length > 0) {
                /* // open for tag searching in title and detail
                let matchHashTagTitleStmt: any = {};
                let matchHashTagTitleStmtResult: any = {};
                let matchHashTagDetailStmt: any = {};
                let matchHashTagDetailStmtResult: any = {};
                const matchHashTagTitleStmtList: any[] = [];
                const matchHashTagDetailStmtList: any[] = [];
                const matchHashTagStmtResult: any[] = [];

                for (const tag of hashTag) {
                    matchHashTagTitleStmt = {};
                    matchHashTagDetailStmt = {};

                    matchHashTagTitleStmt = { title: { $regex: '.*' + tag + '.*', $options: 'si' } };
                    matchHashTagDetailStmt = { detail: { $regex: '.*' + tag + '.*', $options: 'si' } };

                    matchHashTagTitleStmtList.push(matchHashTagTitleStmt);
                    matchHashTagDetailStmtList.push(matchHashTagDetailStmt);

                    matchHashTagTitleStmtResult = { $and: matchHashTagTitleStmtList };
                    matchHashTagDetailStmtResult = { $and: matchHashTagDetailStmtList };
                }

                matchHashTagStmtResult.push(matchHashTagTitleStmtResult, matchHashTagDetailStmtResult);

                if (matchHashTagStmtResult !== null && matchHashTagStmtResult !== undefined && matchHashTagStmtResult.length > 0) {
                    postStmt.push({ $match: { $or: matchHashTagStmtResult } });
                }*/

                const hashTagIdList: ObjectID[] = [];

                const masterHashTags: HashTag[] = await this.hashTagService.find({ name: { $in: hashTag } });

                if (masterHashTags !== null && masterHashTags !== undefined && masterHashTags.length > 0) {
                    for (const tag of masterHashTags) {
                        const hashTagId = tag.id;

                        hashTagIdList.push(new ObjectID(hashTagId));
                    }

                    if (hashTagIdList !== null && hashTagIdList !== undefined && hashTagIdList.length > 0) {
                        postStmt.push({ $match: { $and: [{ postsHashTags: { $all: hashTagIdList } }] } });
                    } else {
                        return res.status(200).send(ResponseUtil.getSuccessResponse('Search Success', []));
                    }
                }
            }

            if (onlyFollowed === undefined) {
                onlyFollowed = false;
            }

            if (onlyFollowed) {
                const userId = req.headers.userid;
                // search followed user
                const fwhereConditions: any = { $or: [{ subjectType: SUBJECT_TYPE.PAGE }, { subjectType: SUBJECT_TYPE.USER }] };

                if (userId !== undefined && userId !== '') {
                    fwhereConditions.userId = userId;
                }

                const followResult: any = await this.userFollowService.search(undefined, undefined, ['subjectId', 'subjectType'], undefined, fwhereConditions, undefined, false);
                const orUserConditions = [];
                const orPageConditions = [];
                if (followResult !== null && followResult !== undefined) {
                    for (const followObj of followResult) {
                        if (followObj.subjectType === SUBJECT_TYPE.PAGE) {
                            orPageConditions.push(new ObjectID(followObj.subjectId));
                        } else if (followObj.subjectType === SUBJECT_TYPE.USER) {
                            orUserConditions.push(new ObjectID(followObj.subjectId));
                        }
                    }

                    if ((orPageConditions !== null && orPageConditions !== undefined && orPageConditions.length > 0) && (orUserConditions === null || orUserConditions === undefined || orUserConditions.length <= 0)) {
                        postStmt.push({ $match: { $or: [{ pageId: { $in: orPageConditions } }] } });
                    } else if ((orPageConditions === null || orPageConditions === undefined || orPageConditions.length > 0) && (orUserConditions !== null && orUserConditions !== undefined && orUserConditions.length <= 0)) {
                        postStmt.push({ $match: { $or: [{ pageId: { $in: orUserConditions } }] } });
                    } else if ((orPageConditions === null && orPageConditions !== undefined && orPageConditions.length > 0) && (orUserConditions !== null && orUserConditions !== undefined && orUserConditions.length <= 0)) {
                        postStmt.push({ $match: { $or: [{ pageId: { $in: orPageConditions } }, { ownerUser: { $in: orUserConditions } }] } });
                    }
                } else {
                    return res.status(200).send(ResponseUtil.getSuccessResponse('Search Success', []));
                }
            }

            if (type !== null && type !== undefined && type !== '') {
                postStmt.push({ $match: { type } });
            }

            if (createBy !== null && createBy !== undefined && createBy.length > 0) {
                const searchStmt = [];

                for (const create of createBy) {
                    const id = create.id;
                    const createdByType = create.type;

                    if (createdByType !== null && createdByType !== undefined) {
                        if (createdByType === SEARCH_TYPE.PAGE) {
                            searchStmt.push({ pageId: new ObjectID(id) });
                        } else if (createdByType === SEARCH_TYPE.USER) {
                            searchStmt.push({ pageId: null, ownerUser: new ObjectID(id) });
                        }
                    }
                }

                postStmt.push({ $match: { $or: searchStmt } });
            }

            if (objective !== null && objective !== undefined && objective !== '') {
                const objHashTag: HashTag = await this.hashTagService.findOne({ name: objective });

                if (objHashTag !== null && objHashTag !== undefined) {
                    const pageObjective: PageObjective = await this.pageObjectiveService.findOne({ hashTag: new ObjectID(objHashTag.id) });

                    if (pageObjective !== null && pageObjective !== undefined) {
                        postStmt.push({ $match: { objective: new ObjectID(pageObjective.id) } });
                    }
                } else {
                    return res.status(200).send(ResponseUtil.getSuccessResponse('Search Success', []));
                }
            }

            if (emergencyEvent !== null && emergencyEvent !== undefined && emergencyEvent !== '') {
                const postsEmergencyEvent: EmergencyEvent = await this.emergencyEventService.findOne({ _id: new ObjectID(emergencyEvent) });

                if (postsEmergencyEvent !== null && postsEmergencyEvent !== undefined) {
                    postStmt.push({ $match: { emergencyEvent: new ObjectID(postsEmergencyEvent.id) } });
                } else {
                    return res.status(200).send(ResponseUtil.getSuccessResponse('Search Success', []));
                }
            }

            if ((startDate !== null && startDate !== undefined && startDate !== '') && (endDate === null || endDate === undefined || endDate === '')) {
                postStmt.push({ $match: { $and: [{ startDateTime: { $gte: new Date(startDate) } }] } });
            } else if ((startDate === null || startDate === undefined || startDate === '') && (endDate !== null && endDate !== undefined && endDate !== '')) {
                postStmt.push({ $match: { $and: [{ startDateTime: { $lte: new Date(endDate) } }] } });
            } else if ((startDate !== null && startDate !== undefined && startDate !== '') && (endDate !== null && endDate !== undefined && endDate !== '')) {
                postStmt.push({ $match: { $and: [{ startDateTime: { $gte: new Date(startDate), $lte: new Date(endDate) } }] } });
            }

            const groupByStmt = {
                $group: {
                    _id: '$_id',
                    result: { $mergeObjects: '$$ROOT' },
                    total: { $sum: { $add: ['$commentCount', '$repostCount', '$shareCount', '$likeCount'] } }
                }
            };

            const lookupStmt = { $replaceRoot: { newRoot: { $mergeObjects: ['$result', '$$ROOT'] } } };
            const projectStmt = { $project: { result: 0 } };

            let matchStmt;

            if ((startActionCount !== null && startActionCount !== undefined) && (endActionCount === null || endActionCount === undefined)) {
                matchStmt = { $match: { $and: [{ total: { $gte: startActionCount } }] } };
                postStmt.push(groupByStmt, matchStmt, lookupStmt, projectStmt);
            } else if ((startActionCount === null || startActionCount === undefined) && (endActionCount !== null && endActionCount !== undefined)) {
                matchStmt = { $match: { $and: [{ total: { $lte: endActionCount } }] } };
                postStmt.push(groupByStmt, matchStmt, lookupStmt, projectStmt);
            } else if ((startActionCount !== null && startActionCount !== undefined) && (endActionCount !== null && endActionCount !== undefined)) {
                matchStmt = { $match: { $and: [{ total: { $gte: startActionCount, $lte: endActionCount } }] } };
                postStmt.push(groupByStmt, matchStmt, lookupStmt, projectStmt);
            }

            if ((startViewCount !== null && startViewCount !== undefined) && (endViewCount === null || endViewCount === undefined)) {
                postStmt.push({ $match: { $and: [{ viewCount: { $gte: startViewCount } }] } });
            } else if ((startViewCount === null || startViewCount === undefined) && (endViewCount !== null && endViewCount !== undefined)) {
                postStmt.push({ $match: { $and: [{ viewCount: { $lte: endViewCount } }] } });
            } else if ((startViewCount !== null && startViewCount !== undefined) && (endViewCount !== null && endViewCount !== undefined)) {
                postStmt.push({ $match: { $and: [{ viewCount: { $gte: startViewCount, $lte: endViewCount } }] } });
            }

            if ((startCommentCount !== null && startCommentCount !== undefined) && (endCommentCount === null || endCommentCount === undefined)) {
                postStmt.push({ $match: { $and: [{ commentCount: { $gte: startCommentCount } }] } });
            } else if ((startCommentCount === null || startCommentCount === undefined) && (endCommentCount !== null && endCommentCount !== undefined)) {
                postStmt.push({ $match: { $and: [{ commentCount: { $gte: endCommentCount } }] } });
            } else if ((startCommentCount !== null && startCommentCount !== undefined) && (endCommentCount !== null && endCommentCount !== undefined)) {
                postStmt.push({ $match: { $and: [{ commentCount: { $gte: startCommentCount, $lte: endCommentCount } }] } });
            }

            if ((startRepostCount !== null && startRepostCount !== undefined) && (endRepostCount === null || endRepostCount === undefined)) {
                postStmt.push({ $match: { $and: [{ repostCount: { $gte: startRepostCount } }] } });
            } else if ((startRepostCount === null || startRepostCount === undefined) && (endRepostCount !== null && endRepostCount !== undefined)) {
                postStmt.push({ $match: { $and: [{ repostCount: { $lte: endRepostCount } }] } });
            } else if ((startRepostCount !== null && startRepostCount !== undefined) && (endRepostCount !== null && endRepostCount !== undefined)) {
                postStmt.push({ $match: { $and: [{ repostCount: { $gte: startRepostCount, $lte: endRepostCount } }] } });
            }

            if ((startLikeCount !== null && startLikeCount !== undefined) && (endLikeCount === null || endLikeCount === undefined)) {
                postStmt.push({ $match: { $and: [{ likeCount: { $gte: startLikeCount } }] } });
            } else if ((startLikeCount === null || startLikeCount === undefined) && (endLikeCount !== null && endLikeCount !== undefined)) {
                postStmt.push({ $match: { $and: [{ likeCount: { $lte: endLikeCount } }] } });
            } else if ((startLikeCount !== null && startLikeCount !== undefined) && (endLikeCount !== null && endLikeCount !== undefined)) {
                postStmt.push({ $match: { $and: [{ likeCount: { $gte: startLikeCount, $lte: endLikeCount } }] } });
            }

            if ((startShareCount !== null && startShareCount !== undefined) && (endShareCount === null || endShareCount === undefined)) {
                postStmt.push({ $match: { $and: [{ shareCount: { $gte: startShareCount } }] } });
            } else if ((startShareCount === null || startShareCount === undefined) && (endShareCount !== null && endShareCount !== undefined)) {
                postStmt.push({ $match: { $and: [{ shareCount: { $lte: endShareCount } }] } });
            } else if ((startShareCount !== null && startShareCount !== undefined) && (endShareCount !== null && endShareCount !== undefined)) {
                postStmt.push({ $match: { $and: [{ shareCount: { $gte: startShareCount, $lte: endShareCount } }] } });
            }

            // if (locations !== null && locations !== undefined && locations.length > 0) { }

            if (pageCategories !== null && pageCategories !== undefined && pageCategories.length > 0) {
                const categoryIdList = [];

                for (const category of pageCategories) {
                    categoryIdList.push(new ObjectID(category));
                }

                const pages: Page[] = await this.pageService.find({ category: { $in: categoryIdList } });
                const pageIdList = [];

                for (const page of pages) {
                    pageIdList.push(new ObjectID(page.id));
                }

                if (pageIdList !== null && pageIdList !== undefined && pageIdList.length > 0) {
                    postStmt.push({ $match: { $or: [{ pageId: { $in: pageIdList } }] } });
                } else {
                    return res.status(200).send(ResponseUtil.getSuccessResponse('Search Success', []));
                }
            }

            if (sortBy !== null && sortBy !== undefined && sortBy !== '') {
                if (sortBy === SORT_SEARCH_TYPE.LASTEST_DATE) {
                    postStmt.push({ $sort: { startDateTime: -1 } });
                } else if (sortBy === SORT_SEARCH_TYPE.POPULAR) {
                    postStmt.push({ $sort: { viewCount: -1 } });
                } else if (sortBy === SORT_SEARCH_TYPE.RELATED) {
                    postStmt.push({ $sort: { startDateTime: -1 } });
                }
            } else {
                postStmt.push({ $sort: { startDateTime: -1 } });
            }

            if (filter.offset !== null && filter.offset !== undefined) {
                postStmt.push({ $skip: filter.offset });
            }

            if (filter.limit !== null && filter.limit !== undefined && filter.limit !== 0) {
                postStmt.push({ $limit: filter.limit });
            } else {
                postStmt.push({ $limit: MAX_SEARCH_ROWS });
            }

            const postsLookupStmt = [
                {
                    $lookup: {
                        from: 'PostsGallery',
                        localField: '_id',
                        foreignField: 'post',
                        as: 'gallery'
                    }
                },
                {
                    $lookup: {
                        from: 'Needs',
                        localField: '_id',
                        foreignField: 'post',
                        as: 'needs'
                    }
                },
                {
                    $lookup: {
                        from: 'Fulfillment',
                        localField: '_id',
                        foreignField: 'post',
                        as: 'fulfillment'
                    }
                },
                {
                    $lookup: {
                        from: 'EmergencyEvent',
                        localField: 'emergencyEvent',
                        foreignField: '_id',
                        as: 'emergencyEvent'
                    }
                },
                {
                    $unwind: {
                        path: '$emergencyEvent',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        'emergencyEvent._id': 0,
                        'emergencyEvent.title': 0,
                        'emergencyEvent.detail': 0,
                        'emergencyEvent.coverPageURL': 0,
                        'emergencyEvent.createdDate': 0,
                        'emergencyEvent.isClose': 0,
                        'emergencyEvent.isPin': 0
                    }
                },
                {
                    $lookup: {
                        from: 'PageObjective',
                        localField: 'objective',
                        foreignField: '_id',
                        as: 'objective'
                    }
                },
                {
                    $unwind: {
                        path: '$objective',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        'objective._id': 0,
                        'objective.pageId': 0,
                        'objective.title': 0,
                        'objective.detail': 0,
                        'objective.iconURL': 0,
                        'objective.createdDate': 0
                    }
                },
                {
                    $lookup: {
                        from: 'HashTag',
                        let: { postTags: '$postsHashTags' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $in: ['$_id', '$$postTags']
                                    }
                                }
                            }
                        ],
                        as: 'postsHashTags'
                    }
                },
                {
                    $addFields: {
                        hashTags: {
                            $map: {
                                input: '$postsHashTags',
                                as: 'hashTags',
                                in: { name: '$$hashTags.name' }
                            }
                        }
                    }
                },
                { $project: { postsHashTags: 0 } }
            ];

            searchPostStmt = postStmt.concat(postsLookupStmt);

            const pageMap = {};
            const userMap = {};
            const postResult = await this.postsService.aggregate(searchPostStmt);

            if (postResult !== null && postResult !== undefined && postResult.length > 0) {
                for (const post of postResult) {
                    const result = new SearchContentResponse();
                    result.post = post;

                    let postPage;
                    if (post.pageId !== undefined && post.pageId !== null && post.pageId !== '') {
                        if (pageMap[post.pageId] === undefined) {
                            const page = await this.pageService.findOne({ _id: new ObjectID(post.pageId) });
                            pageMap[post.pageId] = page;
                        }
                    }
                    postPage = pageMap[post.pageId];

                    if (userMap[post.ownerUser] === undefined) {
                        const user = await this.userService.findOne({ _id: new ObjectID(post.ownerUser) });
                        userMap[post.ownerUser] = this.parseUserField(user);
                    }

                    result.user = userMap[post.ownerUser];
                    result.page = postPage;

                    searchResults.push(result);
                }

                search = searchResults;

                if (search !== null && search !== undefined && Object.keys(search).length > 0) {
                    const successResponse = ResponseUtil.getSuccessResponse('Search Success', search);
                    return res.status(200).send(successResponse);
                } else {
                    const errorResponse = ResponseUtil.getErrorResponse('Search Failed', undefined);
                    return res.status(400).send(errorResponse);
                }
            } else {
                return res.status(200).send(ResponseUtil.getSuccessResponse('Search Success', []));
            }
        } catch (error) {
            const errorResponse = ResponseUtil.getErrorResponse('Search Error', error.message);
            return res.status(400).send(errorResponse);
        }
    }

    public getResponsesData(): any {
        return MainPageResponse.data();
    }

    private parseUserField(user: any): any {
        const userResult: any = {};

        if (user !== undefined) {
            userResult.id = user._id;
            userResult.displayName = user.displayName;
            userResult.imageURL = user.imageURL;
            userResult.email = user.email;
            userResult.isAdmin = user.isAdmin;
            userResult.uniqueId = user.uniqueId;
        }

        return userResult;
    }
}