const apiKey = 'b8087a010ded8c075c64e3bb1165b04f.zePKxgNaoTC8cNPK';
const apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

let lastRequestSuccessful = false;
let lastUrl = '';

export function createSummaryBox(articleBox) {
    const wrapperDiv = articleBox;
    if (!wrapperDiv) {
        console.error('Article wrapper not found');
        return;
    }
    const oldSummaryBox = wrapperDiv.querySelector('.post-ai');
    if (oldSummaryBox) {
        console.log('Removing existing summary box');
        wrapperDiv.removeChild(oldSummaryBox);
    }

    const summaryBox = document.createElement('div');
    summaryBox.classList.add('post-ai');
    summaryBox.id = 'post-ai';
    summaryBox.style.backgroundColor = '#f9fafa';
    summaryBox.style.margin = '8px 0 0 0';

    const aiTitleDiv = document.createElement('div');
    aiTitleDiv.style.padding = '8px 8px 5px 14px';
    aiTitleDiv.style.display = 'flex';
    aiTitleDiv.style.alignItems = 'center';

    const svgIcon = `<img src='/svg/dianshi.svg' width='32' height='32' alt='AI Icon' />`;
    aiTitleDiv.innerHTML = svgIcon + '<span style="font-size: 20px;">AI摘要</span>';

    const icon = aiTitleDiv.querySelector('img');
    icon.style.marginRight = '8px';

    const aiSpeechBox = document.createElement('div');
    aiSpeechBox.classList.add('ai-speech-box');
    aiSpeechBox.style.padding = '0 14px 14px 14px';
    aiSpeechBox.style.backgroundColor = '#f9fafa';

    const aiSpeechContent = document.createElement('div');
    aiSpeechContent.style.padding = '5px';
    aiSpeechContent.classList.add('ai-speech-content');
    aiSpeechContent.style.backgroundColor = '#ffffff';
    aiSpeechContent.style.color = '#1e1e1e';
    aiSpeechContent.style.textAlign = 'justify';
    aiSpeechContent.style.lineHeight = '1.6';
    aiSpeechContent.innerText = '正在生成AI摘要，请稍候...';
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

function summarizeArticle(articleBox) {
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
        ],
        stream: true
    };

    if (lastRequestSuccessful && lastUrl === apiUrl) {
        console.log('Request already successful. Not sending another request.');
        return;
    }

    lastUrl = apiUrl;
    lastRequestSuccessful = false;

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
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        const aiSpeechContent = articleBox.querySelector('.ai-speech-content');

        let partialData = '';

        function readStream() {
            reader.read().then(({ done, value }) => {
                if (done) {
                    console.log('Stream complete');
                    lastRequestSuccessful = true;
                    return;
                }
                partialData += decoder.decode(value, { stream: true });
                const lines = partialData.split('\n');

                for (let i = 0; i < lines.length - 1; i++) {
                    try {
                        const parsedLine = JSON.parse(lines[i]);
                        const summaryText = parsedLine.choices[0].delta?.content || '';
                        if (aiSpeechContent) {
                            aiSpeechContent.innerText += summaryText;
                        }
                    } catch (e) {
                        console.error('Error parsing JSON:', e);
                    }
                }

                partialData = lines[lines.length - 1];
                readStream();
            }).catch(error => {
                console.error('Error reading stream:', error);
            });
        }
        readStream();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
