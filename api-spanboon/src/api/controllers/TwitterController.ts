/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import { JsonController, Res, Post, QueryParam, Get, Body, Req } from 'routing-controllers';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { TwitterService } from '../services/TwitterService';
import { TwitterVerifyRequest } from './requests/TwitterVerifyRequest';
// socialPostLogsService
import { SocialPostLogsService } from '../services/SocialPostLogsService';
// pageService 
// socialPostService
import { SocialPostService } from '../services/SocialPostService';
import { Posts } from '../models/Posts';
import { SocialPost } from '../models/SocialPost';
import { PostsService } from '../services/PostsService';
import { POST_TYPE } from '../../constants/PostType';
import { PROVIDER } from '../../constants/LoginProvider';
import moment from 'moment';
import { HashTag } from '../models/HashTag';
import { ObjectID } from 'typeorm';
import { HashTagService } from '../services/HashTagService';
import { PageObjectiveCategoryService } from '../services/PageObjectiveCategoryService';
import { EmergencyEventService } from '../services/EmergencyEventService';
import { PageObjectiveService } from '../services/PageObjectiveService';
@JsonController('/twitter')
export class TwitterController {

    constructor(
        private twitterService: TwitterService,
        private socialPostLogsService: SocialPostLogsService,
        private socialPostService: SocialPostService,
        private postsService: PostsService,
        private hashTagService: HashTagService,
        private pageObjectiveCategoryService: PageObjectiveCategoryService,
        private emergencyEventService: EmergencyEventService,
        private pageObjectiveService: PageObjectiveService
    ) { }

