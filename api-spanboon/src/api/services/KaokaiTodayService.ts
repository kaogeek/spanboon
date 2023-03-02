/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { KaokaiTodayRepository } from '../repositories/KaokaiTodayRepository';
@Service()
export class KaokaiTodayService {

    constructor(
        @OrmRepository() private kaokaiTodayRepository: KaokaiTodayRepository,
        @Logger(__filename) private log: LoggerInterface) {
    }

    // create Device token and find the user who is login !!!!!
    public async create(data: any): Promise<any> {
        this.log.info('Send OTP.');
        return await this.kaokaiTodayRepository.save(data);
    }

    public async findOne(findCondition: any): Promise<any> {
        return await this.kaokaiTodayRepository.findOne(findCondition);
    }

    public async find(findCondition?: any): Promise<any> {
        return await this.kaokaiTodayRepository.find(findCondition);
    }

    public async delete(query: any, options?: any): Promise<any> {
        this.log.info('Delete a token');
        return await this.kaokaiTodayRepository.deleteOne(query, options);
    }

    public async update(query: any, newValue: any): Promise<any> {
        this.log.info('Update a token');

        return await this.kaokaiTodayRepository.updateOne(query, newValue);
    }
}
