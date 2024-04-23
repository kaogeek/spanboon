/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { LineNewsWeekRepository } from '../repositories/LineNewsWeekRepository';
import { SearchUtil } from '../../utils/SearchUtil';
@Service()
export class LineNewsWeekService {

    constructor(
        @OrmRepository() private lineNewsWeekRepository: LineNewsWeekRepository,
        @Logger(__filename) private log: LoggerInterface) {
    }

    // create Device token and find the user who is login !!!!!
    public async create(data: any): Promise<any> {
        this.log.info('Create Line News Week is succesful.');
        return await this.lineNewsWeekRepository.save(data);
    }

    public async findOne(findCondition: any): Promise<any> {
        return await this.lineNewsWeekRepository.findOne(findCondition);
    }
    public search(limit: number, offset: number, select: any = [], relation: any[], whereConditions: any = [], orderBy: any, count: boolean): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(limit, offset, select, relation, whereConditions, orderBy);
        if (count) {
            return this.lineNewsWeekRepository.count();
        } else {
            return this.find(condition);
        }
    }
    public async find(findCondition?: any): Promise<any> {
        return await this.lineNewsWeekRepository.find(findCondition);
    }

    public async delete(query: any, options?: any): Promise<any> {
        this.log.info('Delete a Line News Week');
        return await this.lineNewsWeekRepository.deleteOne(query, options);
    }

    public async update(query: any, newValue: any): Promise<any> {
        this.log.info('Update a Line News Week');

        return await this.lineNewsWeekRepository.updateOne(query, newValue);
    }

    public aggregate(query: any, options?: any): Promise<any[]> {
        return this.lineNewsWeekRepository.aggregate(query, options).toArray();
    }

}
