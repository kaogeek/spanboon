/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import 'reflect-metadata';
import moment from 'moment';
import { JsonController, Res, QueryParams, Body, Get } from 'routing-controllers';
import { ObjectID } from 'mongodb';
import { PROVIDER } from '../../constants/LoginProvider';
import { PageSocialAccountService } from '../services/PageSocialAccountService';
import { FacebookWebhookLogsService } from '../services/FacebookWebhookLogsService';
import { PageService } from '../services/PageService';
import { PostsService } from '../services/PostsService';
import { SocialPostService } from '../services/SocialPostService';
import { AssetService } from '../services/AssetService';
import { PostsGalleryService } from '../services/PostsGalleryService';
import { PageConfigService } from '../services/PageConfigService';
import { FacebookWebhookLogs } from '../models/FacebookWebhookLogs';
import { Posts } from '../models/Posts';
import { PostsGallery } from '../models/PostsGallery';
import { SocialPost } from '../models/SocialPost';
import { PageConfig } from '../models/PageConfig';
import { POST_TYPE } from '../../constants/PostType';
import { ASSET_PATH } from '../../constants/AssetScope';
import { PAGE_CONFIGS } from '../../constants/PageConfigs';
import { facebook_setup } from '../../env';

@JsonController('/fb_webhook')
export class FacebookWebhookController {
    constructor(private pageSocialAccountService: PageSocialAccountService, private facebookWebhookLogsService: FacebookWebhookLogsService,
        private pageService: PageService, private postsService: PostsService, private socialPostService: SocialPostService,
        private assetService: AssetService, private postsGalleryService: PostsGalleryService, private pageConfigService: PageConfigService) { }

