/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { JsonController, Get, Param, Res, Req, Post, Body, Authorized, QueryParam } from 'routing-controllers';
import { ChatMessageService } from '../services/ChatMessageService';
import { ChatRoomService } from '../services/ChatRoomService';
import { UserService } from '../services/UserService';
import { AssetService } from '../services/AssetService';
import { PageService } from '../services/PageService';
import { FulfillmentCaseService } from '../services/FulfillmentCaseService';
import { PageAccessLevelService } from '../services/PageAccessLevelService';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { ChatMessageRequest } from './requests/ChatMessageRequest';
import { ChatRoomRequest } from './requests/ChatRoomRequest';
import { SearchFilter } from './requests/SearchFilterRequest';
import { ChatRoom } from '../models/ChatRoom';
import { ChatMessage } from '../models/ChatMessage';
import { Asset } from '../models/Asset';
import { ChatMessageResponse } from './responses/ChatMessageResponse';
import { ObjectID } from 'mongodb';
import { CHAT_ROOM_TYPE } from '../../constants/ChatRoomType';
import { ASSET_SCOPE, ASSET_PATH } from '../../constants/AssetScope';
import { FileUtil } from '../../utils/FileUtil';
import { PAGE_ACCESS_LEVEL } from '../../constants/PageAccessLevel';
import { USER_TYPE } from '../../constants/NotificationType';
import { CHAT_MESSAGE_TYPE } from '../../constants/ChatMessageTypes';
import { CheckChatRoomRequest } from './requests/CheckChatRoomRequest';
import { read } from 'fs';

@JsonController('/chatroom')
export class ChatRoomController {
    constructor(private chatRoomService: ChatRoomService, private chatMessageService: ChatMessageService, private userService: UserService,
        private assetService: AssetService, private pageService: PageService, private fulfillmentCaseService: FulfillmentCaseService,
        private pageAccessLevelService: PageAccessLevelService) { }

