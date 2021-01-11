/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

export enum LOG_TYPE {
    CONFIG = 'CONFIG',
    EMERGENCY = 'EMERGENCY',
    PAGE = 'PAGE',
    PAGE_CATEGORY = 'PAGE_CATEGORY',
    PAGE_OBJECTIVE = 'PAGE_OBJECTIVE',
    PAGE_OBJECTIVE_CATEGORY = 'PAGE_OBJECTIVE_CATEGORY',
    STANDARDITEM = 'STANDARDITEM',
    STANDARDITEM_CATEGORY = 'STANDARDITEM_CATEGORY',
    STANDARDITEM_REQUEST = 'STANDARDITEM_REQUEST',
    USER = 'USER'
}

export enum CONFIG_LOG_ACTION {
    CREATE = 'CREATE',
    EDIT = 'EDIT',
    DELETE = 'DELETE'
}

export enum EMERGENCY_LOG_ACTION {
    CREATE = 'CREATE',
    EDIT = 'EDIT',
    DELETE = 'DELETE'
}

export enum HASHTAG_LOG_ACTION {
    CREATE = 'CREATE',
    EDIT = 'EDIT',
    DELETE = 'DELETE'
}

export enum PAGE_LOG_ACTION {
    CREATE = 'CREATE',
    EDIT = 'EDIT',
    DELETE = 'DELETE',
    APPROVE = 'APPROVE',
    UNAPPROVE = 'UNAPPROVE',
    BAN = 'BAN',
    UNBAN = 'UNBAN'
}

export enum PAGE_CATEGORY_LOG_ACTION {
    CREATE = 'CREATE',
    EDIT = 'EDIT',
    DELETE = 'DELETE'
}

export enum PAGE_OBJECTIVE_LOG_ACTION {
    CREATE = 'CREATE',
    EDIT = 'EDIT',
    DELETE = 'DELETE'
}

export enum PAGE_OBJECTIVE_CATEGORY_LOG_ACTION {
    CREATE = 'CREATE',
    EDIT = 'EDIT',
    DELETE = 'DELETE'
}

export enum STANDARDITEM_LOG_ACTION {
    CREATE = 'CREATE',
    EDIT = 'EDIT',
    DELETE = 'DELETE'
}

export enum STANDARDITEM_CATEGORY_LOG_ACTION {
    CREATE = 'CREATE',
    EDIT = 'EDIT',
    DELETE = 'DELETE'
}

export enum STANDARDITEM_REQUEST_LOG_ACTION {
    CREATE = 'CREATE',
    EDIT = 'EDIT',
    DELETE = 'DELETE',
    APPROVE = 'APPROVE',
    UNAPPROVE = 'UNAPPROVE'
}

export enum USER_LOG_ACTION {
    CREATE = 'CREATE',
    EDIT = 'EDIT',
    DELETE = 'DELETE',
    BAN = 'BAN',
    UNBAN = 'UNBAN',
}
