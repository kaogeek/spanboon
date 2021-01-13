/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { Authorized, Body, Delete, Get, JsonController, Param, Params, Post, Put, QueryParam, QueryParams, Req, Res } from 'routing-controllers';
import { ObjectID } from 'mongodb';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { Posts } from '../models/Posts';
import { Page } from '../models/Page';
import { User } from '../models/User';
import { Asset } from '../models/Asset';
import { HashTag } from '../models/HashTag';
import { PostsGallery } from '../models/PostsGallery';
import { UserEngagement } from '../models/UserEngagement';
import { Fulfillment } from '../models/Fulfillment';
import { FulfillmentCaseService } from '../services/FulfillmentCaseService';
import { PostsService } from '../services/PostsService';
import { CreateFulfillmentCaseRequest } from './requests/CreateFulfillmentCaseRequest';
import { FulfillmentCase } from '../models/FulfillmentCase';
import { POST_TYPE } from '../../constants/PostType';
import { FULFILLMENT_STATUS } from '../../constants/FulfillmentStatus';
import { FulfillmentRequest } from '../models/FulfillmentRequest';
import { FulfillmentRequestService } from '../services/FulfillmentRequestService';
import { ChatRoom } from '../models/ChatRoom';
import { ChatRoomService } from '../services/ChatRoomService';
import { CHAT_ROOM_TYPE, SENDER_TYPE } from '../../constants/ChatRoomType';
import { ChatMessage } from '../models/ChatMessage';
import { ChatMessageService } from '../services/ChatMessageService';
import { FulfillmentCaseParam } from './params/FulfillmentCaseParam';
import { PageAccessLevelService } from '../services/PageAccessLevelService';
import { PageAccessLevel } from '../models/PageAccessLevel';
import { PAGE_ACCESS_LEVEL } from '../../constants/PageAccessLevel';
import { FulfillmentListResponse } from './responses/FulfillmentListResponse';
import { GetFulfillmentCaseResponse } from './responses/GetFulfillmentCaseResponse';
import { GetFulfillmentRequestResponse } from './responses/GetFulfillmentRequestResponse';
import { DeleteFulfillmentRequestParam } from './params/DeleteFulfillmentRequestParam';
import { CreateFulfillmentFromCaseRequest } from './requests/CreateFulfillmentFromCaseRequest';
import { EditFulfillmentReqFromCaseParam } from './params/EditFulfillmentReqFromCaseParam';
import { EditFulfillmentReqFromCaseRequest } from './requests/EditFulfillmentReqFromCaseRequest';
import { FulfillmentCaseGroupResponse } from './responses/FulfillmentCaseGroupResponse';
import moment from 'moment';
import { FULFILL_ORDER_BY, FULFILL_GROUP } from '../../constants/FulfillSort';
import { CHAT_MESSAGE_TYPE } from '../../constants/ChatMessageTypes';
import { PagePostRequest } from './requests/PagePostsRequest';
import { ASSET_PATH, ASSET_SCOPE } from '../../constants/AssetScope';
import { ENGAGEMENT_CONTENT_TYPE, ENGAGEMENT_ACTION } from '../../constants/UserEngagementAction';
import { NOTIFICATION_TYPE, USER_TYPE } from '../../constants/NotificationType';
import { PageService } from '../services/PageService';
import { UserService } from '../services/UserService';
import { AssetService } from '../services/AssetService';
import { HashTagService } from '../services/HashTagService';
import { UserEngagementService } from '../services/UserEngagementService';
import { PostsGalleryService } from '../services/PostsGalleryService';
import { NotificationService } from '../services/NotificationService';
import { FulfillmentService } from '../services/FulfillmentService';
import { NeedsService } from '../services/NeedsService';
import { FileUtil } from '../../utils/Utils';
import { InputFormatterUtils } from '../../utils/InputFormatterUtils';
import { StandardItem } from '../models/StandardItem';
import { StandardItemService } from '../services/StandardItemService';
import { CustomItem } from '../models/CustomItem';
import { CustomItemService } from '../services/CustomItemService';

@JsonController('/fulfillment_case')
export class FulfillmentController {

    private MAX_LIST_ROWS = 5;

    constructor(
        private pageAccessLevelService: PageAccessLevelService,
        private postsService: PostsService,
        private fulfillmentCaseService: FulfillmentCaseService,
        private fulfillmentRequestService: FulfillmentRequestService,
        private chatRoomService: ChatRoomService,
        private chatMessageService: ChatMessageService,
        private pageService: PageService,
        private userService: UserService,
        private assetService: AssetService,
        private hashTagService: HashTagService,
        private userEngagementService: UserEngagementService,
        private postGalleryService: PostsGalleryService,
        private notificationService: NotificationService,
        private fulfillmentService: FulfillmentService,
        private needsService: NeedsService,
        private stdItemService: StandardItemService,
        private customItemService: CustomItemService
    ) { }

