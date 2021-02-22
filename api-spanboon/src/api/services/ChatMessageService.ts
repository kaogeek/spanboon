/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { ChatMessage } from '../models/ChatMessage';
import { ChatMessageRepository } from '../repositories/ChatMessageRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';
import { ObjectID } from 'mongodb';
import { NotificationService } from '../services/NotificationService';
import { ChatRoomService } from '../services/ChatRoomService';
import { PageAccessLevelService } from '../services/PageAccessLevelService';
import { NOTIFICATION_TYPE, USER_TYPE } from '../../constants/NotificationType';

@Service()
export class ChatMessageService {

    constructor(@OrmRepository() private chatMessageRepository: ChatMessageRepository,
        private chatRoomService: ChatRoomService, private notificationService: NotificationService,
        private pageAccessLevelService: PageAccessLevelService) { }

    // find ChatMessage
    public async find(findCondition?: any): Promise<ChatMessage[]> {
        return await this.chatMessageRepository.find(findCondition);
    }

    // find ChatMessage
    public async findOne(findCondition?: any): Promise<ChatMessage> {
        return await this.chatMessageRepository.findOne(findCondition);
    }

    // create ChatMessage
    public async create(chatMessage: ChatMessage, options?: any): Promise<ChatMessage> {
        return await this.chatMessageRepository.save(chatMessage, options);
    }

    // update ChatMessage
    public update(query: any, newValue: any, options?: any): Promise<any> {
        return this.chatMessageRepository.updateOne(query, newValue, options);
    }

    // update ChatMessage
    public updateMany(query: any, newValue: any, options?: any): Promise<any> {
        return this.chatMessageRepository.updateMany(query, newValue, options);
    }

    // delete ChatMessage
    public async delete(query: any, options?: any): Promise<any> {
        return await this.chatMessageRepository.deleteOne(query, options);
    }

    // delete ChatMessage
    public async deleteMany(query: any, options?: any): Promise<any> {
        return await this.chatMessageRepository.deleteMany(query, options);
    }

    // aggregate ChatMessage
    public async aggregate(query: any, options?: any): Promise<any[]> {
        return await this.chatMessageRepository.aggregate(query, options).toArray();
    }

    // find ChatMessage Agg
    public aggregateEntity(query: any, options?: any): Promise<ChatMessage[]> {
        return this.chatMessageRepository.aggregateEntity(query, options).toArray();
    }

    // select distinct ChatMessage
    public async distinct(key: any, query: any, options?: any): Promise<any> {
        return await this.chatMessageRepository.distinct(key, query, options);
    }

    public async deleteChatMessage(id: string): Promise<any> {
        // ! do remove noti or someting.
        return await this.update({ _id: new Object(id) }, { $set: { deleted: true } });
    }

    // order by as an object for filter
    public async getChatMessageInRoom(chatRoom: string, orderBy?: any): Promise<any> {
        const filter: any = { where: { room: new ObjectID(chatRoom) } };

        if (orderBy !== undefined && orderBy !== null && orderBy !== '') {
            filter.order = orderBy;
        }

        return await this.find(filter);
    }

    // Search ChatMessage
    public search(search: SearchFilter): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(search.limit, search.offset, search.select, search.relation, search.whereConditions, search.orderBy);

        if (search.count) {
            return this.chatMessageRepository.count(search.whereConditions);
        } else {
            return this.chatMessageRepository.find(condition);
        }
    }

    public async createChatMessage(chatMessage: ChatMessage): Promise<ChatMessage> {
        if (chatMessage === undefined || chatMessage === null) {
            return Promise.resolve(undefined);
        }

        chatMessage.isRead = false;
        chatMessage.deleted = false;

        const result = await this.create(chatMessage);

        // do send notification
        {
            try {
                // find chatroom
                const chatMsg = (chatMessage.message === undefined) ? '' : chatMessage.message;
                const mainSender = chatMessage.sender + '';
                const mainType = chatMessage.senderType;
                const chatroom = await this.chatRoomService.findOne({ _id: chatMessage.room, deleted: false });
                if (chatroom !== undefined) {
                    if (chatroom.participants !== undefined) {
                        const addedMember = [];
                        const chatroomMember = [];
                        for (const sender of chatroom.participants) {
                            const senderId = sender.sender + '';
                            const senderType = sender.senderType;
                            if (mainType === senderType && mainSender === senderId) {
                                continue;
                            }

                            // continue if duplicate member id
                            const memberKey = senderId + ':' + senderType;
                            if (addedMember.indexOf(memberKey) >= 0) {
                                continue;
                            }

                            if (senderType === USER_TYPE.PAGE) {
                                // find page admin member
                                const pageAccessList = await this.pageAccessLevelService.getAllPageUserAccess(senderId);
                                if (pageAccessList !== undefined) {
                                    for (const pa of pageAccessList) {
                                        const pageMemberKey = pa.user + ':' + USER_TYPE.USER;
                                        if (addedMember.indexOf(pageMemberKey) >= 0) {
                                            continue;
                                        }

                                        addedMember.push(pageMemberKey);
                                        chatroomMember.push({
                                            sender: pa.user,
                                            senderType: USER_TYPE.USER
                                        });
                                    }
                                }
                            }

                            addedMember.push(memberKey);
                            chatroomMember.push(sender);
                        }

                        for (const sender of chatroomMember) {
                            const senderId = sender.sender + '';
                            const senderType = sender.senderType;
                            if (mainType === senderType && mainSender === senderId) {
                                continue;
                            }

                            // create notification to every participants
                            const title = chatMsg;
                            const toUserId = senderId;
                            const toUserType = senderType;
                            const fromUserId = mainSender;
                            const fromUserType = mainType;
                            const notificationType = NOTIFICATION_TYPE.CHAT;
                            await this.notificationService.createNotification(toUserId, toUserType, fromUserId, fromUserType, notificationType, title);
                        }
                    }
                }
            } catch (err) {
                console.log(err);
            }
        }

        return result;
    }
}