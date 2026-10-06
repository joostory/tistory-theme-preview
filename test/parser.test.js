// Unit tests for Tistory Theme Preview parser & xml_parser
const assert = require('assert');
const path = require('path');
const { compile, tokenize, buildAST } = require('../lib/parser');
const { parseIndexXml, loadIndexXml } = require('../lib/xml_parser');
const { getMergedMockData } = require('../lib/mock_data');

console.log('Running test suite for tistory-theme-preview...\n');

// 1. XML Parser Tests
console.log('▶ Test 1: index.xml Parsing');
const sampleXml = `
<?xml version="1.0" encoding="utf-8"?>
<skin>
  <information>
    <name>테스트 테마</name>
    <version>2.0.0</version>
    <description><![CDATA[테스트 설명글입니다.]]></description>
  </information>
  <author>
    <name>Joo</name>
    <homepage>https://github.com/joostory</homepage>
  </author>
  <default>
    <recentEntries>7</recentEntries>
    <liststyle>grid</liststyle>
  </default>
  <cover>
    <item>
      <name>featured</name>
      <label><![CDATA[추천글]]></label>
    </item>
  </cover>
  <variables>
    <variablegroup name="색상">
      <variable>
        <name>accent-color</name>
        <label>강조색</label>
        <type>COLOR</type>
        <default>#ff5638</default>
      </variable>
      <variable>
        <name>show-banner</name>
        <type>BOOL</type>
        <default>true</default>
      </variable>
      <variable>
        <name>layout</name>
        <type>SELECT</type>
        <option><![CDATA[[{"name":"wide","label":"와이드","value":"wide"}]]]></option>
        <default>wide</default>
      </variable>
    </variablegroup>
  </variables>
</skin>
`;

const parsedXml = parseIndexXml(sampleXml);
assert.strictEqual(parsedXml.information.name, '테스트 테마');
assert.strictEqual(parsedXml.information.version, '2.0.0');
assert.strictEqual(parsedXml.default.recentEntries, 7);
assert.strictEqual(parsedXml.default.liststyle, 'grid');
assert.strictEqual(parsedXml.coverItems.length, 1);
assert.strictEqual(parsedXml.coverItems[0].name, 'featured');
assert.strictEqual(parsedXml.variables.length, 3);
assert.strictEqual(parsedXml.variables[0].name, 'accent-color');
assert.strictEqual(parsedXml.variables[0].default, '#ff5638');
assert.strictEqual(parsedXml.variables[2].options[0].value, 'wide');
console.log('  ✔ index.xml parsing passed!');

// 2. Sample-theme index.xml loading
console.log('▶ Test 2: Sample Theme index.xml file loading');
const loadedSampleXml = loadIndexXml(path.join(__dirname, '../sample-theme'));
assert.ok(loadedSampleXml);
assert.strictEqual(loadedSampleXml.information.name, 'Tistory Sample Modern Skin');
assert.ok(loadedSampleXml.variables.length >= 3);
console.log('  ✔ sample-theme/index.xml file loading passed!');

// 3. Mock Data Tests
console.log('▶ Test 3: Mock Data Engine');
const mockData = getMergedMockData(path.join(__dirname, '../sample-theme'));
assert.ok(mockData.blog.Title);
assert.ok(mockData.posts.length >= 3);
assert.ok(mockData.covers.length >= 2);
console.log('  ✔ Mock data engine passed!');

// 4. Parser AST & Compilation Tests
console.log('▶ Test 4: Basic Substitution & s_t3');
const tpl1 = `<s_t3><h1>[##_title_##]</h1><p>[##_desc_##]</p></s_t3>`;
const res1 = compile(tpl1, {
  blog: { Title: '나의 티스토리', Desc: '블로그 설명' },
  viewType: 'index'
});
assert.ok(res1.includes('나의 티스토리'));
assert.ok(res1.includes('블로그 설명'));
assert.ok(res1.includes('common.js'));
console.log('  ✔ s_t3 and blog variables passed!');

// 5. Skin Option Conditionals
console.log('▶ Test 5: Skin Option Conditionals (s_if_var / s_not_var / [##_var_##])');
const tpl2 = `
  <s_if_var_is_active><span class="active">[##_var_accent-color_##]</span></s_if_var_is_active>
  <s_not_var_is_active><span class="inactive">off</span></s_not_var_is_active>
`;
const res2_true = compile(tpl2, {
  activeVariables: { 'is_active': 'true', 'accent-color': '#ff5638' }
});
assert.ok(res2_true.includes('class="active"'));
assert.ok(res2_true.includes('#ff5638'));
assert.ok(!res2_true.includes('class="inactive"'));

const res2_false = compile(tpl2, {
  activeVariables: { 'is_active': 'false', 'accent-color': '#ff5638' }
});
assert.ok(!res2_false.includes('class="active"'));
assert.ok(res2_false.includes('class="inactive"'));
console.log('  ✔ Skin option conditionals passed!');

// 6. Cover Group Rendering
console.log('▶ Test 6: Home Covers (s_cover_group)');
const tpl3 = `
<s_cover_group>
  <s_cover_rep>
    <s_cover name="featured">
      <div class="feat">
        <h2>[##_cover_title_##]</h2>
        <s_cover_item>
          <a href="[##_cover_item_url_##]">[##_cover_item_title_##]</a>
        </s_cover_item>
      </div>
    </s_cover>
  </s_cover_rep>
</s_cover_group>
`;
const res3_cover = compile(tpl3, {
  viewType: 'index',
  enableCovers: true,
  covers: [
    {
      name: 'featured',
      title: '추천 포스트',
      items: [
        { isArticle: true, title: '첫번째 글', url: '/1' }
      ]
    }
  ]
});
assert.ok(res3_cover.includes('추천 포스트'));
assert.ok(res3_cover.includes('첫번째 글'));

