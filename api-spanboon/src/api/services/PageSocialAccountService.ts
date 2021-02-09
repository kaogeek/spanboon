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
import { spanboon_web } from '../../env';
import { PROVIDER } from '../../constants/LoginProvider';
import { TwitterService } from '../services/TwitterService';
import { FacebookService } from '../services/FacebookService';
import { SocialPostService } from '../services/SocialPostService';
import { PostsService } from '../services/PostsService';
import { AssetService } from '../services/AssetService';
import { PostsGalleryService } from '../services/PostsGalleryService';
import { Posts } from '../models/Posts';
import { SocialPost } from '../models/SocialPost';
import { TwitterUtils } from '../../utils/TwitterUtils';
import { FacebookUtils } from '../../utils/FacebookUtils';

@Service()
export class PageSocialAccountService {

    constructor(@OrmRepository() private pageSocialAccountRepository: PageSocialAccountRepository,
        private twitterService: TwitterService, private facebookService: FacebookService, private socialPostService: SocialPostService,
        private postsService: PostsService, private postsGalleryService: PostsGalleryService, private assetService: AssetService) { }

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

    public async pagePostToTwitter(postId: string, postByPageId?: string): Promise<boolean> {
        if (postId === undefined || postId === null || postId === '') {
            return false;
        }

        const posts: Posts = await this.postsService.findOne({ _id: new ObjectID(postId) });

        if (posts === undefined) {
            return false;
        }

        if (postByPageId === undefined) {
            postByPageId = posts.pageId;
        }

        if (postByPageId === undefined || postByPageId === '') {
            return false;
        }

        const link = '/post/' + posts.id;
        let storyLink = '';
        if (posts.story !== undefined && posts.story !== null && posts.story !== '') {
            storyLink = '/story/' + posts.id;
        }
        const imageBase64s = [];
        // search asset
        const assetIds = [];
        const gallerys = await this.postsGalleryService.find({ post: new ObjectID(postId) });
        if (gallerys !== undefined) {
            for (const gal of gallerys) {
                assetIds.push(gal.fileId);
            }
        }

        if (assetIds.length > 0) {
            const assetObjs = await this.assetService.find({ _id: { $in: assetIds } });
            if (assetObjs !== undefined) {
                for (const assetObj of assetObjs) {
                    if (assetObj.data !== undefined && assetObj.data !== null) {
                        if (imageBase64s.length < 4) {
                            imageBase64s.push(assetObj.data);
                        }
                    }
                }
            }
        }

        const fullLink = ((spanboon_web.ROOT_URL === undefined || spanboon_web.ROOT_URL === null) ? '' : spanboon_web.ROOT_URL) + link;
        const fullStoryLink = ((spanboon_web.ROOT_URL === undefined || spanboon_web.ROOT_URL === null) ? '' : spanboon_web.ROOT_URL) + storyLink;
        const postLink = (storyLink !== '') ? fullStoryLink : fullLink;
        const messageForTW = TwitterUtils.generateTwitterText(posts.title, posts.detail, postLink, undefined, posts.emergencyEventTag, posts.objectiveTag);

        try {
            const twitterPost = await this.pagePostMessageToTwitter(postByPageId, messageForTW, imageBase64s);

            // create social post log
            if (twitterPost !== undefined) {
                const socialPost = new SocialPost();
                socialPost.pageId = posts.pageId;
                socialPost.postId = posts.id;
                socialPost.postBy = new ObjectID(postByPageId);
                socialPost.postByType = 'PAGE';
                socialPost.socialId = twitterPost.id_str;
                socialPost.socialType = PROVIDER.TWITTER;

                await this.socialPostService.create(socialPost);
            }
        } catch (err) {
            console.log(err);
            return false;
        }

        return true;
    }

