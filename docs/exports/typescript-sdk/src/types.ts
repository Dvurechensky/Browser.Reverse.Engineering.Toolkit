export type Primitive = string | number | boolean | null;
export type JsonValue = Primitive | JsonValue[] | { [key: string]: JsonValue };

export interface SiteClientOptions {
  baseUrl?: string;
  apiBaseUrl?: string;
  authBaseUrl?: string;
  mediaBaseUrl?: string;
  telemetryBaseUrl?: string;
  accessToken?: string;
  sessionCookie?: string;
  csrfToken?: string;
  defaultHeaders?: Record<string, string>;
  fetchImpl?: typeof fetch;
}

export interface RequestOptions {
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export interface PostmethodvideogetstatstokenRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodvideogetstatstokenResponse = {
  response?: {
  token?: string;
};
};

export interface PostalvideophpRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostalvideophpResponse = {
  langVersion?: string;
  loaderVersion?: string;
  payload?: number[];
  statsMeta?: {
  hash?: string;
  id?: number;
  platform?: string;
  reloadVersion?: number;
  st?: boolean;
  time?: number;
};
  vkEnv?: string;
};

export interface PostmethodcataloggetpeoplesearchRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodcataloggetpeoplesearchResponse = {
  response?: {
  albums?: JsonValue[];
  catalog?: {
  default_section?: string;
  sections?: {
  blocks?: {
  data_type?: string;
  id?: string;
  layout?: {
  name?: string;
  title?: string;
};
}[];
  id?: string;
  next_from?: string;
  title?: string;
}[];
};
  catalog_users?: {
  common_friends?: number[];
  common_friends_count?: number;
  common_friends_description?: {
  text?: string;
};
  descriptions?: {
  text?: string;
}[];
  item_id?: string;
  track_code?: string;
  user_id?: number;
}[];
  profiles?: {
  activity?: string;
  can_access_closed?: boolean;
  can_call?: boolean;
  can_write_private_message?: number;
  first_name?: string;
  friend_status?: number;
  has_unseen_stories?: boolean;
  id?: number;
  is_closed?: boolean;
  is_esia_verified?: boolean;
  is_nft?: boolean;
  is_sber_verified?: boolean;
  is_tinkoff_linked?: boolean;
  is_tinkoff_verified?: boolean;
  is_verified?: boolean;
  last_name?: string;
  oauth_verification?: JsonValue[];
  online_info?: {
  app_id?: number;
  is_mobile?: boolean;
  is_online?: boolean;
  last_seen?: number;
  visible?: boolean;
};
  photo_100?: string;
  photo_200?: string;
  photo_50?: string;
  photo_base?: string;
  screen_name?: string;
  sex?: number;
  social_button_type?: string;
  trending?: number;
  verified?: number;
}[];
};
};

export interface PostmethodchannelsgetownersforcreateRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodchannelsgetownersforcreateResponse = {
  response?: {
  all_owner_ids?: number[];
  groups?: {
  activity?: string;
  admin_level?: number;
  age_limits?: number;
  can_manage?: boolean;
  can_message?: number;
  can_post_donut?: number;
  city?: {
  id?: number;
  title?: string;
};
  contacts?: {
  contact_id?: number;
  user_id?: number;
}[];
  description?: string;
  has_photo?: number;
  id?: number;
  is_admin?: number;
  is_advertiser?: number;
  is_closed?: number;
  is_member?: number;
  is_messages_blocked?: number;
  member_status?: number;
  members_count?: number;
  name?: string;
  photo_100?: string;
  photo_200?: string;
  photo_50?: string;
  photo_base?: string;
  reposts_disabled?: boolean;
  screen_name?: string;
  site?: string;
  type?: string;
  unread_count?: number;
  verified?: number;
  wall?: number;
}[];
  owner_ids?: number[];
  profiles?: {
  activity?: string;
  bdate?: string;
  blacklisted?: number;
  blacklisted_by_me?: number;
  can_access_closed?: boolean;
  can_call?: boolean;
  can_invite_to_chats?: boolean;
  can_send_friend_request?: number;
  can_write_private_message?: number;
  city?: {
  id?: number;
  title?: string;
};
  first_name?: string;
  first_name_acc?: string;
  first_name_dat?: string;
  first_name_gen?: string;
  first_name_ins?: string;
  followers_count?: number;
  friend_status?: number;
  has_photo?: number;
  home_phone?: string;
  id?: number;
  is_closed?: boolean;
  is_followers_mode_on?: boolean;
  is_service_account?: boolean;
  language?: string;
  last_name?: string;
  last_name_acc?: string;
  last_name_gen?: string;
  last_name_ins?: string;
  mobile_phone?: string;
  occupation?: {
  city_id?: number;
  country_id?: number;
  graduate_year?: number;
  id?: number;
  name?: string;
  type?: string;
};
  online_info?: {
  is_mobile?: boolean;
  is_online?: boolean;
  last_seen?: number;
  visible?: boolean;
};
  photo_100?: string;
  photo_200?: string;
  photo_50?: string;
  photo_base?: string;
  photo_id?: string;
  screen_name?: string;
  sex?: number;
  site?: string;
  verified?: number;
}[];
};
};

export interface PostmethodexecuteRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodexecuteResponse = {
  response?: {
  tabs?: string[];
}[];
};

export interface PostmethodfriendsgetRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodfriendsgetResponse = {
  response?: {
  count?: number;
  items?: number[];
};
};

export interface PostmethodfriendsgetrecommendationsRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodfriendsgetrecommendationsResponse = {
  response?: {
  count?: number;
  items?: {
  can_access_closed?: boolean;
  can_send_friend_request?: number;
  can_write_private_message?: number;
  common_count?: number;
  crop_photo?: {
  crop?: {
  x?: number;
  x2?: number;
  y?: number;
  y2?: number;
};
  photo?: {
  album_id?: number;
  date?: number;
  has_tags?: boolean;
  id?: number;
  owner_id?: number;
  post_id?: number;
  sizes?: {
  height?: number;
  type?: string;
  url?: string;
  width?: number;
}[];
  square_crop?: string;
  text?: string;
};
  rect?: {
  x?: number;
  x2?: number;
  y?: number;
  y2?: number;
};
};
  descriptions?: string[];
  first_name?: string;
  friend_status?: number;
  friends_generation_id?: number;
  friends_recommendation_source?: number;
  has_unseen_stories?: boolean;
  id?: number;
  is_closed?: boolean;
  is_nft?: boolean;
  last_name?: string;
  photo_100?: string;
  photo_200?: string;
  photo_400?: string;
  photo_400_orig?: string;
  screen_name?: string;
  sex?: number;
  social_button_type?: string;
  track_code?: string;
  trending?: number;
  verified?: number;
}[];
  next_from?: string;
  title?: string;
  track_code?: string;
};
};

export interface PostmethodfriendsgetrequestsRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodfriendsgetrequestsResponse = {
  response?: {
  count?: number;
  count_unread?: number;
  items?: {
  can_access_closed?: boolean;
  can_call?: boolean;
  can_write_private_message?: number;
  city?: {
  id?: number;
  title?: string;
};
  first_name?: string;
  first_name_acc?: string;
  first_name_gen?: string;
  has_unseen_stories?: boolean;
  is_closed?: boolean;
  is_esia_verified?: boolean;
  is_nft?: boolean;
  is_sber_verified?: boolean;
  is_tinkoff_verified?: boolean;
  last_name?: string;
  mutual?: {
  count?: number;
  users?: JsonValue[];
};
  online?: number;
  photo_100?: string;
  photo_200?: string;
  photo_base?: string;
  social_button_type?: string;
  timestamp?: number;
  track_code?: string;
  user_id?: number;
  verified?: number;
}[];
  last_viewed?: number;
};
};

export interface PostmethodmessagesgetconversationsRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodmessagesgetconversationsResponse = {
  response?: {
  count?: number;
  groups?: {
  activity?: string;
  age_limits?: number;
  can_manage?: boolean;
  can_message?: number;
  city?: {
  id?: number;
  title?: string;
};
  contacts?: JsonValue[];
  description?: string;
  has_photo?: number;
  id?: number;
  is_admin?: number;
  is_advertiser?: number;
  is_closed?: number;
  is_member?: number;
  is_messages_blocked?: number;
  member_status?: number;
  members_count?: number;
  menu?: {
  items?: {
  cover?: {
  height?: number;
  url?: string;
  width?: number;
}[];
  id?: number;
  title?: string;
  type?: string;
  url?: string;
}[];
};
  name?: string;
  photo_100?: string;
  photo_200?: string;
  photo_50?: string;
  photo_base?: string;
  reposts_disabled?: boolean;
  screen_name?: string;
  site?: string;
  type?: string;
  verified?: number;
  wall?: number;
}[];
  items?: {
  conversation?: {
  can_receive_money?: boolean;
  can_send_money?: boolean;
  can_write?: {
  allowed?: boolean;
  reason?: number;
};
  important?: boolean;
  in_read?: number;
  in_read_cmid?: number;
  is_marked_unread?: boolean;
  last_conversation_message_id?: number;
  last_message_id?: number;
  out_read?: number;
  out_read_cmid?: number;
  peer?: {
  id?: number;
  local_id?: number;
  type?: string;
};
  peer_flags?: number;
  push_settings?: {
  disabled_forever?: boolean;
  disabled_mass_mentions?: boolean;
  disabled_mentions?: boolean;
  no_sound?: boolean;
};
  sort_id?: {
  major_id?: number;
  minor_id?: number;
};
  timestamp?: number;
  version?: number;
};
  last_message?: {
  attachments?: JsonValue[];
  conversation_message_id?: number;
  date?: number;
  from_id?: number;
  fwd_messages?: JsonValue[];
  id?: number;
  important?: boolean;
  is_hidden?: boolean;
  is_mentioned_user?: boolean;
  out?: number;
  peer_id?: number;
  random_id?: number;
  text?: string;
  version?: number;
};
}[];
  profiles?: {
  activity?: string;
  bdate?: string;
  blacklisted?: number;
  blacklisted_by_me?: number;
  can_access_closed?: boolean;
  can_call?: boolean;
  can_invite_to_chats?: boolean;
  can_send_friend_request?: number;
  can_write_private_message?: number;
  city?: {
  id?: number;
  title?: string;
};
  first_name?: string;
  first_name_acc?: string;
  first_name_dat?: string;
  first_name_gen?: string;
  first_name_ins?: string;
  followers_count?: number;
  friend_status?: number;
  has_photo?: number;
  home_phone?: string;
  id?: number;
  image_status?: {
  id?: number;
  images?: {
  height?: number;
  url?: string;
  width?: number;
}[];
  name?: string;
  tags?: JsonValue[];
};
  is_closed?: boolean;
  is_followers_mode_on?: boolean;
  is_service_account?: boolean;
  last_name?: string;
  last_name_acc?: string;
  last_name_gen?: string;
  last_name_ins?: string;
  mobile_phone?: string;
  occupation?: {
  name?: string;
  type?: string;
};
  online_info?: {
  app_id?: number;
  is_mobile?: boolean;
  is_online?: boolean;
  last_seen?: number;
  visible?: boolean;
};
  photo_100?: string;
  photo_200?: string;
  photo_50?: string;
  photo_base?: string;
  photo_id?: string;
  screen_name?: string;
  sex?: number;
  site?: string;
  verified?: number;
}[];
};
};

export interface PostmethodmessagesgetrecentstickersRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodmessagesgetrecentstickersResponse = {
  response?: {
  count?: number;
  items?: {
  images?: {
  height?: number;
  url?: string;
  width?: number;
}[];
  images_with_background?: {
  height?: number;
  url?: string;
  width?: number;
}[];
  inner_type?: string;
  is_allowed?: boolean;
  sticker_id?: number;
}[];
};
};

export interface PostalfeedrightblockphpRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostalfeedrightblockphpResponse = {
  langKeys?: {
  global?: JsonValue[];
  local?: {
  audio_action_dislike?: string;
  audio_action_sub_sheet_additional_loading?: string;
  audio_add_to_new_pl?: string;
  audio_add_to_playlist?: string;
  audio_alert_cancel_label_default?: string;
  audio_alert_confirm_label_default?: string;
  audio_claim_delete?: string;
  audio_claim_delete_capital?: string;
  audio_claim_objection?: string;
  audio_claim_warning?: string;
  audio_claim_warning_title?: string;
  audio_claimed_geo?: string;
  audio_claimed_replacement_available?: string;
  audio_copy_audio_link?: string;
  audio_legal_notice_line_foreign_agent?: string;
  audio_music_playlist_crash_placeholder_description?: string;
  audio_music_playlist_crash_placeholder_header?: string;
  audio_open_album?: string;
  audio_podcast_open_episode?: string;
  audio_replace_with_original?: string;
  audio_row_show_all_playlists?: string;
  audio_set_next_audio?: string;
  audio_share_audio?: string;
  audio_site_rules_violation_header?: string;
  audio_site_rules_violation_warning?: string;
  blank_too_many_recent_actions?: string;
  box_close?: string;
  box_send?: string;
  calls_cancel?: string;
  calls_delete?: string;
  calls_privacy_management_modal_calls_has_messages_title?: string;
  calls_privacy_management_modal_calls_in_contacts_title?: string;
  calls_privacy_management_modal_calls_nested_description?: string;
  calls_privacy_management_modal_notification_load_settings_error_message?: string;
  calls_privacy_management_modal_notification_save_error_message?: string;
  calls_privacy_management_modal_notification_save_success_message?: string;
  calls_privacy_management_modal_select_allowed_title?: string;
  calls_privacy_management_modal_select_empty_message?: string;
  calls_privacy_management_modal_select_excluded_title?: string;
  calls_privacy_management_modal_select_friends_or_lists_placeholder?: string;
  calls_privacy_management_modal_select_friends_placeholder?: string;
  calls_privacy_management_modal_select_loading_message?: string;
  calls_privacy_management_modal_select_search_error_message?: string;
  calls_privacy_management_modal_title?: string;
  calls_save?: string;
  captcha_cancel?: string;
  captcha_enter_code?: string;
  captcha_send?: string;
  global_action_confirmation?: string;
  global_apps?: string;
  global_audio_ad?: string;
  global_audio_only_with_subscription_btn?: string;
  global_audio_only_with_subscription_text?: string;
  global_audio_only_with_subscription_title?: string;
  global_back?: string;
  global_box_error_title?: string;
  global_box_title_back?: string;
  global_cancel?: string;
  global_captcha_input_here?: string;
  global_chats?: string;
  global_close?: string;
  global_communities?: string;
  global_date?: string[];
  global_date_l?: string[];
  global_date_pre_free?: string[];
  global_delete?: string;
  global_error?: string;
  global_error_occured?: string;
  global_friends?: string;
  global_head_logout?: string;
  global_hours_ago?: string[];
  global_just_now?: string;
  global_long_weeks?: string;
  global_mins_ago?: string[];
  global_money_amount_rub?: string[];
  global_news_search_results?: string;
  global_recaptcha_title?: string;
  global_secs_ago?: string[];
  global_short_date?: string[];
  global_short_date_time?: string[];
};
};
  langVersion?: string;
  loaderVersion?: string;
  payload?: number[];
  static?: string;
  statsMeta?: {
  hash?: string;
  id?: number;
  platform?: string;
  reloadVersion?: number;
  st?: boolean;
  time?: number;
};
  vkEnv?: string;
};

export interface PostmethodaccountgetleftadsRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodaccountgetleftadsResponse = {
  response?: {
  ads_can_show?: boolean;
  ads_html?: string;
  ads_section?: string;
  ads_showed?: string;
};
};

export interface PostmethodstorehasnewitemsRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodstorehasnewitemsResponse = {
  response?: {
  favorite_stickers_limit?: number;
  favorite_stickers_version_hash?: string;
  global_promotion?: number;
  image_configs_version_hash?: string;
  sticker_packs_chunk_size_limit?: number;
  stickers_version_hash?: string;
  store_new_items?: number;
  suggestions_version_hash?: string;
  version?: number;
};
};

export interface PostwkviewphpRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostwkviewphpResponse = {
  langVersion?: string;
  loaderVersion?: string;
  payload?: number[];
  statsMeta?: {
  hash?: string;
  id?: number;
  platform?: string;
  reloadVersion?: number;
  st?: boolean;
  time?: number;
};
  vkEnv?: string;
};

export interface PostmethodvideogetRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodvideogetResponse = {
  response?: {
  count?: number;
  items?: {
  added?: number;
  can_add?: number;
  can_add_to_faves?: number;
  can_attach_link?: number;
  can_comment?: number;
  can_delete?: number;
  can_dislike?: number;
  can_download?: number;
  can_edit?: number;
  can_edit_privacy?: number;
  can_like?: number;
  can_play_in_background?: number;
  can_repost?: number;
  comments?: number;
  date?: number;
  description?: string;
  direct_url?: string;
  download?: {
  can_download_for_offline_view?: boolean;
  can_download_to_device?: boolean;
};
  duration?: number;
  files?: {
  dash_sep?: string;
  failover_host?: string;
  hls?: string;
  hls_fmp4?: string;
  mp4_1080?: string;
  mp4_144?: string;
  mp4_1440?: string;
  mp4_2160?: string;
  mp4_240?: string;
  mp4_360?: string;
  mp4_480?: string;
  mp4_720?: string;
};
  first_frame?: {
  height?: number;
  url?: string;
  width?: number;
}[];
  height?: number;
  id?: number;
  image?: {
  height?: number;
  url?: string;
  width?: number;
  with_padding?: number;
}[];
  is_author?: boolean;
  likes?: {
  count?: number;
  user_likes?: number;
};
  local_views?: number;
  need_mediascope_stat?: boolean;
  ov_id?: string;
  ov_provider_id?: number;
  owner_id?: number;
  player?: string;
  privacy_comment?: {
  category?: string;
  excluded_category?: string;
  is_enabled?: boolean;
  owners?: { [key: string]: JsonValue };
};
  privacy_view?: {
  category?: string;
  excluded_category?: string;
  is_enabled?: boolean;
  owners?: { [key: string]: JsonValue };
};
  reposts?: {
  count?: number;
  mail_count?: number;
  wall_count?: number;
};
  response_type?: string;
  share_url?: string;
  stats_pixels?: {
  event?: string;
  url?: string;
}[];
  timeline_thumbs?: {
  count_per_image?: number;
  count_per_row?: number;
  count_total?: number;
  frame_height?: number;
  frame_width?: number;
  frequency?: number;
  is_uv?: boolean;
  links?: string[];
};
  title?: string;
  track_code?: string;
  tracking_info?: {
  navigation?: {
  source_block?: string;
  source_prev_screen?: string;
  source_screen?: string;
};
  recom_info?: {
  feature_sampling_uuid?: string;
  recom_sources?: JsonValue[];
};
  search_info?: {
  search_query_id?: string;
};
};
  type?: string;
  views?: number;
  wall_post_id?: number;
  width?: number;
}[];
  max_attached_short_videos?: number;
  profiles?: {
  can_access_closed?: boolean;
  first_name?: string;
  id?: number;
  is_closed?: boolean;
  last_name?: string;
  online?: number;
  online_app?: number;
  online_info?: {
  app_id?: number;
  is_mobile?: boolean;
  is_online?: boolean;
  last_seen?: number;
  visible?: boolean;
};
  photo_100?: string;
  photo_50?: string;
  photo_base?: string;
  screen_name?: string;
  sex?: number;
}[];
};
};

export interface PostmethodvideogetplayerconfigRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodvideogetplayerconfigResponse = {
  response?: {
  config?: {
  core?: {
  androidPreferredFormat?: string;
  autoTrackSelection?: {
  bitrateFactorAtEmptyBuffer?: number;
  bitrateFactorAtFullBuffer?: number;
  trackCooldownDecreaseQuality?: number;
  trackCooldownIncreaseQuality?: number;
};
  chromecastPresentationApi?: boolean;
  chromecastReceiverId?: string;
  clearVideoElementInnerHTML?: boolean;
  collectingDecodingInfoEnabled?: boolean;
  configName?: string[];
  dash?: {
  ignoreNetworkErrorsOnLoadInit?: boolean;
  qualityLimitsOnStall?: {
  resetQualityRestrictionTimeout?: number;
  stallCountBeforeQualityDecrease?: number;
  stallDurationNoDataBeforeQualityDecrease?: number;
};
  rejectOnSourceOpenTimeout?: boolean;
  sourceOpenTimeout?: number;
  useNewAbr?: boolean;
};
  devNullLogEnabled?: boolean;
  keepVideoElement?: boolean;
  maxPlaybackTransitionInterval?: number;
  preferHDR?: boolean;
  preferMultiStream?: boolean;
  stallsManager?: {
  enabled?: boolean;
};
  useHlsJs?: boolean;
  useManagedMediaSource?: boolean;
  useNewAutoSelectVideoTrack?: boolean;
  useSafariEndlessRequestBugfix?: boolean;
  webmCodec?: string;
};
  meta?: string[];
  statistics?: {
  apiEnv?: string;
  embedUrlParams?: string[];
  watchCoverageInterval?: number;
  watchCoverageTimeoutFix?: boolean;
};
  ui?: {
  ads?: {
  isVsidOriginal?: boolean;
};
  configName?: string[];
  devNullLog?: boolean;
  disablePiPResizeHandling?: boolean;
  downloadVKLanguages?: boolean;
  episodeMinWidthPc?: number;
  features?: {
  additionalButtons?: boolean;
  annotations?: boolean;
  annotationsInside?: boolean;
  audioLanguages?: boolean;
  disableThumbUnstartedOnAutoplay?: boolean;
  dpip?: boolean;
  endScreen?: boolean;
  episodesClustering?: boolean;
  forceAutoQualityWhenSevereStallHappens?: boolean;
  forcePlayerDisplayBlock?: boolean;
  fullscreenInternalTargetPlayerContainer?: boolean;
  interactiveAreaControlShadow?: boolean;
  interactiveControlsExpectTimeBlinkAnimation?: boolean;
  interactiveControlsFillAnimation?: boolean;
  interactiveControlsHideAnimation?: boolean;
  interactiveControlsTapPlace?: boolean;
  interactiveGraph?: boolean;
  interactiveHistoryEndChapterFix?: boolean;
  interactiveLastFrame?: boolean;
  interactiveTimeIndicator?: boolean;
  interactiveTimeOpenUri?: boolean;
  maxCountShowSlowVideoNotification?: number;
  mediaSession?: string;
  mobileVkLogoViewOnBottomControls?: boolean;
  playbackStatusAnimationDuration?: number;
  playbackStatusNextVideoAnimationDuration?: number;
  playbackStatusNextVideoShow?: boolean;
  playbackStatusShow?: boolean;
  qualityDetailsSubMenuEnabled?: boolean;
  savePreferredStatesOnUserActionOnly?: boolean;
  saveRate?: boolean;
  sentry?: boolean;
  showSlowVideoNotification?: boolean;
  thinStatistics?: boolean;
  thumbTimer?: boolean;
  timeoutShowSlowVideoNotification?: number;
  userVideoPrefs?: boolean;
};
  hideThumbTimerAfterTouch?: boolean;
  sentry?: {
  sampleRate?: number;
};
  updateBuiltinLanguages?: boolean;
  view?: {
  timelineSliderFilledColor?: string;
};
};
};
};
};

export interface PostmethodwallgetcommentsforpostsRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodwallgetcommentsforpostsResponse = {
  response?: {
  groups?: JsonValue[];
  items?: {
  available_order?: string[];
  can_post?: boolean;
  comments?: {
  date?: number;
  from_id?: number;
  id?: number;
  likes?: {
  author_liked?: boolean;
  can_like?: number;
  can_like_as_author?: number;
  can_publish?: number;
  count?: number;
  user_likes?: number;
};
  owner_id?: number;
  parents_stack?: JsonValue[];
  post_id?: number;
  text?: string;
  thread?: {
  can_post?: boolean;
  count?: number;
  groups_can_post?: boolean;
  items?: {
  date?: number;
  from_id?: number;
  id?: number;
  is_from_post_author?: boolean;
  likes?: {
  author_liked?: boolean;
  can_like?: number;
  can_like_as_author?: number;
  can_publish?: number;
  count?: number;
  user_likes?: number;
};
  owner_id?: number;
  parents_stack?: number[];
  post_id?: number;
  reply_to_comment?: number;
  reply_to_user?: number;
  text?: string;
}[];
  show_reply_button?: boolean;
};
}[];
  count?: number;
  groups_can_post?: boolean;
  next_from?: string;
  order?: string;
  post_id?: string;
  show_reply_button?: boolean;
}[];
  profiles?: {
  activity?: string;
  can_access_closed?: boolean;
  can_write_private_message?: number;
  first_name?: string;
  first_name_dat?: string;
  first_name_gen?: string;
  friend_status?: number;
  has_unseen_stories?: boolean;
  id?: number;
  image_status?: {
  id?: number;
  images?: {
  height?: number;
  url?: string;
  width?: number;
}[];
  name?: string;
  tags?: JsonValue[];
};
  is_closed?: boolean;
  is_verified?: boolean;
  last_name?: string;
  last_name_gen?: string;
  last_seen?: {
  platform?: number;
  time?: number;
};
  mutual?: {
  count?: number;
  users?: JsonValue[];
};
  photo_100?: string;
  photo_200?: string;
  photo_50?: string;
  photo_base?: string;
  sex?: number;
  status?: string;
  verified?: number;
}[];
};
};

export interface Getimgsbyid8ed4b28cc0b905374fsvgRequest extends RequestOptions {
}
export type Getimgsbyid8ed4b28cc0b905374fsvgResponse = JsonValue;

export interface Getimgsbyidc0ca37933876686dcdsvgRequest extends RequestOptions {
}
export type Getimgsbyidc0ca37933876686dcdsvgResponse = JsonValue;

export interface Getimgsb6byid93a837dc06183017svgRequest extends RequestOptions {
}
export type Getimgsb6byid93a837dc06183017svgResponse = JsonValue;

export interface Getimgscfaaa8655ac54f10b068svgRequest extends RequestOptions {
}
export type Getimgscfaaa8655ac54f10b068svgResponse = JsonValue;

export interface Getimgscfe532db22916648f14dsvgRequest extends RequestOptions {
}
export type Getimgscfe532db22916648f14dsvgResponse = JsonValue;

export interface Getimgsdfbyid6fb16c27a25e2c38svgRequest extends RequestOptions {
}
export type Getimgsdfbyid6fb16c27a25e2c38svgResponse = JsonValue;

export interface Getimgseebyid84ed4e4a5ae73316svgRequest extends RequestOptions {
}
export type Getimgseebyid84ed4e4a5ae73316svgResponse = JsonValue;

export interface Getimgs37c0ca37933876686dcdsvgRequest extends RequestOptions {
}
export type Getimgs37c0ca37933876686dcdsvgResponse = JsonValue;

export interface Getimgs638ed4b28cc0b905374fsvgRequest extends RequestOptions {
}
export type Getimgs638ed4b28cc0b905374fsvgResponse = JsonValue;

export interface Getimgsb60993a837dc06183017svgRequest extends RequestOptions {
}
export type Getimgsb60993a837dc06183017svgResponse = JsonValue;

export interface Getimgsdf926fb16c27a25e2c38svgRequest extends RequestOptions {
}
export type Getimgsdf926fb16c27a25e2c38svgResponse = JsonValue;

export interface Getimgsee6384ed4e4a5ae73316svgRequest extends RequestOptions {
}
export type Getimgsee6384ed4e4a5ae73316svgResponse = JsonValue;

export interface GetRequest extends RequestOptions {
}
export type GetResponse = JsonValue;

export interface HeadRequest extends RequestOptions {
}
export type HeadResponse = JsonValue;

export interface PostalgroupsphpRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostalgroupsphpResponse = {
  langKeys?: {
  global?: JsonValue[];
  local?: {
  audio_action_dislike?: string;
  audio_action_sub_sheet_additional_loading?: string;
  audio_add_to_audio?: string;
  audio_add_to_new_pl?: string;
  audio_add_to_playlist?: string;
  audio_alert_cancel_label_default?: string;
  audio_alert_confirm_label_default?: string;
  audio_claim_delete?: string;
  audio_claim_delete_capital?: string;
  audio_claim_objection?: string;
  audio_claim_warning?: string;
  audio_claim_warning_title?: string;
  audio_claimed_geo?: string;
  audio_claimed_replacement_available?: string;
  audio_copy_audio_link?: string;
  audio_legal_notice_line_foreign_agent?: string;
  audio_music_playlist_crash_placeholder_description?: string;
  audio_music_playlist_crash_placeholder_header?: string;
  audio_open_album?: string;
  audio_podcast_open_episode?: string;
  audio_replace_with_original?: string;
  audio_row_show_all_playlists?: string;
  audio_set_next_audio?: string;
  audio_share_audio?: string;
  audio_site_rules_violation_header?: string;
  audio_site_rules_violation_warning?: string;
  blank_too_many_recent_actions?: string;
  box_close?: string;
  box_send?: string;
  calls_cancel?: string;
  calls_delete?: string;
  calls_privacy_management_modal_calls_has_messages_title?: string;
  calls_privacy_management_modal_calls_in_contacts_title?: string;
  calls_privacy_management_modal_calls_nested_description?: string;
  calls_privacy_management_modal_notification_load_settings_error_message?: string;
  calls_privacy_management_modal_notification_save_error_message?: string;
  calls_privacy_management_modal_notification_save_success_message?: string;
  calls_privacy_management_modal_select_allowed_title?: string;
  calls_privacy_management_modal_select_empty_message?: string;
  calls_privacy_management_modal_select_excluded_title?: string;
  calls_privacy_management_modal_select_friends_or_lists_placeholder?: string;
  calls_privacy_management_modal_select_friends_placeholder?: string;
  calls_privacy_management_modal_select_loading_message?: string;
  calls_privacy_management_modal_select_search_error_message?: string;
  calls_privacy_management_modal_title?: string;
  calls_save?: string;
  captcha_cancel?: string;
  captcha_enter_code?: string;
  captcha_send?: string;
  global_action_confirmation?: string;
  global_apps?: string;
  global_audio_ad?: string;
  global_audio_only_with_subscription_btn?: string;
  global_audio_only_with_subscription_text?: string;
  global_audio_only_with_subscription_title?: string;
  global_back?: string;
  global_box_error_title?: string;
  global_box_title_back?: string;
  global_cancel?: string;
  global_captcha_input_here?: string;
  global_chats?: string;
  global_close?: string;
  global_communities?: string;
  global_date?: string[];
  global_date_l?: string[];
  global_date_pre_free?: string[];
  global_delete?: string;
  global_delete_audio?: string;
  global_error?: string;
  global_error_occured?: string;
  global_friends?: string;
  global_head_logout?: string;
  global_hours_ago?: string[];
  global_just_now?: string;
  global_long_weeks?: string;
  global_mins_ago?: string[];
  global_money_amount_rub?: string[];
  global_news_search_results?: string;
  groups_community_onboarding_address_error?: string;
  groups_community_onboarding_confirm_continue?: string;
};
};
  langVersion?: string;
  loaderVersion?: string;
  payload?: number[];
  static?: string;
  statsMeta?: {
  hash?: string;
  id?: number;
  platform?: string;
  reloadVersion?: number;
  st?: boolean;
  time?: number;
};
  vkEnv?: string;
};

export interface PostalmarketphpRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostalmarketphpResponse = {
  env?: {
  pe?: {
  ads_legacy_routes?: number;
  ads_market_autopromotion_bookmarks_stats?: number;
  apps_show_app_slides_sheet_no_extra_closes?: number;
  audio_recoms_onboarding_entry_points?: number;
  audio_special_project_web?: number;
  audio_studio_ads_block_enabled?: number;
  avatar_component_refactor_web?: number;
  avoid_multiple_init?: number;
  await_spa_module?: number;
  beauty_wizard_redesign?: number;
  beauty_wizard_spa?: number;
  bugs_tariff_interface?: number;
  challenge_ajax_requests?: number;
  claim_fz149?: number;
  clips_fix_autoplay_legacy?: number;
  clips_web_spa_backend?: number;
  collect_ttlb?: number;
  community_authors_onboarding?: number;
  core_spa_blocking?: number;
  devadmin_splash_screen_go_uploader?: number;
  disable_push_equal_history_location?: number;
  enable_feature_toggles?: number;
  extended_static_loading_errors?: number;
  fav_dialog_with_yourself?: number;
  feed_action_button_compact_style_fix?: number;
  feed_ads_cta_secondary_link_support_web?: number;
  feed_attachemnts_fix_aspect_ratio?: number;
  feed_csrf_hash_support_web?: string;
  feed_filter_photos_sizes_wide_enough?: number;
  feed_fix_cirillic_ad_host_name?: number;
  feed_fix_empty_apply_options?: number;
  feed_fix_get_owner_console_error?: number;
  feed_fix_render_new_post?: number;
  feed_grid_photo_padding_fix?: number;
  feed_open_audio_stats_for_react?: number;
  feed_photo_market_tags?: number;
  feed_photo_market_tags_in_grid?: number;
  feed_photo_market_tags_link_wrapper?: number;
  feed_post_action_button_with_underline?: number;
  feed_post_text_persist_lines_count_on_hide?: number;
  feed_post_video_in_carousel_controls_events_block?: number;
  feed_post_video_layer_close_wkview_restore?: number;
  feed_posting_action_button_switch_fix?: number;
  feed_posting_post_preview_replace_emoji_enabled?: number;
  feed_redesign2024_new_logic_for_video_autoplay_web?: number;
  feed_redesign_2024_extract_links_from_promo_post_web?: number;
  feed_redesign_ad_data_secondary?: number;
  feed_redesign_fix_hashtag_mention?: number;
  feed_redesign_fix_mention?: number;
  feed_redesign_v3_photoview_scroll_fix?: number;
  feed_redesign_wrap_away_chip_links?: number;
  feed_remove_dispatch_global_resize?: number;
  feed_section_navigation_fix?: number;
  feed_spa_fix_get_poll_code?: number;
  feed_spa_layer_open_fix?: number;
  feed_spa_post_modal_singleton?: number;
  feed_spa_scroll_to_index?: number;
  feed_viewport_dom_post?: number;
  feed_wall_use_full_post_height_analytics_web?: number;
  fix_anonymous_reply?: number;
  fix_blocks_forcing_for_auto_test?: number;
  fix_cyrillic_in_external_plain_urls?: number;
  fix_eco_plate_navigation?: number;
  fix_frame_transport_xss?: number;
  fix_jobs_link?: number;
  flush_async?: number;
  force_act_in_get_params?: number;
  force_check_vkvideo_full_hostname_domains?: number;
  force_send_user_info?: number;
  games_catalog_spa_web_all_games_page?: number;
  games_catalog_spa_web_all_tags_page?: number;
  games_catalog_spa_web_search?: number;
  games_catalog_spa_web_tag_page?: number;
  games_send_track_visitor_activity?: number;
  global_variable_wrapper?: number;
  group_web_spa_backend?: number;
  groups_donut_icons_redesigned?: number;
  hide_notifier_errors?: number;
  im_clocks_fix?: number;
  inline_attaches_icons?: number;
};
  toggles?: {
  clips_use_features_player_web?: {
  abGroupId?: JsonValue;
};
  clips_web_convert_from_post?: {
  abGroupId?: JsonValue;
};
  com_donut_for_user?: {
  abGroupId?: JsonValue;
};
  com_main_tab?: {
  abGroupId?: JsonValue;
};
  com_market_settings_vkpay_form?: {
  abGroupId?: JsonValue;
};
  com_profile_web_tabs_mobx?: {
  abGroupId?: number;
};
  com_settings_managers?: {
  abGroupId?: JsonValue;
};
  com_settings_requests?: {
  abGroupId?: JsonValue;
};
  com_settings_subscribers?: {
  abGroupId?: JsonValue;
};
  feed_audience_research?: {
  abGroupId?: JsonValue;
};
  feed_forbid_anon_post_layer?: {
  abGroupId?: JsonValue;
};
  feed_get_feed?: {
  abGroupId?: JsonValue;
};
  feed_get_feed_secondary?: {
  abGroupId?: JsonValue;
};
  feed_image_auto_crop?: {
  abGroupId?: JsonValue;
};
  feed_legacy_attach_wrapper_fix?: {
  abGroupId?: JsonValue;
};
  feed_legacy_page_seen_ads_stat?: {
  abGroupId?: JsonValue;
};
  feed_nine_grid_update?: {
  abGroupId?: JsonValue;
};
  feed_old_share_modal_stats?: {
  abGroupId?: JsonValue;
};
  feed_photo_crop?: {
  abGroupId?: JsonValue;
};
  feed_photo_edit_only_upload?: {
  abGroupId?: JsonValue;
};
  feed_polls_spa_mobx?: {
  abGroupId?: JsonValue;
};
  feed_post_menu_on_hover_delay?: {
  abGroupId?: JsonValue;
};
  feed_posting_carousel_sort?: {
  abGroupId?: JsonValue;
};
  feed_posting_crop_for_view?: {
  abGroupId?: JsonValue;
};
  feed_posting_music_snippet?: {
  abGroupId?: JsonValue;
};
  feed_posting_new_draft?: {
  abGroupId?: JsonValue;
};
  feed_posting_new_draft_publish?: {
  abGroupId?: JsonValue;
};
  feed_posting_photo_crop?: {
  abGroupId?: JsonValue;
};
  feed_prefetch?: {
  abGroupId?: JsonValue;
};
  feed_pv_single_photo_req?: {
  abGroupId?: JsonValue;
};
  feed_spa_reactions_modal_web?: {
  abGroupId?: JsonValue;
};
  feed_spa_web?: {
  abGroupId?: JsonValue;
};
  feed_story_block_error?: {
  abGroupId?: JsonValue;
};
  feed_video_autoplay_modal_fix?: {
  abGroupId?: JsonValue;
};
  sa_ads_closing_banner?: {
  abGroupId?: JsonValue;
};
  sa_ads_interstitial_on_load?: {
  abGroupId?: JsonValue;
};
  sccm_com_new_posting_feed_web?: {
  abGroupId?: number;
};
  sccm_com_posting_button_order?: {
  abGroupId?: number;
};
  sccm_vk_tickets_posting_web?: {
  abGroupId?: JsonValue;
};
  search_all_to_mobx?: {
  abGroupId?: JsonValue;
};
  search_statuses_web_mobx?: {
  abGroupId?: JsonValue;
};
  search_top_search_mobx?: {
  abGroupId?: JsonValue;
};
  smb_tgb_new_logic_received_ads?: {
  abGroupId?: number;
};
  st_articles_audience_research?: {
  abGroupId?: JsonValue;
};
  st_audience_research?: {
  abGroupId?: JsonValue;
};
  st_web_spa_stories_viewer_2?: {
  abGroupId?: number;
};
  vas_gift_modal_spa?: {
  abGroupId?: JsonValue;
};
  vas_gift_modal_sticky_footer?: {
  abGroupId?: JsonValue;
};
  vas_limited_gifts_vkcom?: {
  abGroupId?: JsonValue;
};
  vas_stickers_my_stickers_web?: {
  abGroupId?: JsonValue;
};
  vas_web_new_gifts_send?: {
  abGroupId?: JsonValue;
};
  video_ad_paid_subscription?: {
  abGroupId?: number;
};
  video_add_playlist_search?: {
  abGroupId?: JsonValue;
};
  video_clip_analytics_enabled?: {
  abGroupId?: JsonValue;
};
  video_clip_upload_with_story?: {
  abGroupId?: JsonValue;
};
  video_dashboard_clip_bulk_edit?: {
  abGroupId?: JsonValue;
};
  video_dashboard_onboarding_ab?: {
  abGroupId?: JsonValue;
};
  video_edit_modal_delay_datafix?: {
  abGroupId?: JsonValue;
};
  video_edit_modal_fix_thumb?: {
  abGroupId?: JsonValue;
};
  video_edit_modal_privacy_fix?: {
  abGroupId?: JsonValue;
};
  video_edit_modal_sticky_footer?: {
  abGroupId?: JsonValue;
};
  video_fix_clip_unpin?: {
  abGroupId?: JsonValue;
};
  video_fix_short_video_timeline?: {
  abGroupId?: JsonValue;
};
  video_fix_thumb_changing?: {
  abGroupId?: JsonValue;
};
  video_fix_thumb_removing?: {
  abGroupId?: JsonValue;
};
  video_historical_dashboard?: {
  abGroupId?: JsonValue;
};
  video_new_edit_modal_bugfixes?: {
  abGroupId?: JsonValue;
};
  video_new_share_modal?: {
  abGroupId?: JsonValue;
};
  video_new_video_add_to_channel?: {
  abGroupId?: JsonValue;
};
  video_new_video_edit_modal?: {
  abGroupId?: JsonValue;
};
  video_playlist_season_route?: {
  abGroupId?: number;
};
  video_recom_thematic_banners?: {
  abGroupId?: number;
};
  video_short_video_edit_modal?: {
  abGroupId?: JsonValue;
};
  video_use_uv_player_on_vkcom?: {
  abGroupId?: JsonValue;
};
  video_use_uv_player_on_vkvideo?: {
  abGroupId?: JsonValue;
};
  video_web_spa_for_kids_page?: {
  abGroupId?: number;
};
  video_web_spa_mov_and_ser_page?: {
  abGroupId?: number;
};
  vkm_channels_global_search?: {
  abGroupId?: JsonValue;
};
  vkm_clip_fs_pagination_off?: {
  abGroupId?: number;
};
  vkm_clip_to_channel_button?: {
  abGroupId?: JsonValue;
};
};
};
  langKeys?: {
  global?: JsonValue[];
  local?: {
  audio_action_dislike?: string;
  audio_action_sub_sheet_additional_loading?: string;
  audio_add_to_audio?: string;
  audio_add_to_new_pl?: string;
  audio_add_to_playlist?: string;
  audio_alert_cancel_label_default?: string;
  audio_alert_confirm_label_default?: string;
  audio_claim_delete?: string;
  audio_claim_delete_capital?: string;
  audio_claim_objection?: string;
  audio_claim_warning?: string;
  audio_claim_warning_title?: string;
  audio_claimed_geo?: string;
  audio_claimed_replacement_available?: string;
  audio_copy_audio_link?: string;
  audio_legal_notice_line_foreign_agent?: string;
  audio_music_playlist_crash_placeholder_description?: string;
  audio_music_playlist_crash_placeholder_header?: string;
  audio_open_album?: string;
  audio_podcast_open_episode?: string;
  audio_replace_with_original?: string;
  audio_row_show_all_playlists?: string;
  audio_set_next_audio?: string;
  audio_share_audio?: string;
  audio_site_rules_violation_header?: string;
  audio_site_rules_violation_warning?: string;
  blank_too_many_recent_actions?: string;
  box_close?: string;
  box_send?: string;
  calls_cancel?: string;
  calls_delete?: string;
  calls_privacy_management_modal_calls_has_messages_title?: string;
  calls_privacy_management_modal_calls_in_contacts_title?: string;
  calls_privacy_management_modal_calls_nested_description?: string;
  calls_privacy_management_modal_notification_load_settings_error_message?: string;
  calls_privacy_management_modal_notification_save_error_message?: string;
  calls_privacy_management_modal_notification_save_success_message?: string;
  calls_privacy_management_modal_select_allowed_title?: string;
  calls_privacy_management_modal_select_empty_message?: string;
  calls_privacy_management_modal_select_excluded_title?: string;
  calls_privacy_management_modal_select_friends_or_lists_placeholder?: string;
  calls_privacy_management_modal_select_friends_placeholder?: string;
  calls_privacy_management_modal_select_loading_message?: string;
  calls_privacy_management_modal_select_search_error_message?: string;
  calls_privacy_management_modal_title?: string;
  calls_save?: string;
  captcha_cancel?: string;
  captcha_enter_code?: string;
  captcha_send?: string;
  global_action_confirmation?: string;
  global_apps?: string;
  global_audio_ad?: string;
  global_audio_only_with_subscription_btn?: string;
  global_audio_only_with_subscription_text?: string;
  global_audio_only_with_subscription_title?: string;
  global_back?: string;
  global_box_error_title?: string;
  global_box_title_back?: string;
  global_cancel?: string;
  global_captcha_input_here?: string;
  global_chats?: string;
  global_close?: string;
  global_communities?: string;
  global_date?: string[];
  global_date_l?: string[];
  global_date_pre_free?: string[];
  global_delete?: string;
  global_delete_audio?: string;
  global_error?: string;
  global_error_occured?: string;
  global_friends?: string;
  global_head_logout?: string;
  global_hours_ago?: string[];
  global_just_now?: string;
  global_long_weeks?: string;
  global_mins_ago?: string[];
  global_money_amount_rub?: string[];
  global_news_search_results?: string;
  global_recaptcha_title?: string;
  global_secs_ago?: string[];
};
};
  langVersion?: string;
  loaderVersion?: string;
  payload?: number[];
  static?: string;
  statsMeta?: {
  hash?: string;
  id?: number;
  platform?: string;
  reloadVersion?: number;
  st?: boolean;
  time?: number;
};
  templates?: {
  _?: string;
  stickers_sticker_url?: string;
};
  vkEnv?: string;
};

export interface PostalprofilephpRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostalprofilephpResponse = {
  langVersion?: string;
  loaderVersion?: string;
  payload?: number[];
  statsMeta?: {
  hash?: string;
  id?: number;
  platform?: string;
  reloadVersion?: number;
  st?: boolean;
  time?: number;
};
  vkEnv?: string;
};

export interface PostalticketsphpRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostalticketsphpResponse = {
  env?: {
  pe?: {
  ads_legacy_routes?: number;
  ads_market_autopromotion_bookmarks_stats?: number;
  apps_show_app_slides_sheet_no_extra_closes?: number;
  audio_recoms_onboarding_entry_points?: number;
  audio_special_project_web?: number;
  audio_studio_ads_block_enabled?: number;
  avatar_component_refactor_web?: number;
  avoid_multiple_init?: number;
  await_spa_module?: number;
  beauty_wizard_redesign?: number;
  beauty_wizard_spa?: number;
  bugs_tariff_interface?: number;
  challenge_ajax_requests?: number;
  claim_fz149?: number;
  clips_fix_autoplay_legacy?: number;
  clips_web_spa_backend?: number;
  collect_ttlb?: number;
  community_authors_onboarding?: number;
  devadmin_splash_screen_go_uploader?: number;
  disable_push_equal_history_location?: number;
  enable_feature_toggles?: number;
  extended_static_loading_errors?: number;
  fav_dialog_with_yourself?: number;
  feed_action_button_compact_style_fix?: number;
  feed_ads_cta_secondary_link_support_web?: number;
  feed_attachemnts_fix_aspect_ratio?: number;
  feed_csrf_hash_support_web?: string;
  feed_filter_photos_sizes_wide_enough?: number;
  feed_fix_cirillic_ad_host_name?: number;
  feed_fix_empty_apply_options?: number;
  feed_fix_get_owner_console_error?: number;
  feed_fix_render_new_post?: number;
  feed_grid_photo_padding_fix?: number;
  feed_open_audio_stats_for_react?: number;
  feed_photo_market_tags?: number;
  feed_photo_market_tags_in_grid?: number;
  feed_photo_market_tags_link_wrapper?: number;
  feed_post_action_button_with_underline?: number;
  feed_post_text_persist_lines_count_on_hide?: number;
  feed_post_video_in_carousel_controls_events_block?: number;
  feed_post_video_layer_close_wkview_restore?: number;
  feed_posting_action_button_switch_fix?: number;
  feed_posting_post_preview_replace_emoji_enabled?: number;
  feed_redesign2024_new_logic_for_video_autoplay_web?: number;
  feed_redesign_2024_extract_links_from_promo_post_web?: number;
  feed_redesign_ad_data_secondary?: number;
  feed_redesign_fix_hashtag_mention?: number;
  feed_redesign_fix_mention?: number;
  feed_redesign_v3_photoview_scroll_fix?: number;
  feed_redesign_wrap_away_chip_links?: number;
  feed_remove_dispatch_global_resize?: number;
  feed_section_navigation_fix?: number;
  feed_spa_fix_get_poll_code?: number;
  feed_spa_layer_open_fix?: number;
  feed_spa_post_modal_singleton?: number;
  feed_spa_scroll_to_index?: number;
  feed_viewport_dom_post?: number;
  feed_wall_use_full_post_height_analytics_web?: number;
  fix_anonymous_reply?: number;
  fix_blocks_forcing_for_auto_test?: number;
  fix_cyrillic_in_external_plain_urls?: number;
  fix_eco_plate_navigation?: number;
  fix_frame_transport_xss?: number;
  fix_jobs_link?: number;
  flush_async?: number;
  force_act_in_get_params?: number;
  force_check_vkvideo_full_hostname_domains?: number;
  force_send_user_info?: number;
  games_catalog_spa_web_all_games_page?: number;
  games_catalog_spa_web_all_tags_page?: number;
  games_catalog_spa_web_search?: number;
  games_catalog_spa_web_tag_page?: number;
  games_send_track_visitor_activity?: number;
  global_variable_wrapper?: number;
  group_web_spa_backend?: number;
  groups_donut_icons_redesigned?: number;
  hide_notifier_errors?: number;
  im_clocks_fix?: number;
  inline_attaches_icons?: number;
  langs_entrypoints_cache?: number;
};
  toggles?: {
  clips_use_features_player_web?: {
  abGroupId?: JsonValue;
};
  clips_web_convert_from_post?: {
  abGroupId?: JsonValue;
};
  com_donut_for_user?: {
  abGroupId?: JsonValue;
};
  com_main_tab?: {
  abGroupId?: JsonValue;
};
  com_market_settings_vkpay_form?: {
  abGroupId?: JsonValue;
};
  com_profile_web_tabs_mobx?: {
  abGroupId?: number;
};
  com_settings_managers?: {
  abGroupId?: JsonValue;
};
  com_settings_requests?: {
  abGroupId?: JsonValue;
};
  com_settings_subscribers?: {
  abGroupId?: JsonValue;
};
  feed_audience_research?: {
  abGroupId?: JsonValue;
};
  feed_forbid_anon_post_layer?: {
  abGroupId?: JsonValue;
};
  feed_get_feed?: {
  abGroupId?: JsonValue;
};
  feed_get_feed_secondary?: {
  abGroupId?: JsonValue;
};
  feed_image_auto_crop?: {
  abGroupId?: JsonValue;
};
  feed_legacy_attach_wrapper_fix?: {
  abGroupId?: JsonValue;
};
  feed_legacy_page_seen_ads_stat?: {
  abGroupId?: JsonValue;
};
  feed_nine_grid_update?: {
  abGroupId?: JsonValue;
};
  feed_old_share_modal_stats?: {
  abGroupId?: JsonValue;
};
  feed_photo_crop?: {
  abGroupId?: JsonValue;
};
  feed_photo_edit_only_upload?: {
  abGroupId?: JsonValue;
};
  feed_polls_spa_mobx?: {
  abGroupId?: JsonValue;
};
  feed_post_menu_on_hover_delay?: {
  abGroupId?: JsonValue;
};
  feed_posting_carousel_sort?: {
  abGroupId?: JsonValue;
};
  feed_posting_crop_for_view?: {
  abGroupId?: JsonValue;
};
  feed_posting_music_snippet?: {
  abGroupId?: JsonValue;
};
  feed_posting_new_draft?: {
  abGroupId?: JsonValue;
};
  feed_posting_new_draft_publish?: {
  abGroupId?: JsonValue;
};
  feed_posting_photo_crop?: {
  abGroupId?: JsonValue;
};
  feed_prefetch?: {
  abGroupId?: JsonValue;
};
  feed_pv_single_photo_req?: {
  abGroupId?: JsonValue;
};
  feed_spa_reactions_modal_web?: {
  abGroupId?: JsonValue;
};
  feed_spa_web?: {
  abGroupId?: JsonValue;
};
  feed_story_block_error?: {
  abGroupId?: JsonValue;
};
  feed_video_autoplay_modal_fix?: {
  abGroupId?: JsonValue;
};
  sa_ads_closing_banner?: {
  abGroupId?: JsonValue;
};
  sa_ads_interstitial_on_load?: {
  abGroupId?: JsonValue;
};
  sccm_com_new_posting_feed_web?: {
  abGroupId?: number;
};
  sccm_com_posting_button_order?: {
  abGroupId?: number;
};
  sccm_vk_tickets_posting_web?: {
  abGroupId?: JsonValue;
};
  search_all_to_mobx?: {
  abGroupId?: JsonValue;
};
  search_statuses_web_mobx?: {
  abGroupId?: JsonValue;
};
  search_top_search_mobx?: {
  abGroupId?: JsonValue;
};
  smb_tgb_new_logic_received_ads?: {
  abGroupId?: number;
};
  st_articles_audience_research?: {
  abGroupId?: JsonValue;
};
  st_audience_research?: {
  abGroupId?: JsonValue;
};
  st_web_spa_stories_viewer_2?: {
  abGroupId?: number;
};
  vas_gift_modal_spa?: {
  abGroupId?: JsonValue;
};
  vas_gift_modal_sticky_footer?: {
  abGroupId?: JsonValue;
};
  vas_limited_gifts_vkcom?: {
  abGroupId?: JsonValue;
};
  vas_stickers_my_stickers_web?: {
  abGroupId?: JsonValue;
};
  vas_web_new_gifts_send?: {
  abGroupId?: JsonValue;
};
  video_ad_paid_subscription?: {
  abGroupId?: number;
};
  video_add_playlist_search?: {
  abGroupId?: JsonValue;
};
  video_clip_analytics_enabled?: {
  abGroupId?: JsonValue;
};
  video_clip_upload_with_story?: {
  abGroupId?: JsonValue;
};
  video_dashboard_clip_bulk_edit?: {
  abGroupId?: JsonValue;
};
  video_dashboard_onboarding_ab?: {
  abGroupId?: JsonValue;
};
  video_edit_modal_delay_datafix?: {
  abGroupId?: JsonValue;
};
  video_edit_modal_fix_thumb?: {
  abGroupId?: JsonValue;
};
  video_edit_modal_privacy_fix?: {
  abGroupId?: JsonValue;
};
  video_edit_modal_sticky_footer?: {
  abGroupId?: JsonValue;
};
  video_fix_clip_unpin?: {
  abGroupId?: JsonValue;
};
  video_fix_short_video_timeline?: {
  abGroupId?: JsonValue;
};
  video_fix_thumb_changing?: {
  abGroupId?: JsonValue;
};
  video_fix_thumb_removing?: {
  abGroupId?: JsonValue;
};
  video_historical_dashboard?: {
  abGroupId?: JsonValue;
};
  video_new_edit_modal_bugfixes?: {
  abGroupId?: JsonValue;
};
  video_new_share_modal?: {
  abGroupId?: JsonValue;
};
  video_new_video_add_to_channel?: {
  abGroupId?: JsonValue;
};
  video_new_video_edit_modal?: {
  abGroupId?: JsonValue;
};
  video_playlist_season_route?: {
  abGroupId?: number;
};
  video_recom_thematic_banners?: {
  abGroupId?: number;
};
  video_short_video_edit_modal?: {
  abGroupId?: JsonValue;
};
  video_use_uv_player_on_vkcom?: {
  abGroupId?: JsonValue;
};
  video_use_uv_player_on_vkvideo?: {
  abGroupId?: JsonValue;
};
  video_web_spa_for_kids_page?: {
  abGroupId?: number;
};
  video_web_spa_mov_and_ser_page?: {
  abGroupId?: number;
};
  vkm_channels_global_search?: {
  abGroupId?: JsonValue;
};
  vkm_clip_fs_pagination_off?: {
  abGroupId?: number;
};
  vkm_clip_to_channel_button?: {
  abGroupId?: JsonValue;
};
};
};
  langKeys?: {
  global?: JsonValue[];
  local?: {
  audio_action_dislike?: string;
  audio_action_sub_sheet_additional_loading?: string;
  audio_add_to_audio?: string;
  audio_add_to_new_pl?: string;
  audio_add_to_playlist?: string;
  audio_alert_cancel_label_default?: string;
  audio_alert_confirm_label_default?: string;
  audio_claim_delete?: string;
  audio_claim_delete_capital?: string;
  audio_claim_objection?: string;
  audio_claim_warning?: string;
  audio_claim_warning_title?: string;
  audio_claimed_geo?: string;
  audio_claimed_replacement_available?: string;
  audio_copy_audio_link?: string;
  audio_legal_notice_line_foreign_agent?: string;
  audio_music_playlist_crash_placeholder_description?: string;
  audio_music_playlist_crash_placeholder_header?: string;
  audio_open_album?: string;
  audio_podcast_open_episode?: string;
  audio_replace_with_original?: string;
  audio_row_show_all_playlists?: string;
  audio_set_next_audio?: string;
  audio_share_audio?: string;
  audio_site_rules_violation_header?: string;
  audio_site_rules_violation_warning?: string;
  blank_too_many_recent_actions?: string;
  box_close?: string;
  box_send?: string;
  calls_cancel?: string;
  calls_delete?: string;
  calls_privacy_management_modal_calls_has_messages_title?: string;
  calls_privacy_management_modal_calls_in_contacts_title?: string;
  calls_privacy_management_modal_calls_nested_description?: string;
  calls_privacy_management_modal_notification_load_settings_error_message?: string;
  calls_privacy_management_modal_notification_save_error_message?: string;
  calls_privacy_management_modal_notification_save_success_message?: string;
  calls_privacy_management_modal_select_allowed_title?: string;
  calls_privacy_management_modal_select_empty_message?: string;
  calls_privacy_management_modal_select_excluded_title?: string;
  calls_privacy_management_modal_select_friends_or_lists_placeholder?: string;
  calls_privacy_management_modal_select_friends_placeholder?: string;
  calls_privacy_management_modal_select_loading_message?: string;
  calls_privacy_management_modal_select_search_error_message?: string;
  calls_privacy_management_modal_title?: string;
  calls_save?: string;
  captcha_cancel?: string;
  captcha_enter_code?: string;
  captcha_send?: string;
  global_action_confirmation?: string;
  global_apps?: string;
  global_audio_ad?: string;
  global_audio_only_with_subscription_btn?: string;
  global_audio_only_with_subscription_text?: string;
  global_audio_only_with_subscription_title?: string;
  global_back?: string;
  global_box_error_title?: string;
  global_box_title_back?: string;
  global_cancel?: string;
  global_captcha_input_here?: string;
  global_chats?: string;
  global_close?: string;
  global_communities?: string;
  global_date?: string[];
  global_date_l?: string[];
  global_date_pre_free?: string[];
  global_delete?: string;
  global_delete_audio?: string;
  global_error?: string;
  global_error_occured?: string;
  global_friends?: string;
  global_head_logout?: string;
  global_hours_ago?: string[];
  global_just_now?: string;
  global_long_weeks?: string;
  global_mins_ago?: string[];
  global_money_amount_rub?: string[];
  global_news_search_results?: string;
  global_recaptcha_title?: string;
  global_secs_ago?: string[];
};
};
  langVersion?: string;
  loaderVersion?: string;
  payload?: number[];
  static?: string;
  statsMeta?: {
  hash?: string;
  id?: number;
  platform?: string;
  reloadVersion?: number;
  st?: boolean;
  time?: number;
};
  templates?: {
  _?: string;
  stickers_sticker_url?: string;
};
  vkEnv?: string;
};

export interface PostfbdoRequest extends RequestOptions {
  body?: { [key: string]: JsonValue };
}
export type PostfbdoResponse = {
  activated_profile?: boolean;
  api_server?: string;
  session_key?: string;
  session_secret_key?: string;
  uid?: string;
};

export interface GetimagesgiftbyidanimationjsonRequest extends RequestOptions {
}
export type GetimagesgiftbyidanimationjsonResponse = {
  assets?: JsonValue[];
  ddd?: number;
  fr?: number;
  h?: number;
  ip?: number;
  layers?: {
  ao?: number;
  bm?: number;
  ct?: number;
  ddd?: number;
  ind?: number;
  ip?: number;
  ks?: {
  a?: {
  a?: number;
  k?: number[];
  l?: number;
};
  o?: {
  a?: number;
  k?: number;
};
  p?: {
  a?: number;
  k?: {
  i?: {
  x?: number;
  y?: number;
};
  o?: {
  x?: number;
  y?: number;
};
  s?: number[];
  t?: number;
  ti?: number[];
  to?: number[];
}[];
  l?: number;
};
  r?: {
  a?: number;
  k?: {
  i?: {
  x?: number[];
  y?: number[];
};
  o?: {
  x?: number[];
  y?: number[];
};
  s?: number[];
  t?: number;
}[];
};
  s?: {
  a?: number;
  k?: number[];
  l?: number;
};
};
  op?: number;
  parent?: number;
  shapes?: {
  bm?: number;
  it?: {
  ind?: number;
  ks?: {
  a?: number;
  k?: {
  i?: {
  x?: number;
  y?: number;
};
  o?: {
  x?: number;
  y?: number;
};
  s?: {
  c?: boolean;
  i?: number[][];
  o?: number[][];
  v?: number[][];
}[];
  t?: number;
}[];
};
  ty?: string;
}[];
  ty?: string;
}[];
  sr?: number;
  st?: number;
  ty?: number;
}[];
  markers?: JsonValue[];
  op?: number;
  props?: { [key: string]: JsonValue };
  v?: string;
  w?: number;
};

export interface PostmethodaccountgetinfoRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodaccountgetinfoResponse = {
  response?: {
  audio_permissions?: {
  audio_meta_info?: boolean;
};
  community_comments?: boolean;
  obscene_text_filter?: boolean;
  settings?: {
  available?: boolean;
  forced?: boolean;
  name?: string;
  value?: string;
}[];
};
};

export interface PostmethodaccountgetprofiledatalegacyRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodaccountgetprofiledatalegacyResponse = {
  response?: {
  avatar_edit_hash?: string;
  cvbp?: boolean;
  cvmbm?: boolean;
  is_gif_autoplay_enabled?: boolean;
  is_video_autoplay_enabled?: boolean;
  market_analytics?: {
  hash?: string;
  is_enabled?: boolean;
};
  toggle_broadcast_hash?: string;
};
};

export interface PostmethodappwidgetsgetRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodappwidgetsgetResponse = {
  response?: {
  privacy?: string;
  privacy_code?: number;
  type?: number;
};
};

export interface PostmethodcataloggetclassifiedsRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodcataloggetclassifiedsResponse = {
  response?: {
  catalog?: {
  default_section?: string;
  header?: {
  blocks?: {
  classifieds_city_ids?: string[];
  data_type?: string;
  id?: string;
  layout?: {
  name?: string;
};
  navigation_tab_ids?: string[];
  track_code?: string;
}[];
};
  sections?: {
  blocks?: {
  classifieds_city_ids?: string[];
  data_type?: string;
  id?: string;
  layout?: {
  name?: string;
};
  track_code?: string;
}[];
  breadcrumbs?: {
  label?: string;
}[];
  id?: string;
  next_from?: string;
  title?: string;
  url?: string;
}[];
};
  classifieds_category_tree?: {
  children?: {
  icon?: {
  height?: number;
  url?: string;
  width?: number;
}[];
  icon_name?: string;
  id?: number;
  name?: string;
  url?: string;
}[];
  id?: number;
  name?: string;
}[];
  classifieds_cities?: {
  id?: string;
  latitude?: string;
  longitude?: string;
  name?: string;
  vk_id?: number;
}[];
  groups?: {
  activity?: string;
  can_see_members?: boolean;
  friends?: {
  count?: number;
  preview?: JsonValue[];
  preview_profiles?: JsonValue[];
};
  id?: number;
  is_admin?: number;
  is_advertiser?: number;
  is_closed?: number;
  is_member?: number;
  members_count?: number;
  name?: string;
  photo_400?: string;
  photo_50?: string;
  photo_base?: string;
  screen_name?: string;
  type?: string;
  verified?: number;
}[];
  market_items?: {
  availability?: number;
  badges?: {
  bkg_color?: number;
  bkg_color_dark?: number;
  subtype?: number;
  text?: string;
  text_color?: number;
  text_color_dark?: number;
  tooltip_footer?: string;
  tooltip_header?: string;
  tooltip_text?: string;
  type?: number;
}[];
  category?: {
  id?: number;
  inner_type?: string;
  is_v2?: boolean;
  name?: string;
  parent?: {
  id?: number;
  inner_type?: string;
  is_v2?: boolean;
  name?: string;
  parent?: {
  id?: number;
  inner_type?: string;
  is_v2?: boolean;
  name?: string;
  parent?: {
  id?: number;
  inner_type?: string;
  is_v2?: boolean;
  name?: string;
};
};
};
};
  csrf_hashes?: string;
  description?: string;
  external_id?: string;
  has_group_access?: boolean;
  id?: number;
  is_adult?: boolean;
  is_hardblocked?: boolean;
  is_owner?: boolean;
  item_type?: number;
  market_url?: string;
  owner_id?: number;
  price?: {
  amount?: string;
  currency?: {
  id?: number;
  name?: string;
  title?: string;
};
  discount_rate?: number;
  loyalty_amount?: string;
  loyalty_amount_text?: string;
  old_amount?: string;
  old_amount_text?: string;
  price_type?: number;
  price_unit?: number;
  text?: string;
};
  seo_description?: string;
  seo_slug?: string;
  seo_title?: string;
  sku?: string;
  thumb?: {
  height?: number;
  url?: string;
  width?: number;
}[];
  thumb_photo?: string;
  title?: string;
}[];
  navigation_tabs?: {
  category_id?: number;
  category_tree_id?: number;
  icons?: {
  height?: number;
  url?: string;
  width?: number;
}[];
  id?: string;
  is_featured?: boolean;
  root_category_id?: number;
  target_section_id?: string;
  target_url?: string;
  title?: string;
  type?: string;
}[];
};
};

export interface PostmethodcataloggetgroupsRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodcataloggetgroupsResponse = {
  response?: {
  catalog?: {
  default_section?: string;
  sections?: {
  blocks?: {
  badge?: {
  text?: string;
  type?: string;
};
  data_type?: string;
  id?: string;
  layout?: {
  name?: string;
  title?: string;
};
  title?: string;
}[];
  breadcrumbs?: {
  label?: string;
}[];
  id?: string;
  next_from?: string;
  title?: string;
  url?: string;
}[];
};
  groups?: {
  activity?: string;
  addresses?: {
  count?: number;
  is_enabled?: boolean;
  main_address?: {
  address?: string;
  city?: {
  id?: number;
  title?: string;
};
  country?: {
  id?: number;
  title?: string;
};
  id?: number;
  title?: string;
  work_info_status?: string;
};
  main_address_id?: string;
};
  cover?: {
  enabled?: number;
  images?: {
  height?: number;
  url?: string;
  width?: number;
}[];
};
  friends?: {
  count?: number;
  preview?: number[];
  preview_profiles?: {
  first_name?: string;
  photo_100?: string;
  photo_200?: string;
  photo_50?: string;
  photo_base?: string;
}[];
};
  has_live_cover?: boolean;
  has_stories?: boolean;
  has_unseen_stories?: boolean;
  id?: number;
  is_admin?: number;
  is_advertiser?: number;
  is_closed?: number;
  is_favorite?: number;
  is_government_organization?: boolean;
  is_member?: number;
  is_subscribed?: number;
  member_status?: number;
  members_count?: number;
  members_count_text?: string;
  name?: string;
  photo_100?: string;
  photo_200?: string;
  photo_400?: string;
  photo_50?: string;
  photo_avg_color?: string;
  photo_base?: string;
  screen_name?: string;
  trending?: number;
  trust_mark?: number;
  type?: string;
  using_vkpay_market_app?: boolean;
  verified?: number;
  video_lives_data?: {
  has_badge?: boolean;
  has_live_block?: boolean;
};
}[];
  profiles?: {
  activity?: string;
  can_access_closed?: boolean;
  cover?: {
  enabled?: number;
};
  donut?: {
  goals?: boolean;
  is_available?: boolean;
  one_time?: boolean;
  regular?: boolean;
};
  first_name?: string;
  has_unseen_stories?: boolean;
  id?: number;
  is_closed?: boolean;
  is_favorite?: number;
  is_subscribed?: number;
  last_name?: string;
  photo_100?: string;
  photo_200?: string;
  photo_400?: string;
  photo_50?: string;
  photo_avg_color?: string;
  photo_base?: string;
  trending?: number;
  verified?: number;
}[];
};
};

export interface PostmethodcataloggetsectionRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodcataloggetsectionResponse = {
  response?: {
  groups?: {
  activity?: string;
  addresses?: {
  has_addresses?: boolean;
  is_enabled?: boolean;
};
  cover?: {
  enabled?: number;
  images?: {
  height?: number;
  url?: string;
  width?: number;
}[];
};
  friends?: {
  count?: number;
  preview?: number[];
  preview_profiles?: {
  first_name?: string;
  photo_100?: string;
  photo_200?: string;
  photo_50?: string;
  photo_base?: string;
}[];
};
  has_live_cover?: boolean;
  has_stories?: boolean;
  has_unseen_stories?: boolean;
  id?: number;
  is_admin?: number;
  is_advertiser?: number;
  is_closed?: number;
  is_favorite?: number;
  is_government_organization?: boolean;
  is_member?: number;
  is_subscribed?: number;
  member_status?: number;
  members_count?: number;
  members_count_text?: string;
  name?: string;
  photo_100?: string;
  photo_200?: string;
  photo_400?: string;
  photo_50?: string;
  photo_avg_color?: string;
  photo_base?: string;
  screen_name?: string;
  trending?: number;
  trust_mark?: number;
  type?: string;
  using_vkpay_market_app?: boolean;
  verified?: number;
  video_lives_data?: {
  has_badge?: boolean;
  has_live_block?: boolean;
};
}[];
  section?: {
  blocks?: {
  actions?: {
  action?: {
  style?: string;
  target?: string;
  type?: string;
  url?: string;
};
  ref_data_type?: string;
  ref_items_count?: number;
  ref_layout_name?: string;
  section_id?: string;
  title?: string;
}[];
  data_type?: string;
  id?: string;
  layout?: {
  name?: string;
  title?: string;
};
  title?: string;
}[];
  breadcrumbs?: {
  label?: string;
}[];
  id?: string;
  next_from?: string;
  title?: string;
  url?: string;
};
};
};

export interface PostmethoddatabasegetcitiesRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethoddatabasegetcitiesResponse = {
  response?: {
  count?: number;
  items?: {
  id?: number;
  important?: number;
  title?: string;
}[];
};
};

export interface PostmethoddocsgetRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethoddocsgetResponse = {
  response?: {
  count?: number;
  items?: {
  can_manage?: boolean;
  date?: number;
  ext?: string;
  folder_id?: number;
  id?: number;
  is_licensed?: number;
  is_unsafe?: number;
  owner_id?: number;
  preview?: {
  photo?: {
  sizes?: {
  height?: number;
  src?: string;
  type?: string;
  width?: number;
}[];
};
};
  private_url?: string;
  size?: number;
  tags?: JsonValue[];
  title?: string;
  type?: number;
  url?: string;
}[];
  total_count?: number;
};
};

export interface PostmethoddonutgetinfoRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethoddonutgetinfoResponse = {
  response?: {
  group_donut_block?: {
  regular_support?: {
  accessibility_subtitle?: string;
  action_button?: {
  action?: {
  target?: string;
  type?: string;
  url?: string;
};
  title?: string;
};
  subtitle?: string;
  title?: string;
};
  settings_button?: {
  action?: {
  target?: string;
  type?: string;
  url?: string;
};
  title?: string;
};
  title?: string;
};
};
};

export interface PostmethodfriendsgetcountersRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodfriendsgetcountersResponse = {
  response?: {
  all_requests?: number;
  not_viewed_requests?: number;
  out_requests?: number;
};
};

export interface PostmethodfriendsgetlistsRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodfriendsgetlistsResponse = {
  response?: {
  count?: number;
  items?: {
  id?: number;
  name?: string;
}[];
};
};

export interface PostmethodmarketgetcountersRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodmarketgetcountersResponse = {
  response?: {
  single_cart_items_count?: number;
};
};

export interface PostmethodnewsfeedgetfeedRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodnewsfeedgetfeedResponse = {
  response?: {
  feed_type?: string;
  groups?: {
  can_message?: number;
  has_unseen_stories?: boolean;
  id?: number;
  is_admin?: number;
  is_advertiser?: number;
  is_closed?: number;
  is_government_organization?: boolean;
  is_member?: number;
  member_status?: number;
  name?: string;
  photo_100?: string;
  photo_200?: string;
  photo_base?: string;
  screen_name?: string;
  trust_mark?: number;
  type?: string;
  url?: string;
  verified?: number;
  video_lives_data?: {
  has_badge?: boolean;
  has_live_block?: boolean;
};
}[];
  items?: {
  attachments?: {
  photo?: {
  access_key?: string;
  album_id?: number;
  date?: number;
  has_tags?: boolean;
  id?: number;
  orig_photo?: {
  height?: number;
  type?: string;
  url?: string;
  width?: number;
};
  owner_id?: number;
  sizes?: {
  height?: number;
  type?: string;
  url?: string;
  width?: number;
}[];
  tags?: {
  count?: number;
};
  text?: string;
  user_id?: number;
  web_view_token?: string;
};
  style?: string;
  type?: string;
}[];
  attachments_meta?: {
  carousel_ratio?: number;
  primary_mode?: string;
  ratio?: number;
};
  badges?: {
  id?: number;
  owner_id?: number;
  type?: number;
};
  can_ignore?: boolean;
  caption?: {
  can_hide_post?: boolean;
  text?: string;
  type?: string;
};
  carousel_offset?: number;
  comments?: {
  can_post?: number;
  can_view?: number;
  count?: number;
  groups_can_post?: boolean;
};
  compact_attachments_before_cut?: number;
  date?: number;
  donut?: {
  is_donut?: boolean;
};
  header?: {
  descriptions?: JsonValue[];
  photo?: {
  source_id?: number;
};
  title?: {
  source_id?: number;
};
};
  id?: number;
  inner_type?: string;
  is_favorite?: boolean;
  likes?: {
  can_like?: number;
  can_publish?: number;
  count?: number;
  repost_disabled?: boolean;
  user_likes?: number;
};
  marked_as_ads?: number;
  owner_id?: number;
  post_id?: number;
  post_source?: {
  type?: string;
};
  post_type?: string;
  reaction_set_id?: string;
  reactions?: {
  count?: number;
  items?: {
  count?: number;
  id?: number;
}[];
};
  reposts?: {
  count?: number;
  user_reposted?: number;
};
  research?: {
  events?: {
  item_id?: string;
  source_id?: number;
}[];
  urls?: string[];
};
  source_id?: number;
  suggest_subscribe?: boolean;
  text?: string;
  track_code?: string;
  type?: string;
  views?: {
  count?: number;
};
}[];
  next_from?: string;
  page_size?: number;
  profiles?: {
  can_access_closed?: boolean;
  can_write_private_message?: number;
  first_name?: string;
  first_name_gen?: string;
  friend_status?: number;
  has_unseen_stories?: boolean;
  id?: number;
  is_closed?: boolean;
  is_service?: boolean;
  is_verified?: boolean;
  last_name?: string;
  last_name_gen?: string;
  photo_100?: string;
  photo_200?: string;
  photo_base?: string;
  screen_name?: string;
  sex?: number;
  social_button_type?: string;
  verified?: number;
}[];
  reaction_sets?: {
  id?: string;
  items?: {
  asset?: {
  animation_url?: string;
  images?: {
  height?: number;
  url?: string;
  width?: number;
}[];
  title?: {
  color?: {
  background?: {
  dark?: string;
  light?: string;
};
  foreground?: {
  dark?: string;
  light?: string;
};
};
};
  title_color?: {
  dark?: string;
  light?: string;
};
};
  id?: number;
  title?: string;
}[];
}[];
};
};

export interface PostmethodonboardinggetRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodonboardinggetResponse = {
  response?: JsonValue[];
};

export interface PostmethodonboardinggetcardsRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodonboardinggetcardsResponse = {
  response?: {
  count?: number;
  items?: JsonValue[];
};
};

export interface PostmethodpaymentsgetactivetabsRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodpaymentsgetactivetabsResponse = {
  response?: {
  app_orders?: boolean;
  donuts_subscriptions?: boolean;
  p2p_transfers?: boolean;
  subscriptions?: boolean;
  votes?: boolean;
};
};

export interface PostmethodpaymentsgetvoteshistoryRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodpaymentsgetvoteshistoryResponse = {
  response?: {
  count?: number;
  items?: {
  id?: string;
  price?: {
  amount?: number;
  currency_id?: string;
  type?: string;
};
  record_type?: string;
  timestamp?: number;
}[];
};
};

export interface PostmethodphotosgetalbumsRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodphotosgetalbumsResponse = {
  response?: {
  count?: number;
  items?: {
  can_delete?: boolean;
  can_include_to_feed?: boolean;
  feed_disabled?: number;
  feed_has_pinned?: number;
  id?: number;
  is_locked?: boolean;
  owner_id?: number;
  privacy_view?: {
  category?: string;
};
  size?: number;
  sizes?: {
  height?: number;
  src?: string;
  type?: string;
  url?: string;
  width?: number;
}[];
  thumb_id?: number;
  title?: string;
}[];
};
};

export interface PostmethodstatstrackeventsRequest extends RequestOptions {
  body?: { [key: string]: JsonValue };
}
export type PostmethodstatstrackeventsResponse = {
  response?: number;
};

export interface PostmethodstoriesgetRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodstoriesgetResponse = JsonValue;

export interface PostmethodutilsresolvescreennameRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodutilsresolvescreennameResponse = {
  response?: {
  object_id?: number;
  type?: string;
};
};

export interface PostmethodvideofeedvideosforyoublockitemsRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodvideofeedvideosforyoublockitemsResponse = {
  response?: {
  button?: {
  action?: {
  target?: string;
  type?: string;
  url?: string;
};
  title?: string;
};
  date?: number;
  groups?: {
  id?: number;
  is_admin?: number;
  is_advertiser?: number;
  is_closed?: number;
  is_member?: number;
  members_count?: number;
  name?: string;
  photo_100?: string;
  photo_200?: string;
  photo_50?: string;
  photo_base?: string;
  screen_name?: string;
  type?: string;
  verified?: number;
}[];
  items?: {
  action_button?: {
  id?: string;
  snippet?: {
  description?: string;
  image?: {
  height?: number;
  url?: string;
  width?: number;
}[];
  open_title?: string;
  title?: string;
  type_name?: string;
};
  type?: string;
  url?: string;
};
  added?: number;
  ads?: {
  autoplay_preroll?: number;
  can_play?: number;
  midroll_percents?: number[];
  params?: {
  _SITEID?: number;
  ad_nav_screen?: string;
  child_mode?: boolean;
  child_profile?: boolean;
  duration?: number;
  groupId?: number;
  is_xz_video?: number;
  lang?: number;
  sign?: string;
  video_id?: string;
  vk_catid?: number;
  vk_content_mark_ids?: number[];
  vk_id?: number;
};
  sections?: string[];
  slot_id?: number;
  timeout?: number;
};
  can_add?: number;
  can_add_to_faves?: number;
  can_comment?: number;
  can_dislike?: number;
  can_download?: number;
  can_like?: number;
  can_play_in_background?: number;
  can_repost?: number;
  can_subscribe?: number;
  comments?: number;
  date?: number;
  description?: string;
  direct_url?: string;
  download?: {
  can_download_for_offline_view?: boolean;
  can_download_to_device?: boolean;
  unavailable_for_offline_view?: string;
};
  duration?: number;
  files?: {
  dash_sep?: string;
  failover_host?: string;
  hls?: string;
  hls_fmp4?: string;
  mp4_144?: string;
  mp4_240?: string;
  mp4_360?: string;
};
  first_frame?: {
  height?: number;
  url?: string;
  width?: number;
}[];
  has_subtitles?: number;
  height?: number;
  id?: number;
  image?: {
  height?: number;
  url?: string;
  width?: number;
  with_padding?: number;
}[];
  is_favorite?: boolean;
  likes?: {
  count?: number;
  user_likes?: number;
};
  local_views?: number;
  need_mediascope_stat?: boolean;
  ov_id?: string;
  owner_id?: number;
  player?: string;
  reposts?: {
  count?: number;
  user_reposted?: number;
};
  response_type?: string;
  share_url?: string;
  stats_pixels?: {
  event?: string;
  url?: string;
}[];
  subtitles?: {
  is_auto?: boolean;
  lang?: string;
  manifest_name?: string;
  storage_index?: number;
  title?: string;
  url?: string;
}[];
  target?: string;
  timeline_thumbs?: {
  count_per_image?: number;
  count_per_row?: number;
  count_total?: number;
  frame_height?: number;
  frame_width?: number;
  frequency?: number;
  is_uv?: boolean;
  links?: string[];
};
  title?: string;
  track_code?: string;
  tracking_info?: {
  navigation?: {
  source_block?: string;
  source_prev_screen?: string;
  source_screen?: string;
};
  recom_info?: {
  feature_sampling_uuid?: string;
  recom_sources?: number[];
};
  search_info?: {
  search_iid?: number;
  search_query_id?: string;
};
};
  trailer?: {
  mp4_240?: string;
  mp4_360?: string;
};
  type?: string;
  viewed_duration?: number;
  views?: number;
  wall_post_id?: number;
  width?: number;
}[];
  source_id?: number;
  title?: string;
};
};

export interface PostmethodvmojigetavatarRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodvmojigetavatarResponse = {
  response?: JsonValue[];
};

export interface PostmethodwallgetRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodwallgetResponse = {
  response?: {
  count?: number;
  groups?: JsonValue[];
  items?: {
  attachments?: {
  meta?: {
  info_enabled?: boolean;
  layout?: string;
};
  style?: string;
  type?: string;
  video?: {
  access_key?: string;
  can_add?: number;
  can_add_to_faves?: number;
  can_attach_link?: number;
  can_comment?: number;
  can_delete?: number;
  can_dislike?: number;
  can_edit?: number;
  can_edit_privacy?: number;
  can_like?: number;
  can_repost?: number;
  comments?: number;
  date?: number;
  description?: string;
  duration?: number;
  first_frame?: {
  height?: number;
  url?: string;
  width?: number;
}[];
  height?: number;
  id?: number;
  image?: {
  height?: number;
  url?: string;
  width?: number;
  with_padding?: number;
}[];
  is_author?: boolean;
  is_favorite?: boolean;
  local_views?: number;
  owner_id?: number;
  response_type?: string;
  should_stretch?: boolean;
  title?: string;
  track_code?: string;
  tracking_info?: {
  navigation?: {
  source_block?: string;
  source_prev_screen?: string;
  source_screen?: string;
};
  recom_info?: {
  feature_sampling_uuid?: string;
  recom_sources?: JsonValue[];
};
  search_info?: {
  search_iid?: number;
  search_query_id?: string;
};
};
  type?: string;
  views?: number;
  wall_post_id?: number;
  width?: number;
};
}[];
  attachments_meta?: {
  carousel_ratio?: number;
  primary_mode?: string;
  ratio?: number;
};
  badges?: {
  id?: number;
  owner_id?: number;
  type?: number;
};
  can_archive?: boolean;
  can_delete?: number;
  can_pin?: number;
  can_view_stats?: number;
  comments?: {
  can_close?: number;
  can_post?: number;
  can_view?: number;
  count?: number;
  groups_can_post?: boolean;
};
  compact_attachments_before_cut?: number;
  date?: number;
  donut?: {
  is_donut?: boolean;
};
  from_id?: number;
  hash?: string;
  header?: {
  descriptions?: JsonValue[];
  photo?: {
  source_id?: number;
};
  title?: {
  source_id?: number;
};
};
  id?: number;
  inner_type?: string;
  is_archived?: boolean;
  is_favorite?: boolean;
  is_pinned?: number;
  likes?: {
  can_like?: number;
  can_publish?: number;
  count?: number;
  repost_disabled?: boolean;
  user_likes?: number;
};
  marked_as_ads?: number;
  owner_id?: number;
  post_source?: {
  type?: string;
};
  post_type?: string;
  reaction_set_id?: string;
  reactions?: {
  count?: number;
  items?: {
  count?: number;
  id?: number;
}[];
};
  reposts?: {
  count?: number;
  mail_count?: number;
  user_reposted?: number;
  wall_count?: number;
};
  text?: string;
  track_code?: string;
  type?: string;
  views?: {
  count?: number;
};
}[];
  next_from?: string;
  profiles?: {
  can_access_closed?: boolean;
  can_write_private_message?: number;
  first_name?: string;
  first_name_gen?: string;
  friend_status?: number;
  has_unseen_stories?: boolean;
  id?: number;
  is_closed?: boolean;
  is_verified?: boolean;
  last_name?: string;
  last_name_gen?: string;
  photo_100?: string;
  photo_200?: string;
  photo_base?: string;
  screen_name?: string;
  sex?: number;
  social_button_type?: string;
  verified?: number;
}[];
  reaction_sets?: {
  id?: string;
  items?: {
  asset?: {
  animation_url?: string;
  images?: {
  height?: number;
  url?: string;
  width?: number;
}[];
  title?: {
  color?: {
  background?: {
  dark?: string;
  light?: string;
};
  foreground?: {
  dark?: string;
  light?: string;
};
};
};
  title_color?: {
  dark?: string;
  light?: string;
};
};
  id?: number;
  title?: string;
}[];
}[];
};
};

export interface PostvideophpRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostvideophpResponse = {
  langVersion?: string;
  loaderVersion?: string;
  payload?: number[];
  statsMeta?: {
  hash?: string;
  id?: number;
  platform?: string;
  reloadVersion?: number;
  st?: boolean;
  time?: number;
};
  vkEnv?: string;
};

export interface PostwebstatspRequest extends RequestOptions {
  body?: {
  appId?: number;
  attempt?: number;
  benchmarkMainStats?: JsonValue[];
  customStats?: JsonValue[];
  id?: number;
  networkStats?: JsonValue[];
  platform?: string;
  productionStats?: JsonValue[];
  sign?: string;
  signTime?: number;
  st?: boolean;
  statlogEvents?: number[][];
  storyViewStats?: JsonValue[];
  vkResStats?: JsonValue[];
  webPerfStats?: JsonValue[];
};
}
export type PostwebstatspResponse = {
  appId?: number;
  attempt?: number;
  benchmarkMainStats?: JsonValue[];
  customStats?: JsonValue[];
  id?: number;
  networkStats?: JsonValue[];
  platform?: string;
  productionStats?: JsonValue[];
  sign?: string;
  signTime?: number;
  st?: boolean;
  statlogEvents?: number[][];
  storyViewStats?: JsonValue[];
  vkResStats?: JsonValue[];
  webPerfStats?: JsonValue[];
};

export interface Getimagesgift1879animationjsonRequest extends RequestOptions {
}
export type Getimagesgift1879animationjsonResponse = {
  assets?: JsonValue[];
  ddd?: number;
  fr?: number;
  h?: number;
  ip?: number;
  layers?: {
  ao?: number;
  bm?: number;
  ddd?: number;
  ind?: number;
  ip?: number;
  ks?: {
  a?: {
  a?: number;
  ix?: number;
  k?: number[];
  l?: number;
};
  o?: {
  a?: number;
  ix?: number;
  k?: number;
};
  p?: {
  a?: number;
  ix?: number;
  k?: number[];
  l?: number;
};
  r?: {
  a?: number;
  ix?: number;
  k?: number;
};
  s?: {
  a?: number;
  ix?: number;
  k?: number[];
  l?: number;
};
};
  nm?: string;
  op?: number;
  sr?: number;
  st?: number;
  ty?: number;
}[];
  markers?: JsonValue[];
  nm?: string;
  op?: number;
  v?: string;
  w?: number;
};

export interface Getimagesgift1980animationjsonRequest extends RequestOptions {
}
export type Getimagesgift1980animationjsonResponse = {
  assets?: JsonValue[];
  ddd?: number;
  fr?: number;
  h?: number;
  ip?: number;
  layers?: {
  ao?: number;
  bm?: number;
  ct?: number;
  ddd?: number;
  ind?: number;
  ip?: number;
  ks?: {
  a?: {
  a?: number;
  k?: number[];
  l?: number;
};
  o?: {
  a?: number;
  k?: number;
};
  p?: {
  a?: number;
  k?: {
  i?: {
  x?: number;
  y?: number;
};
  o?: {
  x?: number;
  y?: number;
};
  s?: number[];
  t?: number;
  ti?: number[];
  to?: number[];
}[];
  l?: number;
};
  r?: {
  a?: number;
  k?: {
  i?: {
  x?: number[];
  y?: number[];
};
  o?: {
  x?: number[];
  y?: number[];
};
  s?: number[];
  t?: number;
}[];
};
  s?: {
  a?: number;
  k?: number[];
  l?: number;
};
};
  op?: number;
  parent?: number;
  shapes?: {
  bm?: number;
  it?: {
  ind?: number;
  ks?: {
  a?: number;
  k?: {
  i?: {
  x?: number;
  y?: number;
};
  o?: {
  x?: number;
  y?: number;
};
  s?: {
  c?: boolean;
  i?: number[][];
  o?: number[][];
  v?: number[][];
}[];
  t?: number;
}[];
};
  ty?: string;
}[];
  ty?: string;
}[];
  sr?: number;
  st?: number;
  ty?: number;
}[];
  markers?: JsonValue[];
  op?: number;
  props?: { [key: string]: JsonValue };
  v?: string;
  w?: number;
};

export interface PostmethodfriendsgetonlineRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodfriendsgetonlineResponse = JsonValue;

export interface PostmethodgroupsgetRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodgroupsgetResponse = {
  response?: {
  count?: number;
  items?: {
  admin_level?: number;
  id?: number;
  is_admin?: number;
  is_advertiser?: number;
  is_closed?: number;
  is_member?: number;
  name?: string;
  photo_100?: string;
  photo_200?: string;
  photo_50?: string;
  photo_base?: string;
  screen_name?: string;
  type?: string;
}[];
};
};

export interface PostmethodusersgetRequest extends RequestOptions {
  body?: JsonValue;
}
export type PostmethodusersgetResponse = {
  response?: {
  can_access_closed?: boolean;
  counters?: {
  albums?: number;
  articles?: number;
  audios?: number;
  clips?: number;
  clips_followers?: number;
  clips_likes?: number;
  clips_views?: number;
  followers?: number;
  friends?: number;
  gifts?: number;
  groups?: number;
  new_photo_tags?: number;
  new_recognition_tags?: number;
  online_friends?: number;
  pages?: number;
  photos?: number;
  subscriptions?: number;
  user_photos?: number;
  video_playlists?: number;
  videos?: number;
  wishes?: number;
};
  first_name?: string;
  first_name_gen?: string;
  id?: number;
  is_closed?: boolean;
  is_followers_mode_on?: boolean;
  last_name?: string;
  last_name_gen?: string;
}[];
};

export interface PostapicrashuploadbatchRequest extends RequestOptions {
  body?: { [key: string]: JsonValue };
}
export type PostapicrashuploadbatchResponse = { [key: string]: JsonValue };

