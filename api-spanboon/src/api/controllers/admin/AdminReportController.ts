import { JsonController, Res, Post, Req, Authorized, Param } from 'routing-controllers';
import { ResponseUtil } from '../../../utils/ResponseUtil';
import { UserReportContentService } from '../../services/UserReportContentService';
import { ObjectID } from 'mongodb';
import { PageService } from '../../services/PageService';
import { UserService } from '../../services/UserService';
import { PostsService } from '../../services/PostsService';
import { MAILService } from '../../../auth/mail.services';
@JsonController('/admin/report')
export class AdminReportController {
    constructor(
        private userReportContentService: UserReportContentService,
        private pageService: PageService,
        private userService: UserService,
        private postsService: PostsService
    ) { }

    @Post('/')
    @Authorized()
    public async searchReport(@Res() res: any, @Req() req: any): Promise<any> {
        const pageReport = await this.pageService.aggregate(
            [
                {
                    $lookup: {
                        from: 'UserReportContent',
                        let: { id: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$$id', '$typeId']
                                    }
                                }
                            }
                        ],
                        as: 'userReportContent'
                    }
                },
                {
                    $match: {
                        userReportContent: { $ne: [] }
                    }
                }
            ]
        );
        const userReport = await this.userService.aggregate(
            [
                {
                    $lookup: {
                        from: 'UserReportContent',
                        let: { id: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$$id', '$typeId']
                                    }
                                }
                            }
                        ],
                        as: 'userReportContent'
                    }
                },
                {
                    $match: {
                        userReportContent: { $ne: [] }
                    }
                }
            ]
        );
        const postReport = await this.postsService.aggregate(
            [
                {
                    $lookup: {
                        from: 'UserReportContent',
                        let: { id: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$$id', '$typeId']
                                    }
                                }
                            }
                        ],
                        as: 'userReportContent'
                    }
                },
                {
                    $match: {
                        userReportContent: { $ne: [] }
                    }
                }
            ]
        );
        const result: any = [];
        for (let i = 0; i < pageReport.length; i++) {
            const reports: any = {};
            reports.page = pageReport[i].name;
            reports.type = 'PAGE';
            reports.count = await this.countReport(pageReport[i], reports.type);
            result.push(reports);
        }
        for (let j = 0; j < userReport.length; j++) {
            const reports: any = {};
            reports.page = userReport[j].displayName;
            reports.type = 'USER';
            reports.count = await this.countReport(userReport[j], reports.type);
            result.push(reports);
        }
        for (let z = 0; z < postReport.length; z++) {
            const reports: any = {};
            reports.page = postReport[z].title;
            reports.type = 'POST';
            reports.count = await this.countReport(postReport[z], reports.type);
            result.push(reports);
        }
        let sortCount = undefined;
        if (result.length > 0) {
            sortCount = result.sort((a, b) => b.count - a.count);
        }
        if (sortCount.length > 0) {
            const successResponseGroup = ResponseUtil.getSuccessResponse('Search report is successful.', sortCount);
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
                    const reset = await this.userReportContentService.deleteMany({ _id: objIds, type: types });
                    const type_report = 'เพจของคุณ';
                    await this.sendAlertBanned(page.email, type_report, 'เพจของคุณถูกแบนจาก Today');
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
                    const reset = await this.userReportContentService.deleteMany({ _id: objIds, type: types });
                    const type_report = 'บัญชีของคุณ';
                    await this.sendAlertBanned(user.email, type_report, 'บัชญีของคุณถูกแบนจาก Today');
                    if (update && reset) {
                        const successResponse = ResponseUtil.getSuccessResponse('Your approve is sucessful.', update);
                        return res.status(200).send(successResponse);
                    }
                }
            } else if (types === 'POST') {
                const post = await this.postsService.findOne({ _id: objIds });
                const user = await this.userService.findOne({ _id: post.ownerUser });
                if (post) {
                    query = { _id: post.id };
                    newValues = { $set: { banned: ban } };
                    const update = await this.postsService.update(query, newValues);
                    const reset = await this.userReportContentService.deleteMany({ _id: objIds, type: types });
                    const type_report = 'โพสต์ของคุณ';
                    await this.sendAlertBanned(user.email, type_report, 'บัชญีของคุณถูกแบนจาก Today');
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

    private async countReport(countLength: any, type: string): Promise<any> {
        if (countLength.userReportContent.length === 1000) {
            const email = 'example@hotmail.com';
            const type_report = type;
            await this.sendReportToAdmin(email, type_report, 'Report ละเมิดการใช้งาน platform');
        }
        return countLength.userReportContent.length;
    }

    private async sendReportToAdmin(email: string, type: string, subject: string): Promise<any> {
        const message = '<p> มีการ Report ของ' + type + 'อาจจะมีการละเมิดกฏการใช้งานของ Platform </p>';

        const sendMail = MAILService.pushNotification(message, email, subject);

        if (sendMail) {
            return ResponseUtil.getSuccessResponse('Your report has been sent to your email inbox.', '');
        } else {
            return ResponseUtil.getErrorResponse('error in sending email', '');
        }
    }

    private async sendAlertBanned(email: string, type: string, subject: string): Promise<any> {
        const message = '<p>' + type + 'ถูกแบนจากระบบ </p>';
        const sendMail = MAILService.pushNotification(message, email, subject);

        if (sendMail) {
            return ResponseUtil.getSuccessResponse('Your report has been sent to your email inbox.', '');
        } else {
            return ResponseUtil.getErrorResponse('error in sending email', '');
        }
    }
}
