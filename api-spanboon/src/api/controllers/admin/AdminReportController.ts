import { JsonController, Res, Post, Req, Authorized } from 'routing-controllers';
import { ResponseUtil } from '../../../utils/ResponseUtil';
import { UserBlockContentService } from '../../services/UserBlockContentService';
@JsonController('/admin/report')
export class AdminReportController {
    constructor(
        private userBlockContentService: UserBlockContentService
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
}
