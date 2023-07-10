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
import { POST_WEIGHT_SCORE, DEFAULT_POST_WEIGHT_SCORE } from '../../constants/SystemConfig';
import { ConfigService } from '../services/ConfigService';
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
        private emergencyEventService: EmergencyEventService,
        private configService: ConfigService,

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
        const pageSubscribe = await this.socialPostLogsService.findOne({ providerUserId: String(body.entry[0].changes[0].value.from.id) });
        if (pageSubscribe === undefined) {
            const successResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
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
            msg = message_webhooks;
            checkPattern = msg.startsWith('[');
        }
        const regex = /[\[\]]/g;
        const titleLength = 150;

        console.log('PATTERN: ', checkPattern);

        if (checkPattern) {

            console.log('pass1');
            // check last ] after find [
            // try to find /n 
            // to cut and trim the title 
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
            if (message_webhooks !== undefined && value_verb === 'add' && body.entry[0].changes[0].value.comment_id === undefined && value_post === undefined && value_parent_id === undefined) {
                const title1 = msg.split('\n')[0];
                const title2 = title1.replace(regex, '').trim();

                realText = title2.length > titleLength
                    ? (title2.substring(0, titleLength) + '...')
                    : title2;
                console.log('TITLE: ', realText);

                TrimText = msg;
                console.log('DETAIL: ', TrimText);
            } else if (message_webhooks === undefined && value_verb === 'add' && value_reaction_like === 'like' && value_item === 'reaction' && value_parent_id !== undefined && change_value_link === undefined) {
                const likeConstance = 1;
                const findSocialPost = await this.socialPostService.findOne({ socialId: body.entry[0].changes[0].value.post_id });
                if (findSocialPost === undefined) {
                    const successResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                    return res.status(200).send(successResponse);
                }
                const findActualPost = await this.postsService.findOne({ _id: findSocialPost.postId, pageId: findSocialPost.pageId });
                if (findActualPost === undefined) {
                    const successResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                    return res.status(200).send(successResponse);
                }
                // 4*(3*(newLike+oldLike)) + summationScore. Example = 4*(3*(1+3))+23 = 48+23 = 71 ??
                const like = (xTodayxScore * (sTodayLike * (likeConstance + findActualPost.likeCount))) + (yFacebookyScore * (sFacebookLike * (likeConstance + findActualPost.likeCountFB)));
                const query = { _id: findActualPost.id };
                const newValuesLike = { $set: { likeCountFB: findActualPost.likeCountFB + likeConstance, summationScore: like } };
                const update = await this.postsService.update(query, newValuesLike);
                if (update) {
                    const successResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                    return res.status(200).send(successResponse);
                } else {
                    const successResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                    return res.status(200).send(successResponse);
                }
            } else if (value_verb === 'add' && value_item === 'comment' && value_comment_id !== undefined && value_post !== undefined && value_parent_id !== undefined && change_value_link === undefined) {
                const commentConstance = 1;
                const findSocialPost = await this.socialPostService.findOne({ socialId: body.entry[0].changes[0].value.post_id });
                if (findSocialPost === undefined) {
                    const successResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                    return res.status(200).send(successResponse);
                }
                const findActualPost = await this.postsService.findOne({ _id: findSocialPost.postId, pageId: findSocialPost.pageId });
                if (findActualPost === undefined) {
                    const successResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                    return res.status(200).send(successResponse);
                }
                // 4*(3*(newComment+oldComment)) + summationScore. Example = 4*(3*(1+10))+15 = 132+15 = 147
                const commnet = (xTodayxScore * (sTodayComment * (commentConstance + findActualPost.commentCount))) + (yFacebookyScore * (sFacebookComment * (commentConstance + findActualPost.commentCountFB)));
                const query = { _id: findActualPost.id };
                const newValuesLike = { $set: { commentCountFB: findActualPost.commentCountFB + commentConstance, summationScore: commnet } };
                const update = await this.postsService.update(query, newValuesLike);
                if (update) {
                    const upDatesuccessResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                    return res.status(200).send(upDatesuccessResponse);
                } else {
                    const ErrorsuccessResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                    return res.status(200).send(ErrorsuccessResponse);
                }
            } else if (message_webhooks === undefined && value_verb === 'add' && body.entry[0].changes[0].value.item === 'share' && change_value_link !== undefined && body.entry[0].changes[0].value.share_id !== undefined && body.entry[0].changes[0].value.post_id !== undefined) {
                const shareConstance = 1;
                const findSocialPost = await this.socialPostService.findOne({ socialId: body.entry[0].changes[0].value.post_id });
                if (findSocialPost === undefined) {
                    const ErrorFindPostsuccessResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                    return res.status(200).send(ErrorFindPostsuccessResponse);
                }
                const findActualPost = await this.postsService.findOne({ _id: findSocialPost.postId, pageId: findSocialPost.pageId });
                if (findActualPost === undefined) {
                    const ErrorActualPostsuccessResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                    return res.status(200).send(ErrorActualPostsuccessResponse);
                }
                // 4*(3*(newShare+oldShare)) + summationScore. Example = 4*(3*(1+6))+23 = 107, 4*(3*(1+7)) + 107 = 203
                const share = (xTodayxScore * (sTodayShare * (shareConstance + findActualPost.shareCount))) + (yFacebookyScore * (sShareFacebook * (shareConstance + findActualPost.shareCountFB)));
                const query = { _id: findActualPost.id };
                const newValuesLike = { $set: { shareCountFB: findActualPost.shareCountFB + shareConstance, summationScore: share } };
                const update = await this.postsService.update(query, newValuesLike);
                if (update) {
                    const UpdatesuccessResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                    return res.status(200).send(UpdatesuccessResponse);
                } else {
                    const ErrorsuccessResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                    return res.status(200).send(ErrorsuccessResponse);
                }
            }
        }
        const pageIdFB = await this.pageService.findOne({ _id: pageSubscribe.pageId });
        if (pageIdFB.isOfficial === false) {
            const successResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
            return res.status(200).send(successResponse);
        }
        if (pageIdFB === undefined) {
            const successResponse = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
            return res.status(200).send(successResponse);
        }
        if (body !== undefined && pageIdFB !== undefined && pageIdFB !== null && pageSubscribe.enable === true) {
            if (value_verb === 'add' &&
                change_value_link === undefined &&
                body.entry[0].changes[0].value.photos === undefined &&
                body.entry[0].changes[0].value.item !== 'share' &&
                body.entry[0].changes[0].value.item === 'status' &&
                published === 1) {
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
                    postPage.likeCountFB = 0;
                    postPage.commentCountFB = 0;
                    postPage.shareCountFB = 0;
                    postPage.newsFlag = false;
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
                    newSocialPost.postByType = value_verb;
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
                                }
                            ]
                        );
                        for (const EmergencyHash of findMostHashTag) {
                            EmergencyFound.push(EmergencyHash);
                        }
                    }
                    for (const findEmergencyPost of EmergencyFound) {
                        for (const realEmergencyPost of findEmergencyPost.EmergencyHaghTag) {
                            const queryEmergency = { _id: createPostPageData.id };
                            const newValuesTagEmergency = { $set: { emergencyEvent: realEmergencyPost._id, emergencyEventTag: findEmergencyPost.name } };
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
            } else if (
                value_verb === 'add' &&
                change_value_link !== undefined &&
                body.entry[0].changes[0].value.photos === undefined &&
                body.entry[0].changes[0].value.item !== 'share' &&
                body.entry[0].changes[0].value.item === 'photo' &&
                published === 1) {
                const assetPic = await this.assetService.createAssetFromURL(change_value_link, pageIdFB.ownerUser);
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
                    postPage.likeCountFB = 0;
                    postPage.commentCountFB = 0;
                    postPage.shareCountFB = 0;
                    postPage.newsFlag = false;
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
                    newSocialPost.postByType = value_verb;
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
                            const newValuesTagEmergency = { $set: { emergencyEvent: realEmergencyPost._id, emergencyEventTag: findEmergencyPost.name } };
                            const updateEmeg = await this.postsService.update(queryEmergency, newValuesTagEmergency);
                            if (updateEmeg) {
                                break;
                            }
                        }
                    }
                    await this.postsService.update(queryTag, newValuesTag);
                    if (createPostPageData) {
                        // Asset 
                        if (body.entry[0].changes[0].value.photos === undefined) {
                            if (assetPic) {
                                const postsGallery = new PostsGallery();
                                postsGallery.post = createPostPageData.id;
                                postsGallery.fileId = new ObjectID(assetPic.id);
                                postsGallery.imageURL = ASSET_PATH + new ObjectID(assetPic.id);
                                postsGallery.s3ImageURL = assetPic ? assetPic.s3FilePath : '';
                                postsGallery.ordering = published;
                                const postsGalleryCreate: PostsGallery = await this.postsGalleryService.create(postsGallery);
                                if (postsGalleryCreate) {
                                    await this.assetService.update({ _id: assetPic.id, userId: pageIdFB.ownerUser }, { $set: { expirationDate: null } });
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
            } else if (
                value_verb === 'add' &&
                change_value_link === undefined &&
                body.entry[0].changes[0].value.photos !== undefined &&
                body.entry[0].changes[0].value.item !== 'share' &&
                published === 1) {
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
                    postPage.likeCountFB = 0;
                    postPage.commentCountFB = 0;
                    postPage.shareCountFB = 0;
                    postPage.newsFlag = false;
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
                    newSocialPost.postByType = value_verb;
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
                            const newValuesTagEmergency = { $set: { emergencyEvent: realEmergencyPost._id, emergencyEventTag: findEmergencyPost.name } };
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
            }

            // delete Post

            else if (value_verb === 'edited' && body.entry[0].changes[0].value.message === undefined && body.entry[0].changes[0].value.item === 'status' && body.entry[0].changes[0].value.photo_id === undefined && published === 1) {
                const findPost = await this.socialPostService.findOne({ socialId: body.entry[0].changes[0].value.post_id, socialType: 'FACEBOOK' });
                if (findPost !== undefined && findPost !== null) {
                    const posted = await this.postsService.findOne({ _id: findPost.postId });
                    if (posted) {
                        const query = { _id: posted.id };
                        const update = await this.postsService.delete(query);
                        if (update) {
                            const successResponseError = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                            return res.status(200).send(successResponseError);
                        }
                    }
                } else {
                    const successResponseError = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                    return res.status(200).send(successResponseError);
                }
            }
            /*
            // delete post photo
            else if (value_verb === 'edited' && body.entry[0].changes[0].value.message === undefined && body.entry[0].changes[0].value.item === 'photo' && body.entry[0].changes[0].value.photo_id !== undefined) {
                const findPost = await this.socialPostService.findOne({ socialId: body.entry[0].changes[0].value.post_id, socialType: 'FACEBOOK' });
                if (findPost !== undefined && findPost !== null) {
                    const posted = await this.postsService.findOne({ _id: findPost.postId });
                    if (posted) {
                        const query = { _id: posted.id };
                        const update = await this.postsService.delete(query);
                        if (update) {
                            const successResponseError = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                            return res.status(200).send(successResponseError);
                        }
                    }
                } else {
                    const successResponseError = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                    return res.status(200).send(successResponseError);
                }
            } */
            else if (value_verb === 'edited' && change_value_link === undefined && body.entry[0].changes[0].value.photos === undefined && body.entry[0].changes[0].value.item === 'status' && published === 1) {
                const findPost = await this.socialPostService.findOne({ socialId: body.entry[0].changes[0].value.post_id, socialType: 'FACEBOOK' });
                if (findPost !== undefined && findPost !== null) {
                    const posted = await this.postsService.findOne({ _id: findPost.postId });
                    if (posted) {
                        const query = { _id: posted.id };
                        const newValues = { $set: { detail: body.entry[0].changes[0].value.message } };
                        const update = await this.postsService.update(query, newValues);
                        if (update) {
                            const successResponseError = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                            return res.status(200).send(successResponseError);
                        }
                    }
                } else {
                    const successResponseError = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                    return res.status(200).send(successResponseError);
                }

            } else if (value_verb === 'edited' && change_value_link !== undefined && body.entry[0].changes[0].value.photos === undefined && body.entry[0].changes[0].value.item === 'photo' && published === 1) {
                // message_webhooks = body.entry[0].changes[0].value.message
                if (body.entry[0].changes[0].value.message === undefined) {
                    const successResponseError = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                    return res.status(200).send(successResponseError);
                }
                const findPost = await this.socialPostService.findOne({ socialId: body.entry[0].changes[0].value.post_id, socialType: 'FACEBOOK' });
                if (findPost !== undefined && findPost !== null) {
                    const posted = await this.postsService.findOne({ _id: findPost.postId });
                    if (posted) {
                        const query = { _id: posted.id };
                        const newValues = { $set: { detail: body.entry[0].changes[0].value.message } };
                        const update = await this.postsService.update(query, newValues);
                        if (update) {
                            const successResponseError = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                            return res.status(200).send(successResponseError);
                        }
                    }
                } else {
                    const successResponseError = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                    return res.status(200).send(successResponseError);
                }

            } else if (value_verb === 'edited' && change_value_link === undefined && body.entry[0].changes[0].value.photos.length > 0 && body.entry[0].changes[0].value.item === 'status' && published === 1) {
                // message_webhooks = body.entry[0].changes[0].value.message
                if (body.entry[0].changes[0].value.message === undefined) {
                    const successResponseError = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                    return res.status(200).send(successResponseError);
                }
                const findPost = await this.socialPostService.findOne({ socialId: body.entry[0].changes[0].value.post_id, socialType: 'FACEBOOK' });
                if (findPost !== undefined && findPost !== null) {
                    const posted = await this.postsService.findOne({ _id: findPost.postId });
                    if (posted) {
                        const query = { _id: posted.id };
                        const newValues = { $set: { detail: body.entry[0].changes[0].value.message } };
                        const update = await this.postsService.update(query, newValues);
                        if (update) {
                            const successResponseError = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                            return res.status(200).send(successResponseError);
                        }
                    }
                } else {
                    const successResponseError = ResponseUtil.getSuccessResponse('Thank you for your service webhooks.', undefined);
                    return res.status(200).send(successResponseError);
                }
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