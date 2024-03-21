/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { PointEventRepository } from '../repositories/PointEventRepository';
@Service()
export class PointEventService {

    constructor(
        @OrmRepository() private pointEventRepository: PointEventRepository,
        @Logger(__filename) private log: LoggerInterface) {
    }

    // create Device token and find the user who is login !!!!!
    public async create(data: any): Promise<any> {
        this.log.info('Create a PointEvent.');
        return await this.pointEventRepository.save(data);
    }

    public async findOne(findCondition: any): Promise<any> {
        return await this.pointEventRepository.findOne(findCondition);
    }

    public async findPeople(findCondition?: any): Promise<any> {
        return await this.pointEventRepository.find(findCondition);
    }

    public async find(findCondition?: any): Promise<any> {
        return await this.pointEventRepository.find(findCondition);
    }

    public async delete(query: any, options?: any): Promise<any> {
        this.log.info('Delete a PointEvent.');
        return await this.pointEventRepository.deleteOne(query, options);
    }
    public async deleteMany(query: any, options?: any): Promise<any> {
        return await this.pointEventRepository.deleteMany(query, options);
    }
    public async update(query: any, newValue: any): Promise<any> {
        this.log.info('Update a PointEvent.');

        return await this.pointEventRepository.updateOne(query, newValue);
    }
    public async updateMany(query: any, newValue: any): Promise<any> {
        this.log.info('Update a PointEvent.');

        return await this.pointEventRepository.updateMany(query, newValue);
    }

    public async aggregate(query: any, options?: any): Promise<any[]> {
        return await this.pointEventRepository.aggregate(query, options).toArray();
    }
}
