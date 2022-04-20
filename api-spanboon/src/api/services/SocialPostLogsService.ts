/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { SearchUtil } from '../../utils/SearchUtil';
import { SocialPostLogsRepository } from '../repositories/SocialPostLogsRepository';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';

@Service()
export class SocialPostLogsService {
    constructor(@OrmRepository() private socialPostLogsRepository: SocialPostLogsRepository) { }

    // create socialPostLog
    public async create(socialPostLog: any): Promise<any> {
        return await this.socialPostLogsRepository.save(socialPostLog);
    }

    // find one socialPostLog
    public async findOne(socialPostLog: any): Promise<any> {
        return await this.socialPostLogsRepository.findOne(socialPostLog);
    }

    // find all socialPostLog
    public async findAll(): Promise<any> {
        return await this.socialPostLogsRepository.find();
    }

    // edit socialPostLog
    public async update(query: any, newValue: any): Promise<any> {
        return await this.socialPostLogsRepository.updateOne(query, newValue);
    }

    // socialPostLog List
    public async search(filter: SearchFilter): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy);
        if (filter.count) {
            return await this.socialPostLogsRepository.count(condition);
        } else {
            return await this.socialPostLogsRepository.find(condition);
        }
    }

    // delete socialPostLog
    public async delete(query: any, options?: any): Promise<any> {
        return await this.socialPostLogsRepository.deleteOne(query, options);
    }
}
