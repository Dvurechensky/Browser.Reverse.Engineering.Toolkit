"use strict";

const readline = require("readline");

async function handleAuth(page, config) {
  const mode = config.auth.mode;
  if (mode === "none" || mode === "profile") {
    return { mode, status: "skipped" };
  }

  const state = await detectAuthState(page, config);
  if (mode === "auto" && state.loggedIn) {
    return { mode, status: "already-authenticated", state };
  }

  if (mode === "auto" && !state.loginWall) {
    return { mode, status: "no-login-wall-detected", state };
  }

  await waitForManualLogin(page, config);
  return { mode, status: "user-confirmed", state: await detectAuthState(page, config) };
}

async function detectAuthState(page, config) {
  const auth = config.auth;
  return page.evaluate((rules) => {
    const url = location.href;
    const text = document.body ? document.body.innerText.slice(0, 20000) : "";
    const hasSelector = (selectors) => selectors.some((selector) => {
      try { return !!document.querySelector(selector); } catch { return false; }
    });
    const loginUrl = rules.loginUrlPatterns.some((pattern) => url.toLowerCase().includes(String(pattern).toLowerCase()));
    const loggedOut = hasSelector(rules.loggedOutSelectors) || /sign in|log in|password|войти|логин|пароль/i.test(text);
    const loggedIn = hasSelector(rules.loggedInSelectors) || /logout|sign out|profile|account|выйти|профиль|аккаунт/i.test(text);
    return {
      url,
      loginWall: loginUrl || loggedOut,
      loggedIn,
      loggedOut,
    };
  }, auth).catch((error) => ({ url: page.url(), error: error.message, loginWall: false, loggedIn: false }));
}

async function waitForManualLogin(page, config) {
  console.log("[SiteCrawlerSnapshotter] Manual auth mode.");
  console.log("[SiteCrawlerSnapshotter] Log in in the opened browser window. Press Enter here when ready to start capture/crawl.");
  await page.bringToFront().catch(() => {});
  await waitForEnter();
  await page.waitForLoadState("domcontentloaded").catch(() => {});
  await page.waitForTimeout(config.crawl.settleMs);
}

function waitForEnter() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question("", () => {
      rl.close();
      resolve();
    });
  });
}

module.exports = {
  handleAuth,
  detectAuthState,
};
