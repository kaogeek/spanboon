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

  // {
  //   icon: "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24'><g id='Group_6' data-name='Group 6' transform='translate(168.556 -641.444)'><path id='Path_12' data-name='Path 12' d='M-168.056,656.944h6.131a1.032,1.032,0,0,1,.977.8,3,3,0,0,0,2.892,2.2h3a3,3,0,0,0,2.893-2.2,1.032,1.032,0,0,1,.977-.8h6.13' fill='none' stroke='#fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1'/> <path id='Path_13' data-name='Path 13' d='M-164.056,653.944v-12h11.969l3.031,3.063v8.937' fill='none' stroke='#fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1'/><line id='Line_5' data-name='Line 5' x2='6' transform='translate(-159.556 647.444)' fill='none' stroke='#fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1'/><line id='Line_6' data-name='Line 6' x2='6' transform='translate(-159.556 651.444)' fill='none' stroke='#fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1'/><path id='Path_14' data-name='Path 14' d='M-146.056,647.944l1,9v6a2,2,0,0,1-2,2h-19a2,2,0,0,1-2-2v-6l1-9' fill='none' stroke='#fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1'/></g></svg>",
  //   title: "จัดการสิ่งของบริจาค",
  //   subRoutes: [
  //     { path: '/main/item', title: 'สิ่งของบริจาค' },
  //     { path: '/main/itemcustomer', title: 'สิ่งของจากผู้ใช้' },
  //     { path: '/main/itemcategory', title: 'ประเภทสิ่งของบริจาค' },
  //   ],
  //   path: ""
  // },
  {
    icon: '<img src="../../../assets/img/mfp.svg" width="25" height="20">',
    title: "แผงควบคุม",
    subRoutes: [
    ],
    path: "/main/dashboard"
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
    icon: '<svg width="45" height="45" viewBox="0 0 32 32" fill="#fff" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_1203_279)"><path d="M10.5677 10.9837H8.14994L5.35702 17.6897L4.5181 15.6849H2.10023L2.26134 16.0686L4.3385 20.9821H6.37724L10.4052 11.3718L10.5677 10.9837Z" fill="#fff"/><path d="M13.8639 13.487C13.2572 13.1472 12.5643 12.9748 11.8044 12.9748C11.2876 12.9748 10.8006 13.0563 10.3495 13.2178L8.09581 18.5949C8.15994 18.757 8.23454 18.9138 8.31962 19.0653C8.66311 19.6778 9.14711 20.1618 9.758 20.5041C10.3641 20.844 11.0527 21.0163 11.8044 21.0163C12.5562 21.0163 13.2577 20.844 13.864 20.5041C14.4747 20.1618 14.9587 19.6777 15.3024 19.0653C15.645 18.4547 15.8187 17.756 15.8187 16.9886C15.8187 16.2212 15.6448 15.5246 15.3019 14.918C14.9582 14.3108 14.4745 13.8293 13.8639 13.4869V13.487ZM13.1167 18.4548C12.7703 18.8234 12.3411 19.0025 11.8044 19.0025C11.2678 19.0025 10.8415 18.8237 10.4997 18.4558C10.1555 18.0856 9.98813 17.6056 9.98813 16.9887C9.98813 16.3717 10.1555 15.892 10.4998 15.5215C10.8417 15.1537 11.2685 14.9749 11.8044 14.9749C12.3404 14.9749 12.7702 15.1541 13.1167 15.5227C13.4647 15.893 13.6339 16.3726 13.6339 16.9887C13.6339 17.6048 13.4647 18.0845 13.1167 18.4548Z" fill="#fff"/><path d="M19.4358 18.8145C19.236 18.9779 18.9879 19.0574 18.6772 19.0574C18.4356 19.0574 18.2619 18.9942 18.1463 18.8641C18.027 18.7303 17.9665 18.5188 17.9665 18.2354V15.0297H19.8486V13.1118H17.9665V11.4405H15.7948V13.1119H14.6366V13.1798C15.1412 13.5489 15.5544 14.0148 15.8688 14.5704C16.2722 15.284 16.4767 16.0975 16.4767 16.9888C16.4767 17.88 16.2923 18.6133 15.9286 19.3039C16.0456 19.7055 16.239 20.0421 16.5077 20.3101C16.9775 20.7788 17.641 21.0164 18.4798 21.0164C18.8099 21.0164 19.1287 20.9714 19.4273 20.8826C19.737 20.7905 20.0057 20.6488 20.2258 20.4613L20.3743 20.3348L19.714 18.587L19.4358 18.8145Z" fill="#fff"/><path d="M26.3783 14.9178C26.0528 14.3043 25.5935 13.8214 25.0131 13.4825C24.4362 13.1456 23.7751 12.9748 23.0483 12.9748C22.3215 12.9748 21.6414 13.1477 21.0515 13.4888C20.8563 13.6016 20.6747 13.7298 20.5067 13.8728V15.7146H19.3291C19.2117 16.1142 19.1525 16.5402 19.1525 16.9887C19.1525 17.3673 19.1948 17.7292 19.2788 18.0719L20.0029 17.4797L21.1486 20.5122C21.7687 20.8467 22.4919 21.0163 23.2984 21.0163C23.9347 21.0163 24.5167 20.9083 25.0282 20.6953C25.5494 20.4784 25.9874 20.1524 26.33 19.7264L26.4742 19.5471L25.2581 18.0923L25.0586 18.3036C24.6059 18.7831 24.0431 19.0162 23.3379 19.0162C22.7931 19.0162 22.3344 18.8753 21.9746 18.5975C21.7047 18.389 21.5163 18.1297 21.4041 17.8106H26.818L26.838 17.5594C26.8563 17.3297 26.8652 17.1565 26.8652 17.0298C26.8652 16.2377 26.7014 15.5271 26.3784 14.9178H26.3783ZM21.376 16.1257C21.4723 15.7978 21.6399 15.5302 21.8834 15.3133C22.2013 15.0303 22.5823 14.8928 23.0482 14.8928C23.5141 14.8928 23.9039 15.0319 24.217 15.3178C24.4571 15.5373 24.6203 15.8034 24.7114 16.1257H21.376Z" fill="#fff"/></g><path d="M25.5494 11.4405L26.2662 12.7361H27.751L27.0086 14.0784L27.7254 15.3723L29.8998 11.4405H25.5494Z" fill="#fff"/><defs><clipPath id="clip0_1203_279"><rect width="24.7649" height="10.0326" fill="#fff" transform="translate(2.10023 10.9837)"/></clipPath></defs></svg>',
    title: "โหวต",
    subRoutes: [],
    path: "/main/vote"
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
    icon: '<svg width="32" height="32" viewBox="0 0 32 32" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 8.15653C3 7.56053 3.24344 7.01909 3.63515 6.62725C4.02698 6.23542 4.56854 5.99211 5.1643 5.99211H8.38377L8.20803 6.58859C7.86582 6.68134 7.5742 6.89056 7.37919 7.27108C7.30403 7.41743 7.25464 7.571 7.22911 7.72579H5.1643C5.04686 7.72579 4.93905 7.77457 4.86076 7.85286C4.78258 7.93116 4.73368 8.03884 4.73368 8.15653C4.73368 14.2154 4.73368 19.8815 4.73368 25.9406C4.73368 26.0581 4.78258 26.1659 4.86076 26.2441C4.93905 26.3225 5.04686 26.3712 5.1643 26.3712H19.5752C19.6927 26.3712 19.8004 26.3225 19.8786 26.2441C19.9569 26.1659 20.0057 26.0584 20.0057 25.9407V25.0509L20.8611 24.6397L21.197 24.2483L21.7395 23.6162V25.9407C21.7395 26.5366 21.496 27.078 21.1042 27.4698C20.7125 27.8616 20.1711 28.105 19.5752 28.105H5.1643C4.56854 28.105 4.02698 27.8616 3.63515 27.4698C3.24344 27.078 3 26.5366 3 25.9406C3 19.8815 3 14.2154 3 8.15653ZM25.4779 13.3767L27.318 14.9556C27.498 15.11 27.7635 15.0986 27.9081 14.9298L28.6317 14.0867C29.2842 13.3261 28.99 12.4124 28.3691 11.877C27.7458 11.3394 26.7927 11.1832 26.1376 11.9465L25.414 12.7894C25.2695 12.9581 25.298 13.2225 25.4779 13.3767ZM17.7601 21.7083L18.4804 21.5279C18.6028 21.4974 18.7247 21.5242 18.829 21.6049C18.9333 21.6855 18.9704 21.7995 18.9927 21.9244L19.0511 22.2506C19.0723 22.3682 19.1036 22.4753 19.1978 22.5563C19.292 22.6372 19.4027 22.6521 19.5223 22.655L19.8536 22.6632C19.9805 22.6662 20.0986 22.6857 20.1942 22.7765C20.2896 22.8672 20.3349 22.9838 20.3232 23.1093L20.2542 23.8487L17.4049 25.2189C17.2621 25.2878 17.0954 25.2628 16.9686 25.1539C16.8417 25.0451 16.7916 24.884 16.838 24.7324L17.7601 21.7083ZM24.9953 13.8976L25.9359 14.7046L26.8766 15.5119C27.0454 15.6564 27.0712 15.905 26.9343 16.0645L20.7836 23.2316C21.1285 22.3931 20.5529 22.2218 19.8595 22.1569C19.7707 22.1485 19.6899 22.1129 19.6257 22.0575C19.5613 22.0027 19.5139 21.9283 19.4921 21.8418C19.3226 21.1662 19.0661 20.6231 18.2897 21.0911L24.4404 13.9242C24.5772 13.7646 24.8265 13.7529 24.9953 13.8976ZM16.9647 13.3524C16.9421 13.3243 16.6482 13.0287 16.5206 12.9012C15.3721 11.7527 13.8666 11.1783 12.3611 11.1785C10.8558 11.1785 9.35029 11.7527 8.20164 12.9012C7.05325 14.0498 6.4788 15.5554 6.47893 17.0608C6.4788 18.3662 6.91087 19.6718 7.77476 20.7447C7.7974 20.7729 8.09131 21.0684 8.21875 21.1958C9.36739 22.3445 10.8729 22.9188 12.3782 22.9187C13.8837 22.9188 15.3892 22.3445 16.5377 21.1958C17.6862 20.0474 18.2607 18.5417 18.2606 17.0364C18.2607 15.7309 17.8286 14.4251 16.9647 13.3524ZM12.3782 21.4342C11.253 21.4341 10.1274 21.0048 9.26862 20.1459C8.40991 19.2872 7.98061 18.1617 7.98049 17.0364C7.98061 16.3054 8.16177 15.5744 8.52422 14.9164C8.5259 14.9132 8.5259 14.9098 8.52735 14.9067C8.60456 14.7694 8.69189 14.6364 8.78476 14.5062L14.9076 20.629C14.1509 21.1629 13.2656 21.4341 12.3782 21.4342ZM16.2153 19.1808C16.2136 19.1839 16.2136 19.1871 16.212 19.1904C16.1342 19.3288 16.0463 19.463 15.9524 19.5941L9.82885 13.4704C10.5861 12.9351 11.4725 12.663 12.3611 12.663C13.4865 12.663 14.612 13.0925 15.4707 13.9512C16.3295 14.8099 16.7589 15.9354 16.7589 17.0607C16.7589 17.7917 16.5777 18.5227 16.2153 19.1808ZM10.2538 5.31504L11.1352 5.18061V4.7306C11.1352 4.27095 11.5112 3.8949 11.971 3.8949H12.3697H12.7685C13.2283 3.8949 13.6043 4.27095 13.6043 4.7306V5.18061L14.4857 5.31504C14.9697 5.38888 15.2849 5.63556 15.443 6.17182L15.8234 7.46272C15.8336 7.49705 16.3433 7.31769 16.5362 7.69363C16.7054 8.02367 16.5667 8.45633 16.1933 8.45633H12.3697H8.54614C8.17262 8.45633 8.03409 8.02367 8.20321 7.69363C8.39606 7.31769 8.90581 7.49705 8.91605 7.46272L9.29644 6.17182C9.45448 5.63556 9.76982 5.38888 10.2538 5.31504ZM20.0057 17.5933V8.15641C20.0057 8.03872 19.9569 7.93116 19.8786 7.85286C19.8004 7.77457 19.6927 7.72579 19.5752 7.72579H17.5104C17.4847 7.571 17.4353 7.41743 17.3603 7.27108C17.1652 6.89056 16.8735 6.68134 16.5315 6.58859L16.3557 5.99211H19.5752C20.1711 5.99211 20.7125 6.23542 21.1042 6.62725C21.496 7.01909 21.7395 7.56053 21.7395 8.15641V15.5731L20.0057 17.5933Z" fill="#fff"/></svg>',
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
        this.authenManager.logout();
        this.router.navigateByUrl("login");
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
