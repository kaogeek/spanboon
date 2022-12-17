/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import 'reflect-metadata';
import moment from 'moment';
import { JsonController, Res, QueryParams, Body, Get, Post } from 'routing-controllers';
import { PROVIDER } from '../../constants/LoginProvider';
import { PageService } from '../services/PageService';
import { PostsService } from '../services/PostsService';
import { SocialPostService } from '../services/SocialPostService';
import { AssetService } from '../services/AssetService';
import { PostsGalleryService } from '../services/PostsGalleryService';
import { Posts } from '../models/Posts';
import { PostsGallery } from '../models/PostsGallery';
import { SocialPost } from '../models/SocialPost';
import { POST_TYPE } from '../../constants/PostType';
import { ASSET_PATH } from '../../constants/AssetScope';
import { facebook_setup } from '../../env';
import { SocialPostLogsService } from '../services/SocialPostLogsService';
import { ObjectID } from 'mongodb';
import { ResponseUtil } from '../../utils/ResponseUtil';
@JsonController('/fb_webhook')
export class FacebookWebhookController {
    constructor(
        private pageService: PageService,
        private postsService: PostsService,
        private socialPostService: SocialPostService,
        private assetService: AssetService,
        private postsGalleryService: PostsGalleryService,
        private socialPostLogsService: SocialPostLogsService
    ) { }

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
        if (mode && token) {
            // Checks the mode and token sent is correct
            if (mode === 'subscribe' && token === VERIFY_TOKEN) {
                // Responds with the challenge token from the request
                return res.status(200).send(ResponseUtil.getSuccessResponse('Token Valid', challenge));
            } else {
                // Responds with '403 Forbidden' if verify tokens do not match
                return res.status(403).send(ResponseUtil.getErrorResponse('Token Invalid', undefined));
            }
        }
    }

    @Post('/page_feeds')
    public async postPageFeedWebhook(@QueryParams() params: any, @Body({ validate: true }) body: any, @Res() res: any): Promise<any> {
        const VERIFY_TOKEN = facebook_setup.FACEBOOK_VERIFY_TOKEN;
        // Parse the query params
        const mode = params['hub.mode'];
        const token = params['hub.verify_token'];
        const challenge = params['hub.challenge'];
        let multiPic = undefined;
        if (mode && token) {
            // Checks the mode and token sent is correct
            if (mode === 'subscribe' && token === VERIFY_TOKEN) {
                // Responds with the challenge token from the request
                return res.status(200).send(ResponseUtil.getSuccessResponse('Token Valid', challenge));
            } else {
                // Responds with '403 Forbidden' if verify tokens do not match
                return res.status(403).send(ResponseUtil.getErrorResponse('Token Invalid', undefined));
            }
        }
        console.log('req.body', body.entry[0].changes[0]);
        const pageSubscribe = await this.socialPostLogsService.findOne({ providerUserId: String(body.entry[0].changes[0].value.from.id) });
        const pageIdFB = await this.pageService.findOne({ _id: pageSubscribe.pageId });
        if (body !== undefined && pageIdFB !== undefined && pageIdFB !== null && pageSubscribe.enable === true) {
            // verb type -> 3 types -> add,edit,remove
            if (body.entry[0].changes[0].value.verb === 'add' && body.entry[0].changes[0].value.link === undefined && body.entry[0].changes[0].value.photos === undefined) {
                const checkPost = await this.socialPostService.findOne({ socialId: body.entry[0].changes[0].value.post_id, postByType: 'add' });
                if (checkPost === undefined) {
                    const postPage: Posts = new Posts();
                    postPage.title = 'Webhooks Feed';
                    postPage.detail = body.entry[0].changes[0].value.message;
                    postPage.isDraft = false;
                    postPage.hidden = false;
                    postPage.type = POST_TYPE.GENERAL;
                    postPage.userTags = [];
                    postPage.coverImage = '';
                    postPage.pinned = false;
                    postPage.deleted = false;
                    postPage.ownerUser = pageIdFB.ownerUser;
                    postPage.commentCount = 0;
                    postPage.repostCount = 0;
                    postPage.shareCount = 0;
                    postPage.likeCount = 0;
                    postPage.viewCount = 0;
                    postPage.createdDate = body.entry[0].changes[0].value.created_time;
                    postPage.startDateTime = moment().toDate();
                    postPage.story = null;
                    postPage.pageId = pageIdFB.id;
                    postPage.referencePost = null;
                    postPage.rootReferencePost = null;
                    postPage.visibility = null;
                    postPage.ranges = null;
                    const createPostPageData: Posts = await this.postsService.create(postPage);
                    const newSocialPost = new SocialPost();
                    newSocialPost.pageId = pageIdFB.id;
                    newSocialPost.postId = createPostPageData.id;
                    newSocialPost.postBy = body.entry[0].changes[0].value.from.id;
                    newSocialPost.postByType = body.entry[0].changes[0].value.verb;
                    newSocialPost.socialId = body.entry[0].changes[0].value.post_id;
                    newSocialPost.socialType = PROVIDER.FACEBOOK;
                    await this.socialPostService.create(newSocialPost);

                    return res.status(200).send(ResponseUtil.getSuccessResponse('SuccessFul Webhooks', createPostPageData));
                } else {
                    return res.status(400).send(ResponseUtil.getErrorResponse('This values is removes from webhooks', undefined));
                }
            } else if (body.entry[0].changes[0].value.verb === 'add' && body.entry[0].changes[0].value.link !== undefined && body.entry[0].changes[0].value.photos === undefined) {
                const assetPic = await this.assetService.createAssetFromURL(body.entry[0].changes[0].value.link, pageIdFB.ownerUser);
                const checkPost = await this.socialPostService.findOne({ socialId: body.entry[0].changes[0].value.post_id, postByType: 'add' });
                if (checkPost === undefined && assetPic !== undefined) {
                    const postPage: Posts = new Posts();
                    postPage.title = 'Webhooks Feed';
                    postPage.detail = body.entry[0].changes[0].value.message;
                    postPage.isDraft = false;
                    postPage.hidden = false;
                    postPage.type = POST_TYPE.GENERAL;
                    postPage.userTags = [];
                    postPage.coverImage = '';
                    postPage.pinned = false;
                    postPage.deleted = false;
                    postPage.ownerUser = pageIdFB.ownerUser;
                    postPage.commentCount = 0;
                    postPage.repostCount = 0;
                    postPage.shareCount = 0;
                    postPage.likeCount = 0;
                    postPage.viewCount = 0;
                    postPage.createdDate = body.entry[0].changes[0].value.created_time;
                    postPage.startDateTime = moment().toDate();
                    postPage.story = null;
                    postPage.pageId = pageIdFB.id;
                    postPage.referencePost = null;
                    postPage.rootReferencePost = null;
                    postPage.visibility = null;
                    postPage.ranges = null;
                    const createPostPageData: Posts = await this.postsService.create(postPage);
                    const newSocialPost = new SocialPost();
                    newSocialPost.pageId = pageIdFB.id;
                    newSocialPost.postId = createPostPageData.id;
                    newSocialPost.postBy = body.entry[0].changes[0].value.from.id;
                    newSocialPost.postByType = body.entry[0].changes[0].value.verb;
                    newSocialPost.socialId = body.entry[0].changes[0].value.post_id;
                    newSocialPost.socialType = PROVIDER.FACEBOOK;
                    await this.socialPostService.create(newSocialPost);
                    if (createPostPageData) {
                        // Asset 
                        const photoGallery = [];
                        if (body.entry[0].changes[0].value.photos === undefined) {
                            const assetObj = await this.assetService.findOne({ _id: assetPic.id });
                            if (assetObj.data !== undefined && assetObj.data !== null) {
                                photoGallery.push(assetObj.data);
                            }
                            for (const asset of photoGallery) {
                                const postsGallery = new PostsGallery();
                                postsGallery.post = createPostPageData.id;
                                postsGallery.fileId = new ObjectID(assetObj.id);
                                postsGallery.imageURL = ASSET_PATH + new ObjectID(assetObj.id);
                                postsGallery.s3ImageURL = asset.s3FilePath;
                                postsGallery.ordering = body.entry[0].changes[0].value.published;
                                const postsGalleryCreate: PostsGallery = await this.postsGalleryService.create(postsGallery);
                                if (postsGalleryCreate) {
                                    await this.assetService.update({ _id: assetObj.id, userId: pageIdFB.ownerUser }, { $set: { expirationDate: null } });
                                }
                            }
                        }

                        return res.status(200).send(ResponseUtil.getSuccessResponse('SuccessFul Webhooks', createPostPageData));
                    } else {
                        return res.status(400).send(ResponseUtil.getErrorResponse('Webhooks Failed', undefined));
                    }
                }
            } else if (body.entry[0].changes[0].value.verb === 'add' && body.entry[0].changes[0].value.link === undefined && body.entry[0].changes[0].value.photos !== undefined) {
                for (let i = 0; i < body.entry[0].changes[0].value.photos.length; i++) {
                    multiPic = await this.assetService.createAssetFromURL(body.entry[0].changes[0].value.photos[i], pageIdFB.ownerUser);
                }
                const checkPost = await this.socialPostService.findOne({ socialId: body.entry[0].changes[0].value.post_id, postByType: 'add' });
                if (checkPost === undefined) {
                    const postPage: Posts = new Posts();
                    postPage.title = 'Webhooks Feed';
                    postPage.detail = body.entry[0].changes[0].value.message;
                    postPage.isDraft = false;
                    postPage.hidden = false;
                    postPage.type = POST_TYPE.GENERAL;
                    postPage.userTags = [];
                    postPage.coverImage = '';
                    postPage.pinned = false;
                    postPage.deleted = false;
                    postPage.ownerUser = pageIdFB.ownerUser;
                    postPage.commentCount = 0;
                    postPage.repostCount = 0;
                    postPage.shareCount = 0;
                    postPage.likeCount = 0;
                    postPage.viewCount = 0;
                    postPage.createdDate = body.entry[0].changes[0].value.created_time;
                    postPage.startDateTime = moment().toDate();
                    postPage.story = null;
                    postPage.pageId = pageIdFB.id;
                    postPage.referencePost = null;
                    postPage.rootReferencePost = null;
                    postPage.visibility = null;
                    postPage.ranges = null;
                    const createPostPageData: Posts = await this.postsService.create(postPage);
                    const newSocialPost = new SocialPost();
                    newSocialPost.pageId = pageIdFB.id;
                    newSocialPost.postId = createPostPageData.id;
                    newSocialPost.postBy = body.entry[0].changes[0].value.from.id;
                    newSocialPost.postByType = body.entry[0].changes[0].value.verb;
                    newSocialPost.socialId = body.entry[0].changes[0].value.post_id;
                    newSocialPost.socialType = PROVIDER.FACEBOOK;
                    await this.socialPostService.create(newSocialPost);
                    const findAssets = await this.assetService.find({ _id: multiPic.id });
                    for (let j = 0; j < findAssets.length; j++) {
                        const postsGallery = new PostsGallery();
                        postsGallery.post = createPostPageData.id;
                        postsGallery.fileId = new ObjectID(findAssets[j].id);
                        postsGallery.imageURL = ASSET_PATH + new ObjectID(findAssets[j].id);
                        postsGallery.s3ImageURL = findAssets[j].s3FilePath;
                        postsGallery.ordering = body.entry[0].changes[0].value.published;
                        const postsGalleryCreate: PostsGallery = await this.postsGalleryService.create(postsGallery);
                        if (postsGalleryCreate) {
                            await this.assetService.update({ _id: findAssets[j].id, userId: pageIdFB.ownerUser }, { $set: { expirationDate: null } });
                        }
                    }

                    return res.status(200).send(ResponseUtil.getSuccessResponse('SuccessFul Webhooks', createPostPageData));
                } else {
                    return res.status(400).send(ResponseUtil.getSuccessResponse('Webhooks Failed', undefined));
                }
            } else if (body.entry[0].changes[0].value.verb === 'edit') {
                const socialPost = await this.socialPostService.findOne({ postBy: body.entry[0].changes[0].value.post_id });
                if (socialPost) {
                    const queryFB = { _id: socialPost.postId };
                    const setValue = { detail: body.entry[0].changes[0].value.message };
                    await this.postsService.update(queryFB, setValue);

                    return res.status(200).send(ResponseUtil.getSuccessResponse('SuccessFul Webhooks', socialPost));
                } else {
                    return res.status(400).send(ResponseUtil.getErrorResponse('Social Post Not Found', undefined));
                }
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('This values is removes from webhooks', undefined));
            }
        }
    }

    /* private createPagePostModel(pageObjId: ObjectID, userObjId: ObjectID, title: string, detail: string, photoLinks: string[]): Posts {
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

    /* private async isFetchPage(pageId: ObjectID): Promise<boolean> {
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
    } */
}