/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, EventEmitter, ViewChild, HostListener } from '@angular/core';
import { AuthenManager, SeoService, StatisticsFacade } from '../../../services/services';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexGrid, ApexLegend, ApexNoData, ApexNonAxisChartSeries, ApexPlotOptions, ApexResponsive, ApexStroke, ApexTitleSubtitle, ApexTooltip, ApexXAxis, ApexYAxis, ChartComponent } from 'ng-apexcharts';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { environment } from "../../../../environments/environment";
import { AbstractPage } from '../AbstractPage';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import moment from 'moment';

const PAGE_NAME: string = 'dashboard';
const PAGE_TITLE: string = 'ก้าวไกลสถิติ';

export type ChartPie = {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    responsive: ApexResponsive[];
    labels: any;
    legend: ApexLegend;
    title: ApexTitleSubtitle;
    noData: ApexNoData;
};

export type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    dataLabels: ApexDataLabels;
    grid: ApexGrid;
    stroke: ApexStroke;
    title: ApexTitleSubtitle;
    noData: ApexNoData;
};

export type ChartBar = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    stroke: ApexStroke;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    yaxis: ApexYAxis;
    tooltip: ApexTooltip;
    colors: string[];
    title: ApexTitleSubtitle;
    subtitle: ApexTitleSubtitle;
};

@Component({
    selector: 'dashboard-page',
    templateUrl: './TodayDashboardPage.component.html',
})
export class TodayDashboardPage extends AbstractPage implements OnInit {
    private destroy = new Subject<void>()
    public static readonly PAGE_NAME: string = PAGE_NAME;

    public apiBaseURL = environment.apiBaseURL;
    public activeMenu: string = '';
    public activeUrl: any;
    public data: any;
    public dataMFP: any = undefined;
    public totalMFP: number = 0;
    public totalUser: number = 0;
    public totalLogin: any;
    public isLoading: boolean = false;
    public isLoadingDate: boolean = false;
    public windowWidth: any;
    public isRes: boolean = false;
    public dataLoading: number[] = Array.from({ length: 50 }, (_, index) => index)
    public menuList: any[] = [
        {
            name: 'ภาพรวม',
            status: '',
            icon: '../../../../assets/img/icons/votepage/block.svg',
            icon2: '../../../../assets/img/icons/votepage/block-active.svg',
            isLogin: false,
        },
        {
            name: 'สมาชิกพรรค',
            status: 'mfp',
            icon: '../../../../assets/img/icons/votepage/user.svg',
            icon2: '../../../../assets/img/icons/votepage/user-active.svg',
            isLogin: true,
        },
        {
            name: 'เพจโดดเด่น',
            status: 'leaderboard',
            icon: '../../../../assets/img/icons/votepage/openvote.svg',
            icon2: '../../../../assets/img/icons/votepage/openvote-active.svg',
            isLogin: false,
        },
        // {
        //     name: 'ล่ารายชื่อ',
        //     status: 'support',
        //     icon: '../../../../assets/img/icons/votepage/like.svg',
        //     icon2: '../../../../assets/img/icons/votepage/like-active.svg',
        //     isLogin: false,
        // },
        // {
        //     name: 'ดูผลโหวต',
        //     status: 'result',
        //     icon: '../../../../assets/img/icons/votepage/statistic.svg',
        //     icon2: '../../../../assets/img/icons/votepage/statistic-active.svg',
        //     isLogin: false,
        // },
    ];

    public listPage: any[] = [];

