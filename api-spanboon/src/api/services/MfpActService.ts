/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { MfpActRepository } from '../repositories/MfpActRepository';
@Service()
export class MfpActService {

    constructor(
        @OrmRepository() private mfpActRepository: MfpActRepository,
        @Logger(__filename) private log: LoggerInterface) {
    }

    public async create(data: any): Promise<any> {
        this.log.info('Create MFP Act.');
        return await this.mfpActRepository.save(data);
    }

    public async findOne(findCondition: any): Promise<any> {
        return await this.mfpActRepository.findOne(findCondition);
    }

    public async find(findCondition?: any): Promise<any> {
        return await this.mfpActRepository.find(findCondition);
    }

    public async delete(query: any, options?: any): Promise<any> {
        this.log.info('Delete a MFP Act');
        return await this.mfpActRepository.deleteOne(query, options);
    }

    public async deleteMany(query: any, options?: any): Promise<any> {
        return await this.mfpActRepository.deleteMany(query, options);
    }
    public async update(query: any, newValue: any): Promise<any> {
        this.log.info('Update a MFP Act');

        return await this.mfpActRepository.updateOne(query, newValue);
    }
}
