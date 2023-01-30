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

@JsonController('/twitter')
export class TwitterController {
    constructor(
        private twitterService: TwitterService,
        private socialPostLogsService: SocialPostLogsService,
        private socialPostService: SocialPostService,
        private postsService: PostsService
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
        const lastUpdated = moment().toDate(); // current date
        // search only page mode
        const oAuth2Twitter = await this.twitterService.getOauth2AppAccessTokenTest();
        const socialPostLogList = await this.socialPostLogsService.find({ providerName: PROVIDER.TWITTER, enable: true, pageId: { $exists: true }, lastUpdated: { $lte: lastUpdated } });
        const newPostResult = [];
        for (let i = 0; i < socialPostLogList.length; i++) {
            // search page
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
}
