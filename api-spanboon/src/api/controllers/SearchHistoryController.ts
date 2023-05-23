/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { JsonController, Res, Post, Body, Req, Param, QueryParam } from 'routing-controllers';
import { SearchHistoryService } from '../services/SearchHistoryService';
import { SearchHistoryRequest } from './requests/SearchHistoryRequest';
import { SearchHistory } from '../models/SearchHistory';
import { ObjectID } from 'mongodb';
import moment from 'moment';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { SEARCH_TYPE } from '../../constants/SearchType';
import { ClearSearchHistoryRequest } from './requests/ClearSearchHistoryRequest';
import { ObjectUtil } from '../../utils/Utils';
import { SearchFilter } from './requests/SearchFilterRequest';
import { PageService } from '../services/PageService';
import { UserService } from '../services/UserService';
import { Page } from '../models/Page';
import { User } from '../models/User';
import { UserEngagement } from '../models/UserEngagement';
import { ENGAGEMENT_ACTION } from '../../constants/UserEngagementAction';
import { UserEngagementService } from '../services/UserEngagementService';

@JsonController('/history')
export class SearchHistoryController {
    constructor(
        private searchHistoryService: SearchHistoryService,
        private pageService: PageService,
        private userService: UserService,
        private userEngagementService: UserEngagementService
    ) { }