    @ViewChild("chart", { static: false }) chart: ChartComponent;
    public chartBar: Partial<ChartBar> = {
        series: [],
        chart: {
            type: "bar",
            height: 380,
            toolbar: {
                show: false
            }
        },
        plotOptions: {
            bar: {
                barHeight: "100%",
                distributed: true,
                horizontal: true,
                dataLabels: {
                    position: "bottom"
                }
            }
        },
        colors: [
            "#2851a3",
            "#546E7A",
            "#ee7623",
        ],
        dataLabels: {
            enabled: true,
            textAnchor: "start",
            style: {
                colors: ["#fff"]
            },
            formatter: function (val, opt) {
                return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val + "%";
            },
            offsetX: 0,
            dropShadow: {
                enabled: true
            }
        },
        stroke: {
            width: 1,
        },
        xaxis: {
            categories: [
                "Facebook",
                "Apple",
                "Email",
            ]
        },
        yaxis: {
            labels: {
                show: false
            }
        },
        title: {
            text: "ผู้ใช้งานที่ Login ด้วยแพลตฟอร์มต่างๆ",
            align: "center",
        },
        tooltip: {
            theme: "dark",
            x: {
                show: false
            },
            y: {
                formatter: function (val) {
                    return val + "%";
                }
            }
        }
    };

    public chartPie: Partial<ChartPie> = {
        series: [],
        chart: {
            type: "donut",
            width: "100%",
            height: 350,
        },
        labels: [],
        legend: {
            show: true,
            // offsetX: 30,
            // offsetY: 40,
            formatter: function (val, opts) {
                return val + " - " + opts.w.globals.series[opts.seriesIndex];
            }
        },
        noData: {
            text: undefined,
            align: 'center',
            verticalAlign: 'middle',
            offsetX: 0,
            offsetY: 0,
            style: {
                color: undefined,
                fontSize: '14px',
                fontFamily: undefined
            }
        },
        title: {
            text: undefined,
            align: 'left',
            margin: 10,
            offsetX: 0,
            offsetY: 0,
            style: {
                fontSize: '14px',
                color: '#263238'
            },
        },
        responsive: [
            {
                breakpoint: 1280,
                options: {
                    // chart: {
                    //     width: 400
                    // },
                    legend: {
                        position: "bottom"
                    }
                }
            }
        ]

    };

    public chartOptions: Partial<ChartOptions> = {
        series: [],
        chart: {
            height: 350,
            width: "100%",
            type: "line",
            dropShadow: {
                enabled: true,
                top: 18,
                left: 7,
                blur: 10,
                opacity: 0.2
            },
            zoom: {
                enabled: false
            },
            toolbar: {
                show: false
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: "smooth"
        },
        title: {},
        noData: {
            text: undefined,
            align: 'center',
            verticalAlign: 'middle',
            offsetX: 0,
            offsetY: 0,
            style: {
                color: undefined,
                fontSize: '14px',
                fontFamily: undefined
            }
        },
        grid: {
            row: {
                colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
                opacity: 0.5
            }
        },
        xaxis: {
            categories: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec"
            ]
        }
    };
    constructor(router: Router, dialog: MatDialog, authenManager: AuthenManager,
        private activeRoute: ActivatedRoute,
        private seoService: SeoService,
        private statisticsFacade: StatisticsFacade) {
        super(PAGE_NAME, authenManager, dialog, router);

        this.router.events
            .pipe(filter((event: any) => event instanceof NavigationEnd), takeUntil(this.destroy))
            .subscribe((event: NavigationEnd) => {
                this.activeRoute.children.forEach(async child => {
                    child.params.subscribe(params => {
                        this.activeUrl = params;
                        if (this._checkRouting(this.activeUrl)) {
                            this.activeMenu = this.activeUrl['name'];
                        } else {
                            this.router.navigate(['', 'dashboard']);
                            this.activeMenu = '';
                        }
                        this._loadData(new Date());
                    })

                    this.seoService.updateTitle(PAGE_TITLE);
                });
            });
    }

    public ngOnInit(): void {
    }

    public ngOnDestroy(): void {
        this.destroy.next();
        this.destroy.complete();
    }

