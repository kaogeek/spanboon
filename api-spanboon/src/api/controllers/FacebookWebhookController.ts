/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import 'reflect-metadata';
import moment from 'moment';
import { JsonController, Res, QueryParams, Body, Get,Post,Req } from 'routing-controllers';
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
import { AuthenticationIdService } from '../services/AuthenticationIdService';
@JsonController('/fb_webhook')
export class FacebookWebhookController {
    constructor(
        private pageService: PageService, private postsService: PostsService, private socialPostService: SocialPostService,
        private assetService: AssetService, private postsGalleryService: PostsGalleryService,
        private authenticationIdService: AuthenticationIdService,

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

        const query = {providerName:PROVIDER.FACEBOOK,properties:{name:body.entry[0].changes[0].value.from.name,pageId:body.entry[0].changes[0].value.from.id}};
        const subScribePage = await this.authenticationIdService.findOne(query);
        const pageIdFB = await this.pageService.findOne({ownerUser:subScribePage.user});
        if (body !== undefined && pageIdFB !== undefined && pageIdFB !== null) {
            // verb type -> 3 types -> add,edit,remove
            if(body.entry[0].changes[0].value.verb === 'add' && body.entry[0].changes[0].value.link === undefined && body.entry[0].changes[0].value.photos === undefined){
                const checkPost = await this.socialPostService.findOne({postBy:body.entry[0].changes[0].value.post_id,postByType:'add'});
                if(checkPost === undefined){
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
                    return res.status(200).send('SuccessFul Webhooks');
                }
            }else if(body.entry[0].changes[0].value.verb === 'add'&& body.entry[0].changes[0].value.link !== undefined || body.entry[0].changes[0].value.photos !== undefined){
                const checkPost = await this.socialPostService.findOne({postBy:body.entry[0].changes[0].value.post_id,postByType:'add'});
                if(checkPost === undefined){
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
                    if(createPostPageData){
                        // Asset 
                        const photoGallery = [];
                        if(body.entry[0].changes[0].value.photos === undefined){
                            try {
                                const asset = await this.assetService.createAssetFromURL(body.entry[0].changes[0].value.link, pageIdFB.ownerUser);
                                if (asset !== undefined) {
                                    photoGallery.push(asset);
                                }
                            } catch (error) {
                                console.log('error create asset from url', error);
                            }
                            for (const asset of photoGallery) {
                                const gallery = new PostsGallery();
                                gallery.fileId = asset.id;
                                gallery.post = createPostPageData.id;
                                gallery.imageURL = asset ? ASSET_PATH + asset.id : '';
                                gallery.s3ImageURL = asset.s3FilePath;
                                gallery.ordering = body.entry[0].changes[0].value.published;
                                await this.postsGalleryService.create(gallery);
                                return res.status(200).send('SuccessFul Webhooks');
                            }
                        }else{
                            for(const photosFB of body.entry[0].changes[0].value.photos){
                                const stackPhotos = [];
                                try{
                                    const asset = await this.assetService.createAssetFromURL(photosFB, pageIdFB.ownerUser);
                                    if (asset !== undefined) {
                                        stackPhotos.push(asset);
                                    }
                                }catch(error){
                                    console.log('error crteate asset from url',error);
                                }
                                for (const asset of stackPhotos) {
                                    const gallery = new PostsGallery();
                                    gallery.fileId = asset.id;
                                    gallery.post = createPostPageData.id;
                                    gallery.imageURL = asset ? ASSET_PATH + asset.id : '';
                                    gallery.s3ImageURL = asset.s3FilePath;
                                    gallery.ordering = body.entry[0].changes[0].value.published;
                                    await this.postsGalleryService.create(gallery);
                                    return res.status(200).send('SuccessFul Webhooks');
                                }
                            }
                        }  
                    }
                }
            }else if(body.entry[0].changes[0].value.verb === 'edit'){
                const socialPost = await this.socialPostService.findOne({postBy:body.entry[0].changes[0].value.post_id});
                if(socialPost){
                    const queryFB = {_id:socialPost.postId};
                    const setValue = {detail:body.entry[0].changes[0].value.message};
                    await this.postsService.update(queryFB,setValue);
                    return res.status(200).send('Success updated Webhooks');
                }else{
                    console.log('cannot update values');
                }
            }else{
                return res.status(400).send('this values is removes from webhooks');
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