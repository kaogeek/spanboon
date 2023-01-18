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
import { HashTag } from '../models/HashTag';
import { HashTagService } from '../services/HashTagService';
import { PageObjectiveService } from '../services/PageObjectiveService';
import { EmergencyEventService } from '../services/EmergencyEventService';
import { ResponseUtil } from '../../utils/ResponseUtil';
@JsonController('/fb_webhook')
export class FacebookWebhookController {
    constructor(
        private pageService: PageService, private postsService: PostsService, private socialPostService: SocialPostService,
        private assetService: AssetService, private postsGalleryService: PostsGalleryService,
        private socialPostLogsService: SocialPostLogsService,
        private hashTagService: HashTagService,
        private pageObjectiveService: PageObjectiveService,
        private emergencyEventService: EmergencyEventService,
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
        const postMasterHashTagList = [];
        const masterHashTagMap = {};
        const today = moment().toDate();
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
        if (pageSubscribe === undefined) {
            const successResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
            return res.status(200).send(successResponse);
        }
        let sliceArray = undefined;
        let text1 = undefined;
        let text2 = undefined;
        let realText = undefined;
        let detailText = undefined;
        let TrimText = undefined;
        let fullStop = undefined;
        const hashTagList1 = [];
        const hashTagList2 = [];
        const msgSplit = body.entry[0].changes[0].value.message.split('#');
        if (msgSplit === undefined) {
            const successResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
            return res.status(200).send(successResponse);
        }
        if (msgSplit) {
            for (let i = 1; i < msgSplit.length; i++) {
                hashTagList1.push(msgSplit[i].split('\n')[0]);
            }

            for (let i = 0; i < hashTagList1.length; i++) {
                hashTagList2.push(hashTagList1[i].split(' ')[0]);
            }
        }
        const match = /r\n|\n/.exec(body.entry[0].changes[0].value.message);
        if (match === undefined) {
            const successResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
            return res.status(200).send(successResponse);
        }
        console.log('body.entry[0].changes[0].value.message', body.entry[0].changes[0].value);
        if (body.entry[0].changes[0].value.message === undefined) {
            const successResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
            return res.status(200).send(successResponse);
        }
        if (match) {
            sliceArray = body.entry[0].changes[0].value.message.slice(0, match.index);
            text1 = sliceArray.indexOf('[');
            text2 = sliceArray.indexOf(']');
            fullStop = body.entry[0].changes[0].value.message.indexOf('.');
            if (text1 !== -1 && text2 !== -1) {
                // []
                realText = body.entry[0].changes[0].value.message.substring(text1 + 1, text2);
                detailText = body.entry[0].changes[0].value.message.substring(fullStop + 1, body.entry[0].changes[0].value.message.length - 1);
                TrimText = detailText.trim();
            } else if (text1 !== -1 && text2 === -1) {
                // [
                const matchBackSlashT1 = /r\n|\n/.exec(body.entry[0].changes[0].value.message);
                realText = body.entry[0].changes[0].value.message.slice(text1 + 1, matchBackSlashT1.index);
                detailText = body.entry[0].changes[0].value.message.substring(matchBackSlashT1.index, body.entry[0].changes[0].value.message.length - 1);
                TrimText = detailText.trim();
            } else if (text1 === -1 && text2 !== -1) {
                // ]
                const matchBackSlashT2 = /r\n|\n/.exec(body.entry[0].changes[0].value.message);
                realText = body.entry[0].changes[0].value.message.slice(0, text2);
                detailText = body.entry[0].changes[0].value.message.substring(matchBackSlashT2.index, body.entry[0].changes[0].value.message.length - 1);
                TrimText = detailText.trim();
            } else if (text1 === -1 && text2 === -1) {
                const textMessage = body.entry[0].changes[0].value.message.length;
                if (textMessage >= 50) {
                    realText = body.entry[0].changes[0].value.message.substring(0, 50) + '.....';
                    detailText = body.entry[0].changes[0].value.message;
                    TrimText = detailText.trim();
                } else {
                    realText = body.entry[0].changes[0].value.message.substring(0, 30);
                    detailText = body.entry[0].changes[0].value.message;
                    TrimText = detailText.trim();
                }
            }
        } else {
            const textMessage = body.entry[0].changes[0].value.message.length;
            fullStop = body.entry[0].changes[0].value.message.indexOf('.');
            if (textMessage >= 50) {
                realText = body.entry[0].changes[0].value.message.substring(0, fullStop + 1) + '.....';
                detailText = body.entry[0].changes[0].value.message;
                TrimText = detailText.trim();
            } else {
                realText = body.entry[0].changes[0].value.message.substring(0, fullStop + 1);
                detailText = body.entry[0].changes[0].value.message;
                TrimText = detailText.trim();
            }
        }
        const pageIdFB = await this.pageService.findOne({ _id: pageSubscribe.pageId });
        if (pageIdFB === undefined) {
            const successResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
            return res.status(200).send(successResponse);
        }
        if (body !== undefined && pageIdFB !== undefined && pageIdFB !== null && pageSubscribe.enable === true) {
            if (body.entry[0].changes[0].value.verb === 'add' && body.entry[0].changes[0].value.link === undefined && body.entry[0].changes[0].value.photos === undefined && body.entry[0].changes[0].value.item !== 'share' && body.entry[0].changes[0].value.item === 'status') {
                const checkPost = await this.socialPostService.find({ socialId: body.entry[0].changes[0].value.post_id });
                const checkFeed = checkPost.shift();
                if (checkFeed === undefined) {
                    const postPage: Posts = new Posts();
                    postPage.title = realText;
                    postPage.detail = TrimText;
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
                    if (hashTagList2 !== null && hashTagList2 !== undefined && hashTagList2.length > 0) {
                        const masterHashTagList: HashTag[] = await this.findMasterHashTag(hashTagList2);
                        for (const hashTag of masterHashTagList) {
                            const id = hashTag.id;
                            const name = hashTag.name;
                            postMasterHashTagList.push(new ObjectID(id));
                            masterHashTagMap[name] = hashTag;
                        }
                        for (const hashTag of hashTagList2) {
                            if (masterHashTagMap[hashTag] === undefined) {
                                const newHashTag: HashTag = new HashTag();
                                newHashTag.name = hashTag;
                                newHashTag.lastActiveDate = today;
                                newHashTag.count = 0;
                                newHashTag.iconURL = '';

                                const newMasterHashTag: HashTag = await this.hashTagService.create(newHashTag);

                                if (newMasterHashTag !== null && newMasterHashTag !== undefined) {
                                    postMasterHashTagList.push(new ObjectID(newMasterHashTag.id));

                                    masterHashTagMap[hashTag] = newMasterHashTag;
                                }
                            }
                        }

                    }
                    // db.PageObjective.aggregate([{"$match":{"pageId":ObjectId('63bebb5e4677b2062a66b606')}},{"$limit":1},{"$sort":{"createdDate":-1}}])
                    postPage.postsHashTags = postMasterHashTagList;
                    for (const pageObjective of postMasterHashTagList) {
                        const pageFindtag = await this.pageObjectiveService.aggregate(
                            [
                                { '$match': { 'pageId': pageSubscribe.pageId, 'hashTag': pageObjective } },
                                { '$sort': { 'createdDate': -1 } },
                                { '$limit': 1 }
                            ]);
                        const foundPageTag = pageFindtag.shift();
                        if (foundPageTag) {
                            const query = { _id: createPostPageData.id };
                            const newValues = {
                                $set: {
                                    objective: foundPageTag._id, objectiveTag: foundPageTag.title
                                }
                            };
                            const updateTag = await this.postsService.update(query, newValues);
                            if (updateTag) {
                                break;
                            }
                        } else {
                            break;
                        }
                    }
                    const queryTag = { _id: createPostPageData.id };
                    const newValuesTag = { $set: { postsHashTags: postPage.postsHashTags } };
                    const EmergencyFound = [];
                    for (const hashTags of postMasterHashTagList) {
                        const findMostHashTag = await this.hashTagService.aggregate(
                            [
                                {
                                    '$match':
                                        { '_id': ObjectID(hashTags) }
                                },
                                {
                                    '$sort':
                                    {
                                        'createdDate': -1
                                    }
                                },
                                {
                                    '$limit': 1
                                }, {
                                    '$lookup': {
                                        from: 'EmergencyEvent',
                                        localField: '_id',
                                        foreignField: 'hashTag',
                                        as: 'EmergencyHaghTag'
                                    }
                                }]);
                        for (const EmergencyHash of findMostHashTag) {
                            EmergencyFound.push(EmergencyHash);
                        }
                    }
                    for (const findEmergencyPost of EmergencyFound) {
                        for (const realEmergencyPost of findEmergencyPost.EmergencyHaghTag) {
                            const queryEmergency = { _id: createPostPageData.id };
                            const newValuesTagEmergency = { $set: { emergencyEvent: realEmergencyPost._id, emergencyEventTag: realEmergencyPost.title } };
                            const updateEmeg = await this.postsService.update(queryEmergency, newValuesTagEmergency);
                            if (updateEmeg) {
                                break;
                            }
                        }
                    }
                    await this.postsService.update(queryTag, newValuesTag);
                    const successResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                    return res.status(200).send(successResponse);
                } else {
                    const successResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                    return res.status(200).send(successResponse);
                }
            } else if (body.entry[0].changes[0].value.verb === 'add' && body.entry[0].changes[0].value.link !== undefined && body.entry[0].changes[0].value.photos === undefined && body.entry[0].changes[0].value.item !== 'share' && body.entry[0].changes[0].value.item === 'photo') {
                const assetPic = await this.assetService.createAssetFromURL(body.entry[0].changes[0].value.link, pageIdFB.ownerUser);
                const checkPost = await this.socialPostService.find({ socialId: body.entry[0].changes[0].value.post_id });
                const checkFeed = checkPost.shift();
                if (checkFeed === undefined && assetPic !== undefined) {
                    const postPage: Posts = new Posts();
                    postPage.title = realText;
                    postPage.detail = TrimText;
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
                    if (hashTagList2 !== null && hashTagList2 !== undefined && hashTagList2.length > 0) {
                        const masterHashTagList: HashTag[] = await this.findMasterHashTag(hashTagList2);
                        const textLength = masterHashTagList.length;
                        for (const hashTag of masterHashTagList) {
                            const id = hashTag.id;
                            const name = hashTag.name;
                            postMasterHashTagList.push(new ObjectID(id));
                            masterHashTagMap[name] = hashTag;
                        }

                        const findPageObjective = await this.pageObjectiveService.findOne({ pageId: pageSubscribe.pageId, hashTag: masterHashTagList[textLength - 1].id });
                        if (findPageObjective) {
                            const queryPic = { _id: createPostPageData.id };
                            const newValuesPic = {
                                $set:
                                {
                                    objective: findPageObjective.id,
                                    objectiveTag: findPageObjective.title
                                }
                            };
                            await this.postsService.update(queryPic, newValuesPic);
                        }
                        const findEmergencyEvent = await this.emergencyEventService.findOne({ hashTag: masterHashTagList[textLength - 1].id });
                        if (findEmergencyEvent) {
                            const queryEmergency = { _id: createPostPageData.id };
                            const newValuesEmergecy = { $set: { emergencyEvent: findEmergencyEvent.id, emergencyEventTag: findEmergencyEvent.title } };
                            await this.postsService.update(queryEmergency, newValuesEmergecy);
                        }

                        for (const hashTag of hashTagList2) {
                            if (masterHashTagMap[hashTag] === undefined) {
                                const newHashTag: HashTag = new HashTag();
                                newHashTag.name = hashTag;
                                newHashTag.lastActiveDate = today;
                                newHashTag.count = 0;
                                newHashTag.iconURL = '';

                                const newMasterHashTag: HashTag = await this.hashTagService.create(newHashTag);

                                if (newMasterHashTag !== null && newMasterHashTag !== undefined) {
                                    postMasterHashTagList.push(new ObjectID(newMasterHashTag.id));

                                    masterHashTagMap[hashTag] = newMasterHashTag;
                                }
                            }
                        }
                    }
                    // db.PageObjective.aggregate([{"$match":{"pageId":ObjectId('63bebb5e4677b2062a66b606')}},{"$limit":1},{"$sort":{"createdDate":-1}}])
                    postPage.postsHashTags = postMasterHashTagList;
                    for (const pageObjective of postMasterHashTagList) {
                        const pageFindtag = await this.pageObjectiveService.aggregate(
                            [
                                { '$match': { 'pageId': pageSubscribe.pageId, 'hashTag': pageObjective } },
                                { '$sort': { 'createdDate': -1 } },
                                { '$limit': 1 }
                            ]);
                        const foundPageTag = pageFindtag.shift();
                        if (foundPageTag) {
                            const query = { _id: createPostPageData.id };
                            const newValues = {
                                $set: {
                                    objective: foundPageTag._id, objectiveTag: foundPageTag.title
                                }
                            };
                            const updateTag = await this.postsService.update(query, newValues);
                            if (updateTag) {
                                break;
                            }
                        } else {
                            break;
                        }
                    }
                    const queryTag = { _id: createPostPageData.id };
                    const newValuesTag = { $set: { postsHashTags: postPage.postsHashTags } };
                    const EmergencyFound = [];
                    for (const hashTags of postMasterHashTagList) {
                        const findMostHashTag = await this.hashTagService.aggregate(
                            [
                                {
                                    '$match':
                                        { '_id': ObjectID(hashTags) }
                                },
                                {
                                    '$sort':
                                    {
                                        'createdDate': -1
                                    }
                                },
                                {
                                    '$limit': 1
                                }, {
                                    '$lookup': {
                                        from: 'EmergencyEvent',
                                        localField: '_id',
                                        foreignField: 'hashTag',
                                        as: 'EmergencyHaghTag'
                                    }
                                }]);
                        for (const EmergencyHash of findMostHashTag) {
                            EmergencyFound.push(EmergencyHash);
                        }
                    }
                    for (const findEmergencyPost of EmergencyFound) {
                        for (const realEmergencyPost of findEmergencyPost.EmergencyHaghTag) {
                            const queryEmergency = { _id: createPostPageData.id };
                            const newValuesTagEmergency = { $set: { emergencyEvent: realEmergencyPost._id, emergencyEventTag: realEmergencyPost.title } };
                            const updateEmeg = await this.postsService.update(queryEmergency, newValuesTagEmergency);
                            if (updateEmeg) {
                                break;
                            }
                        }
                    }
                    await this.postsService.update(queryTag, newValuesTag);
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
                            const successResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                            return res.status(200).send(successResponse);
                        }
                    }
                } else {
                    const successResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                    return res.status(200).send(successResponse);
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
                const checkPost = await this.socialPostService.find({ socialId: body.entry[0].changes[0].value.post_id });
                const checkFeed = checkPost.shift();
                if (checkFeed === undefined) {
                    const postPage: Posts = new Posts();
                    postPage.title = realText;
                    postPage.detail = TrimText;
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
                    if (hashTagList2 !== null && hashTagList2 !== undefined && hashTagList2.length > 0) {
                        const masterHashTagList: HashTag[] = await this.findMasterHashTag(hashTagList2);
                        for (const hashTag of masterHashTagList) {
                            const id = hashTag.id;
                            const name = hashTag.name;
                            postMasterHashTagList.push(new ObjectID(id));
                            masterHashTagMap[name] = hashTag;
                        }
                        for (const hashTag of hashTagList2) {
                            if (masterHashTagMap[hashTag] === undefined) {
                                const newHashTag: HashTag = new HashTag();
                                newHashTag.name = hashTag;
                                newHashTag.lastActiveDate = today;
                                newHashTag.count = 0;
                                newHashTag.iconURL = '';

                                const newMasterHashTag: HashTag = await this.hashTagService.create(newHashTag);

                                if (newMasterHashTag !== null && newMasterHashTag !== undefined) {
                                    postMasterHashTagList.push(new ObjectID(newMasterHashTag.id));

                                    masterHashTagMap[hashTag] = newMasterHashTag;
                                }
                            }
                        }
                    }
                    // db.PageObjective.aggregate([{"$match":{"pageId":ObjectId('63bebb5e4677b2062a66b606')}},{"$limit":1},{"$sort":{"createdDate":-1}}])
                    postPage.postsHashTags = postMasterHashTagList;
                    for (const pageObjective of postMasterHashTagList) {
                        const pageFindtag = await this.pageObjectiveService.aggregate(
                            [
                                { '$match': { 'pageId': pageSubscribe.pageId, 'hashTag': pageObjective } },
                                { '$sort': { 'createdDate': -1 } },
                                { '$limit': 1 }
                            ]);
                        const foundPageTag = pageFindtag.shift();
                        if (foundPageTag) {
                            const query = { _id: createPostPageData.id };
                            const newValues = {
                                $set: {
                                    objective: foundPageTag._id, objectiveTag: foundPageTag.title
                                }
                            };
                            const updateTag = await this.postsService.update(query, newValues);
                            if (updateTag) {
                                break;
                            }
                        } else {
                            break;
                        }
                    }
                    const queryTag = { _id: createPostPageData.id };
                    const newValuesTag = { $set: { postsHashTags: postPage.postsHashTags } };
                    const EmergencyFound = [];
                    for (const hashTags of postMasterHashTagList) {
                        const findMostHashTag = await this.hashTagService.aggregate(
                            [
                                {
                                    '$match':
                                        { '_id': ObjectID(hashTags) }
                                },
                                {
                                    '$sort':
                                    {
                                        'createdDate': -1
                                    }
                                },
                                {
                                    '$limit': 1
                                }, {
                                    '$lookup': {
                                        from: 'EmergencyEvent',
                                        localField: '_id',
                                        foreignField: 'hashTag',
                                        as: 'EmergencyHaghTag'
                                    }
                                }]);
                        for (const EmergencyHash of findMostHashTag) {
                            EmergencyFound.push(EmergencyHash);
                        }
                    }
                    for (const findEmergencyPost of EmergencyFound) {
                        for (const realEmergencyPost of findEmergencyPost.EmergencyHaghTag) {
                            const queryEmergency = { _id: createPostPageData.id };
                            const newValuesTagEmergency = { $set: { emergencyEvent: realEmergencyPost._id, emergencyEventTag: realEmergencyPost.title } };
                            const updateEmeg = await this.postsService.update(queryEmergency, newValuesTagEmergency);
                            if (updateEmeg) {
                                break;
                            }
                        }
                    }
                    await this.postsService.update(queryTag, newValuesTag);
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
                    const successResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                    return res.status(200).send(successResponse);
                } else {
                    const successResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                    return res.status(200).send(successResponse);
                }
            } else if (body.entry[0].changes[0].value.verb === 'edit') {
                const socialPost = await this.socialPostService.findOne({ postBy: body.entry[0].changes[0].value.post_id });
                if (socialPost) {
                    const queryFB = { _id: socialPost.postId };
                    const setValue = { detail: body.entry[0].changes[0].value.message };
                    await this.postsService.update(queryFB, setValue);
                    const successResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                    return res.status(200).send(successResponse);
                } else {
                    console.log('cannot update values');
                }
            } else if (body.entry[0].changes[0].value.verb === 'add' && body.entry[0].changes[0].value.item === 'share' && body.entry[0].changes[0].value.link !== undefined) {
                console.log('pass5');
                const successResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                return res.status(200).send(successResponse);
            } else if (body.entry[0].changes[0].value.verb === 'edited' && body.entry[0].changes[0].value.item === 'status' && body.entry[0].changes[0].value.link === undefined) {
                console.log('pass6');
                const successResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                return res.status(200).send(successResponse);
            } else {
                const successResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                return res.status(200).send(successResponse);
            }
        } else {
            const successResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
            return res.status(200).send(successResponse);
        }
    }

    private async findMasterHashTag(hashTagNameList: string[]): Promise<HashTag[]> {
        return await this.hashTagService.find({ name: { $in: hashTagNameList } });
    }

}