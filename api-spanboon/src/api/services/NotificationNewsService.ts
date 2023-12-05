/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { NotificationNewsRepository } from '../repositories/NotificationNewsRepository';
import { SearchUtil } from '../../utils/SearchUtil';
@Service()
export class NotificationNewsService {

    constructor(
        @OrmRepository() private notificationNewsRepository: NotificationNewsRepository,
        @Logger(__filename) private log: LoggerInterface) {
    }

    // create Device token and find the user who is login !!!!!
    public async create(data: any): Promise<any> {
        this.log.info('create notification.');
        return await this.notificationNewsRepository.save(data);
    }

    public async findOne(findCondition: any): Promise<any> {
        return await this.notificationNewsRepository.findOne(findCondition);
    }

    public async find(findCondition?: any): Promise<any> {
        return await this.notificationNewsRepository.find(findCondition);
    }

    public async delete(query: any, options?: any): Promise<any> {
        this.log.info('Delete a token');
        return await this.notificationNewsRepository.deleteOne(query, options);
    }

    public async update(query: any, newValue: any): Promise<any> {
        this.log.info('Update a token');

        return await this.notificationNewsRepository.updateOne(query, newValue);
    }

    public aggregate(query: any, options?: any): Promise<any[]> {
        return this.notificationNewsRepository.aggregate(query, options).toArray();
    }
    public search(limit: number, offset: number, select: any = [], relation: any[], whereConditions: any = [], orderBy: any, count: boolean): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(limit, offset, select, relation, whereConditions, orderBy);
        if (count) {
            return this.notificationNewsRepository.count();
        } else {
            return this.find(condition);
        }
    }
}
