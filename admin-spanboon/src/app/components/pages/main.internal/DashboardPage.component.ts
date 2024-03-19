/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AbstractPage } from '../AbstractPage.component';
import { MatDialog } from '@angular/material/dialog';
import { DashboardFacade } from '../../../services/facade/DashboardFacade.service';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexGrid, ApexLegend, ApexNonAxisChartSeries, ApexPlotOptions, ApexResponsive, ApexStroke, ApexTitleSubtitle, ApexXAxis, ChartComponent } from 'ng-apexcharts';
import { MatDatepickerInputEvent } from '@angular/material';
import * as Highcharts from 'highcharts/highmaps';
import moment from 'moment';

const PAGE_NAME: string = "dashboard";

export type ChartPie = {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    responsive: ApexResponsive[];
    labels: any;
    legend: ApexLegend;
    title: ApexTitleSubtitle;
};

export type ChartBar = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    responsive: ApexResponsive[];
    xaxis: ApexXAxis;
    legend: ApexLegend;
    fill: ApexFill;
};

export type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    dataLabels: ApexDataLabels;
    grid: ApexGrid;
    stroke: ApexStroke;
    title: ApexTitleSubtitle;
};

@Component({
    selector: 'dashboard-page',
    templateUrl: './DashboardPage.component.html'
})
export class DashboardPage extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    public dateValue: any;
    public data: any;
    public dataMFP: any;
    public listPage: any;
    public isLoading: boolean = false;
    @ViewChild("chart") chart: ChartComponent;
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
            formatter: function (val, opts) {
                return val + " - " + opts.w.globals.series[opts.seriesIndex];
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
                    legend: {
                        position: "bottom"
                    }
                }
            }
        ]
    };

    public chartPieMFP: Partial<ChartPie> = {
        series: [],
        chart: {
            type: "donut",
            width: "100%",
            height: 350,
        },
        labels: [],
        legend: {
            show: true,
            formatter: function (val, opts) {
                return val + " - " + opts.w.globals.series[opts.seriesIndex];
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
                    legend: {
                        position: "bottom"
                    }
                }
            }
        ]
    };

    public chartBar: Partial<ChartBar> = {
        series: [
            {
                name: "PRODUCT A",
                data: [44, 55, 41, 67, 22, 43]
            },
            {
                name: "PRODUCT B",
                data: [13, 23, 20, 8, 13, 27]
            },
            {
                name: "PRODUCT C",
                data: [11, 17, 15, 15, 21, 14]
            },
            {
                name: "PRODUCT D",
                data: [21, 7, 25, 13, 22, 8]
            }
        ],
        chart: {
            type: "bar",
            height: 350,
            stacked: true,
            toolbar: {
                show: true
            },
            zoom: {
                enabled: true
            }
        },
        responsive: [
            {
                breakpoint: 480,
                options: {
                    legend: {
                        position: "bottom",
                        offsetX: -10,
                        offsetY: 0
                    }
                }
            }
        ],
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '40%'
            }
        },
        xaxis: {
            type: "categories",
            categories: [
                "01/2011",
                "02/2011",
                "03/2011",
                "04/2011",
                "05/2011",
                "06/2011"
            ]
        },
        legend: {
            position: "right",
            offsetY: 40
        },
        fill: {
            opacity: 1
        }
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
    public dashboardFacade: DashboardFacade
    public maxDate: Date = new Date();
    public totalUser: number = 0;
    public totalMFP: number = 0;

    constructor(dialog: MatDialog, dashboardFacade: DashboardFacade) {
        super(PAGE_NAME, dialog);
        this.dashboardFacade = dashboardFacade;
    }

    public ngOnInit() {
        this.createMapChart();
        this.chooseDate(new Date());
    }

    private _uppercaseDataCode(data: any[]): any[] {
        return data.map(([code, value]) => [code.toUpperCase(), value]);
    }

    async createMapChart() {
        // (async () => {

        //     const geojson = await fetch(
        //         'https://code.highcharts.com/mapdata/countries/th/th-all.geo.json'
        //     ).then(response => response.json());

        //     const data: any[] = [
        //         ['th.ct', 728], ['th.4255', 721], ['th.pg', 323], ['th.st', 134],
        //         ['th.kr', 14], ['th.sa', 15], ['th.tg', 16], ['th.tt', 527],
        //         ['th.pl', 18], ['th.ps', 19], ['th.kp', 346], ['th.pc', 123],
        //         ['th.sh', 22], ['th.at', 23], ['th.lb', 24], ['th.pa', 25],
        //         ['th.np', 26], ['th.sb', 27], ['th.cn', 28], ['th.bm', 29],
        //         ['th.pt', 30], ['th.no', 31], ['th.sp', 32], ['th.ss', 33],
        //         ['th.sm', 34], ['th.pe', 35], ['th.cc', 36], ['th.nn', 37],
        //         ['th.cb', 38], ['th.br', 39], ['th.kk', 40], ['th.ph', 41],
        //         ['th.kl', 42], ['th.sr', 43], ['th.nr', 44], ['th.si', 45],
        //         ['th.re', 46], ['th.le', 47], ['th.nk', 48], ['th.ac', 49],
        //         ['th.md', 50], ['th.sn', 51], ['th.nw', 52], ['th.pi', 53],
        //         ['th.rn', 54], ['th.nt', 55], ['th.sg', 56], ['th.pr', 57],
        //         ['th.py', 58], ['th.so', 59], ['th.ud', 60], ['th.kn', 61],
        //         ['th.tk', 62], ['th.ut', 63], ['th.ns', 64], ['th.pk', 65],
        //         ['th.ur', 66], ['th.sk', 67], ['th.ry', 68], ['th.cy', 69],
        //         ['th.su', 70], ['th.nf', 71], ['th.bk', 72], ['th.mh', 73],
        //         ['th.pu', 74], ['th.cp', 75], ['th.yl', 7600], ['th.cr', 77],
        //         ['th.cm', 78], ['th.ln', 79], ['th.na', 80], ['th.lg', 81],
        //         ['th.pb', 82], ['th.rt', 83], ['th.ys', 84], ['th.ms', 85],
        //         ['th.un', 86], ['th.nb', 87]
        //     ]

        //     const dataValue = this._uppercaseDataCode(data);

        //     // Initialize the chart
        //     Highcharts.mapChart('container', {
        //         chart: {
        //             map: geojson
        //         },

        //         title: {
        //             text: 'GeoJSON in Highmaps'
        //         },

        //         accessibility: {
        //             typeDescription: 'Map of Germany.'
        //         },

        //         exporting: {
        //             sourceWidth: 600,
        //             sourceHeight: 500
        //         },

        //         mapNavigation: {
        //             enabled: true,
        //             buttonOptions: {
        //                 verticalAlign: 'bottom'
        //             }
        //         },

        //         colorAxis: {
        //             min: 1,
        //             type: 'logarithmic',
        //             minColor: '#EEEEFF',
        //             maxColor: '#000022',
        //             stops: [
        //                 [0, '#EFEFFF'],
        //                 [0.67, '#4444FF'],
        //                 [1, '#000022']
        //             ]
        //         },

        //         legend: {
        //             layout: 'horizontal',
        //             borderWidth: 0,
        //             backgroundColor: 'rgba(255,255,255,0.85)',
        //             floating: true,
        //             verticalAlign: 'top',
        //             y: 25
        //         },

        //         series: [{
        //             type: 'map',
        //             data: dataValue,
        //             keys: ['hasc', 'value'],
        //             joinBy: 'hasc',
        //             name: 'Random data',
        //             dataLabels: {
        //                 enabled: true,
        //                 color: '#FFFFFF',
        //                 format: '{point.properties.name}'
        //             },
        //             animation: {
        //                 duration: 1000
        //             },
        //             tooltip: {
        //                 pointFormat: '{point.properties.name}: {point.value} คน'
        //             }
        //         }]
        //     });
        // })();
    }

    public chooseDate(event: any) {
        this.isLoading = true;
        const startOfYear = moment(event._d ? event._d : event);
        const endOfYear = moment(event._d ? event._d : event);
        const dateStart = startOfYear.set({ month: 0, date: 1 }).format("YYYY-01-01T00:00:00.000Z");
        const dateEnd = endOfYear.set({ month: 11, date: 31 }).format("YYYY-12-31T00:00:00.000Z");
        this._getStatisticDashboard(dateStart, dateEnd);
        this._getStatisticUserMFP(dateStart, dateEnd);
    }

    private _getStatisticDashboard(start, end) {
        let data = {
            createDate: start,
            endDate: end
        }
        this.dashboardFacade.getStatistic(data).then((res: any) => {
            if (res) {
                this.data = res;
                this.totalMFP = res.Total_MFP && res.Total_MFP !== 0 ? res.Total_MFP : this.totalMFP;
                this.totalUser = res.Total_users && res.Total_MFP !== 0 ? res.Total_users : this.totalUser;
                if (!!res || res.length > 0) {
                    if (res.province.length <= 6) {
                        const sortedData = res.province.sort((a, b) => b.count - a.count);
                        this.chartPie.series = sortedData.map((item) => item.count);
                        this.chartPie.labels = sortedData.map((item) => item._id);
                    } else {
                        const sortedData = res.province.sort((a, b) => b.count - a.count);
                        const result = sortedData.slice(0, 6);
                        const sumCount = sortedData.slice(6).reduce((sum, item) => sum + item.count, 0);
                        result.push({ "count": sortedData[6].count, "_id": "อื่นๆ" });
                        this.chartPie.series = result.map((item) => item.count);
                        this.chartPie.labels = result.map((item) => item._id);
                    }
                }
            }
        }).catch((err) => {
            if (err) { this.isLoading = false; }
        });
    }

    private async _getStatisticUserMFP(start, end) {
        let data = {
            createDate: start,
            endDate: end
        }
        this.dashboardFacade.getStatisticUserMFP(data).then((res: any) => {
            if (res) {
                this.dataMFP = res;
                this.listPage = res.followerPage.data;
                if (!!res || res.length > 0) {
                    if (res.mfpUsers.data.length === 0) {
                        this.chartPieMFP.series = [1];
                        this.chartPieMFP.labels = ['ไม่มีข้อมูล'];
                    } else {
                        const sortedData = res.mfpUsers.data.sort((a, b) => b.count - a.count);
                        const result = sortedData.slice(0, 6);
                        const sumCount = sortedData.slice(6).reduce((sum, item) => sum + item.count, 0);
                        result.push({ "count": sortedData[6].count, "_id": "อื่นๆ" });
                        this.chartPieMFP.series = result.map((item) => item.count);
                        this.chartPieMFP.labels = result.map((item) => item._id);
                    }

                    this.chartOptions.series = [
                        {
                            name: "จำนวน",
                            data: [this.data.January, this.data.February, this.data.March, this.data.April, this.data.May, this.data.June, this.data.July, this.data.August, this.data.September, this.data.October, this.data.November, this.data.December]
                        }
                    ];
                    this.chartOptions.title = {
                        text: "การสมัครสมาชิกบนแพลตฟอร์มของแต่ละเดือนในปี " + this.data.Year,
                        align: "left"
                    }
                }
                this.isLoading = false;
            }
        }).catch((err) => {
            if (err) {
                this.isLoading = false;
            }
        });
    }
}