    /**
     * @api {get} /api/fb_webhook/page_feeds WebHook for page feed
     * @apiGroup Facebook
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "",
     *    "data":{
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/fb_webhook/page_feeds
     * @apiErrorExample {json} WebHook for page feed
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/page_feeds')
    public async verifyPageFeedWebhook(@QueryParams() params: any, @Body({ validate: true }) body: any, @Res() res: any): Promise<any> {
        const VERIFY_TOKEN = facebook_setup.FACEBOOK_VERIFY_TOKEN;
        // Parse the query params
        const mode = params['hub.mode'];
        const token = params['hub.verify_token'];
        const challenge = params['hub.challenge'];
        // Checks if a token and mode is in the query string of the request
        if (mode && token) {
            // Checks the mode and token sent is correct
            if (mode === 'subscribe' && token === VERIFY_TOKEN) {

                // Responds with the challenge token from the request
                console.log('FACEBOOK_WEBHOOK_VERIFIED');
                return res.status(200).send(challenge);
            } else {
                // Responds with '403 Forbidden' if verify tokens do not match
                return res.sendStatus(403);
            }
        }
        let createLog = true;
        if (body !== undefined) {
            if (body.object === 'page') {
                if (body.entry !== undefined) {
                    for (let index = 0; index < body.entry.length; index++) {
                        const element = body.entry[index];
                        if (element.changes !== undefined) {
                            for (const item of element.changes) {
                                const pageId = item.value.from.id;
                                const fbPostId = item.value.post_id;
                                const message = item.value.message;
                                const link = item.value.link; // photo link, can be undefined
                                const photos = item.value.photos; // array of photo, can be undefined
                                // const createdTime = item.value.created_time;
                                // const verb = item.value.verb;

                                // check if contains pageSocialAccount
                                const pageSocialAccount = await this.pageSocialAccountService.findOne({ providerPageId: pageId, providerName: PROVIDER.FACEBOOK });
                                if (pageSocialAccount === undefined) {
                                    createLog = false;
                                    continue;
                                }

                                const spanboonPage = await this.pageService.findOne({ _id: pageSocialAccount.page, banned: false });
                                if (spanboonPage === undefined) {
                                    createLog = false;
                                    continue;
                                }

                                const isFetchPage = await this.isFetchPage(pageSocialAccount.page);
                                if (!isFetchPage) {
                                    createLog = false;
                                    continue;
                                }

                                // check if fbPostId was post by page
                                const hasSocialPosted = await this.socialPostService.findOne({ pageId: pageSocialAccount.page, socialId: fbPostId, socialType: PROVIDER.FACEBOOK });
                                if (hasSocialPosted !== undefined) {
                                    createLog = false;
                                    continue;
                                }

                                // create post
                                let post = this.createPagePostModel(pageSocialAccount.page, spanboonPage.ownerUser, undefined, (message ? message : ''), undefined);
                                post = await this.postsService.create(post);

                                const photoGallery = [];
                                if (link !== undefined && link !== '') {
                                    // this is one photo mode
                                    try {
                                        const asset = await this.assetService.createAssetFromURL(link, spanboonPage.ownerUser);
                                        if (asset !== undefined) {
                                            photoGallery.push(asset);
                                        }
                                    } catch (error) {
                                        console.log('error create asset from url', error);
                                    }
                                } else if (photos !== undefined && photos.length > 0) {
                                    // this is many photo mode
                                    for (const plink of photos) {
                                        try {
                                            const asset = await this.assetService.createAssetFromURL(plink, spanboonPage.ownerUser);
                                            if (asset !== undefined) {
                                                photoGallery.push(asset);
                                            }
                                        } catch (error) {
                                            console.log('error create asset from url', error);
                                        }
                                    }
                                }

                                if (post !== undefined) {
                                    if (photoGallery.length > 0) {
                                        // create post gallery
                                        for (const asset of photoGallery) {
                                            const gallery = new PostsGallery();
                                            gallery.fileId = asset.id;
                                            gallery.post = post.id;
                                            gallery.imageURL = asset ? ASSET_PATH + asset.id : '';
                                            gallery.s3ImageURL = asset.s3FilePath;
                                            gallery.ordering = 1;
                                            await this.postsGalleryService.create(gallery);
                                        }
                                    }

                                    const socialPost = new SocialPost();
                                    socialPost.pageId = pageSocialAccount.page;
                                    socialPost.postId = post.id;
                                    socialPost.postBy = pageSocialAccount.page;
                                    socialPost.postByType = 'PAGE';
                                    socialPost.socialId = fbPostId;
                                    socialPost.socialType = PROVIDER.FACEBOOK;

                                    await this.socialPostService.create(socialPost);
                                }
                            }
                        }
                    }
                }
            }

            if (createLog) {
                const logs = new FacebookWebhookLogs();
                logs.data = body;
                this.facebookWebhookLogsService.create(logs);
            }
        }

        return res.status(200).send(challenge);
    }

    private createPagePostModel(pageObjId: ObjectID, userObjId: ObjectID, title: string, detail: string, photoLinks: string[]): Posts {
        const today = moment().toDate();

        const post = new Posts();
        post.deleted = false;
        post.pageId = pageObjId;
        post.referencePost = null;
        post.rootReferencePost = null;
        post.visibility = null;
        post.ranges = null;
        post.title = title;
        post.detail = detail;
        post.isDraft = false;
        post.hidden = false;
        post.type = POST_TYPE.GENERAL;
        post.userTags = [];
        post.coverImage = '';
        post.pinned = false;
        post.deleted = false;
        post.ownerUser = userObjId;
        post.commentCount = 0;
        post.repostCount = 0;
        post.shareCount = 0;
        post.likeCount = 0;
        post.viewCount = 0;
        post.createdDate = today;
        post.startDateTime = today;
        post.story = null;

        return post;
    }

    private async isFetchPage(pageId: ObjectID): Promise<boolean> {
        if (pageId === undefined) {
            return PAGE_CONFIGS.DEFAULT_PAGE_SOCIAL_FACEBOOK_FETCHPOST;
        }

        const config = await this.pageConfigService.getConfig(PAGE_CONFIGS.PAGE_SOCIAL_FACEBOOK_FETCHPOST, pageId);
        if (config !== undefined && config.value !== undefined) {
            if (typeof config.value === 'string') {
                const valueString = config.value.toUpperCase();

                return (valueString === 'TRUE') ? true : false;
            } else if (typeof config.value === 'boolean') {
                return config.value;
            }

            return config.value;
        } else {
            // auto create page config
            const pageConfig = new PageConfig();
            pageConfig.page = pageId;
            pageConfig.name = PAGE_CONFIGS.PAGE_SOCIAL_FACEBOOK_FETCHPOST;
            pageConfig.type = 'boolean';
            pageConfig.value = PAGE_CONFIGS.DEFAULT_PAGE_SOCIAL_FACEBOOK_FETCHPOST ? 'TRUE' : 'FALSE';

            await this.pageConfigService.create(pageConfig);
        }

        return PAGE_CONFIGS.DEFAULT_PAGE_SOCIAL_FACEBOOK_FETCHPOST;
    }
}