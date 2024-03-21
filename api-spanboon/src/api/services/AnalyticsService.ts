/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { AnalyticsRepository } from '../repositories/AnalyticsRepository';
@Service()
export class AnalyticsService {

    constructor(
        @OrmRepository() private analyticsRepository: AnalyticsRepository,
        @Logger(__filename) private log: LoggerInterface) {
    }

    // create Device token and find the user who is login !!!!!
    public async create(data: any): Promise<any> {
        this.log.info('Create a Analytics.');
        return await this.analyticsRepository.save(data);
    }

    public async findOne(findCondition: any): Promise<any> {
        return await this.analyticsRepository.findOne(findCondition);
    }

    public async findPeople(findCondition?: any): Promise<any> {
        return await this.analyticsRepository.find(findCondition);
    }

    public async find(findCondition?: any): Promise<any> {
        return await this.analyticsRepository.find(findCondition);
    }

    public async delete(query: any, options?: any): Promise<any> {
        this.log.info('Delete a Analytics.');
        return await this.analyticsRepository.deleteOne(query, options);
    }
    public async deleteMany(query: any, options?: any): Promise<any> {
        return await this.analyticsRepository.deleteMany(query, options);
    }
    public async update(query: any, newValue: any): Promise<any> {
        this.log.info('Update a Analytics.');

        return await this.analyticsRepository.updateOne(query, newValue);
    }
    public async updateMany(query: any, newValue: any): Promise<any> {
        this.log.info('Update a Analytics.');

        return await this.analyticsRepository.updateMany(query, newValue);
    }

    public async aggregate(query: any, options?: any): Promise<any[]> {
        return await this.analyticsRepository.aggregate(query, options).toArray();
    }
}
