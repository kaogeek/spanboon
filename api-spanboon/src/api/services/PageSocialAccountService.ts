/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { PageSocialAccount } from '../models/PageSocialAccount';
import { PageSocialAccountRepository } from '../repositories/PageSocialAccountRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';
import { ObjectID } from 'mongodb';
import { PROVIDER } from '../../constants/LoginProvider';
import { TwitterService } from '../services/TwitterService';
import { FacebookService } from '../services/FacebookService';

@Service()
export class PageSocialAccountService {

    constructor(@OrmRepository() private pageSocialAccountRepository: PageSocialAccountRepository,
        private twitterService: TwitterService, private facebookService: FacebookService) { }

    // find PageSocialAccount
    public find(findCondition: any): Promise<PageSocialAccount[]> {
        return this.pageSocialAccountRepository.find(findCondition);
    }

    // find PageSocialAccount
    public findOne(findCondition: any): Promise<PageSocialAccount> {
        return this.pageSocialAccountRepository.findOne(findCondition);
    }

    // find PageSocialAccount
    public aggregate(query: any, options?: any): Promise<PageSocialAccount[]> {
        return this.pageSocialAccountRepository.aggregate(query, options).toArray();
    }

    // create PageSocialAccount
    public async create(pageAbout: PageSocialAccount): Promise<PageSocialAccount> {
        return await this.pageSocialAccountRepository.save(pageAbout);
    }

    // update PageSocialAccount
    public async update(query: any, newValue: any): Promise<any> {
        return await this.pageSocialAccountRepository.updateOne(query, newValue);
    }

    // delete PageSocialAccount
    public async delete(query: any, options?: any): Promise<any> {
        return await this.pageSocialAccountRepository.deleteOne(query, options);
    }

    // Search PageSocialAccount
    public search(filter: SearchFilter): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy);

        if (filter.count) {
            return this.pageSocialAccountRepository.count(filter.whereConditions);
        } else {
            return this.pageSocialAccountRepository.find(condition);
        }
    }

    public async shareAllSocialPost(pageId: string, message: string, imageBase64s: string[], ignoreTwitter?: any, ignoreFacebook?: any): Promise<boolean> {
        let twitterPost = true;
        if (ignoreTwitter !== undefined) {
            if (ignoreTwitter) {
                twitterPost = false;
            }
        }

        if (twitterPost) {
            const twitterAccount = await this.getTwitterPageAccount(pageId);
            if (twitterAccount !== undefined) {
                const accessToken = twitterAccount.properties.oauthToken;
                const tokenSecret = twitterAccount.properties.oauthTokenSecret;

                try {
                    await this.twitterService.postStatusWithImageByToken(accessToken, tokenSecret, message, imageBase64s);
                } catch (error) {
                    console.log(error);
                }
            }
        }

        let postFacebook = true;
        if (ignoreFacebook !== undefined) {
            if (ignoreFacebook) {
                postFacebook = false;
            }
        }

        if (postFacebook) {
            const fbAccount = await this.getFacebookPageAccount(pageId);
            if (fbAccount !== undefined) {
                this.facebookService.publishPost(fbAccount.providerPageId, message);
            }
        }

        return true;
    }

    public async getTwitterPageAccount(pageId: string): Promise<PageSocialAccount> {
        return await this.pageSocialAccountRepository.findOne({ page: new ObjectID(pageId), providerName: PROVIDER.TWITTER });
    }

    public async getFacebookPageAccount(pageId: string): Promise<PageSocialAccount> {
        return await this.pageSocialAccountRepository.findOne({ page: new ObjectID(pageId), providerName: PROVIDER.FACEBOOK });
    }
}
