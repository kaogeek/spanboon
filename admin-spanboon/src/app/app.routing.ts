/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import {
  MainPage,
  StandardItemCategoryPage,
  UserAdminPage,
  PostPage,
  EmergencyEventPage,
  PageObjectiveCategoryPage,
  StandardItemCustomPage,
  StandardItemReqRequestPage,
  HashtagPage,
  testPage,
  LoginPage,
  ConfigPage,
  UserPage,
  AdminPage,
  PageCategoryPage,
  PageGroup,
  NewsPaperPage,
  VoteEventPage,
  DashboardPage
} from './components/components';
import { TodayPageV2 } from './components/pages/main.internal/TodayPageV2.component';
import { ManipulatePage } from './components/pages/main.internal/ManipulatePage.component';
import { ManipulatePost } from './components/pages/main.internal/ManipulatePost.component';
const routes: Routes = [
  {
    path: '',
    component: LoginPage
  },
  {
    path: LoginPage.PAGE_NAME,
    component: LoginPage
  },
  {
    path: 'main',
    component: MainPage,
    children: [
      {
        path: PageObjectiveCategoryPage.PAGE_NAME,
        component: PageObjectiveCategoryPage
      },
      {
        path: PostPage.PAGE_NAME,
        component: PostPage
      },
      {
        path: DashboardPage.PAGE_NAME,
        component: DashboardPage
      },
      {
        path: EmergencyEventPage.PAGE_NAME,
        component: EmergencyEventPage
      },
      // {
      //   path: TodayPage.PAGE_NAME,
      //   component: TodayPage
      // },
      {
        path: TodayPageV2.PAGE_NAME,
        component: TodayPageV2
      },
      {
        path: NewsPaperPage.PAGE_NAME,
        component: NewsPaperPage
      },
      {
        path: StandardItemCategoryPage.PAGE_NAME,
        component: StandardItemCategoryPage
      },
      {
        path: StandardItemReqRequestPage.PAGE_NAME,
        component: StandardItemReqRequestPage
      },
      {
        path: StandardItemCustomPage.PAGE_NAME,
        component: StandardItemCustomPage
      },
      {
        path: PageCategoryPage.PAGE_NAME,
        component: PageCategoryPage
      },
      {
        path: PageGroup.PAGE_NAME,
        component: PageGroup
      },
      {
        path: ConfigPage.PAGE_NAME,
        component: ConfigPage
      },
      {
        path: ManipulatePage.PAGE_NAME,
        component: ManipulatePage
      },
      {
        path: ManipulatePost.PAGE_NAME,
        component: ManipulatePost
      },
      // {
      //   path: StandardItemPage.PAGE_NAME,
      //   component: StandardItemPage
      // },
      {
        path: HashtagPage.PAGE_NAME,
        component: HashtagPage
      },
      {
        path: UserPage.PAGE_NAME,
        component: UserPage
      },
      {
        path: AdminPage.PAGE_NAME,
        component: AdminPage
      },
      {
        path: UserAdminPage.PAGE_NAME,
        component: UserAdminPage
      },
      {
        path: VoteEventPage.PAGE_NAME,
        component: VoteEventPage
      },
    ]
  },
  {
    path: 'test',
    component: testPage,
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes)
  ],
  exports: [
  ],
})
export class AppRoutingModule { }