    /**
     * @api {post} /api/chatroom/ Create Chat Room
     * @apiGroup ChatRoom
     * @apiParam (Request body) {String} message message
     * @apiParam (Request body) {any} asset asset
     * @apiParam (Request body) {String} videoURL videoURL
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully Created chat message",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/chatroom/
     * @apiErrorExample {json} chat message error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/')
    @Authorized('user')
    public async createChatRoom(@Body({ validate: true }) chatRoomRequest: ChatRoomRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const senderObjId = new ObjectID(req.user.id);

        if (chatRoomRequest.typeId === undefined || chatRoomRequest.typeId === '') {
            const errorResponse = ResponseUtil.getErrorResponse('Chatroom Type Id was not found.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (chatRoomRequest.type === undefined || (chatRoomRequest.type !== CHAT_ROOM_TYPE.USER && chatRoomRequest.type !== CHAT_ROOM_TYPE.PAGE && chatRoomRequest.type !== CHAT_ROOM_TYPE.GROUP
            && chatRoomRequest.type !== CHAT_ROOM_TYPE.FULFILLMENT)) {
            const errorResponse = ResponseUtil.getErrorResponse('Chatroom Type was not found.', undefined);
            return res.status(400).send(errorResponse);
        }

        // find receiverID
        let receiverObjId = new ObjectID(chatRoomRequest.typeId); // aka. user
        let receiver = undefined;
        let receiverType = USER_TYPE.USER;
        let receiverName = '';
        if (chatRoomRequest.type === CHAT_ROOM_TYPE.USER) {
            receiver = await this.userService.findOne({ _id: receiverObjId });
            receiverType = USER_TYPE.USER;
            receiverName = receiver.displayName;
        } else if (chatRoomRequest.type === CHAT_ROOM_TYPE.PAGE) {
            receiver = await this.pageService.findOne({ _id: receiverObjId });
            receiverType = USER_TYPE.PAGE;
            receiverName = receiver.name;
        } else if (chatRoomRequest.type === CHAT_ROOM_TYPE.FULFILLMENT) {
            // fullfillment case
            const aggregateStmt: any[] = [
                { $match: { _id: receiverObjId } },
                {
                    $lookup: {
                        from: 'Page',
                        localField: 'pageId',
                        foreignField: '_id',
                        as: 'page'
                    }
                }
            ];
            const fulfillmentCase = await this.fulfillmentCaseService.aggregate(aggregateStmt);
            if (fulfillmentCase === undefined || fulfillmentCase.length <= 0) {
                const errorResponse = ResponseUtil.getErrorResponse('Fulfillment case was not found.', undefined);
                return res.status(400).send(errorResponse);
            }

            if (fulfillmentCase[0].page === undefined || fulfillmentCase[0].page.length <= 0) {
                const errorResponse = ResponseUtil.getErrorResponse('Fulfillment case page was not found.', undefined);
                return res.status(400).send(errorResponse);
            }
            // receiver is page
            receiver = fulfillmentCase[0].page[0];
            receiverObjId = receiver._id;
            receiverType = USER_TYPE.PAGE;
            receiverName = receiver.name;
        } else if (chatRoomRequest.type === CHAT_ROOM_TYPE.GROUP) {
            // ! impl here
        }

        if (!receiver) {
            const errorResponse = ResponseUtil.getErrorResponse('ReceiverId was not found.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (senderObjId.equals(receiver)) {
            const errorResponse = ResponseUtil.getErrorResponse('Can not create chatroom with ownself.', undefined);
            return res.status(400).send(errorResponse);
        }

        // find room
        let room: ChatRoom = undefined;
        if (chatRoomRequest.type === CHAT_ROOM_TYPE.FULFILLMENT) {
            room = await this.chatRoomService.findFulfillmentChatRoom(senderObjId, new ObjectID(chatRoomRequest.typeId), false);
        } else {
            room = await this.chatRoomService.findChatRoom(senderObjId, receiverObjId, chatRoomRequest.type, false);
        }

        if (room !== undefined && room !== null) {
            const successResponse = ResponseUtil.getSuccessResponse('Already has this type of chatroom', room);
            return res.status(400).send(successResponse);
        }

        let roomName = req.user.displayName;
        if (receiverName !== '') {
            roomName = req.user.displayName + ' & ' + receiverName;
        }

        if (chatRoomRequest.name !== undefined && chatRoomRequest.name !== '') {
            roomName = chatRoomRequest.name;
        }

        const senderObj = {
            sender: senderObjId,
            senderType: USER_TYPE.USER
        };
        const receiverObj = {
            sender: receiverObjId,
            senderType: receiverType
        };

        const chatRoom = new ChatRoom();
        chatRoom.name = roomName;
        chatRoom.type = chatRoomRequest.type;
        chatRoom.typeId = new ObjectID(chatRoomRequest.typeId);
        chatRoom.participants = [senderObj, receiverObj];
        chatRoom.createdByUsername = req.user.username;
        chatRoom.createdBy = senderObjId;
        chatRoom.deleted = false;

        const chatRoomResult: any = await this.chatRoomService.create(chatRoom);

        if (chatRoomResult) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully create chatroom', chatRoomResult);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable to create chat chatroom', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/chatroom/check_unread Check Chat Room unread message
     * @apiGroup ChatRoom
     * @apiParam (Request body) {String} roomIds roomIds
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully Check Chat Room unread Message",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/chatroom/check_unread
     * @apiErrorExample {json} chat message error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/check_unread')
    @Authorized('user')
    public async checkUnreadChatRoom(@Body({ validate: true }) chatRoomIdsRequest: CheckChatRoomRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const senderObjId = new ObjectID(req.user.id);
        const fetchUserRoom = (chatRoomIdsRequest.fetchUserRoom !== undefined) ? chatRoomIdsRequest.fetchUserRoom : false;
        const asPage = chatRoomIdsRequest.asPage;

        if (chatRoomIdsRequest.roomIds === undefined) {
            chatRoomIdsRequest.roomIds = [];
        }

        const roomObjIds = [];
        for (const roomId of chatRoomIdsRequest.roomIds) {
            roomObjIds.push(new ObjectID(roomId));
        }

        if (roomObjIds.length <= 0 && fetchUserRoom) {
            // search all room of user
            const userRooms = await this.chatRoomService.getUserChatRoomList(senderObjId + '');
            if (userRooms !== undefined) {
                for (const room of userRooms) {
                    roomObjIds.push(room.id);
                }
            }
        }

        let pageObjId = undefined;
        if (asPage !== undefined && asPage !== '') {
            pageObjId = new ObjectID(asPage);
        }

        let page = undefined;
        if (pageObjId !== undefined) {
            page = await this.pageService.findOne({ _id: pageObjId });

            if (page === undefined) {
                const errorResponse = ResponseUtil.getErrorResponse('Page was not found.', undefined);
                return res.status(400).send(errorResponse);
            }
        }

        let sender = new ObjectID(req.user.id);
        let senderType = CHAT_ROOM_TYPE.USER;

        if (page !== undefined) {
            const pageAccess = await this.pageAccessLevelService.getUserAccessByPage(req.user.id, asPage);

            let canAccessPage = false;

            if (pageAccess !== null && pageAccess !== undefined && pageAccess.length > 0) {
                for (const access of pageAccess) {
                    if (access.level === PAGE_ACCESS_LEVEL.OWNER || access.level === PAGE_ACCESS_LEVEL.ADMIN || access.level === PAGE_ACCESS_LEVEL.POST_MODERATOR
                        || access.level === PAGE_ACCESS_LEVEL.FULFILLMENT_MODERATOR || access.level === PAGE_ACCESS_LEVEL.CHAT_MODERATOR) {
                        canAccessPage = true;
                    }
                }
            }

            if (!canAccessPage) {
                return res.status(400).send(ResponseUtil.getErrorResponse('You Cannot Access As Page', undefined));
            }

            sender = pageObjId;
            senderType = CHAT_ROOM_TYPE.PAGE;
        }

        const aggregateStmt: any[] = [
            { $match: { room: { $in: roomObjIds }, deleted: false, readers: { $nin: [{ sender, senderType }] } } },
            { $sort: { createdDate: -1 } },
            { $group: { _id: '$room', count: { $sum: 1 }, message: { $first: '$message' } } }
        ];

        /* // old logic of count unRead.
        const aggregateStmt: any[] = [
            { $match: { room: { $in: roomObjIds }, isRead: false, deleted: false } },
            { $sort: { createdDate: -1 } },
            { $group: { _id: '$room', count: { $sum: 1 }, message: { $first: '$message' } } }
        ];*/

