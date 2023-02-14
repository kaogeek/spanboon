/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { FacebookWebhookLogsRepository } from '../repositories/FacebookWebhookLogsRepository';
import { PostsService } from './PostsService';
import { SearchUtil } from '../../utils/SearchUtil';
@Service()
export class FacebookWebhookLogsService {
    constructor(@OrmRepository() 
    private fbLogRepository: FacebookWebhookLogsRepository,
    private postsService:PostsService) { }

    // create actionLog
    public async create(actionLog: any): Promise<any> {
        return await this.fbLogRepository.save(actionLog);
    }

    // find one actionLog
    public async findOne(actionLog: any): Promise<any> {
        return await this.fbLogRepository.findOne(actionLog);
    }

    // find all actionLog
    public async findAll(): Promise<any> {
        return await this.fbLogRepository.find();
    }

    // edit actionLog
    public async update(query: any, newValue: any): Promise<any> {
        return await this.fbLogRepository.updateOne(query, newValue);
    }

    // delete actionLog
    public async delete(query: any, options?: any): Promise<any> {
        return await this.fbLogRepository.deleteOne(query, options);
    }

    // search
    public searchScores(): Promise<any> {
        const limit = 6;
        const offset = 0;
        const select = undefined;
        const whereConditions = {'newsFlag':false};      
        const count = {};
        const orderingSort = { 'likeCountFB':-1,'commentCountFB':-1,'shareCountFB':-1,'likeCount':-1,'commentCount':-1,'shareCount':-1};
        const condition: any = SearchUtil.createFindCondition(limit,offset,select,whereConditions,count,orderingSort);
        return this.postsService.find(condition);

    }
}
