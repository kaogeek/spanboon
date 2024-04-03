/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { LineNewMovePartyRepository } from '../repositories/LineNewMovePartyRepository';
import { SearchUtil } from '../../utils/SearchUtil';
@Service()
export class LineNewMovePartyService {

    constructor(
        @OrmRepository() private lineNewMovePartyRepository: LineNewMovePartyRepository,
        @Logger(__filename) private log: LoggerInterface) {
    }

    // create Device token and find the user who is login !!!!!
    public async create(data: any): Promise<any> {
        this.log.info('Create Snapshots is succesful.');
        return await this.lineNewMovePartyRepository.save(data);
    }

    public async findOne(findCondition: any): Promise<any> {
        return await this.lineNewMovePartyRepository.findOne(findCondition);
    }
    public search(limit: number, offset: number, select: any = [], relation: any[], whereConditions: any = [], orderBy: any, count: boolean): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(limit, offset, select, relation, whereConditions, orderBy);
        if (count) {
            return this.lineNewMovePartyRepository.count();
        } else {
            return this.find(condition);
        }
    }
    public async find(findCondition?: any): Promise<any> {
        return await this.lineNewMovePartyRepository.find(findCondition);
    }

    public async delete(query: any, options?: any): Promise<any> {
        this.log.info('Delete a snapshots');
        return await this.lineNewMovePartyRepository.deleteOne(query, options);
    }

    public async update(query: any, newValue: any): Promise<any> {
        this.log.info('Update a snapshots');

        return await this.lineNewMovePartyRepository.updateOne(query, newValue);
    }

    public aggregate(query: any, options?: any): Promise<any[]> {
        return this.lineNewMovePartyRepository.aggregate(query, options).toArray();
    }

}
