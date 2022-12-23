/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { UserReport } from '../models/UserReport';
import { UserReportRepository } from '../repositories/UserReportRepository';
import { SearchUtil } from '../../utils/SearchUtil';

@Service()
export class UserReportService {

    constructor(@OrmRepository() private userReportRepository: UserReportRepository) { }

    // find userReport
    public async find(findCondition: any): Promise<UserReport[]> {
        return this.userReportRepository.find(findCondition);
    }

    // find userReport
    public findOne(findCondition: any): Promise<UserReport> {
        return this.userReportRepository.findOne(findCondition);
    }

    // create userReport
    public async create(userReport: UserReport): Promise<UserReport> {
        return await this.userReportRepository.save(userReport);
    }

    // update userReport
    public async update(query: any, newValue: any): Promise<any> {
        return await this.userReportRepository.updateOne(query, newValue);
    }

    // delete userReport
    public async delete(query: any, options?: any): Promise<any> {
        return await this.userReportRepository.deleteOne(query, options);
    }

    // aggregate userReport
    public aggregate(query: any, options?: any): Promise<any[]> {
        return this.userReportRepository.aggregate(query, options).toArray();
    }

    // Search UserReport
    public search(limit: number, offset: number, select: any[], relation: any, whereConditions: any, orderBy: any, count: boolean): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(limit, offset, select, relation, whereConditions, orderBy);

        if (count) {
            return this.userReportRepository.count(whereConditions);
        } else {
            return this.userReportRepository.find(condition);
        }
    }
}
