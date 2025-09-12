// 极简版 MetaID 红包助手 - 长时间挂机优化版
// 防止重复注入
if (!window.metaidHongbaoLoaded) {
  window.metaidHongbaoLoaded = true;
  console.log('🚀 content.js 脚本已加载');

  let isEnabled = false; // 默认不启动
  let interval = null;
  let lastCloseTime = 0; // 记录上次关闭时间，避免重复关闭
  let observer = null; // DOM变化监听器
  let lastCheckTime = 0; // 记录上次检查时间
  let checkCount = 0; // 检查次数统计

  // 开始监控
  function startMonitoring() {
    console.log(' 开始监控红包...');
    
    // 立即检查一次
    checkAndClickHongbao();
    
    // 设置定时检查 - 使用更可靠的定时器
    interval = setInterval(() => {
      if (isEnabled) {
        checkAndClickHongbao();
        checkCount++;
        
        // 每100次检查输出一次状态日志
        if (checkCount % 100 === 0) {
          console.log(`📊 监控状态: 已检查${checkCount}次，运行正常`);
        }
      }
    }, 50);
    
    // 设置DOM变化监听
    setupDOMObserver();
    
    // 设置页面可见性监听
    setupVisibilityListener();
    
    // 设置定期清理机制
    setupCleanupInterval();
  }

  // 设置页面可见性监听
  function setupVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && isEnabled) {
        console.log('️ 页面重新可见，立即检查红包');
        setTimeout(() => {
          checkAndClickHongbao();
        }, 500);
      }
    });
  }

  // 设置定期清理机制
  function setupCleanupInterval() {
    setInterval(() => {
      if (isEnabled) {
        // 清理过期的点击记录（超过1小时）
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        
        Object.keys(window).forEach(key => {
          if (key.startsWith('clicked_') && window[key] && typeof window[key] === 'number') {
            if (now - window[key] > oneHour) {
              delete window[key];
            }
          }
        });
        
        console.log(' 定期清理完成');
      }
    }, 30 * 60 * 1000); // 每30分钟清理一次
  }

  // 设置DOM变化监听
  function setupDOMObserver() {
    if (observer) {
      observer.disconnect();
    }
    
    observer = new MutationObserver((mutations) => {
      if (!isEnabled) return;
      
      let hasRelevantChanges = false;
      mutations.forEach((mutation) => {
        // 检查是否有新的节点添加
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // 检查新添加的元素是否包含红包
              if (node.textContent && node.textContent.includes('Grab a Candy Bag')) {
                hasRelevantChanges = true;
              }
              // 检查子元素
              const childElements = node.querySelectorAll ? node.querySelectorAll('*') : [];
              childElements.forEach(element => {
                if (element.textContent && element.textContent.includes('Grab a Candy Bag')) {
                  hasRelevantChanges = true;
                }
              });
            }
          });
        }
      });
      
      // 如果有相关变化，立即检查
      if (hasRelevantChanges) {
        console.log('👁️ DOM变化检测到新内容，立即检查红包');
        setTimeout(() => {
          checkAndClickHongbao();
        }, 100); // 延迟100ms确保DOM完全更新
      }
    });
    
    // 开始监听
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    console.log('👁️ DOM变化监听已启动');
  }

  // 检查并点击红包 - 优化版本，适配新的按钮结构
  function checkAndClickHongbao() {
    const now = Date.now();
    lastCheckTime = now;
    
    // 查找红包元素 - 使用更宽泛的选择器
    let hongbaoElements = document.querySelectorAll('div[data-v-cbc6048c].rounded-xl.p-4.flex.space-x-2.bg-gradient-to-br:not([data-clicked])');
    
    // 如果没找到，尝试更宽泛的选择器
    if (hongbaoElements.length === 0) {
      hongbaoElements = document.querySelectorAll('div:not([data-clicked])');
    }
    
    let hongbaoClicked = false;
    
    if (hongbaoElements.length > 0) {
      hongbaoElements.forEach((element, index) => {
        const hasGrabCandyText = element.textContent.includes('Grab a Candy Bag');
        
        if (hasGrabCandyText && !element.dataset.clicked) {
          // 使用时间戳作为唯一标识，避免长时间运行时的冲突
          const elementText = element.textContent.trim();
          const clickKey = `clicked_${elementText}_${now}`;
          
          if (!window[clickKey]) {
            window[clickKey] = now; // 记录点击时间
            element.dataset.clicked = 'true'; // 标记为已点击
            element.click();
            hongbaoClicked = true;
            console.log(`🎁 发现"Grab a Candy Bag"红包，已点击`);
          }
        }
      });
    }

    // 检查红包弹窗中的新按钮结构
    let giftButtonFound = false;
    let needCloseHongbao = false;
    
    // 检查是否需要关闭红包 - 扩展检测条件
    const allText = document.body.textContent || '';
    const closeConditions = [
      'All the Candy Bags have been opened',
      'All candy bags have been opened', 
      'No more candy bags available',
      'Candy bags are empty',
      'No candy bags left',
      'All bags opened',
      '红包已开完',
      '没有更多红包',
      '所有红包已打开'
    ];
    
    for (const condition of closeConditions) {
      if (allText.includes(condition)) {
        console.log(`📋 检测到红包已开完: ${condition}，准备关闭`);
        needCloseHongbao = true;
        break;
      }
    }
    
    // 查找新的礼物按钮 - 根据你提供的HTML结构
    const giftButtons = document.querySelectorAll('div.gift-button-gradient, div[class*="gift-button"], div[class*="rounded-full"][class*="cursor-pointer"]');
    
    giftButtons.forEach(button => {
      // 检查是否包含礼物图标
      const hasGiftIcon = button.querySelector('img[src*="gift"], img[src*="mvc_gift"], svg') || 
                         button.innerHTML.includes('gift') ||
                         button.innerHTML.includes('mvc_gift');
      
      // 检查是否在红包弹窗中
      const isInHongbaoModal = button.closest('.modal') || 
                              button.closest('[role="dialog"]') ||
                              button.closest('.popup') ||
                              button.closest('.overlay') ||
                              button.closest('[class*="absolute"]');
      
      if (hasGiftIcon && isInHongbaoModal && !button.dataset.giftClicked) {
        const rect = button.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          button.dataset.giftClicked = 'true'; // 标记为已点击
          button.click();
          console.log('🎁 礼物按钮已点击');
          giftButtonFound = true;
        }
      }
    });
    
    // 如果没找到新的礼物按钮，尝试更宽泛的搜索
    if (!giftButtonFound) {
      const allClickableElements = document.querySelectorAll('div[class*="cursor-pointer"], button, [role="button"]');
      
      allClickableElements.forEach(element => {
        // 检查是否在红包弹窗中且包含礼物相关元素
        const isInModal = element.closest('.modal') || 
                         element.closest('[role="dialog"]') ||
                         element.closest('.popup') ||
                         element.closest('.overlay') ||
                         element.closest('[class*="absolute"]');
        
        const hasGiftContent = element.innerHTML.includes('gift') ||
                              element.innerHTML.includes('mvc_gift') ||
                              element.querySelector('img[src*="gift"]') ||
                              element.querySelector('img[src*="mvc_gift"]') ||
                              element.textContent.includes('Candy Bag') ||
                              element.textContent.includes('Giveaway');
        
        if (isInModal && hasGiftContent && !element.dataset.giftClicked) {
          const rect = element.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            element.dataset.giftClicked = 'true';
            element.click();
            console.log('🎁 红包弹窗中的礼物元素已点击');
            giftButtonFound = true;
          }
        }
      });
    }
    
    // 检查并点击X按钮关闭红包
    const closeButtons = document.querySelectorAll('button, div, span');
    closeButtons.forEach(button => {
      const hasXIcon = button.querySelector('use[xlink\\:href="#icon-x"]') || 
                      button.querySelector('use[href="#icon-x"]') ||
                      button.innerHTML.includes('icon-x');
      
      const isInHongbaoModal = button.closest('.modal') || 
                              button.closest('[role="dialog"]') ||
                              button.closest('.popup') ||
                              button.closest('.overlay');
      
      if (hasXIcon && isInHongbaoModal) {
        const rect = button.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          button.click();
          console.log('❌ X按钮已点击，红包已关闭');
          giftButtonFound = true;
        }
      }
    });
    
    // 处理红包关闭逻辑
    if (needCloseHongbao || (hongbaoClicked && !giftButtonFound)) {
      // 延迟一下再关闭，给红包弹窗时间显示
      setTimeout(() => {
        simulateEscKey();
      }, 500);
    } else if (giftButtonFound) {
      console.log('✅ 红包已处理完成');
    }
  }

  // 模拟ESC键
  function simulateEscKey() {
    const escEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      which: 27,
      bubbles: true,
      cancelable: true
    });
    
    document.dispatchEvent(escEvent);
  }

  // 切换状态
  function toggleStatus() {
    isEnabled = !isEnabled;
    
    if (isEnabled) {
      if (!interval) {
        startMonitoring();
      }
      console.log('🟢 红包助手已启动，开始监控...');
    } else {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      console.log(' 红包助手已暂停');
    }
  }

  // 不自动启动，等待用户手动启动
  console.log('🎁 MetaID 红包助手已加载，等待启动...');

  // 监听消息
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('收到消息:', request);
    
    if (request.action === 'toggleStatus') {
      toggleStatus();
      sendResponse({ success: true });
      return true;
    } else if (request.action === 'getStatus') {
      sendResponse({ isEnabled: isEnabled });
      return true;
    }
    
    return false;
  });
} else {
  console.log('🚀 content.js 已加载，跳过重复注入');
} 