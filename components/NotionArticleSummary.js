// notionArticleSummary.js
const apiKey = 'b8087a010ded8c075c64e3bb1165b04f.zePKxgNaoTC8cNPK';
const apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

export function summarizeArticle(articleBox) {
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
    console.log(blogContent);

    const prompt = `请对以下文章内容进行100-200字的总结：\n\n${blogContent}`;

    const requestData = {
        model: "glm-4",
        messages: [
            {
                role: "user",
                content: prompt
            }
        ]
    };

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const summaryText = data.choices[0].message.content.trim();

            const summaryContentDiv = articleBox.querySelector('.ai-speech-content');
            if (summaryContentDiv) {
                summaryContentDiv.innerText = summaryText;
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

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
    summaryBox.style.backgroundColor = '#f9fafa'; // 设置背景色
    summaryBox.style.margin = '8px 0 0 0'; // 设置外边距

    const aiTitleDiv = document.createElement('div');
    aiTitleDiv.style.padding = '8px 8px 5px 14px'; // 设置内边距

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
    aiSpeechBox.style.padding = '0 14px 14px 14px'; // 设置内边距（上, 右, 下, 左）
    aiSpeechBox.style.backgroundColor = '#f9fafa'; // 设置背景色

    const aiSpeechContent = document.createElement('div');
    aiSpeechContent.style.padding = '5px'; // 设置内边距
    aiSpeechContent.classList.add('ai-speech-content');
    aiSpeechContent.style.backgroundColor = '#ffffff'; // 设置背景色
    aiSpeechContent.style.color = '#1e1e1e';
    aiSpeechContent.style.textAlign = 'justify'; // 设置文本两端对齐
    aiSpeechContent.style.lineHeight = '1.6'; // 设置行高
    aiSpeechContent.innerText = '正在生成AI摘要，请稍候...';
    aiSpeechBox.appendChild(aiSpeechContent);
    summaryBox.appendChild(aiTitleDiv);
    summaryBox.appendChild(aiSpeechBox);
    wrapperDiv.insertBefore(summaryBox, wrapperDiv.firstChild);
    summarizeArticle(articleBox);
}

export function handleUrlChange() {
    const articleBox = document.getElementById('notion-article');
    if (articleBox) {
        createSummaryBox(articleBox);
    } else {
        setTimeout(handleUrlChange, 1000); // Retry after 1 second if articleBox is not found
    }
}

let lastUrl = location.href;
new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        handleUrlChange();
    }
}).observe(document, { subtree: true, childList: true });

handleUrlChange();
