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
      
      console.log('发送消息到标签页:', tabs[0].id);
      
      chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleStatus'}, function(response) {
        if (chrome.runtime.lastError) {
          console.error('发送消息出错:', chrome.runtime.lastError);
          // 即使消息发送失败，也更新UI
          isEnabled = !isEnabled;
          updateUI();
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

  // 获取content script的实际状态
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs && tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'getStatus'}, function(response) {
        if (response && response.isEnabled !== undefined) {
          isEnabled = response.isEnabled;
        }
        updateUI();
      });
    } else {
      updateUI();
    }
  });
}); 