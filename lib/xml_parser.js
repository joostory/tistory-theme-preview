// Tistory index.xml parser
const fs = require('fs');

/**
 * Strips CDATA and trims string
 */
function cleanXmlText(str) {
  if (!str) return '';
  return str.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

/**
 * Extracts inner content of the first matching XML tag
 */
function getTagContent(xml, tagName) {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = xml.match(regex);
  return match ? cleanXmlText(match[1]) : '';
}

/**
 * Extracts all matching tag blocks
 */
function getAllTags(xml, tagName) {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'gi');
  const results = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    results.push(match[1]);
  }
  return results;
}

/**
 * Parses index.xml into structured JSON
 */
function parseIndexXml(xmlContent) {
  const result = {
    information: {},
    author: {},
    default: {},
    coverItems: [],
    variables: [],
    liststyles: []
  };

  if (!xmlContent || typeof xmlContent !== 'string') {
    return result;
  }

  // 1. information
  const infoBlock = getTagContent(xmlContent, 'information');
  if (infoBlock) {
    result.information = {
      name: getTagContent(infoBlock, 'name'),
      version: getTagContent(infoBlock, 'version'),
      description: getTagContent(infoBlock, 'description'),
      license: getTagContent(infoBlock, 'license')
    };
  }

  // 2. author
  const authorBlock = getTagContent(xmlContent, 'author');
  if (authorBlock) {
    result.author = {
      name: getTagContent(authorBlock, 'name'),
      homepage: getTagContent(authorBlock, 'homepage'),
      email: getTagContent(authorBlock, 'email')
    };
  }

  // 3. default
  const defaultBlock = getTagContent(xmlContent, 'default');
  if (defaultBlock) {
    const coverJsonStr = getTagContent(defaultBlock, 'cover');
    let defaultCover = null;
    if (coverJsonStr) {
      try {
        defaultCover = JSON.parse(coverJsonStr);
      } catch (e) {
        defaultCover = null;
      }
    }

    result.default = {
      recentEntries: parseInt(getTagContent(defaultBlock, 'recentEntries'), 10) || 5,
      recentComments: parseInt(getTagContent(defaultBlock, 'recentComments'), 10) || 5,
      recentTrackbacks: parseInt(getTagContent(defaultBlock, 'recentTrackbacks'), 10) || 5,
      itemsOnGuestbook: parseInt(getTagContent(defaultBlock, 'itemsOnGuestbook'), 10) || 10,
      tagsInCloud: parseInt(getTagContent(defaultBlock, 'tagsInCloud'), 10) || 30,
      sortInCloud: parseInt(getTagContent(defaultBlock, 'sortInCloud'), 10) || 3,
      expandComment: parseInt(getTagContent(defaultBlock, 'expandComment'), 10) || 0,
      lengthOfRecentNotice: parseInt(getTagContent(defaultBlock, 'lengthOfRecentNotice'), 10) || 25,
      lengthOfRecentEntry: parseInt(getTagContent(defaultBlock, 'lengthOfRecentEntry'), 10) || 27,
      lengthOfRecentComment: parseInt(getTagContent(defaultBlock, 'lengthOfRecentComment'), 10) || 30,
      liststyle: getTagContent(defaultBlock, 'liststyle') || 'list',
      cover: defaultCover
    };
  }

  // 4. cover definition (search for cover block that contains <item>)
  const allCoverBlocks = getAllTags(xmlContent, 'cover');
  const coverDefBlock = allCoverBlocks.find(b => b.includes('<item')) || '';
  if (coverDefBlock) {
    const itemBlocks = getAllTags(coverDefBlock, 'item');
    result.coverItems = itemBlocks.map(itemXml => ({
      name: getTagContent(itemXml, 'name'),
      label: getTagContent(itemXml, 'label'),
      description: getTagContent(itemXml, 'description')
    }));
  }

  // 5. variables definition
  const variablesBlock = getTagContent(xmlContent, 'variables');
  if (variablesBlock) {
    const groupRegex = /<variablegroup(?:\s+name=["']([^"']*)["'])?[^>]*>([\s\S]*?)<\/variablegroup>/gi;
    let groupMatch;
    while ((groupMatch = groupRegex.exec(variablesBlock)) !== null) {
      const groupName = groupMatch[1] || '기본 설정';
      const groupInner = groupMatch[2];
      const varBlocks = getAllTags(groupInner, 'variable');

      for (const varXml of varBlocks) {
        const name = getTagContent(varXml, 'name');
        if (!name) continue;

        const label = getTagContent(varXml, 'label') || name;
        const type = (getTagContent(varXml, 'type') || 'STRING').toUpperCase();
        const description = getTagContent(varXml, 'description');
        const defaultVal = getTagContent(varXml, 'default');
        const optionStr = getTagContent(varXml, 'option');

        let options = [];
        if (type === 'SELECT' && optionStr) {
          try {
            options = JSON.parse(optionStr);
          } catch (e) {
            options = [];
          }
        }

        result.variables.push({
          name,
          label,
          type,
          description,
          default: defaultVal,
          options,
          group: groupName
        });
      }
    }
  }

  // 6. liststyle definition (search for liststyle block that contains <item>)
  const allListStyleBlocks = getAllTags(xmlContent, 'liststyle');
  const liststyleDefBlock = allListStyleBlocks.find(b => b.includes('<item')) || '';
  if (liststyleDefBlock) {
    const itemBlocks = getAllTags(liststyleDefBlock, 'item');
    result.liststyles = itemBlocks.map(itemXml => ({
      label: getTagContent(itemXml, 'label'),
      value: getTagContent(itemXml, 'value')
    }));
  }

  return result;
}

/**
 * Reads and parses index.xml from skin folder if it exists
 */
function loadIndexXml(skinDirPath) {
  const filePath = fs.existsSync(skinDirPath) && fs.statSync(skinDirPath).isDirectory()
    ? require('path').join(skinDirPath, 'index.xml')
    : skinDirPath;

  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return parseIndexXml(content);
    } catch (e) {
      console.warn(`[index.xml] 읽기 오류: ${e.message}`);
    }
  }
  return null;
}

module.exports = {
  parseIndexXml,
  loadIndexXml
};
