// ==UserScript==
// @name         Reformat ChatGPT
// @namespace    http://tampermonkey.net/
// @version      2024-02-07
// @description  Restyle the OpenAI ChatGPT chat window and add a feature to collapse and expand messages by clicking on them
// @author       Johnny Kamprath
// @match        https://chat.openai.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=openai.com
// @grant        GM_addStyle
// ==/UserScript==

const toggleCollapse = (e) => {
  // get parent element with class of 'text-token-text-primary'
  const parentDiv = e.target.closest('.text-token-text-primary');

  // get child class of 'text-message' and toggle 'hidden' class
  const textMessage = parentDiv.querySelector('.text-message');
  textMessage.classList.toggle('hidden');

  const collapseMessage = parentDiv.querySelector('.text-message-collapse-message');
  collapseMessage.classList.toggle('hidden');

  parentDiv.querySelector('.hide-controls').classList.toggle('hidden');
};

const addCollapseToggle = (message) => {
  // append a div with class 'text-message-collapse-message' and content '(Collapsed)' after the child element with class 'text-message'
  const textMessage2 = message.querySelector('.text-message');

  if (!textMessage2) return;

  const textMessageRole = textMessage2.getAttribute('data-message-author-role');
  const collapseMessage = document.createElement('div');
  collapseMessage.innerHTML = `<a href="#">Show ${textMessageRole === 'assistant' ? 'Response' : 'Prompt'}</a>`;
  collapseMessage.classList.add('text-message-collapse-message', 'hidden');
  textMessage2.after(collapseMessage);
  message.querySelector('.text-message-collapse-message').addEventListener('click', toggleCollapse);

  // get child div with classes 'font-semibold' and 'select-none'
  const fontSemibold = message.querySelector('.font-semibold.select-none');

  // add element to fontSemibold: <span class="hide-controls" style="position: absolute;right: 0;font-weight: normal;">[<a href="#" style="color: #c1c1ff;">Collapse</a>]</span>
  const hideControls = document.createElement('span');
  hideControls.classList.add('hide-controls');
  hideControls.innerHTML = `<a href="#">Hide</a>`;

  // add a click event handler to the new message that, when clicked, collapses or expands the message
  fontSemibold.appendChild(hideControls);
  fontSemibold.querySelector('.hide-controls').addEventListener('click', toggleCollapse);
};

(function () {
  const css = `
				.text-base.group {
					max-width:70% !important;
				}

				main {
					background-color: #111;
					//font-family: Consolas !important;
				}

				main .top-0, #prompt-textarea {
					background-color: #333 !important;
				}

					main .text-message, main .text-message p, main .text-message li, main strong, main .font-semibold, main li::before {
					//color: #00f700 !important;
				}

				.text-token-text-primary.hidden, .text-message-collapse-message.hidden, .hide-controls.hidden {
					display: none;
				}

				main .text-message[data-message-author-role="assistant"], .text-message-collapse-message {
					border: 1px solid #333;
					padding: 30px 40px;
					border-radius: 10px;
					background-color: #222;
					margin-top: 15px;
				}

				.text-message-collapse-message {
					color: #AAA;
					cursor: pointer;
					padding: 10px 20px;
					width: 180px;
					text-align: center;
				}

				.text-message-collapse-message a {
					color: #81acfd;
				}

				.hide-controls {
					position: absolute;
					right: 0;
					font-weight: normal;
					display: none;
				}
				.hide-controls a {
					color: #81acfd;
				}

				.text-token-text-primary:hover .hide-controls {
					display: inline;
				}
			`;

  GM_addStyle(css);

  // listen for new messages being added to the chat window and add the click event handler to them
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.classList && node.classList.contains('text-token-text-primary')) {
          addCollapseToggle(node);
        }
      });
    });
  });

  // create interval that, every 2 seconds, checks if the chat window has been rendered. Once it has, clear the interval
  const interval = setInterval(() => {
    const messages = document.querySelectorAll('.text-token-text-primary');
    if (messages.length) {
      document.querySelectorAll('.text-token-text-primary').forEach(addCollapseToggle);
      observer.observe(document.querySelector('.text-token-text-primary'), { childList: true });
      clearInterval(interval);
    }
  }, 2000);
})();