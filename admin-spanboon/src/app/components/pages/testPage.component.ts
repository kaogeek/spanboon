/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit } from '@angular/core';
import { AuthenManager } from '../../services/AuthenManager.service';
import { ConfigFacade, HashTagFacade } from '../../services/facade/facades';
import { SearchFilter } from '../../models/models';
import { Config } from '../../models/Config';
import { Hashtag } from '../../models/Hashtag';

const PAGE_NAME: string = "test";

const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;

@Component({
  selector: 'test',
  templateUrl: './testPage.component.html'
})

export class testPage implements OnInit {

  public static readonly PAGE_NAME: string = PAGE_NAME;
  menuItems: any[];

  private authenManager: AuthenManager;
  private configFacade: ConfigFacade;
  private hashTagFacade: HashTagFacade;

  public isShowSidebar: boolean;
  public configList: any[] = [];
  public hashtagList: any[] = [];

  // ----------------config

  public configname: string
  public configvalue: string
  public configtype: string
  public editConfigName: string

  public isEdit: boolean

  // ----------------hashtag

  public hashtagname: string
  public hashtagTag: string
  public hashtagFine: string
  public edithashtagName: string

  constructor(authenManager: AuthenManager, configFacade: ConfigFacade, hashTagFacade: HashTagFacade) {
    this.authenManager = authenManager;
    this.configFacade = configFacade;
    this.hashTagFacade = hashTagFacade;
    this.isEdit = false
  }

  ngOnInit() {
    this.getConfig();
    this.getHashtag();
  }

  // ------------------------------ configFacade 

  public getConfig() {
    let filter = new SearchFilter();
    filter.limit = SEARCH_LIMIT;
    filter.offset = SEARCH_OFFSET;
    filter.relation = [],
      filter.whereConditions = {},
      filter.count = false;
    filter.orderBy = {}
    this.configFacade.search(filter).then((res: any) => {
      this.configList = res
    }).catch((err: any) => {
    })
  }

  public createConfig() {
    let config = new Config();
    config.name = this.configname
    config.value = this.configvalue
    config.type = this.configtype
    this.configFacade.create(config).then((res: any) => {
      this.getConfig()
    }).catch((err: any) => {
      this.getConfig()
    })
  }

  public deleteConfig(name) {
    this.configFacade.delete(name).then((res: any) => {
      this.getConfig()
    }).catch((err: any) => {
      this.getConfig()
    })
  }

  // public setButtonEdit(name) {
  //   this.editConfigName = name
  //   this.isEdit = !this.isEdit
  // }

  // public editConfig() {
  //   let config = new Config();
  //   config.name = this.configname
  //   config.value = this.configvalue
  //   config.type = this.configtype
  //   this.configFacade.edit(this.editConfigName, config).then((res: any) => {
  //     this.getConfig();
  //   }).catch((err: any) => {
  //     this.getConfig();
  //   })
  // }

  // ------------------------------ hashtagFacade 

  public getHashtag() {
    let filter = new SearchFilter();
    filter.limit = SEARCH_LIMIT;
    filter.offset = SEARCH_OFFSET;
    filter.relation = [],
      filter.whereConditions = {},
      filter.count = false;
    filter.orderBy = {}
    this.hashTagFacade.search(filter).then((res: any) => {
      this.hashtagList = res
    }).catch((err: any) => {
    })
  }

  public createHashtag() {
    let hashtag = new Hashtag();
    hashtag.name = this.hashtagname
    hashtag.tag = this.hashtagTag
    this.hashTagFacade.create(hashtag).then((res: any) => {
      this.getHashtag()
    }).catch((err: any) => {
      this.getHashtag()
    })
  }

  public deleteHashtag(data) {
    this.hashTagFacade.delete(data.id).then((res: any) => {
      this.getHashtag()
    }).catch((err: any) => {
      this.getHashtag()
    })
  }

}
