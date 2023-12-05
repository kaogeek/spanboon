/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { NewsClickRepository } from '../repositories/NewsClickRepository';
import { SearchUtil } from '../../utils/SearchUtil';
@Service()
export class NewsClickService {

    constructor(
        @OrmRepository() private newsClickRepository: NewsClickRepository,
        @Logger(__filename) private log: LoggerInterface) {
    }

    // create Device token and find the user who is login !!!!!
    public async create(data: any): Promise<any> {
        this.log.info('Create a newsClicks');
        return await this.newsClickRepository.save(data);
    }

    public async findOne(findCondition: any): Promise<any> {
        return await this.newsClickRepository.findOne(findCondition);
    }

    public async find(findCondition?: any): Promise<any> {
        return await this.newsClickRepository.find(findCondition);
    }

    public async delete(query: any, options?: any): Promise<any> {
        this.log.info('Delete a newsClicks');
        return await this.newsClickRepository.deleteOne(query, options);
    }

    public async update(query: any, newValue: any): Promise<any> {
        this.log.info('Update a newsClicks');

        return await this.newsClickRepository.updateOne(query, newValue);
    }

    public async aggregate(query: any, options?: any): Promise<any[]> {
        return await this.newsClickRepository.aggregate(query, options).toArray();
    }
    public async findOneAndUpdate(query: any, update: any, options?: any): Promise<any> {
        return await this.newsClickRepository.findOneAndUpdate(query, update, options);
    }

    public search(limit: number, offset: number, select: any = [], relation: any[], whereConditions: any = [], orderBy: any, count: boolean): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(limit, offset, select, relation, whereConditions, orderBy);
        if (count) {
            return this.newsClickRepository.count();
        } else {
            return this.find(condition);
        }
    }
}
