import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { chromium } from 'playwright';

let browser;
before(async () => { browser = await chromium.launch({ executablePath: process.env.CHROME_BIN }); });
after(async () => { await browser?.close(); });

async function open(t, path) {
  const page = await browser.newPage();
  t.after(() => page.close());
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
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
  await page.goto(new URL(`../${path}`, import.meta.url).href);
  await page.waitForFunction(() => document.querySelector('#root').__vue__);
  return page;
}

test('empty starter mounts Vue 2.7.16', async t => {
  const page = await open(t, '01-vue/vue.html');
  assert.equal(await page.evaluate(() => Vue.version), '2.7.16');
  assert.equal(await page.locator('#root').innerText(), '');
});

for (const [filename, watched] of [
  ['Vue-天氣範例.html', false],
  ['Vue-watch.html', true],
]) {
  test(`${filename}: computed weather toggles both ways${watched ? ' and watch receives old/new values' : ''}`, async t => {
    const page = await open(t, `09-監視屬性-watch/${filename}`);
    assert.equal(await page.locator('h2').innerText(), '今天天氣很炎熱');
    await page.getByRole('button').click();
    await page.waitForFunction(() => document.querySelector('h2').textContent === '今天天氣很涼爽');
    await page.getByRole('button').click();
    await page.waitForFunction(() => document.querySelector('h2').textContent === '今天天氣很炎熱');
    const logs = await page.evaluate(() => window.watchLogs.map(log => log.values));
    assert.deepEqual(logs, watched ? [
      ['isHot被監視到了', false, true],
      ['isHot被監視到了', true, false],
    ] : []);
  });
}

test('deep watch observes both nested fields and replacement, with documented reference semantics', async t => {
  const page = await open(t, '09-監視屬性-watch/Vue-watch-深度監視.html');
  await page.getByRole('button', { name: '點我a+1' }).click();
  await page.waitForFunction(() => window.watchLogs.length === 1);
  assert.equal(await page.locator('h2').nth(0).innerText(), 'numbers.a: 2');
  await page.getByRole('button', { name: '點我b+1' }).click();
  await page.waitForFunction(() => window.watchLogs.length === 2);
  assert.equal(await page.locator('h2').nth(1).innerText(), 'numbers.b: 3');
  await page.getByRole('button', { name: '換掉numbers' }).click();
  await page.waitForFunction(() => window.watchLogs.length === 3);
  assert.deepEqual(await page.locator('h2').allInnerTexts(), ['numbers.a: 6666', 'numbers.b: 8888']);
  assert.deepEqual(await page.evaluate(() => window.watchLogs), [
    { values: ['numbers被監視到了', { a: 2, b: 2 }, { a: 2, b: 2 }], sameReference: true },
    { values: ['numbers被監視到了', { a: 2, b: 3 }, { a: 2, b: 3 }], sameReference: true },
    { values: ['numbers被監視到了', { a: 6666, b: 8888 }, { a: 2, b: 3 }], sameReference: false },
  ]);
});

test('array/object rendering and ID-key vs index-key DOM identity survive reorder/insertion/removal', async t => {
  const page = await open(t, '11-列表渲染/基本列表.html');
  assert.equal(await page.locator('ul').nth(0).locator('li').count(), 5);
  assert.deepEqual(await page.locator('ul').nth(2).locator('li').allInnerTexts(), [
    'brand-BMW', 'price-1000000', 'color-red',
  ]);
  await page.evaluate(async () => {
    window.originalIdNodes = [...document.querySelectorAll('ul:nth-of-type(1) li')];
    window.originalIndexNodes = [...document.querySelectorAll('ul:nth-of-type(2) li')];
    const vm = document.querySelector('#root').__vue__;
    vm.persons.reverse();
    await vm.$nextTick();
  });
  assert.equal(await page.evaluate(() => {
    const idNodes = [...document.querySelectorAll('ul:nth-of-type(1) li')];
    const indexNodes = [...document.querySelectorAll('ul:nth-of-type(2) li')];
    return idNodes.every((node, i) => node === window.originalIdNodes[4 - i])
      && indexNodes.every((node, i) => node === window.originalIndexNodes[i]);
  }), true);
  await page.evaluate(async () => {
    const vm = document.querySelector('#root').__vue__;
    vm.persons.unshift({ id: 6, name: '新同學', age: 23 });
    await vm.$nextTick();
  });
  assert.equal(await page.locator('ul').nth(0).locator('li').count(), 6);
  assert.equal(await page.evaluate(() => document.querySelectorAll('ul:nth-of-type(1) li')[1] === window.originalIdNodes[4]), true);
  await page.evaluate(async () => {
    const vm = document.querySelector('#root').__vue__;
    vm.persons.splice(1, 1);
    await vm.$nextTick();
  });
  assert.equal(await page.locator('ul').nth(0).locator('li').count(), 5);
  assert.equal(await page.evaluate(() => document.querySelectorAll('ul:nth-of-type(1) li')[1] === window.originalIdNodes[3]), true);
  assert.match(await page.locator('ul').nth(1).locator('li').first().innerText(), /0-新同學/);
});

test('list lesson demonstrates index keys reusing form state for a different person', async t => {
  const page = await open(t, '11-列表渲染/基本列表.html');
  assert.match(await page.locator('p').innerText(), /刻意用 index 作為 key/);
  const indexInputs = page.locator('ul').nth(1).locator('input');
  const idInputs = page.locator('ul').nth(0).locator('input');
  await indexInputs.nth(0).fill('小明的未儲存輸入');
  await idInputs.nth(0).fill('小明的未儲存輸入');
  await page.evaluate(async () => {
    document.querySelector('#root').__vue__.persons.reverse();
    await document.querySelector('#root').__vue__.$nextTick();
  });
  assert.match(await page.locator('ul').nth(1).locator('li').first().innerText(), /0-小雞/);
  assert.equal(await indexInputs.nth(0).inputValue(), '小明的未儲存輸入');
  assert.equal(await indexInputs.nth(0).getAttribute('placeholder'), '小雞');
  assert.equal(await idInputs.last().inputValue(), '小明的未儲存輸入');
});
