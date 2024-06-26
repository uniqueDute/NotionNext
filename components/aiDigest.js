if (!Object.prototype.hasOwnProperty.call(window, "aiExecuted")) {
    console.log(`%cPost-Summary-AI 文章摘要AI生成工具:%chttps://github.com/qxchuckle/Post-Summary-AI%c`, 
        "border:1px #888 solid;border-right:0;border-radius:5px 0 0 5px;padding: 5px 10px;color:white;background:#4976f5;margin:10px 0", 
        "border:1px #888 solid;border-left:0;border-radius:0 5px 5px 0;padding: 5px 10px;", 
        ""
    );
    window.aiExecuted = "chuckle";
}

function chucklePostAI(aiOption) {
    main(aiOption);

    if (aiOption.pjax) {
        document.addEventListener('pjax:complete', () => {
            setTimeout(() => {
                main(aiOption);
            }, 0);
        });
    }

    function main(aiOption) {
        // 删除现有的元素
        const box = document.querySelector(".post-ai");
        if (box) {
            box.parentElement.removeChild(box);
        }

        const currentURL = window.location.href;

        // 排除页面
        if (aiOption.eliminate && aiOption.eliminate.length && aiOption.eliminate.some(item => currentURL.includes(item))) {
            console.log("Post-Summary-AI 已排除当前页面(黑名单)");
            return;
        }
        if (aiOption.whitelist && aiOption.whitelist.length && !aiOption.whitelist.some(item => currentURL.includes(item))) {
            console.log("Post-Summary-AI 已排除当前页面(白名单)");
            return;
        }

        // 获取挂载元素，即文章内容所在的容器元素
        let targetElement = "";
        // 若el配置不存在则自动获取，如果autoMount配置为真也自动获取
        if (!aiOption.autoMount && aiOption.el) {
            targetElement = document.querySelector(aiOption.el ? aiOption.el : '#post #article-container');
        } else {
            targetElement = getArticleElements();
        }

        if (!targetElement) {
            return;
        }

        const aiInterface = {
            name: "AI摘要",
            introduce: "我是文章辅助AI, 用于生成本文简介。",
            version: "GPT",
            ...aiOption.interface
        };

        insertCSS(); // 插入css

        // 插入html结构
        const postAiBox = document.createElement('div');
        postAiBox.className = 'post-ai';
        postAiBox.innerHTML = `
            <div class="ai-header">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 4a20 20 0 100 40 20 20 0 000-40zm0 2.75a17.25 17.25 0 110 34.5 17.25 17.25 0 010-34.5z" fill="#444"/>
                </svg>
                <div class="ai-title-text">${aiInterface.name}</div>
                <div class="ai-Toggle">切换简介</div>
            </div>
            <div class="ai-speech-box">
                <div class="ai-speech-content"></div>
            </div>
            <div class="ai-tag">${aiInterface.version}</div>
            <div class="ai-explanation">${aiInterface.name}初始化中...</div>
        `;
        targetElement.appendChild(postAiBox);

        // ai主体业务逻辑
        let animationRunning = true; // 标志变量，控制动画函数的运行
        const explanation = document.querySelector('.ai-explanation');
        const postAi = document.querySelector('.post-ai');
        const aiBtnItem = document.querySelectorAll('.ai-btn-item');
        const aiToggle = document.querySelector('.ai-Toggle');
        const aiSpeech = document.querySelector('.ai-speech-box');
        let aiStr = '';
        let aiStrLength = '';
        const delayInit = 600;
        let i = 0;
        let j = 0;
        const speed = aiOption.speed || 20;
        const characterSpeed = speed * 7.5;
        const sto = [];
        let elapsed = 0;
        let completeGenerate = false;

        const controller = new AbortController();
	  let signal = controller.signal;
	  let visitorId = ""; // 标识访客ID
	  const summary_toggle = AI_option.summary_toggle ?? true;
	  let switch_control = 0;
	  let executedForSwitchControl = false;
	  const summary_num = AI_option.summary_num || 3; // 切换时允许生成的摘要总数，默认3个

	  //tianliGPT的参数
	  const tlReferer = `https://${window.location.host}/`;
		//-----------------------------------------------
		const animate = (timestamp) => {
			if (!animationRunning) {
				return; // 动画函数停止运行
			}
			if (!animate.start) animate.start = timestamp;
			elapsed = timestamp - animate.start;
			if (elapsed >= speed) {
				animate.start = timestamp;
				if (i < ai_str_length - 1) {
					let char = ai_str.charAt(i + 1);
					let delay = /[,.，。!?！？]/.test(char) ? character_speed : speed;
					if (explanation.firstElementChild) {
						explanation.removeChild(explanation.firstElementChild);
					}
					explanation.innerHTML += char;
					let div = document.createElement('div');
					div.className = "ai-cursor";
					explanation.appendChild(div);
					i++;
					if (delay === character_speed) {
						document.querySelector('.ai-explanation .ai-cursor').style.opacity = "0";
					}
					if (i === ai_str_length - 1) {
						observer.disconnect();// 暂停监听
						explanation.removeChild(explanation.firstElementChild);
					}
					sto[0] = setTimeout(() => {
						requestAnimationFrame(animate);
					}, delay);
				}
			} else {
				requestAnimationFrame(animate);
			}
		};
		const observer = new IntersectionObserver((entries) => {
			let isVisible = entries[0].isIntersecting;
			animationRunning = isVisible; // 标志变量更新
			if (animationRunning) {
				delay_init = i === 0 ? 200 : 20;
				sto[1] = setTimeout(() => {
					if (j) {
						i = 0;
						j = 0;
					}
					if (i === 0) {
						explanation.innerHTML = ai_str.charAt(0);
					}
					requestAnimationFrame(animate);
				}, delay_init);
			}
		}, { threshold: 0 });
		function clearSTO() {
			if (sto.length) {
				sto.forEach((item) => {
					if (item) {
						clearTimeout(item);
					}
				});
			}
		}
		function resetAI(df = true, str = '生成中. . .') {
			i = 0;//重置计数器
			j = 1;
			clearSTO();
			animationRunning = false;
			elapsed = 0;
			if (df) {
				explanation.innerHTML = str;
			} else {
				explanation.innerHTML = '请等待. . .';
			}
			if (!completeGenerate) {
				controller.abort();
			}
			ai_str = '';
			ai_str_length = '';
			if (summary_toggle) {
				ai_toggle.style.opacity = "0";
				ai_toggle.style.pointerEvents = "none";
			}
			observer.disconnect();// 暂停上一次监听
		}
		function startAI(str, df = true) {
			// 如果打字机配置项存在且为false，则关闭打字机，否则默认开启打字机效果
			if (AI_option.hasOwnProperty('typewriter') && !AI_option.typewriter) {
				explanation.innerHTML = str;
			} else {
				resetAI(df);
				ai_str = str;
				ai_str_length = ai_str.length;
				observer.observe(post_ai);//启动新监听
			}
		}
		function aiIntroduce() {
			startAI(aiInterface.introduce);
		}
		function aiRecommend() {
			resetAI();
			sto[2] = setTimeout(async () => {
				let info = await recommendList();
				if (info === "" || info === false) {
					startAI(`${aiInterface.name}未能找到任何可推荐的文章。`);
				} else if (info) {
					explanation.innerHTML = info;
				}
			}, 200);
		}
		async function aiGenerateAbstract() {
			resetAI();
			const ele = targetElement;
			const content = getTextContent(ele);
			const response = await getGptResponse(content);//true使用tianliGPT，false使用官方api

			if (response) {
				startAI(response.summary);
				if (summary_toggle) {
					ai_toggle.style.opacity = "1";
					ai_toggle.style.pointerEvents = "auto";
					summarySpeechShow();
				}
			}
		}
		async function switchAbstract() {
			resetAI();
			audioBlob = null;
			const ele = targetElement;
			switch_control = (switch_control + 1) % summary_num;
			const content = getTextContent(ele) + "#".repeat(switch_control);
			let response = "";
			if (switch_control === 1 && !executedForSwitchControl) {
				sessionStorage.setItem('backupsSummary', sessionStorage.getItem('summary')); // 将第一次的简介存起来
				executedForSwitchControl = true;
			}
			if (!sessionStorage.getItem(`summary${"#".repeat(switch_control)}`)) {
				sessionStorage.removeItem('summary');
				response = await getGptResponse(content);
				if (response) {
					sessionStorage.setItem(`summary${"#".repeat(switch_control)}`, JSON.stringify(response));
				}
			} else {
				response = JSON.parse(sessionStorage.getItem(`summary${"#".repeat(switch_control)}`));
				summaryId = response.id;
				if (switch_control === 0) {
					sessionStorage.setItem('summary', sessionStorage.getItem('backupsSummary'));
				} else {
					sessionStorage.setItem('summary', sessionStorage.getItem(`summary${"#".repeat(switch_control)}`));
				}
			}
			if (response) {
				startAI(response.summary);
				ai_toggle.style.opacity = "1";
				ai_toggle.style.pointerEvents = "auto";
				summarySpeechShow();
			}
		}
		//ai首屏初始化，绑定按钮注册事件
		async function ai_init() {
			// 清除缓存
			sessionStorage.removeItem('recommendList');
			sessionStorage.removeItem('backupsSummary');
			for (let i = 0; i < summary_num; i++) {
				sessionStorage.removeItem(`summary${"#".repeat(i)}`);
			}
			explanation = document.querySelector('.ai-explanation');
			post_ai = document.querySelector('.post-ai');
			ai_btn_item = document.querySelectorAll('.ai-btn-item');
			const funArr = [aiIntroduce, aiRecommend, aiGenerateAbstract];
			ai_btn_item.forEach((item, index) => {
				if (AI_option.hide_shuttle && index === ai_btn_item.length - 1) {
					item.style.display = 'none';
					return;
				}
				item.addEventListener('click', () => {
					funArr[index]();
				});
			});
			ai_toggle = document.querySelector('.ai-Toggle');
			if (summary_toggle) {
				ai_toggle.addEventListener('click', () => {
					switchAbstract();
				});
			} else {
				ai_toggle.style.display = 'none';
			}
			if (AI_option.summary_directly) {
				aiGenerateAbstract();
			} else {
				aiIntroduce();
			}
			// 获取或生成访客ID
			visitorId = localStorage.getItem('visitorId') || await generateVisitorID();
		}
		async function generateVisitorID() {
			try {
				const FingerprintJS = await import('https://openfpcdn.io/fingerprintjs/v4');
				const fp = await FingerprintJS.default.load();
				const result = await fp.get();
				const visitorId = result.visitorId;
				localStorage.setItem('visitorId', visitorId);
				return visitorId;
			} catch (error) {
				console.error("生成ID失败");
				return null;
			}
		}
		//获取某个元素内的所有纯文本，并按顺序拼接返回
		function getText(element) {
			// 需要排除的元素及其子元素
			const excludeClasses = AI_option.exclude ? AI_option.exclude : ['highlight', 'Copyright-Notice', 'post-ai', 'post-series', 'mini-sandbox'];
			if (!excludeClasses.includes('post-ai')) { excludeClasses.push('post-ai'); }
			const excludeTags = ['script', 'style', 'iframe', 'embed', 'video', 'audio', 'source', 'canvas', 'img', 'svg', 'hr', 'input', 'form'];// 需要排除的标签名数组
			let textContent = '';
			for (let node of element.childNodes) {
				if (node.nodeType === Node.TEXT_NODE) {
					// 如果是纯文本节点则获取内容拼接
					textContent += node.textContent.trim();
				} else if (node.nodeType === Node.ELEMENT_NODE) {
					let hasExcludeClass = false;
					// 遍历类名
					for (let className of node.classList) {
						if (excludeClasses.includes(className)) {
							hasExcludeClass = true;
							break;
						}
					}
					let hasExcludeTag = excludeTags.includes(node.tagName.toLowerCase()); // 检查是否是需要排除的标签
					// 如果hasExcludeClass和hasExcludeTag都为false，即不包含需要排除的类和标签，可以继续向下遍历子元素
					if (!hasExcludeClass && !hasExcludeTag) {
						let innerTextContent = getText(node);
						textContent += innerTextContent;
					}
				}
			}
			// 返回纯文本节点的内容
			return textContent.replace(/\s+/g, '');
		}
		//获取各级标题
		function extractHeadings(element) {
			const headings = element.querySelectorAll('h1, h2, h3, h4');
			const result = [];
			for (let i = 0; i < headings.length; i++) {
				const heading = headings[i];
				const headingText = heading.textContent.trim();
				result.push(headingText);
				const childHeadings = extractHeadings(heading);
				result.push(...childHeadings);
			}
			return result.join(";");
		}
		//按比例切割字符串
		function extractString(str, totalLength = 1000, ratioString = "5:3:2") {
			totalLength = Math.min(totalLength, 5000); // 最大5000字数
			if (str.length <= totalLength) { return str; }
			const ratios = ratioString.split(":").map(Number);
			const sumRatios = ratios.reduce((sum, ratio) => sum + ratio, 0);
			const availableLength = Math.min(str.length, totalLength);
			const partLengths = ratios.map(ratio => Math.floor((availableLength * ratio) / sumRatios));
			const firstPart = str.substring(0, partLengths[0]);
			const midStartIndex = (str.length - 300) / 2; // 计算中间部分的起始索引
			const middlePart = str.substring(midStartIndex, midStartIndex + partLengths[1]);
			const lastPart = str.substring(str.length - partLengths[2]);
			const result = firstPart + middlePart + lastPart;
			return result;
		}
		//获得字符串，默认进行切割，false返回原文纯文本
		function getTextContent(element, i = true) {
			let content;
			if (i) {
				const totalLength = AI_option.total_length || 1000;
				const ratioString = AI_option.ratio_string || "5:3:2";
				content = `文章的各级标题：${extractHeadings(element)}。文章内容的截取：${extractString(getText(element), totalLength, ratioString)}`;
			} else {
				content = `${getText(element)}`;
			}
			return content;
		}
		//发送请求获得简介
		async function getGptResponse(content) {
			completeGenerate = false;
			controller = new AbortController();
			signal = controller.signal;
			let response = '';
			if (sessionStorage.getItem('summary')) {
				return JSON.parse(sessionStorage.getItem('summary'));
			}
			try {
				response = await fetch('https://ai-digest.uniquedute.workers.dev/api/summary/?token=unique', {
					signal: signal,
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						content: content
					})
				});
				completeGenerate = true;
				if (response.status === 429) {
					startAI('请求过于频繁，请稍后再请求AI。');
				}
				if (!response.ok) {
					throw new Error('Response not ok');
				}
				// 处理响应
			} catch (error) {
				if (error.name === "AbortError") {
					// console.log("请求已被中止");
				} else if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
					startAI(`${aiInterface.name}请求tianliGPT出错了，你正在本地进行调试，请前往summary.zhheo.com添加本地域名（127.0.0.1:端口）的白名单。`);
				} else {
					startAI(`${aiInterface.name}请求tianliGPT出错了，请稍后再试。`);
				}
				completeGenerate = true;
				return "";
			}
			// 解析响应并返回结果
			const data = await response.json();
			summaryId = data.id;
			sessionStorage.setItem('summary', JSON.stringify(data));
			return data;
		}
		// 实验性功能，自动获取文章内容所在容器元素
		function getArticleElements() {
			// 计算元素的后代元素总个数
			function countDescendants(element) {
				let count = 1;
				for (const child of element.children) {
					count += countDescendants(child);
				}
				return count;
			}
			// 判断是否有要排除的元素
			function judgeElement(element) {
				const excludedTags = ['IFRAME', 'FOOTER', 'HEADER', 'BLOCKQUOTE']; // 添加要排除的标签
				if (excludedTags.includes(element.tagName)) {
					return true;
				}
				const exclusionStrings = ['aplayer', 'comment']; // 排除包含其中字符串的className
				return Array.from(element.classList).some(className => exclusionStrings.some(exclusion => className.includes(exclusion)));
			}
			// 深度搜索，找到得分最高的父元素
			function findMaxHeadingParentElement(element) {
				const tagScores = {
					'H1': 1.5,
					'H2': 1,
					'H3': 0.5,
					'P': 1
				};
				let maxScore = 0;
				let maxHeadingParentElement = null;
				function dfs(element) {
					if (judgeElement(element)) {
						return;
					}
					let score = 0;
					for (const child of element.children) {
						if (child.tagName in tagScores) {
							score += tagScores[child.tagName];
						}
					}
					if (score > maxScore) {
						maxScore = score;
						maxHeadingParentElement = element;
					}
					for (const child of element.children) {
						dfs(child);
					}
				}
				dfs(element);
				return maxHeadingParentElement;
			}
			// 广度优先搜索，标记所有元素，并找到得分最高的父元素
			function findArticleContentElement() {
				const queue = [document.body];
				let maxDescendantsCount = 0;
				let articleContentElement = null;
				while (queue.length > 0) {
					const currentElement = queue.shift();
					// 判断当前元素是否要排除
					if (judgeElement(currentElement)) {
						continue;
					}
					const descendantsCount = countDescendants(currentElement);
					if (descendantsCount > maxDescendantsCount) {
						maxDescendantsCount = descendantsCount;
						articleContentElement = currentElement;
					}
					for (const child of currentElement.children) {
						queue.push(child);
					}
				}
				return findMaxHeadingParentElement(articleContentElement);
			}
			// 返回文章内容所在的容器元素
			return findArticleContentElement();
		}

		// 插入css
		function insertCSS() {
			const styleId = 'qx-ai-style';
			if (document.getElementById(styleId)) { return; }
			const styleElement = document.createElement('style');
			styleElement.id = styleId;
			styleElement.textContent = AI_option.css || `:root{--ai-font-color:#353535;--ai-post-bg:#f1f3f8;--ai-content-bg:#fff;--ai-content-border:1px solid #e3e8f7;--ai-border:1px solid #e3e8f7bd;--ai-tag-bg:rgba(48,52,63,0.80);--ai-cursor:#333;--ai-btn-bg:rgba(48,52,63,0.75);--ai-title-color:#4c4948;--ai-btn-color:#fff;--ai-speech-content:#fff;}[data-theme=dark],.theme-dark,body.dark,body.dark-theme{--ai-font-color:rgba(255,255,255,0.9);--ai-post-bg:#30343f;--ai-content-bg:#1d1e22;--ai-content-border:1px solid #42444a;--ai-border:1px solid #3d3d3f;--ai-tag-bg:#1d1e22;--ai-cursor:rgb(255,255,255,0.9);--ai-btn-bg:#1d1e22;--ai-title-color:rgba(255,255,255,0.86);--ai-btn-color:rgb(255,255,255,0.9);--ai-speech-content:#1d1e22;}#post-ai.post-ai{background:var(--ai-post-bg);border-radius:12px;padding:10px 12px 11px;line-height:1.3;border:var(--ai-border);margin-top:10px;margin-bottom:6px;transition:all 0.3s;-webkit-transition:all 0.3s;-moz-transition:all 0.3s;-ms-transition:all 0.3s;-o-transition:all 0.3s;}#post-ai .ai-title{display:flex;color:var(--ai-title-color);border-radius:8px;align-items:center;padding:0 6px;position:relative;}#post-ai .ai-title i{font-weight:800;}#post-ai .ai-title-text{font-weight:bold;margin-left:8px;font-size:17px;}#post-ai .ai-tag{font-size:12px;background-color:var(--ai-tag-bg);color:var(--ai-btn-color);border-radius:4px;margin-left:auto;line-height:1;padding:4px 5px;border:var(--ai-border);}#post-ai .ai-explanation{margin-top:10px;padding:8px 12px;background:var(--ai-content-bg);border-radius:8px;border:var(--ai-content-border);font-size:15.5px;line-height:1.4;color:var(--ai-font-color);}#post-ai .ai-cursor{display:inline-block;width:7px;background:var(--ai-cursor);height:16px;margin-bottom:-2px;opacity:0.95;margin-left:3px;transition:all 0.3s;-webkit-transition:all 0.3s;-moz-transition:all 0.3s;-ms-transition:all 0.3s;-o-transition:all 0.3s;}#post-ai .ai-btn-box{font-size:15.5px;width:100%;display:flex;flex-direction:row;flex-wrap:wrap;}#post-ai .ai-btn-item{padding:5px 10px;margin:10px 16px 0px 5px;width:fit-content;line-height:1;background:var(--ai-btn-bg);border:var(--ai-border);color:var(--ai-btn-color);border-radius:6px 6px 6px 0;-webkit-border-radius:6px 6px 6px 0;-moz-border-radius:6px 6px 6px 0;-ms-border-radius:6px 6px 6px 0;-o-border-radius:6px 6px 6px 0;user-select:none;transition:all 0.3s;-webkit-transition:all 0.3s;-moz-transition:all 0.3s;-ms-transition:all 0.3s;-o-transition:all 0.3s;cursor:pointer;}#post-ai .ai-btn-item:hover{background:#49b0f5dc;}#post-ai .ai-recommend{display:flex;flex-direction:row;flex-wrap:wrap;}#post-ai .ai-recommend-item{width:50%;margin-top:2px;}#post-ai .ai-recommend-item a{border-bottom:2px solid #4c98f7;padding:0 .2em;color:#4c98f7;font-weight:700;text-decoration:none;transition:all 0.3s;-webkit-transition:all 0.3s;-moz-transition:all 0.3s;-ms-transition:all 0.3s;-o-transition:all 0.3s;}#post-ai .ai-recommend-item a:hover{background-color:#49b1f5;border-bottom:2px solid #49b1f5;color:#fff;border-radius:5px;}@media screen and (max-width:768px){#post-ai .ai-btn-box{justify-content:center;}}#post-ai .ai-title>svg{width:21px;height:21px;}#post-ai .ai-title>svg path{fill:var(--ai-font-color);}#post-ai .ai-Toggle{font-size:12px;border:var(--ai-border);background:var(--ai-btn-bg);color:var(--ai-btn-color);padding:3px 4px;border-radius:4px;margin-left:6px;cursor:pointer;-webkit-transition:.3s;-moz-transition:.3s;-o-transition:.3s;-ms-transition:.3s;transition:.3s;font-weight:bolder;pointer-events:none;opacity:0;}#post-ai .ai-Toggle:hover{background:#49b0f5dc;}#post-ai .ai-speech-box{width:21px;height:21px;background:var(--ai-font-color);margin-left:7px;border-radius:50%;display:flex;flex-direction:row;flex-wrap:wrap;align-content:center;justify-content:center;pointer-events:none;opacity:0;-webkit-transition:.3s;-moz-transition:.3s;-o-transition:.3s;-ms-transition:.3s;transition:.3s;cursor:pointer;}#post-ai .ai-speech-content{width:8px;background:var(--ai-speech-content);height:8px;border-radius:50%;-webkit-transition:.3s;-moz-transition:.3s;-o-transition:.3s;-ms-transition:.3s;transition:.3s;}#post-ai .ai-speech-box:hover .ai-speech-content{background:#49b0f5;}@keyframes ai_breathe{0%{transform:scale(0.9);-webkit-transform:scale(0.9);-moz-transform:scale(0.9);-ms-transform:scale(0.9);-o-transform:scale(0.9);}50%{transform:scale(1);-webkit-transform:scale(1);-moz-transform:scale(1);-ms-transform:scale(1);-o-transform:scale(1);}}`;
			AI_option.additional_css && (styleElement.textContent += AI_option.additional_css);
			document.head.appendChild(styleElement);
		}

		ai_init();
	}
}
// 兼容旧版本配置项
if (typeof ai_option !== "undefined") {
	console.log("正在使用旧版本配置方式，请前往项目仓库查看最新配置写法");
	new ChucklePostAI(ai_option);
}