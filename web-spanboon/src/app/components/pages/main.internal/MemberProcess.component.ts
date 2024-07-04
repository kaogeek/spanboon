/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th > , Panupap-somprasong <panupap.s@absolute.co.th>
 */

import { Component, OnInit } from '@angular/core';
import { BindingMemberFacade, CheckMergeUserFacade } from '../../../services/services';
import { ActivatedRoute, NavigationExtras, Params, Router } from '@angular/router';

const PAGE_NAME: string = 'process';

@Component({
  selector: 'member-process',
  templateUrl: './MemberProcess.component.html',
})
export class MemberProcess implements OnInit {
  public static readonly PAGE_NAME: string = PAGE_NAME;
  public params: any;
  public checkMergeUserFacade: CheckMergeUserFacade;
  public bindingMemberFacade: BindingMemberFacade;

  public data: any;
  public dataId: any;
  public isNotAccess: any;
  public linkPost: any;
  public mainPostLink: string;
  public decodedData: any;
  public status: any;
  public param: any;
  public messageError: any;

  public paramActId: any;
  public paramUserId: any;

  public isLoading: boolean = true;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    checkMergeUserFacade: CheckMergeUserFacade,
    bindingMemberFacade: BindingMemberFacade) {
    this.checkMergeUserFacade = checkMergeUserFacade;
    this.bindingMemberFacade = bindingMemberFacade;

    const splitUrl = this.router.url.split('/');
    const url = splitUrl[2].split('?');
    if (url[0] === 'success') this.status = 'success';
    if (url[0] === 'reject') this.status = 'reject';
    if (url[0] === 'act') this.status = 'act';

    const navigation = this.router.getCurrentNavigation();
    const state = navigation.extras.state;
    if (state) {
      this.messageError = state.message;
    }
  }

  public ngOnInit(): void {
    this.route.queryParams.subscribe(
      (params: Params) => {
        if (!!params['actid']) this.paramActId = +params['actid'];
        if (!!params['userid']) this.paramUserId = +params['userid'];
      }
    );

    let methodMFP = localStorage.getItem('methodMFP');
    setTimeout(() => {
      if (this.status === 'success') {
        if (methodMFP === 'binding') {
          let navigationExtras: NavigationExtras = {
            state: {
              focus: 'การเชื่อมต่อ'
            },
          }
          localStorage.setItem('membership', String(true));
          this.router.navigate(['/account/settings'], navigationExtras);
        } else {
          this.router.navigateByUrl('/home');
        }
        localStorage.removeItem('methodMFP');
      } else if (this.status === 'act') {
        this.router.navigateByUrl('/home');
      } else {
        this.router.navigateByUrl('/home');
        localStorage.removeItem('methodMFP');
      }
    }, 5000);
  }

  public getIdUser() {
    let user = JSON.parse(localStorage.getItem('pageUser'));
    return user.id;
  }

  public ngOnDestroy(): void {

  }
}