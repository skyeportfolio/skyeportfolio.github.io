document.addEventListener('DOMContentLoaded', () => {
    // Navbar hide on scroll
    let lastScrollTop = 0;
    const nav = document.querySelector('nav');

    window.addEventListener('scroll', () => {
        let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        if (!nav.querySelector('.links')?.classList.contains('active')) {
            if (currentScroll <= 0) {
                nav.classList.remove('hidden');
                lastScrollTop = currentScroll;
                return;
            }
            if (currentScroll > lastScrollTop && currentScroll > 50 && !nav.classList.contains('hidden')) {
                nav.classList.add('hidden');
            } else if (currentScroll < lastScrollTop && nav.classList.contains('hidden')) {
                nav.classList.remove('hidden');
            }
        }
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    });

    // Determine greeting based on time of day
    function getGreeting() {
        const now = new Date();
        const hours = now.getHours();
        if (hours < 12) return "Good Morning";
        if (hours < 18) return "Good Afternoon";
        return "Good Evening";
    }

    // Update greeting, time, and date in popup
    function updateLocalTime() {
        const greetingText = document.getElementById('greeting-text');
        const timeDateDisplay = document.getElementById('greeting-time-date');
        if (greetingText && timeDateDisplay) {
            const now = new Date();
            const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
            const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const timeString = now.toLocaleTimeString('en-US', timeOptions);
            const dateString = now.toLocaleDateString('en-US', dateOptions);
            greetingText.textContent = `${getGreeting()}!, welcome to my portfolio!`;
            timeDateDisplay.textContent = `Current Time: ${timeString} | Date: ${dateString}`;
        } else {
            console.warn('Greeting popup elements not found');
        }
    }

    // Toggle menu and body scroll
    function toggleMenu(isOpen) {
        document.body.classList.toggle('menu-open', isOpen);
    }

    // Dark mode toggle
    function toggleDarkMode() {
        const body = document.body;
        const toggleIcons = document.querySelectorAll('#dark-mode-toggle');
        body.classList.toggle('dark-mode');
        const isDarkMode = body.classList.contains('dark-mode');
        toggleIcons.forEach(icon => {
            icon.className = isDarkMode ? 'bx bx-sun' : 'bx bx-moon';
        });
        localStorage.setItem('darkMode', isDarkMode);
    }

    // Apply saved dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        document.querySelectorAll('#dark-mode-toggle').forEach(icon => {
            icon.className = 'bx bx-sun';
        });
    }

    // Greeting Popup Logic
    const greetingPopup = document.querySelector('#greetingPopup');
    const closePopup = document.querySelector('#closePopup');
    if (greetingPopup && closePopup) {
        console.log('Greeting popup found, showing after 2 seconds');
        setTimeout(() => {
            greetingPopup.classList.add('visible');
        }, 2000);
        closePopup.addEventListener('click', () => {
            greetingPopup.classList.remove('visible');
        });
        updateLocalTime();
        setInterval(updateLocalTime, 1000);
    } else {
        console.log('Greeting popup not found on this page');
    }

    // Dark mode toggle event
    const darkModeToggles = document.querySelectorAll('.mode-toggle');
    darkModeToggles.forEach(toggle => {
        toggle.addEventListener('click', toggleDarkMode);
    });

    // Mobile menu toggle
    const menuOpen = document.querySelector('#menu-open');
    const menuClose = document.querySelector('#menu-close');
    const navLinks = document.querySelector('.links');

    if (menuOpen && menuClose && navLinks) {
        menuOpen.addEventListener('click', () => {
            navLinks.classList.add('active');
            menuOpen.style.display = 'none';
            menuClose.style.display = 'block';
            toggleMenu(true);
            nav.classList.remove('hidden');
        });

        menuClose.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuClose.style.display = 'none';
            menuOpen.style.display = 'block';
            toggleMenu(false);
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                navLinks.classList.remove('active');
                menuClose.style.display = 'none';
                menuOpen.style.display = 'block';
                toggleMenu(false);

                if (href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        const navHeight = nav.offsetHeight;
                        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
                        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                    }
                }
            });
        });

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth > 968) {
                    navLinks.classList.remove('active');
                    menuClose.style.display = 'none';
                    menuOpen.style.display = 'block';
                    toggleMenu(false);
                }
                updateObservers();
            }, 50);
        });
    }

    // FAQ toggle
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const isActive = faqItem.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.faq-question i').className = 'bx bx-plus';
            });
            if (!isActive) {
                faqItem.classList.add('active');
                question.querySelector('i').className = 'bx bx-minus';
            }
        });
    });

    // Form Submission Logic
    const contactForm = document.querySelector('#contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const textarea = contactForm.querySelector('textarea');
            const formData = new FormData(contactForm);
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });

            const jsonData = JSON.stringify(formObject);

            try {
                const response = await fetch('https://formspree.io/f/movdqpoe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: jsonData
                });

                if (response.ok) {
                    alert('Message sent successfully!');
                    contactForm.reset();
                } else {
                    const errorData = await response.json();
                    alert(`Error: ${errorData.error || 'Failed to send message. Please try again.'}`);
                }
            } catch (error) {
                alert('An error occurred while sending the message. Please try again later.');
                console.error('Form submission error:', error);
            }
            if (textarea) textarea.focus();
        });
    }

    // Blog-specific logic (news, chatbot, TradingView)
    if (document.getElementById('crypto-news-container') || document.getElementById('tradingview_chart') || document.getElementById('chatbot-input')) {
        // Fallback data for news
        const fallbackData = [
            { title: "Bitcoin Surges to New High", url: "https://example.com/bitcoin-news", image: "https://via.placeholder.com/300x200?text=Bitcoin+News" },
            { title: "Ethereum ETF Sparks Rally", url: "https://example.com/ethereum-news", image: "https://via.placeholder.com/300x200?text=Ethereum+News" },
            { title: "Global Markets React to Policy Changes", url: "https://example.com/global-news", image: "https://via.placeholder.com/300x200?text=Global+News" },
            { title: "Tech Stocks Surge", url: "https://example.com/tech-news", image: "https://via.placeholder.com/300x200?text=Tech+News" },
            { title: "Solana DeFi Boom", url: "https://example.com/solana-news", image: "https://via.placeholder.com/300x200?text=Solana+News" },
            { title: "Cardano Smart Contract Upgrade", url: "https://example.com/cardano-news", image: "https://via.placeholder.com/300x200?text=Cardano+News" },
            { title: "Crypto Market Trends 2025", url: "https://example.com/market-news", image: "https://via.placeholder.com/300x200?text=Market+News" },
            { title: "Blockchain Adoption Grows", url: "https://example.com/blockchain-news", image: "https://via.placeholder.com/300x200?text=Blockchain+News" },
            { title: "DeFi Innovations Surge", url: "https://example.com/defi-news", image: "https://via.placeholder.com/300x200?text=DeFi+News" }
        ];

        // Function to render news items
        function renderItems(items, container) {
            console.log('Rendering items:', items);
            container.innerHTML = '';
            items.slice(0, 9).forEach(item => {
                const imageUrl = item.image && item.image.includes('placeholder') ? item.image : (item.image || 'https://via.placeholder.com/300x200?text=News');
                const newsItem = document.createElement('a');
                newsItem.href = item.url;
                newsItem.className = 'blog-link';
                newsItem.target = '_blank';
                newsItem.rel = 'noopener noreferrer';
                newsItem.innerHTML = `
                    <div class="box">
                        <h1><span>${item.title || 'No Title'}</span></h1>
                        <img src="${imageUrl}" alt="${item.title || 'News Item'}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200?text=News';">
                        <span class="view-site">Read More <i class='bx bx-right-arrow-alt'></i></span>
                    </div>
                `;
                container.appendChild(newsItem);
            });
            updateObservers(); // Ensure new elements are observed for animations
        }

        // Fetch crypto and general news
        async function fetchNewsData() {
            console.log('Starting fetchNewsData...');
            const container = document.getElementById('crypto-news-container');
            if (!container) {
                console.error('Error: #crypto-news-container not found in DOM');
                return;
            }

            let newsItems = [];

            try {
                console.log('Fetching CryptoCompare news...');
                const cryptoResponse = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=Bitcoin,Ethereum,Solana,Cardano');
                if (!cryptoResponse.ok) throw new Error(`CryptoCompare API error: ${cryptoResponse.status}`);
                const cryptoData = await cryptoResponse.json();
                console.log('Raw CryptoCompare data:', cryptoData);
                newsItems = (cryptoData.Data || []).slice(0, 9).map(article => {
                    const imageUrl = article.imageurl && !article.imageurl.includes('bird') ? article.imageurl : 'https://via.placeholder.com/300x200?text=Crypto+News';
                    return { title: article.title || 'No Title Available', url: article.url || 'https://example.com', image: imageUrl };
                });
                console.log('Processed CryptoCompare news:', newsItems);
            } catch (error) {
                console.error('Error fetching CryptoCompare news:', error.message);
            }

            if (newsItems.length < 9) {
                try {
                    console.log('Fetching NewsAPI news...');
                    const newsResponse = await fetch('https://newsapi.org/v2/top-headlines?category=general&language=en&apiKey=301671e3c0fd431bbaf3749bab72edf2');
                    if (!newsResponse.ok) throw new Error(`NewsAPI error: ${newsResponse.status}`);
                    const newsData = await newsResponse.json();
                    console.log('Raw NewsAPI data:', newsData);
                    const generalNews = (newsData.articles || []).slice(0, 9 - newsItems.length).map(article => ({
                        title: article.title || 'No Title Available',
                        url: article.url || 'https://example.com',
                        image: article.urlToImage || 'https://via.placeholder.com/300x200?text=General+News'
                    }));
                    newsItems = [...newsItems, ...generalNews];
                    console.log('Processed NewsAPI news:', generalNews);
                } catch (error) {
                    console.error('Error fetching NewsAPI news:', error.message);
                }
            }

            console.log('Combined news data:', newsItems);

            if (newsItems.length < 9) {
                const needed = 9 - newsItems.length;
                newsItems = [...newsItems, ...fallbackData.slice(0, needed)];
                console.log('Padded with fallback data:', newsItems);
            }

            console.log('Rendering combined news data...');
            renderItems(newsItems, container);
        }

        // Initialize news
        if (document.getElementById('crypto-news-container')) {
            fetchNewsData().catch(error => {
                console.error('Unexpected error in fetchNewsData:', error);
                const container = document.getElementById('crypto-news-container');
                if (container) {
                    console.log('Rendering fallback data due to unexpected error...');
                    renderItems(fallbackData.slice(0, 9), container);
                }
            });

            // Refresh news on click
            const refreshLink = document.getElementById('news-refresh');
            if (refreshLink) {
                refreshLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Refresh link clicked, fetching news...');
                    fetchNewsData();
                });
            } else {
                console.error('Error: #news-refresh element not found');
            }
        }

        // Chatbot logic
        const chatbotInput = document.getElementById('chatbot-input');
        const chatbotMessages = document.getElementById('chatbot-messages');
        const chatbotSend = document.querySelector('.chatbot-send');

        // Append message to chat container
        function addMessage(content, isBot = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isBot ? 'bot-message' : 'user-message'}`;
            messageDiv.textContent = content;
            chatbotMessages.appendChild(messageDiv);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }

        // Typing indicator while waiting for response
        function showTypingIndicator() {
            const typingDiv = document.createElement('div');
            typingDiv.className = 'message bot-message typing';
            typingDiv.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
            chatbotMessages.appendChild(typingDiv);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
            return typingDiv;
        }

        // Fetch response from DuckDuckGo API with retry and timeout
        async function getBotResponse(message) {
            const typing = showTypingIndicator();
            const timeout = 5000; // 5-second timeout

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                const query = encodeURIComponent(message);
                const response = await fetch(`https://api.duckduckgo.com/?q=${query}&format=json&pretty=1`, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data = await response.json();
                typing.remove();

                let reply = "I'm sorry, I couldn't find a clear answer for that.";
                if (data.AbstractText) {
                    reply = data.AbstractText;
                } else if (data.RelatedTopics && data.RelatedTopics.length > 0) {
                    reply = data.RelatedTopics[0].Text || data.RelatedTopics.map(t => t.Text).join(' ');
                } else if (data.Answer) {
                    reply = data.Answer;
                } else if (data.Heading) {
                    reply = `Here’s a topic: ${data.Heading}. For more, search online!`;
                }

                // Local fallback for common queries
                const lowerMessage = message.toLowerCase();
                if (lowerMessage.includes('hello')) reply = "Hello! How can I assist you today?";
                else if (lowerMessage.includes('bye')) reply = "Goodbye! Have a great day!";
                else if (lowerMessage.includes('how are you')) reply = "I'm doing well, thank you!";
                else if (lowerMessage.includes('what is')) reply = reply || "It seems like a definition question. I found: " + (data.Abstract || "No specific info, please refine your question!");
                else if (lowerMessage.includes('help')) reply = "I'm here to help! Ask me about UI/UX, crypto, or news.";

                reply = reply.length > 200 ? reply.substring(0, 200) + "..." : reply;
                addMessage(reply, true);
            } catch (error) {
                typing.remove();
                console.error('Error fetching response:', error.message);
                // Retry once if it's a network error
                if (error.name === 'AbortError' || error.message.includes('Failed to fetch')) {
                    addMessage("Network issue detected. Retrying...", true);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    try {
                        const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(message)}&format=json&pretty=1`);
                        if (!response.ok) throw new Error(`Retry failed: ${response.status}`);
                        const data = await response.json();
                        let reply = "Retry successful! ";
                        if (data.AbstractText) reply += data.AbstractText;
                        else if (data.RelatedTopics && data.RelatedTopics.length > 0) reply += data.RelatedTopics[0].Text || data.RelatedTopics.map(t => t.Text).join(' ');
                        else if (data.Answer) reply += data.Answer;
                        else reply += "I found some info, but it’s limited.";
                        reply = reply.length > 200 ? reply.substring(0, 200) + "..." : reply;
                        addMessage(reply, true);
                    } catch (retryError) {
                        console.error('Retry failed:', retryError);
                        addMessage("Sorry, I couldn't fetch an answer. Try again later or ask something else!", true);
                    }
                } else {
                    addMessage("Sorry, I couldn't fetch an answer. Try again later or ask something else!", true);
                }
            }
        }

        // Send message
        function sendMessage() {
            const message = chatbotInput.value.trim();
            if (!message) return;

            addMessage(message, false);
            chatbotInput.value = '';
            getBotResponse(message);
        }

        // Button click or Enter key
        chatbotSend?.addEventListener('click', sendMessage);
        chatbotInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });

        // TradingView widget initialization
        if (document.getElementById('tradingview_chart')) {
            function initTradingView() {
                const isMobile = window.innerWidth <= 768;
                const widgetHeight = isMobile ? 450 : 650;
                new TradingView.widget({
                    "width": "100%",
                    "height": widgetHeight,
                    "symbol": "BINANCE:BTCUSDT",
                    "interval": "D",
                    "timezone": "Etc/UTC",
                    "theme": "dark",
                    "style": "1",
                    "locale": "en",
                    "toolbar_bg": "#f1f3f6",
                    "enable_publishing": false,
                    "allow_symbol_change": true,
                    "hotlist": true,
                    "calendar": true,
                    "container_id": "tradingview_chart"
                });
            }

            if (!window.TradingView) {
                const script = document.createElement('script');
                script.src = 'https://s3.tradingview.com/tv.js';
                script.async = true;
                script.onload = () => setTimeout(initTradingView, 100);
                document.head.appendChild(script);
            } else {
                setTimeout(initTradingView, 100);
            }

            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    if (window.TradingView && document.getElementById('tradingview_chart')) {
                        document.getElementById('tradingview_chart').innerHTML = '';
                        initTradingView();
                    }
                }, 200);
            });
        }
    }

    // Optimized scroll animation with expanded elements
// Optimized scroll animation for all devices
function setupScrollAnimations() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        // Fallback: Show all elements without animation
        document.querySelectorAll('.mobile-scroll, .slide-left, .slide-right, .scroll-reveal, #home .profile-img').forEach(el => {
            el.classList.add('visible');
        });
        return;
    }

    const isMobile = window.innerWidth <= 968 || window.matchMedia('(max-device-width: 968px)').matches;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                requestAnimationFrame(() => {
                    entry.target.classList.add('visible');
                });
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: isMobile ? 0.1 : 0.15, // Adjusted for mobile reliability
        rootMargin: isMobile ? '0px 0px -15% 0px' : '0px 0px -25% 0px' // Tighter margin for mobile
    });

    window.updateObservers = () => {
        // Unobserve all to prevent duplicate observations
        document.querySelectorAll('.mobile-scroll, .slide-left, .slide-right, .scroll-reveal, #home .profile-img').forEach(el => {
            observer.unobserve(el);
        });

        // Observe animation elements
        document.querySelectorAll('.mobile-scroll').forEach(el => observer.observe(el));
        document.querySelectorAll('.focus-section').forEach(el => {
            el.classList.add('slide-left');
            observer.observe(el);
        });
        document.querySelectorAll('.skills-progress').forEach(el => {
            el.classList.add('slide-right');
            observer.observe(el);
        });
        document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
        document.querySelectorAll('#home .profile-img').forEach(el => observer.observe(el));
    };

    window.updateObservers();
}

// Initialize animations
setupScrollAnimations();

// Re-observe on resize or load
window.addEventListener('resize', window.updateObservers);
window.addEventListener('load', window.updateObservers);

    // Touch focus for textarea
    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('touchstart', (e) => {
            e.preventDefault();
            textarea.focus();
        }, { passive: false });
    });

    // Fix mobile responsiveness
    function applyInitialResponsiveSettings() {
        if (window.innerWidth <= 968) {
            document.body.classList.remove('menu-open');
            const nav = document.querySelector('.links');
            if (nav) nav.classList.remove('active');
            const menuOpen = document.getElementById('menu-open');
            const menuClose = document.getElementById('menu-close');
            if (menuOpen && menuClose) {
                menuOpen.style.display = 'block';
                menuClose.style.display = 'none';
            }
        }
    }
    applyInitialResponsiveSettings();

    // Crypto Calculator Logic
    const cryptoSearch = document.getElementById('crypto-search');
    const suggestionsList = document.getElementById('crypto-suggestions');
    const amountInput = document.getElementById('crypto-amount');
    const currencySelect = document.getElementById('currency-select');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultDiv = document.getElementById('calculator-result');

    if (cryptoSearch && suggestionsList && amountInput && currencySelect && calculateBtn && resultDiv) {
        let cryptoList = [];
        let selectedCrypto = null;

        const popularCryptos = [
            'bitcoin', 'ethereum', 'solana', 'cardano', 'binancecoin',
            'ripple', 'dogecoin', 'polkadot', 'avalanche-2', 'chainlink'
        ];

        async function fetchCryptoList() {
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/coins/list');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                cryptoList = await response.json();
                console.log('Crypto list fetched:', cryptoList.length, 'coins');
            } catch (error) {
                console.error('Error fetching crypto list:', error);
                resultDiv.innerHTML = '<span>Error loading cryptocurrency list. Please try again later.</span>';
                resultDiv.classList.add('error');
            }
        }

        async function fetchCryptoPrice(cryptoId, currency) {
            try {
                const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=${currency}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                if (!data[cryptoId] || !data[cryptoId][currency]) throw new Error('Price data not available');
                return data[cryptoId][currency];
            } catch (error) {
                console.error('Error fetching crypto price:', error);
                throw error;
            }
        }

        function formatNumber(number, decimals = 2) {
            return number.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }

        function showSuggestions(query) {
            suggestionsList.innerHTML = '';
            suggestionsList.style.display = 'none';

            if (!query) return;

            const queryLower = query.toLowerCase().trim();
            console.log('Searching for:', queryLower);

            const scoredCryptos = cryptoList
                .map(coin => {
                    const nameLower = coin.name.toLowerCase();
                    const symbolLower = coin.symbol.toLowerCase();
                    let score = 0;

                    if (nameLower === queryLower || symbolLower === queryLower) score += 100;
                    if (nameLower.startsWith(queryLower) || symbolLower.startsWith(queryLower)) score += 50;
                    if (nameLower.includes(queryLower) || symbolLower.includes(queryLower)) score += 20;
                    if (popularCryptos.includes(coin.id)) score += 30;

                    return { coin, score };
                })
                .filter(item => item.score > 0)
                .sort((a, b) => b.score - a.score || a.coin.name.localeCompare(b.coin.name))
                .slice(0, 10);

            console.log('Filtered cryptos:', scoredCryptos.map(item => `${item.coin.name} (${item.score})`));

            if (scoredCryptos.length === 0) {
                suggestionsList.innerHTML = '<li>No matching cryptocurrencies found.</li>';
                suggestionsList.style.display = 'block';
                return;
            }

            scoredCryptos.forEach(({ coin }) => {
                const li = document.createElement('li');
                li.textContent = `${coin.name} (${coin.symbol.toUpperCase()})`;
                li.dataset.id = coin.id;
                li.dataset.symbol = coin.symbol.toUpperCase();
                li.addEventListener('click', () => {
                    cryptoSearch.value = `${coin.name} (${coin.symbol.toUpperCase()})`;
                    selectedCrypto = { id: coin.id, symbol: coin.symbol.toUpperCase(), name: coin.name };
                    suggestionsList.innerHTML = '';
                    suggestionsList.style.display = 'none';
                    console.log('Selected crypto:', selectedCrypto);
                });
                suggestionsList.appendChild(li);
            });

            suggestionsList.style.display = 'block';
        }

        async function calculateConversion() {
            const amount = parseFloat(amountInput.value);
            const currency = currencySelect.value.toLowerCase();

            resultDiv.innerHTML = '';
            resultDiv.classList.remove('error');

            if (!selectedCrypto) {
                resultDiv.innerHTML = '<span>Please select a valid cryptocurrency.</span>';
                resultDiv.classList.add('error');
                return;
            }
            if (isNaN(amount) || amount <= 0) {
                resultDiv.innerHTML = '<span>Please enter a valid amount.</span>';
                resultDiv.classList.add('error');
                return;
            }

            try {
                const price = await fetchCryptoPrice(selectedCrypto.id, currency);
                const convertedValue = amount * price;
                resultDiv.innerHTML = `<span>${formatNumber(amount, 8)} ${selectedCrypto.symbol} = ${formatNumber(convertedValue, 2)} ${currency.toUpperCase()}</span>`;
            } catch (error) {
                resultDiv.innerHTML = '<span>Error fetching price data. Check your connection or try again later.</span>';
                resultDiv.classList.add('error');
            }
        }

        fetchCryptoList();

        cryptoSearch.addEventListener('input', (e) => {
            selectedCrypto = null;
            showSuggestions(e.target.value);
        });

        cryptoSearch.addEventListener('blur', () => {
            setTimeout(() => { suggestionsList.style.display = 'none'; }, 200);
        });

        cryptoSearch.addEventListener('focus', () => {
            if (cryptoSearch.value) showSuggestions(cryptoSearch.value);
        });

        cryptoSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && selectedCrypto) calculateConversion();
        });

        calculateBtn.addEventListener('click', calculateConversion);

        amountInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && selectedCrypto) calculateConversion();
        });
    }

    // Trigger resize on load
    window.addEventListener('load', () => {
        window.dispatchEvent(new Event('resize'));
    });
});

// Ensure textboxes remain responsive on mobile
// Enhanced touch handling for textboxes
document.querySelectorAll('input, textarea').forEach(element => {
    element.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent default to avoid conflicts
        element.focus(); // Programmatically focus
        element.scrollIntoView({ behavior: 'smooth', block: 'center' }); // Ensure visibility
    }, { passive: false });

    element.addEventListener('touchend', (e) => {
        e.preventDefault(); // Prevent unwanted bubbling
    }, { passive: false });

    element.addEventListener('focus', () => {
        element.style.position = 'relative'; // Ensure proper stacking
        element.style.zIndex = '100'; // Bring to front
    });

    element.addEventListener('blur', () => {
        element.style.position = ''; // Reset position
        element.style.zIndex = ''; // Reset z-index
    });
});
// Prevent default touch behavior on form and chatbot container to avoid unresponsiveness
document.querySelectorAll('form, #ai-chatbot .chatbot-input').forEach(container => {
    container.addEventListener('touchstart', (e) => {
        e.stopPropagation();
    }, { passive: false });

    container.addEventListener('touchmove', (e) => {
        e.stopPropagation();
    }, { passive: false });
});
