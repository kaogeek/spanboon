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
import { PageService } from '../services/PageService';
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
        private pageService: PageService,
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
        // const result = await this.twitterService.getTwitterUserTimeLine('2244994945', {since_id: '1514727372779520020'});
        // console.log('result',result);
        // return response.status(200).send(result);

        // const result = await this.twitterService.fetchPostByTwitterUser('3051797173');
        // return response.status(200).send(result);
        // search from logs that not update in 10 min
        const lastUpdated = moment().toDate(); // current date
        // search only page mode
        const oAuth2Twitter = await this.twitterService.getOauth2AppAccessTokenTest();
        const socialPostLogList = await this.socialPostLogsService.find({ providerName: PROVIDER.TWITTER, enable: true, pageId: { $exists: true }, lastUpdated: { $lte: lastUpdated } });
        const newPostResult = [];
        for (let i = 0 ; i < socialPostLogList.length ; i++) {
            // search page
            const getUserTimeline = await this.twitterService.getTimeLineUser(socialPostLogList[i].providerUserId, oAuth2Twitter);
            const page = await this.pageService.find({ _id: socialPostLogList[i].pageId });
            // checked enable post social log enable === true
            if (page[i] === undefined) {
                continue;
            }
            if (getUserTimeline.data[i] !== undefined) {
                for (let j = 0 ; j<getUserTimeline.data.length; j++) {
                    const checkPostSocial = await this.socialPostService.find({ pageId: socialPostLogList[i].pageId, socialType: PROVIDER.TWITTER, socialId: getUserTimeline.data[j].id });
                    const checkFeed = checkPostSocial.shift();
                    if (checkFeed === undefined) {
                        const twPostId = getUserTimeline.data[j].id;
                        const text = getUserTimeline.data[j].text;
                        const today = moment().toDate();
                        const postPage: Posts = new Posts();
                        postPage.title = 'โพสต์จากทวิตเตอร์';
                        postPage.detail = text;
                        postPage.isDraft = false;
                        postPage.hidden = false;
                        postPage.type = POST_TYPE.GENERAL;
                        postPage.userTags = [];
                        postPage.coverImage = '';
                        postPage.pinned = false;
                        postPage.deleted = false;
                        postPage.ownerUser = page[i].ownerUser;
                        postPage.commentCount = 0;
                        postPage.repostCount = 0;
                        postPage.shareCount = 0;
                        postPage.likeCount = 0;
                        postPage.viewCount = 0;
                        postPage.createdDate = today;
                        postPage.startDateTime = today;
                        postPage.story = null;
                        postPage.pageId = socialPostLogList[i].pageId;
                        postPage.referencePost = null;
                        postPage.rootReferencePost = null;
                        postPage.visibility = null;
                        postPage.ranges = null;
                        const createPostPageData: Posts = await this.postsService.create(postPage);
                        const newSocialPost = new SocialPost();
                        newSocialPost.pageId = socialPostLogList[j].pageId;
                        newSocialPost.postId = createPostPageData.id;
                        newSocialPost.postBy = socialPostLogList[j].pageId;
                        newSocialPost.postByType = 'PAGE';
                        newSocialPost.socialId = twPostId;
                        newSocialPost.socialType = PROVIDER.TWITTER;
                        await this.socialPostService.create(newSocialPost);
                    }
                    else {
                        continue;
                    }
                }
            } else {
                continue;
            }
        }
        return response.status(200).send(newPostResult);
    }
}
