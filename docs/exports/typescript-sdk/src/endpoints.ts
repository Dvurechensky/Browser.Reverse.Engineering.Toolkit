import type { PostmethodvideogetstatstokenRequest, PostmethodvideogetstatstokenResponse, PostalvideophpRequest, PostalvideophpResponse, PostmethodcataloggetpeoplesearchRequest, PostmethodcataloggetpeoplesearchResponse, PostmethodchannelsgetownersforcreateRequest, PostmethodchannelsgetownersforcreateResponse, PostmethodexecuteRequest, PostmethodexecuteResponse, PostmethodfriendsgetRequest, PostmethodfriendsgetResponse, PostmethodfriendsgetrecommendationsRequest, PostmethodfriendsgetrecommendationsResponse, PostmethodfriendsgetrequestsRequest, PostmethodfriendsgetrequestsResponse, PostmethodmessagesgetconversationsRequest, PostmethodmessagesgetconversationsResponse, PostmethodmessagesgetrecentstickersRequest, PostmethodmessagesgetrecentstickersResponse, PostalfeedrightblockphpRequest, PostalfeedrightblockphpResponse, PostmethodaccountgetleftadsRequest, PostmethodaccountgetleftadsResponse, PostmethodstorehasnewitemsRequest, PostmethodstorehasnewitemsResponse, PostwkviewphpRequest, PostwkviewphpResponse, PostmethodvideogetRequest, PostmethodvideogetResponse, PostmethodvideogetplayerconfigRequest, PostmethodvideogetplayerconfigResponse, PostmethodwallgetcommentsforpostsRequest, PostmethodwallgetcommentsforpostsResponse, Getimgsbyid8ed4b28cc0b905374fsvgRequest, Getimgsbyid8ed4b28cc0b905374fsvgResponse, Getimgsbyidc0ca37933876686dcdsvgRequest, Getimgsbyidc0ca37933876686dcdsvgResponse, Getimgsb6byid93a837dc06183017svgRequest, Getimgsb6byid93a837dc06183017svgResponse, Getimgscfaaa8655ac54f10b068svgRequest, Getimgscfaaa8655ac54f10b068svgResponse, Getimgscfe532db22916648f14dsvgRequest, Getimgscfe532db22916648f14dsvgResponse, Getimgsdfbyid6fb16c27a25e2c38svgRequest, Getimgsdfbyid6fb16c27a25e2c38svgResponse, Getimgseebyid84ed4e4a5ae73316svgRequest, Getimgseebyid84ed4e4a5ae73316svgResponse, Getimgs37c0ca37933876686dcdsvgRequest, Getimgs37c0ca37933876686dcdsvgResponse, Getimgs638ed4b28cc0b905374fsvgRequest, Getimgs638ed4b28cc0b905374fsvgResponse, Getimgsb60993a837dc06183017svgRequest, Getimgsb60993a837dc06183017svgResponse, Getimgsdf926fb16c27a25e2c38svgRequest, Getimgsdf926fb16c27a25e2c38svgResponse, Getimgsee6384ed4e4a5ae73316svgRequest, Getimgsee6384ed4e4a5ae73316svgResponse, GetRequest, GetResponse, HeadRequest, HeadResponse, PostalgroupsphpRequest, PostalgroupsphpResponse, PostalmarketphpRequest, PostalmarketphpResponse, PostalprofilephpRequest, PostalprofilephpResponse, PostalticketsphpRequest, PostalticketsphpResponse, PostfbdoRequest, PostfbdoResponse, GetimagesgiftbyidanimationjsonRequest, GetimagesgiftbyidanimationjsonResponse, PostmethodaccountgetinfoRequest, PostmethodaccountgetinfoResponse, PostmethodaccountgetprofiledatalegacyRequest, PostmethodaccountgetprofiledatalegacyResponse, PostmethodappwidgetsgetRequest, PostmethodappwidgetsgetResponse, PostmethodcataloggetclassifiedsRequest, PostmethodcataloggetclassifiedsResponse, PostmethodcataloggetgroupsRequest, PostmethodcataloggetgroupsResponse, PostmethodcataloggetsectionRequest, PostmethodcataloggetsectionResponse, PostmethoddatabasegetcitiesRequest, PostmethoddatabasegetcitiesResponse, PostmethoddocsgetRequest, PostmethoddocsgetResponse, PostmethoddonutgetinfoRequest, PostmethoddonutgetinfoResponse, PostmethodfriendsgetcountersRequest, PostmethodfriendsgetcountersResponse, PostmethodfriendsgetlistsRequest, PostmethodfriendsgetlistsResponse, PostmethodmarketgetcountersRequest, PostmethodmarketgetcountersResponse, PostmethodnewsfeedgetfeedRequest, PostmethodnewsfeedgetfeedResponse, PostmethodonboardinggetRequest, PostmethodonboardinggetResponse, PostmethodonboardinggetcardsRequest, PostmethodonboardinggetcardsResponse, PostmethodpaymentsgetactivetabsRequest, PostmethodpaymentsgetactivetabsResponse, PostmethodpaymentsgetvoteshistoryRequest, PostmethodpaymentsgetvoteshistoryResponse, PostmethodphotosgetalbumsRequest, PostmethodphotosgetalbumsResponse, PostmethodstatstrackeventsRequest, PostmethodstatstrackeventsResponse, PostmethodstoriesgetRequest, PostmethodstoriesgetResponse, PostmethodutilsresolvescreennameRequest, PostmethodutilsresolvescreennameResponse, PostmethodvideofeedvideosforyoublockitemsRequest, PostmethodvideofeedvideosforyoublockitemsResponse, PostmethodvmojigetavatarRequest, PostmethodvmojigetavatarResponse, PostmethodwallgetRequest, PostmethodwallgetResponse, PostvideophpRequest, PostvideophpResponse, PostwebstatspRequest, PostwebstatspResponse, Getimagesgift1879animationjsonRequest, Getimagesgift1879animationjsonResponse, Getimagesgift1980animationjsonRequest, Getimagesgift1980animationjsonResponse, PostmethodfriendsgetonlineRequest, PostmethodfriendsgetonlineResponse, PostmethodgroupsgetRequest, PostmethodgroupsgetResponse, PostmethodusersgetRequest, PostmethodusersgetResponse, PostapicrashuploadbatchRequest, PostapicrashuploadbatchResponse } from './types';

