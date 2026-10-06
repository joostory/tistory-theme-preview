// Tistory Skin Template Engine & AST Parser
// Spec compliant with https://tistory.github.io/document-tistory-skin/

/**
 * Tokenize Tistory Skin HTML template
 * Handles <s_TAG ...>, </s_TAG>, and [##_VAR_##]
 */
function tokenize(template) {
  const tokens = [];
  let lastIndex = 0;

  // Pattern matches:
  // 1. Group open: <s_([a-zA-Z0-9_\-]+)(\s+[^>]*)?>
  // 2. Group close: </s_([a-zA-Z0-9_\-]+)>
  // 3. Value variable: \[##_([a-zA-Z0-9_\-]+)_##\]
  const regex = /<s_([a-zA-Z0-9_\-]+)((?:\s+[^>]*)?)>|<\/s_([a-zA-Z0-9_\-]+)>|\[##_([a-zA-Z0-9_\-]+)_##\]/gi;

  let match;
  while ((match = regex.exec(template)) !== null) {
    const textBefore = template.substring(lastIndex, match.index);
    if (textBefore) {
      tokens.push({ type: 'text', content: textBefore });
    }

    if (match[1] !== undefined) {
      // Group open tag: <s_name attrs>
      const name = match[1].toLowerCase();
      const rawAttrs = match[2] || '';
      
      // Extract attributes like name="..."
      const attrs = {};
      const attrRegex = /([a-zA-Z0-9_\-]+)=["']([^"']*)["']/g;
      let attrMatch;
      while ((attrMatch = attrRegex.exec(rawAttrs)) !== null) {
        attrs[attrMatch[1].toLowerCase()] = attrMatch[2];
      }

      tokens.push({
        type: 'block_start',
        name,
        rawName: match[1],
        attrs
      });
    } else if (match[3] !== undefined) {
      // Group close tag: </s_name>
      tokens.push({
        type: 'block_end',
        name: match[3].toLowerCase(),
        rawName: match[3]
      });
    } else if (match[4] !== undefined) {
      // Value variable: [##_name_##]
      tokens.push({
        type: 'variable',
        name: match[4]
      });
    }

    lastIndex = regex.lastIndex;
  }

  const textAfter = template.substring(lastIndex);
  if (textAfter) {
    tokens.push({ type: 'text', content: textAfter });
  }

  return tokens;
}

/**
 * Builds nested AST tree from tokens
 */
function buildAST(tokens) {
  const root = { type: 'root', children: [] };
  const stack = [root];

  for (const token of tokens) {
    const currentParent = stack[stack.length - 1];

    if (token.type === 'text') {
      currentParent.children.push({ type: 'text', content: token.content });
    } else if (token.type === 'variable') {
      currentParent.children.push({ type: 'variable', name: token.name });
    } else if (token.type === 'block_start') {
      const newBlock = {
        type: 'block',
        name: token.name,
        rawName: token.rawName,
        attrs: token.attrs,
        children: []
      };
      currentParent.children.push(newBlock);
      stack.push(newBlock);
    } else if (token.type === 'block_end') {
      // Pop matching block from stack
      let matchedIndex = -1;
      for (let i = stack.length - 1; i >= 1; i--) {
        if (stack[i].name === token.name) {
          matchedIndex = i;
          break;
        }
      }

      if (matchedIndex !== -1) {
        while (stack.length > matchedIndex) {
          stack.pop();
        }
      } else {
        // Tag mismatch, ignore or log warning
      }
    }
  }

  return root;
}

/**
 * Formats tag list as HTML for [##_tag_label_rep_##]
 */
function formatTagListHTML(tags) {
  if (!tags || tags.length === 0) return '';
  return tags.map(t => `<a href="/tag/${encodeURIComponent(t)}" rel="tag">${t}</a>`).join(', ');
}

/**
 * Formats React-style modern comment widget HTML for [##_comment_group_##]
 */
function renderModernCommentWidget(comments = [], postId = "1") {
  const totalComments = comments.reduce((acc, c) => acc + 1 + (c.replies ? c.replies.length : 0), 0);

  let listHtml = '';
  if (comments.length === 0) {
    listHtml = '<li class="tt-item-reply"><div class="tt-wrap-desc"><p class="tt_desc" style="color:#94a3b8;padding:1rem 0;">등록된 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!</p></div></li>';
  } else {
    for (const c of comments) {
      listHtml += `
        <li class="tt-item-reply rp_general" id="${c.id}">
          <div class="tt-wrap-cmt">
            <div class="tt-box-thumb">
              <span class="tt-thumbnail" style="background-image: url('${c.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}'); width:40px; height:40px; border-radius:50%; display:inline-block; background-size:cover;"></span>
            </div>
            <div class="tt-box-content" style="margin-left: 12px; flex: 1;">
              <div class="tt-box-meta">
                <strong class="tt-link-user">${c.name}</strong>
                <span class="tt_date" style="font-size:12px; color:#888; margin-left:8px;">${c.date}</span>
              </div>
              <div class="tt-wrap-desc" style="margin: 6px 0;">
                <p class="tt_desc">${c.desc}</p>
              </div>
            </div>
          </div>
      `;

      if (c.replies && c.replies.length > 0) {
        listHtml += '<ul class="tt-list-reply sub" style="padding-left: 48px; list-style:none;">';
        for (const rep of c.replies) {
          listHtml += `
            <li class="tt-item-reply" id="${rep.id}" style="margin-top: 10px;">
              <div class="tt-wrap-cmt" style="display:flex; align-items:flex-start;">
                <div class="tt-box-thumb">
                  <span class="tt-thumbnail" style="background-image: url('${rep.logo || 'https://images.unsplash.com/photo-1534972195531-a756b1140f6c?auto=format&fit=crop&w=80&q=80'}'); width:34px; height:34px; border-radius:50%; display:inline-block; background-size:cover;"></span>
                </div>
                <div class="tt-box-content" style="margin-left: 10px; flex: 1;">
                  <div class="tt-box-meta">
                    <strong class="tt-link-user">${rep.name} ${rep.isAdmin ? '<span style="font-size:11px; background:#ff5638; color:#fff; border-radius:4px; padding:1px 5px;">작성자</span>' : ''}</strong>
                    <span class="tt_date" style="font-size:12px; color:#888; margin-left:8px;">${rep.date}</span>
                  </div>
                  <div class="tt-wrap-desc" style="margin: 4px 0;">
                    <p class="tt_desc">${rep.desc}</p>
                  </div>
                </div>
              </div>
            </li>
          `;
        }
        listHtml += '</ul>';
      }

      listHtml += '</li>';
    }
  }

  return `
    <div data-tistory-react-app="Comment" class="tistory-modern-comment-box" style="margin: 2rem 0; font-family: inherit;">
      <div class="tt-comment-cont">
        <div class="tt-box-total" style="font-weight: bold; margin-bottom: 1rem; font-size: 1.1rem;">
          <span class="tt_txt_g">댓글</span>
          <span class="tt_num_g" style="color: #ff5638;">${totalComments}</span>
        </div>
        <div class="tt-area-reply" style="margin-bottom: 1.5rem;">
          <ul class="tt-list-reply" style="list-style: none; padding: 0; margin: 0;">
            ${listHtml}
          </ul>
        </div>
        <div class="tt-area-write" style="background: rgba(125,125,125,0.06); padding: 16px; border-radius: 8px;">
          <div class="tt-box-account" style="display: flex; gap: 8px; margin-bottom: 8px;">
            <input type="text" placeholder="이름" style="padding: 6px 10px; border-radius: 4px; border: 1px solid #ccc; flex: 1;" />
            <input type="password" placeholder="비밀번호" style="padding: 6px 10px; border-radius: 4px; border: 1px solid #ccc; flex: 1;" />
          </div>
          <div class="tt-box-textarea">
            <textarea placeholder="따뜻한 댓글을 남겨주세요." rows="3" style="width: 100%; box-sizing: border-box; padding: 10px; border-radius: 4px; border: 1px solid #ccc;"></textarea>
          </div>
          <div class="tt-box-write" style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
            <label style="font-size: 13px;"><input type="checkbox" /> 비밀글</label>
            <button type="button" style="background: #ff5638; color: #fff; border: none; padding: 6px 16px; border-radius: 4px; font-weight: 600; cursor: pointer;">댓글 등록</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Formats React-style modern guestbook widget HTML for [##_guestbook_group_##]
 */
function renderModernGuestbookWidget(guestbook = []) {
  let listHtml = '';
  for (const g of guestbook) {
    listHtml += `
      <li class="tt-item-reply" id="${g.id}" style="padding: 12px 0; border-bottom: 1px solid rgba(125,125,125,0.15);">
        <div class="tt-box-meta" style="margin-bottom: 4px;">
          <strong class="tt-link-user">${g.name}</strong>
          <span class="tt_date" style="font-size:12px; color:#888; margin-left:8px;">${g.date}</span>
        </div>
        <p class="tt_desc" style="margin: 6px 0;">${g.desc}</p>
    `;

    if (g.replies && g.replies.length > 0) {
      for (const rep of g.replies) {
        listHtml += `
          <div class="tt-sub-reply" style="margin-left: 24px; padding-left: 12px; border-left: 2px solid #ff5638; margin-top: 8px;">
            <strong style="color: #ff5638;">${rep.name} (답글)</strong>
            <span style="font-size:12px; color:#888; margin-left:6px;">${rep.date}</span>
            <p style="margin: 4px 0;">${rep.desc}</p>
          </div>
        `;
      }
    }
    listHtml += '</li>';
  }

  return `
    <div data-tistory-react-app="Comment" class="tistory-modern-guestbook-box" style="margin: 2rem 0; font-family: inherit;">
      <div class="tt-comment-cont">
        <div class="tt-area-write" style="background: rgba(125,125,125,0.06); padding: 16px; border-radius: 8px; margin-bottom: 2rem;">
          <div class="tt-box-account" style="display: flex; gap: 8px; margin-bottom: 8px;">
            <input type="text" placeholder="이름" style="padding: 6px 10px; border-radius: 4px; border: 1px solid #ccc; flex: 1;" />
            <input type="password" placeholder="비밀번호" style="padding: 6px 10px; border-radius: 4px; border: 1px solid #ccc; flex: 1;" />
          </div>
          <div class="tt-box-textarea">
            <textarea placeholder="방명록을 남겨주세요." rows="3" style="width: 100%; box-sizing: border-box; padding: 10px; border-radius: 4px; border: 1px solid #ccc;"></textarea>
          </div>
          <div class="tt-box-write" style="display: flex; justify-content: flex-end; margin-top: 8px;">
            <button type="button" style="background: #ff5638; color: #fff; border: none; padding: 6px 16px; border-radius: 4px; font-weight: 600; cursor: pointer;">안부 남기기</button>
          </div>
        </div>
        <div class="tt-area-reply">
          <ul style="list-style:none; padding:0; margin:0;">
            ${listHtml}
          </ul>
        </div>
      </div>
    </div>
  `;
}

/**
 * Generates pagination items mimicking Tistory's pagination behavior
 */
function getPaginationItems(currentPage = 1, totalPages = 123) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => {
      const p = i + 1;
      return {
        num: p,
        text: String(p),
        selected: p === currentPage,
        link: `/?page=${p}`
      };
    });
  }

  const items = [];
  if (currentPage <= 4) {
    const end = Math.min(4, totalPages - 1);
    for (let p = 1; p <= end; p++) {
      items.push({
        num: p,
        text: String(p),
        selected: p === currentPage,
        link: `/?page=${p}`
      });
    }
    if (totalPages > end + 1) {
      items.push({
        num: null,
        text: '···',
        selected: false,
        link: ''
      });
    }
    items.push({
      num: totalPages,
      text: String(totalPages),
      selected: totalPages === currentPage,
      link: `/?page=${totalPages}`
    });
  } else if (currentPage >= totalPages - 3) {
    items.push({
      num: 1,
      text: '1',
      selected: false,
      link: '/?page=1'
    });
    if (totalPages > 5) {
      items.push({
        num: null,
        text: '···',
        selected: false,
        link: ''
      });
    }
    for (let p = totalPages - 3; p <= totalPages; p++) {
      items.push({
        num: p,
        text: String(p),
        selected: p === currentPage,
        link: `/?page=${p}`
      });
    }
  } else {
    items.push({
      num: 1,
      text: '1',
      selected: false,
      link: '/?page=1'
    });
    items.push({
      num: null,
      text: '···',
      selected: false,
      link: ''
    });
    for (let p = currentPage - 1; p <= currentPage + 1; p++) {
      items.push({
        num: p,
        text: String(p),
        selected: p === currentPage,
        link: `/?page=${p}`
      });
    }
    items.push({
      num: null,
      text: '···',
      selected: false,
      link: ''
    });
    items.push({
      num: totalPages,
      text: String(totalPages),
      selected: totalPages === currentPage,
      link: `/?page=${totalPages}`
    });
  }
  return items;
}

/**
 * Recursively renders AST children
 */
function renderChildren(node, context) {
  if (!node.children || node.children.length === 0) return '';
  return node.children.map(child => evaluateAST(child, context)).join('');
}

/**
 * Evaluates single AST node against execution context
 */
function evaluateAST(node, context) {
  if (node.type === 'root') {
    return renderChildren(node, context);
  }

  if (node.type === 'text') {
    return node.content;
  }

  if (node.type === 'variable') {
    const name = node.name;
    const blog = context.blog || {};
    const post = context.currentPost;
    const notice = context.currentNotice;
    const coverItem = context.currentCoverItem;
    const cover = context.currentCover;
    const comment = context.currentComment;
    const reply = context.currentReply;
    const guest = context.currentGuest;
    const guestReply = context.currentGuestReply;
    const tag = context.currentTagItem;
    const pageNum = context.currentPageNum;
    const pageItem = context.currentPageItem || (pageNum !== undefined ? {
      num: pageNum,
      text: String(pageNum),
      selected: pageNum === Number(context.currentPage || context.page || 1),
      link: `/?page=${pageNum}`
    } : null);
    const currentPage = Number(context.currentPage || context.page || 1);
    const totalPages = Number(context.totalPages || 123);

    // 1. Skin Option Variables: [##_var_{VARIABLE_NAME}_##]
    if (name.startsWith('var_')) {
      const varName = name.substring(4);
      const val = (blog.variables && blog.variables[varName] !== undefined)
        ? blog.variables[varName]
        : (context.activeVariables && context.activeVariables[varName] !== undefined ? context.activeVariables[varName] : '');
      return String(val);
    }

    // 2. Global Blog Variables
    if (name === 'title') return blog.Title || '';
    if (name === 'desc') return blog.Desc || '';
    if (name === 'blogger') return blog.Blogger || '';
    if (name === 'blog_link') return blog.BlogLink || '/';
    if (name === 'rss_url') return blog.RssUrl || '/rss';
    if (name === 'taglog_link') return blog.TaglogLink || '/tag';
    if (name === 'guestbook_link') return blog.GuestbookLink || '/guestbook';
    if (name === 'image') return blog.Image || '';
    if (name === 'blog_image') return blog.BlogImage || `<img src="${blog.Image || ''}" alt="블로그 이미지" />`;
    if (name === 'image_path') return './images';
    if (name === 'blog_menu') return blog.BlogMenu || '';
    if (name === 'revenue_list_upper') return blog.RevenueUpper || '';
    if (name === 'revenue_list_lower') return blog.RevenueLower || '';

    // Page Title
    if (name === 'page_title') {
      if (context.viewType === 'permalink' && post) return `${post.title} — ${blog.Title}`;
      if (context.viewType === 'category') return `${context.currentCategory || '카테고리'} — ${blog.Title}`;
      if (context.viewType === 'search') return `'${context.searchQuery || ''}' 검색 결과 — ${blog.Title}`;
      if (context.viewType === 'tag') return `태그: ${context.currentTag || ''} — ${blog.Title}`;
      if (context.viewType === 'notice' && notice) return `${notice.title} — ${blog.Title}`;
      if (context.viewType === 'guestbook') return `방명록 — ${blog.Title}`;
      return blog.Title || '';
    }

    // Body ID based on current page viewType
    if (name === 'body_id') {
      const bodyIdMap = {
        index: 'tt-body-index',
        permalink: 'tt-body-page',
        category: 'tt-body-category',
        archive: 'tt-body-archive',
        tag: 'tt-body-tag',
        search: 'tt-body-search',
        notice: 'tt-body-page',
        protected: 'tt-body-page',
        page: 'tt-body-page',
        guestbook: 'tt-body-guestbook'
      };
      return bodyIdMap[context.viewType] || 'tt-body-index';
    }

    // Visitor Stats
    if (name === 'count_total') return blog.CountTotal || '128,450';
    if (name === 'count_today') return blog.CountToday || '1,520';
    if (name === 'count_yesterday') return blog.CountYesterday || '2,380';

    // Sidebar Category
    if (name === 'category' || name === 'category_list') {
      return blog.CategoryHtml || '';
    }

    // Modern Comment & Guestbook Widgets
    if (name === 'comment_group') {
      const targetComments = post ? post.comments : [];
      return renderModernCommentWidget(targetComments, post ? post.id : '1');
    }
    if (name === 'guestbook_group') {
      return renderModernGuestbookWidget(context.guestbook || []);
    }

    // 3. Post (Article) Variables
    if (post) {
      if (name === 'article_rep_id') return post.id || '1';
      if (name === 'article_rep_link') return post.link || `/post/${post.id}`;
      if (name === 'article_rep_title') return post.title || '';
      if (name === 'article_rep_category') return post.category || '';
      if (name === 'article_rep_category_link') return post.categoryLink || '#';
      if (name === 'article_rep_date') return post.date || '';
      if (name === 'article_rep_simple_date') return post.simpleDate || '';
      if (name === 'article_rep_date_year') return post.year || '2026';
      if (name === 'article_rep_date_month') return post.month || '10';
      if (name === 'article_rep_date_day') return post.day || '05';
      if (name === 'article_rep_date_hour') return post.hour || '14';
      if (name === 'article_rep_date_minute') return post.minute || '30';
      if (name === 'article_rep_date_second') return post.second || '00';
      if (name === 'article_rep_author') return post.author || blog.Blogger || '';
      if (name === 'article_rep_desc') return post.desc || '';
      if (name === 'article_rep_summary') return post.summary || '';
      if (name === 'article_rep_thumbnail_url') return post.thumbnailUrl || '';
      if (name === 'article_rep_thumbnail_raw_url') return post.rawThumbnailUrl || post.thumbnailUrl || '';
      if (name === 'article_rep_rp_cnt') return String(post.commentCount !== undefined ? post.commentCount : (post.comments ? post.comments.length : 0));
      if (name === 'article_rep_rp_link') return `document.getElementById('comment_${post.id}').scrollIntoView();`;
      if (name === 'tag_label_rep') return formatTagListHTML(post.tags);

      // Related articles
      if (name === 'article_related_rep_type') return post.thumbnailUrl ? 'thumb_type' : 'text_type';
      if (name === 'article_related_rep_link') return post.link || '#';
      if (name === 'article_related_rep_title') return post.title || '';
      if (name === 'article_related_rep_date') return post.simpleDate || post.date || '';
      if (name === 'article_related_rep_thumbnail_link') return post.thumbnailUrl || '';

      // Prev / Next article
      if (name === 'article_prev_type') return post.thumbnailUrl ? 'thumb_type' : 'text_type';
      if (name === 'article_prev_link') return post.link || '#';
      if (name === 'article_prev_title') return post.title || '';
      if (name === 'article_prev_date') return post.simpleDate || '';
      if (name === 'article_prev_thumbnail_link') return post.thumbnailUrl || '';

      if (name === 'article_next_type') return post.thumbnailUrl ? 'thumb_type' : 'text_type';
      if (name === 'article_next_link') return post.link || '#';
      if (name === 'article_next_title') return post.title || '';
      if (name === 'article_next_date') return post.simpleDate || '';
      if (name === 'article_next_thumbnail_link') return post.thumbnailUrl || '';

      // Admin tool placeholders
      if (name === 's_ad_m_link') return `/admin/entry/post/?id=${post.id}`;
      if (name === 's_ad_m_onclick') return `alert('수정 페이지 이동');`;
      if (name === 's_ad_s1_label') return '공개';
      if (name === 's_ad_s2_onclick') return `alert('상태 변경');`;
      if (name === 's_ad_s2_label') return '비공개';
      if (name === 's_ad_t_onclick') return `alert('트랙백');`;
      if (name === 's_ad_d_onclick') return `if(confirm('삭제하시겠습니까?')) alert('삭제되었습니다.');`;
    }

    // 4. Notice Variables
    if (notice) {
      if (name === 'notice_rep_link') return notice.link || `/notice/${notice.id}`;
      if (name === 'notice_rep_title') return notice.title || '';
      if (name === 'notice_rep_date') return notice.date || '';
      if (name === 'notice_rep_simple_date') return notice.simpleDate || '';
      if (name === 'notice_rep_date_year') return notice.year || '2026';
      if (name === 'notice_rep_date_month') return notice.month || '10';
      if (name === 'notice_rep_date_day') return notice.day || '01';
      if (name === 'notice_rep_date_hour') return notice.hour || '10';
      if (name === 'notice_rep_date_minute') return notice.minute || '00';
      if (name === 'notice_rep_date_second') return notice.second || '00';
      if (name === 'notice_rep_author') return notice.author || '관리자';
      if (name === 'notice_rep_desc') return notice.desc || '';
      if (name === 'notice_rep_summary') return notice.summary || '';
      if (name === 'notice_rep_thumbnail_url') return notice.thumbnailUrl || '';
      if (name === 'notice_rep_thumbnail_raw_url') return notice.thumbnailUrl || '';
    }

    // 5. Protected Post Variables
    if (context.viewType === 'protected' && context.protectedPost) {
      const p = context.protectedPost;
      if (name === 'article_password') return p.passwordId || 'entry1Password';
      if (name === 'article_dissolve') return p.dissolveCode || 'alert("비밀번호 확인");';
    }

    // 6. Cover Variables
    if (cover) {
      if (name === 'cover_title') return cover.title || '';
      if (name === 'cover_url') return cover.url || '#';
    }
    if (coverItem) {
      if (name === 'cover_item_title') return coverItem.title || '';
      if (name === 'cover_item_summary') return coverItem.summary || '';
      if (name === 'cover_item_url') return coverItem.url || '#';
      if (name === 'cover_item_thumbnail') return coverItem.thumbnail || '';
      if (name === 'cover_item_category') return coverItem.category || '';
      if (name === 'cover_item_category_url') return coverItem.categoryUrl || '#';
      if (name === 'cover_item_date') return coverItem.date || '';
      if (name === 'cover_item_simple_date') return coverItem.simpleDate || '';
      if (name === 'cover_item_comment_count') return String(coverItem.commentCount || 0);
    }

    // 7. List Variables (Category / Search / Tag List)
    if (name === 'list_conform') {
      if (context.viewType === 'search') return context.searchQuery || '검색어';
      if (context.viewType === 'tag') return context.currentTag || '태그';
      return context.currentCategory || '전체 글';
    }
    if (name === 'list_count') return String(context.listCount !== undefined ? context.listCount : (context.posts ? context.posts.length : 0));
    if (name === 'list_description') return context.listDescription || blog.Desc || '';
    if (name === 'list_style') return context.listStyle || 'list';
    if (name === 'list_image') return blog.Image || '';

    // List item (rep)
    if (post && name.startsWith('list_rep_')) {
      if (name === 'list_rep_link') return post.link || `/post/${post.id}`;
      if (name === 'list_rep_regdate') return post.simpleDate || post.date || '';
      if (name === 'list_rep_date_year') return post.year || '2026';
      if (name === 'list_rep_date_month') return post.month || '10';
      if (name === 'list_rep_date_day') return post.day || '05';
      if (name === 'list_rep_date_hour') return post.hour || '14';
      if (name === 'list_rep_date_minute') return post.minute || '30';
      if (name === 'list_rep_date_second') return post.second || '00';
      if (name === 'list_rep_title') return post.title || '';
      if (name === 'list_rep_title_text') return post.title || '';
      if (name === 'list_rep_category') return post.category || '';
      if (name === 'list_rep_category_link') return post.categoryLink || '#';
      if (name === 'list_rep_rp_cnt') return String(post.commentCount || (post.comments ? post.comments.length : 0));
      if (name === 'list_rep_author') return post.author || blog.Blogger || '';
      if (name === 'list_rep_summary') return post.summary || '';
      if (name === 'list_rep_thumbnail') return post.thumbnailUrl || '';
      if (name === 'list_rep_thumbnail_url') return post.rawThumbnailUrl || post.thumbnailUrl || '';
    }

    // 8. Tag Cloud Variables
    if (tag) {
      if (name === 'tag_link') return tag.link || `/tag/${encodeURIComponent(tag.name)}`;
      if (name === 'tag_class') return tag.class || 'cloud3';
      if (name === 'tag_name') return tag.name || '';
    }

    // 9. Comments (Legacy <s_rp_rep>)
    if (comment) {
      if (name === 'rp_rep_id') return comment.id || 'c1';
      if (name === 'rp_rep_name') return comment.name || '';
      if (name === 'rp_rep_date') return comment.date || '';
      if (name === 'rp_rep_desc') return comment.desc || '';
      if (name === 'rp_rep_logo') return `<img src="${comment.logo || ''}" width="36" height="36" style="border-radius:50%;" alt="" />`;
      if (name === 'rp_rep_link') return comment.link || `#${comment.id}`;
      if (name === 'rp_rep_class') return comment.isAdmin ? 'rp_admin' : 'rp_general';
      if (name === 'rp_rep_onclick_delete') return `alert('댓글 삭제');`;
      if (name === 'rp_rep_onclick_reply') return `alert('답글 쓰기');`;
    }
    if (reply) {
      if (name === 'rp_rep_id') return reply.id || 'r1';
      if (name === 'rp_rep_name') return reply.name || '';
      if (name === 'rp_rep_date') return reply.date || '';
      if (name === 'rp_rep_desc') return reply.desc || '';
      if (name === 'rp_rep_logo') return `<img src="${reply.logo || ''}" width="30" height="30" style="border-radius:50%;" alt="" />`;
      if (name === 'rp_rep_link') return reply.link || `#${reply.id}`;
      if (name === 'rp_rep_class') return reply.isAdmin ? 'rp_admin' : 'rp_general';
    }

    // Comment form inputs
    if (name === 'rp_input_comment') return 'comment';
    if (name === 'rp_onclick_submit') return `alert('댓글이 등록되었습니다.');`;
    if (name === 'rp_input_is_secret') return 'secret';
    if (name === 'rp_input_name') return 'name';
    if (name === 'guest_name') return '';
    if (name === 'rp_input_password') return 'password';
    if (name === 'rp_password') return '';
    if (name === 'rp_input_homepage') return 'homepage';
    if (name === 'guest_homepage') return '';

    // 10. Guestbook (Legacy <s_guest_rep>)
    if (guest) {
      if (name === 'guest_rep_id') return guest.id || 'g1';
      if (name === 'guest_rep_name') return guest.name || '';
      if (name === 'guest_rep_date') return guest.date || '';
      if (name === 'guest_rep_desc') return guest.desc || '';
      if (name === 'guest_rep_logo') return `<img src="${guest.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=80'}" width="36" height="36" style="border-radius:50%;" alt="" />`;
      if (name === 'guest_rep_class') return 'guest_general';
      if (name === 'guest_rep_onclick_delete') return `alert('방명록 삭제');`;
      if (name === 'guest_rep_onclick_reply') return `alert('방명록 답글');`;
    }
    if (guestReply) {
      if (name === 'guest_rep_id') return guestReply.id || 'gr1';
      if (name === 'guest_rep_name') return guestReply.name || '';
      if (name === 'guest_rep_date') return guestReply.date || '';
      if (name === 'guest_rep_desc') return guestReply.desc || '';
      if (name === 'guest_rep_class') return 'guest_admin';
    }
    if (name === 'guest_textarea_body') return 'body';
    if (name === 'guest_onclick_submit') return `alert('방명록이 등록되었습니다.');`;
    if (name === 'guest_input_name') return 'name';
    if (name === 'guest_input_password') return 'password';
    if (name === 'guest_input_homepage') return 'homepage';

    // 11. Pagination Variables
    if (pageItem) {
      if (name === 'paging_rep_link') return pageItem.link ? `href="${pageItem.link}"` : '';
      if (name === 'paging_rep_link_num') return `<span class="${pageItem.selected ? 'selected' : ''}">${pageItem.text}</span>`;
    }
    if (name === 'prev_page') return currentPage > 1 ? `href="/?page=${currentPage - 1}"` : '';
    if (name === 'next_page') return currentPage < totalPages ? `href="/?page=${currentPage + 1}"` : '';
    if (name === 'no_more_prev') return currentPage > 1 ? '' : 'no-more-prev';
    if (name === 'no_more_next') return currentPage < totalPages ? '' : 'no-more-next';

    // 12. Sidebar Recent / Popular posts and comments
    if (post && name.startsWith('rctps_rep_')) {
      if (name === 'rctps_rep_link') return post.link || `/post/${post.id}`;
      if (name === 'rctps_rep_title') return post.title || '';
      if (name === 'rctps_rep_rp_cnt') return String(post.commentCount || 0);
      if (name === 'rctps_rep_author') return post.author || '';
      if (name === 'rctps_rep_date') return post.date || '';
      if (name === 'rctps_rep_simple_date') return post.simpleDate || '';
      if (name === 'rctps_rep_thumbnail') return post.thumbnailUrl || '';
      if (name === 'rctps_rep_category') return post.category || '';
      if (name === 'rctps_rep_category_link') return post.categoryLink || '#';
    }
    if (comment && name.startsWith('rctrp_rep_')) {
      if (name === 'rctrp_rep_link') return comment.link || '#';
      if (name === 'rctrp_rep_desc') return comment.desc || '';
      if (name === 'rctrp_rep_name') return comment.name || '';
      if (name === 'rctrp_rep_time') return comment.date || '';
    }

    // Sidebar Search Box
    if (name === 'search_name') return 'search';
    if (name === 'search_text') return context.searchQuery || '';
    if (name === 'search_onclick_submit') return `location.href='/?viewType=search&q='+encodeURIComponent(document.querySelector('[name=search]')?.value || '');`;

    return '';
  }

  if (node.type === 'block') {
    const name = node.name;
    const blog = context.blog || {};

    // 1. Mandatory T3 Tag (<s_t3>)
    if (name === 't3') {
      const scriptTag = `<script type="text/javascript" src="https://t1.daumcdn.net/tistory_admin/blogs/script/blog/common.js"></script>\n<div style="margin:0; padding:0; border:none; background:none; float:none; clear:none; z-index:0"></div>\n`;
      return scriptTag + renderChildren(node, context);
    }

    // 2. Skin Option Conditionals: <s_if_var_{NAME}> / <s_not_var_{NAME}>
    if (name.startsWith('if_var_')) {
      const varName = name.substring(7);
      const val = (context.activeVariables && context.activeVariables[varName] !== undefined)
        ? context.activeVariables[varName]
        : (blog.variables ? blog.variables[varName] : null);
      const isTruthy = val && val !== 'false' && val !== '0' && val !== '';
      return isTruthy ? renderChildren(node, context) : '';
    }
    if (name.startsWith('not_var_')) {
      const varName = name.substring(8);
      const val = (context.activeVariables && context.activeVariables[varName] !== undefined)
        ? context.activeVariables[varName]
        : (blog.variables ? blog.variables[varName] : null);
      const isTruthy = val && val !== 'false' && val !== '0' && val !== '';
      return !isTruthy ? renderChildren(node, context) : '';
    }

    // 3. Home Cover Block (<s_cover_group>, <s_cover_rep>, <s_cover>)
    if (name === 'cover_group') {
      // In Tistory, cover group is rendered ONLY on home screen (viewType === 'index') and if covers are active
      if (context.viewType !== 'index' || context.enableCovers === false) {
        return '';
      }
      return renderChildren(node, context);
    }

    if (name === 'cover_rep') {
      if (context.viewType !== 'index' || context.enableCovers === false) {
        return '';
      }
      const covers = context.covers || [];
      return covers.map(cov => {
        const nextContext = { ...context, currentCover: cov };
        return renderChildren(node, nextContext);
      }).join('');
    }

    if (name === 'cover') {
      // Check if cover matches currentCover name attribute
      const coverNameAttr = node.attrs && node.attrs.name;
      if (context.currentCover && coverNameAttr && context.currentCover.name.toLowerCase() === coverNameAttr.toLowerCase()) {
        return renderChildren(node, context);
      }
      return '';
    }

    if (name === 'cover_url') {
      if (context.currentCover && context.currentCover.url) {
        return renderChildren(node, context);
      }
      return '';
    }

    if (name === 'cover_item') {
      if (!context.currentCover || !context.currentCover.items) return '';
      return context.currentCover.items.map(item => {
        const nextContext = { ...context, currentCoverItem: item };
        return renderChildren(node, nextContext);
      }).join('');
    }

    if (name === 'cover_item_article_info') {
      return (context.currentCoverItem && context.currentCoverItem.isArticle) ? renderChildren(node, context) : '';
    }

    if (name === 'cover_item_not_article_info') {
      return (context.currentCoverItem && !context.currentCoverItem.isArticle) ? renderChildren(node, context) : '';
    }

    if (name === 'cover_item_thumbnail') {
      return (context.currentCoverItem && context.currentCoverItem.thumbnail) ? renderChildren(node, context) : '';
    }

    // 4. Articles Loop & Conditions (<s_article_rep>, <s_index_article_rep>, <s_permalink_article_rep>)
    if (name === 'article_rep') {
      // If we are on index with cover enabled, articles are typically not rendered unless cover is disabled
      if (context.viewType === 'index' && context.enableCovers === true) {
        return '';
      }

      // If viewing tag cloud or guestbook, article rep does not render
      if (context.viewType === 'tag' || context.viewType === 'guestbook' || context.viewType === 'protected' || context.viewType === 'page') {
        return '';
      }

      const postsToRender = context.viewType === 'permalink'
        ? (context.currentPost ? [context.currentPost] : (context.posts.length > 0 ? [context.posts[0]] : []))
        : (context.posts || []);

      return postsToRender.map(p => {
        const nextContext = { ...context, currentPost: p };
        return renderChildren(node, nextContext);
      }).join('');
    }

    if (name === 'index_article_rep') {
      // Only renders on index / category / search / archive (not on single post permalink)
      const isIndexView = ['index', 'category', 'search', 'archive'].includes(context.viewType);
      return isIndexView ? renderChildren(node, context) : '';
    }

    if (name === 'permalink_article_rep') {
      // Only renders on permalink / post
      return context.viewType === 'permalink' ? renderChildren(node, context) : '';
    }

    if (name === 'article_rep_thumbnail') {
      const target = context.currentPost || context.currentNotice;
      return (target && target.thumbnailUrl) ? renderChildren(node, context) : '';
    }

    if (name === 'rp_count') {
      return renderChildren(node, context);
    }

    if (name === 'tag_label') {
      return (context.currentPost && context.currentPost.tags && context.currentPost.tags.length > 0)
        ? renderChildren(node, context)
        : '';
    }

    if (name === 'ad_div') {
      // 글 관리 기능 (관리자 권한 있는 경우)
      return renderChildren(node, context);
    }

    // Related Articles (<s_article_related>, <s_article_related_rep>)
    if (name === 'article_related') {
      return context.viewType === 'permalink' ? renderChildren(node, context) : '';
    }
    if (name === 'article_related_rep') {
      const related = (context.posts || []).filter(p => !context.currentPost || p.id !== context.currentPost.id).slice(0, 4);
      return related.map(p => {
        const nextContext = { ...context, currentPost: p };
        return renderChildren(node, nextContext);
      }).join('');
    }
    if (name === 'article_related_rep_thumbnail') {
      return (context.currentPost && context.currentPost.thumbnailUrl) ? renderChildren(node, context) : '';
    }

    // Prev / Next Articles
    if (name === 'article_prev') {
      return context.viewType === 'permalink' ? renderChildren(node, context) : '';
    }
    if (name === 'article_prev_thumbnail') {
      return (context.currentPost && context.currentPost.thumbnailUrl) ? renderChildren(node, context) : '';
    }
    if (name === 'article_next') {
      return context.viewType === 'permalink' ? renderChildren(node, context) : '';
    }
    if (name === 'article_next_thumbnail') {
      return (context.currentPost && context.currentPost.thumbnailUrl) ? renderChildren(node, context) : '';
    }

    // 5. Notice Block (<s_notice_rep>)
    if (name === 'notice_rep') {
      if (context.viewType !== 'notice') return '';
      const notices = context.notices || [];
      return notices.map(n => {
        const nextContext = { ...context, currentNotice: n };
        return renderChildren(node, nextContext);
      }).join('');
    }
    if (name === 'notice_rep_thumbnail') {
      return (context.currentNotice && context.currentNotice.thumbnailUrl) ? renderChildren(node, context) : '';
    }

    // 6. Standalone Page Block (<s_page_rep>)
    if (name === 'page_rep') {
      if (context.viewType !== 'page') return '';
      const pages = context.pages || [];
      const targetPage = pages[0] || { id: 'page-1', title: '페이지', desc: '<p>페이지 내용</p>' };
      const nextContext = { ...context, currentPost: targetPage };
      return renderChildren(node, nextContext);
    }

    // 7. Protected Article (<s_article_protected>)
    if (name === 'article_protected') {
      return context.viewType === 'protected' ? renderChildren(node, context) : '';
    }

    // 8. List Block (<s_list>, <s_list_rep>, <s_list_empty>)
    if (name === 'list') {
      const isListView = ['category', 'search', 'tag'].includes(context.viewType);
      return isListView ? renderChildren(node, context) : '';
    }
    if (name === 'list_image') {
      return blog.Image ? renderChildren(node, context) : '';
    }
    if (name === 'list_empty') {
      const isEmpty = !context.posts || context.posts.length === 0;
      return isEmpty ? renderChildren(node, context) : '';
    }
    if (name === 'list_rep') {
      const posts = context.posts || [];
      return posts.map(p => {
        const nextContext = { ...context, currentPost: p };
        return renderChildren(node, nextContext);
      }).join('');
    }
    if (name === 'list_rep_thumbnail') {
      return (context.currentPost && context.currentPost.thumbnailUrl) ? renderChildren(node, context) : '';
    }

    // 9. Tag Cloud Block (<s_tag>, <s_tag_rep>)
    if (name === 'tag') {
      return context.viewType === 'tag' ? renderChildren(node, context) : '';
    }
    if (name === 'tag_rep') {
      const tags = context.tags || [];
      return tags.map(t => {
        const nextContext = { ...context, currentTagItem: t };
        return renderChildren(node, nextContext);
      }).join('');
    }

    // 10. Guestbook Block (<s_guest>, <s_guest_rep>)
    if (name === 'guest') {
      return context.viewType === 'guestbook' ? renderChildren(node, context) : '';
    }
    if (name === 'guest_input_form') {
      return renderChildren(node, context);
    }
    if (name === 'guest_member' || name === 'guest_form') {
      return renderChildren(node, context);
    }
    if (name === 'guest_container') {
      return renderChildren(node, context);
    }
    if (name === 'guest_rep') {
      const guestbook = context.guestbook || [];
      return guestbook.map(g => {
        const nextContext = { ...context, currentGuest: g };
        return renderChildren(node, nextContext);
      }).join('');
    }
    if (name === 'guest_reply_container') {
      return (context.currentGuest && context.currentGuest.replies && context.currentGuest.replies.length > 0)
        ? renderChildren(node, context)
        : '';
    }
    if (name === 'guest_reply_rep') {
      if (!context.currentGuest || !context.currentGuest.replies) return '';
      return context.currentGuest.replies.map(r => {
        const nextContext = { ...context, currentGuestReply: r };
        return renderChildren(node, nextContext);
      }).join('');
    }

    // 11. Comments Legacy (<s_rp>, <s_rp_container>, <s_rp_rep>)
    if (name === 'rp') {
      return (context.viewType === 'permalink' || context.viewType === 'notice') ? renderChildren(node, context) : '';
    }
    if (name === 'rp_input_form' || name === 'rp_member' || name === 'rp_guest') {
      return renderChildren(node, context);
    }
    if (name === 'rp_container') {
      return renderChildren(node, context);
    }
    if (name === 'rp_rep') {
      const comments = (context.currentPost && context.currentPost.comments) ? context.currentPost.comments : [];
      return comments.map(c => {
        const nextContext = { ...context, currentComment: c };
        return renderChildren(node, nextContext);
      }).join('');
    }
    if (name === 'rp2_container') {
      return (context.currentComment && context.currentComment.replies && context.currentComment.replies.length > 0)
        ? renderChildren(node, context)
        : '';
    }
    if (name === 'rp2_rep') {
      if (!context.currentComment || !context.currentComment.replies) return '';
      return context.currentComment.replies.map(rep => {
        const nextContext = { ...context, currentReply: rep };
        return renderChildren(node, nextContext);
      }).join('');
    }

    // 12. Paging Block (<s_paging>, <s_paging_rep>)
    if (name === 'paging') {
      // Hide paging if viewing protected or single permalink
      if (context.viewType === 'protected') return '';
      return renderChildren(node, context);
    }
    if (name === 'paging_rep') {
      const currentPage = Number(context.currentPage || context.page || 1);
      const totalPages = Number(context.totalPages || 123);
      const items = context.pagingItems || getPaginationItems(currentPage, totalPages);
      return items.map(item => {
        const nextContext = {
          ...context,
          currentPageItem: item,
          currentPageNum: item.num
        };
        return renderChildren(node, nextContext);
      }).join('');
    }

    // 13. Sidebar Elements (<s_sidebar>, <s_sidebar_element>)
    if (name === 'sidebar') {
      return renderChildren(node, context);
    }
    if (name === 'sidebar_element') {
      return renderChildren(node, context);
    }
    if (name === 'rctps_rep') {
      // Recent posts in sidebar
      const recent = (context.posts || []).slice(0, 5);
      return recent.map(p => {
        const nextContext = { ...context, currentPost: p };
        return renderChildren(node, nextContext);
      }).join('');
    }
    if (name === 'rctps_popular_rep') {
      // Popular posts in sidebar
      const popular = (context.posts || []).slice(0, 5);
      return popular.map(p => {
        const nextContext = { ...context, currentPost: p };
        return renderChildren(node, nextContext);
      }).join('');
    }
    if (name === 'rctps_rep_thumbnail') {
      return (context.currentPost && context.currentPost.thumbnailUrl) ? renderChildren(node, context) : '';
    }
    if (name === 'rct_notice') {
      return (context.notices && context.notices.length > 0) ? renderChildren(node, context) : '';
    }
    if (name === 'rct_notice_rep') {
      const notices = (context.notices || []).slice(0, 5);
      return notices.map(n => {
        const nextContext = { ...context, currentNotice: n };
        return renderChildren(node, nextContext);
      }).join('');
    }
    if (name === 'rctrp_rep') {
      // Recent comments in sidebar
      const recentComments = [
        { desc: '글이 정말 유익하네요! Server Components 번들 사이즈...', name: '김프론트', date: '10.05', link: '/1#c1' },
        { desc: '로컬 프리뷰 도구가 절실했는데 정말 유용한 정리입니다!', name: '스킨마스터', date: '10.04', link: '/2#c3' }
      ];
      return recentComments.map(c => {
        const nextContext = { ...context, currentComment: c };
        return renderChildren(node, nextContext);
      }).join('');
    }
    if (name === 'random_tags') {
      // Sidebar random tags
      const sampleTags = (context.tags || []).slice(0, 8);
      return sampleTags.map(t => {
        const nextContext = { ...context, currentTagItem: t };
        return renderChildren(node, nextContext);
      }).join('');
    }
    if (name === 'search') {
      return renderChildren(node, context);
    }

    // Default fallback for any unrecognized group: render children
    return renderChildren(node, context);
  }

  return '';
}

/**
 * Main compile entrypoint
 */
function compile(template, context) {
  const tokens = tokenize(template);
  const ast = buildAST(tokens);
  return evaluateAST(ast, context);
}

module.exports = {
  tokenize,
  buildAST,
  evaluateAST,
  compile
};
