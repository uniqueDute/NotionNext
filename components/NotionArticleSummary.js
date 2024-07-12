const apiKey = 'AIzaSyBqvUA2o2rSk1hpJilfQmVrPBIsWj5etUk'; // Replace with your actual API key
const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

export function createSummaryBox(articleBox) {
    const wrapperDiv = articleBox;
    if (!wrapperDiv) {
        console.error('Article wrapper not found');
        return;
    }
    
    const oldSummaryBox = wrapperDiv.querySelector('.post-ai');
    if (oldSummaryBox) {
        const aiSpeechContent = oldSummaryBox.querySelector('.ai-speech-content');
        if (aiSpeechContent && aiSpeechContent.innerText.length > 50) {
            console.log('AI summary already exists and is sufficiently long.');
            return;
        }
        console.log('Removing old AI summary box.');
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
    aiTitleDiv.style.display = 'flex';
    aiTitleDiv.style.alignItems = 'center';

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
        model: 'gemini-pro',
        contents: [
            {
                parts:[{text:prompt}]
            }
        ],
    };

    const summaryContentDiv = articleBox.querySelector('.ai-speech-content');

    fetch(`${apiUrl}?key=${apiKey}`, { // Corrected fetch call
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
    
        // Read the response as text
        return response.text(); 
    })
    .then(textData => {
        // Parse the JSON data
        const data = JSON.parse(textData);
    
        // Extract the summary text
        const summaryText = data.candidates[0].content.parts[0].text;
    
        // Update the summary content 
        summaryContentDiv.innerText = summaryText; 
    })
    .catch(error => {
        console.error('Error:', error);
        summaryContentDiv.innerText = '摘要生成失败，请稍后再试。';
    });
}