interface EndpointRuntime {
  fetchImpl: typeof fetch;
  baseUrls: Record<string, string>;
  accessToken?: string;
  sessionCookie?: string;
  csrfToken?: string;
  defaultHeaders: Record<string, string>;
}

async function request<T>(runtime: EndpointRuntime, baseKey: string, method: string, path: string, input: { query?: Record<string, unknown>; headers?: Record<string, string>; body?: unknown; signal?: AbortSignal } = {}): Promise<T> {
  const baseUrl = runtime.baseUrls[baseKey] || runtime.baseUrls.base;
  const url = new URL(path, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);
  for (const [key, value] of Object.entries(input.query || {})) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }
  const headers: Record<string, string> = { ...runtime.defaultHeaders, ...(input.headers || {}) };
  if (runtime.accessToken && !headers.Authorization) headers.Authorization = `Bearer ${runtime.accessToken}`;
  if (runtime.sessionCookie && !headers.Cookie) headers.Cookie = runtime.sessionCookie;
  if (runtime.csrfToken && !headers['X-CSRF-Token']) headers['X-CSRF-Token'] = runtime.csrfToken;
  const init: RequestInit = { method, headers, signal: input.signal };
  if (!['GET', 'HEAD'].includes(method) && input.body !== undefined) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    init.body = typeof input.body === 'string' ? input.body : JSON.stringify(input.body);
  }
  const response = await runtime.fetchImpl(url, init);
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) throw Object.assign(new Error(`HTTP ${response.status}`), { response, payload });
  return payload as T;
}

