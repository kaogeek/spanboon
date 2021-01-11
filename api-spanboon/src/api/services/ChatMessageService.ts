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
import { ObjectID } from 'typeorm';

@Service()
export class ChatMessageService {

    constructor(@OrmRepository() private chatMessageRepository: ChatMessageRepository) { }

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

        if(chatMessage === undefined || chatMessage === null){
            return Promise.resolve(undefined);
        }

        chatMessage.isRead = false;
        chatMessage.deleted = false;

        // do send notification if implement

        return await this.create(chatMessage);
    }
}