    // Find Page API
    /**
     * @api {get} /api/fulfillment_case/list Find Main Page Data API
     * @apiGroup MainPage
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get Page"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/fulfillment_case/list
     * @apiErrorExample {json} Page error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/list')
    @Authorized('user')
    public async listFulfillmentCase(@QueryParams() params: FulfillmentCaseParam, @Res() res: any, @Req() req: any): Promise<any[]> {
        try {
            let aggregateStmt: any[] = [];
            const searchFulfillStmt: any[] = [];
            const userId = req.user.id;
            const userObjId = new ObjectID(userId);
            const orderBy = params.orderBy;
            const asPage = params.asPage;
            const status = params.status;
            let limit = params.limit;
            let offset = params.offset;
            // groupby filter
            let groupBy: any = FULFILL_GROUP.NONE; // group by page as default
            if (params.groupBy !== undefined && params.groupBy !== '') {
                groupBy = params.groupBy;
            }
            // filter
            let filterId: string;
            if (params.filterId !== undefined && params.filterId !== '') {
                filterId = params.filterId;
            }
            let filterType: string;
            if (params.filterType !== undefined && params.filterType !== '') {
                filterType = params.filterType;
            }

            if (asPage !== null && asPage !== undefined && asPage !== '') {
                const pageAccess: PageAccessLevel[] = await this.pageAccessLevelService.getUserAccessByPage(userId, asPage);

                let canAccessPage = false;

                if (pageAccess !== null && pageAccess !== undefined && pageAccess.length > 0) {
                    for (const access of pageAccess) {
                        if (access.level === PAGE_ACCESS_LEVEL.OWNER || access.level === PAGE_ACCESS_LEVEL.ADMIN) {
                            searchFulfillStmt.push({ $match: { pageId: new ObjectID(access.page) } });

                            canAccessPage = true;
                        }
                    }
                }

                if (!canAccessPage) {
                    return res.status(400).send(ResponseUtil.getErrorResponse('You Cannot Access As Page', undefined));
                }
            } else {
                searchFulfillStmt.push({ $match: { requester: userObjId, deleted: false } });
            }

            if (status !== null && status !== undefined && status !== '') {
                if (status === FULFILLMENT_STATUS.INPROGRESS) {
                    searchFulfillStmt.push({ $match: { $or: [{ $and: [{ fulfillmentPost: { $eq: null } }, { status: FULFILLMENT_STATUS.CONFIRM }] }, { status: FULFILLMENT_STATUS.INPROGRESS }] } });
                } else if (status === FULFILLMENT_STATUS.CONFIRM) {
                    searchFulfillStmt.push({ $match: { $or: [{ $and: [{ fulfillmentPost: { $ne: null } }, { status: FULFILLMENT_STATUS.CONFIRM }] }, { status: FULFILLMENT_STATUS.CANCEL }] } });
                }
            }

            if (!isNaN(offset)) {
                offset = Number(offset);
            }

            if (!isNaN(limit)) {
                limit = Number(limit);
            }

            if (offset !== null && offset !== undefined) {
                searchFulfillStmt.push({ $skip: offset });
            }

            if (limit === null || limit === undefined || limit === 0) {
                searchFulfillStmt.push({ $limit: this.MAX_LIST_ROWS });
            } else {
                searchFulfillStmt.push({ $limit: limit });
            }

            if (orderBy !== null && orderBy !== undefined && orderBy !== '') {
                if (orderBy === FULFILL_ORDER_BY.LASTEST) {
                    searchFulfillStmt.push({ $sort: { updateDate: -1 } });
                } else if (orderBy === FULFILL_ORDER_BY.DATE) {
                    searchFulfillStmt.push({ $sort: { createdDate: -1 } });
                } else if (orderBy === FULFILL_ORDER_BY.UPDATED_BY_PAGE) {
                    searchFulfillStmt.push({ $sort: { updatedByPageDate: -1 } });
                } else if (orderBy === FULFILL_ORDER_BY.UPDATED_BY_USER) {
                    searchFulfillStmt.push({ $sort: { updatedByUserDate: -1 } });
                }
            } else {
                searchFulfillStmt.push({ $sort: { updateDate: -1 } });
            }

            // manipulate an searchStmt 
            const matchStmtObj: any = searchFulfillStmt[0];
            if (matchStmtObj['$match'] !== undefined) {
                const matchRequester = matchStmtObj['$match'].requester;
                const matchPageId = matchStmtObj['$match'].pageId;

                if (filterType === FULFILL_GROUP.PAGE) {
                    if (matchPageId !== undefined && (matchPageId + '' !== filterId)) {
                        // page filter is not match with as page so return []
                        return res.status(200).send(ResponseUtil.getSuccessResponse('List FulfillmentCase Success', []));
                    }

                    matchStmtObj['$match'].pageId = new ObjectID(filterId);
                } else if (filterType === FULFILL_GROUP.USER) {
                    if (matchRequester !== undefined && (matchRequester + '' !== filterId)) {
                        // user filter is not match with requester so return []
                        return res.status(200).send(ResponseUtil.getSuccessResponse('List FulfillmentCase Success', []));
                    }

                    matchStmtObj['$match'].requester = new ObjectID(filterId);
                } else if (filterType === FULFILL_GROUP.POST) {
                    matchStmtObj['$match'].postId = new ObjectID(filterId);
                }
            } else {
                if (filterType === FULFILL_GROUP.PAGE) {
                    matchStmtObj['$match'].pageId = new ObjectID(filterId);
                } else if (filterType === FULFILL_GROUP.USER) {
                    matchStmtObj['$match'].requester = new ObjectID(filterId);
                } else if (filterType === FULFILL_GROUP.POST) {
                    matchStmtObj['$match'].postId = new ObjectID(filterId);
                }
            }

            const lookupStmt: any = [
                {
                    $lookup: {
                        from: 'FulfillmentRequest',
                        let: { caseId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$fulfillmentCase', '$$caseId'] },
                                            { $eq: ['$deleted', false] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: 'fulfillRequest'
                    }
                },
                {
                    $lookup: {
                        from: 'Page',
                        localField: 'pageId',
                        foreignField: '_id',
                        as: 'page'
                    }
                },
                {
                    $unwind: {
                        path: '$page',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'Posts',
                        localField: 'postId',
                        foreignField: '_id',
                        as: 'posts'
                    }
                },
                {
                    $unwind: {
                        path: '$posts',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        'posts.isDraft': 0, 'posts.hidden': 0, 'posts.userTags': 0, 'posts.coverImage': 0, 'posts.pinned': 0, 'posts.ownerUser': 0, 'posts.commentCount': 0,
                        'posts.repostCount': 0, 'posts.shareCount': 0, 'posts.likeCount': 0, 'posts.viewCount': 0, 'posts.startDateTime': 0,
                        'posts.story': 0, 'posts.postsHashTags': 0, 'posts.objective': 0, 'posts.emergencyEvent': 0, 'posts.referencePost': 0, 'posts.rootReferencePost': 0,
                        'posts.visibility': 0, 'posts.ranges': 0
                    }
                },
                {
                    $lookup: {
                        from: 'User',
                        localField: 'requester',
                        foreignField: '_id',
                        as: 'users'
                    }
                },
                {
                    $unwind: {
                        path: '$users',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        'users.username': 0, 'users.password': 0, 'users.email': 0, 'users.birthdate': 0, 'users.isAdmin': 0, 'users.gender': 0, 'users.customGender': 0,
                        'users.createdDate': 0, 'users.coverURL': 0
                    }
                },
                {
                    $lookup: {
                        from: 'ChatRoom',
                        localField: '_id',
                        foreignField: 'typeId',
                        as: 'chatRoom'
                    }
                },
                {
                    $unwind: {
                        path: '$chatRoom',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'ChatMessage',
                        let: { requester: '$requester', roomId: '$chatRoom._id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$room', '$$roomId'] },
                                            { $eq: ['$sender', '$$requester'] },
                                            { $eq: ['$deleted', false] }
                                        ]
                                    }
                                }
                            },
                            { $sort: { createdDate: -1 } }
                        ],
                        as: 'chats'
                    }
                }
            ];

            aggregateStmt = searchFulfillStmt.concat(lookupStmt);

            const fulfillCases: any[] = await this.fulfillmentCaseService.aggregate(aggregateStmt);

            if (fulfillCases !== null && fulfillCases !== null && fulfillCases.length > 0) {
                const fulfillmentCaseResult: FulfillmentListResponse[] = [];
                const fulfillPageResult: FulfillmentCaseGroupResponse[] = [];
                const fulfillUserResult: FulfillmentCaseGroupResponse[] = [];
                const fulfillPostResult: FulfillmentCaseGroupResponse[] = [];

                for (const fulfill of fulfillCases) {
                    const fulfilCaseResponse: FulfillmentListResponse = new FulfillmentListResponse();
                    const fulfillChat = fulfill.chats;

                    fulfilCaseResponse.fulfillCaseId = fulfill._id;
                    fulfilCaseResponse.description = fulfill.description;
                    fulfilCaseResponse.pageId = fulfill.page._id;
                    fulfilCaseResponse.pageUsername = fulfill.page.pageUsername;
                    fulfilCaseResponse.pageName = fulfill.page.name;
                    fulfilCaseResponse.pageImageURL = fulfill.page.imageURL;
                    fulfilCaseResponse.fulfillRequestCount = fulfill.fulfillRequest.length;
                    fulfilCaseResponse.title = fulfill.posts.title;
                    fulfilCaseResponse.postId = fulfill.postId;
                    fulfilCaseResponse.fulfillmentPost = fulfill.fulfillmentPost;
                    fulfilCaseResponse.postDate = fulfill.posts.createdDate;
                    fulfilCaseResponse.emergencyEvent = fulfill.posts.emergencyEventTag;
                    fulfilCaseResponse.objective = fulfill.posts.objectiveTag;
                    fulfilCaseResponse.userId = fulfill.users._id;
                    fulfilCaseResponse.uniqueId = fulfill.users.uniqueId;
                    fulfilCaseResponse.userImageURL = fulfill.users.imageURL;
                    fulfilCaseResponse.name = fulfill.users.displayName;
                    fulfilCaseResponse.status = fulfill.status;
                    fulfilCaseResponse.createdDate = fulfill.createdDate;
                    fulfilCaseResponse.updateDate = fulfill.updateDate;
                    fulfilCaseResponse.updatedByPageDate = fulfill.updatedByPageDate;
                    fulfilCaseResponse.updatedByUserDate = fulfill.updatedByUserDate;

                    if (fulfillChat !== null && fulfillChat !== undefined && fulfillChat.length > 0) {
                        fulfilCaseResponse.isRead = fulfill.chats[0].isRead;
                        fulfilCaseResponse.chatMessage = fulfill.chats[0].message;
                        fulfilCaseResponse.chatDate = fulfill.chats[0].createdDate;
                    } else {
                        fulfilCaseResponse.isRead = undefined;
                        fulfilCaseResponse.chatMessage = undefined;
                        fulfilCaseResponse.chatDate = undefined;
                    }

                    fulfillmentCaseResult.push(fulfilCaseResponse);

                    // Grouping
                    if (groupBy === FULFILL_GROUP.PAGE) {
                        const containsPageIdx = fulfillPageResult.map((val: any) => {
                            return val.groupId + '';
                        }).indexOf(fulfill.page._id + '');

                        if (containsPageIdx <= -1) {
                            const innerCase: FulfillmentCaseGroupResponse = new FulfillmentCaseGroupResponse();
                            innerCase.groupId = fulfill.page._id;
                            innerCase.groupName = fulfill.page.name;
                            innerCase.groupType = FULFILL_GROUP.PAGE;
                            innerCase.cases = [];
                            innerCase.cases.push(fulfilCaseResponse);

                            fulfillPageResult.push(innerCase);
                        } else {
                            fulfillPageResult[containsPageIdx].cases.push(fulfilCaseResponse);
                        }
                    } else if (groupBy === FULFILL_GROUP.USER) {
                        const containsPageIdx = fulfillUserResult.map((val: any) => {
                            return val.groupId + '';
                        }).indexOf(fulfill.users._id + '');

                        if (containsPageIdx <= -1) {
                            const innerCase: FulfillmentCaseGroupResponse = new FulfillmentCaseGroupResponse();
                            innerCase.groupId = fulfill.users._id;
                            innerCase.groupName = fulfill.users.displayName;
                            innerCase.groupType = FULFILL_GROUP.USER;
                            innerCase.cases = [];
                            innerCase.cases.push(fulfilCaseResponse);

                            fulfillUserResult.push(innerCase);
                        } else {
                            fulfillUserResult[containsPageIdx].cases.push(fulfilCaseResponse);
                        }
                    } else if (groupBy === FULFILL_GROUP.POST) {
                        const containsPageIdx = fulfillPostResult.map((val: any) => {
                            return val.groupId + '';
                        }).indexOf(fulfill.postId + '');

                        if (containsPageIdx <= -1) {
                            const innerCase: FulfillmentCaseGroupResponse = new FulfillmentCaseGroupResponse();
                            innerCase.groupId = fulfill.postId;
                            innerCase.groupName = fulfill.posts.title;
                            innerCase.groupType = FULFILL_GROUP.POST;
                            innerCase.cases = [];
                            innerCase.cases.push(fulfilCaseResponse);

                            fulfillPostResult.push(innerCase);
                        } else {
                            fulfillPostResult[containsPageIdx].cases.push(fulfilCaseResponse);
                        }
                    }
                }

                let finalResult = [];
                if (groupBy === FULFILL_GROUP.PAGE) {
                    finalResult = fulfillPageResult;
                } else if (groupBy === FULFILL_GROUP.USER) {
                    finalResult = fulfillUserResult;
                } else if (groupBy === FULFILL_GROUP.POST) {
                    finalResult = fulfillPostResult;
                } else {
                    // as none group
                    finalResult = fulfillmentCaseResult;
                }

                return res.status(200).send(ResponseUtil.getSuccessResponse('List FulfillmentCase Success', finalResult));
            } else {
                return res.status(200).send(ResponseUtil.getSuccessResponse('FulfillmentCase Not Found', []));
            }
        } catch (error) {
            return res.status(400).send(ResponseUtil.getErrorResponse('List FulfillmentCase Error', error.message));
        }
    }

    // Find Page API
    /**
     * @api {get} /api/fulfillment_case/post/:postId Find Main Page Data API
     * @apiGroup MainPage
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get Page"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/fulfillment_case/post/:postId
     * @apiErrorExample {json} Page error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/post/:postId')
    @Authorized('user')
    public async getFulfillmentCaseFromPost(@Param('postId') postId: string, @Res() res: any, @Req() req: any): Promise<any> {
        try {
            const userId = req.user.id;
            const userObjId = new ObjectID(userId);

            if (postId !== null && postId !== undefined && postId !== '') {
                const fulfillCase: FulfillmentCase[] = await this.fulfillmentCaseService.find({ postId: new ObjectID(postId), requester: userObjId, deleted: false });

                if (fulfillCase !== null && fulfillCase !== undefined && fulfillCase.length > 0) {
                    return res.status(200).send(ResponseUtil.getSuccessResponse('Get FulfillmentCase From Post Success', fulfillCase));
                } else {
                    return res.status(200).send(ResponseUtil.getSuccessResponse('FulfillmentCase Not Found', undefined));
                }
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('PostId Invalid', undefined));
            }
        } catch (error) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Get FulfillmentCase From Post Error', error.message));
        }
    }

    // Find Page API
    /**
     * @api {get} /api/fulfillment_case/list Find Main Page Data API
     * @apiGroup MainPage
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get Page"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/fulfillment_case/list
     * @apiErrorExample {json} Page error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:caseId')
    @Authorized('user')
    public async getFulfillmentCase(@QueryParams() params: FulfillmentCaseParam, @Param('caseId') caseId: string, @Res() res: any, @Req() req: any): Promise<any> {
        try {
            if (caseId !== null && caseId !== undefined && caseId !== '') {
                let aggregateStmt: any[] = [];
                const getFulfillStmt = [];
                const userId = req.user.id;
                const userObjId = new ObjectID(userId);
                const asPage = params.asPage;
                const caseObjId = new ObjectID(caseId);

                const checkFulfillCase: FulfillmentCase = await this.fulfillmentCaseService.findOne({ _id: caseObjId });

                if (checkFulfillCase !== null && checkFulfillCase !== undefined) {
                    if (asPage !== null && asPage !== undefined && asPage !== '') {
                        const pageAccess: PageAccessLevel[] = await this.pageAccessLevelService.getUserAccessByPage(userId, asPage);

                        let canAccessPage = false;

                        if (pageAccess !== null && pageAccess !== undefined && pageAccess.length > 0) {
                            for (const access of pageAccess) {
                                if (access.level === PAGE_ACCESS_LEVEL.OWNER || access.level === PAGE_ACCESS_LEVEL.ADMIN) {
                                    if (JSON.stringify(access.page) === JSON.stringify(asPage)) {
                                        getFulfillStmt.push({ $match: { _id: caseObjId, pageId: new ObjectID(access.page), deleted: false } });
                                        canAccessPage = true;
                                    }
                                }
                            }
                        }

                        if (!canAccessPage) {
                            return res.status(400).send(ResponseUtil.getErrorResponse('You Cannot Access As Page', undefined));
                        }
                    } else {
                        const requester = checkFulfillCase.requester;

                        if (JSON.stringify(requester) === JSON.stringify(userId)) {
                            getFulfillStmt.push({ $match: { _id: caseObjId, requester: userObjId, deleted: false } });
                        } else {
                            return res.status(400).send(ResponseUtil.getErrorResponse('You Not A Requester', undefined));
                        }
                    }

                    const lookupStmt = [
                        {
                            $lookup: {
                                from: 'Page',
                                localField: 'pageId',
                                foreignField: '_id',
                                as: 'page'
                            }
                        },
                        {
                            $unwind: {
                                path: '$page',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $lookup: {
                                from: 'ChatRoom',
                                localField: '_id',
                                foreignField: 'typeId',
                                as: 'chatRoom'
                            }
                        },
                        { $match: { 'chatRoom.type': CHAT_ROOM_TYPE.FULFILLMENT } },
                        {
                            $unwind: {
                                path: '$chatRoom',
                                preserveNullAndEmptyArrays: true
                            }
                        }
                    ];

                    aggregateStmt = getFulfillStmt.concat(lookupStmt);

                    // console.log('aggregateStmt >>>> ', JSON.stringify(aggregateStmt));

                    const fulfillCase: any[] = await this.fulfillmentCaseService.aggregate(aggregateStmt);
                    const fulfillResponse: GetFulfillmentCaseResponse = new GetFulfillmentCaseResponse();
                    let caseResult: any;
                    let chatRoomResult: any;
                    let chatMessageResult: any;

                    if (fulfillCase !== null && fulfillCase !== undefined && fulfillCase.length > 0) {
                        let chatRoomId;

                        for (const fulfill of fulfillCase) {
                            chatRoomId = fulfill.chatRoom._id;

                            caseResult = {
                                id: fulfill._id,
                                pageId: fulfill.pageId,
                                pageName: fulfill.page.name,
                                postId: fulfill.postId,
                                status: fulfill.status,
                                requester: fulfill.requester,
                                description: fulfill.description,
                                createdDate: fulfill.createdDate
                            };

                            chatRoomResult = {
                                id: fulfill.chatRoom._id,
                                typeId: fulfill.chatRoom.typeId,
                                type: fulfill.chatRoom.type,
                                createdDate: fulfill.chatRoom.createdDate
                            };

                            fulfillResponse.fulfillCase = caseResult;
                            fulfillResponse.chatRoom = chatRoomResult;
                        }

                        if (chatRoomId !== null && chatRoomId !== undefined && chatRoomId !== '') {
                            const chatMessages: any[] = await this.chatMessageService.aggregate([
                                { $match: { room: new ObjectID(chatRoomId), deleted: false } },
                                { $sort: { createdDate: -1 } },
                                {
                                    $lookup: {
                                        from: 'User',
                                        localField: 'sender',
                                        foreignField: '_id',
                                        as: 'user'
                                    }
                                },
                                {
                                    $unwind: {
                                        path: '$user',
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $lookup: {
                                        from: 'Page',
                                        localField: 'sender',
                                        foreignField: '_id',
                                        as: 'page'
                                    }
                                },
                                {
                                    $unwind: {
                                        path: '$page',
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                { $match: { $or: [{ senderType: SENDER_TYPE.USER }, { senderType: SENDER_TYPE.PAGE }] } }
                            ]);

                            const chatMessageList = [];

                            for (const chat of chatMessages) {
                                const pageSender = chat.page;
                                const userSender = chat.user;
                                const senderType = chat.senderType;
                                let sender;
                                let imageURL;

                                if (pageSender !== null && pageSender !== undefined) {
                                    if (senderType === SENDER_TYPE.PAGE) {
                                        sender = pageSender.name;
                                        imageURL = pageSender.imageURL;
                                    }
                                }

                                if (userSender !== null && userSender !== undefined) {
                                    if (senderType === SENDER_TYPE.USER) {
                                        sender = userSender.displayName;
                                        imageURL = userSender.imageURL;
                                    }
                                }

                                chatMessageResult = {
                                    id: chat._id,
                                    sender,
                                    senderType,
                                    imageURL,
                                    message: chat.message,
                                    room: chat.room,
                                    fileId: chat.fileId,
                                    filePath: chat.filePath,
                                    videoURL: chat.videoURL,
                                    deleted: chat.deleted,
                                    createdDate: chat.createdDate
                                };

                                chatMessageList.push(chatMessageResult);

                                fulfillResponse.chatMessages = chatMessageList;
                            }
                        }

                        return res.status(200).send(ResponseUtil.getSuccessResponse('Get FulfillmentCase Success', fulfillResponse));
                    } else {
                        return res.status(400).send(ResponseUtil.getErrorResponse('Get FulfillmentCase Failed', undefined));
                    }
                } else {
                    return res.status(200).send(ResponseUtil.getSuccessResponse('FulfillmentCase Not Found', []));
                }
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Get FulfillmentCase', undefined));
            }
        } catch (error) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Get FulfillmentCase Error', error.message));
        }
    }

    // Find Page API
    /**
     * @api {get} /api/fulfillment_case/list Find Main Page Data API
     * @apiGroup MainPage
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get Page"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/fulfillment_case/list
     * @apiErrorExample {json} Page error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:caseId/request')
    @Authorized('user')
    public async getFulfillmentRequest(@QueryParams() params: FulfillmentCaseParam, @Param('caseId') caseId: string, @Res() res: any, @Req() req: any): Promise<any> {
        try {
            if (caseId !== null && caseId !== undefined && caseId !== '') {
                let aggregateStmt: any[] = [];
                const getFulfillStmt = [];
                const userId = req.user.id;
                const asPage = params.asPage;
                const caseObjId = new ObjectID(caseId);

                const checkFulfillCase: FulfillmentCase = await this.fulfillmentCaseService.findOne({ _id: caseObjId, deleted: false });

                if (checkFulfillCase !== null && checkFulfillCase !== undefined) {
                    if (asPage !== null && asPage !== undefined && asPage !== '') {
                        const pageAccess: PageAccessLevel[] = await this.pageAccessLevelService.getUserAccessByPage(userId, asPage);

                        let canAccessPage = false;

                        if (pageAccess !== null && pageAccess !== undefined && pageAccess.length > 0) {
                            for (const access of pageAccess) {
                                if (access.level === PAGE_ACCESS_LEVEL.OWNER || access.level === PAGE_ACCESS_LEVEL.ADMIN) {
                                    if (JSON.stringify(access.page) === JSON.stringify(asPage)) {
                                        getFulfillStmt.push({ $match: { fulfillmentCase: caseObjId, deleted: false } });
                                        canAccessPage = true;
                                    }
                                }
                            }
                        }

                        if (!canAccessPage) {
                            return res.status(400).send(ResponseUtil.getErrorResponse('You Cannot Access As Page', undefined));
                        }
                    } else {
                        const requester = checkFulfillCase.requester;

                        if (JSON.stringify(requester) === JSON.stringify(userId)) {
                            getFulfillStmt.push({ $match: { fulfillmentCase: caseObjId, deleted: false } });
                        } else {
                            return res.status(400).send(ResponseUtil.getErrorResponse('You Not A Requester', undefined));
                        }
                    }

                    const lookupStmt = [
                        {
                            $lookup: {
                                from: 'Needs',
                                localField: 'needsId',
                                foreignField: '_id',
                                as: 'needs'
                            }
                        },
                        {
                            $unwind: {
                                path: '$needs',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $lookup: {
                                from: 'StandardItem',
                                localField: 'needs.standardItemId',
                                foreignField: '_id',
                                as: 'stdItems'
                            }
                        },
                        {
                            $unwind: {
                                path: '$stdItems',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $lookup: {
                                from: 'CustomItem',
                                localField: 'needs.customItemId',
                                foreignField: '_id',
                                as: 'customItems'
                            }
                        },
                        {
                            $unwind: {
                                path: '$customItems',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        { $addFields: { imageURL: '$stdItems.imageURL', name: '$needs.name', unit: '$needs.unit' } },
                        { $project: { stdItems: 0, customItems: 0 } }
                    ];

                    aggregateStmt = getFulfillStmt.concat(lookupStmt);

                    // console.log('aggregateStmt >>>> ', JSON.stringify(aggregateStmt));

                    const fulfillRequest: any[] = await this.fulfillmentRequestService.aggregate(aggregateStmt);

                    if (fulfillRequest !== null && fulfillRequest !== undefined && fulfillRequest.length > 0) {
                        const fulfillRequestResponseResult: GetFulfillmentRequestResponse[] = [];

                        for (const fulfill of fulfillRequest) {
                            const fulfillRequestResponse: GetFulfillmentRequestResponse = this.createFulfillmentRequestResponse(fulfill);

                            fulfillRequestResponseResult.push(fulfillRequestResponse);
                        }

                        return res.status(200).send(ResponseUtil.getSuccessResponse('Get FulfillmentRequest Success', fulfillRequestResponseResult));
                    } else {
                        return res.status(200).send(ResponseUtil.getSuccessResponse('FulfillmentRequest Not Found', []));
                    }
                } else {
                    return res.status(200).send(ResponseUtil.getSuccessResponse('FulfillmentCase Not Found', []));
                }
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Search FulfillmentRequest', undefined));
            }
        } catch (error) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Get FulfillmentRequest Error', error.message));
        }
    }

    // Create Fulfullment Case API
    /**
     * @api {post} /api/fulfillment_case Create FulfillmentCase API
     * @apiGroup Fulfillment Case
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Create FulfillmentCase Success",
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/fulfillment_case
     * @apiErrorExample {json} Create FulfillmentCase Failed
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/')
    @Authorized('user')
    public async createFulfillmentCase(@Body({ validate: true }) data: CreateFulfillmentCaseRequest, @Res() res: any, @Req() req: any): Promise<any> {
        try {
            const postId = data.postId;
            const pageId = data.pageId;
            const needs = data.needs;
            const items = data.items;
            const requester = data.requester;
            const userObjId = new ObjectID(req.user.id);
            const username = req.user.username;
            const today = moment().toDate();
            const stdItemIdList: ObjectID[] = [];
            const customItemIdList: ObjectID[] = [];
            const stdItemMap: any = {};
            const customItemMap: any = {};
            let fulfillCaseCreate: FulfillmentCase = null || undefined;
            let postsObjId: ObjectID = null;
            let pageObjId: ObjectID = null;
            let requesterObjId: ObjectID = null;

            if (requester !== null && requester !== undefined && requester !== '') {
                requesterObjId = new ObjectID(requester);

                if ((postId !== null && postId !== undefined && postId !== '') && (pageId === null || pageId === undefined || pageId === '')) {
                    // POST mode
                    postsObjId = new ObjectID(postId);

                    const posts: Posts = await this.postsService.findOne({ _id: new ObjectID(postId), type: POST_TYPE.NEEDS });

                    if (posts !== null && posts !== undefined) {
                        pageObjId = new ObjectID(posts.pageId);

                        // check needs
                        if (data.needs === undefined || data.needs.length <= 0) {
                            return res.status(400).send(ResponseUtil.getErrorResponse('Posts Case require needs.', undefined));
                        }

                        fulfillCaseCreate = await this.createNewFulfillmentCase(pageObjId, postsObjId, requesterObjId, userObjId, username, today);

                        /* // open if you want to check is case is exist
                        const fulfillCaseExists: FulfillmentCase = await this.fulfillmentCaseService.findOne({ pageId: pageObjId, postId: postsObjId, requester: requesterObjId });

                        if (fulfillCaseExists !== null && fulfillCaseExists !== undefined) {
                            return res.status(200).send(ResponseUtil.getSuccessResponse('FulfillmentCase Exists', fulfillCaseExists));
                        }
                        */
                    } else {
                        return res.status(200).send(ResponseUtil.getSuccessResponse('FulfillmentCase Allow Only Posts needs', undefined));
                    }
                } else {
                    // PAGE MODE implement as a case with no Post.
                    // return res.status(400).send(ResponseUtil.getErrorResponse('PostsId Required', undefined));
                    pageObjId = new ObjectID(pageId);

                    const page = await this.pageService.findOne({ _id: pageObjId, banned: false });

                    if (!page) {
                        return res.status(400).send(ResponseUtil.getErrorResponse('Page was not found.', undefined));
                    }

                    if (data.items === undefined || data.items.length <= 0) {
                        return res.status(400).send(ResponseUtil.getErrorResponse('Page Case require items.', undefined));
                    }

                    for (const item of items) {
                        const stdItemId = item.standardItemId;
                        const customItemId = item.customItemId;
                        const quantity = item.quantity;

                        if (stdItemId !== null && stdItemId !== undefined && stdItemId !== '') {
                            const stdItem = await this.stdItemService.findOne({ _id: new ObjectID(stdItemId) });
                            if (!stdItem) {
                                return res.status(400).send(ResponseUtil.getErrorResponse('standardItemId was not found.', undefined));
                            }
                            stdItemMap[stdItemId] = { quantity };
                            stdItemIdList.push(new ObjectID(stdItemId));
                        } else if (customItemId !== null && customItemId !== undefined && customItemId !== '') {
                            const customItem: CustomItem = await this.customItemService.findOne({ _id: new ObjectID(customItemId) });
                            if (!customItem) {
                                return res.status(400).send(ResponseUtil.getErrorResponse('customItemId was not found.', undefined));
                            }

                            customItemMap[customItemId] = { quantity };
                            customItemIdList.push(new ObjectID(customItemId));
                        } else {
                            return res.status(400).send(ResponseUtil.getErrorResponse('standardItemId or customItemId is Required.', undefined));
                        }
                    }

                    fulfillCaseCreate = await this.createNewFulfillmentCase(pageObjId, postsObjId, requesterObjId, userObjId, username, today);
                }
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Requester Required', undefined));
            }

            if (fulfillCaseCreate !== null && fulfillCaseCreate !== undefined) {
                const fulfillCaseObjId = new ObjectID(fulfillCaseCreate.id);
                const participants = [{ sender: requesterObjId, senderType: CHAT_ROOM_TYPE.USER }, { sender: pageObjId, senderType: CHAT_ROOM_TYPE.PAGE }];

                const chatRoom: ChatRoom = new ChatRoom();
                chatRoom.typeId = fulfillCaseObjId;
                chatRoom.type = CHAT_ROOM_TYPE.FULFILLMENT;
                chatRoom.participants = participants;
                chatRoom.createdBy = userObjId;
                chatRoom.createdByUsername = username;
                chatRoom.updateByUsername = username;
                chatRoom.updateDate = today;
                chatRoom.deleted = false;

                /* Create Chat */
                const createdChatroom = await this.chatRoomService.create(chatRoom);
                const chatRoomObjId = createdChatroom.id;
                const requesterObj = await this.userService.findOne({ _id: requesterObjId });
                if (chatRoomObjId) {
                    let chatmsg = 'การเติมเติมถูกเสนอเข้าโพสต์';
                    const chatMsg = new ChatMessage();
                    chatMsg.sender = requesterObj.id;
                    chatMsg.senderType = USER_TYPE.USER;
                    // user mode
                    if (requesterObj !== undefined) {
                        chatmsg = requesterObj.displayName + ' เสนอรายการเติมเต็มเข้าโพสต์';
                    }
                    chatMsg.message = chatmsg;
                    chatMsg.messageType = CHAT_MESSAGE_TYPE.FULFILLMENT_CASE_CREATE;
                    chatMsg.room = chatRoomObjId;

                    await this.chatMessageService.createChatMessage(chatMsg);
                }
                /* end Create Chat*/

                let fulfillRequest: FulfillmentRequest = undefined;

                if (postsObjId !== null && postsObjId !== undefined) {
                    if (needs !== null && needs !== undefined && needs.length > 0) {
                        for (const need of needs) {
                            const reqNeeds = await this.needsService.findOne({ _id: new ObjectID(need.id) });
                            if (!reqNeeds) {
                                continue;
                            }

                            fulfillRequest = new FulfillmentRequest();
                            fulfillRequest.needsId = new ObjectID(need.id);
                            fulfillRequest.quantity = need.quantity;
                            fulfillRequest.fulfillmentCase = fulfillCaseObjId;
                            fulfillRequest.createdBy = userObjId;
                            fulfillRequest.createdByUsername = username;
                            fulfillRequest.updateByUsername = username;
                            fulfillRequest.updateDate = today;
                            fulfillRequest.deleted = false;
                            if (reqNeeds.standardItemId !== undefined) {
                                fulfillRequest.standardItemId = reqNeeds.standardItemId;
                            }
                            if (reqNeeds.customItemId !== undefined) {
                                fulfillRequest.customItemId = reqNeeds.customItemId;
                            }

                            await this.fulfillmentRequestService.create(fulfillRequest);

                            /* Create Chat */
                            {
                                let chatMessage = 'เพิ่มรายการสำหรับเติมเต็มสำเร็จ';
                                chatMessage = 'เพิ่มรายการ ' + reqNeeds.name + ' ' + InputFormatterUtils.formatCurrencyNumber(need.quantity, 0, 2) + ' ' + reqNeeds.unit;
                                const chatMsg = new ChatMessage();
                                chatMsg.sender = requesterObj.id;
                                chatMsg.senderType = USER_TYPE.USER;
                                chatMsg.message = chatMessage;
                                chatMsg.messageType = CHAT_MESSAGE_TYPE.FULFILLMENT_REQUEST_CREATE;
                                chatMsg.room = chatRoomObjId;

                                await this.chatMessageService.createChatMessage(chatMsg);
                            }
                            /* end Create Chat*/
                        }
                    }
                } else {
                    if (items !== null && items !== undefined && items.length > 0) {
                        if (stdItemIdList !== null && stdItemIdList !== undefined && stdItemIdList.length > 0) {
                            const stdItemList: StandardItem[] = await this.stdItemService.find({ _id: { $in: stdItemIdList } });

                            if (stdItemList !== null && stdItemList !== undefined && stdItemList.length > 0) {
                                for (const stdItem of stdItemList) {
                                    const stdItemId = stdItem.id;
                                    const stdItemData = stdItemMap[stdItemId];

                                    if (stdItemData !== null && stdItemData !== undefined) {
                                        fulfillRequest = new FulfillmentRequest();
                                        fulfillRequest.fulfillmentCase = new ObjectID(fulfillCaseCreate.id);
                                        fulfillRequest.standardItemId = new ObjectID(stdItemId);
                                        fulfillRequest.quantity = stdItemData.quantity;
                                        fulfillRequest.deleted = false;

                                        await this.fulfillmentRequestService.create(fulfillRequest);

                                        /* Create Chat */
                                        {
                                            let chatMessage = 'เพิ่มรายการสำหรับเติมเต็มสำเร็จ';
                                            chatMessage = 'เพิ่มรายการ ' + stdItem.name + ' ' + InputFormatterUtils.formatCurrencyNumber(stdItemData.quantity, 0, 2) + ' ' + stdItem.unit;
                                            const chatMsg = new ChatMessage();
                                            chatMsg.sender = requesterObj.id;
                                            chatMsg.senderType = USER_TYPE.USER;
                                            chatMsg.message = chatMessage;
                                            chatMsg.messageType = CHAT_MESSAGE_TYPE.FULFILLMENT_REQUEST_CREATE;
                                            chatMsg.room = chatRoomObjId;

                                            await this.chatMessageService.createChatMessage(chatMsg);
                                        }
                                        /* end Create Chat*/
                                    }
                                }
                            }
                        } else if (customItemIdList !== null && customItemIdList !== undefined && customItemIdList.length > 0) {
                            const customItemList: CustomItem[] = await this.stdItemService.find({ _id: { $in: customItemIdList } });

                            if (customItemList !== null && customItemList !== undefined && customItemList.length > 0) {
                                for (const customItem of customItemList) {
                                    const customItemId = customItem.id;
                                    const customItemData = customItemMap[customItemId];

                                    if (customItemData !== null && customItemData !== undefined) {
                                        fulfillRequest = new FulfillmentRequest();
                                        fulfillRequest.fulfillmentCase = new ObjectID(fulfillCaseCreate.id);
                                        fulfillRequest.customItemId = new ObjectID(customItemId);
                                        fulfillRequest.quantity = customItemData.quantity;
                                        fulfillRequest.deleted = false;

                                        await this.fulfillmentRequestService.create(fulfillRequest);

                                        /* Create Chat */
                                        {
                                            let chatMessage = 'เพิ่มรายการสำหรับเติมเต็มสำเร็จ';
                                            chatMessage = 'เพิ่มรายการ ' + customItem.name + ' ' + InputFormatterUtils.formatCurrencyNumber(customItemData.quantity, 0, 2) + ' ' + customItem.unit;
                                            const chatMsg = new ChatMessage();
                                            chatMsg.sender = requesterObj.id;
                                            chatMsg.senderType = USER_TYPE.USER;
                                            chatMsg.message = chatMessage;
                                            chatMsg.messageType = CHAT_MESSAGE_TYPE.FULFILLMENT_REQUEST_CREATE;
                                            chatMsg.room = chatRoomObjId;

                                            await this.chatMessageService.createChatMessage(chatMsg);
                                        }
                                        /* end Create Chat*/
                                    }
                                }
                            }
                        }
                    }
                }

                return res.status(200).send(ResponseUtil.getSuccessResponse('Create FulfillmentCase Success', fulfillCaseCreate));
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Create FulfillmentCase Failed', undefined));
            }
        } catch (error) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Create FulfillmentCase Error', error.message));
        }
    }

    /**
     * @api {post} /api/fulfillment_case/:caseId/cancel Cancel FulfillmentCase API
     * @apiGroup Fulfillment Case
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Cancel FulfillmentCase Success",
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/fulfillment_case/:caseId/cancel
     * @apiErrorExample {json} Cancel FulfillmentCase Failed
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:caseId/cancel')
    @Authorized('user')
    public async cancelFulfillmentCase(@QueryParam('asPage') asPage: string, @Param('caseId') caseId: string, @Res() res: any, @Req() req: any): Promise<any> {
        try {
            const userId = req.user.id;

            if (caseId !== null && caseId !== undefined && caseId !== '') {
                const caseObjId = new ObjectID(caseId);
                const fulfillCase: FulfillmentCase = await this.fulfillmentCaseService.findOne({ _id: caseObjId, deleted: false });

                if (fulfillCase !== null && fulfillCase !== undefined) {
                    const fulfillCaseStatus = fulfillCase.status;
                    let canChangeStatus = false;

                    if (asPage !== null && asPage !== undefined && asPage !== '') {
                        const pageAccess: PageAccessLevel[] = await this.pageAccessLevelService.getUserAccessByPage(userId, asPage);

                        let canAccessPage = false;

                        if (pageAccess !== null && pageAccess !== undefined && pageAccess.length > 0) {
                            for (const access of pageAccess) {
                                if (access.level === PAGE_ACCESS_LEVEL.ADMIN || access.level === PAGE_ACCESS_LEVEL.OWNER) {
                                    if (JSON.stringify(access.page) === JSON.stringify(asPage)) {
                                        canChangeStatus = true;
                                        canAccessPage = true;
                                    }
                                }
                            }
                        }

                        if (!canAccessPage) {
                            return res.status(400).send(ResponseUtil.getErrorResponse('You Cannot Access As Page', undefined));
                        }
                    } else {
                        const requester = fulfillCase.requester;

                        if (JSON.stringify(requester) !== JSON.stringify(userId)) {
                            return res.status(400).send(ResponseUtil.getErrorResponse('You Not A Requester', undefined));
                        } else {
                            canChangeStatus = true;
                        }
                    }

                    if (fulfillCaseStatus === FULFILLMENT_STATUS.INPROGRESS) {
                        if (canChangeStatus) {
                            const setObj: any = { status: FULFILLMENT_STATUS.CANCEL };
                            if (asPage !== null && asPage !== undefined && asPage !== '') {
                                setObj.updatedByPageDate = moment().toDate();
                            } else {
                                setObj.updatedByUserDate = moment().toDate();
                            }

                            const changeFulfillCaseStatus = await this.fulfillmentCaseService.update({ _id: caseObjId }, { $set: setObj });

                            if (changeFulfillCaseStatus !== null && changeFulfillCaseStatus !== undefined) {
                                /* Create Chat */
                                // search chatroom
                                const chatRoom = await this.chatRoomService.findOne({ typeId: caseObjId, type: CHAT_ROOM_TYPE.FULFILLMENT });
                                if (chatRoom) {
                                    let chatmsg = 'ได้ทำการยกเลิกเติมเต็ม';
                                    const chatMsg = new ChatMessage();
                                    chatMsg.sender = new ObjectID(userId);
                                    chatMsg.senderType = USER_TYPE.USER;
                                    if (asPage !== null && asPage !== undefined && asPage !== '') {
                                        chatMsg.sender = new ObjectID(asPage);
                                        chatMsg.senderType = USER_TYPE.PAGE;
                                        // page mode
                                        const page = await this.pageService.findOne({ _id: new ObjectID(asPage) });
                                        if (page !== undefined) {
                                            chatmsg = page.name + ' ' + chatmsg;
                                        }
                                    } else {
                                        // user mode
                                        const user = await this.userService.findOne({ _id: new ObjectID(userId) });
                                        if (user !== undefined) {
                                            chatmsg = user.displayName + ' ' + chatmsg;
                                        }
                                    }
                                    chatMsg.message = chatmsg;
                                    chatMsg.messageType = CHAT_MESSAGE_TYPE.FULFILLMENT_CASE_CANCEL;
                                    chatMsg.room = chatRoom.id;

                                    await this.chatMessageService.createChatMessage(chatMsg);
                                }
                                /* end Create Chat*/

                                const fulfilmentCancelled: FulfillmentCase = await this.fulfillmentCaseService.findOne({ _id: caseObjId });

                                return res.status(200).send(ResponseUtil.getSuccessResponse('FulfillmentCase Canceled', fulfilmentCancelled));
                            } else {
                                return res.status(400).send(ResponseUtil.getErrorResponse('Cancel FulfillmentCase Failed', undefined));
                            }
                        } else {
                            return res.status(400).send(ResponseUtil.getErrorResponse('You Cannot Cancel This FulfillmentCase', undefined));
                        }
                    } else {
                        return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Cancel This FulfillmentCase', undefined));
                    }
                } else {
                    return res.status(200).send(ResponseUtil.getSuccessResponse('FulfillmentCase Not Found', undefined));
                }
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Case was not found', undefined));
            }
        } catch (error) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Cancel FulfillmentCase Error', error.message));
        }
    }

    /**
     * @api {post} /api/fulfillment_case/:caseId/confirm Confirm FulfillmentCase API
     * @apiGroup Fulfillment Case
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Confirm FulfillmentCase Success",
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/fulfillment_case/:caseId/confirm
     * @apiErrorExample {json} Confirm FulfillmentCase Failed
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:caseId/confirm')
    @Authorized('user')
    public async confirmFulfillmentCase(@QueryParam('asPage') asPage: string, @Param('caseId') caseId: string, @Res() res: any, @Req() req: any): Promise<any> {
        try {
            const userId = req.user.id;

            if (caseId !== null && caseId !== undefined && caseId !== '') {
                const caseObjId = new ObjectID(caseId);
                const fulfillCase: FulfillmentCase = await this.fulfillmentCaseService.findOne({ _id: caseObjId, deleted: false });

                if (fulfillCase !== null && fulfillCase !== undefined) {
                    const fulfillCaseStatus = fulfillCase.status;
                    let canChangeStatus = false;

                    if (asPage !== null && asPage !== undefined && asPage !== '') {
                        const pageAccess: PageAccessLevel[] = await this.pageAccessLevelService.getUserAccessByPage(userId, asPage);

                        let canAccessPage = false;

                        if (pageAccess !== null && pageAccess !== undefined && pageAccess.length > 0) {
                            for (const access of pageAccess) {
                                if (access.level === PAGE_ACCESS_LEVEL.ADMIN || access.level === PAGE_ACCESS_LEVEL.OWNER) {
                                    if (JSON.stringify(access.page) === JSON.stringify(asPage)) {
                                        canChangeStatus = true;
                                        canAccessPage = true;
                                    }
                                }
                            }
                        }

                        if (!canAccessPage) {
                            return res.status(400).send(ResponseUtil.getErrorResponse('You Cannot Access As Page', undefined));
                        }
                    }

                    if (!canChangeStatus) {
                        return res.status(400).send(ResponseUtil.getErrorResponse('You have not a permisstion to confirm case', undefined));
                    }

                    if (fulfillCaseStatus === FULFILLMENT_STATUS.CANCEL || fulfillCaseStatus === FULFILLMENT_STATUS.CONFIRM) {
                        return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Confirm This FulfillmentCase', undefined));
                    }

                    const setObj: any = { status: FULFILLMENT_STATUS.CONFIRM };
                    if (asPage !== null && asPage !== undefined && asPage !== '') {
                        setObj.updatedByPageDate = moment().toDate();
                    } else {
                        setObj.updatedByUserDate = moment().toDate();
                    }

                    const changeFulfillCaseStatus = await this.fulfillmentCaseService.update({ _id: caseObjId }, { $set: setObj });

                    if (changeFulfillCaseStatus !== null && changeFulfillCaseStatus !== undefined) {
                        /* Create Chat */
                        // search chatroom
                        const chatRoom = await this.chatRoomService.findOne({ typeId: caseObjId, type: CHAT_ROOM_TYPE.FULFILLMENT });
                        if (chatRoom) {
                            let chatMessage = 'คำขอเติมเต็มของท่านได้รับการยืนยันแล้ว';
                            const chatMsg = new ChatMessage();
                            chatMsg.sender = new ObjectID(userId);
                            chatMsg.senderType = USER_TYPE.USER;
                            if (asPage !== null && asPage !== undefined && asPage !== '') {
                                chatMsg.sender = new ObjectID(asPage);
                                chatMsg.senderType = USER_TYPE.PAGE;

                                const page = await this.pageService.findOne({ _id: new ObjectID(asPage) });
                                if (page !== undefined) {
                                    chatMessage = page.name + ' ได้ยืนยันการเติมเต็มของคุณแล้ว รอทางเพจสร้างโพสต์การเติมเต็ม';
                                }
                            }
                            chatMsg.message = chatMessage;
                            chatMsg.messageType = CHAT_MESSAGE_TYPE.FULFILLMENT_CASE_CONFIRM;
                            chatMsg.room = chatRoom.id;

                            await this.chatMessageService.createChatMessage(chatMsg);
                        }
                        /* end create Chat */

                        const fulfilmentCancelled: FulfillmentCase = await this.fulfillmentCaseService.findOne({ _id: caseObjId });

                        return res.status(200).send(ResponseUtil.getSuccessResponse('FulfillmentCase Confirmed', fulfilmentCancelled));
                    } else {
                        return res.status(400).send(ResponseUtil.getErrorResponse('Confirm FulfillmentCase Failed', undefined));
                    }
                } else {
                    return res.status(400).send(ResponseUtil.getSuccessResponse('FulfillmentCase Not Found', undefined));
                }
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Case was not found', undefined));
            }
        } catch (error) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Confirm FulfillmentCase Error', error.message));
        }
    }

    /**
     * @api {delete} /api/fulfillment_case/:caseId/confirm Cancel Confirm FulfillmentCase API
     * @apiGroup Fulfillment Case
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Cancel Confirm FulfillmentCase Success",
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/fulfillment_case/:caseId/confirm
     * @apiErrorExample {json} Create FulfillmentCase Failed
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/:caseId/confirm')
    @Authorized('user')
    public async cancelConfirmFulfillmentCase(@QueryParam('asPage') asPage: string, @Param('caseId') caseId: string, @Res() res: any, @Req() req: any): Promise<any> {
        try {
            const userId = req.user.id;

            if (caseId !== null && caseId !== undefined && caseId !== '') {
                const caseObjId = new ObjectID(caseId);
                const fulfillCase: FulfillmentCase = await this.fulfillmentCaseService.findOne({ _id: caseObjId, deleted: false });

                if (fulfillCase !== null && fulfillCase !== undefined) {
                    const fulfillCaseStatus = fulfillCase.status;
                    let canChangeStatus = false;

                    if (asPage !== null && asPage !== undefined && asPage !== '') {
                        const pageAccess: PageAccessLevel[] = await this.pageAccessLevelService.getUserAccessByPage(userId, asPage);

                        let canAccessPage = false;

                        if (pageAccess !== null && pageAccess !== undefined && pageAccess.length > 0) {
                            for (const access of pageAccess) {
                                if (access.level === PAGE_ACCESS_LEVEL.ADMIN || access.level === PAGE_ACCESS_LEVEL.OWNER) {
                                    if (JSON.stringify(access.page) === JSON.stringify(asPage)) {
                                        canChangeStatus = true;
                                        canAccessPage = true;
                                    }
                                }
                            }
                        }

                        if (!canAccessPage) {
                            return res.status(400).send(ResponseUtil.getErrorResponse('You Cannot Access As Page', undefined));
                        }
                    }

                    if (!canChangeStatus) {
                        return res.status(400).send(ResponseUtil.getErrorResponse('You have not a permisstion to cancel confirm case', undefined));
                    }

                    if (fulfillCaseStatus !== FULFILLMENT_STATUS.CONFIRM) {
                        return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Cancel This FulfillmentCase', undefined));
                    }

                    const setObj: any = { status: FULFILLMENT_STATUS.INPROGRESS };
                    if (asPage !== null && asPage !== undefined && asPage !== '') {
                        setObj.updatedByPageDate = moment().toDate();
                    } else {
                        setObj.updatedByUserDate = moment().toDate();
                    }

                    const changeFulfillCaseStatus = await this.fulfillmentCaseService.update({ _id: caseObjId }, { $set: setObj });

                    if (changeFulfillCaseStatus !== null && changeFulfillCaseStatus !== undefined) {
                        /* Create Chat */
                        // search chatroom
                        const chatRoom = await this.chatRoomService.findOne({ typeId: caseObjId, type: CHAT_ROOM_TYPE.FULFILLMENT });
                        if (chatRoom) {
                            const chatMessage = 'ยกเลิกคำขอเติมเต็มของท่านแล้ว';
                            const chatMsg = new ChatMessage();
                            chatMsg.sender = new ObjectID(userId);
                            chatMsg.senderType = USER_TYPE.USER;
                            if (asPage !== null && asPage !== undefined && asPage !== '') {
                                chatMsg.sender = new ObjectID(asPage);
                                chatMsg.senderType = USER_TYPE.PAGE;
                            }
                            chatMsg.message = chatMessage;
                            chatMsg.messageType = CHAT_MESSAGE_TYPE.INFO;
                            chatMsg.room = chatRoom.id;

                            await this.chatMessageService.createChatMessage(chatMsg);
                        }
                        /* end create Chat */

                        const fulfilmentCancelled: FulfillmentCase = await this.fulfillmentCaseService.findOne({ _id: caseObjId });

                        return res.status(200).send(ResponseUtil.getSuccessResponse('FulfillmentCase Cancel Confirm Success', fulfilmentCancelled));
                    } else {
                        return res.status(400).send(ResponseUtil.getErrorResponse('Cancel Confirm FulfillmentCase Failed', undefined));
                    }
                } else {
                    return res.status(400).send(ResponseUtil.getSuccessResponse('FulfillmentCase Not Found', undefined));
                }
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Case was not found', undefined));
            }
        } catch (error) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Cancel Confirm FulfillmentCase Error', error.message));
        }
    }

    /**
     * @api {post} /api/fulfillment_case/:caseId/fulfill Create Fulfillment From case API
     * @apiGroup Fulfillment Case
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Create FulfillmentCase Success",
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/fulfillment_case/:caseId/fulfill
     * @apiErrorExample {json} Create FulfillmentCase Failed
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:caseId/fulfill')
    @Authorized('user')
    public async createFulfillmentPostFromCase(@QueryParam('asPage') asPage: string, @Param('caseId') caseId: string, @Body({ validate: true }) pagePost: PagePostRequest, @Res() res: any, @Req() req: any): Promise<any> {
        try {
            const userId = req.user.id;
            const clientId = req.headers['client-id'];
            const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];

            if (caseId !== null && caseId !== undefined && caseId !== '') {
                const caseObjId = new ObjectID(caseId);
                const fulfillCase: FulfillmentCase = await this.fulfillmentCaseService.findOne({ _id: caseObjId, deleted: false });

                if (fulfillCase !== null && fulfillCase !== undefined) {
                    const fulfillCaseStatus = fulfillCase.status;
                    let canChangeStatus = false;

                    if (asPage !== null && asPage !== undefined && asPage !== '') {
                        const pageAccess: PageAccessLevel[] = await this.pageAccessLevelService.getUserAccessByPage(userId, asPage);

                        let canAccessPage = false;

                        if (pageAccess !== null && pageAccess !== undefined && pageAccess.length > 0) {
                            for (const access of pageAccess) {
                                if (access.level === PAGE_ACCESS_LEVEL.ADMIN || access.level === PAGE_ACCESS_LEVEL.OWNER) {
                                    if (JSON.stringify(access.page) === JSON.stringify(asPage)) {
                                        canChangeStatus = true;
                                        canAccessPage = true;
                                    }
                                }
                            }
                        }

                        if (!canAccessPage) {
                            return res.status(400).send(ResponseUtil.getErrorResponse('You Cannot Access As Page', undefined));
                        }
                    }

                    if (!canChangeStatus) {
                        return res.status(400).send(ResponseUtil.getErrorResponse('You have not a permisstion to created case', undefined));
                    }

                    if (fulfillCaseStatus === FULFILLMENT_STATUS.CANCEL) {
                        return res.status(400).send(ResponseUtil.getErrorResponse('This case was canceled.', undefined));
                    }

                    if (fulfillCase.fulfillmentPost !== undefined && fulfillCase.fulfillmentPost !== null) {
                        return res.status(400).send(ResponseUtil.getErrorResponse('Cannot fulfillment case that created a post.', undefined));
                    }

                    // search case post
                    const casePost = await this.postsService.findOne({ _id: new ObjectID(fulfillCase.postId) });
                    if (casePost === undefined) {
                        return res.status(400).send(ResponseUtil.getErrorResponse('Post of case was not found.', undefined));
                    }

                    const pageObjId = new ObjectID(casePost.pageId);
                    const pageData: Page[] = await this.pageService.find({ where: { _id: pageObjId } });

                    if (pageData === undefined || pageData === null || pageData.length <= 0) {
                        return res.status(400).send(ResponseUtil.getErrorResponse('Page was not found.', undefined));
                    }

                    const createPostPageData = await this.createPostFulfillcaseFromCasePost(pagePost, fulfillCase, casePost, userId, clientId, ipAddress);

                    // update status of case
                    const setObj: any = { status: FULFILLMENT_STATUS.CONFIRM };
                    setObj.updatedByPageDate = moment().toDate();
                    setObj.fulfillmentPost = createPostPageData.id;

                    await this.fulfillmentCaseService.update({ _id: caseObjId }, { $set: setObj });

                    if (createPostPageData !== undefined) {
                        // notify to requester
                        const pageObj = (pageData !== undefined && pageData.length > 0) ? pageData[0] : undefined;
                        let notificationText = 'ขอบคุณสำหรับการเติมเต็ม';
                        if (pageObj) {
                            notificationText = '"' + pageObj.name + '" ขอขอบคุณสำหรับการเติมเต็ม';
                        }
                        const link = '/post/' + createPostPageData.id;
                        await this.notificationService.createUserNotification(fulfillCase.requester, fulfillCase.pageId, USER_TYPE.PAGE, NOTIFICATION_TYPE.FULFILLMENT, notificationText, link);

                        return res.status(200).send(ResponseUtil.getSuccessResponse('Create Post of FulfillmentCase Complete', createPostPageData));
                    } else {
                        return res.status(400).send(ResponseUtil.getErrorResponse('Cannot create Fulfillment Post.', undefined));
                    }
                } else {
                    return res.status(400).send(ResponseUtil.getSuccessResponse('FulfillmentCase Not Found', undefined));
                }
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('FulfillmentCase Not Found', undefined));
            }
        } catch (error) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Cancel FulfillmentCase Error', error.message));
        }
    }

    /**
     * @api {post} /api/fulfillment_case/:caseId/request Create FulfillmentCase API
     * @apiGroup Fulfillment Case
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Create FulfillmentCase Success",
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/fulfillment_case/:caseId/request
     * @apiErrorExample {json} Create FulfillmentCase Failed
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:caseId/request')
    @Authorized('user')
    public async createFulfillmentRequest(@Param('caseId') caseId: string, @Body({ validate: true }) data: CreateFulfillmentFromCaseRequest, @Res() res: any, @Req() req: any): Promise<any> {
        try {
            if (caseId !== null && caseId !== undefined && caseId !== '') {
                const caseObjId = new ObjectID(caseId);
                const userId = req.user.id;
                const username = req.user.username;
                const userObjId = new ObjectID(userId);
                const asPage = data.asPage;
                const needs = data.needs;
                const mergeItem = data.mergeItem;

                const fulfillCase: FulfillmentCase = await this.fulfillmentCaseService.findOne({ _id: caseObjId, requester: userObjId });
                let requestQuery;

                if (fulfillCase !== null && fulfillCase !== undefined) {
                    const fulfillCaseObjId = new ObjectID(fulfillCase.id);
                    const fulfillCaseStatus = fulfillCase.status;

                    if (asPage !== null && asPage !== undefined && asPage !== '') {
                        const pageAccess: PageAccessLevel[] = await this.pageAccessLevelService.getUserAccessByPage(userId, asPage);

                        let canAccessPage = false;

                        if (pageAccess !== null && pageAccess !== undefined && pageAccess.length > 0) {
                            for (const access of pageAccess) {
                                if (access.level === PAGE_ACCESS_LEVEL.ADMIN || access.level === PAGE_ACCESS_LEVEL.OWNER) {
                                    if (JSON.stringify(access.page) === JSON.stringify(asPage)) {
                                        requestQuery = { fulfillmentCase: caseObjId, deleted: false };
                                        canAccessPage = true;
                                    }
                                }
                            }
                        }

                        if (!canAccessPage) {
                            return res.status(400).send(ResponseUtil.getErrorResponse('You Cannot Access As Page', undefined));
                        }
                    } else {
                        const requester = fulfillCase.requester;

                        if (JSON.stringify(requester) === JSON.stringify(userId)) {
                            requestQuery = { fulfillmentCase: caseObjId, deleted: false };
                        } else {
                            return res.status(400).send(ResponseUtil.getErrorResponse('You Not A Requester', undefined));
                        }
                    }

                    if (fulfillCaseStatus === FULFILLMENT_STATUS.INPROGRESS) {
                        const fulfillRequests: FulfillmentRequest[] = await this.fulfillmentRequestService.find(requestQuery);

                        if (fulfillRequests !== null && fulfillRequests !== undefined && fulfillRequests.length > 0) {
                            if (needs !== null && needs !== undefined && needs.length > 0) {
                                const createFulfillResult: any[] = [];

                                const currentNeedsMap = {}; // needsId as a key and value is array
                                if (mergeItem) {
                                    const caseRequest: any[] = await this.fulfillmentRequestService.findFulfillmentCaseRequests(fulfillCase.id);
                                    for (const caseReq of caseRequest) {
                                        const needsIdKey = caseReq.needsId + '';
                                        if (currentNeedsMap[needsIdKey] === undefined) {
                                            currentNeedsMap[needsIdKey] = [];
                                        }

                                        currentNeedsMap[needsIdKey].push(caseReq);
                                    }
                                }

                                const editItemQuantity = {}; // needsId as a key and value is number
                                for (const need of needs) {
                                    const today = moment().toDate();
                                    const needsIdKey = need.id + '';
                                    let isCreate = true;

                                    if (mergeItem) {
                                        if (currentNeedsMap[needsIdKey] !== undefined && currentNeedsMap[needsIdKey].length > 0) {
                                            isCreate = false;
                                        }
                                    }

                                    if (isCreate) {
                                        const reqNeeds = await this.needsService.findOne({ _id: new ObjectID(need.id) });
                                        if (!reqNeeds) {
                                            continue;
                                        }

                                        const fulfillRequest: FulfillmentRequest = new FulfillmentRequest();
                                        fulfillRequest.needsId = new ObjectID(need.id);
                                        fulfillRequest.quantity = need.quantity;
                                        fulfillRequest.fulfillmentCase = fulfillCaseObjId;
                                        fulfillRequest.createdBy = userObjId;
                                        fulfillRequest.createdByUsername = username;
                                        fulfillRequest.updateByUsername = username;
                                        fulfillRequest.updateDate = today;
                                        fulfillRequest.deleted = false;
                                        if (reqNeeds.standardItemId !== undefined) {
                                            fulfillRequest.standardItemId = reqNeeds.standardItemId;
                                        }
                                        if (reqNeeds.customItemId !== undefined) {
                                            fulfillRequest.customItemId = reqNeeds.customItemId;
                                        }

                                        const createFulfillRequest: FulfillmentRequest = await this.fulfillmentRequestService.create(fulfillRequest);

                                        if (createFulfillRequest !== null && createFulfillRequest !== undefined) {
                                            const ffulfill = await this.fetchFulfillmentRequest(new ObjectID(createFulfillRequest.id));
                                            const ffReqRes = this.createFulfillmentRequestResponse(ffulfill);

                                            createFulfillResult.push(ffReqRes);
                                        }
                                    } else {
                                        // edit mode
                                        const curReq = currentNeedsMap[needsIdKey][0];
                                        const newQuantity = (curReq.quantity !== undefined ? curReq.quantity : 0) + need.quantity;
                                        const updateStmt = { $set: { quantity: newQuantity, updateByUsername: username, updateDate: moment().toDate() } };
                                        await this.fulfillmentRequestService.update({ _id: new ObjectID(curReq.id) }, updateStmt);

                                        const ffulfill = await this.fetchFulfillmentRequest(new ObjectID(curReq.id));
                                        const ffReqRes = this.createFulfillmentRequestResponse(ffulfill);

                                        createFulfillResult.push(ffReqRes);

                                        if (editItemQuantity[needsIdKey] === undefined) {
                                            editItemQuantity[needsIdKey] = need.quantity;
                                        } else {
                                            editItemQuantity[needsIdKey] += need.quantity;
                                        }
                                    }
                                }

                                if (createFulfillResult !== null && createFulfillResult !== undefined && createFulfillResult.length > 0) {
                                    /* Update By in case */
                                    const setObj: any = {};
                                    if (asPage !== null && asPage !== undefined && asPage !== '') {
                                        setObj.updatedByPageDate = moment().toDate();
                                    } else {
                                        setObj.updatedByUserDate = moment().toDate();
                                    }
                                    await this.fulfillmentCaseService.update({ _id: caseObjId }, { $set: setObj });
                                    /* end set  Update By */

                                    /* notify to requester */
                                    const reqNeeds = await this.needsService.findOne({ _id: new ObjectID(createFulfillResult[0].needsId) });
                                    let notificationText = 'เพิ่มรายการสำหรับเติมเต็มสำเร็จ';
                                    if (reqNeeds) {
                                        notificationText = 'เพิ่มจำนวนการเติมเต็ม ' + reqNeeds.name + ' ' + createFulfillResult[0].quantity + ' ' + reqNeeds.unit;
                                    }
                                    if (createFulfillResult.length > 1) {
                                        notificationText += ' และ อื่นๆ';
                                    }
                                    const link = '/post/' + fulfillCase.postId;
                                    await this.notificationService.createUserNotification(fulfillCase.requester, fulfillCase.pageId, USER_TYPE.PAGE, NOTIFICATION_TYPE.FULFILLMENT, notificationText, link);
                                    /* end notify to requester */

                                    /* Create Chat */
                                    // search chatroom
                                    const chatRoom = await this.chatRoomService.findOne({ typeId: caseObjId, type: CHAT_ROOM_TYPE.FULFILLMENT });
                                    if (chatRoom) {
                                        // search all need
                                        const needIdsList = [];
                                        const needNewQuantityMap = {};
                                        for (const createFullfill of createFulfillResult) {
                                            const key = createFullfill.needsId + '';
                                            needNewQuantityMap[key] = createFullfill.quantity;
                                            needIdsList.push(createFullfill.needsId);
                                        }
                                        const needObjList = await this.needsService.find({ _id: { $in: needIdsList } });
                                        if (needObjList !== undefined && (await needObjList).length > 0) {
                                            for (const needObj of needObjList) {
                                                const key = needObj.id + '';
                                                let quantity = needNewQuantityMap[key] === undefined ? 0 : needNewQuantityMap[key];

                                                if (editItemQuantity[key] !== undefined) {
                                                    // show only edit quantity.
                                                    quantity = editItemQuantity[key];
                                                }

                                                const chatMessage = 'เพิ่มรายการ ' + needObj.name + ' ' + InputFormatterUtils.formatCurrencyNumber(quantity, 0, 2) + ' ' + needObj.unit;
                                                const chatMsg = new ChatMessage();
                                                chatMsg.sender = new ObjectID(userId);
                                                chatMsg.senderType = USER_TYPE.USER;
                                                if (asPage !== null && asPage !== undefined && asPage !== '') {
                                                    chatMsg.sender = new ObjectID(asPage);
                                                    chatMsg.senderType = USER_TYPE.PAGE;
                                                }
                                                chatMsg.message = chatMessage;
                                                chatMsg.messageType = CHAT_MESSAGE_TYPE.FULFILLMENT_REQUEST_CREATE;
                                                chatMsg.room = chatRoom.id;

                                                await this.chatMessageService.createChatMessage(chatMsg);
                                            }
                                        }
                                        /* // this is for one message
                                        let chatMessage = 'เพิ่มรายการสำหรับเติมเต็มสำเร็จ';
                                        if (reqNeeds) {
                                            chatMessage = 'เพิ่ม ' + reqNeeds.name + ' ' + InputFormatterUtils.formatCurrencyNumber(createFulfillResult[0].quantity, 0, 2) + ' ' + reqNeeds.unit;
                                        }
                                        const chatMsg = new ChatMessage();
                                        chatMsg.sender = new ObjectID(userId);
                                        chatMsg.senderType = USER_TYPE.USER;
                                        if (asPage !== null && asPage !== undefined && asPage !== '') {
                                            chatMsg.sender = new ObjectID(asPage);
                                            chatMsg.senderType = USER_TYPE.PAGE;
                                        }
                                        chatMsg.message = chatMessage;
                                        chatMsg.messageType = CHAT_MESSAGE_TYPE.FULFILLMENT_REQUEST_CREATE;
                                        chatMsg.room = chatRoom.id;

                                        await this.chatMessageService.createChatMessage(chatMsg);
                                        */
                                    }
                                    /* end create Chat */

                                    return res.status(200).send(ResponseUtil.getSuccessResponse('Create FulfillmentRequest Success', createFulfillResult));
                                } else {
                                    return res.status(200).send(ResponseUtil.getSuccessResponse('Create FulfillmentRequest Failed', undefined));
                                }
                            }
                        } else {
                            return res.status(200).send(ResponseUtil.getSuccessResponse('FulfillmentRequest Not Found', []));
                        }
                    } else {
                        return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Create FulfillmentRequest', undefined));
                    }
                } else {
                    return res.status(400).send(ResponseUtil.getErrorResponse('You Cannot Create This FulfillmentRequest', undefined));
                }
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Fulfillment CaseId Invalid', undefined));
            }
        } catch (error) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Create FulfillmentRequest Error', error.message));
        }
    }

    /**
     * @api {delete} /api/fulfillment_case/:caseId/request/:requestId Edit FulfillmentRequest
     * @apiGroup FulfillmentRequest
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Edit FulfillmentRequest Success"
     *  }
     * @apiSampleRequest /api/fulfillment_case/:caseId/request/:requestId
     * @apiErrorExample {json} Edit FulfillmentRequest Failed
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/:caseId/request/:requestId')
    @Authorized('user')
    public async editFulfillmentRequest(@QueryParam('asPage') asPage: string, @Params() params: EditFulfillmentReqFromCaseParam, @Body({ validate: true }) data: EditFulfillmentReqFromCaseRequest, @Res() res: any, @Req() req: any): Promise<any> {
        try {
            const caseId = params.caseId;
            const requestId = params.requestId;

            if (caseId !== null && caseId !== undefined && caseId !== '') {
                const caseObjId = new ObjectID(caseId);
                const userId = req.user.id;
                const username = req.user.username;
                let requestObjId;

                const fulfillCase: FulfillmentCase = await this.fulfillmentCaseService.findOne({ _id: caseObjId, deleted: false });
                let requestQuery;

                if (fulfillCase !== null && fulfillCase !== undefined) {
                    const fulfillCaseStatus = fulfillCase.status;

                    if (requestId !== null && requestId !== undefined && requestId !== '') {
                        requestObjId = new ObjectID(requestId);
                    } else {
                        return res.status(400).send(ResponseUtil.getErrorResponse('FulfillmentRquuestId Not Found', undefined));
                    }

                    if (asPage !== null && asPage !== undefined && asPage !== '') {
                        const pageAccess: PageAccessLevel[] = await this.pageAccessLevelService.getUserAccessByPage(userId, asPage);

                        let canAccessPage = false;

                        if (pageAccess !== null && pageAccess !== undefined && pageAccess.length > 0) {
                            for (const access of pageAccess) {
                                if (access.level === PAGE_ACCESS_LEVEL.ADMIN || access.level === PAGE_ACCESS_LEVEL.OWNER) {
                                    if (JSON.stringify(access.page) === JSON.stringify(asPage)) {
                                        requestQuery = { _id: requestObjId, fulfillmentCase: caseObjId, deleted: false };
                                        canAccessPage = true;
                                    }
                                }
                            }
                        }

                        if (!canAccessPage) {
                            return res.status(400).send(ResponseUtil.getErrorResponse('You Cannot Access As Page', undefined));
                        }
                    } else {
                        const requester = fulfillCase.requester;

                        if (JSON.stringify(requester) === JSON.stringify(userId)) {
                            requestQuery = { _id: requestObjId, fulfillmentCase: caseObjId, deleted: false };
                        } else {
                            return res.status(400).send(ResponseUtil.getErrorResponse('You Not A Requester', undefined));
                        }
                    }

                    if (fulfillCaseStatus === FULFILLMENT_STATUS.INPROGRESS) {
                        const fulfillRequests: FulfillmentRequest = await this.fulfillmentRequestService.findOne(requestQuery);
                        let requestUpdateValue: any;

                        if (fulfillRequests !== null && fulfillRequests !== undefined) {
                            const oldQuantity = fulfillRequests.quantity;
                            const newQuantity = data.quantity;

                            if (newQuantity !== null && newQuantity !== undefined) {
                                if (newQuantity === oldQuantity) {
                                    return res.status(200).send(ResponseUtil.getSuccessResponse('Equals', fulfillRequests));
                                } else {
                                    requestUpdateValue = { $set: { quantity: newQuantity, updateByUsername: username, updateDate: moment().toDate() } };
                                }
                            } else {
                                requestUpdateValue = { $set: { quantity: oldQuantity, updateByUsername: username, updateDate: moment().toDate() } };
                            }

                            const requestUpdate = await this.fulfillmentRequestService.update(requestQuery, requestUpdateValue);

                            if (requestUpdate !== null && requestUpdate !== undefined) {
                                /* Update By in case */
                                const setObj: any = {};
                                if (asPage !== null && asPage !== undefined && asPage !== '') {
                                    setObj.updatedByPageDate = moment().toDate();
                                } else {
                                    setObj.updatedByUserDate = moment().toDate();
                                }
                                await this.fulfillmentCaseService.update({ _id: caseObjId }, { $set: setObj });
                                /* end set  Update By */

                                /* notify to requester */
                                const reqNeeds = await this.needsService.findOne({ _id: new ObjectID(fulfillRequests.needsId) });
                                let notificationText = 'แก้ไขรายการสำหรับเติมเต็มสำเร็จ';
                                if (reqNeeds) {
                                    notificationText = 'แก้ไขจำนวนการเติมเต็ม ' + reqNeeds.name + ' ' + fulfillRequests.quantity + ' ' + reqNeeds.unit;
                                }
                                const link = '/post/' + fulfillCase.postId;
                                await this.notificationService.createUserNotification(fulfillCase.requester, fulfillCase.pageId, USER_TYPE.PAGE, NOTIFICATION_TYPE.FULFILLMENT, notificationText, link);
                                /* end notify to requester */

                                /* Create Chat */
                                // search chatroom
                                const chatRoom = await this.chatRoomService.findOne({ typeId: caseObjId, type: CHAT_ROOM_TYPE.FULFILLMENT });
                                if (chatRoom) {
                                    let chatMessage = 'แก้ไขรายการสำหรับเติมเต็มสำเร็จ';
                                    if (reqNeeds) {
                                        chatMessage = 'แก้ไขจำนวน ' + reqNeeds.name + ' จาก ' + InputFormatterUtils.formatCurrencyNumber(oldQuantity, 0, 2) + ' ' + reqNeeds.unit + ' เป็น ' + InputFormatterUtils.formatCurrencyNumber(newQuantity, 0, 2) + ' ' + reqNeeds.unit;
                                    }
                                    const chatMsg = new ChatMessage();
                                    chatMsg.sender = new ObjectID(userId);
                                    chatMsg.senderType = USER_TYPE.USER;
                                    if (asPage !== null && asPage !== undefined && asPage !== '') {
                                        chatMsg.sender = new ObjectID(asPage);
                                        chatMsg.senderType = USER_TYPE.PAGE;
                                    }
                                    chatMsg.message = chatMessage;
                                    chatMsg.messageType = CHAT_MESSAGE_TYPE.FULFILLMENT_REQUEST_EDIT;
                                    chatMsg.room = chatRoom.id;

                                    await this.chatMessageService.createChatMessage(chatMsg);
                                }
                                /* end create Chat */

                                // const requestUpdated = await this.fulfillmentRequestService.findOne(requestQuery);
                                const ffulfill = await this.fetchFulfillmentRequest(requestObjId);
                                const ffReqRes = this.createFulfillmentRequestResponse(ffulfill);

                                return res.status(200).send(ResponseUtil.getSuccessResponse('Edit FulfillmentRequest Success', ffReqRes));
                            } else {
                                return res.status(400).send(ResponseUtil.getErrorResponse('Edit FulfillmentRequest Failed', undefined));
                            }
                        } else {
                            return res.status(200).send(ResponseUtil.getSuccessResponse('FulfillmentRequest Not Found', []));
                        }
                    } else {
                        return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Edit FulfillmentRequest', undefined));
                    }
                } else {
                    return res.status(400).send(ResponseUtil.getErrorResponse('You Cannot Edit This FulfillmentRequest', undefined));
                }
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('FulfillmentCaseId Not Found', undefined));
            }
        } catch (error) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Update FulfillmentRequest Error', error.message));
        }
    }

    /**
     * @api {delete} /api/fulfillment_case/:id Delete FulfillmentCase
     * @apiGroup FulfillmentCase
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Delete FulfillmentCase Success"
     *  }
     * @apiSampleRequest /api/fulfillment_case/:id
     * @apiErrorExample {json} Delete FulfillmentCase Failed
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/:id')
    @Authorized('user')
    public async deleteFulfillmentCase(@QueryParam('asPage') asPage: string, @Param('id') caseId: string, @Res() res: any, @Req() req: any): Promise<any> {
        try {
            const userId = req.user.id;
            const username = req.user.username;
            const userObjId = new ObjectID(userId);
            let isCaseDeleted = false;
            let requestQuery: any;

            if (caseId !== null && caseId !== undefined && caseId !== '') {
                const caseObjId = new ObjectID(caseId);
                const fulfillCase: FulfillmentCase = await this.fulfillmentCaseService.findOne({ _id: caseObjId, requester: userObjId });

                if (fulfillCase !== null && fulfillCase !== undefined) {
                    const fulfillCaseStatus = fulfillCase.status;

                    if (asPage !== null && asPage !== undefined && asPage !== '') {
                        const pageAccess: PageAccessLevel[] = await this.pageAccessLevelService.getUserAccessByPage(userId, asPage);

                        let canAccessPage = false;

                        if (pageAccess !== null && pageAccess !== undefined && pageAccess.length > 0) {
                            for (const access of pageAccess) {
                                if (access.level === PAGE_ACCESS_LEVEL.ADMIN || access.level === PAGE_ACCESS_LEVEL.OWNER) {
                                    if (JSON.stringify(access.page) === JSON.stringify(asPage)) {
                                        requestQuery = { fulfillmentCase: caseObjId, deleted: false };
                                        canAccessPage = true;
                                    }
                                }
                            }
                        }

                        if (!canAccessPage) {
                            return res.status(400).send(ResponseUtil.getErrorResponse('You Cannot Access As Page', undefined));
                        }
                    } else {
                        const requester = fulfillCase.requester;

                        if (JSON.stringify(requester) === JSON.stringify(userId)) {
                            requestQuery = { fulfillmentCase: caseObjId, createdBy: userObjId, deleted: false };
                        } else {
                            return res.status(400).send(ResponseUtil.getErrorResponse('You Not A Requester', undefined));
                        }
                    }

                    if (fulfillCaseStatus === FULFILLMENT_STATUS.INPROGRESS || fulfillCaseStatus === FULFILLMENT_STATUS.CANCEL) {
                        const fulfillRequests: FulfillmentRequest[] = await this.fulfillmentRequestService.find(requestQuery);

                        if (fulfillRequests !== null && fulfillRequests !== undefined && fulfillRequests.length > 0) {
                            await this.fulfillmentRequestService.updateMany(requestQuery, { $set: { deleted: true } });
                            isCaseDeleted = true;
                        } else {
                            return res.status(200).send(ResponseUtil.getSuccessResponse('FulfillmentRequest Not Found', []));
                        }

                        const chatRoom: ChatRoom = await this.chatRoomService.findOne({ typeId: caseObjId, type: CHAT_ROOM_TYPE.FULFILLMENT });

                        if (chatRoom !== null && chatRoom !== undefined) {
                            const chatRoomObjId = new ObjectID(chatRoom.id);
                            const chatMessageStmt = { sender: userObjId, room: chatRoomObjId, deleted: false };

                            const chatMessages: ChatMessage[] = await this.chatMessageService.find(chatMessageStmt);

                            if (chatMessages !== null && chatMessages !== undefined && chatMessages.length > 0) {
                                const chatMessagesDeleted = await this.chatMessageService.updateMany(chatMessageStmt, { $set: { deleted: true, updateByUsername: username, updateDate: moment().toDate() } });

                                if (chatMessagesDeleted !== null && chatMessagesDeleted !== undefined) {
                                    isCaseDeleted = true;
                                }
                            }

                            const chatRoomDeleted = await this.chatRoomService.update({ _id: chatRoomObjId }, { $set: { deleted: true } });

                            if (chatRoomDeleted !== null && chatRoomDeleted !== undefined) {
                                isCaseDeleted = true;
                            }
                        } else {
                            return res.status(200).send(ResponseUtil.getSuccessResponse('ChatRoom Has Been Deleted', undefined));
                        }

                        const caseDeleted = await this.fulfillmentCaseService.update({ _id: caseObjId }, { $set: { deleted: true } });

                        if (caseDeleted !== null && caseDeleted !== undefined) {
                            isCaseDeleted = true;
                        }

                        if (isCaseDeleted === true) {
                            return res.status(200).send(ResponseUtil.getSuccessResponse('Delete FulfillmentCase Success', undefined));
                        } else {
                            return res.status(400).send(ResponseUtil.getErrorResponse('Delete FulfillmentCase Failed', undefined));
                        }
                    } else {
                        return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Delete FulfillmentCase', undefined));
                    }
                } else {
                    return res.status(400).send(ResponseUtil.getErrorResponse('You Cannot Delete This FulfillmentCase', undefined));
                }
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('FulfillmentCaseId Not Found', undefined));
            }
        } catch (error) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Delete FulfillmentCase Error', error.message));
        }
    }

    /**
     * @api {delete} /api/fulfillment_case/:id Delete FulfillmentCase
     * @apiGroup FulfillmentCase
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Delete FulfillmentCase Success"
     *  }
     * @apiSampleRequest /api/fulfillment_case/:id
     * @apiErrorExample {json} Delete FulfillmentCase Failed
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/:caseId/request/:requestId')
    @Authorized('user')
    public async deleteFulfillmentRequest(@QueryParam('asPage') asPage: string, @Params() params: DeleteFulfillmentRequestParam, @Res() res: any, @Req() req: any): Promise<any> {
        try {
            const caseId = params.caseId;
            const requestId = params.requestId;
            const userId = req.user.id;
            const username = req.user.username;
            let isCaseDeleted = false;

            if ((caseId !== null && caseId !== undefined && caseId !== '') && (requestId !== null && requestId !== undefined && requestId !== '')) {
                const caseObjId = new ObjectID(caseId);
                const requestObjId = new ObjectID(requestId);
                const fulfillCase: FulfillmentCase = await this.fulfillmentCaseService.findOne({ _id: caseObjId, deleted: false });
                let requestQuery;

                if (fulfillCase !== null && fulfillCase !== undefined) {
                    const fulfillCaseStatus = fulfillCase.status;

                    if (asPage !== null && asPage !== undefined && asPage !== '') {
                        const pageAccess: PageAccessLevel[] = await this.pageAccessLevelService.getUserAccessByPage(userId, asPage);

                        let canAccessPage = false;

                        if (pageAccess !== null && pageAccess !== undefined && pageAccess.length > 0) {
                            for (const access of pageAccess) {
                                if (access.level === PAGE_ACCESS_LEVEL.ADMIN || access.level === PAGE_ACCESS_LEVEL.OWNER) {
                                    if (JSON.stringify(access.page) === JSON.stringify(asPage)) {
                                        requestQuery = { _id: requestObjId, fulfillmentCase: caseObjId, deleted: false };
                                        canAccessPage = true;
                                    }
                                }
                            }
                        }

                        if (!canAccessPage) {
                            return res.status(400).send(ResponseUtil.getErrorResponse('You Cannot Access As Page', undefined));
                        }
                    } else {
                        const requester = fulfillCase.requester;

                        if (JSON.stringify(requester) === JSON.stringify(userId)) {
                            requestQuery = { _id: requestObjId, fulfillmentCase: caseObjId, deleted: false };
                        } else {
                            return res.status(400).send(ResponseUtil.getErrorResponse('You Not A Requester', undefined));
                        }
                    }

                    if (fulfillCaseStatus === FULFILLMENT_STATUS.INPROGRESS) {
                        const fulfillRequests: FulfillmentRequest[] = await this.fulfillmentRequestService.find(requestQuery);

                        if (fulfillRequests !== null && fulfillRequests !== undefined && fulfillRequests.length > 0) {
                            await this.fulfillmentRequestService.updateMany(requestQuery, { $set: { deleted: true, updateByUsername: username, updateDate: moment().toDate() } });
                            isCaseDeleted = true;
                        } else {
                            return res.status(200).send(ResponseUtil.getSuccessResponse('FulfillmentRequest Not Found', []));
                        }

                        if (isCaseDeleted === true) {
                            /* Update By in case */
                            const setObj: any = {};
                            if (asPage !== null && asPage !== undefined && asPage !== '') {
                                setObj.updatedByPageDate = moment().toDate();
                            } else {
                                setObj.updatedByUserDate = moment().toDate();
                            }
                            await this.fulfillmentCaseService.update({ _id: caseObjId }, { $set: setObj });
                            /* end set  Update By */

                            /* notify to requester */
                            if (fulfillRequests.length > 0) {
                                const reqNeeds = await this.needsService.findOne({ _id: new ObjectID(fulfillRequests[0].needsId) });
                                let notificationText = 'ลบรายการสำหรับเติมเต็มสำเร็จ';
                                if (reqNeeds) {
                                    notificationText = 'ลบรายการเติมเต็ม ' + reqNeeds.name + ' ' + fulfillRequests[0].quantity + ' ' + reqNeeds.unit;
                                }
                                if (fulfillRequests.length > 0) {
                                    notificationText += ' และอื่นๆ';
                                }

                                const link = '/post/' + fulfillCase.postId;
                                await this.notificationService.createUserNotification(fulfillCase.requester, fulfillCase.pageId, USER_TYPE.PAGE, NOTIFICATION_TYPE.FULFILLMENT, notificationText, link);

                                /* Create Chat */
                                // search chatroom
                                const chatRoom = await this.chatRoomService.findOne({ typeId: caseObjId, type: CHAT_ROOM_TYPE.FULFILLMENT });
                                if (chatRoom) {
                                    let chatMessage = 'ลบรายการสำหรับเติมเต็มสำเร็จ';
                                    if (reqNeeds) {
                                        let otherMsg = '';
                                        if (fulfillRequests.length > 1) {
                                            otherMsg += ' และรายการอื่นๆ';
                                        }
                                        chatMessage = 'ลบรายการ ' + reqNeeds.name + otherMsg + ' ' + fulfillRequests[0].quantity + ' ' + reqNeeds.unit;
                                    }
                                    const chatMsg = new ChatMessage();
                                    chatMsg.sender = new ObjectID(userId);
                                    chatMsg.senderType = USER_TYPE.USER;
                                    if (asPage !== null && asPage !== undefined && asPage !== '') {
                                        chatMsg.sender = new ObjectID(asPage);
                                        chatMsg.senderType = USER_TYPE.PAGE;
                                    }
                                    chatMsg.message = chatMessage;
                                    chatMsg.messageType = CHAT_MESSAGE_TYPE.FULFILLMENT_REQUEST_DELETE;
                                    chatMsg.room = chatRoom.id;

                                    await this.chatMessageService.createChatMessage(chatMsg);
                                }
                                /* end create Chat */
                            }
                            /* end notify to requester */

                            return res.status(200).send(ResponseUtil.getSuccessResponse('Delete FulfillmentRequest Success', undefined));
                        } else {
                            return res.status(400).send(ResponseUtil.getErrorResponse('Delete FulfillmentRequest Failed', undefined));
                        }
                    } else {
                        return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Delete This FulfillmentRequest', undefined));
                    }
                } else {
                    return res.status(400).send(ResponseUtil.getErrorResponse('You Cannot Delete This FulfillmentRequest', undefined));
                }
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Invalid FulfillmentRequest', undefined));
            }
        } catch (error) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Delete FulfillmentRequest Error', error.message));
        }
    }

    private createFulfillmentRequestResponse(fulfillFetch: any): GetFulfillmentRequestResponse {
        if (fulfillFetch === undefined) {
            return undefined;
        }

        console.log('fulfillFetch >>> ', fulfillFetch);

        const fulfillRequestResponse: GetFulfillmentRequestResponse = new GetFulfillmentRequestResponse();
        fulfillRequestResponse.needs = fulfillFetch.needs;
        fulfillRequestResponse.imageURL = fulfillFetch.imageURL;
        fulfillRequestResponse.name = fulfillFetch.name;
        fulfillRequestResponse.unit = fulfillFetch.unit;
        fulfillRequestResponse.id = fulfillFetch._id;
        fulfillRequestResponse.needsId = fulfillFetch.needsId;
        fulfillRequestResponse.quantity = fulfillFetch.quantity;
        fulfillRequestResponse.requestId = fulfillFetch._id;

        return fulfillRequestResponse;
    }

    private async fetchFulfillmentRequest(requestIds: ObjectID): Promise<any> {
        if (requestIds === undefined || requestIds.length <= 0) {
            return undefined;
        }

        const lookupStmt = [
            {
                $match: { _id: requestIds, deleted: false }
            },
            {
                $lookup: {
                    from: 'Needs',
                    localField: 'needsId',
                    foreignField: '_id',
                    as: 'needs'
                }
            },
            {
                $unwind: {
                    path: '$needs',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'StandardItem',
                    localField: 'needs.standardItemId',
                    foreignField: '_id',
                    as: 'stdItems'
                }
            },
            {
                $unwind: {
                    path: '$stdItems',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'CustomItem',
                    localField: 'needs.customItemId',
                    foreignField: '_id',
                    as: 'customItems'
                }
            },
            {
                $unwind: {
                    path: '$customItems',
                    preserveNullAndEmptyArrays: true
                }
            },
            { $addFields: { imageURL: '$stdItems.imageURL', name: '$needs.name', unit: '$needs.unit' } },
            { $project: { needs: 0, stdItems: 0, customItems: 0 } }
        ];

        const result = await this.fulfillmentRequestService.aggregate(lookupStmt);

        return (result && result.length > 0) ? result[0] : undefined;
    }

    private async createNewFulfillmentCase(pageObjId: ObjectID, postsObjId: ObjectID, requesterObjId: ObjectID, userObjId: ObjectID, username: string, updateDate: Date): Promise<FulfillmentCase> {
        const fulfillCase = new FulfillmentCase();
        fulfillCase.pageId = pageObjId;
        fulfillCase.postId = postsObjId;
        fulfillCase.status = FULFILLMENT_STATUS.INPROGRESS;
        fulfillCase.requester = requesterObjId;
        fulfillCase.createdBy = userObjId;
        fulfillCase.createdByUsername = username;
        fulfillCase.updateByUsername = username;
        fulfillCase.updateDate = updateDate;
        fulfillCase.description = '';
        fulfillCase.approveDateTime = null;
        fulfillCase.approveUser = null;
        fulfillCase.deleted = false;
        fulfillCase.updatedByUserDate = moment().toDate();

        return await this.fulfillmentCaseService.create(fulfillCase);
    }

    private async createPostFulfillcaseFromCasePost(pagePost: PagePostRequest, fulfillCase: FulfillmentCase, casePost: Posts, userId: string, clientId?: string, ipAddress?: string): Promise<any> {
        if (pagePost === undefined) {
            const errorResponse = ResponseUtil.getErrorResponse('Post Content was required.', undefined);
            return Promise.reject(errorResponse);
        }

        if (fulfillCase === undefined) {
            const errorResponse = ResponseUtil.getErrorResponse('Fulfillment Case was required.', undefined);
            return Promise.reject(errorResponse);
        }

        if (casePost === undefined) {
            const errorResponse = ResponseUtil.getErrorResponse('Case Post was required.', undefined);
            return Promise.reject(errorResponse);
        }

        let createPostPageData;
        /* create fulfillpost with case. */
        {
            const userIdList = [];
            const userTags = [];
            const isPostDraft = pagePost.isDraft;
            const postStory = pagePost.story;
            const postGallery = pagePost.postGallery;
            const coverImage = pagePost.coverImage;
            const postHashTag = pagePost.postsHashTags;
            const postUserTag = pagePost.userTags;
            const startDateTime = moment(pagePost.startDateTime).toDate();
            const today = moment().toDate();

            if (postUserTag !== null && postUserTag !== undefined) {
                for (const userTagId of postUserTag) {
                    userIdList.push(new ObjectID(userTagId));
                }
            }

            const userIdExists: User[] = await this.userService.find({ _id: { $in: userIdList } });

            if (userIdExists !== null && userIdExists !== undefined && userIdExists.length > 0) {
                for (const user of userIdExists) {
                    userTags.push(new ObjectID(user.id));
                }
            }

            let assetResult: Asset;
            if (postStory !== null && postStory !== undefined && postStory !== '') {
                if (coverImage !== null && coverImage !== undefined) {
                    const newFileName = userId + FileUtil.renameFile();
                    const assetData = coverImage.data;
                    const assetMimeType = coverImage.mimeType;
                    const assetFileName = newFileName;
                    const assetSize = coverImage.size;

                    const coverImageAsset = new Asset();
                    coverImageAsset.userId = new ObjectID(userId);
                    coverImageAsset.data = assetData;
                    coverImageAsset.mimeType = assetMimeType;
                    coverImageAsset.fileName = assetFileName;
                    coverImageAsset.size = assetSize;
                    coverImageAsset.expirationDate = null;
                    coverImageAsset.scope = ASSET_SCOPE.PUBLIC;
                    assetResult = await this.assetService.create(coverImageAsset);
                }
            }

            let createdDate: Date;
            let postDateTime: Date;
            let isDraft: boolean;

            if (isPostDraft) {
                createdDate = null;
                postDateTime = null;
                isDraft = true;
            } else {
                if (startDateTime !== null && startDateTime !== undefined) {
                    createdDate = today;
                    postDateTime = startDateTime;
                } else {
                    createdDate = today;
                    postDateTime = today;
                }

                isDraft = false;
            }

            let postDetail = pagePost.detail;

            if (postDetail !== null && postDetail !== undefined && postDetail !== '') {
                postDetail = postDetail.replace(/^\s*[\r\n]/gm, '\n');
            }

            const postPage: Posts = new Posts();
            postPage.title = pagePost.title;
            postPage.detail = postDetail;
            postPage.isDraft = isDraft;
            postPage.hidden = false;
            postPage.type = POST_TYPE.FULFILLMENT;
            postPage.userTags = userTags;
            postPage.coverImage = assetResult ? ASSET_PATH + assetResult.id : '';
            postPage.pinned = false;
            postPage.deleted = false;
            postPage.ownerUser = new ObjectID(userId);
            postPage.commentCount = 0;
            postPage.repostCount = 0;
            postPage.shareCount = 0;
            postPage.likeCount = 0;
            postPage.viewCount = 0;
            postPage.createdDate = createdDate;
            postPage.startDateTime = postDateTime;
            postPage.story = (postStory !== null && postStory !== undefined) ? postStory : null;
            postPage.objective = casePost.objective;
            postPage.objectiveTag = casePost.objectiveTag;
            postPage.emergencyEvent = casePost.emergencyEvent;
            postPage.emergencyEventTag = casePost.emergencyEventTag;
            postPage.pageId = casePost.pageId;
            postPage.referencePost = null;
            postPage.rootReferencePost = null;
            postPage.visibility = null;
            postPage.ranges = null;

            const masterHashTagMap = {};
            const postMasterHashTagList = [];

            if (postHashTag !== null && postHashTag !== undefined && postHashTag.length > 0) {
                const masterHashTagList: HashTag[] = await this.hashTagService.find({ name: { $in: postHashTag } });

                for (const hashTag of masterHashTagList) {
                    const id = hashTag.id;
                    const name = hashTag.name;
                    postMasterHashTagList.push(new ObjectID(id));
                    masterHashTagMap[name] = hashTag;
                }

                for (const hashTag of postHashTag) {
                    if (masterHashTagMap[hashTag] === undefined) {
                        const newHashTag: HashTag = new HashTag();
                        newHashTag.name = hashTag;
                        newHashTag.lastActiveDate = today;
                        newHashTag.count = 0;
                        newHashTag.iconURL = '';

                        const newMasterHashTag: HashTag = await this.hashTagService.create(newHashTag);

                        if (newMasterHashTag !== null && newMasterHashTag !== undefined) {
                            postMasterHashTagList.push(new ObjectID(newMasterHashTag.id));

                            masterHashTagMap[hashTag] = newMasterHashTag;
                        }
                    }
                }
            }

            postPage.postsHashTags = postMasterHashTagList;

            createPostPageData = await this.postsService.create(postPage);

            const postPageId = new ObjectID(createPostPageData.id);
            const engagement = new UserEngagement();
            engagement.clientId = clientId;
            engagement.contentId = postPageId;
            engagement.contentType = ENGAGEMENT_CONTENT_TYPE.POST;
            engagement.ip = ipAddress;
            engagement.userId = new ObjectID(userId);
            engagement.action = ENGAGEMENT_ACTION.CREATE;
            engagement.isFirst = true;

            await this.userEngagementService.create(engagement);

            const assetIdList = [];
            const orderingList = [];
            const duplicateAssetIdList = [];
            const duplicateOrderingList = [];

            // create post gallery
            if (postGallery !== null && postGallery !== undefined && postGallery.length > 0) {
                for (const item of postGallery) {
                    if (assetIdList.includes(item.id)) {
                        // throw error
                        duplicateAssetIdList.push(new ObjectID(item.id));
                    } else {
                        assetIdList.push(new ObjectID(item.id));
                    }

                    if (orderingList.includes(item.asset.ordering)) {
                        // throw error
                        duplicateOrderingList.push(item.asset.ordering);
                    } else {
                        orderingList.push(item.asset.ordering);
                    }

                    const assetObjId = new ObjectID(item.id);
                    const postsGallery = new PostsGallery();
                    postsGallery.post = postPageId;
                    postsGallery.fileId = assetObjId;
                    postsGallery.imageURL = ASSET_PATH + assetObjId;
                    postsGallery.ordering = item.asset.ordering;
                    const postsGalleryCreate: PostsGallery = await this.postGalleryService.create(postsGallery);

                    if (postsGalleryCreate) {
                        await this.assetService.update({ _id: assetObjId, userId: new ObjectID(userId) }, { $set: { expirationDate: null } });
                    }
                }

                if (duplicateAssetIdList.length > 0) {
                    const errorResponse = ResponseUtil.getErrorResponse('Asset Id Duplicate', { id: duplicateAssetIdList });
                    return Promise.reject(errorResponse);
                }

                if (duplicateOrderingList.length > 0) {
                    const errorResponse = ResponseUtil.getErrorResponse('Ordering Duplicate', { ordering: duplicateOrderingList });
                    return Promise.reject(errorResponse);
                }

                const findAssets: Asset[] = await this.assetService.find({ $and: [{ _id: { $in: assetIdList } }] });
                const postAssetsFinal: Asset[] = [];
                if (findAssets) {
                    for (const asset of findAssets) {
                        if (asset.expirationDate < today) {
                            continue;
                        }
                        postAssetsFinal.push(asset);
                    }
                }
            }

            // create user engagement
            const hashTagList = [];

            if (postHashTag !== null && postHashTag !== undefined && postHashTag.length > 0) {
                for (const hashTag of postHashTag) {
                    const htEngagement = new UserEngagement();
                    htEngagement.clientId = clientId;
                    htEngagement.contentId = new ObjectID(createPostPageData.id);
                    htEngagement.contentType = ENGAGEMENT_CONTENT_TYPE.POST;
                    htEngagement.ip = ipAddress;
                    htEngagement.userId = new ObjectID(userId);
                    htEngagement.action = ENGAGEMENT_ACTION.TAG;
                    htEngagement.isFirst = true;

                    if (masterHashTagMap[hashTag]) {
                        htEngagement.reference = hashTag;
                        hashTagList.push(hashTag);
                    }

                    await this.userEngagementService.create(htEngagement);
                }

                if (hashTagList !== null && hashTagList !== undefined && hashTagList.length > 0) {
                    await this.hashTagService.update({ name: { $in: hashTagList } }, { $set: { lastActiveDate: today } });
                }
            }

            // create fullfillment
            // search need from post
            const needMap: any = {};
            const needsList = await this.needsService.findPostNeeds(casePost.id + '', true);
            for (const need of needsList) {
                const needIdKey = need.id + '';
                needMap[needIdKey] = need;
            }

            // search case fullfillmentRequest
            const requestList = await this.fulfillmentRequestService.findFulfillmentCaseRequests(fulfillCase.id + '');
            for (const request of requestList) {
                if (request.needsId === undefined) {
                    continue;
                }

                const needIdKey = request.needsId + '';
                const need = needMap[needIdKey];
                // no need has mapped
                if (need === undefined) {
                    continue;
                }

                const needFulfillQuantity: number = (need.fulfillQuantity === undefined ? 0 : need.fulfillQuantity) + request.quantity; // oldfulfillQuantity + fulfillQuantity
                let needPendingQuantity: number = (need.quantity === undefined ? 0 : need.quantity) - needFulfillQuantity; // quantity - fulfillQuantity
                if (needPendingQuantity <= -1) {
                    needPendingQuantity = 0;
                }

                const fulfil = new Fulfillment();
                fulfil.requestId = request.id;
                fulfil.name = need.name;
                fulfil.user = fulfillCase.requester;
                fulfil.status = fulfillCase.status;
                fulfil.post = need.post;
                fulfil.casePost = createPostPageData.id;
                fulfil.need = request.needsId;
                fulfil.pageId = casePost.pageId;
                fulfil.quantity = request.quantity;
                fulfil.unit = need.unit;

                await this.fulfillmentService.create(fulfil);

                const needUpdate = {
                    $set: {
                        fulfillQuantity: needFulfillQuantity,
                        pendingQuantity: needPendingQuantity
                    }
                };

                await this.needsService.update({ _id: need.id }, needUpdate);

                // update new need quantity
                need.fulfillQuantity = needFulfillQuantity;
                need.pendingQuantity = needPendingQuantity;
                needMap[needIdKey] = need;
            }

            // create user post
            const userPost: Posts = new Posts();
            userPost.title = '';
            userPost.detail = '';
            userPost.isDraft = false;
            userPost.hidden = false;
            userPost.type = POST_TYPE.GENERAL;
            userPost.userTags = undefined;
            userPost.coverImage = '';
            userPost.pinned = false;
            userPost.deleted = false;
            userPost.ownerUser = fulfillCase.requester; // requester
            userPost.commentCount = 0;
            userPost.repostCount = 0;
            userPost.shareCount = 0;
            userPost.likeCount = 0;
            userPost.viewCount = 0;
            userPost.createdDate = today;
            userPost.startDateTime = today;
            userPost.story = null;
            userPost.objective = null;
            userPost.objectiveTag = undefined;
            userPost.emergencyEvent = null;
            userPost.emergencyEventTag = undefined;
            userPost.pageId = null;
            userPost.referencePost = null;
            userPost.rootReferencePost = createPostPageData;
            userPost.visibility = null;
            userPost.ranges = null;

            await this.postsService.create(userPost);
        }

        return Promise.resolve(createPostPageData);
    }
}