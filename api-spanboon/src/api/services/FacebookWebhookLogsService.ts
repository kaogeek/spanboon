/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { FacebookWebhookLogsRepository } from '../repositories/FacebookWebhookLogsRepository';

@Service()
export class FacebookWebhookLogsService {
    constructor(@OrmRepository() private fbLogRepository: FacebookWebhookLogsRepository) { }

    // create actionLog
    public async create(actionLog: any): Promise<any> {
        return await this.fbLogRepository.save(actionLog);
    }

    // find one actionLog
    public async findOne(actionLog: any): Promise<any> {
        return await this.fbLogRepository.findOne(actionLog);
    }

    // find all actionLog
    public async findAll(): Promise<any> {
        return await this.fbLogRepository.find();
    }

    // edit actionLog
    public async update(query: any, newValue: any): Promise<any> {
        return await this.fbLogRepository.updateOne(query, newValue);
    }

    // delete actionLog
    public async delete(query: any, options?: any): Promise<any> {
        return await this.fbLogRepository.deleteOne(query, options);
    }
}
