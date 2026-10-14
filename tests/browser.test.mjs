import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { chromium } from 'playwright';
import { createServer, preview } from 'vite';

let browser;
let development;
let production;
const origins = {};
const paths = {
  starter: '01-vue/vue.html',
  weather: '09-監視屬性-watch/Vue-天氣範例.html',
  watch: '09-監視屬性-watch/Vue-watch.html',
  deep: '09-監視屬性-watch/Vue-watch-深度監視.html',
  lists: '11-列表渲染/基本列表.html',
};

before(async () => {
  development = await createServer({ server: { host: '127.0.0.1', port: 0 } });
  await development.listen();
  origins.development = `http://127.0.0.1:${development.httpServer.address().port}/`;
  production = await preview({ preview: { host: '127.0.0.1', port: 0 } });
  origins.production = `http://127.0.0.1:${production.httpServer.address().port}/`;
  browser = await chromium.launch({ executablePath: process.env.CHROME_BIN });
});

after(async () => {
  await browser?.close();
  await development?.close();
  if (production) {
    await new Promise((resolve, reject) => production.httpServer.close(error => error ? reject(error) : resolve()));
  }
});

async function open(t, mode, path) {
  const page = await browser.newPage();
  t.after(() => page.close());
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`);
  });
  page.on('console', message => {
    if (['error', 'warning'].includes(message.type())) errors.push(message.text());
  });
  t.after(() => assert.deepEqual(errors, [], 'no Vue warnings or browser errors'));
  await page.addInitScript(() => {
    window.watchLogs = [];
    const log = console.log;
    console.log = (...args) => {
      window.watchLogs.push({
        values: JSON.parse(JSON.stringify(args)),
        sameReference: args[1] === args[2],
      });
      log(...args);
    };
  });
  const response = await page.goto(new URL(path, origins[mode]).href);
  assert.equal(response.status(), 200);
  if (path !== 'index.html') {
    await page.waitForFunction(() => document.querySelector('#root')?.dataset.vueVersion?.startsWith('3.'));
    assert.equal(await page.locator('#root').getAttribute('data-vue-version'), '3.5.44');
  }
  return page;
}

for (const mode of ['development', 'production']) {
  test(`${mode}: index links open all five lessons and return to the index`, async t => {
    const page = await open(t, mode, 'index.html');
    assert.equal(await page.locator('nav li').count(), 5);
    const labels = await page.locator('nav a').allTextContents();
    for (const label of labels) {
      await page.getByRole('link', { name: label, exact: true }).click();
      await page.waitForFunction(() => document.querySelector('#root')?.dataset.vueVersion?.startsWith('3.'));
      assert.equal(await page.locator('h1').count(), 1);
      await page.getByRole('link', { name: '← 所有範例', exact: true }).click();
      await page.waitForSelector('nav li');
    }
  });

  test(`${mode}: starter mounts Vue 3 and renders a compiled single-file component`, async t => {
    const page = await open(t, mode, paths.starter);
    assert.equal(await page.locator('h2').innerText(), 'Hello Vue 3!');
    assert.equal(await page.locator('tbody tr').count(), 2);
    assert.equal(await page.getByRole('status').innerText(), '目前選擇：尚未選擇');
  });

  test(`${mode}: props and edit/delete events update parent state and empty table`, async t => {
    const page = await open(t, mode, paths.starter);
    await page.getByRole('button', { name: '選擇小花', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('[role="status"]').textContent.includes('小花'));
    await page.getByRole('button', { name: '刪除小明', exact: true }).click();
    await page.waitForFunction(() => document.querySelectorAll('tbody tr').length === 1);
    assert.match(await page.locator('tbody').innerText(), /小花/);
    assert.doesNotMatch(await page.locator('tbody').innerText(), /小明/);
    await page.getByRole('button', { name: '刪除小花', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('tbody').textContent.includes('沒有聯絡人'));
    assert.equal(await page.locator('tbody button').count(), 0);
  });

  for (const [path, watched] of [[paths.weather, false], [paths.watch, true]]) {
    test(`${mode}: ${watched ? 'watch' : 'computed'} weather toggles both ways and preserves old/new values`, async t => {
      const page = await open(t, mode, path);
      assert.equal(await page.locator('h2').innerText(), '今天天氣很炎熱');
      await page.getByRole('button', { name: '切換天氣', exact: true }).click();
      await page.waitForFunction(() => document.querySelector('h2').textContent === '今天天氣很涼爽');
      await page.getByRole('button', { name: '切換天氣', exact: true }).click();
      await page.waitForFunction(() => document.querySelector('h2').textContent === '今天天氣很炎熱');
      assert.deepEqual(await page.evaluate(() => window.watchLogs.map(log => log.values)), watched ? [
        ['isHot被監視到了', false, true],
        ['isHot被監視到了', true, false],
      ] : []);
      if (watched) {
        assert.deepEqual(await page.locator('ol li').allInnerTexts(), ['isHot：true → false', 'isHot：false → true']);
      }
    });
  }

  test(`${mode}: deep watch observes both nested fields and replacement with reference semantics`, async t => {
    const page = await open(t, mode, paths.deep);
    await page.getByRole('button', { name: '點我a+1', exact: true }).click();
    await page.waitForFunction(() => window.watchLogs.length === 1);
    assert.equal(await page.locator('h2').nth(0).innerText(), 'numbers.a: 2');
    await page.getByRole('button', { name: '點我b+1', exact: true }).click();
    await page.waitForFunction(() => window.watchLogs.length === 2);
    assert.equal(await page.locator('h2').nth(1).innerText(), 'numbers.b: 3');
    await page.getByRole('button', { name: '換掉numbers', exact: true }).click();
    await page.waitForFunction(() => window.watchLogs.length === 3);
    assert.deepEqual(await page.locator('h2').allInnerTexts(), ['numbers.a: 6666', 'numbers.b: 8888']);
    assert.deepEqual(await page.evaluate(() => window.watchLogs), [
      { values: ['numbers被監視到了', { a: 2, b: 2 }, { a: 2, b: 2 }], sameReference: true },
      { values: ['numbers被監視到了', { a: 2, b: 3 }, { a: 2, b: 3 }], sameReference: true },
      { values: ['numbers被監視到了', { a: 6666, b: 8888 }, { a: 2, b: 3 }], sameReference: false },
    ]);
    assert.match(await page.locator('ol li').first().innerText(), /相同引用：true/);
    assert.match(await page.locator('ol li').last().innerText(), /相同引用：false/);
  });

  test(`${mode}: stable ID vs index DOM identity survives reorder, insertion and removal`, async t => {
    const page = await open(t, mode, paths.lists);
    const idList = page.getByTestId('id-list');
    const indexList = page.getByTestId('index-list');
    assert.equal(await idList.locator('li').count(), 5);
    assert.deepEqual(await page.getByTestId('car-list').locator('li').allInnerTexts(), [
      'brand-BMW', 'price-1000000', 'color-red',
    ]);
    await page.evaluate(() => {
      window.originalIdNodes = [...document.querySelectorAll('[data-testid="id-list"] li')];
      window.originalIndexNodes = [...document.querySelectorAll('[data-testid="index-list"] li')];
    });
    await page.getByRole('button', { name: '反轉順序', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('[data-testid="id-list"] li').textContent.includes('小雞'));
    assert.equal(await page.evaluate(() => {
      const idNodes = [...document.querySelectorAll('[data-testid="id-list"] li')];
      const indexNodes = [...document.querySelectorAll('[data-testid="index-list"] li')];
      return idNodes.every((node, i) => node === window.originalIdNodes[4 - i])
        && indexNodes.every((node, i) => node === window.originalIndexNodes[i]);
    }), true);
    await page.getByRole('button', { name: '新增同學', exact: true }).click();
    await page.waitForFunction(() => document.querySelectorAll('[data-testid="id-list"] li').length === 6);
    assert.equal(await page.evaluate(() => document.querySelectorAll('[data-testid="id-list"] li')[1] === window.originalIdNodes[4]), true);
    await page.getByRole('button', { name: '移除第一位', exact: true }).click();
    await page.waitForFunction(() => document.querySelectorAll('[data-testid="id-list"] li').length === 5);
    assert.equal(await page.evaluate(() => document.querySelector('[data-testid="id-list"] li') === window.originalIdNodes[4]), true);
    assert.match(await indexList.locator('li').first().innerText(), /0-小雞/);
  });

  test(`${mode}: index keys reuse unsaved input for another person while ID keys follow the person`, async t => {
    const page = await open(t, mode, paths.lists);
    assert.match(await page.locator('p').innerText(), /刻意用 index 作為 key/);
    const indexInputs = page.getByTestId('index-list').locator('input');
    const idInputs = page.getByTestId('id-list').locator('input');
    await indexInputs.nth(0).fill('小明的未儲存輸入');
    await idInputs.nth(0).fill('小明的未儲存輸入');
    await page.getByRole('button', { name: '反轉順序', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('[data-testid="index-list"] li').textContent.includes('小雞'));
    assert.equal(await indexInputs.nth(0).inputValue(), '小明的未儲存輸入');
    assert.equal(await indexInputs.nth(0).getAttribute('placeholder'), '小雞');
    assert.equal(await idInputs.last().inputValue(), '小明的未儲存輸入');
  });

  test(`${mode}: removing all people disables removal and new IDs remain unique`, async t => {
    const page = await open(t, mode, paths.lists);
    const remove = page.getByRole('button', { name: '移除第一位', exact: true });
    for (let count = 4; count >= 0; count--) {
      await remove.click();
      await page.waitForFunction(expected => document.querySelectorAll('[data-testid="id-list"] li').length === expected, count);
    }
    assert.equal(await remove.isDisabled(), true);
    await page.getByRole('button', { name: '新增同學', exact: true }).click();
    await page.getByRole('button', { name: '新增同學', exact: true }).click();
    await page.waitForFunction(() => document.querySelectorAll('[data-testid="id-list"] li').length === 2);
    assert.deepEqual(await page.getByTestId('id-list').locator('span').allInnerTexts(), ['7 新同學 23', '6 新同學 23']);
    assert.equal(await remove.isDisabled(), false);
  });
}
