// 当插件安装或更新时，自动注入content script到所有已打开的页面
chrome.runtime.onInstalled.addListener(() => {
  console.log('插件已安装/更新，开始注入content script...');
  injectToAllTabs();
});

// 当标签页更新时，确保content script已注入
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('show.now')) {
    console.log('标签页加载完成，注入content script:', tab.url);
    injectContentScript(tabId);
  }
});

// 注入到show.now相关标签页
function injectToAllTabs() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.url && tab.url.includes('show.now')) {
        injectContentScript(tab.id);
      }
    });
  });
}

// 注入content script到指定标签页
function injectContentScript(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ['content.js']
  }).then(() => {
    console.log('Content script已注入到标签页:', tabId);
  }).catch((err) => {
    console.log('注入失败:', err);
  });
} 