const res3_disabled = compile(tpl3, {
  viewType: 'index',
  enableCovers: false,
  covers: [{ name: 'featured', title: '추천 포스트', items: [] }]
});
assert.strictEqual(res3_disabled.trim(), '');
console.log('  ✔ Home covers rendering passed!');

// 7. Post Loop & View Mode Separation (Index vs Permalink)
console.log('▶ Test 7: Index vs Permalink Post separation');
const tpl4 = `
<s_article_rep>
  <s_index_article_rep>
    <div class="card">[##_article_rep_title_##]</div>
  </s_index_article_rep>
  <s_permalink_article_rep>
    <div class="full">[##_article_rep_title_##]</div>
  </s_permalink_article_rep>
</s_article_rep>
`;

const res4_index = compile(tpl4, {
  viewType: 'index',
  enableCovers: false,
  posts: [{ id: '1', title: '글제목-1' }, { id: '2', title: '글제목-2' }]
});
assert.ok(res4_index.includes('class="card"'));
assert.ok(!res4_index.includes('class="full"'));

const res4_permalink = compile(tpl4, {
  viewType: 'permalink',
  currentPost: { id: '1', title: '글제목-1' },
  posts: [{ id: '1', title: '글제목-1' }]
});
assert.ok(!res4_permalink.includes('class="card"'));
assert.ok(res4_permalink.includes('class="full"'));
console.log('  ✔ Index vs Permalink separation passed!');

// 8. List & Empty List
console.log('▶ Test 8: List & Empty List');
const tpl5 = `
<s_list>
  <h3>[##_list_conform_##] ([##_list_count_##])</h3>
  <s_list_empty><p>비어있음</p></s_list_empty>
  <s_list_rep><li>[##_list_rep_title_##]</li></s_list_rep>
</s_list>
`;
const res5_empty = compile(tpl5, {
  viewType: 'search',
  searchQuery: '없는글',
  listCount: 0,
  posts: []
});
assert.ok(res5_empty.includes('없는글 (0)'));
assert.ok(res5_empty.includes('비어있음'));

const res5_has = compile(tpl5, {
  viewType: 'category',
  currentCategory: '개발',
  listCount: 1,
  posts: [{ id: '1', title: '개발 포스트' }]
});
assert.ok(res5_has.includes('개발 (1)'));
assert.ok(res5_has.includes('개발 포스트'));
assert.ok(!res5_has.includes('비어있음'));
console.log('  ✔ List & Empty List passed!');

// 9. Modern Comment & Guestbook Widgets
console.log('▶ Test 9: Modern Comment & Guestbook widgets');
const tpl6 = `<div>[##_comment_group_##] [##_guestbook_group_##]</div>`;
const res6 = compile(tpl6, {
  viewType: 'permalink',
  currentPost: {
    id: '1',
    comments: [{ id: 'c1', name: '테스터', desc: '댓글 내용', replies: [] }]
  },
  guestbook: [{ id: 'g1', name: '방문자', desc: '방명록 글', replies: [] }]
});
assert.ok(res6.includes('data-tistory-react-app="Comment"'));
assert.ok(res6.includes('테스터'));
assert.ok(res6.includes('방문자'));
console.log('  ✔ Modern comment & guestbook widgets passed!');

// 10. Pagination & Span Wrapping
console.log('▶ Test 10: Pagination & Span Wrapping');
const tplPaging = `
<a [##_prev_page_##] class="ico_skin link_prev [##_no_more_prev_##]">이전</a>
<s_paging_rep>
	<a [##_paging_rep_link_##] class="link_page">[##_paging_rep_link_num_##]</a>
</s_paging_rep>
<a [##_next_page_##] class="ico_skin link_next [##_no_more_next_##]">다음</a>
`;

// Page 1 (default)
const resPaging1 = compile(tplPaging, {
  viewType: 'index',
  currentPage: 1
});
assert.ok(resPaging1.includes('class="ico_skin link_prev no-more-prev">이전</a>'));
assert.ok(resPaging1.includes('<a href="/?page=1" class="link_page"><span class="selected">1</span></a>'));
assert.ok(resPaging1.includes('<a href="/?page=2" class="link_page"><span class="">2</span></a>'));
assert.ok(resPaging1.includes('<a href="/?page=3" class="link_page"><span class="">3</span></a>'));
assert.ok(resPaging1.includes('<a href="/?page=4" class="link_page"><span class="">4</span></a>'));
assert.ok(resPaging1.includes('<a  class="link_page"><span class="">···</span></a>'));
assert.ok(resPaging1.includes('<a href="/?page=123" class="link_page"><span class="">123</span></a>'));
assert.ok(resPaging1.includes('<a href="/?page=2" class="ico_skin link_next ">다음</a>'));

// Page 2
const resPaging2 = compile(tplPaging, {
  viewType: 'index',
  currentPage: 2
});
assert.ok(resPaging2.includes('<a href="/?page=1" class="ico_skin link_prev ">이전</a>'));
assert.ok(resPaging2.includes('<a href="/?page=1" class="link_page"><span class="">1</span></a>'));
assert.ok(resPaging2.includes('<a href="/?page=2" class="link_page"><span class="selected">2</span></a>'));
assert.ok(resPaging2.includes('<a href="/?page=3" class="ico_skin link_next ">다음</a>'));
console.log('  ✔ Pagination & Span wrapping passed!');

console.log('\n======================================');
console.log(' 🎉 All unit tests passed successfully!');
console.log('======================================\n');
