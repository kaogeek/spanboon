/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { SearchUtil } from '../../utils/SearchUtil';
import { PageUsageHistoryRepository } from '../repositories/PageUsageHistoryRepository';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';

@Service()
export class PageUsageHistoryService {
    constructor(@OrmRepository() private pageUsageHistoryRepository: PageUsageHistoryRepository) { }

    // create pageUsageHistory
    public async create(pageUsageHistory: any): Promise<any> {
        return await this.pageUsageHistoryRepository.save(pageUsageHistory);
    }

    // find one pageUsageHistory
    public async findOne(pageUsageHistory: any): Promise<any> {
        return await this.pageUsageHistoryRepository.findOne(pageUsageHistory);
    }

    // find all pageUsageHistory
    public async findAll(): Promise<any> {
        return await this.pageUsageHistoryRepository.find();
    }

    // edit pageUsageHistory
    public async update(query: any, newValue: any): Promise<any> {
        return await this.pageUsageHistoryRepository.updateOne(query, newValue);
    }

    // pageUsageHistory List
    public async search(filter: SearchFilter): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy);
        if (filter.count) {
            return await this.pageUsageHistoryRepository.count(condition);
        } else {
            return await this.pageUsageHistoryRepository.find(condition);
        }
    }

    // delete pageUsageHistory
    public async delete(query: any, options?: any): Promise<any> {
        return await this.pageUsageHistoryRepository.deleteOne(query, options);
    }

    // deleteMany
    public async deleteMany(query: any, options?: any): Promise<any> {
        return await this.pageUsageHistoryRepository.deleteMany(query, options);
    }
}
