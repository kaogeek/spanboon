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
// import { EmergencyEventService } from '../services/EmergencyEventService';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { POST_WEIGHT_SCORE, DEFAULT_POST_WEIGHT_SCORE } from '../../constants/SystemConfig';
import { ConfigService } from '../services/ConfigService';
import { PageObjectiveJoinerService } from '../services/PageObjectiveJoinerService';
import { Webhooks } from '../../constants/Webhooks';
@JsonController('/fb_webhook')
export class FacebookWebhookController {
    constructor(
        private pageService: PageService,
        private postsService: PostsService,
        private socialPostService: SocialPostService,
        private assetService: AssetService,
        private postsGalleryService: PostsGalleryService,
        private socialPostLogsService: SocialPostLogsService,
        private hashTagService: HashTagService,
        private pageObjectiveService: PageObjectiveService,
        // private emergencyEventService: EmergencyEventService,
        private configService: ConfigService,
        private pageObjectiveJoinerService: PageObjectiveJoinerService

    ) {
    }

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
        const yFacebook = DEFAULT_POST_WEIGHT_SCORE.Y;
        const xToday = DEFAULT_POST_WEIGHT_SCORE.X;
        const likeFacebook = DEFAULT_POST_WEIGHT_SCORE.Lof;
        const commnetFacebook = DEFAULT_POST_WEIGHT_SCORE.Cof;
        const shareFacebook = DEFAULT_POST_WEIGHT_SCORE.Sof;
        const likeToday = DEFAULT_POST_WEIGHT_SCORE.Lot;
        const commentToday = DEFAULT_POST_WEIGHT_SCORE.Cot;
        const shareToday = DEFAULT_POST_WEIGHT_SCORE.Sot;

        const xTodayScore = await this.configService.getConfig(POST_WEIGHT_SCORE.X);
        const yFacebookScore = await this.configService.getConfig(POST_WEIGHT_SCORE.Y);
        const scorelikeToday = await this.configService.getConfig(POST_WEIGHT_SCORE.Lot);
        const scorecommentToday = await this.configService.getConfig(POST_WEIGHT_SCORE.Cot);
        const scoreShareToday = await this.configService.getConfig(POST_WEIGHT_SCORE.Sot);
        const scorelikeFacebook = await this.configService.getConfig(POST_WEIGHT_SCORE.Lof);
        const scoreCommentFacebook = await this.configService.getConfig(POST_WEIGHT_SCORE.Cof);
        const scoreShareFacebook = await this.configService.getConfig(POST_WEIGHT_SCORE.Sof);
        let xTodayxScore = xToday;
        let yFacebookyScore = yFacebook;
        let sTodayLike = likeToday;
        let sTodayComment = commentToday;
        let sTodayShare = shareToday;
        let sFacebookLike = likeFacebook;
        let sFacebookComment = commnetFacebook;
        let sShareFacebook = shareFacebook;

        if (xTodayScore) {
            xTodayxScore = parseFloat(xTodayScore.value);
        }
        if (scorelikeToday) {
            sTodayLike = parseFloat(scorelikeToday.value);
        }
        if (scorecommentToday) {
            sTodayComment = parseFloat(scorecommentToday.value);
        }
        if (scoreShareToday) {
            sTodayShare = parseFloat(scoreShareToday.value);
        }

        if (yFacebookScore) {
            yFacebookyScore = parseFloat(yFacebookScore.value);
        }
        if (scorelikeFacebook) {
            sFacebookLike = parseFloat(scorelikeFacebook.value);
        }
        if (scoreCommentFacebook) {
            sFacebookComment = parseFloat(scoreCommentFacebook.value);
        }
        if (scoreShareFacebook) {
            sShareFacebook = parseFloat(scoreShareFacebook.value);
        }

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
        const value_item = body.entry[0].changes[0].value.item;
        const value_comment_id = body.entry[0].changes[0].value.comment_id;
        const value_post = body.entry[0].changes[0].value.post;
        const value_parent_id = body.entry[0].changes[0].value.parent_id;
        const value_verb = body.entry[0].changes[0].value.verb;
        const value_reaction_like = body.entry[0].changes[0].value.reaction_type;
        const message_webhooks = body.entry[0].changes[0].value.message;
        const change_value_link = body.entry[0].changes[0].value.link;
        const published = body.entry[0].changes[0].value.published;
        // body.entry[0].changes[0].value.post_id
        const value_post_id = body.entry[0].changes[0].value.post_id;
        // body.entry[0].changes[0].value.share_id
        const value_share_id = body.entry[0].changes[0].value.share_id;
        // body.entry[0].changes[0].value.photos
        const value_photos = body.entry[0].changes[0].value.photos;
        // body.entry[0].changes[0].value.created_time
        const value_created_time = body.entry[0].changes[0].value.created_time;
        // body.entry[0].changes[0].value.photo_id
        const value_photo_id = body.entry[0].changes[0].value.photo_id;
        const pageSubscribe = await this.socialPostLogsService.findOne({ providerUserId: String(body.entry[0].changes[0].value.from.id) });
        if (pageSubscribe === undefined) {
            const successResponse = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
            return res.status(200).send(successResponse);
        }
        console.log('body.entry[0].changes[0].value', body.entry[0].changes[0].value);
        let realText = undefined;
        let TrimText = undefined;
        const hashTagList1 = [];
        const hashTagList2 = [];