    private _loadData(event: any) {
        this.isLoading = true;
        const currentDate = moment();
        const previousYearDate = moment(currentDate).subtract(1, 'year');
        const formattedCurrentDate = currentDate.format("YYYY-MM-DDTHH:mm:ss.SSSZ");
        const formattedPreviousYearDate = previousYearDate.format("YYYY-MM-DDTHH:mm:ss.SSSZ");
        if ((this.activeMenu === 'mfp' || this.activeMenu === 'leaderboard') && (this.dataMFP === undefined || this.listPage.length === 0)) {
            this._getStatisticUserMFP(formattedPreviousYearDate, formattedCurrentDate);
        } else {
            if (!!this.data || !!this.dataMFP) this._setChart(this.activeMenu !== '' ? true : false);
        }
        if (this.activeMenu === '' && this.data === undefined) this._getStatisticDashboard(formattedPreviousYearDate, formattedCurrentDate);
    }

    public chooseDate(event: any) {
        this.isLoadingDate = true;
        const startOfYear = moment(event._d ? event._d : event);
        const endOfYear = moment(event._d ? event._d : event);
        const dateStart = startOfYear.set({ month: 0, date: 1 }).format("YYYY-01-01T00:00:00.000Z");
        const dateEnd = endOfYear.set({ month: 11, date: 31 }).format("YYYY-12-31T00:00:00.000Z");
        if (this.activeMenu === '') this._getStatisticDashboard(dateStart, dateEnd);
    }

    private _setChart(isMFP?: boolean) {
        if (isMFP) {
            if (!!this.dataMFP) {
                if (this.dataMFP.mfpUsers.data.length <= 6) {
                    const sortedData = this.dataMFP.mfpUsers.data.sort((a, b) => b.count - a.count);
                    this.chartPie.series = sortedData.map((item) => item.count);
                    this.chartPie.labels = sortedData.map((item) => item._id);
                } else {
                    const sortedData = this.dataMFP.mfpUsers.data.sort((a, b) => b.count - a.count);
                    const result = sortedData.slice(0, 6);
                    const sumCount = sortedData.slice(6).reduce((sum, item) => sum + item.count, 0);
                    result.push({ "count": sortedData[6].count, "_id": "อื่นๆ" });
                    this.chartPie.series = result.map((item) => item.count);
                    this.chartPie.labels = result.map((item) => item._id);
                }
                this.isLoading = false;
            }
        } else {
            if (!!this.data) {
                if (this.data.province.length <= 6) {
                    const sortedData = this.data.province.sort((a, b) => b.count - a.count);
                    this.chartPie.series = sortedData.map((item) => item.count);
                    this.chartPie.labels = sortedData.map((item) => item._id);
                } else {
                    const sortedData = this.data.province.sort((a, b) => b.count - a.count);
                    const result = sortedData.slice(0, 6);
                    const sumCount = sortedData.slice(6).reduce((sum, item) => sum + item.count, 0);
                    result.push({ "count": sortedData[6].count, "_id": "อื่นๆ" });
                    this.chartPie.series = result.map((item) => item.count);
                    this.chartPie.labels = result.map((item) => item._id);
                }
                this.isLoading = false;
            }
        }
    }

