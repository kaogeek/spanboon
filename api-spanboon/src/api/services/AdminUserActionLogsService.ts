/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { SearchUtil } from '../../utils/SearchUtil';
import { AdminUserActionLogsRepository } from '../repositories/AdminUserActionLogsRepository';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';

@Service()
export class AdminUserActionLogsService {
    constructor(@OrmRepository() private actionLogRepository: AdminUserActionLogsRepository) { }

    // create actionLog
    public async create(actionLog: any): Promise<any> {
        return await this.actionLogRepository.save(actionLog);
    }

    // find one actionLog
    public async findOne(actionLog: any): Promise<any> {
        return await this.actionLogRepository.findOne(actionLog);
    }

    // find all actionLog
    public async findAll(): Promise<any> {
        return await this.actionLogRepository.find();
    }

    // edit actionLog
    public async update(query: any, newValue: any): Promise<any> {
        return await this.actionLogRepository.updateOne(query, newValue);
    }

    // actionLog List
    public async search(filter: SearchFilter): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy);
        if (filter.count) {
            return await this.actionLogRepository.count(condition);
        } else {
            return await this.actionLogRepository.find(condition);
        }
    }

    // delete actionLog
    public async delete(query: any, options?: any): Promise<any> {
        return await this.actionLogRepository.deleteOne(query, options);
    }
}
