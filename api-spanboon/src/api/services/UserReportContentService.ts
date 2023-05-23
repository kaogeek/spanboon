/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { UserReportContent } from '../models/UserReportContent';
import { UserReportContentRepository } from '../repositories/UserReportContentRepository';
import { SearchUtil } from '../../utils/SearchUtil';

@Service()
export class UserReportContentService {

    constructor(@OrmRepository() private userReportContentRepository: UserReportContentRepository) { }

    // find UserReportContent
    public async find(findCondition: any): Promise<UserReportContent[]> {
        return this.userReportContentRepository.find(findCondition);
    }

    // find UserReportContent
    public findOne(findCondition: any): Promise<UserReportContent> {
        return this.userReportContentRepository.findOne(findCondition);
    }

    // create UserReportContent
    public async create(userReport: UserReportContent): Promise<UserReportContent> {
        return await this.userReportContentRepository.save(userReport);
    }

    // update UserReportContent
    public async update(query: any, newValue: any): Promise<any> {
        return await this.userReportContentRepository.updateOne(query, newValue);
    }

    // delete UserReportContent
    public async delete(query: any, options?: any): Promise<any> {
        return await this.userReportContentRepository.deleteOne(query, options);
    }

    // aggregate UserReportContent
    public aggregate(query: any, options?: any): Promise<any[]> {
        return this.userReportContentRepository.aggregate(query, options).toArray();
    }

    // Search UserReportContent
    public search(limit: number, offset: number, select: any[], relation: any, whereConditions: any, orderBy: any, count: boolean): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(limit, offset, select, relation, whereConditions, orderBy);

        if (count) {
            return this.userReportContentRepository.count(whereConditions);
        } else {
            return this.userReportContentRepository.find(condition);
        }
    }
}