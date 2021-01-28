/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

export const MAX_SEARCH_ROWS = 200;
export const DEFAULT_HOT_TOPIC_CALCULATE_CONFIG = {
    WEIGHT: 1,
    WEIGHT_X: 1,
    WEIGHT_Y: 2,
    WEIGHT_Z: 0.5,
    WEIGHT_V: 0.01,
    FUNCTION: 'linear',
    LINEAR_M: 0.1,
    EXPO_M: 0.75,
    F1_M: 0.7,
    DAY_RANGE: 30,
    SCORE_MAX_FRACTION: 2,
    HOT_SCORE_INDICATOR: 1
};
export const DEFAULT_PROPOSAL_CONFIG = {
    APPROVE_AUTO: false
};
export const DEFAULT_CALCULATOR_USER_EXP_LEVEL_CONFIG = {
    CONSTA: 8.7,
    CONSTB: -4.0,
    CONSTC: 111
};
export const DEFAULT_CALCULATOR_USER_EXP_VALUE_CONFIG = {
    CREATE: 5,
    CREATE_COMMENT_VOTE: 30,
    COMMENT: 1,
    LIKE: 1,
    DISLIKE: 1,
    UNLIKE: 0,
    UNDISLIKE: 0,
    HOT: 30,
    RECOMMEND: 30,
    SUPPORT: 1,
    UNSUPPORT: 0,
    HALF_SUPPORT: 100,
    FULL_SUPPORT: 200
};
export const DEBATE_HOT_CONFIG_NAME = {
    WEIGHT: 'debate.hot.weight',
    WEIGHT_X: 'debate.hot.weight.x',
    WEIGHT_Y: 'debate.hot.weight.y',
    WEIGHT_Z: 'debate.hot.weight.z',
    WEIGHT_V: 'debate.hot.weight.v',
    FUNCTION: 'debate.hot.function',
    FUNCTION_M: 'debate.hot.function.m',
    DAY_RANGE: 'debate.hot.dayrange',
    SCORE_MAX_FRACTION: 'debate.hot.score.maxfraction',
    HOT_SCORE_INDICATOR: 'debate.hot.score.indicator'
};
export const PROPOSAL_HOT_CONFIG_NAME = {
    WEIGHT: 'proposal.hot.weight',
    WEIGHT_X: 'proposal.hot.weight.x',
    WEIGHT_Y: 'proposal.hot.weight.y',
    WEIGHT_Z: 'proposal.hot.weight.z',
    WEIGHT_V: 'proposal.hot.weight.v',
    FUNCTION: 'proposal.hot.function',
    FUNCTION_M: 'proposal.hot.function.m',
    DAY_RANGE: 'proposal.hot.dayrange',
    SCORE_MAX_FRACTION: 'proposal.hot.score.maxfraction',
    HOT_SCORE_INDICATOR: 'proposal.hot.score.indicator'
};
export const PROPOSAL_CONFIG_NAME = {
    APPROVE_AUTO: 'proposal.approve.auto',
    APPROVE_AUTO_USER_ADMIN: 'proposal.approve.auto.useradmin'
};
export const RELATETAG_TRENDING_SCORE_CONFIG_NAME = {
    WEIGHT: 'relatetag.trending.score.weight',
    WEIGHT_X: 'relatetag.trending.score.weight.x',
    WEIGHT_Y: 'relatetag.trending.score.weight.y',
    FUNCTION: 'relatetag.trending.score.function',
    FUNCTION_M: 'relatetag.trending.score.function.m',
    DAY_RANGE: 'relatetag.trending.score.dayrange',
    SCORE_MAX_FRACTION: 'relatetag.trending.score.maxfraction',
    SCORE_INDICATOR: 'relatetag.trending.score.indicator'
};
export const DEFAULT_RELATETAG_TRENDING_SCORE_CALCULATE_CONFIG = {
    WEIGHT: 1,
    WEIGHT_X: 1,
    WEIGHT_Y: 2,
    WEIGHT_Z: 0.5,
    FUNCTION: 'linear',
    LINEAR_M: 0.1,
    EXPO_M: 0.75,
    F1_M: 0.7,
    DAY_RANGE: 30,
    SCORE_MAX_FRACTION: 2,
    CORE_INDICATOR: 1
};

export const USER_EXP_VALUE_CONFIG_NAME = {
    CREATE: 'user.exp.value.create',
    CREATE_COMMENT_VOTE: 'user.exp.value.create.comment.vote',
    COMMENT: 'user.exp.value.comment',
    LIKE: 'user.exp.value.like',
    DISLIKE: 'user.exp.value.dislike',
    UNLIKE: 'user.exp.value.unlike',
    UNDISLIKE: 'user.exp.value.undislike',
    HOT: 'user.exp.value.hot',
    RECOMMEND: 'user.exp.value.recommend',
    SUPPORT: 'user.exp.value.support',
    UNSUPPORT: 'user.exp.value.unsupport',
    HALF_SUPPORT: 'user.exp.value.half.support',
    FULL_SUPPORT: 'user.exp.value.full.support'
};
export const DEBATE_COMMENT_APPROVE_REQUIRED_CONFIG = 'debate.comment.approve.required';
export const PROPOSAL_COMMENT_APPROVE_REQUIRED_CONFIG = 'proposal.comment.approve.required';
export const VOTE_COMMENT_APPROVE_REQUIRED_CONFIG = 'vote.comment.approve.required';
export const CALCULATOR_USER_EXP_LEVEL_CONFIG_NAME = {
    constA: 'calculator.user.exp.level.consta',
    constB: 'calculator.user.exp.level.constb',
    constC: 'calculator.user.exp.level.constc',
};

export const PAGE_FOLLOWER_LIMIT_DEFAULT = 10;
export const PAGE_FOLLOWER_OFFSET_DEFAULT = 0;
export const ALLOCATE_SEARCH_LIMIT_DEFAULT = 10;
export const ALLOCATE_SEARCH_OFFSET_DEFAULT = 0;
