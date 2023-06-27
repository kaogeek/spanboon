import { JsonController, Res, Post, Req, Authorized, Param } from 'routing-controllers';
import { ResponseUtil } from '../../../utils/ResponseUtil';
import { UserBlockContentService } from '../../services/UserBlockContentService';
import { ObjectID } from 'mongodb';
import { PageService } from '../../services/PageService';
import { UserService } from '../../services/UserService';
import { PostsService } from '../../services/PostsService';
@JsonController('/admin/report')
export class AdminReportController {
    constructor(
        private userBlockContentService: UserBlockContentService,
        private pageService: PageService,
        private userService: UserService,
        private postsService: PostsService
    ) { }

    @Post('/')
    @Authorized()
    public async searchReport(@Res() res: any, @Req() req: any): Promise<any> {
        const searchReported = await this.userBlockContentService.aggregate(
            [
                {
                    $lookup: {
                        from: 'Posts',
                        let: { subjectId: '$subjectId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$$subjectId', '$_id']
                                    }
                                }
                            }
                        ],
                        as: 'posts'
                    }
                },
                {
                    $lookup: {
                        from: 'User',
                        let: { subjectId: '$subjectId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$$subjectId', '$_id']
                                    }
                                }
                            }
                        ],
                        as: 'user'
                    }
                },
                {
                    $lookup: {
                        from: 'Page',
                        let: { subjectId: '$subjectId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$$subjectId', '$_id']
                                    }
                                }
                            }
                        ],
                        as: 'page'
                    }
                }
            ]
        );
        const result: any = [];
        result.post = undefined;
        result.title = undefined;
        result.detail = undefined;
        result.type = undefined;
        result.count = searchReported.length;
        if (result) {
            const successResponseGroup = ResponseUtil.getSuccessResponse('Search report is successful.', result);
            return res.status(200).send(successResponseGroup);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('There are no reports yet.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Post('/:id/approve')
    @Authorized()
    public async approveBan(@Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const objIds = new ObjectID(id);
        const types: string = String(req.body.type);
        const ban: boolean = req.body.ban;
        let query = undefined;
        let newValues = undefined;
        if (types !== undefined && types !== null) {
            if (types === 'PAGE') {
                const page = await this.pageService.findOne({ _id: objIds });
                if (page) {
                    query = { _id: page.id };
                    newValues = { $set: { banned: ban } };
                    const update = await this.pageService.update(query, newValues);
                    if (update) {
                        const successResponse = ResponseUtil.getSuccessResponse('Your approve is sucessful.', update);
                        return res.status(200).send(successResponse);
                    }
                }
            } else if (types === 'USER') {
                const user = await this.userService.findOne({ _id: objIds });
                if (user) {
                    query = { _id: user.id };
                    newValues = { $set: { banned: ban } };
                    const update = await this.userService.update(query, newValues);
                    if (update) {
                        const successResponse = ResponseUtil.getSuccessResponse('Your approve is sucessful.', update);
                        return res.status(200).send(successResponse);
                    }
                }
            } else if (types === 'POST') {
                const post = await this.postsService.findOne({ _id: objIds });
                if (post) {
                    query = { _id: post.id };
                    newValues = { $set: { banned: ban } };
                    const update = await this.postsService.update(query, newValues);
                    if (update) {
                        const successResponse = ResponseUtil.getSuccessResponse('Your approve is sucessful.', update);
                        return res.status(200).send(successResponse);
                    }
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Cannot find your type.', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Type is null or undefined.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Post('/:id/unapprove')
    @Authorized()
    public async unApprove(@Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const objIds = new ObjectID(id);
        const types: string = String(req.body.type);
        const ban: boolean = req.body.ban;
        let query = undefined;
        let newValues = undefined;
        if (types !== undefined && types !== null) {
            if (types === 'PAGE') {
                const page = await this.pageService.findOne({ _id: objIds });
                if (page) {
                    query = { _id: page.id };
                    newValues = { $set: { banned: ban } };
                    const update = await this.pageService.update(query, newValues);
                    const reset = await this.userBlockContentService.deleteMany({ _id: objIds, subjectType: types });
                    if (update && reset) {
                        const successResponse = ResponseUtil.getSuccessResponse('Your approve is sucessful.', update);
                        return res.status(200).send(successResponse);
                    }
                }
            } else if (types === 'USER') {
                const user = await this.userService.findOne({ _id: objIds });
                if (user) {
                    query = { _id: user.id };
                    newValues = { $set: { banned: ban } };
                    const update = await this.userService.update(query, newValues);
                    const reset = await this.userBlockContentService.deleteMany({ _id: objIds, subjectType: types });
                    if (update && reset) {
                        const successResponse = ResponseUtil.getSuccessResponse('Your approve is sucessful.', update);
                        return res.status(200).send(successResponse);
                    }
                }
            } else if (types === 'POST') {
                const post = await this.postsService.findOne({ _id: objIds });
                if (post) {
                    query = { _id: post.id };
                    newValues = { $set: { banned: ban } };
                    const update = await this.postsService.update(query, newValues);
                    const reset = await this.userBlockContentService.deleteMany({ _id: objIds, subjectType: types });
                    if (update && reset) {
                        const successResponse = ResponseUtil.getSuccessResponse('Your approve is sucessful.', update);
                        return res.status(200).send(successResponse);
                    }
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Cannot find your type.', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Type is null or undefined.', undefined);
            return res.status(400).send(errorResponse);
        }
    }
}