    public async pagePostMessageToTwitter(pageId: string, message: string, imageBase64s: string[]): Promise<any> {
        const twitterAccount = await this.getTwitterPageAccount(pageId);

        if (twitterAccount !== undefined) {
            const accessToken = twitterAccount.properties.oauthToken;
            const tokenSecret = twitterAccount.properties.oauthTokenSecret;

            try {
                const result = await this.twitterService.postStatusWithImageByToken(accessToken, tokenSecret, message, imageBase64s);

                return result;
            } catch (error) {
                console.log(error);
            }
        }

        return undefined;
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
                const fbUserId = fbAccount.providerPageId;
                const accessToken = fbAccount.storedCredentials;
                this.facebookService.publishPost(fbUserId, accessToken, message);
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

    public async pagePostMessageToFacebook(pageId: string, message: string, imageBase64s?: string[]): Promise<any> {
        const facebookAccount = await this.getFacebookPageAccount(pageId);

        if (facebookAccount !== undefined) {
            const fbUserId = facebookAccount.providerPageId;
            const accessToken = facebookAccount.storedCredentials;

            try {
                const result = await this.facebookService.publishPost(fbUserId, accessToken, message);

                return result;
            } catch (error) {
                console.log(error);
            }
        }

        return undefined;
    }

    public async pagePostToFacebook(postId: string, postByPageId?: string): Promise<boolean> {
        if (postId === undefined || postId === null || postId === '') {
            return false;
        }

        const posts: Posts = await this.postsService.findOne({ _id: new ObjectID(postId) });

        if (posts === undefined) {
            return false;
        }

        if (postByPageId === undefined) {
            postByPageId = posts.pageId;
        }

        if (postByPageId === undefined || postByPageId === '') {
            return false;
        }

        const link = '/post/' + posts.id;
        let storyLink = '';
        if (posts.story !== undefined && posts.story !== null && posts.story !== '') {
            storyLink = '/story/' + posts.id;
        }
        const imageBase64s = [];
        // // search asset
        // const assetIds = [];
        // const gallerys = await this.postsGalleryService.find({ post: new ObjectID(postId) });
        // if (gallerys !== undefined) {
        //     for (const gal of gallerys) {
        //         assetIds.push(gal.fileId);
        //     }
        // }

        // if (assetIds.length > 0) {
        //     const assetObjs = await this.assetService.find({ _id: { $in: assetIds } });
        //     if (assetObjs !== undefined) {
        //         for (const assetObj of assetObjs) {
        //             if (assetObj.data !== undefined && assetObj.data !== null) {
        //                 if (imageBase64s.length < 4) {
        //                     imageBase64s.push(assetObj.data);
        //                 }
        //             }
        //         }
        //     }
        // }

        const fullLink = ((spanboon_web.ROOT_URL === undefined || spanboon_web.ROOT_URL === null) ? '' : spanboon_web.ROOT_URL) + link;
        const fullStoryLink = ((spanboon_web.ROOT_URL === undefined || spanboon_web.ROOT_URL === null) ? '' : spanboon_web.ROOT_URL) + storyLink;
        const postLink = (storyLink !== '') ? fullStoryLink : fullLink;
        const messageForFB = FacebookUtils.generateFacebookText(posts.title, posts.detail, postLink, undefined, posts.emergencyEventTag, posts.objectiveTag);

        try {
            const facebookPost = await this.pagePostMessageToFacebook(postByPageId, messageForFB, imageBase64s);

            // create social post log
            if (facebookPost !== undefined && facebookPost.error === undefined) {
                const socialPost = new SocialPost();
                socialPost.pageId = posts.pageId;
                socialPost.postId = posts.id;
                socialPost.postBy = new ObjectID(postByPageId);
                socialPost.postByType = 'PAGE';
                socialPost.socialId = facebookPost.id;
                socialPost.socialType = PROVIDER.FACEBOOK;

                await this.socialPostService.create(socialPost);
            }
        } catch (err) {
            console.log(err);
            return false;
        }

        return true;
    }
}