    /**
     * @api {post} /api/twitter/request_token Search Config API
     * @apiGroup Twitter
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully request token",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/twitter/request_token
     * @apiErrorExample {json} config error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/request_token')
    public async requestToken(@QueryParam('callback') callbackUrl: string, @Res() res: any): Promise<any> {
        try {
            const result = await this.twitterService.requestToken(callbackUrl);

            return res.status(200).send(result);
        } catch (err) {
            const errorResponse = ResponseUtil.getSuccessResponse('Cannot request token', err);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {get} /api/twitter/access_token Search Config API
     * @apiGroup Twitter
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully get access token",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/twitter/access_token
     * @apiErrorExample {json} config error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/access_token')
    public async accessToken(@QueryParam('oauth_token') oauthToken: string, @QueryParam('oauth_verifier') oauthVerifier: string, @Res() res: any): Promise<any> {
        try {
            const result = await this.twitterService.getAccessToken(oauthToken, oauthVerifier);

            return res.status(200).send(result);
        } catch (err) {
            const errorResponse = ResponseUtil.getSuccessResponse('Cannot get access token', err);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/twitter/account_verify account_verify API
     * @apiGroup Twitter
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully get account_verify",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/twitter/account_verify
     * @apiErrorExample {json} config error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/account_verify')
    public async accountVerify(@Body({ validate: true }) twitterParam: TwitterVerifyRequest, @Res() res: any): Promise<any> {
        try {
            const result = await this.twitterService.verifyCredentials(twitterParam.twitterOauthToken, twitterParam.twitterOauthTokenSecret);

            return res.status(200).send(result);
        } catch (err) {
            const errorResponse = ResponseUtil.getSuccessResponse('Cannot get access token', err);
            return res.status(400).send(errorResponse);
        }
    }
    @Get('/feed_tw')
    public async FeedTwitter(@Req() request: any, @Res() response: any): Promise<any> {
        let title = undefined;
        let trimText = undefined;
        const hashTagList2 = [];
        const postMasterHashTagList = [];
        const masterHashTagMap = {};
        const lastUpdated = moment().toDate(); // current date
        // search only page mode
        const oAuth2Twitter = await this.twitterService.getOauth2AppAccessTokenTest();
        const socialPostLogList = await this.socialPostLogsService.find({ providerName: PROVIDER.TWITTER, enable: true, pageId: { $exists: true }, lastUpdated: { $lte: lastUpdated } });
        const newPostResult = [];
        for (let i = 0; i < socialPostLogList.length; i++) {
            // search page
            console.log('socialPostLogList[i].providerUserId', socialPostLogList[i].providerUserId);
            const getUserTimeline = await this.twitterService.getTimeLineUser(socialPostLogList[i].providerUserId, oAuth2Twitter);
            if (getUserTimeline.data[i].id !== undefined && socialPostLogList[i].pageId !== undefined) {
                newPostResult.push({ 'postResult': getUserTimeline.data, 'pageTwi': socialPostLogList[i] });
            } else {
                continue;
            }
            // checked enable post social log enable === true
        }

        // for (const word in newPostResult.p)
        for (const [j, PostResult] of newPostResult.entries()) {
            if (PostResult.postResult[j].id !== undefined) {
                const checkPostSocial = await this.socialPostService.find({ pageId: PostResult.pageTwi.pageId, socialType: PROVIDER.TWITTER, socialId: PostResult.postResult[j].id });
                const httpsTwi = new RegExp('https://t.co/');
                const matchTwi = PostResult.postResult[j].text.match(httpsTwi);
                if (matchTwi !== null) {
                    trimText = PostResult.postResult[j].text.slice(0, matchTwi.index);
                } else {
                    trimText = PostResult.postResult[j].text;
                }
                // title2.substring(0, titleLength) + '...'
                if (PostResult.postResult[j].text.length <= 150) {
                    title = trimText.substring(0, 50);
                } else {
                    title = trimText.substring(0, 150) + '....';
                }
                const checkFeed = checkPostSocial.shift();
                if (checkFeed === undefined) {
                    const twPostId = PostResult.postResult[j].id;
                    const text = trimText;
                    const today = moment().toDate();
                    const postPage: Posts = new Posts();
                    postPage.title = title;
                    postPage.detail = text;
                    postPage.isDraft = false;
                    postPage.hidden = false;
                    postPage.type = POST_TYPE.GENERAL;
                    postPage.userTags = [];
                    postPage.coverImage = '';
                    postPage.pinned = false;
                    postPage.deleted = false;
                    postPage.ownerUser = PostResult.pageTwi.user;
                    postPage.commentCount = 0;
                    postPage.repostCount = 0;
                    postPage.shareCount = 0;
                    postPage.likeCount = 0;
                    postPage.viewCount = 0;
                    postPage.createdDate = today;
                    postPage.startDateTime = today;
                    postPage.story = null;
                    postPage.pageId = PostResult.pageTwi.pageId;
                    postPage.referencePost = null;
                    postPage.rootReferencePost = null;
                    postPage.visibility = null;
                    postPage.ranges = null;
                    const createPostPageData: Posts = await this.postsService.create(postPage);
                    const newSocialPost = new SocialPost();
                    newSocialPost.pageId = PostResult.pageTwi.pageId;
                    newSocialPost.postId = createPostPageData.id;
                    newSocialPost.postBy = PostResult.pageTwi.providerUserId;
                    newSocialPost.postByType = 'PAGE';
                    newSocialPost.socialId = twPostId;
                    newSocialPost.socialType = PROVIDER.TWITTER;
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

                        const findPageObjective = await this.pageObjectiveCategoryService.findOne({ pageId: PostResult.pageTwi.pageId, hashTag: masterHashTagList[textLength - 1].id });
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
                        postPage.postsHashTags = postMasterHashTagList;
                        for (const pageObjective of postMasterHashTagList) {
                            const pageFindtag = await this.pageObjectiveService.aggregate(
                                [
                                    { '$match': { 'pageId': PostResult.pageTwi.pageId, 'hashTag': pageObjective } },
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
                    }
                } else {
                    continue;
                }
            } else {
                continue;
            }
        }
        const successResponse = ResponseUtil.getSuccessResponse('Feed Twitter is Successfully', undefined);
        return response.status(200).send(successResponse);
    }
    private async findMasterHashTag(hashTagNameList: string[]): Promise<HashTag[]> {
        return await this.hashTagService.find({ name: { $in: hashTagNameList } });
    }
}