        if (message_webhooks !== undefined) {

            const msgSplit = message_webhooks.split('#');
            if (msgSplit !== undefined) {
                for (let i = 1; i < msgSplit.length; i++) {
                    hashTagList1.push(msgSplit[i].split('\n')[0]);
                }

                for (let i = 0; i < hashTagList1.length; i++) {
                    hashTagList2.push(hashTagList1[i].split(' ')[0]);
                }
            }
        }
        let msg = undefined;
        let checkPattern = undefined;
        if (message_webhooks !== undefined) {
            const title = await this.machineState(message_webhooks);
            msg = title;
            checkPattern = msg.startsWith('[');
        }
        const regex = /[\[\]]/g;
        const titleLength = 150;

        if (checkPattern) {

            const regex2 = /[.\-_,*+?^$|\\]/;
            const result = msg.lastIndexOf(']');
            console.log('result', result);
            const title1 = msg.slice(0, (result + 1));
            realText = title1.replace(regex, '').trim();
            console.log('TITLE: ', realText);

            const detail1 = msg.replace(title1, '').trim();
            const checkDetail = detail1.startsWith('.\n');

            if (checkDetail) {
                TrimText = detail1.replace(regex2, '').trim();
                console.log('DETAIL: ', TrimText);
            } else {
                TrimText = detail1;
                console.log('DETAIL: ', TrimText);
            }
        } else {
            if (message_webhooks !== undefined && value_verb === Webhooks.value_verb_add && body.entry[0].changes[0].value.comment_id === undefined && value_post === undefined && value_parent_id === undefined) {
                const title1 = msg.split('\n')[0];
                const title2 = title1.replace(regex, '').trim();

                realText = title2.length > titleLength
                    ? (title2.substring(0, titleLength) + '...')
                    : title2;
                console.log('TITLE: ', realText);

                TrimText = msg;
                console.log('DETAIL: ', TrimText);
            } else if (
                message_webhooks === undefined &&
                value_verb === Webhooks.value_verb_add &&
                value_reaction_like === Webhooks.value_verb_like &&
                value_item === Webhooks.value_item_reaction &&
                value_parent_id !== undefined &&
                change_value_link === undefined
            ) {
                const likeConstance = 1;
                const findSocialPost = await this.socialPostService.findOne({ socialId: value_post_id });
                if (findSocialPost === undefined) {
                    const successResponse = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                    return res.status(200).send(successResponse);
                }
                const findActualPost = await this.postsService.findOne({ _id: findSocialPost.postId, pageId: findSocialPost.pageId });
                if (findActualPost === undefined) {
                    const successResponse = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                    return res.status(200).send(successResponse);
                }

                // 4*(3*(newLike+oldLike)) + summationScore. Example = 4*(3*(1+3))+23 = 48+23 = 71 ??

                const like = (xTodayxScore * (sTodayLike * (likeConstance + findActualPost.likeCount))) + (yFacebookyScore * (sFacebookLike * (likeConstance + findActualPost.likeCountFB)));
                const query = { _id: findActualPost.id };
                const newValuesLike = { $set: { likeCountFB: findActualPost.likeCountFB + likeConstance, summationScore: like } };
                const update = await this.postsService.update(query, newValuesLike);
                if (update) {
                    const successResponse = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                    return res.status(200).send(successResponse);
                } else {
                    const successResponse = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                    return res.status(200).send(successResponse);
                }
            } else if (
                value_verb === Webhooks.value_verb_add &&
                value_item === Webhooks.value_item_comment &&
                value_comment_id !== undefined &&
                value_post !== undefined &&
                value_parent_id !== undefined &&
                change_value_link === undefined) {
                const commentConstance = 1;
                const findSocialPost = await this.socialPostService.findOne({ socialId: value_post_id });
                if (findSocialPost === undefined) {
                    const successResponse = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                    return res.status(200).send(successResponse);
                }
                const findActualPost = await this.postsService.findOne({ _id: findSocialPost.postId, pageId: findSocialPost.pageId });
                if (findActualPost === undefined) {
                    const successResponse = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                    return res.status(200).send(successResponse);
                }
                // 4*(3*(newComment+oldComment)) + summationScore. Example = 4*(3*(1+10))+15 = 132+15 = 147
                const commnet = (xTodayxScore * (sTodayComment * (commentConstance + findActualPost.commentCount))) + (yFacebookyScore * (sFacebookComment * (commentConstance + findActualPost.commentCountFB)));
                const query = { _id: findActualPost.id };
                const newValuesLike = { $set: { commentCountFB: findActualPost.commentCountFB + commentConstance, summationScore: commnet } };
                const update = await this.postsService.update(query, newValuesLike);
                if (update) {
                    const upDatesuccessResponse = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                    return res.status(200).send(upDatesuccessResponse);
                } else {
                    const ErrorsuccessResponse = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                    return res.status(200).send(ErrorsuccessResponse);
                }
            } else if (
                message_webhooks === undefined &&
                value_verb === Webhooks.value_verb_add &&
                value_item === Webhooks.value_item_share &&
                change_value_link !== undefined &&
                value_share_id !== undefined &&
                value_post_id !== undefined) {
                const shareConstance = 1;
                const findSocialPost = await this.socialPostService.findOne({ socialId: value_post_id });
                if (findSocialPost === undefined) {
                    const ErrorFindPostsuccessResponse = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                    return res.status(200).send(ErrorFindPostsuccessResponse);
                }
                const findActualPost = await this.postsService.findOne({ _id: findSocialPost.postId, pageId: findSocialPost.pageId });
                if (findActualPost === undefined) {
                    const ErrorActualPostsuccessResponse = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                    return res.status(200).send(ErrorActualPostsuccessResponse);
                }
                // 4*(3*(newShare+oldShare)) + summationScore. Example = 4*(3*(1+6))+23 = 107, 4*(3*(1+7)) + 107 = 203
                const share = (xTodayxScore * (sTodayShare * (shareConstance + findActualPost.shareCount))) + (yFacebookyScore * (sShareFacebook * (shareConstance + findActualPost.shareCountFB)));
                const query = { _id: findActualPost.id };
                const newValuesLike = { $set: { shareCountFB: findActualPost.shareCountFB + shareConstance, summationScore: share } };
                const update = await this.postsService.update(query, newValuesLike);
                if (update) {
                    const UpdatesuccessResponse = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                    return res.status(200).send(UpdatesuccessResponse);
                } else {
                    const ErrorsuccessResponse = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                    return res.status(200).send(ErrorsuccessResponse);
                }
            }
        }
        const pageIdFB = await this.pageService.findOne({ _id: pageSubscribe.pageId });

