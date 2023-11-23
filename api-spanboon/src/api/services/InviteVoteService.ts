/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { InviteVoteModelRepository } from '../repositories/InviteVoteRepository';
@Service()
export class InviteVoteService {

    constructor(
        @OrmRepository() private inviteVoteModelRepository: InviteVoteModelRepository,
        @Logger(__filename) private log: LoggerInterface) {
    }

    // create Device token and find the user who is login !!!!!
    public async create(data: any): Promise<any> {
        this.log.info('Create a InviteVote.');
        return await this.inviteVoteModelRepository.save(data);
    }

    public async findOne(findCondition: any): Promise<any> {
        return await this.inviteVoteModelRepository.findOne(findCondition);
    }

    public async find(findCondition?: any): Promise<any> {
        return await this.inviteVoteModelRepository.find(findCondition);
    }

    public async delete(query: any, options?: any): Promise<any> {
        this.log.info('Delete a InviteVote.');
        return await this.inviteVoteModelRepository.deleteOne(query, options);
    }
    public async deleteMany(query: any, options?: any): Promise<any> {
        return await this.inviteVoteModelRepository.deleteMany(query, options);
    }
    public async update(query: any, newValue: any): Promise<any> {
        this.log.info('Update a InviteVote.');

        return await this.inviteVoteModelRepository.updateOne(query, newValue);
    }

    public async aggregate(query: any, options?: any): Promise<any[]> {
        return await this.inviteVoteModelRepository.aggregate(query, options).toArray();
    }
}
