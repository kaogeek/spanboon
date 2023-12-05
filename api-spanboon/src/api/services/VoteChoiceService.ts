/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { VoteChoiceRepository } from '../repositories/VoteChoiceRepository';
@Service()
export class VoteChoiceService {

    constructor(
        @OrmRepository() private voteChoiceRepository: VoteChoiceRepository,
        @Logger(__filename) private log: LoggerInterface) {
    }

    // create Device token and find the user who is login !!!!!
    public async create(data: any): Promise<any> {
        this.log.info('Create a vote choice.');
        return await this.voteChoiceRepository.save(data);
    }

    public async findOne(findCondition: any): Promise<any> {
        return await this.voteChoiceRepository.findOne(findCondition);
    }

    public async findPeople(findCondition?: any): Promise<any> {
        return await this.voteChoiceRepository.find(findCondition);
    }

    public async find(findCondition?: any): Promise<any> {
        return await this.voteChoiceRepository.find(findCondition);
    }

    public async delete(query: any, options?: any): Promise<any> {
        this.log.info('Delete a vote choice.');
        return await this.voteChoiceRepository.deleteOne(query, options);
    }
    public async deleteMany(query: any, options?: any): Promise<any> {
        return await this.voteChoiceRepository.deleteMany(query, options);
    }
    public async update(query: any, newValue: any): Promise<any> {
        this.log.info('Update a vote choice.');

        return await this.voteChoiceRepository.updateOne(query, newValue);
    }

    public async updateMany(query: any, newValue: any): Promise<any> {
        this.log.info('UpdateMany a vote choice.');

        return await this.voteChoiceRepository.updateMany(query, newValue);
    }

    public async aggregate(query: any, options?: any): Promise<any[]> {
        return await this.voteChoiceRepository.aggregate(query, options).toArray();
    }
}