        if (pageIdFB.isOfficial === false) {
            const successResponse = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
            return res.status(200).send(successResponse);
        } 
        if (pageIdFB === undefined) {
            const successResponse = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
            return res.status(200).send(successResponse);
        }

        if (message_webhooks === undefined && TrimText === undefined) {
            TrimText = 'ไม่มีคำบรรยาย';
        }

        if (body !== undefined && pageIdFB !== undefined && pageIdFB !== null && pageSubscribe.enable === true) {
            if (
                value_verb === Webhooks.value_verb_add &&
                change_value_link === undefined &&
                value_photos === undefined &&
                value_item !== Webhooks.value_item_share &&
                value_item === Webhooks.value_item_status
                && published === 1) {
                const checkPost = await this.socialPostService.find({ socialId: value_post_id });
                const checkFeed = checkPost.shift();
                if (checkFeed === undefined) {
                    const createPostWebhooks: Posts = await this.createPostWebhooks(realText, message_webhooks, pageIdFB.ownerUser, pageIdFB.id, value_created_time);
                    await this.socialPostFunction(pageIdFB.id, createPostWebhooks.id, body.entry[0].changes[0].value.from.id, value_verb, value_post_id);

                    if (hashTagList2 !== null && hashTagList2 !== undefined && hashTagList2.length > 0) {
                        const masterHashTagList: any = await this.findHashTag(hashTagList2);
                        for (const hashTag of masterHashTagList) {
                            const id = hashTag._id;
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
                        if (masterHashTagList.length > 0) {
                            await this.updateCountHashTag(masterHashTagList);
                        }
                    }
                    const hashTagsObjIds = postMasterHashTagList.map(_id => new ObjectID(_id));
                    // db.PageObjective.aggregate([{"$match":{"pageId":ObjectId('63bebb5e4677b2062a66b606')}},{"$limit":1},{"$sort":{"createdDate":-1}}])
                    let pageFindtag = await this.pageObjectiveService.aggregate(
                        [
                            {
                                $match: {
                                    pageId: pageSubscribe.pageId,
                                    hashTag: { $in: hashTagsObjIds }
                                }
                            },
                            {
                                $lookup: {
                                    from: 'HashTag',
                                    let: { hashTag: '$hashTag' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $eq: ['$$hashTag', '$_id']
                                                }
                                            }
                                        },
                                        {
                                            $match: {
                                                type: 'OBJECTIVE'
                                            }
                                        }
                                    ],
                                    as: 'hashTag'
                                }
                            },
                            {
                                $match: { hashTag: { $ne: [] } }
                            },
                            {
                                $limit: 1
                            }
                        ]);
                    // 64af7a7c0ac242710bbfbe4e
                    if (pageFindtag.length > 0) {
                        await this.objectiveFunction(pageFindtag, pageSubscribe.pageId, createPostWebhooks.id, postMasterHashTagList);
                        await this.updateCountObjecitve(pageSubscribe.pageId, postMasterHashTagList);
                    } else {
                        pageFindtag = await this.pageObjectiveService.aggregate(
                            [
                                {
                                    $match: {
                                        pageId: pageSubscribe.pageId,
                                        hashTag: { $in: hashTagsObjIds }
                                    }
                                },
                                {
                                    $limit: 1
                                }
                            ]);
                        await this.objectiveFunction(pageFindtag, pageSubscribe.pageId, createPostWebhooks.id, postMasterHashTagList);

                    }
                    const queryTag = { _id: createPostWebhooks.id };
                    const newValuesTag = { $set: { postsHashTags: postMasterHashTagList } };

                    if (postMasterHashTagList.length > 0) {
                        await this.emergencyEventFunction(postMasterHashTagList, pageSubscribe.pageId, createPostWebhooks.id);
                    }

                    await this.postsService.update(queryTag, newValuesTag);
                    const successResponse = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                    return res.status(200).send(successResponse);
                } else {
                    const successResponse = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                    return res.status(200).send(successResponse);
                }
            } else if (
                value_verb === Webhooks.value_verb_add &&
                change_value_link !== undefined &&
                value_photos === undefined &&
                value_item !== Webhooks.value_item_share &&
                value_item === Webhooks.value_item_photo &&
                published === 1) {
                const assetPic = await this.assetService.createAssetFromURL(change_value_link, pageIdFB.ownerUser);
                const checkPost = await this.socialPostService.find({ socialId: value_post_id });
                const checkFeed = checkPost.shift();
                if (checkFeed === undefined && assetPic !== undefined) {
                    const createPostWebhooks: Posts = await this.createPostWebhooks(realText, message_webhooks, pageIdFB.ownerUser, pageIdFB.id, value_created_time);
                    await this.socialPostFunction(pageIdFB.id, createPostWebhooks.id, body.entry[0].changes[0].value.from.id, value_verb, value_post_id);
                    if (hashTagList2 !== null && hashTagList2 !== undefined && hashTagList2.length > 0) {
                        const masterHashTagList: any = await this.findHashTag(hashTagList2);
                        for (const hashTag of masterHashTagList) {
                            const id = hashTag._id;
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
                        if (masterHashTagList.length > 0) {
                            await this.updateCountHashTag(masterHashTagList);
                        }
                    }
                    // db.PageObjective.aggregate([{"$match":{"pageId":ObjectId('63bebb5e4677b2062a66b606')}},{"$limit":1},{"$sort":{"createdDate":-1}}])
                    let pageFindtag = await this.pageObjectiveService.aggregate(
                        [
                            { $match: { pageId: pageSubscribe.pageId, hashTag: { $in: postMasterHashTagList } } },
                            {
                                $lookup: {
                                    from: 'HashTag',
                                    let: { hashTag: '$hashTag' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $eq: ['$$hashTag', '$_id']
                                                }
                                            }
                                        },
                                        {
                                            $match: { type: 'OBJECTIVE' }
                                        }
                                    ],
                                    as: 'hashTag'
                                }
                            },
                            {
                                $match: { hashTag: { $ne: [] } }
                            },
                            {
                                $limit: 1
                            },
                        ]);
                    // 64af7a7c0ac242710bbfbe4e
                    if (pageFindtag.length > 0) {
                        await this.objectiveFunction(pageFindtag, pageSubscribe.pageId, createPostWebhooks.id, postMasterHashTagList);
                        await this.updateCountObjecitve(pageSubscribe.pageId, postMasterHashTagList);
                    } else {
                        pageFindtag = await this.pageObjectiveService.aggregate(
                            [
                                {
                                    $match: {
                                        pageId: pageSubscribe.pageId,
                                        hashTag: { $in: postMasterHashTagList }
                                    }
                                },
                                {
                                    $limit: 1
                                }
                            ]);
                        await this.objectiveFunction(pageFindtag, pageSubscribe.pageId, createPostWebhooks.id, postMasterHashTagList);

                    }
                    const queryTag = { _id: createPostWebhooks.id };
                    const newValuesTag = { $set: { postsHashTags: postMasterHashTagList } };

                    if (postMasterHashTagList.length > 0) {
                        await this.emergencyEventFunction(postMasterHashTagList, pageSubscribe.pageId, createPostWebhooks.id);
                    }

                    await this.postsService.update(queryTag, newValuesTag);
                    if (createPostWebhooks) {
                        // Asset 
                        if (value_photos === undefined) {
                            if (assetPic) {
                                const postsGallery = new PostsGallery();
                                postsGallery.post = createPostWebhooks.id;
                                postsGallery.fileId = new ObjectID(assetPic.id);
                                postsGallery.imageURL = ASSET_PATH + new ObjectID(assetPic.id);
                                postsGallery.s3ImageURL = assetPic ? assetPic.s3FilePath : '';
                                postsGallery.ordering = published;
                                const postsGalleryCreate: PostsGallery = await this.postsGalleryService.create(postsGallery);
                                if (postsGalleryCreate) {
                                    await this.assetService.update({ _id: assetPic.id, userId: pageIdFB.ownerUser }, { $set: { expirationDate: null } });
                                }
                            }
                            const successResponse = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                            return res.status(200).send(successResponse);
                        }
                    }
                } else {
                    const successResponse = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                    return res.status(200).send(successResponse);
                }
            } else if (
                value_verb === Webhooks.value_verb_add &&
                change_value_link === undefined &&
                value_photos !== undefined &&
                value_item !== Webhooks.value_item_share &&
                published === 1) {
                const multiPics = [];
                for (let i = 0; i < value_photos.length; i++) {
                    if (i === 4) {
                        break;
                    }
                    const multiPic = await this.assetService.createAssetFromURL(value_photos[i], pageIdFB.ownerUser);
                    multiPics.push(multiPic);
                }
                const checkPost = await this.socialPostService.find({ socialId: value_post_id });
                const checkFeed = checkPost.shift();
                if (checkFeed === undefined) {
                    const createPostWebhooks: Posts = await this.createPostWebhooks(realText, message_webhooks, pageIdFB.ownerUser, pageIdFB.id, value_created_time);
                    await this.socialPostFunction(pageIdFB.id, createPostWebhooks.id, body.entry[0].changes[0].value.from.id, value_verb, value_post_id);

                    if (hashTagList2 !== null && hashTagList2 !== undefined && hashTagList2.length > 0) {
                        const masterHashTagList: any = await this.findHashTag(hashTagList2);
                        for (const hashTag of masterHashTagList) {
                            const id = hashTag._id;
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
                        if (masterHashTagList.length > 0) {
                            await this.updateCountHashTag(masterHashTagList);
                        }
                    }

                    let pageFindtag = await this.pageObjectiveService.aggregate(
                        [
                            { $match: { pageId: pageSubscribe.pageId, hashTag: { $in: postMasterHashTagList } } },
                            {
                                $lookup: {
                                    from: 'HashTag',
                                    let: { hashTag: '$hashTag' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $eq: ['$$hashTag', '$_id']
                                                }
                                            }
                                        },
                                        {
                                            $match: { type: 'OBJECTIVE' }
                                        }
                                    ],
                                    as: 'hashTag'
                                }
                            },
                            {
                                $match: { hashTag: { $ne: [] } }
                            },
                            {
                                $limit: 1
                            }
                        ]);
                    if (pageFindtag.length > 0) {
                        await this.objectiveFunction(pageFindtag, pageSubscribe.pageId, createPostWebhooks.id, postMasterHashTagList);
                        await this.updateCountObjecitve(pageSubscribe.pageId, postMasterHashTagList);
                    } else {
                        pageFindtag = await this.pageObjectiveService.aggregate(
                            [
                                {
                                    $match: {
                                        pageId: pageSubscribe.pageId,
                                        hashTag: { $in: postMasterHashTagList }
                                    }
                                },
                                {
                                    $limit: 1
                                }
                            ]);
                        await this.objectiveFunction(pageFindtag, pageSubscribe.pageId, createPostWebhooks.id, postMasterHashTagList);

                    }
                    const queryTag = { _id: createPostWebhooks.id };
                    const newValuesTag = { $set: { postsHashTags: postMasterHashTagList } };

                    if (postMasterHashTagList.length > 0) {
                        await this.emergencyEventFunction(postMasterHashTagList, pageSubscribe.pageId, createPostWebhooks.id);
                    }

                    await this.postsService.update(queryTag, newValuesTag);
                    for (let j = 0; j < multiPics.length; j++) {
                        const postsGallery = new PostsGallery();
                        postsGallery.post = createPostWebhooks.id;
                        postsGallery.fileId = new ObjectID(multiPics[j].id);
                        postsGallery.imageURL = ASSET_PATH + new ObjectID(multiPics[j].id);
                        postsGallery.s3ImageURL = multiPics[j].s3FilePath;
                        postsGallery.ordering = j + 1;
                        const postsGalleryCreate: PostsGallery = await this.postsGalleryService.create(postsGallery);
                        if (postsGalleryCreate) {
                            await this.assetService.update({ _id: multiPics[j].id, userId: pageIdFB.ownerUser }, { $set: { expirationDate: null } });
                        }
                    }
                    const successResponse = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                    return res.status(200).send(successResponse);
                } else {
                    const successResponse = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                    return res.status(200).send(successResponse);
                }
            }

            // delete Post

            else if (value_verb === Webhooks.value_verb_edited
                && message_webhooks === undefined &&
                value_item === Webhooks.value_item_status &&
                value_photo_id === undefined
                && published === 1) {
                const findPost = await this.socialPostService.findOne({ socialId: value_post_id, socialType: Webhooks.socialType });
                if (findPost !== undefined && findPost !== null) {
                    const posted = await this.postsService.findOne({ _id: findPost.postId });
                    if (posted) {
                        const query = { _id: posted.id };
                        const update = await this.postsService.delete(query);
                        if (update) {
                            const successResponseError = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                            return res.status(200).send(successResponseError);
                        }
                    }
                } else {
                    const successResponseError = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                    return res.status(200).send(successResponseError);
                }
            }
            /*
            // delete post photo
            else if (value_verb === 'edited' && message_webhooks === undefined && body.entry[0].changes[0].value.item === 'photo' && value_photo_id !== undefined) {
                const findPost = await this.socialPostService.findOne({ socialId: value_post_id, socialType: Webhooks.socialType });
                if (findPost !== undefined && findPost !== null) {
                    const posted = await this.postsService.findOne({ _id: findPost.postId });
                    if (posted) {
                        const query = { _id: posted.id };
                        const update = await this.postsService.delete(query);
                        if (update) {
                            const successResponseError = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                            return res.status(200).send(successResponseError);
                        }
                    }
                } else {
                    const successResponseError = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                    return res.status(200).send(successResponseError);
                }
            } */
            else if (value_verb === Webhooks.value_verb_edited && change_value_link === undefined && value_photos === undefined && value_item === 'status' && published === 1) {
                const findPost = await this.socialPostService.findOne({ socialId: value_post_id, socialType: Webhooks.socialType });
                if (findPost !== undefined && findPost !== null) {
                    const posted = await this.postsService.findOne({ _id: findPost.postId });
                    if (posted) {
                        const query = { _id: posted.id };
                        const newValues = { $set: { detail: message_webhooks } };
                        const update = await this.postsService.update(query, newValues);
                        if (update) {
                            const successResponseError = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                            return res.status(200).send(successResponseError);
                        }
                    }
                } else {
                    const successResponseError = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                    return res.status(200).send(successResponseError);
                }

            } else if (value_verb === Webhooks.value_verb_edited && change_value_link !== undefined && value_photos === undefined && value_item === 'photo' && published === 1) {
                // message_webhooks = message_webhooks
                if (message_webhooks === undefined) {
                    const successResponseError = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                    return res.status(200).send(successResponseError);
                }
                const findPost = await this.socialPostService.findOne({ socialId: value_post_id, socialType: Webhooks.socialType });
                if (findPost !== undefined && findPost !== null) {
                    const posted = await this.postsService.findOne({ _id: findPost.postId });
                    if (posted) {
                        const query = { _id: posted.id };
                        const newValues = { $set: { detail: message_webhooks } };
                        const update = await this.postsService.update(query, newValues);
                        if (update) {
                            const successResponseError = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                            return res.status(200).send(successResponseError);
                        }
                    }
                } else {
                    const successResponseError = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                    return res.status(200).send(successResponseError);
                }

            } else if (
                value_verb === Webhooks.value_verb_edited &&
                change_value_link === undefined &&
                value_photos.length > 0 &&
                value_item === Webhooks.value_item_status &&
                published === 1) {
                // message_webhooks = message_webhooks
                if (message_webhooks === undefined) {
                    const successResponseError = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                    return res.status(200).send(successResponseError);
                }
                const findPost = await this.socialPostService.findOne({ socialId: value_post_id, socialType: Webhooks.socialType });
                if (findPost !== undefined && findPost !== null) {
                    const posted = await this.postsService.findOne({ _id: findPost.postId });
                    if (posted) {
                        const query = { _id: posted.id };
                        const newValues = { $set: { detail: message_webhooks } };
                        const update = await this.postsService.update(query, newValues);
                        if (update) {
                            const successResponseError = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                            return res.status(200).send(successResponseError);
                        }
                    }
                } else {
                    const successResponseError = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                    return res.status(200).send(successResponseError);
                }
            } else {
                const successResponse = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
                return res.status(200).send(successResponse);
            }
        } else {
            const successResponse = ResponseUtil.getSuccessResponse(Webhooks.thank_service_webhooks, undefined);
            return res.status(200).send(successResponse);
        }
    }

    private async createPostWebhooks(title: string, detail: string, ownerUser: string, pageId: string, create_time: any): Promise<any> {
        const pageObjIds = new ObjectID(pageId);
        const userObjIds = new ObjectID(ownerUser);
        const postPage: Posts = new Posts();
        postPage.title = title;
        postPage.detail = detail;
        postPage.isDraft = false;
        postPage.hidden = false;
        postPage.type = POST_TYPE.GENERAL;
        postPage.userTags = [];
        postPage.coverImage = '';
        postPage.pinned = false;
        postPage.deleted = false;
        postPage.ownerUser = userObjIds;
        postPage.commentCount = 0;
        postPage.repostCount = 0;
        postPage.shareCount = 0;
        postPage.likeCount = 0;
        postPage.viewCount = 0;
        postPage.likeCountFB = 0;
        postPage.commentCountFB = 0;
        postPage.shareCountFB = 0;
        postPage.newsFlag = false;
        postPage.createdDate = create_time;
        postPage.startDateTime = moment().toDate();
        postPage.story = null;
        postPage.pageId = pageObjIds;
        postPage.referencePost = null;
        postPage.rootReferencePost = null;
        postPage.visibility = null;
        postPage.ranges = null;
        return await this.postsService.create(postPage);
    }

    private async socialPostFunction(pageId: string, postId: string, postBy: any, verb: string, socialPostId: string): Promise<any> {
        const pageObjIds = new ObjectID(pageId);
        const postObjIds = new ObjectID(postId);
        const newSocialPost = new SocialPost();
        newSocialPost.pageId = pageObjIds;
        newSocialPost.postId = postObjIds;
        newSocialPost.postBy = postBy;
        newSocialPost.postByType = verb;
        newSocialPost.socialId = socialPostId;
        newSocialPost.socialType = PROVIDER.FACEBOOK;
        await this.socialPostService.create(newSocialPost);

    }

    private async emergencyEventFunction(hashTagMasters: any, pageId: string, postId: string): Promise<any> {
        const findMostHashTag: any = await this.hashTagService.aggregate(
            [
                {
                    $match:
                        { _id: { $in: hashTagMasters } }
                },
                {
                    $sort:
                    {
                        count: -1
                    }
                },
                {
                    $limit: 1
                },
                {
                    $lookup: {
                        from: 'EmergencyEvent',
                        localField: '_id',
                        foreignField: 'hashTag',
                        as: 'emergencyHaghTag'
                    }
                },
                {
                    $match: { emergencyHaghTag: { $ne: [] } }
                },
                {
                    $unwind: {
                        path: '$emergencyHaghTag',
                        preserveNullAndEmptyArrays: true
                    }
                },
            ]
        );
        const postObjIds = new ObjectID(postId);
        const pageObjIds = new ObjectID(pageId);
        const EmergencyFound = [];
        if (findMostHashTag.length > 0) {
            for (const EmergencyHash of findMostHashTag) {
                if (EmergencyHash.emergencyHaghTag !== undefined && EmergencyHash.emergencyHaghTag !== null) {
                    EmergencyFound.push(EmergencyHash.emergencyHaghTag);
                } else {
                    continue;
                }
            }
        }
        if (EmergencyFound.length > 0) {
            for (const findEmergencyPost of EmergencyFound) {
                const queryEmergency = { _id: postObjIds, pageId: pageObjIds };
                const newValuesTagEmergency = { $set: { emergencyEvent: findEmergencyPost._id, emergencyEventTag: findEmergencyPost.title } };
                const updateEmeg = await this.postsService.update(queryEmergency, newValuesTagEmergency);
                if (updateEmeg) {
                    break;
                }
            }
        }
    }

    private async objectiveFunction(objectiveObj: any, pageId: string, postIds: string, hashTag: any): Promise<any> {
        const postObjIds = new ObjectID(postIds);
        const pageObjIds = new ObjectID(pageId);
        const hashObjIds = hashTag.map(_id => new ObjectID(_id));
        if (objectiveObj.length > 0) {
            const foundPageTag: any = objectiveObj.shift();
            // single objective
            if (foundPageTag) {
                const hashName = await this.hashTagService.findOne({ pageId: pageObjIds, objectiveId: foundPageTag._id, type: 'OBJECTIVE' });
                const query = { _id: postObjIds };
                const newValues = {
                    $set: {
                        objective: foundPageTag._id, objectiveTag: hashName.name
                    }
                };
                const updateObjective = await this.postsService.update(query, newValues);
                if (updateObjective) {
                    // multi objective 
                    await this.postsService.updateMany({ postsHashTags: { $in: hashObjIds }, objective: null, objectiveTag: null }, { $set: { objective: foundPageTag._id, objectiveTag: hashName.name } });

                }
            }

        } else {

            /* joiner objective !!!  */
            let joinerObjective: any;
            joinerObjective = await this.pageObjectiveJoinerService.aggregate(
                [
                    {
                        $match: { joiner: pageObjIds, join: true, approve: true }
                    },
                    {
                        $lookup: {
                            from: 'PageObjective',
                            let: { objectiveId: '$objectiveId' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ['$$objectiveId', '$_id']
                                        }
                                    }
                                },
                                {
                                    $match: { hashTag: { $in: hashObjIds } }
                                }

                            ],
                            as: 'pageObjective'
                        }
                    },
                    {
                        $match: { pageObjective: { $ne: [] } }
                    },
                    {
                        $unwind: {
                            path: '$pageObjective',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                ]
            );
            const postIdsJoin: any = await this.postsService.aggregate([
                {
                    $match: {
                        _id: postObjIds,
                        pageId: pageObjIds,
                        objective: null,
                        objectiveTag: null,
                        postsHashTags: { $in: hashObjIds }
                    }
                },
                {
                    $project: {
                        _id: 1
                    }
                }
            ]);
            let query;
            let newValues;
            const stackIds = [];
            if (postIdsJoin.length > 0) {
                for (const postObjId of postIdsJoin) {
                    stackIds.push(new ObjectID(postObjId._id));
                }
            }
            if (joinerObjective.length > 0) {
                for (const pageObjectiveJoin of joinerObjective) {
                    const hashName = await this.hashTagService.findOne(
                        {
                            pageId: new ObjectID(pageObjectiveJoin.pageId),
                            objectiveId: new ObjectID(pageObjectiveJoin.objectiveId),
                            type: 'OBJECTIVE'
                        });
                    query = { pageId: pageObjIds, _id: postObjIds };
                    newValues = {
                        $set: {
                            objective: hashName.objectiveId, objectiveTag: hashName.name
                        }
                    };
                    await this.postsService.update(query, newValues);
                }

                // update multi objective

            }
        }
    }

    private async updateCountObjecitve(pageId: string, hashTagObj: any): Promise<any> {
        const pageObjIds = new ObjectID(pageId);
        for (const hashTags of hashTagObj) {
            const count = parseInt(hashTags.count, 10);
            const queryHashTag = { name: String(hashTags.name), type: 'OBJECTIVE', pageId: pageObjIds };
            const newValuesHashTag = { $set: { count: count + 1 } };
            await this.hashTagService.update(queryHashTag, newValuesHashTag);
        }
    }

    private async updateCountHashTag(hashTagObj: any): Promise<any> {
        for (const hashTags of hashTagObj) {
            const count = parseInt(hashTags.count, 10);
            const queryHashTag = { _id: new ObjectID(hashTags._id), type: null };
            const newValuesHashTag = { $set: { count: count + 1 } };
            await this.hashTagService.update(queryHashTag, newValuesHashTag);
        }
    }

    private async findHashTag(hashTagNameList: string[]): Promise<HashTag[]> {
        return await this.hashTagService.aggregate(
            [
                {
                    $match:
                    {
                        name: { $in: hashTagNameList },
                        type: 'OBJECTIVE',

                    }
                },
                {
                    $sort: { count: -1 }
                }
            ]
        );
    }

    private async machineState(message: string): Promise<any> {
        function createMachine(stateMachineDefinition: any): any {
            const machineDefinition: any = stateMachineDefinition;
            const actions: any = {};
            const transitions: any = {};
            for (const [state, definition] of Object.entries(machineDefinition)) {
                const key_header: any = state;
                const key_transition: any = definition;
                actions[key_header] = key_transition.actions || {};
                transitions[key_transition] = key_transition.transitions || {};
            }
            return {
                currectState: machineDefinition.initialState,
                value: machineDefinition.initialState,
                actions,
                transitions,

                transition(action: any): any {
                    const currect = this.currectState;
                    const transitionData: any = this.transitions[currect][action];

                    if (!transitionData) {
                        return this.value;
                    }
                    const { target, action: transitionAction } = transitionData;
                    if (transitionAction) {
                        transitionAction();
                    }
                    if (this.actions[target] && this.actions[target][action]) {
                        this.actions[target][action]();
                    }

                    this.currectState = target;
                    this.value = target;
                    return this.value;

                }
            };

        }
        const title: any = [];
        function getCharClass(char: string): any {
            if (char === '[') {
                title.push(char);
                return '[';
            } else if (char === ']') {
                title.push(char);
                return ']';
            } else if (char === '\n') {
                return '\n';
            } else {
                title.push(char);
                return 'words';
            }
        }
        const machine: any = createMachine({
            initialState: 'start',
            start: {
                actions: {
                    openBracket(): any {
                        console.log('Open bracket initialState start');
                    },
                },
                transitions: {
                    '[': { target: 'title', action: () => console.log('Transition to title state') },
                    '\n': { target: 'end', action: () => console.log('Transition to end state') },
                },
            },
            title: {
                actions: {
                    word(char: string): any {
                        console.log(`Title state adding char: ${char}`);
                    },
                    closeBracket(): any {
                        console.log('Close bracket title state');
                    },
                },
                transitions: {
                    ']': { target: 'last', action: () => console.log('Transition to last state') },
                    '\n': { target: 'end', action: () => console.log('Transition to end state') },
                },
            },
            last: {
                actions: {
                    word(char: string): any {
                        console.log(`Last state adding char: ${char}`);
                    },
                    closeBracket(): any {
                        console.log('Close bracket last state');
                    },
                },
                transitions: {
                    '[': { target: 'title', action: () => console.log('Transition to title state') },
                    '\n': { target: 'end', action: () => console.log('Transition to end state') },
                },
            },
            end: {
                actions: {
                    word(char: string): any {
                        console.log(`End state ignoring char :${char}`);
                    }
                }
            }
        });
        for (let i = 0; i < message.length; i++) {
            const char = message.charAt(i);
            const charClass = getCharClass(char);
            if (charClass === '\n') {
                break;
            }

            machine.transition(charClass);
        }
        const result = title.join('');
        return result;
    }
}