document.addEventListener('DOMContentLoaded', function() {
  const status = document.getElementById('status');
  const toggleBtn = document.getElementById('toggleBtn');
  let isEnabled = false; // 默认暂停状态

  function updateUI() {
    if (isEnabled) {
      status.textContent = '运行中';
      status.className = 'status';
      toggleBtn.textContent = '暂停';
      toggleBtn.className = 'btn-off';
    } else {
      status.textContent = '已暂停';
      status.className = 'status paused';
      toggleBtn.textContent = '启动';
      toggleBtn.className = 'btn-on';
    }
  }

  // 检查当前页面是否支持红包助手
  function checkPageSupport() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (chrome.runtime.lastError) {
        console.error('查询标签页出错:', chrome.runtime.lastError);
        status.textContent = '错误：无法访问页面';
        status.className = 'status paused';
        return;
      }
      
      if (!tabs || tabs.length === 0) {
        console.error('没有找到活动标签页');
        status.textContent = '错误：没有活动标签页';
        status.className = 'status paused';
        return;
      }
      
      const currentTab = tabs[0];
      console.log('当前页面URL:', currentTab.url);
      
      // 检查是否是支持的域名
      if (!currentTab.url || !currentTab.url.includes('show.now')) {
        status.textContent = '请在show.now网站使用';
        status.className = 'status paused';
        toggleBtn.disabled = true;
        toggleBtn.textContent = '不支持此页面';
        return;
      }
      
      // 尝试获取content script状态
      chrome.tabs.sendMessage(currentTab.id, {action: 'getStatus'}, function(response) {
        if (chrome.runtime.lastError) {
          console.log('Content script未响应，尝试注入...');
          // Content script可能没有注入，尝试注入
          chrome.scripting.executeScript({
            target: { tabId: currentTab.id },
            files: ['content.js']
          }).then(() => {
            console.log('Content script注入成功');
            // 等待一下再尝试获取状态
            setTimeout(() => {
              chrome.tabs.sendMessage(currentTab.id, {action: 'getStatus'}, function(response) {
                if (response && response.isEnabled !== undefined) {
                  isEnabled = response.isEnabled;
                }
                updateUI();
              });
            }, 500);
          }).catch((err) => {
            console.error('注入失败:', err);
            status.textContent = '注入失败';
            status.className = 'status paused';
          });
        } else {
          console.log('收到响应:', response);
          if (response && response.isEnabled !== undefined) {
            isEnabled = response.isEnabled;
          }
          updateUI();
        }
      });
    });
  }

  toggleBtn.addEventListener('click', function() {
    console.log('按钮被点击');
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (chrome.runtime.lastError) {
        console.error('查询标签页出错:', chrome.runtime.lastError);
        return;
      }
      
      if (!tabs || tabs.length === 0) {
        console.error('没有找到活动标签页');
        return;
      }
      
      const currentTab = tabs[0];
      
      // 检查是否是支持的域名
      if (!currentTab.url || !currentTab.url.includes('show.now')) {
        alert('请在show.now网站使用此插件');
        return;
      }
      
      console.log('发送消息到标签页:', currentTab.id);
      
      chrome.tabs.sendMessage(currentTab.id, {action: 'toggleStatus'}, function(response) {
        if (chrome.runtime.lastError) {
          console.error('发送消息出错:', chrome.runtime.lastError);
          // 尝试重新注入content script
          chrome.scripting.executeScript({
            target: { tabId: currentTab.id },
            files: ['content.js']
          }).then(() => {
            console.log('重新注入成功，重试发送消息');
            setTimeout(() => {
              chrome.tabs.sendMessage(currentTab.id, {action: 'toggleStatus'}, function(response) {
                if (response && response.success) {
                  isEnabled = !isEnabled;
                  updateUI();
                } else {
                  // 即使消息发送失败，也更新UI
                  isEnabled = !isEnabled;
                  updateUI();
                }
              });
            }, 500);
          }).catch((err) => {
            console.error('重新注入失败:', err);
            // 即使注入失败，也更新UI
            isEnabled = !isEnabled;
            updateUI();
          });
          return;
        }
        
        console.log('收到响应:', response);
        if (response && response.success) {
          isEnabled = !isEnabled;
          updateUI();
        } else {
          // 如果没有收到正确响应，也尝试更新UI
          isEnabled = !isEnabled;
          updateUI();
        }
      });
    });
  });

  // 页面加载时检查支持情况
  checkPageSupport();
}); 