    private async _getStatisticUserMFP(start, end) {
        let data = {
            createDate: start,
            endDate: end
        }
        this.statisticsFacade.getStatisticUserMFP(data).then((res: any) => {
            if (res) {
                console.log("res", res)
                this.dataMFP = res;
                this.listPage = res.followerPage.data;
                this.totalMFP = !!res.Total_MFP && res.Total_MFP !== 0 ? res.Total_MFP.data : this.totalMFP;
                this.totalUser = !!res.Total_USERS && res.Total_USERS !== 0 ? res.Total_USERS.data : this.totalUser;
                this.totalLogin = !!res.Total_Login && res.Total_Login.data !== 0 ? res.Total_Login.data : this.totalLogin;
                console.log("totalLogi", this.totalLogin)
                if (res.mfpUsers.data.length <= 6) {
                    const sortedData = res.mfpUsers.data.sort((a, b) => b.count - a.count);
                    this.chartPie.series = sortedData.map((item) => item.count);
                    this.chartPie.labels = sortedData.map((item) => item._id);
                } else {
                    const sortedData = res.mfpUsers.data.sort((a, b) => b.count - a.count);
                    const result = sortedData.slice(0, 6);
                    result.push({ "count": sortedData[6].count, "_id": "อื่นๆ" });
                    this.chartPie.series = result.map((item) => item.count);
                    this.chartPie.labels = result.map((item) => item._id);
                }
                if (!!this.totalLogin) {
                    let max = this.totalLogin[0].count + this.totalLogin[1].count + this.totalLogin[2].count;
                    let facebook = ((this.totalLogin[0].count * 100) / max).toFixed(2);
                    let apple = ((this.totalLogin[1].count * 100) / max).toFixed(2);
                    let email = ((this.totalLogin[2].count * 100) / max).toFixed(2);
                    console.log("facebook", facebook)
                    console.log("apple", apple)
                    console.log("email", email)
                    this.chartBar.series = [
                        {
                            name: "ผู้ใช้งาน",
                            data: [Number(facebook), Number(apple), Number(email)]
                        }
                    ];
                }
                this.isLoading = false;
            }
        }).catch((err) => {
            if (err) {
                this.isLoading = false;
            }
        });
    }

    private _getStatisticDashboard(start, end) {
        let data = {
            createDate: start,
            endDate: end
        }
        this.statisticsFacade.getStatistic(data).then((res: any) => {
            if (res) {
                this.data = res;
                this.totalMFP = !!res.Total_MFP && res.Total_MFP !== 0 ? res.Total_MFP : this.totalMFP;
                this.totalUser = !!res.Total_users && res.Total_users !== 0 ? res.Total_users : this.totalUser;
                if (!!res || res.length > 0) {
                    if (res.province.length <= 6) {
                        const sortedData = res.province.sort((a, b) => b.count - a.count);
                        this.chartPie.series = sortedData.map((item) => item.count);
                        this.chartPie.labels = sortedData.map((item) => item._id);
                    } else if (res.province.length === 0) {
                        this.chartPie.series = [1];
                        this.chartPie.labels = ['ไม่มีข้อมูล'];
                    } else {
                        const sortedData = res.province.sort((a, b) => b.count - a.count);
                        const result = sortedData.slice(0, 6);
                        const sumCount = sortedData.slice(6).reduce((sum, item) => sum + item.count, 0);
                        result.push({ "count": sortedData[6].count, "_id": "อื่นๆ" });
                        this.chartPie.series = result.map((item) => item.count);
                        this.chartPie.labels = result.map((item) => item._id);
                    }
                    this.chartOptions.series = [
                        {
                            name: "จำนวน",
                            data: [res.January, res.February, res.March, res.April, res.May, res.June, res.July, res.August, res.September, res.October, res.November, res.December]
                        }
                    ];
                }
                this.isLoading = false;
                this.isLoadingDate = false;
            }
        }).catch((err) => {
            if (err) {
                this.isLoading = false;
                this.isLoadingDate = false;
            }
        });
    }

    @HostListener('window:resize', ['$event'])
    public getScreenSize(event?) {
        this.windowWidth = window.innerWidth;

        if (this.windowWidth <= 768) {
            this.isRes = true;
        } else {
            this.isRes = false;
        }
    }

    public getGridRow(index: number): number {
        index = index - 24;
        return index;
    }

    private _checkRouting(id: any): boolean {
        const menu = this.menuList.filter((item) => item.status === id.name);
        return menu.length != 0 ? true : false;
    }

    isPageDirty(): boolean {
        return false;
    }

    onDirtyDialogConfirmBtnClick(): EventEmitter<any> {
        return;
    }

    onDirtyDialogCancelButtonClick(): EventEmitter<any> {
        return;
    }
}




