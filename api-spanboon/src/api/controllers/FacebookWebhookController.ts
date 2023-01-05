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
@JsonController('/fb_webhook')
export class FacebookWebhookController {
    constructor(
        private pageService: PageService, private postsService: PostsService, private socialPostService: SocialPostService,
        private assetService: AssetService, private postsGalleryService: PostsGalleryService,
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
                return res.status(200).send(challenge);
            } else {
                // Responds with '403 Forbidden' if verify tokens do not match
                return res.sendStatus(403);
            }
        }
    }
    @Post('/page_feeds')
    public async PostPageFeedWebhook(@QueryParams() params: any, @Body({ validate: true }) body: any, @Res() res: any): Promise<any> {
        const VERIFY_TOKEN = facebook_setup.FACEBOOK_VERIFY_TOKEN;
        // Parse the query params
        const mode = params['hub.mode'];
        const token = params['hub.verify_token'];
        const challenge = params['hub.challenge'];
        if (mode && token) {
            // Checks the mode and token sent is correct
            if (mode === 'subscribe' && token === VERIFY_TOKEN) {
                // Responds with the challenge token from the request
                return res.status(200).send(challenge);
            } else {
                // Responds with '403 Forbidden' if verify tokens do not match
                return res.sendStatus(403);
            }
        }
        let sliceArray = undefined;
        let text1 = undefined;
        let text2 = undefined;
        let realText = undefined;
        console.log('body.entry[0].changes[0]', body.entry[0].changes[0]);
        const match = /r\n|\n/.exec(body.entry[0].changes[0].value.message);
        if (match) {
            sliceArray = body.entry[0].changes[0].value.message.slice(0, match.index);
            text1 = sliceArray.indexOf('[');
            text2 = sliceArray.indexOf(']');
            if (text1 !== -1 && text2 !== -1) {
                realText = body.entry[0].changes[0].value.message.substring(text1, text2 + 1);
            } else if (text1 !== -1 && text2 === -1) {
                realText = body.entry[0].changes[0].value.message.slice(0, 50) + '......';
            } else {
                realText = body.entry[0].changes[0].value.message.substring(0, 50) + '.....';
            }
        } else {
            sliceArray = 'โพสต์จากเฟสบุ๊ค';
        }
        const pageSubScribes = await this.socialPostLogsService.find({ providerUserId: String(body.entry[0].changes[0].value.from.id) });
        for (const pagesSubScribe of pageSubScribes) {
            const pageIdFbs = await this.pageService.find({ _id: pagesSubScribe.pageId });
            for (const pagesIdFb of pageIdFbs) {
                if (body !== undefined && pagesIdFb !== undefined && pagesIdFb !== null && pagesSubScribe.enable === true) {
                    if (body.entry[0].changes[0].value.verb === 'add' && body.entry[0].changes[0].value.link === undefined && body.entry[0].changes[0].value.photos === undefined && body.entry[0].changes[0].value.item !== 'share') {
                        const checkPost = await this.socialPostService.find({ socialId: body.entry[0].changes[0].value.post_id, pageId: ObjectID(pagesSubScribe.id), socialType: PROVIDER.FACEBOOK });
                        const checkFeed = checkPost.shift();
                        if (checkFeed === undefined) {
                            const postPage: Posts = new Posts();
                            postPage.title = realText;
                            postPage.detail = body.entry[0].changes[0].value.message;
                            postPage.isDraft = false;
                            postPage.hidden = false;
                            postPage.type = POST_TYPE.GENERAL;
                            postPage.userTags = [];
                            postPage.coverImage = '';
                            postPage.pinned = false;
                            postPage.deleted = false;
                            postPage.ownerUser = pagesIdFb.ownerUser;
                            postPage.commentCount = 0;
                            postPage.repostCount = 0;
                            postPage.shareCount = 0;
                            postPage.likeCount = 0;
                            postPage.viewCount = 0;
                            postPage.createdDate = body.entry[0].changes[0].value.created_time;
                            postPage.startDateTime = moment().toDate();
                            postPage.story = null;
                            postPage.pageId = pagesIdFb.id;
                            postPage.referencePost = null;
                            postPage.rootReferencePost = null;
                            postPage.visibility = null;
                            postPage.ranges = null;
                            const createPostPageData: Posts = await this.postsService.create(postPage);
                            const newSocialPost = new SocialPost();
                            newSocialPost.pageId = pagesIdFb.id;
                            newSocialPost.postId = createPostPageData.id;
                            newSocialPost.postBy = body.entry[0].changes[0].value.from.id;
                            newSocialPost.postByType = body.entry[0].changes[0].value.verb;
                            newSocialPost.socialId = body.entry[0].changes[0].value.post_id;
                            newSocialPost.socialType = PROVIDER.FACEBOOK;
                            await this.socialPostService.create(newSocialPost);
                        } else {
                            return res.status(400).send('this values is removes from webhooks');
                        }
                    } else if (body.entry[0].changes[0].value.verb === 'add' && body.entry[0].changes[0].value.link !== undefined && body.entry[0].changes[0].value.photos === undefined && body.entry[0].changes[0].value.item !== 'share') {
                        const assetPic = await this.assetService.createAssetFromURL(body.entry[0].changes[0].value.link, pagesIdFb.ownerUser);
                        const checkPost = await this.socialPostService.find({ socialId: body.entry[0].changes[0].value.post_id, pageId: ObjectID(pagesSubScribe.id), socialType: PROVIDER.FACEBOOK });
                        const checkFeed = checkPost.shift();
                        if (checkFeed === undefined && assetPic !== undefined) {
                            const postPage: Posts = new Posts();
                            postPage.title = realText;
                            postPage.detail = body.entry[0].changes[0].value.message;
                            postPage.isDraft = false;
                            postPage.hidden = false;
                            postPage.type = POST_TYPE.GENERAL;
                            postPage.userTags = [];
                            postPage.coverImage = '';
                            postPage.pinned = false;
                            postPage.deleted = false;
                            postPage.ownerUser = pagesIdFb.ownerUser;
                            postPage.commentCount = 0;
                            postPage.repostCount = 0;
                            postPage.shareCount = 0;
                            postPage.likeCount = 0;
                            postPage.viewCount = 0;
                            postPage.createdDate = body.entry[0].changes[0].value.created_time;
                            postPage.startDateTime = moment().toDate();
                            postPage.story = null;
                            postPage.pageId = pagesIdFb.id;
                            postPage.referencePost = null;
                            postPage.rootReferencePost = null;
                            postPage.visibility = null;
                            postPage.ranges = null;
                            const createPostPageData: Posts = await this.postsService.create(postPage);
                            const newSocialPost = new SocialPost();
                            newSocialPost.pageId = pagesIdFb.id;
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
                                            await this.assetService.update({ _id: assetObj.id, userId: pagesIdFb.ownerUser }, { $set: { expirationDate: null } });
                                        }
                                    }
                                }
                            }
                        } else {
                            return res.status(400).send('this values is removes from webhooks');
                        }
                    } else if (body.entry[0].changes[0].value.verb === 'add' && body.entry[0].changes[0].value.link === undefined && body.entry[0].changes[0].value.photos !== undefined && body.entry[0].changes[0].value.item !== 'share') {
                        const multiPics = [];
                        for (let i = 0; i < body.entry[0].changes[0].value.photos.length; i++) {
                            if (i === 4) {
                                break;
                            }
                            const multiPic = await this.assetService.createAssetFromURL(body.entry[0].changes[0].value.photos[i], pagesIdFb.ownerUser);
                            multiPics.push(multiPic);
                        }
                        const checkPost = await this.socialPostService.find({ socialId: body.entry[0].changes[0].value.post_id, pageId: ObjectID(pagesSubScribe.id), socialType: PROVIDER.FACEBOOK });
                        const checkFeed = checkPost.shift();
                        if (checkFeed === undefined) {
                            const postPage: Posts = new Posts();
                            postPage.title = realText;
                            postPage.detail = body.entry[0].changes[0].value.message;
                            postPage.isDraft = false;
                            postPage.hidden = false;
                            postPage.type = POST_TYPE.GENERAL;
                            postPage.userTags = [];
                            postPage.coverImage = '';
                            postPage.pinned = false;
                            postPage.deleted = false;
                            postPage.ownerUser = pagesIdFb.ownerUser;
                            postPage.commentCount = 0;
                            postPage.repostCount = 0;
                            postPage.shareCount = 0;
                            postPage.likeCount = 0;
                            postPage.viewCount = 0;
                            postPage.createdDate = body.entry[0].changes[0].value.created_time;
                            postPage.startDateTime = moment().toDate();
                            postPage.story = null;
                            postPage.pageId = pagesIdFb.id;
                            postPage.referencePost = null;
                            postPage.rootReferencePost = null;
                            postPage.visibility = null;
                            postPage.ranges = null;
                            const createPostPageData: Posts = await this.postsService.create(postPage);
                            const newSocialPost = new SocialPost();
                            newSocialPost.pageId = pagesIdFb.id;
                            newSocialPost.postId = createPostPageData.id;
                            newSocialPost.postBy = body.entry[0].changes[0].value.from.id;
                            newSocialPost.postByType = body.entry[0].changes[0].value.verb;
                            newSocialPost.socialId = body.entry[0].changes[0].value.post_id;
                            newSocialPost.socialType = PROVIDER.FACEBOOK;
                            await this.socialPostService.create(newSocialPost);

                            for (let j = 0; j < multiPics.length; j++) {
                                const postsGallery = new PostsGallery();
                                postsGallery.post = createPostPageData.id;
                                postsGallery.fileId = new ObjectID(multiPics[j].id);
                                postsGallery.imageURL = ASSET_PATH + new ObjectID(multiPics[j].id);
                                postsGallery.s3ImageURL = multiPics[j].s3FilePath;
                                postsGallery.ordering = j + 1;
                                const postsGalleryCreate: PostsGallery = await this.postsGalleryService.create(postsGallery);
                                if (postsGalleryCreate) {
                                    await this.assetService.update({ _id: multiPics[j].id, userId: pagesIdFb.ownerUser }, { $set: { expirationDate: null } });
                                }
                            }
                        } else {
                            return res.status(400).send('this values is removes from webhooks');
                        }
                    } else if (body.entry[0].changes[0].value.verb === 'edit') {
                        const socialPost = await this.socialPostService.findOne({ postBy: body.entry[0].changes[0].value.post_id });
                        if (socialPost) {
                            const queryFB = { _id: socialPost.postId };
                            const setValue = { detail: body.entry[0].changes[0].value.message };
                            await this.postsService.update(queryFB, setValue);
                        } else {
                            console.log('cannot update values');
                        }
                    } else if (body.entry[0].changes[0].value.verb === 'add' && body.entry[0].changes[0].value.item === 'share' && body.entry[0].changes[0].value.link !== undefined) {
                        const checkPost = await this.socialPostService.find({ socialId: body.entry[0].changes[0].value.post_id, pageId: ObjectID(pagesSubScribe.id), socialType: PROVIDER.FACEBOOK });
                        const checkFeed = checkPost.shift();
                        const linkShare = 'https://facebook.com/' + body.entry[0].changes[0].value.link;
                        if (checkFeed === undefined) {
                            const postPage: Posts = new Posts();
                            postPage.title = 'แชร์จากเฟสบุ๊ค';
                            postPage.detail = linkShare;
                            postPage.isDraft = false;
                            postPage.hidden = false;
                            postPage.type = POST_TYPE.GENERAL;
                            postPage.userTags = [];
                            postPage.coverImage = '';
                            postPage.pinned = false;
                            postPage.deleted = false;
                            postPage.ownerUser = pagesIdFb.ownerUser;
                            postPage.commentCount = 0;
                            postPage.repostCount = 0;
                            postPage.shareCount = 0;
                            postPage.likeCount = 0;
                            postPage.viewCount = 0;
                            postPage.createdDate = body.entry[0].changes[0].value.created_time;
                            postPage.startDateTime = moment().toDate();
                            postPage.story = null;
                            postPage.pageId = pagesIdFb.id;
                            postPage.referencePost = null;
                            postPage.rootReferencePost = null;
                            postPage.visibility = null;
                            postPage.ranges = null;
                            const createPostPageData: Posts = await this.postsService.create(postPage);
                            const newSocialPost = new SocialPost();
                            newSocialPost.pageId = pagesIdFb.id;
                            newSocialPost.postId = createPostPageData.id;
                            newSocialPost.postBy = body.entry[0].changes[0].value.from.id;
                            newSocialPost.postByType = body.entry[0].changes[0].value.verb;
                            newSocialPost.socialId = body.entry[0].changes[0].value.post_id;
                            newSocialPost.socialType = PROVIDER.FACEBOOK;
                            await this.socialPostService.create(newSocialPost);
                        } else {
                            return res.status(400).send('this values is removes from webhooks');
                        }
                    } else if (body.entry[0].changes[0].value.verb === 'edited' && body.entry[0].changes[0].value.item === 'status' && body.entry[0].changes[0].value.link === undefined) {
                        console.log('pass6');
                        const splitArray = body.entry[0].changes[0].value.post_id.split('_');
                        const pageId = splitArray[0];
                        const videoId = splitArray[1];
                        const checkPost = await this.socialPostService.find({ socialId: body.entry[0].changes[0].value.post_id, pageId: ObjectID(pagesSubScribe.id), socialType: PROVIDER.FACEBOOK });
                        const checkFeed = checkPost.shift();
                        const realLink = 'https://facebook.com/' + pageId + '/videos/' + videoId;
                        if (checkFeed === undefined) {
                            const postPage: Posts = new Posts();
                            postPage.title = 'ไลฟ์สดจากเฟสบุ๊ค';
                            postPage.detail = realLink;
                            postPage.isDraft = false;
                            postPage.hidden = false;
                            postPage.type = POST_TYPE.GENERAL;
                            postPage.userTags = [];
                            postPage.coverImage = '';
                            postPage.pinned = false;
                            postPage.deleted = false;
                            postPage.ownerUser = pagesIdFb.ownerUser;
                            postPage.commentCount = 0;
                            postPage.repostCount = 0;
                            postPage.shareCount = 0;
                            postPage.likeCount = 0;
                            postPage.viewCount = 0;
                            postPage.createdDate = body.entry[0].changes[0].value.created_time;
                            postPage.startDateTime = moment().toDate();
                            postPage.story = null;
                            postPage.pageId = pagesIdFb.id;
                            postPage.referencePost = null;
                            postPage.rootReferencePost = null;
                            postPage.visibility = null;
                            postPage.ranges = null;
                            const createPostPageData: Posts = await this.postsService.create(postPage);
                            const newSocialPost = new SocialPost();
                            newSocialPost.pageId = pagesIdFb.id;
                            newSocialPost.postId = createPostPageData.id;
                            newSocialPost.postBy = body.entry[0].changes[0].value.from.id;
                            newSocialPost.postByType = body.entry[0].changes[0].value.verb;
                            newSocialPost.socialId = body.entry[0].changes[0].value.post_id;
                            newSocialPost.socialType = PROVIDER.FACEBOOK;
                            await this.socialPostService.create(newSocialPost);
                        } else {
                            return res.status(400).send('this values is removes from webhooks');
                        }
                    } else {
                        return res.status(400).send('this values is removes from webhooks');
                    }
                } else {
                    return res.status(400).send('this values is removes from webhooks');
                }
            }
        }
        return res.status(200).send('SuccessFul Webhooks');

    }
}