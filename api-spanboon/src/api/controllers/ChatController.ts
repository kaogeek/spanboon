/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { JsonController, Delete, Param, Res, Req, Authorized, Body, Post, QueryParam } from 'routing-controllers';
import { ChatMessageService } from '../services/ChatMessageService';
import { PageAccessLevelService } from '../services/PageAccessLevelService';
import { PageService } from '../services/PageService';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { ObjectID } from 'mongodb';
import { CHAT_ROOM_TYPE } from '../../constants/ChatRoomType';
import { PageAccessLevel } from '../models/PageAccessLevel';
import { PAGE_ACCESS_LEVEL } from '../../constants/PageAccessLevel';

@JsonController('/chat')
export class ChatController {
    constructor(private chatMessageService: ChatMessageService, private pageService: PageService, private pageAccessLevelService: PageAccessLevelService) { }

    /**
     * @api {post} /api/chat/:id Create Chat Message to User room
     * @apiGroup Chat
     * @apiParam (Request body) {String} message message
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
     * @apiSampleRequest /api/chat/user/:id
     * @apiErrorExample {json} chat message error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/:id')
    @Authorized('user')
    public async createChatMessageBy(@Param('id') chatMsgId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const senderObjId = new ObjectID(req.user.id);

        // find receiverID
        const msgObjId = new ObjectID(chatMsgId);
        const chatMessage = await this.chatMessageService.findOne({ _id: msgObjId, deleted: false, createdBy: senderObjId });

        if (chatMessage) {
            chatMessage.deleted = true;
            await this.chatMessageService.deleteChatMessage(chatMsgId);

            const successResponse = ResponseUtil.getSuccessResponse('Successfully delete chat message', undefined);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable to delete chat message. Message Not Found.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/chat/read Mark Read Chat Message
     * @apiGroup Chat
     * @apiParam (Request body) {String[]} messageId messageId
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
     * @apiSampleRequest /api/chat/read
     * @apiErrorExample {json} chat message error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/read')
    @Authorized('user')
    public async markReadChatMessage(@Body({ validate: true }) chatIds: string[], @QueryParam('asPage') asPage: string, @Res() res: any, @Req() req: any): Promise<any> {
        if (chatIds === undefined || chatIds.length <= 0) {
            const successResponse = ResponseUtil.getSuccessResponse('No message to mark read.', undefined);
            return res.status(200).send(successResponse);
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

        // find receiverID
        const msgObjIds = [];
        for (const chatMsgId of chatIds) {
            msgObjIds.push(new ObjectID(chatMsgId));
        }
        let sender = new ObjectID(req.user.id);
        let senderType = CHAT_ROOM_TYPE.USER;

        if (page !== undefined) {
            const pageAccess: PageAccessLevel[] = await this.pageAccessLevelService.getUserAccessByPage(req.user.id, asPage);
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

        const reader = this.getReader(sender, senderType);
        // add reader in array
        await this.chatMessageService.updateMany({ room: { $in: msgObjIds }, deleted: false },
            {
                $set: {
                    isRead: true
                },
                $addToSet: {
                    readers: reader
                }
            }
        );
        const updateResult = await this.chatMessageService.find({ room:msgObjIds, deleted: false });

        if (updateResult) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully mark read chat message', updateResult);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable to mark read chat message. Message Not Found.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    private getReader(senderId: ObjectID, senderType: string): any {
        if (senderId === undefined || senderId === null || senderId === '') {
            return undefined;
        }

        if (senderType === undefined || senderType === null || senderType === '') {
            return undefined;
        }

        return {
            sender: senderId,
            senderType
        };
    }
}