export interface SiteEndpoints {
  postMethodVideoGetstatstoken(input?: PostmethodvideogetstatstokenRequest): Promise<PostmethodvideogetstatstokenResponse>;
  postAlVideoPhp(input?: PostalvideophpRequest): Promise<PostalvideophpResponse>;
  postMethodCatalogGetpeoplesearch(input?: PostmethodcataloggetpeoplesearchRequest): Promise<PostmethodcataloggetpeoplesearchResponse>;
  postMethodChannelsGetownersforcreate(input?: PostmethodchannelsgetownersforcreateRequest): Promise<PostmethodchannelsgetownersforcreateResponse>;
  postMethodExecute(input?: PostmethodexecuteRequest): Promise<PostmethodexecuteResponse>;
  postMethodFriendsGet(input?: PostmethodfriendsgetRequest): Promise<PostmethodfriendsgetResponse>;
  postMethodFriendsGetrecommendations(input?: PostmethodfriendsgetrecommendationsRequest): Promise<PostmethodfriendsgetrecommendationsResponse>;
  postMethodFriendsGetrequests(input?: PostmethodfriendsgetrequestsRequest): Promise<PostmethodfriendsgetrequestsResponse>;
  postMethodMessagesGetconversations(input?: PostmethodmessagesgetconversationsRequest): Promise<PostmethodmessagesgetconversationsResponse>;
  postMethodMessagesGetrecentstickers(input?: PostmethodmessagesgetrecentstickersRequest): Promise<PostmethodmessagesgetrecentstickersResponse>;
  postAlFeedRightBlockPhp(input?: PostalfeedrightblockphpRequest): Promise<PostalfeedrightblockphpResponse>;
  postMethodAccountGetleftads(input?: PostmethodaccountgetleftadsRequest): Promise<PostmethodaccountgetleftadsResponse>;
  postMethodStoreHasnewitems(input?: PostmethodstorehasnewitemsRequest): Promise<PostmethodstorehasnewitemsResponse>;
  postWkviewPhp(input?: PostwkviewphpRequest): Promise<PostwkviewphpResponse>;
  postMethodVideoGet(input?: PostmethodvideogetRequest): Promise<PostmethodvideogetResponse>;
  postMethodVideoGetplayerconfig(input?: PostmethodvideogetplayerconfigRequest): Promise<PostmethodvideogetplayerconfigResponse>;
  postMethodWallGetcommentsforposts(input?: PostmethodwallgetcommentsforpostsRequest): Promise<PostmethodwallgetcommentsforpostsResponse>;
  getImgsById8eD4b28cc0b905374fSvg(input?: Getimgsbyid8ed4b28cc0b905374fsvgRequest): Promise<Getimgsbyid8ed4b28cc0b905374fsvgResponse>;
  getImgsByIdC0Ca37933876686dcdSvg(input?: Getimgsbyidc0ca37933876686dcdsvgRequest): Promise<Getimgsbyidc0ca37933876686dcdsvgResponse>;
  getImgsB6ById93a837dc06183017Svg(input?: Getimgsb6byid93a837dc06183017svgRequest): Promise<Getimgsb6byid93a837dc06183017svgResponse>;
  getImgsCfAaA8655ac54f10b068Svg(input?: Getimgscfaaa8655ac54f10b068svgRequest): Promise<Getimgscfaaa8655ac54f10b068svgResponse>;
  getImgsCfE532db22916648f14dSvg(input?: Getimgscfe532db22916648f14dsvgRequest): Promise<Getimgscfe532db22916648f14dsvgResponse>;
  getImgsDfById6fb16c27a25e2c38Svg(input?: Getimgsdfbyid6fb16c27a25e2c38svgRequest): Promise<Getimgsdfbyid6fb16c27a25e2c38svgResponse>;
  getImgsEeById84ed4e4a5ae73316Svg(input?: Getimgseebyid84ed4e4a5ae73316svgRequest): Promise<Getimgseebyid84ed4e4a5ae73316svgResponse>;
  getImgs37C0Ca37933876686dcdSvg(input?: Getimgs37c0ca37933876686dcdsvgRequest): Promise<Getimgs37c0ca37933876686dcdsvgResponse>;
  getImgs638eD4b28cc0b905374fSvg(input?: Getimgs638ed4b28cc0b905374fsvgRequest): Promise<Getimgs638ed4b28cc0b905374fsvgResponse>;
  getImgsB60993a837dc06183017Svg(input?: Getimgsb60993a837dc06183017svgRequest): Promise<Getimgsb60993a837dc06183017svgResponse>;
  getImgsDf926fb16c27a25e2c38Svg(input?: Getimgsdf926fb16c27a25e2c38svgRequest): Promise<Getimgsdf926fb16c27a25e2c38svgResponse>;
  getImgsEe6384ed4e4a5ae73316Svg(input?: Getimgsee6384ed4e4a5ae73316svgRequest): Promise<Getimgsee6384ed4e4a5ae73316svgResponse>;
  get(input?: GetRequest): Promise<GetResponse>;
  head(input?: HeadRequest): Promise<HeadResponse>;
  postAlGroupsPhp(input?: PostalgroupsphpRequest): Promise<PostalgroupsphpResponse>;
  postAlMarketPhp(input?: PostalmarketphpRequest): Promise<PostalmarketphpResponse>;
  postAlProfilePhp(input?: PostalprofilephpRequest): Promise<PostalprofilephpResponse>;
  postAlTicketsPhp(input?: PostalticketsphpRequest): Promise<PostalticketsphpResponse>;
  postFbDo(input?: PostfbdoRequest): Promise<PostfbdoResponse>;
  getImagesGiftByIdAnimationJson(input?: GetimagesgiftbyidanimationjsonRequest): Promise<GetimagesgiftbyidanimationjsonResponse>;
  postMethodAccountGetinfo(input?: PostmethodaccountgetinfoRequest): Promise<PostmethodaccountgetinfoResponse>;
  postMethodAccountGetprofiledatalegacy(input?: PostmethodaccountgetprofiledatalegacyRequest): Promise<PostmethodaccountgetprofiledatalegacyResponse>;
  postMethodAppwidgetsGet(input?: PostmethodappwidgetsgetRequest): Promise<PostmethodappwidgetsgetResponse>;
  postMethodCatalogGetclassifieds(input?: PostmethodcataloggetclassifiedsRequest): Promise<PostmethodcataloggetclassifiedsResponse>;
  postMethodCatalogGetgroups(input?: PostmethodcataloggetgroupsRequest): Promise<PostmethodcataloggetgroupsResponse>;
  postMethodCatalogGetsection(input?: PostmethodcataloggetsectionRequest): Promise<PostmethodcataloggetsectionResponse>;
  postMethodDatabaseGetcities(input?: PostmethoddatabasegetcitiesRequest): Promise<PostmethoddatabasegetcitiesResponse>;
  postMethodDocsGet(input?: PostmethoddocsgetRequest): Promise<PostmethoddocsgetResponse>;
  postMethodDonutGetinfo(input?: PostmethoddonutgetinfoRequest): Promise<PostmethoddonutgetinfoResponse>;
  postMethodFriendsGetcounters(input?: PostmethodfriendsgetcountersRequest): Promise<PostmethodfriendsgetcountersResponse>;
  postMethodFriendsGetlists(input?: PostmethodfriendsgetlistsRequest): Promise<PostmethodfriendsgetlistsResponse>;
  postMethodMarketGetcounters(input?: PostmethodmarketgetcountersRequest): Promise<PostmethodmarketgetcountersResponse>;
  postMethodNewsfeedGetfeed(input?: PostmethodnewsfeedgetfeedRequest): Promise<PostmethodnewsfeedgetfeedResponse>;
  postMethodOnboardingGet(input?: PostmethodonboardinggetRequest): Promise<PostmethodonboardinggetResponse>;
  postMethodOnboardingGetcards(input?: PostmethodonboardinggetcardsRequest): Promise<PostmethodonboardinggetcardsResponse>;
  postMethodPaymentsGetactivetabs(input?: PostmethodpaymentsgetactivetabsRequest): Promise<PostmethodpaymentsgetactivetabsResponse>;
  postMethodPaymentsGetvoteshistory(input?: PostmethodpaymentsgetvoteshistoryRequest): Promise<PostmethodpaymentsgetvoteshistoryResponse>;
  postMethodPhotosGetalbums(input?: PostmethodphotosgetalbumsRequest): Promise<PostmethodphotosgetalbumsResponse>;
  postMethodStatsTrackevents(input?: PostmethodstatstrackeventsRequest): Promise<PostmethodstatstrackeventsResponse>;
  postMethodStoriesGet(input?: PostmethodstoriesgetRequest): Promise<PostmethodstoriesgetResponse>;
  postMethodUtilsResolvescreenname(input?: PostmethodutilsresolvescreennameRequest): Promise<PostmethodutilsresolvescreennameResponse>;
  postMethodVideoFeedvideosforyoublockitems(input?: PostmethodvideofeedvideosforyoublockitemsRequest): Promise<PostmethodvideofeedvideosforyoublockitemsResponse>;
  postMethodVmojiGetavatar(input?: PostmethodvmojigetavatarRequest): Promise<PostmethodvmojigetavatarResponse>;
  postMethodWallGet(input?: PostmethodwallgetRequest): Promise<PostmethodwallgetResponse>;
  postVideoPhp(input?: PostvideophpRequest): Promise<PostvideophpResponse>;
  postWebStatsP(input?: PostwebstatspRequest): Promise<PostwebstatspResponse>;
  getImagesGift1879AnimationJson(input?: Getimagesgift1879animationjsonRequest): Promise<Getimagesgift1879animationjsonResponse>;
  getImagesGift1980AnimationJson(input?: Getimagesgift1980animationjsonRequest): Promise<Getimagesgift1980animationjsonResponse>;
  postMethodFriendsGetonline(input?: PostmethodfriendsgetonlineRequest): Promise<PostmethodfriendsgetonlineResponse>;
  postMethodGroupsGet(input?: PostmethodgroupsgetRequest): Promise<PostmethodgroupsgetResponse>;
  postMethodUsersGet(input?: PostmethodusersgetRequest): Promise<PostmethodusersgetResponse>;
  postApiCrashUploadbatch(input?: PostapicrashuploadbatchRequest): Promise<PostapicrashuploadbatchResponse>;
}

