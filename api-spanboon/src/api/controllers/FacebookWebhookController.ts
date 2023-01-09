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
        const pageSubscribe = await this.socialPostLogsService.findOne({ providerUserId: String(body.entry[0].changes[0].value.from.id) });
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
            realText = body.entry[0].changes[0].value.message.substring(0, 50) + '.....';
        }
        const pageIdFB = await this.pageService.findOne({ _id: pageSubscribe.pageId });        
        if (body !== undefined && pageIdFB !== undefined && pageIdFB !== null && pageSubscribe.enable === true) {
            if (body.entry[0].changes[0].value.verb === 'add' && body.entry[0].changes[0].value.link === undefined && body.entry[0].changes[0].value.photos === undefined && body.entry[0].changes[0].value.item !== 'share' && body.entry[0].changes[0].value.item === 'status' ) {
                const checkPost = await this.socialPostService.find({ socialId: body.entry[0].changes[0].value.post_id});
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
                    return res.status(200).send('SuccessFul Webhooks');
                }else{
                    return res.status(400);
                }
            } else if (body.entry[0].changes[0].value.verb === 'add' && body.entry[0].changes[0].value.link !== undefined && body.entry[0].changes[0].value.photos === undefined && body.entry[0].changes[0].value.item !== 'share' && body.entry[0].changes[0].value.item === 'photo') {
                const assetPic = await this.assetService.createAssetFromURL(body.entry[0].changes[0].value.link, pageIdFB.ownerUser);
                const checkPost = await this.socialPostService.find({ socialId: body.entry[0].changes[0].value.post_id});
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
                            return res.status(200).send('SuccessFul Webhooks');
                        }
                    }
                }else{
                    return res.status(400);
                }
            } else if (body.entry[0].changes[0].value.verb === 'add' && body.entry[0].changes[0].value.link === undefined && body.entry[0].changes[0].value.photos !== undefined && body.entry[0].changes[0].value.item !== 'share') {
                const multiPics = [];
                for (let i = 0; i < body.entry[0].changes[0].value.photos.length; i++) {
                    if (i === 4) {
                        break;
                    }
                    const multiPic = await this.assetService.createAssetFromURL(body.entry[0].changes[0].value.photos[i], pageIdFB.ownerUser);
                    multiPics.push(multiPic);
                }
                const checkPost = await this.socialPostService.find({ socialId: body.entry[0].changes[0].value.post_id});
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

                    for (let j = 0; j < multiPics.length; j++) {
                        const postsGallery = new PostsGallery();
                        postsGallery.post = createPostPageData.id;
                        postsGallery.fileId = new ObjectID(multiPics[j].id);
                        postsGallery.imageURL = ASSET_PATH + new ObjectID(multiPics[j].id);
                        postsGallery.s3ImageURL = multiPics[j].s3FilePath;
                        postsGallery.ordering = j + 1;
                        const postsGalleryCreate: PostsGallery = await this.postsGalleryService.create(postsGallery);
                        if (postsGalleryCreate) {
                            await this.assetService.update({ _id: multiPics[j].id, userId: pageIdFB.ownerUser }, { $set: { expirationDate: null } });
                        }
                    }
                    return res.status(200).send('SuccessFul Webhooks');
                }else{
                    return res.status(400);
                } 
            } else if (body.entry[0].changes[0].value.verb === 'edit') {
                const socialPost = await this.socialPostService.findOne({ postBy: body.entry[0].changes[0].value.post_id });
                if (socialPost) {
                    const queryFB = { _id: socialPost.postId };
                    const setValue = { detail: body.entry[0].changes[0].value.message };
                    await this.postsService.update(queryFB, setValue);
                    return res.status(200).send('SuccessFul Webhooks');
                } else {
                    console.log('cannot update values');
                }
            } else if (body.entry[0].changes[0].value.verb === 'add' && body.entry[0].changes[0].value.item === 'share' && body.entry[0].changes[0].value.link !== undefined) {
                console.log('pass5');
                return res.status(400).send('this values is removes from webhooks');
            } else if (body.entry[0].changes[0].value.verb === 'edited' && body.entry[0].changes[0].value.item === 'status' && body.entry[0].changes[0].value.link === undefined) {
                console.log('pass6');
                return res.status(400).send('this values is removes from webhooks');
            } else {
                return res.status(400).send('this values is removes from webhooks');
            }
        } else {
            return res.status(400).send('this values is removes from webhooks');
        }
    }
}