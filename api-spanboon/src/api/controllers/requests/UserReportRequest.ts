import { IsEnum, IsNotEmpty } from 'class-validator';
import { REPORT_TYPE } from '../../../constants/ReportType';

export class UserReportRequest {

    @IsNotEmpty()
    public typeId: string;
    @IsNotEmpty()
    @IsEnum(REPORT_TYPE)
    public type: string;
    @IsNotEmpty()
    public topic: string;
    public message: string;
}