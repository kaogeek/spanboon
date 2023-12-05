/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AuthenManager } from '../../services/AuthenManager.service';
import { Router } from '@angular/router';
import { DialogWarningComponent } from '../shares/DialogWarningComponent.component';

const PAGE_NAME: string = "";

export interface Routes {
  icon: string;
  title: string;
  path: string;
  subRoutes: RouteInfo[];
}
export interface RouteInfo {
  path: string;
  title: string;
}
export const ROUTES: Routes[] = [

  {
    icon: "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24'><g id='Group_6' data-name='Group 6' transform='translate(168.556 -641.444)'><path id='Path_12' data-name='Path 12' d='M-168.056,656.944h6.131a1.032,1.032,0,0,1,.977.8,3,3,0,0,0,2.892,2.2h3a3,3,0,0,0,2.893-2.2,1.032,1.032,0,0,1,.977-.8h6.13' fill='none' stroke='#fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1'/> <path id='Path_13' data-name='Path 13' d='M-164.056,653.944v-12h11.969l3.031,3.063v8.937' fill='none' stroke='#fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1'/><line id='Line_5' data-name='Line 5' x2='6' transform='translate(-159.556 647.444)' fill='none' stroke='#fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1'/><line id='Line_6' data-name='Line 6' x2='6' transform='translate(-159.556 651.444)' fill='none' stroke='#fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1'/><path id='Path_14' data-name='Path 14' d='M-146.056,647.944l1,9v6a2,2,0,0,1-2,2h-19a2,2,0,0,1-2-2v-6l1-9' fill='none' stroke='#fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1'/></g></svg>",
    title: "จัดการสิ่งของบริจาค",
    subRoutes: [
      { path: '/main/item', title: 'สิ่งของบริจาค' },
      { path: '/main/itemcustomer', title: 'สิ่งของจากผู้ใช้' },
      { path: '/main/itemcategory', title: 'ประเภทสิ่งของบริจาค' },
    ],
    path: ""
  },
  {
    icon: '<svg height="21" style="margin-right: 10px;" viewBox="0 0 23 21" width="23" xmlns="http://www.w3.org/2000/svg"><g data-name="Group 1312" id="Group_1312" transform="translate(-672.701 -415.463)"> <path class="svg-icon-color-activate" style="fill: white;"d="M-6438.83,1006.048h-12.47V999.7a6.241,6.241,0,0,1,6.235-6.233,6.241,6.241,0,0,1,6.235,6.233v6.351Zm-5.186-11.363a5.776,5.776,0,0,0-3.925,1.269,5.394,5.394,0,0,0-1.9,4.091.55.55,0,0,0,.583.563.55.55,0,0,0,.583-.563,4.24,4.24,0,0,1,1.561-3.267,4.628,4.628,0,0,1,3.1-.928.55.55,0,0,0,.563-.583A.55.55,0,0,0-6444.015,994.686Z"data-name="Subtraction 2" fill="#747474" id="Subtraction_2" stroke="rgba(0,0,0,0)" stroke-miterlimit="10"stroke-width="1" transform="translate(7129.611 -573.082)"></path><path class="svg-icon-color-activate" d="M2,0H17a2,2,0,0,1,2,2V2a0,0,0,0,1,0,0H0A0,0,0,0,1,0,2V2A2,2,0,0,1,2,0Z" style="fill: white;"data-name="Rectangle 572" fill="#747474" id="Rectangle_572" transform="translate(674.701 434.463)"></path><rect class="svg-icon-color-activate" data-name="Rectangle 573" fill="#747474" height="3" id="Rectangle_573" style="fill: white;"rx="1" transform="translate(683.701 415.463)" width="2"></rect><rect class="svg-icon-color-activate" data-name="Rectangle 574" fill="#747474" height="3.962" id="Rectangle_574" style="fill: white;"rx="0.699" transform="translate(678.115 416.918) rotate(-30)" width="1.398"></rect><rect class="svg-icon-color-activate" data-name="Rectangle 575" fill="#747474" height="3.962" id="Rectangle_575" style="fill: white;"rx="0.699" transform="matrix(0.523, -0.852, 0.852, 0.523, 674.045, 421.339)" width="1.398"></rect> <rect class="svg-icon-color-activate" data-name="Rectangle 576" fill="#747474" height="3.962" id="Rectangle_576" style="fill: white;"rx="0.699" transform="matrix(0.506, 0.862, -0.862, 0.506, 694.212, 420.343)" width="1.398"></rect><rect class="svg-icon-color-activate" data-name="Rectangle 577" fill="#747474" height="3.962" id="Rectangle_577" style="fill: white;"rx="0.699" transform="translate(689.761 416.304) rotate(31.145)" width="1.398"></rect><rect class="svg-icon-color-activate" data-name="Rectangle 578" fill="#747474" height="3" id="Rectangle_578" style="fill: white;"rx="0.5" transform="translate(672.701 427.463) rotate(-90)" width="1"></rect><rect class="svg-icon-color-activate" data-name="Rectangle 579" fill="#747474" height="3" id="Rectangle_579" style="fill: white;"rx="0.5" transform="translate(692.701 427.463) rotate(-90)" width="1"></rect></g></svg>',
    title: "เหตุการณ์ด่วน",
    subRoutes: [
    ],
    path: "/main/emergency"
  },
  {
    icon: '<img src="../../../assets/img/mfp.svg" width="25" height="20">',
    title: "ก้าวไกลหน้าหนึ่ง",
    subRoutes: [
    ],
    path: "/main/today"
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" width="21" height="21" x="0" y="0" viewBox="0 0 455.005 455.005" xml:space="preserve" class=""><g><path d="M446.158 267.615c-5.622-3.103-12.756-2.421-19.574 1.871l-125.947 79.309a7.5 7.5 0 0 0 7.993 12.693l125.947-79.309c2.66-1.675 4.116-1.552 4.331-1.432.218.12 1.096 1.285 1.096 4.428 0 8.449-6.271 19.809-13.42 24.311l-122.099 76.885c-6.492 4.088-12.427 5.212-16.284 3.084-3.856-2.129-6.067-7.75-6.067-15.423 0-19.438 13.896-44.61 30.345-54.967l139.023-87.542a7.5 7.5 0 0 0 0-12.694L184.368 50.615a7.5 7.5 0 0 0-7.993 0L35.66 139.223C15.664 151.815 0 180.188 0 203.818v4c0 23.63 15.664 52.004 35.66 64.595l209.292 131.791a7.501 7.501 0 0 0 7.993-12.693L43.653 259.72C28.121 249.941 15 226.172 15 207.818v-4c0-18.354 13.121-42.122 28.653-51.902l136.718-86.091 253.059 159.35-128.944 81.196c-20.945 13.189-37.352 42.909-37.352 67.661 0 13.495 4.907 23.636 13.818 28.555 3.579 1.976 7.526 2.956 11.709 2.956 6.231 0 12.985-2.176 19.817-6.479l122.099-76.885c11.455-7.213 20.427-23.467 20.427-37.004 0-8.056-3.224-14.456-8.846-17.56z" fill="#ffffff" data-original="#ffffff" class=""></path><path d="M353.664 232.676a7.5 7.5 0 0 0 4.004-13.847l-173.3-109.126a7.5 7.5 0 0 0-7.993 12.693l173.3 109.126a7.467 7.467 0 0 0 3.989 1.154zM323.68 252.58a7.493 7.493 0 0 0 6.361-3.517 7.498 7.498 0 0 0-2.37-10.338L254.46 192.82a7.498 7.498 0 0 0-10.338 2.37 7.498 7.498 0 0 0 2.37 10.338l73.211 45.905a7.457 7.457 0 0 0 3.977 1.147zM223.903 212.559a7.5 7.5 0 0 0-10.334 2.39 7.5 7.5 0 0 0 2.39 10.334l73.773 46.062a7.495 7.495 0 0 0 10.334-2.39 7.5 7.5 0 0 0-2.39-10.334l-73.773-46.062zM145.209 129.33l-62.33 39.254a7.501 7.501 0 0 0 .037 12.716l74.335 46.219a7.493 7.493 0 0 0 8.031-.07l16.556-10.7a7.5 7.5 0 0 0-8.142-12.598l-12.562 8.119-60.119-37.38 48.2-30.355 59.244 37.147-6.907 4.464a7.5 7.5 0 0 0 8.142 12.598l16.8-10.859a7.501 7.501 0 0 0-.087-12.653l-73.218-45.909a7.498 7.498 0 0 0-7.98.007zM270.089 288.846a7.5 7.5 0 0 0-2.409-10.329l-74.337-46.221a7.498 7.498 0 0 0-10.329 2.409 7.5 7.5 0 0 0 2.409 10.329l74.337 46.221a7.494 7.494 0 0 0 10.329-2.409zM53.527 192.864a7.5 7.5 0 0 0 2.409 10.329l183.478 114.081a7.494 7.494 0 0 0 10.329-2.409 7.5 7.5 0 0 0-2.409-10.329L63.856 190.455a7.497 7.497 0 0 0-10.329 2.409z" fill="#ffffff" data-original="#ffffff" class=""></path></g></svg>',
    title: "หนังสือพิมพ์",
    subRoutes: [
    ],
    path: "/main/newspaper"
  },
  {
    icon: "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='12' viewBox='0 0 24 16'><g id='Group_7' data-name='Group 7' transform='translate(166 -331)'><rect id='Rectangle_2' data-name='Rectangle 2' width='23' height='15' rx='1' transform='translate(-165.5 331.5)' stroke-width='1' stroke='#fff' stroke-linecap='round' stroke-linejoin='round' fill='none'/><rect id='Rectangle_3' data-name='Rectangle 3' width='23' height='3' transform='translate(-165.5 334.5)' stroke-width='1' stroke='#fff' stroke-linecap='round' stroke-linejoin='round' fill='none'/><line id='Line_7' data-name='Line 7' x2='4' transform='translate(-163.5 342.5)' fill='none' stroke='#fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1'/><line id='Line_8' data-name='Line 8' x2='3' transform='translate(-156.5 342.5)' fill='none' stroke='#fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1'/></g></svg>",
    title: "ตรวจสอบเพจ",
    subRoutes: [
    ],
    path: "/main/page"
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="15" viewBox="0 0 24 19">  <g id="chat_bubble" data-name="chat bubble" transform="translate(169 -252)">    <path id="Path_9" data-name="Path 9" d="M-162.5,252.5h11a6,6,0,0,1,6,6v2a6,6,0,0,1-6,6h-11l-6,4v-12A6,6,0,0,1-162.5,252.5Z" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>    <line id="Line_1" data-name="Line 1" x2="12" transform="translate(-162.5 257.5)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>    <line id="Line_2" data-name="Line 2" x2="12" transform="translate(-162.5 261.5)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>  </g></svg>',
    title: "เพจกลุ่ม",
    subRoutes: [
    ],
    path: "/main/pagegroup"
  },
  {
    icon: "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24'><g id='Group_8' data-name='Group 8' transform='translate(165.444 -403.222)'>  <rect id='Rectangle_4' data-name='Rectangle 4' width='5' height='11' transform='translate(-155.944 415.722)' stroke-width='1' stroke='#fff' stroke-linecap='round' stroke-linejoin='round' fill='none'/>  <rect id='Rectangle_5' data-name='Rectangle 5' width='5' height='16.5' transform='translate(-164.944 410.222)' stroke-width='1' stroke='#fff' stroke-linecap='round' stroke-linejoin='round' fill='none'/>  <rect id='Rectangle_6' data-name='Rectangle 6' width='5' height='23' transform='translate(-146.944 403.722)' stroke-width='1' stroke='#fff' stroke-linecap='round' stroke-linejoin='round' fill='none'/></g></svg>",
    title: "แฮชแท็ก",
    subRoutes: [
    ],
    path: "/main/hashtag"
  },
  {
    icon: "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 23.677 23.586'><g id='Group_5' data-name='Group 5' transform='translate(167 -483.414)'><path id='Path_10' data-name='Path 10' d='M-146.5,496.5v8a2,2,0,0,1-2,2h-16a2,2,0,0,1-2-2v-16a2,2,0,0,1,2-2h8' fill='none' stroke='#fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1'/><g id='Group_4' data-name='Group 4'><path id='Path_11' data-name='Path 11' d='M-153.5,497.5h-4v-4l9.293-9.293a1,1,0,0,1,1.414,0l2.586,2.586a1,1,0,0,1,0,1.414Z' fill='none' stroke='#fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1'/><line id='Line_3' data-name='Line 3' x2='4' y2='4' transform='translate(-150.293 486.293)' fill='none' stroke='#fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1'/><line id='Line_4' data-name='Line 4' x1='1' y2='1' transform='translate(-158.5 497.5)' fill='none' stroke='#fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1'/></g></g></svg>",
    title: "ประเภทสิ่งที่กำลังทำ",
    subRoutes: [],
    path: "/main/obcategory"
  },
  {
    icon: "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24'><g id='Group_6' data-name='Group 6' transform='translate(168.556 -641.444)'><path id='Path_12' data-name='Path 12' d='M-168.056,656.944h6.131a1.032,1.032,0,0,1,.977.8,3,3,0,0,0,2.892,2.2h3a3,3,0,0,0,2.893-2.2,1.032,1.032,0,0,1,.977-.8h6.13' fill='none' stroke='#fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1'/> <path id='Path_13' data-name='Path 13' d='M-164.056,653.944v-12h11.969l3.031,3.063v8.937' fill='none' stroke='#fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1'/><line id='Line_5' data-name='Line 5' x2='6' transform='translate(-159.556 647.444)' fill='none' stroke='#fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1'/><line id='Line_6' data-name='Line 6' x2='6' transform='translate(-159.556 651.444)' fill='none' stroke='#fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1'/><path id='Path_14' data-name='Path 14' d='M-146.056,647.944l1,9v6a2,2,0,0,1-2,2h-19a2,2,0,0,1-2-2v-6l1-9' fill='none' stroke='#fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1'/></g></svg>",
    title: "ประเภทของเพจ",
    subRoutes: [],
    path: "/main/pagecategory"
  },

  {
    icon: '<svg id="Group_17" data-name="Group 17" xmlns="http://www.w3.org/2000/svg" width="20.733" height="22.092" viewBox="0 0 17.733 19.092"><g id="Group_3" data-name="Group 3">  <g id="Group_2" data-name="Group 2">    <g id="Group_1" data-name="Group 1">      <path id="Path_1" data-name="Path 1" d="M-19.01,22.069h-4.21a2.543,2.543,0,0,1-1.918-.873,2.556,2.556,0,0,1-.6-2.031,9.1,9.1,0,0,1,1.693-4.416,5.808,5.808,0,0,1,2.065-1.681,4.162,4.162,0,0,1-1.324-3.058,4.15,4.15,0,0,1,1.3-3.028,4.152,4.152,0,0,1,3.088-1.153,4.2,4.2,0,0,1,3.986,4.048,4.2,4.2,0,0,1-1.325,3.19,5.752,5.752,0,0,1,1.269.838.589.589,0,0,1,.058.831.59.59,0,0,1-.831.059,4.631,4.631,0,0,0-1.9-.992.589.589,0,0,1-.439-.51.592.592,0,0,1,.324-.589,3.016,3.016,0,0,0,1.668-2.79,3.016,3.016,0,0,0-2.862-2.907,2.99,2.99,0,0,0-2.219.828,2.981,2.981,0,0,0-.93,2.176,2.991,2.991,0,0,0,1.67,2.693.592.592,0,0,1,.324.589.59.59,0,0,1-.439.51c-2.195.567-3.578,2.478-4,5.525a1.381,1.381,0,0,0,.326,1.095,1.344,1.344,0,0,0,1.028.468h4.21a.589.589,0,0,1,.589.589A.589.589,0,0,1-19.01,22.069Z" transform="translate(25.766 -5.824)" fill="#fff"/>    </g>  </g></g><g id="Group_4" data-name="Group 4" transform="translate(7.989 8.94)">  <path id="Path_2" data-name="Path 2" d="M-12.184,24.836H-13.77a.59.59,0,0,1-.577-.468l-.181-.861a4.036,4.036,0,0,1-.915-.531l-.84.274a.589.589,0,0,1-.693-.265l-.794-1.374a.591.591,0,0,1,.117-.734l.656-.588a4.086,4.086,0,0,1-.035-.53A4.082,4.082,0,0,1-17,19.231l-.656-.588a.591.591,0,0,1-.117-.734l.794-1.374a.589.589,0,0,1,.693-.265l.84.274a4.04,4.04,0,0,1,.915-.532l.181-.86a.59.59,0,0,1,.577-.468h1.586a.589.589,0,0,1,.577.468l.182.86a4.034,4.034,0,0,1,.914.532l.84-.274a.59.59,0,0,1,.694.265l.793,1.374a.589.589,0,0,1-.117.734l-.656.588a3.913,3.913,0,0,1,.036.529,3.917,3.917,0,0,1-.036.53l.656.588a.589.589,0,0,1,.117.734l-.793,1.374a.59.59,0,0,1-.694.265l-.84-.274a4.03,4.03,0,0,1-.914.531l-.182.861A.589.589,0,0,1-12.184,24.836Zm-1.108-1.179h.63l.15-.712a.588.588,0,0,1,.4-.441,2.841,2.841,0,0,0,1.075-.626.591.591,0,0,1,.582-.125l.7.228.315-.546-.544-.487a.587.587,0,0,1-.182-.566,2.879,2.879,0,0,0,.07-.623,2.877,2.877,0,0,0-.07-.622.587.587,0,0,1,.182-.566l.544-.487-.315-.546-.7.228a.589.589,0,0,1-.582-.126,2.852,2.852,0,0,0-1.075-.625.588.588,0,0,1-.4-.441l-.15-.712h-.63l-.149.712a.589.589,0,0,1-.4.441,2.86,2.86,0,0,0-1.075.625.588.588,0,0,1-.581.126l-.7-.228-.315.546.544.487a.587.587,0,0,1,.182.566,2.942,2.942,0,0,0-.07.622,2.943,2.943,0,0,0,.07.623.587.587,0,0,1-.182.566l-.544.487.315.546.7-.228a.589.589,0,0,1,.581.125,2.849,2.849,0,0,0,1.075.626.589.589,0,0,1,.4.441Z" transform="translate(17.849 -14.684)" fill="#fff"/></g><g id="Group_5" data-name="Group 5" transform="translate(10.873 12.038)">  <path id="Path_3" data-name="Path 3" d="M-13.012,21.711a1.981,1.981,0,0,1-1.979-1.979,1.981,1.981,0,0,1,1.979-1.978.59.59,0,0,1,.589.59.59.59,0,0,1-.589.589.8.8,0,0,0-.8.8.8.8,0,0,0,.8.8.8.8,0,0,0,.8-.8.59.59,0,0,1,.59-.589.59.59,0,0,1,.589.589A1.981,1.981,0,0,1-13.012,21.711Z" transform="translate(14.991 -17.754)" fill="#fff"/></g></svg>',
    title: "ตั้งค่า",
    subRoutes: [],
    path: "/main/config"
  },
  {
    icon: '<svg id="Group_16" data-name="Group 16" xmlns="http://www.w3.org/2000/svg" width="16.274" height="19.245" viewBox="0 0 13.274 16.245">  <g id="Group_9" data-name="Group 9" transform="translate(0)">    <g id="Group_8" data-name="Group 8">      <g id="Group_7" data-name="Group 7">        <path id="Path_4" data-name="Path 4" d="M15.178,22.069H10.969a2.549,2.549,0,0,1-2.522-2.9,9.1,9.1,0,0,1,1.692-4.416A5.826,5.826,0,0,1,12.2,13.068a4.189,4.189,0,1,1,5.72,0,5.728,5.728,0,0,1,1.269.838.59.59,0,1,1-.774.89,4.628,4.628,0,0,0-1.9-.992.59.59,0,0,1-.115-1.1A3.007,3.007,0,1,0,12.99,7.835a3.008,3.008,0,0,0,.74,4.869.59.59,0,0,1-.115,1.1c-2.195.567-3.578,2.478-4,5.525a1.38,1.38,0,0,0,.325,1.095,1.348,1.348,0,0,0,1.029.468h4.209a.589.589,0,1,1,0,1.179Z" transform="translate(-8.423 -5.824)" fill="#fff"/>      </g>    </g>  </g>  <g id="Group_12" data-name="Group 12" transform="translate(2.313)">    <g id="Group_11" data-name="Group 11">      <g id="Group_10" data-name="Group 10">        <path id="Path_5" data-name="Path 5" d="M14.929,22.069h4.2a2.547,2.547,0,0,0,2.519-2.9,9.1,9.1,0,0,0-1.69-4.416A5.811,5.811,0,0,0,17.9,13.068a4.185,4.185,0,1,0-7.037-3.191,4.211,4.211,0,0,0,1.324,3.19,5.716,5.716,0,0,0-1.267.838.589.589,0,1,0,.773.89,4.62,4.62,0,0,1,1.9-.992.59.59,0,0,0,.115-1.1,3.008,3.008,0,0,1,1.193-5.7,3.008,3.008,0,0,1,1.477,5.7.59.59,0,0,0,.115,1.1c2.192.567,3.574,2.478,3.995,5.525a1.38,1.38,0,0,1-.324,1.095,1.346,1.346,0,0,1-1.028.468h-4.2a.589.589,0,1,0,0,1.179Z" transform="translate(-10.715 -5.824)" fill="#fff"/>      </g>    </g>  </g></svg>',
    title: "ผู้ใช้งาน",
    subRoutes: [],
    path: "/main/user"
  },
  {
    icon: '<svg id="Group_16" data-name="Group 16" xmlns="http://www.w3.org/2000/svg" width="16.274" height="19.245" viewBox="0 0 13.274 16.245">  <g id="Group_9" data-name="Group 9" transform="translate(0)">    <g id="Group_8" data-name="Group 8">      <g id="Group_7" data-name="Group 7">        <path id="Path_4" data-name="Path 4" d="M15.178,22.069H10.969a2.549,2.549,0,0,1-2.522-2.9,9.1,9.1,0,0,1,1.692-4.416A5.826,5.826,0,0,1,12.2,13.068a4.189,4.189,0,1,1,5.72,0,5.728,5.728,0,0,1,1.269.838.59.59,0,1,1-.774.89,4.628,4.628,0,0,0-1.9-.992.59.59,0,0,1-.115-1.1A3.007,3.007,0,1,0,12.99,7.835a3.008,3.008,0,0,0,.74,4.869.59.59,0,0,1-.115,1.1c-2.195.567-3.578,2.478-4,5.525a1.38,1.38,0,0,0,.325,1.095,1.348,1.348,0,0,0,1.029.468h4.209a.589.589,0,1,1,0,1.179Z" transform="translate(-8.423 -5.824)" fill="#fff"/>      </g>    </g>  </g>  <g id="Group_12" data-name="Group 12" transform="translate(2.313)">    <g id="Group_11" data-name="Group 11">      <g id="Group_10" data-name="Group 10">        <path id="Path_5" data-name="Path 5" d="M14.929,22.069h4.2a2.547,2.547,0,0,0,2.519-2.9,9.1,9.1,0,0,0-1.69-4.416A5.811,5.811,0,0,0,17.9,13.068a4.185,4.185,0,1,0-7.037-3.191,4.211,4.211,0,0,0,1.324,3.19,5.716,5.716,0,0,0-1.267.838.589.589,0,1,0,.773.89,4.62,4.62,0,0,1,1.9-.992.59.59,0,0,0,.115-1.1,3.008,3.008,0,0,1,1.193-5.7,3.008,3.008,0,0,1,1.477,5.7.59.59,0,0,0,.115,1.1c2.192.567,3.574,2.478,3.995,5.525a1.38,1.38,0,0,1-.324,1.095,1.346,1.346,0,0,1-1.028.468h-4.2a.589.589,0,1,0,0,1.179Z" transform="translate(-10.715 -5.824)" fill="#fff"/>      </g>    </g>  </g></svg>',
    title: "รายงาน",
    subRoutes: [
      { path: '/main/manipulatepage', title: 'รายงานเพจ' },
      { path: '/main/manipulatepost', title: 'รายงานโพสต์' },
    ],
    path: ""
  },
];

