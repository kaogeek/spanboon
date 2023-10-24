/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { VoteItemRepository } from '../repositories/VoteItemRepository';
@Service()
export class VoteItemService {

    constructor(
        @OrmRepository() private voteItemRepository: VoteItemRepository,
        @Logger(__filename) private log: LoggerInterface) {
    }

    // create Device token and find the user who is login !!!!!
    public async create(data: any): Promise<any> {
        this.log.info('Create a vote Item.');
        return await this.voteItemRepository.save(data);
    }

    public async findOne(findCondition: any): Promise<any> {
        return await this.voteItemRepository.findOne(findCondition);
    }

    public async findPeople(findCondition?: any): Promise<any> {
        return await this.voteItemRepository.find(findCondition);
    }

    public async find(findCondition?: any): Promise<any> {
        return await this.voteItemRepository.find(findCondition);
    }

    public async delete(query: any, options?: any): Promise<any> {
        this.log.info('Delete a vote Item.');
        return await this.voteItemRepository.deleteOne(query, options);
    }
    public async deleteMany(query: any, options?: any): Promise<any> {
        return await this.voteItemRepository.deleteMany(query, options);
    }
    public async update(query: any, newValue: any): Promise<any> {
        this.log.info('Update a vote Item.');

        return await this.voteItemRepository.updateOne(query, newValue);
    }

    public async aggregate(query: any, options?: any): Promise<any[]> {
        return await this.voteItemRepository.aggregate(query, options).toArray();
    }
}