    /**
     * @api {post} /api/history Create Search History API
     * @apiGroup SearchHistory
     * @apiParam (Request body) {String} userId userId
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {String} resultId resultId
     * @apiParam (Request body) {String} resultType resultType
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "status": "1",
     *    "message": "Create History Success",
     *    "data":{
     *      "userId" : "",
     *      "ip": "",
     *      "keyword": "",
     *      "resultId": "",
     *      "resultType": "",
     *      "createdDate": "",
     *      "createdTime": "",
     *      "id" : ""
     *     }
     *  }
     * @apiSampleRequest /api/history
     * @apiErrorExample {json} Create History Failed
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/')
    public async createSearchHistory(@Body({ validate: true }) history: SearchHistoryRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const keyword = history.keyword;
        let resultId = history.resultId;
        let resultType = history.resultType;
        const userId = req.headers.userid;
        const clientId = req.headers['client-id'];
        const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
        let userObjId = null;

        if (userId !== null && userId !== undefined && userId !== '') {
            userObjId = new ObjectID(userId);
        }

        if (resultId === null || resultId === undefined || resultId === '') {
            resultId = keyword;
        } else {
            resultId = new ObjectID(resultId);
        }

        if (resultType === null || resultType === undefined || resultType === '') {
            resultType = SEARCH_TYPE.KEYWORD;
        } else {
            resultType = history.resultType;
        }

        const searchHistory = new SearchHistory();
        searchHistory.userId = userObjId;
        searchHistory.clientId = clientId;
        searchHistory.ip = ipAddress;
        searchHistory.keyword = keyword;
        searchHistory.resultId = resultId;
        searchHistory.resultType = resultType;
        searchHistory.createdDate = moment().toDate();
        searchHistory.createdTime = moment().toDate();

        const historyCreate: SearchHistory = await this.searchHistoryService.create(searchHistory);

        if (historyCreate) {
            const userEngagement = new UserEngagement();
            userEngagement.clientId = clientId;
            userEngagement.contentId = resultId;
            userEngagement.contentType = resultType;
            userEngagement.ip = ipAddress;
            userEngagement.userId = userObjId;
            userEngagement.action = ENGAGEMENT_ACTION.SEARCH;
            await this.userEngagementService.create(userEngagement);

            const successResponse = ResponseUtil.getSuccessResponse('Create History Success', historyCreate);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Create History Failed', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/history/clear ClearAll Search History API
     * @apiGroup SearchHistory
     * @apiParam (Request body) {String} userId userId
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "status": "1",
     *    "message": "Clear All History Success",
     *    "data":{
     *      "userId" : "",
     *      "ip": "",
     *      "keyword": "",
     *      "resultId": "",
     *      "resultType": "",
     *      "createdDate": "",
     *      "createdTime": "",
     *      "id" : ""
     *     }
     *  }
     * @apiSampleRequest /api/history/clear
     * @apiErrorExample {json} Clear All History Failed
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/clear')
    public async clearAllHistory(@Body({ validate: true }) history: ClearSearchHistoryRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const historyUserId = history.userId;
        const historyClientId = req.headers['client-id'];
        const historyQuery = [];
        let userObjId = null;
        let userIdStmt = {};
        let clientIdStmt = {};

        if (historyUserId !== null && historyUserId !== undefined && historyUserId !== '') {
            userObjId = new ObjectID(historyUserId);
            userIdStmt = { userId: userObjId };
        }

        if (historyClientId !== null && historyClientId !== undefined && historyClientId !== '') {
            clientIdStmt = { clientId: historyClientId };
        }

        if (!ObjectUtil.isObjectEmpty(userIdStmt)) {
            historyQuery.push(userIdStmt);
        }

        if (!ObjectUtil.isObjectEmpty(clientIdStmt)) {
            historyQuery.push(clientIdStmt);
        }

        const historyList: SearchHistory[] = await this.searchHistoryService.find({ where: { $and: historyQuery } });

        if (historyList) {
            let historyClear;
            const historyCleared = [];

            for (const searchHistory of historyList) {
                historyClear = await this.searchHistoryService.delete(searchHistory);

                if (historyClear) {
                    historyCleared.push(historyClear);
                }
            }

            if (historyCleared.length > 0) {
                const successResponse = ResponseUtil.getSuccessResponse('Clear All History Success', []);
                return res.status(200).send(successResponse);
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Clear All History Failed', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('History Not Found', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/history/:id/clear Clear Search History By Id API
     * @apiGroup SearchHistory
     * @apiParam (Request body) {String} userId userId
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "status": "1",
     *    "message": "Clear History Success",
     *    "data":{
     *      "userId" : "",
     *      "ip": "",
     *      "keyword": "",
     *      "resultId": "",
     *      "resultType": "",
     *      "createdDate": "",
     *      "createdTime": "",
     *      "id" : ""
     *     }
     *  }
     * @apiSampleRequest /api/history/:id/clear
     * @apiErrorExample {json} Clear History Failed
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:id/clear')
    public async clearHistoryById(@QueryParam('isClearAll') isClearAll: boolean, @Param('id') historyId: string, @Body({ validate: true }) history: ClearSearchHistoryRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const historyUserId = history.userId;
        const clientId = req.headers['client-id'];
        const keywordList = [];
        const historyCleared = [];
        let userObjId = null;
        let historyObjId = null;
        let historyIdStmt = {};
        let isHistoryClear = isClearAll;

        if (isClearAll === null && isClearAll === undefined) {
            isHistoryClear = true;
        }

        if (historyId !== null && historyId !== undefined && historyId !== '') {
            historyObjId = new ObjectID(historyId);

            if (historyUserId !== null && historyUserId !== undefined && historyUserId !== '') {
                userObjId = new ObjectID(historyUserId);
                historyIdStmt = { _id: historyObjId, userId: userObjId };
            } else {
                historyIdStmt = { _id: historyObjId, userId: null, clientId };
            }
        }
        const historyList: SearchHistory[] = await this.searchHistoryService.find({ where: historyIdStmt });
        if (historyList !== null && historyList !== undefined && historyList.length > 0) {
            let historyClear;
            for (const searchHistory of historyList) {
                if (isHistoryClear) {
                    keywordList.push(searchHistory.keyword);
                } else {
                    historyClear = await this.searchHistoryService.delete({_id:searchHistory.id});
                    if (historyClear) {
                        historyCleared.push(historyClear);
                    }
                }
            }
            
            const historyByKWLists: SearchHistory[] = await this.searchHistoryService.find({ where: { keyword: { $in: keywordList } } });
            if (historyByKWLists !== null && historyByKWLists !== undefined && historyByKWLists.length > 0) {
                for (const kwHistory of historyByKWLists) {
                    historyClear = await this.searchHistoryService.delete(kwHistory);

                    if (historyClear) {
                        historyCleared.push(historyClear);
                    }
                }
            } 
 
            if (historyCleared !== null && historyCleared !== undefined && historyCleared.length > 0) {
                const successResponse = ResponseUtil.getSuccessResponse('Clear History Success', []);
                return res.status(200).send(successResponse);
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Clear History Failed', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('History Not Found', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Search History
    /**
     * @api {post} /api/history/search Search History API
     * @apiGroup Page
     * @apiParam (Request body) {number} limit limit
     * @apiParam (Request body) {number} offset offset
     * @apiParam (Request body) {String} select select
     * @apiParam (Request body) {String} relation relation
     * @apiParam (Request body) {String} whereConditions whereConditions
     * @apiParam (Request body) {boolean} count count (0=false, 1=true)
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully Search History",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/history/search
     * @apiErrorExample {json} History Not Found
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/search')
    public async searchHistory(@Body({ validate: true }) filter: SearchFilter, @Res() res: any, @Req() req: any): Promise<any> {
        if (ObjectUtil.isObjectEmpty(filter)) {
            return res.status(200).send([]);
        }

        let historyLists: SearchHistory[];

        if (filter.whereConditions !== null && filter.whereConditions !== undefined) {
            const ceId = req.headers['client-id'];
            const type = filter.whereConditions.type;
            const uId = filter.whereConditions.userId;
            let userObjId;
            let limit = filter.limit;
            let searchStmt = {};

            if (type !== '' && type !== undefined && type !== null) {
                if (uId !== '' && uId !== null && uId !== undefined) {
                    userObjId = new ObjectID(uId);
                    searchStmt = { resultType: { $in: type }, userId: userObjId };
                } else {
                    searchStmt = { resultType: { $in: type }, clientId: ceId, userId: null };
                }

                if (limit === 0 || (limit === null && limit === undefined)) {
                    limit = 10;
                }

                historyLists = await this.searchHistoryService.aggregate([
                    { $match: searchStmt },
                    { $sort: { createdDate: -1 } },
                    { $limit: limit },
                    { $group: { _id: '$keyword', result: { $first: '$$ROOT' } } },
                    { $sort: { 'result.createdDate': -1 } },
                    { $replaceRoot: { newRoot: '$result' } }
                ]);
            }
        } else {
            filter.whereConditions = {};
        }

        if (historyLists !== null && historyLists !== undefined && historyLists.length > 0) {
            const result = [];
            let page: Page;
            let user: User;
            let value = {};

            for (const history of historyLists) {
                const resultType = history.resultType;
                const resultId = history.resultId;
                let pageStmt;
                let userStmt;
                let resultObjId;

                try {
                    resultObjId = new ObjectID(resultId);
                    pageStmt = { _id: resultObjId, banned: false };
                    userStmt = { _id: resultObjId };
                } catch (ex) {
                    pageStmt = { pageUsername: resultId, banned: false };
                    userStmt = { $or: [{ firstName: resultId }, { lastName: resultId }, { displayName: resultId }, { uniqueId: resultId }] };
                } finally {
                    if (resultObjId === undefined || resultObjId === 'undefined') {
                        resultObjId = null;
                    }

                    pageStmt = { $or: [{ _id: resultObjId }, { name: resultId }, { pageUsername: resultId }, { uniqueId: resultId }], banned: false };
                    userStmt = { $or: [{ _id: resultObjId }, { firstName: resultId }, { lastName: resultId }, { displayName: resultId }, { uniqueId: resultId }] };
                }

                if (resultType === SEARCH_TYPE.PAGE) {
                    page = await this.pageService.findOne(pageStmt, { signURL: true });

                    const imageURL = page ? (page.imageURL ? page.imageURL : '') : '';
                    const signURL = page ? (page['signURL'] ? page['signURL'] : '') : '';
                    const pageUsername = page ? (page.pageUsername ? page.pageUsername : '') : '';
                    const isOfficial = page ? (page.isOfficial ? page.isOfficial : false) : false;

                    value = { value: resultId, label: history.keyword, imageURL, signURL, pageUsername, type: history.resultType, createdDate: history.createdDate, isOfficial };
                }

                if (resultType === SEARCH_TYPE.USER) {
                    user = await this.userService.findOne(userStmt, { signURL: true });
                    const imageURL = user ? (user.imageURL ? user.imageURL : '') : '';
                    const signURL = page ? (user['signURL'] ? user['signURL'] : '') : '';
                    const uniqueId = user ? (user.uniqueId ? user.uniqueId : '') : '';

                    value = { value: resultId, label: history.keyword, imageURL, signURL, uniqueId, type: history.resultType, createdDate: history.createdDate };
                }

                if (resultType === SEARCH_TYPE.KEYWORD) {
                    value = { value: resultId, label: history.keyword, type: history.resultType, createdDate: history.createdDate };
                }

                result.push(value);
            }

            const successResponse = ResponseUtil.getSuccessResponse('Successfully Search History', result);
            return res.status(200).send(successResponse);
        } else {
            const successResponse = ResponseUtil.getSuccessResponse('History Not Found', []);
            return res.status(200).send(successResponse);
        }
    }
}