@Component({
  selector: 'admin-main-page',
  templateUrl: './MainPage.component.html'
})

export class MainPage implements OnInit {

  public static readonly PAGE_NAME: string = PAGE_NAME;
  menuItems: any[];

  private dialog: MatDialog;
  private authenManager: AuthenManager;
  private router: Router;
  private linkRootAdmin: any = [
    {
      icon: '<svg id="Group_16" data-name="Group 16" xmlns="http://www.w3.org/2000/svg" width="16.274" height="19.245" viewBox="0 0 13.274 16.245">  <g id="Group_9" data-name="Group 9" transform="translate(0)">    <g id="Group_8" data-name="Group 8">      <g id="Group_7" data-name="Group 7">        <path id="Path_4" data-name="Path 4" d="M15.178,22.069H10.969a2.549,2.549,0,0,1-2.522-2.9,9.1,9.1,0,0,1,1.692-4.416A5.826,5.826,0,0,1,12.2,13.068a4.189,4.189,0,1,1,5.72,0,5.728,5.728,0,0,1,1.269.838.59.59,0,1,1-.774.89,4.628,4.628,0,0,0-1.9-.992.59.59,0,0,1-.115-1.1A3.007,3.007,0,1,0,12.99,7.835a3.008,3.008,0,0,0,.74,4.869.59.59,0,0,1-.115,1.1c-2.195.567-3.578,2.478-4,5.525a1.38,1.38,0,0,0,.325,1.095,1.348,1.348,0,0,0,1.029.468h4.209a.589.589,0,1,1,0,1.179Z" transform="translate(-8.423 -5.824)" fill="#fff"/>      </g>    </g>  </g>  <g id="Group_12" data-name="Group 12" transform="translate(2.313)">    <g id="Group_11" data-name="Group 11">      <g id="Group_10" data-name="Group 10">        <path id="Path_5" data-name="Path 5" d="M14.929,22.069h4.2a2.547,2.547,0,0,0,2.519-2.9,9.1,9.1,0,0,0-1.69-4.416A5.811,5.811,0,0,0,17.9,13.068a4.185,4.185,0,1,0-7.037-3.191,4.211,4.211,0,0,0,1.324,3.19,5.716,5.716,0,0,0-1.267.838.589.589,0,1,0,.773.89,4.62,4.62,0,0,1,1.9-.992.59.59,0,0,0,.115-1.1,3.008,3.008,0,0,1,1.193-5.7,3.008,3.008,0,0,1,1.477,5.7.59.59,0,0,0,.115,1.1c2.192.567,3.574,2.478,3.995,5.525a1.38,1.38,0,0,1-.324,1.095,1.346,1.346,0,0,1-1.028.468h-4.2a.589.589,0,1,0,0,1.179Z" transform="translate(-10.715 -5.824)" fill="#fff"/>      </g>    </g>  </g></svg>',
      title: "ผู้ดูแล",
      subRoutes: [],
      path: "/main/useradmin"
    },
  ];
  private isRootAdmin: boolean;

  public isShowSidebar: boolean;

  constructor(authenManager: AuthenManager, router: Router, dialog: MatDialog) {
    this.dialog = dialog;
    this.router = router;
    this.authenManager = authenManager;
    this.isShowSidebar = true;
    this.isRootAdmin = this.authenManager.isCurrentUserType();
  }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
    if (this.isRootAdmin) {
      this.menuItems = this.menuItems.concat(this.linkRootAdmin);
    }
  }

  public clickSidebar(): void {
    this.isShowSidebar = !this.isShowSidebar;
  }

  public clickLogout(): void {
    let dialog = this.dialog.open(DialogWarningComponent, {
      data: {
        title: "คุณแน่ใจที่ออกจากระบบหรือไม่"
      }
    });
    dialog.afterClosed().subscribe((res) => {
      if (res) {
        this.authenManager.logout().then(() => {
          this.router.navigateByUrl("login");
        }).catch((err) => {
          this.dialogWarning(err.error.message);
        });
      }
    })
  }

  public dialogWarning(message: string): void {
    this.dialog.open(DialogWarningComponent, {
      data: {
        title: message,
        error: true
      }
    });
  }

  public isMobileMenu() {
    if (window.innerWidth > 991) {
      return false;
    }
    return true;
  };
}
