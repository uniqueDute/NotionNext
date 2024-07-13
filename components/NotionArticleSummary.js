

export function createSummaryBox(articleBox) {
    const wrapperDiv = articleBox;
    if (!wrapperDiv) {
        console.error('Article wrapper not found');
        return;
    }
    const oldSummaryBox = wrapperDiv.querySelector('.post-ai');
    if (oldSummaryBox) {
        console.log('Article');
        wrapperDiv.removeChild(oldSummaryBox);
    }

    const summaryBox = document.createElement('div');
    summaryBox.classList.add('post-ai');
    summaryBox.id = 'post-ai';
    summaryBox.style.backgroundColor = '#f9fafa'; 
    summaryBox.style.margin = '8px 0 0 0'; 

    const aiTitleDiv = document.createElement('div');
    aiTitleDiv.style.padding = '8px 8px 5px 14px'; 

    const svgIcon = `<img src='/svg/dianshi.svg' width='32' height='32' alt='AI Icon' />`;
    aiTitleDiv.innerHTML = svgIcon + '<span style="font-size: 20px;">AI摘要</span>';
    // 设置 div 的样式以使图标和文本并排显示
    aiTitleDiv.style.display = 'flex';
    aiTitleDiv.style.alignItems = 'center';

    // 获取图标元素并设置右边距
    const icon = aiTitleDiv.querySelector('img');
    icon.style.marginRight = '8px';

    const aiSpeechBox = document.createElement('div');
    aiSpeechBox.classList.add('ai-speech-box');
     // 设置内边距（上, 右, 下, 左）
    aiSpeechBox.style.padding = '0 14px 14px 14px';
    aiSpeechBox.style.backgroundColor = '#f9fafa';

    const aiSpeechContent = document.createElement('div');
    aiSpeechContent.style.padding = '5px'; 
    aiSpeechContent.classList.add('ai-speech-content');
    aiSpeechContent.style.backgroundColor = '#ffffff';
    aiSpeechContent.style.color = '#1e1e1e';
    aiSpeechContent.style.textAlign = 'justify'; 
    aiSpeechContent.style.lineHeight = '1.6'; 
    aiSpeechContent.innerText = '正在生成，请稍候...';
    aiSpeechBox.appendChild(aiSpeechContent);
    summaryBox.appendChild(aiTitleDiv);
    summaryBox.appendChild(aiSpeechBox);
    wrapperDiv.insertBefore(summaryBox, wrapperDiv.firstChild);
    summarizeArticle(articleBox);
}

export function clearSummaryBox() {
    const summaryBox = document.getElementById('post-ai');
    if (summaryBox) {
        console.log('Clearing summary box');
        summaryBox.remove();
    } else {
        console.log('Summary box not found');
    }
}

 async function summarizeArticle(articleBox) {
    const contentArray = [];

    const blogTitleElement = articleBox.querySelector('h2.notion-h-title');
    if (blogTitleElement) {
        contentArray.push(blogTitleElement.innerText);
    }

    const notionCalloutElement = articleBox.querySelector('.notion-callout-text');
    if (notionCalloutElement) {
        contentArray.push(notionCalloutElement.innerText);
    }

    const contentElements = articleBox.querySelectorAll('.notion-text, ol.notion-list-numbered');
    contentElements.forEach(element => {
        if (element.classList.contains('notion-text')) {
            contentArray.push(element.innerText);
        } else if (element.tagName.toLowerCase() === 'ol') {
            const listItems = [...element.children].map(li => li.innerText).join('\n');
            contentArray.push(listItems);
        }
    });

    const blogContent = contentArray.join('\n\n');


    let summaryContentDiv = document.getElementById('summaryContentDiv');

    // Create and append summaryText and cursor elements
    const summaryText = document.createElement('span');
    summaryText.id = 'summaryText';
    summaryContentDiv.appendChild(summaryText);

    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    summaryContentDiv.appendChild(cursor);

    // Add styles dynamically
    summaryContentDiv.style.border = '1px solid #ccc';
    summaryContentDiv.style.padding = '10px';
    summaryContentDiv.style.whiteSpace = 'pre-line'; 
    summaryContentDiv.style.overflow = 'hidden';
    summaryContentDiv.style.maxHeight = '300px';
    summaryContentDiv.style.fontFamily = 'monospace';
    summaryContentDiv.style.position = 'relative';


    cursor.style.display = 'inline-block';
    cursor.style.width = '2px';
    cursor.style.height = '1em';
    cursor.style.backgroundColor = 'black';
    cursor.style.animation = 'blinkCursor 1s step-end infinite';

    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      @keyframes blinkCursor {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(styleSheet);

    try {
        const response = await fetch('/api/FetchData', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ blogContent })
        });
    
        console.log('Response status:', response.status);
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const data = await response.json();
        console.log('Response data:', data);
    
        if (data.summary) {
            // Clear existing content
            summaryContentDiv.innerText = '';

            // Typewriter effect
            await typeWriterEffect(data.summary, summaryContentDiv,cursor);
        } else {
          throw new Error('No summary found in response');
        }
      } catch (error) {
        console.error('Error:', error);
        summaryContentDiv.innerText = `摘要生成过于频繁，请稍后再试。`;
      } finally {
        // Hide cursor after typing effect completes
        cursor.style.display = 'none';
      }
}

// Function to simulate typewriter effect
async function typeWriterEffect(text, textElement, cursorElement) {
  for (let i = 0; i < text.length; i++) {
    textElement.innerText += text.charAt(i);
    cursorElement.style.left = textElement.offsetWidth + 'px';
    await sleep(30); // Adjust speed (milliseconds per character)
  }
}

// Function to simulate delay
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}