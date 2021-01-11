/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { ObjectID } from 'mongodb';
import { ChatRoom } from '../models/ChatRoom';
import { ChatRoomRepository } from '../repositories/ChatRoomRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';
import { CHAT_ROOM_TYPE } from '../../constants/ChatRoomType';
import { ChatMessageService } from '../services/ChatMessageService';
import { USER_TYPE } from '../../constants/NotificationType';

@Service()
export class ChatRoomService {

    constructor(@OrmRepository() private chatRoomRepository: ChatRoomRepository,
        private chatMessageService: ChatMessageService) { }

    // find post
    public async find(findCondition: any): Promise<ChatRoom[]> {
        return await this.chatRoomRepository.find(findCondition);
    }

    // find post
    public async findOne(findCondition: any): Promise<ChatRoom> {
        return await this.chatRoomRepository.findOne(findCondition);
    }

    // create post
    public async create(post: ChatRoom): Promise<ChatRoom> {
        return await this.chatRoomRepository.save(post);
    }

    // update post
    public update(query: any, newValue: any): Promise<any> {
        return this.chatRoomRepository.updateOne(query, newValue);
    }

    // delete post
    public async delete(query: any, options?: any): Promise<any> {
        return await this.chatRoomRepository.deleteOne(query, options);
    }

    // aggregate post
    public async aggregate(query: any, options?: any): Promise<any[]> {
        return await this.chatRoomRepository.aggregate(query, options).toArray();
    }

    // find ChatRoom Agg
    public aggregateEntity(query: any, options?: any): Promise<ChatRoom[]> {
        return this.chatRoomRepository.aggregateEntity(query, options).toArray();
    }

    // select distinct post
    public async distinct(key: any, query: any, options?: any): Promise<any> {
        return await this.chatRoomRepository.distinct(key, query, options);
    }

    public async findChatRoom(senderId: ObjectID, receiverId: ObjectID, roomType: string, deleted?: boolean): Promise<ChatRoom> {
        return await this.findOne({ type: roomType, participants: { $all: [senderId, receiverId] }, deleted });
    }

    public async findFulfillmentChatRoom(senderId: ObjectID, fulfillmentCaseId: ObjectID, deleted?: boolean): Promise<ChatRoom> {
        return await this.findOne({ typeId: fulfillmentCaseId, type: CHAT_ROOM_TYPE.FULFILLMENT, participants: { $all: [{sender: senderId, senderType: USER_TYPE.USER}] }, deleted });
    }

    public async deleteChatRoom(id: string): Promise<any> {
        // find room
        const room = await this.findOne({ _id: new ObjectID(id) });

        if (!room) {
            return undefined;
        }

        // set flag delete
        await this.update({ _id: new Object(id) }, { $set: { deleted: true } });

        // search all chat message
        const result = await this.chatMessageService.getChatMessageInRoom(id);
        for (const msg of result) {
            await this.chatMessageService.deleteChatMessage(msg.id);
        }

        room.deleted = true;
        return room;
    }

    // Search Post
    public search(search: SearchFilter): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(search.limit, search.offset, search.select, search.relation, search.whereConditions, search.orderBy);

        if (search.count) {
            return this.chatRoomRepository.count(search.whereConditions);
        } else {
            return this.chatRoomRepository.find(condition);
        }
    }

}