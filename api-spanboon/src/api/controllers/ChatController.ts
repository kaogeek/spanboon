/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { JsonController, Delete, Param, Res, Req, Authorized, Body, Post } from 'routing-controllers';
import { ChatMessageService } from '../services/ChatMessageService';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { ObjectID } from 'mongodb';

@JsonController('/chat')
export class ChatController {
    constructor(private chatMessageService: ChatMessageService) { }

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
    public async markReadChatMessage(@Body({ validate: true }) chatIds: string[], @Res() res: any, @Req() req: any): Promise<any> {
        if (chatIds === undefined || chatIds.length <= 0) {
            const successResponse = ResponseUtil.getSuccessResponse('No message to mark read.', undefined);
            return res.status(200).send(successResponse);
        }

        // find receiverID
        const msgObjIds = [];
        for (const chatMsgId of chatIds) {
            msgObjIds.push(new ObjectID(chatMsgId));
        }

        await this.chatMessageService.updateMany({ _id: { $in: msgObjIds }, deleted: false },
            {
                $set: {
                    isRead: true
                }
            }
        );
        const updateResult = await this.chatMessageService.find({ _id: { $in: msgObjIds }, deleted: false });

        if (updateResult) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully mark read chat message', updateResult);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable to mark read chat message. Message Not Found.', undefined);
            return res.status(400).send(errorResponse);
        }
    }
}