        const chatMsgResult: any = await this.chatMessageService.aggregate(aggregateStmt);

        if (chatMsgResult) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully create chatroom', chatMsgResult);
            return res.status(200).send(successResponse);
        } else {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully create chatroom', []);
            return res.status(200).send(successResponse);
        }
    }

    /**
     * @api {get} /api/chatroom/list List Chat Room
     * @apiGroup ChatRoom
     * @apiParam (Request param) {String} asPageId asPageId
     * @apiParam (Request param) {number} offset offset
     * @apiParam (Request param) {number} limit limit
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully List chat message",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/chatroom/list
     * @apiErrorExample {json} chat message error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/list')
    @Authorized('user')
    public async searchChatRoom(@QueryParam('aspage') asPageId: string, @QueryParam('offset') offset: number, @QueryParam('limit') limit: number, @Res() res: any, @Req() req: any): Promise<any> {
        let senderObjId = new ObjectID(req.user.id);

        if (asPageId !== undefined && asPageId !== '') {
            const pageObjId = new ObjectID(asPageId);
            const page = await this.pageService.findOne({ _id: pageObjId });

            if (!page) {
                const errorResponse = ResponseUtil.getErrorResponse('Successfully search chatroom', []);
                return res.status(400).send(errorResponse);
            } else {
                // check accessibility
                const pageAccess = await this.pageAccessLevelService.getUserAccessByPage(req.user.id, asPageId);

                if (pageAccess) {
                    let isCanAccess = false;
                    for (const access of pageAccess) {
                        if (access.level === PAGE_ACCESS_LEVEL.OWNER ||
                            access.level === PAGE_ACCESS_LEVEL.ADMIN ||
                            access.level === PAGE_ACCESS_LEVEL.MODERATOR) {
                            isCanAccess = true;
                            break;
                        }
                    }

                    if (!isCanAccess) {
                        const errorResponse = ResponseUtil.getErrorResponse('User can not access page.', undefined);
                        return res.status(400).send(errorResponse);
                    }
                } else {
                    const errorResponse = ResponseUtil.getErrorResponse('User can not access page.', undefined);
                    return res.status(400).send(errorResponse);
                }

                senderObjId = page;
            }
        }

        const searchFilter = new SearchFilter();
        searchFilter.limit = limit;
        searchFilter.offset = offset;
        searchFilter.whereConditions = {
            participants: {
                $in: [senderObjId]
            },
            deleted: false
        };
        searchFilter.orderBy = {
            createdDate: 'DESC'
        };
        const result = await this.chatRoomService.search(searchFilter);

        if (result) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully search chatroom', result);
            return res.status(200).send(successResponse);
        } else {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully search chatroom', []);
            return res.status(200).send(successResponse);
        }
    }

    /**
     * @api {get} /api/chatroom/:id/message  Finding chat by User room API
     * @apiGroup ChatRoom
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     *      {
     *      "message": "Successfully got chats",
     *      "data":{
     *      "name" : "",
     *      "link" : "",
     *      "logo_url" : "" 
     *      }
     *      "status": "1"
     *      }
     * @apiSampleRequest /api/chatroom/:id/message
     * @apiErrorExample {json} chat error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id/message')
    @Authorized('user')
    public async getRoomChatMessage(@Param('id') roomId: string, @QueryParam('asPage') asPage: string, @QueryParam('offset') offset: number, @QueryParam('limit') limit: number, @Res() res: any, @Req() req: any): Promise<ChatMessageResponse> {
        const senderObjId = new ObjectID(req.user.id);

        // search room if exist
        const roomObjId = new ObjectID(roomId);
        const room: ChatRoom = await this.chatRoomService.findOne({ _id: roomObjId, deleted: false });

        // check accessibility
        if (!room) {
            const errorResponse = ResponseUtil.getErrorResponse('ChatRoom was not found.', undefined);
            return res.status(400).send(errorResponse);
        } else {
            // check if asPage valid
            let page = undefined;
            let canAccessPage = undefined;
            if (asPage !== undefined && asPage !== '') {
                page = await this.pageService.findOne({ _id: new ObjectID(asPage) });

                if (page === undefined || page === null) {
                    const errorResponse = ResponseUtil.getErrorResponse('Page was not Found.', undefined);
                    return res.status(400).send(errorResponse);
                }

                canAccessPage = await this.isCanAccessPage(req.user.id, asPage);
                if (!canAccessPage) {
                    const errorResponse = ResponseUtil.getErrorResponse('User can not access the page.', undefined);
                    return res.status(400).send(errorResponse);
                }
            }

            let inRoom = false;
            if (room.participants !== undefined) {
                for (const pp of room.participants) {
                    const sender = pp.sender;
                    const senderType = pp.senderType;

                    if (sender === undefined || senderType === undefined) {
                        continue;
                    }

                    let matchSender = senderObjId;
                    let matchType = USER_TYPE.USER;
                    if (page !== undefined && page !== '') {
                        matchType = USER_TYPE.PAGE;
                        matchSender = page;
                    }

                    if (matchType !== senderType) {
                        continue;
                    }

                    if (sender.equals(matchSender)) {
                        inRoom = true;
                        break;
                    }
                }
            }

            if (canAccessPage === undefined && !inRoom) {
                const errorResponse = ResponseUtil.getErrorResponse('This user cannot access the chatroom.', undefined);
                return res.status(400).send(errorResponse);
            }
        }

        const searchFilter = new SearchFilter();
        searchFilter.limit = limit;
        searchFilter.offset = offset;
        searchFilter.whereConditions = {
            room: room.id,
            deleted: false
        };
        searchFilter.orderBy = {
            createdDate: 'ASC'
        };

        const pageIds = [];
        const userIds = [];
        const pageAddedIds = [];
        const userAddedIds = [];
        const chatMsgResult = await this.chatMessageService.search(searchFilter);
        for (const chatMsg of chatMsgResult) {
            const senderId = chatMsg.sender + '';
            const senderType = chatMsg.senderType;

            if (senderType === CHAT_ROOM_TYPE.USER) {
                if (userAddedIds.indexOf(senderId) <= -1) {
                    userAddedIds.push(senderId);
                    userIds.push(new ObjectID(senderId));
                }
            } else if (senderType === CHAT_ROOM_TYPE.PAGE) {
                if (pageAddedIds.indexOf(senderId) <= -1) {
                    pageAddedIds.push(senderId);
                    pageIds.push(new ObjectID(senderId));
                }
            }
        }

        const userWhereStmt = {
            _id: { $in: userIds }
        };
        const pageWhereStmt: SearchFilter = new SearchFilter();
        pageWhereStmt.whereConditions = {
            _id: { $in: pageIds }
        };

        const searchUser = await this.userService.search(undefined, undefined, undefined, undefined, userWhereStmt, undefined, undefined);
        const searchPage = await this.pageService.search(pageWhereStmt);

        const pageMap = {};
        const userMap = {};
        for (const user of searchUser) {
            const uid = user.id + '';
            userMap[uid] = user;
        }

        for (const pg of searchPage) {
            const pid = pg.id + '';
            pageMap[pid] = pg;
        }

        const responseResult: ChatMessageResponse[] = this.createChatMessageResponse(chatMsgResult, userMap, pageMap, req.user.id, asPage);

        const successResponse = ResponseUtil.getSuccessResponse('Successfully got chats', responseResult);
        return res.status(200).send(successResponse);
    }

    /**
     * @api {post} /api/chatroom/:id Create Chat Message to User room
     * @apiGroup ChatRoom
     * @apiParam (Request body) {String} message message
     * @apiParam (Request body) {any} asset asset
     * @apiParam (Request body) {String} videoURL videoURL
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully Created chat message",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/chatroom/:id
     * @apiErrorExample {json} chat message error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:id/message')
    @Authorized('user')
    public async createChatMessageBy(@Param('id') roomId: string, @Body({ validate: true }) message: ChatMessageRequest, @Res() res: any, @Req() req: any): Promise<ChatMessageResponse> {
        const senderObjId = new ObjectID(req.user.id);

        // find room
        const roomObjId = new ObjectID(roomId);
        const room: ChatRoom = await this.chatRoomService.findOne({ _id: roomObjId, deleted: false });

        if (room === undefined || room === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Chatroom was not Found.', undefined);
            return res.status(400).send(errorResponse);
        }

        let sender = senderObjId;
        let senderType = CHAT_ROOM_TYPE.USER;
        if (message.asPageId !== undefined && message.asPageId !== '') {
            const page = await this.pageService.findOne({ _id: new ObjectID(message.asPageId) });

            if (page === undefined || page === null) {
                const errorResponse = ResponseUtil.getErrorResponse('Page was not Found.', undefined);
                return res.status(400).send(errorResponse);
            }

            sender = page.id;
            senderType = CHAT_ROOM_TYPE.PAGE;
        }

        let fileID = undefined;
        let filePath = undefined;
        let videoURL = undefined;

        if (message.asset !== undefined && message.asset !== null) {
            // create file
            const mimeType = message.asset.mimeType;
            const fileName = req.user.id + FileUtil.renameFile();
            const asset: Asset = new Asset();
            asset.scope = ASSET_SCOPE.PUBLIC;
            asset.userId = senderObjId;
            asset.fileName = fileName;
            asset.data = message.asset.data;
            asset.mimeType = mimeType;
            asset.size = message.asset.size;
            asset.expirationDate = null;

            const createdAsset = await this.assetService.create(asset);
            fileID = createdAsset ? createdAsset.id : undefined;

            if (createdAsset.mimeType.includes('image')) {
                filePath = createdAsset ? ASSET_PATH + createdAsset.id : undefined;
            } else if (createdAsset.mimeType.includes('video')) {
                videoURL = createdAsset ? ASSET_PATH + createdAsset.id : undefined;
            }
        }

        const chatMsg: ChatMessage = new ChatMessage();
        chatMsg.sender = sender;
        chatMsg.senderType = senderType;
        chatMsg.room = room.id;
        chatMsg.fileId = fileID;
        chatMsg.filePath = filePath;
        chatMsg.videoURL = videoURL;
        chatMsg.deleted = false;
        chatMsg.isRead = false;
        chatMsg.createdByUsername = req.user.username;
        chatMsg.createdBy = senderObjId;
        chatMsg.message = message.message;
        chatMsg.messageType = message.messageType;
        if (chatMsg.messageType === undefined || chatMsg.messageType === null || chatMsg.messageType === '') {
            chatMsg.messageType = CHAT_MESSAGE_TYPE.INFO;
        }

        const chatMsgResult: any = await this.chatMessageService.createChatMessage(chatMsg);

        const msgResp = new ChatMessageResponse();
        if (chatMsgResult) {
            const senderId = chatMsgResult.sender + '';
            const messageSenderType = chatMsgResult.senderType;
            let senderName = '-';
            let senderImg = undefined;

            if (messageSenderType === CHAT_ROOM_TYPE.USER) {
                const user = await this.userService.findOne({ _id: new ObjectID(senderId) });
                if (user !== undefined) {
                    senderName = user.displayName;
                    senderImg = user.imageURL;
                }
            } else if (messageSenderType === CHAT_ROOM_TYPE.PAGE) {
                const page = await this.pageService.findOne({ _id: new ObjectID(senderId) });
                if (page !== undefined) {
                    senderName = page.name;
                    senderImg = page.imageURL;
                }
            }

            msgResp.chatMessage = chatMsgResult;
            msgResp.senderType = messageSenderType;
            msgResp.senderName = senderName;
            msgResp.senderImage = senderImg;
        }

        if (chatMsgResult) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully search chat message', msgResp);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable to create chat message', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    private async isCanAccessPage(userId: string, asPageId: string): Promise<boolean> {
        // check accessibility
        const pageAccess = await this.pageAccessLevelService.getUserAccessByPage(userId, asPageId);

        if (pageAccess) {
            let isCanAccess = false;
            for (const access of pageAccess) {
                if (access.level === PAGE_ACCESS_LEVEL.OWNER ||
                    access.level === PAGE_ACCESS_LEVEL.ADMIN ||
                    access.level === PAGE_ACCESS_LEVEL.MODERATOR) {
                    isCanAccess = true;
                    break;
                }
            }

            if (!isCanAccess) {
                return false;
            }
        } else {
            return false;
        }

        return true;
    }

    private createChatMessageResponse(chatMsgs: ChatMessage[], userMap: any, pageMap: any, userId: string, asPage?: string): ChatMessageResponse[] {
        if (chatMsgs === undefined || chatMsgs.length <= 0) {
            return [];
        }

        if (userMap === undefined) {
            userMap = {};
        }

        if (pageMap === undefined) {
            pageMap = {};
        }

        const result: ChatMessageResponse[] = [];
        for (const msg of chatMsgs) {

            const senderId = msg.sender + '';
            const senderType = msg.senderType;
            let senderName = '-';
            let senderImg = undefined;

            if (senderType === CHAT_ROOM_TYPE.USER) {
                const user = userMap[senderId];
                if (user !== undefined) {
                    senderName = user.displayName;
                    senderImg = user.imageURL;
                }
            } else if (senderType === CHAT_ROOM_TYPE.PAGE) {
                const page = pageMap[senderId];
                if (page !== undefined) {
                    senderName = page.name;
                    senderImg = page.imageURL;
                }
            }

            const msgResp = new ChatMessageResponse();
            msgResp.chatMessage = msg;
            msgResp.senderType = senderType;
            msgResp.senderName = senderName;
            msgResp.senderImage = senderImg;
            msgResp.senderIsRead = false;

            // check isRead as a user or page.
            if (asPage !== undefined && asPage !== '') {
                if (msg.readers !== undefined && Array.isArray(msg.readers)) {
                    let senderIsReadVal = false;
                    for (const reader of msg.readers) {
                        if (reader.senderType === CHAT_ROOM_TYPE.PAGE &&
                            ((reader.sender + '') === (asPage + ''))) {
                            senderIsReadVal = true;
                            break;
                        }
                    }
                    msgResp.senderIsRead = senderIsReadVal;
                }
            } else if (userId !== undefined && userId !== '') {
                if (msg.readers !== undefined && Array.isArray(msg.readers)) {
                    let senderIsReadVal = false;
                    for (const reader of msg.readers) {
                        if (reader.senderType === CHAT_ROOM_TYPE.USER &&
                            ((reader.sender + '') === (userId + ''))) {
                            senderIsReadVal = true;
                            break;
                        }
                    }
                    msgResp.senderIsRead = senderIsReadVal;
                }
            }

            result.push(msgResp);
        }

        return result;
    }
}