export function endpoints(runtime: EndpointRuntime): SiteEndpoints {
  return {
    postMethodVideoGetstatstoken: (input = {}) => request<PostmethodvideogetstatstokenResponse>(runtime, "auth", "POST", "/method/video.getStatsToken", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postAlVideoPhp: (input = {}) => request<PostalvideophpResponse>(runtime, "media", "POST", "/al_video.php", {
      query: { "act": input.query?.["act"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodCatalogGetpeoplesearch: (input = {}) => request<PostmethodcataloggetpeoplesearchResponse>(runtime, "api", "POST", "/method/catalog.getPeopleSearch", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodChannelsGetownersforcreate: (input = {}) => request<PostmethodchannelsgetownersforcreateResponse>(runtime, "api", "POST", "/method/channels.getOwnersForCreate", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodExecute: (input = {}) => request<PostmethodexecuteResponse>(runtime, "api", "POST", "/method/execute", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodFriendsGet: (input = {}) => request<PostmethodfriendsgetResponse>(runtime, "api", "POST", "/method/friends.get", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodFriendsGetrecommendations: (input = {}) => request<PostmethodfriendsgetrecommendationsResponse>(runtime, "api", "POST", "/method/friends.getRecommendations", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodFriendsGetrequests: (input = {}) => request<PostmethodfriendsgetrequestsResponse>(runtime, "api", "POST", "/method/friends.getRequests", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodMessagesGetconversations: (input = {}) => request<PostmethodmessagesgetconversationsResponse>(runtime, "api", "POST", "/method/messages.getConversations", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodMessagesGetrecentstickers: (input = {}) => request<PostmethodmessagesgetrecentstickersResponse>(runtime, "api", "POST", "/method/messages.getRecentStickers", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postAlFeedRightBlockPhp: (input = {}) => request<PostalfeedrightblockphpResponse>(runtime, "base", "POST", "/al_feed_right_block.php", {
      query: { "act": input.query?.["act"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodAccountGetleftads: (input = {}) => request<PostmethodaccountgetleftadsResponse>(runtime, "api", "POST", "/method/account.getLeftAds", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodStoreHasnewitems: (input = {}) => request<PostmethodstorehasnewitemsResponse>(runtime, "api", "POST", "/method/store.hasNewItems", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postWkviewPhp: (input = {}) => request<PostwkviewphpResponse>(runtime, "api", "POST", "/wkview.php", {
      query: { "act": input.query?.["act"], "extra": input.query?.["extra"], "mt": input.query?.["mt"], "stat": input.query?.["stat"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodVideoGet: (input = {}) => request<PostmethodvideogetResponse>(runtime, "media", "POST", "/method/video.get", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodVideoGetplayerconfig: (input = {}) => request<PostmethodvideogetplayerconfigResponse>(runtime, "media", "POST", "/method/video.getPlayerConfig", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodWallGetcommentsforposts: (input = {}) => request<PostmethodwallgetcommentsforpostsResponse>(runtime, "api", "POST", "/method/wall.getCommentsForPosts", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    getImgsById8eD4b28cc0b905374fSvg: (input = {}) => request<Getimgsbyid8ed4b28cc0b905374fsvgResponse>(runtime, "media", "GET", "/imgs/:id/8e/d4b28cc0b905374f.svg", {
      query: {  ...(input.query || {}) },
      headers: input.headers,
      body: undefined,
      signal: input.signal,
    }),
    getImgsByIdC0Ca37933876686dcdSvg: (input = {}) => request<Getimgsbyidc0ca37933876686dcdsvgResponse>(runtime, "media", "GET", "/imgs/:id/c0/ca37933876686dcd.svg", {
      query: {  ...(input.query || {}) },
      headers: input.headers,
      body: undefined,
      signal: input.signal,
    }),
    getImgsB6ById93a837dc06183017Svg: (input = {}) => request<Getimgsb6byid93a837dc06183017svgResponse>(runtime, "media", "GET", "/imgs/b6/:id/93a837dc06183017.svg", {
      query: {  ...(input.query || {}) },
      headers: input.headers,
      body: undefined,
      signal: input.signal,
    }),
    getImgsCfAaA8655ac54f10b068Svg: (input = {}) => request<Getimgscfaaa8655ac54f10b068svgResponse>(runtime, "media", "GET", "/imgs/cf/aa/a8655ac54f10b068.svg", {
      query: {  ...(input.query || {}) },
      headers: input.headers,
      body: undefined,
      signal: input.signal,
    }),
    getImgsCfE532db22916648f14dSvg: (input = {}) => request<Getimgscfe532db22916648f14dsvgResponse>(runtime, "media", "GET", "/imgs/cf/e5/32db22916648f14d.svg", {
      query: {  ...(input.query || {}) },
      headers: input.headers,
      body: undefined,
      signal: input.signal,
    }),
    getImgsDfById6fb16c27a25e2c38Svg: (input = {}) => request<Getimgsdfbyid6fb16c27a25e2c38svgResponse>(runtime, "media", "GET", "/imgs/df/:id/6fb16c27a25e2c38.svg", {
      query: {  ...(input.query || {}) },
      headers: input.headers,
      body: undefined,
      signal: input.signal,
    }),
    getImgsEeById84ed4e4a5ae73316Svg: (input = {}) => request<Getimgseebyid84ed4e4a5ae73316svgResponse>(runtime, "media", "GET", "/imgs/ee/:id/84ed4e4a5ae73316.svg", {
      query: {  ...(input.query || {}) },
      headers: input.headers,
      body: undefined,
      signal: input.signal,
    }),
    getImgs37C0Ca37933876686dcdSvg: (input = {}) => request<Getimgs37c0ca37933876686dcdsvgResponse>(runtime, "media", "GET", "/imgs/37/c0/ca37933876686dcd.svg", {
      query: {  ...(input.query || {}) },
      headers: input.headers,
      body: undefined,
      signal: input.signal,
    }),
    getImgs638eD4b28cc0b905374fSvg: (input = {}) => request<Getimgs638ed4b28cc0b905374fsvgResponse>(runtime, "media", "GET", "/imgs/63/8e/d4b28cc0b905374f.svg", {
      query: {  ...(input.query || {}) },
      headers: input.headers,
      body: undefined,
      signal: input.signal,
    }),
    getImgsB60993a837dc06183017Svg: (input = {}) => request<Getimgsb60993a837dc06183017svgResponse>(runtime, "media", "GET", "/imgs/b6/09/93a837dc06183017.svg", {
      query: {  ...(input.query || {}) },
      headers: input.headers,
      body: undefined,
      signal: input.signal,
    }),
    getImgsDf926fb16c27a25e2c38Svg: (input = {}) => request<Getimgsdf926fb16c27a25e2c38svgResponse>(runtime, "media", "GET", "/imgs/df/92/6fb16c27a25e2c38.svg", {
      query: {  ...(input.query || {}) },
      headers: input.headers,
      body: undefined,
      signal: input.signal,
    }),
    getImgsEe6384ed4e4a5ae73316Svg: (input = {}) => request<Getimgsee6384ed4e4a5ae73316svgResponse>(runtime, "media", "GET", "/imgs/ee/63/84ed4e4a5ae73316.svg", {
      query: {  ...(input.query || {}) },
      headers: input.headers,
      body: undefined,
      signal: input.signal,
    }),
    get: (input = {}) => request<GetResponse>(runtime, "media", "GET", "/", {
      query: { "appId": input.query?.["appId"], "bytes": input.query?.["bytes"], "ch": input.query?.["ch"], "clientType": input.query?.["clientType"], "ct": input.query?.["ct"], "expires": input.query?.["expires"], "fromCache": input.query?.["fromCache"], "id": input.query?.["id"], "ms": input.query?.["ms"], "pr": input.query?.["pr"], "sig": input.query?.["sig"], "srcAg": input.query?.["srcAg"], "srcIp": input.query?.["srcIp"], "type": input.query?.["type"], "urls": input.query?.["urls"], ...(input.query || {}) },
      headers: input.headers,
      body: undefined,
      signal: input.signal,
    }),
    head: (input = {}) => request<HeadResponse>(runtime, "base", "HEAD", "/", {
      query: {  ...(input.query || {}) },
      headers: input.headers,
      body: undefined,
      signal: input.signal,
    }),
    postAlGroupsPhp: (input = {}) => request<PostalgroupsphpResponse>(runtime, "base", "POST", "/al_groups.php", {
      query: { "act": input.query?.["act"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postAlMarketPhp: (input = {}) => request<PostalmarketphpResponse>(runtime, "base", "POST", "/al_market.php", {
      query: {  ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postAlProfilePhp: (input = {}) => request<PostalprofilephpResponse>(runtime, "base", "POST", "/al_profile.php", {
      query: { "act": input.query?.["act"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postAlTicketsPhp: (input = {}) => request<PostalticketsphpResponse>(runtime, "base", "POST", "/al_tickets.php", {
      query: { "act": input.query?.["act"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postFbDo: (input = {}) => request<PostfbdoResponse>(runtime, "media", "POST", "/fb.do", {
      query: {  ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    getImagesGiftByIdAnimationJson: (input = {}) => request<GetimagesgiftbyidanimationjsonResponse>(runtime, "media", "GET", "/images/gift/:id/animation.json", {
      query: {  ...(input.query || {}) },
      headers: input.headers,
      body: undefined,
      signal: input.signal,
    }),
    postMethodAccountGetinfo: (input = {}) => request<PostmethodaccountgetinfoResponse>(runtime, "api", "POST", "/method/account.getInfo", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodAccountGetprofiledatalegacy: (input = {}) => request<PostmethodaccountgetprofiledatalegacyResponse>(runtime, "api", "POST", "/method/account.getProfileDataLegacy", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodAppwidgetsGet: (input = {}) => request<PostmethodappwidgetsgetResponse>(runtime, "api", "POST", "/method/appWidgets.get", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodCatalogGetclassifieds: (input = {}) => request<PostmethodcataloggetclassifiedsResponse>(runtime, "api", "POST", "/method/catalog.getClassifieds", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodCatalogGetgroups: (input = {}) => request<PostmethodcataloggetgroupsResponse>(runtime, "api", "POST", "/method/catalog.getGroups", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodCatalogGetsection: (input = {}) => request<PostmethodcataloggetsectionResponse>(runtime, "api", "POST", "/method/catalog.getSection", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodDatabaseGetcities: (input = {}) => request<PostmethoddatabasegetcitiesResponse>(runtime, "api", "POST", "/method/database.getCities", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodDocsGet: (input = {}) => request<PostmethoddocsgetResponse>(runtime, "api", "POST", "/method/docs.get", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodDonutGetinfo: (input = {}) => request<PostmethoddonutgetinfoResponse>(runtime, "api", "POST", "/method/donut.getInfo", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodFriendsGetcounters: (input = {}) => request<PostmethodfriendsgetcountersResponse>(runtime, "api", "POST", "/method/friends.getCounters", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodFriendsGetlists: (input = {}) => request<PostmethodfriendsgetlistsResponse>(runtime, "api", "POST", "/method/friends.getLists", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodMarketGetcounters: (input = {}) => request<PostmethodmarketgetcountersResponse>(runtime, "api", "POST", "/method/market.getCounters", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodNewsfeedGetfeed: (input = {}) => request<PostmethodnewsfeedgetfeedResponse>(runtime, "api", "POST", "/method/newsfeed.getFeed", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodOnboardingGet: (input = {}) => request<PostmethodonboardinggetResponse>(runtime, "api", "POST", "/method/onboarding.get", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodOnboardingGetcards: (input = {}) => request<PostmethodonboardinggetcardsResponse>(runtime, "api", "POST", "/method/onboarding.getCards", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodPaymentsGetactivetabs: (input = {}) => request<PostmethodpaymentsgetactivetabsResponse>(runtime, "api", "POST", "/method/payments.getActiveTabs", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodPaymentsGetvoteshistory: (input = {}) => request<PostmethodpaymentsgetvoteshistoryResponse>(runtime, "api", "POST", "/method/payments.getVotesHistory", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodPhotosGetalbums: (input = {}) => request<PostmethodphotosgetalbumsResponse>(runtime, "media", "POST", "/method/photos.getAlbums", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodStatsTrackevents: (input = {}) => request<PostmethodstatstrackeventsResponse>(runtime, "telemetry", "POST", "/method/stats.trackEvents", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodStoriesGet: (input = {}) => request<PostmethodstoriesgetResponse>(runtime, "api", "POST", "/method/stories.get", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodUtilsResolvescreenname: (input = {}) => request<PostmethodutilsresolvescreennameResponse>(runtime, "api", "POST", "/method/utils.resolveScreenName", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodVideoFeedvideosforyoublockitems: (input = {}) => request<PostmethodvideofeedvideosforyoublockitemsResponse>(runtime, "media", "POST", "/method/video.feedVideosForYouBlockItems", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodVmojiGetavatar: (input = {}) => request<PostmethodvmojigetavatarResponse>(runtime, "api", "POST", "/method/vmoji.getAvatar", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodWallGet: (input = {}) => request<PostmethodwallgetResponse>(runtime, "api", "POST", "/method/wall.get", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postVideoPhp: (input = {}) => request<PostvideophpResponse>(runtime, "media", "POST", "/video.php", {
      query: { "act": input.query?.["act"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postWebStatsP: (input = {}) => request<PostwebstatspResponse>(runtime, "telemetry", "POST", "/web-stats/p", {
      query: { "device_id": input.query?.["device_id"], "domain_sid": input.query?.["domain_sid"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    getImagesGift1879AnimationJson: (input = {}) => request<Getimagesgift1879animationjsonResponse>(runtime, "media", "GET", "/images/gift/1879/animation.json", {
      query: {  ...(input.query || {}) },
      headers: input.headers,
      body: undefined,
      signal: input.signal,
    }),
    getImagesGift1980AnimationJson: (input = {}) => request<Getimagesgift1980animationjsonResponse>(runtime, "media", "GET", "/images/gift/1980/animation.json", {
      query: {  ...(input.query || {}) },
      headers: input.headers,
      body: undefined,
      signal: input.signal,
    }),
    postMethodFriendsGetonline: (input = {}) => request<PostmethodfriendsgetonlineResponse>(runtime, "api", "POST", "/method/friends.getOnline", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodGroupsGet: (input = {}) => request<PostmethodgroupsgetResponse>(runtime, "api", "POST", "/method/groups.get", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postMethodUsersGet: (input = {}) => request<PostmethodusersgetResponse>(runtime, "api", "POST", "/method/users.get", {
      query: { "client_id": input.query?.["client_id"], "v": input.query?.["v"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
    postApiCrashUploadbatch: (input = {}) => request<PostapicrashuploadbatchResponse>(runtime, "auth", "POST", "/api/crash/uploadBatch", {
      query: { "compressType": input.query?.["compressType"], "crashToken": input.query?.["crashToken"], "sdkVersion": input.query?.["sdkVersion"], ...(input.query || {}) },
      headers: input.headers,
      body: input.body,
      signal: input.signal,
    }),
  };
}
