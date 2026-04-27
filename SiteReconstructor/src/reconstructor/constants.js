"use strict";

const REQUIRED_FILES = [
  "page.json",
  "network.json",
  "assets.json",
  "endpoints.json",
  "schemas.json",
  "telemetry.json",
  "module_graph.json",
  "scenario.json",
  "security.json",
  "intelligence.json",
  "confidence.json",
  "evidence.json",
  "tech_tree.json",
];

const OPTIONAL_FILES = [
  "analysis.json",
  "auth.json",
  "css.json",
  "dom.json",
  "entities.json",
  "feature_flags.json",
  "forms.json",
  "framework.json",
  "jsenv.json",
  "manifest.json",
  "performance.json",
  "routes.json",
  "runtime_state.json",
  "screenshot_meta.json",
  "source_maps.json",
  "state_map.json",
  "storage.json",
  "timeline.json",
];

const SENSITIVE_KEYS = [
  "token",
  "jwt",
  "password",
  "passwd",
  "cookie",
  "session",
  "sid",
  "auth",
  "authorization",
  "bearer",
  "csrf",
  "xsrf",
  "api_key",
  "apikey",
  "secret",
  "access_token",
  "refresh_token",
  "phone",
  "email",
  "bdate",
  "address",
];

const PUBLIC_ASSET_PROTOCOLS = new Set(["http:", "https:"]);

const BUSINESS_MODULE_TAXONOMY = [
  { label: "Messaging", patterns: [/message/i, /messages/i, /chat/i, /conversation/i, /\bim\b/i, /sticker/i, /emoji/i], weight: 1 },
  { label: "Authentication", patterns: [/auth/i, /login/i, /oauth/i, /token/i, /session/i, /captcha/i, /sso/i, /password/i], weight: 1.05 },
  { label: "Commerce", patterns: [/pay/i, /billing/i, /invoice/i, /order/i, /cart/i, /checkout/i, /store/i, /market/i, /price/i, /subscription/i], weight: 1 },
  { label: "Media", patterns: [/photo/i, /video/i, /audio/i, /media/i, /upload/i, /image/i, /file/i, /player/i, /stream/i], weight: 0.95 },
  { label: "Analytics", patterns: [/analytics/i, /telemetry/i, /stat/i, /track/i, /event/i, /metric/i, /crash/i, /sentry/i, /beacon/i], weight: 1 },
  { label: "Support", patterns: [/support/i, /help/i, /ticket/i, /chatbot/i, /faq/i, /feedback/i, /contact/i], weight: 0.9 },
  { label: "Profile", patterns: [/profile/i, /user/i, /account/i, /friend/i, /avatar/i, /identity/i], weight: 0.9 },
  { label: "Search", patterns: [/search/i, /query/i, /resolve/i, /suggest/i, /lookup/i], weight: 0.85 },
  { label: "Notifications", patterns: [/notification/i, /notify/i, /push/i, /badge/i, /alert/i], weight: 0.85 },
  { label: "Admin", patterns: [/admin/i, /moderation/i, /manage/i, /dashboard/i, /control/i, /settings/i], weight: 0.85 },
];

module.exports = {
  REQUIRED_FILES,
  OPTIONAL_FILES,
  SENSITIVE_KEYS,
  PUBLIC_ASSET_PROTOCOLS,
  BUSINESS_MODULE_TAXONOMY,
};
