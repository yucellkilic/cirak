(function () {
    console.log('ÇIRAK Widget v2.0 - API-Driven Mode');

    const CONFIG = {
        apiBase: 'http://localhost:5000',
        toneColors: {
            professional: '#2563eb',
            friendly: '#10b981',
            sales: '#f59e0b',
            trust: '#8b5cf6',
            neutral: '#6b7280'
        },
        styles: `
            .cirak-widget-wrapper { 
                position: fixed; 
                bottom: 30px; 
                left: 30px; 
                z-index: 9999; 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            }
            .cirak-fab { 
                width: 60px; 
                height: 60px; 
                border-radius: 50%; 
                background: #2563eb; 
                color: white; 
                border: none; 
                cursor: pointer; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
                transition: transform 0.3s ease; 
            }
            .cirak-fab:hover { transform: scale(1.1); }
            .cirak-fab:active { transform: scale(0.95); }
            .cirak-panel { 
                position: absolute; 
                bottom: 80px; 
                left: 0; 
                width: 360px; 
                height: 520px; 
                background: white; 
                border-radius: 16px; 
                box-shadow: 0 8px 32px rgba(0,0,0,0.15); 
                display: none; 
                flex-direction: column; 
                overflow: hidden; 
                animation: slideUp 0.3s ease;
            }
            .cirak-panel.open { display: flex; }
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @media (max-width: 480px) {
                .cirak-widget-wrapper { left: 15px; bottom: 15px; right: 15px; }
                .cirak-panel { width: calc(100vw - 30px); height: calc(100vh - 120px); bottom: 70px; }
                .cirak-fab { width: 50px; height: 50px; }
            }
            .cirak-header { 
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); 
                color: white; 
                padding: 18px 20px; 
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
            }
            .cirak-header-title { font-weight: 600; font-size: 16px; }
            .cirak-header-subtitle { font-size: 12px; opacity: 0.9; margin-top: 2px; }
            .cirak-close { 
                background: none; 
                border: none; 
                color: white; 
                font-size: 24px; 
                cursor: pointer; 
                width: 32px; 
                height: 32px; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                border-radius: 50%; 
                transition: background 0.2s;
            }
            .cirak-close:hover { background: rgba(255,255,255,0.2); }
            .cirak-messages { 
                flex: 1; 
                padding: 16px; 
                overflow-y: auto; 
                background: #f8fafc; 
                display: flex; 
                flex-direction: column; 
                gap: 12px;
            }
            .cirak-bubble { 
                padding: 12px 16px; 
                border-radius: 12px; 
                max-width: 80%; 
                font-size: 14px; 
                line-height: 1.5; 
                box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
                animation: fadeIn 0.3s ease;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .cirak-bubble.assistant { 
                background: #ffffff; 
                color: #1e293b; 
                border-left: 3px solid #2563eb; 
                align-self: flex-start; 
                border-bottom-left-radius: 4px; 
            }
            .cirak-bubble.user { 
                background: #2563eb; 
                color: #ffffff; 
                align-self: flex-end; 
                border-bottom-right-radius: 4px; 
            }
            .cirak-bubble.supporting { 
                background: #f1f5f9; 
                color: #475569; 
                font-size: 13px; 
                border-left: 3px solid #94a3b8; 
                align-self: flex-start; 
                margin-top: -8px;
            }
            .cirak-bubble.cta { 
                background: #fef3c7; 
                color: #92400e; 
                font-weight: 500; 
                border-left: 3px solid #f59e0b; 
                align-self: flex-start; 
                margin-top: -8px;
            }
            .cirak-input-area { 
                padding: 16px; 
                border-top: 1px solid #e2e8f0; 
                display: flex; 
                gap: 8px; 
                background: white;
            }
            .cirak-input { 
                flex: 1; 
                border: 1px solid #e2e8f0; 
                padding: 10px 14px; 
                border-radius: 24px; 
                outline: none; 
                font-size: 14px;
                transition: border-color 0.2s;
            }
            .cirak-input:focus { border-color: #2563eb; }
            .cirak-send { 
                background: #2563eb; 
                color: white; 
                border: none; 
                padding: 10px 20px; 
                border-radius: 24px; 
                cursor: pointer; 
                font-weight: 500;
                transition: background 0.2s;
            }
            .cirak-send:hover { background: #1d4ed8; }
            .cirak-send:disabled { background: #94a3b8; cursor: not-allowed; }
            .cirak-typing { 
                padding: 12px 16px; 
                background: white; 
                border-radius: 12px; 
                border-left: 3px solid #94a3b8; 
                max-width: 80px; 
                align-self: flex-start;
            }
            .cirak-typing span {
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #94a3b8;
                margin: 0 2px;
                animation: typing 1.4s infinite;
            }
            .cirak-typing span:nth-child(2) { animation-delay: 0.2s; }
            .cirak-typing span:nth-child(3) { animation-delay: 0.4s; }
            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
                30% { transform: translateY(-10px); opacity: 1; }
            }
            .cirak-error { 
                background: #fee2e2; 
                color: #991b1b; 
                border-left: 3px solid #ef4444; 
            }
        `
    };

    let state = {
        config: { name: 'ÇIRAK', tagline: 'Dijital Asistanınız' },
        isOpen: false,
        isLoading: false,
        widgetEnabled: true
    };

    async function init() {
        try {
            // Fetch settings (non-blocking)
            const res = await fetch(`${CONFIG.apiBase}/api/admin/snapshot/status`);
            if (res.ok) {
                const data = await res.json();
                state.config.name = data.settings?.cirakName || 'ÇIRAK';
                state.widgetEnabled = data.settings?.widgetEnabled !== false;
            }
        } catch (e) {
            console.warn('ÇIRAK: Settings fetch failed, using defaults');
        }

        if (!state.widgetEnabled) {
            console.log('ÇIRAK: Widget disabled by backend');
            return;
        }

        render();
    }

    function render() {
        // Inject styles
        const style = document.createElement('style');
        style.textContent = CONFIG.styles;
        document.head.appendChild(style);

        // Create widget container
        const container = document.createElement('div');
        container.className = 'cirak-widget-wrapper';
        container.innerHTML = `
            <div id="cirak-panel" class="cirak-panel">
                <div class="cirak-header">
                    <div>
                        <div class="cirak-header-title">${state.config.name}</div>
                        <div class="cirak-header-subtitle">${state.config.tagline}</div>
                    </div>
                    <button id="cirak-close" class="cirak-close">&times;</button>
                </div>
                <div id="cirak-messages" class="cirak-messages"></div>
                <div class="cirak-input-area">
                    <input type="text" id="cirak-input" class="cirak-input" placeholder="Mesajınızı yazın...">
                    <button id="cirak-send" class="cirak-send">Gönder</button>
                </div>
            </div>
            <button id="cirak-fab" class="cirak-fab">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            </button>
        `;
        document.body.appendChild(container);

        // Bind events
        document.getElementById('cirak-fab').onclick = togglePanel;
        document.getElementById('cirak-close').onclick = togglePanel;
        document.getElementById('cirak-send').onclick = handleSend;
        document.getElementById('cirak-input').onkeypress = (e) => {
            if (e.key === 'Enter' && !state.isLoading) handleSend();
        };

        // Welcome message
        setTimeout(() => {
            addMessage('Merhaba! Size nasıl yardımcı olabilirim?', 'assistant');
        }, 500);
    }

    function togglePanel() {
        state.isOpen = !state.isOpen;
        document.getElementById('cirak-panel').classList.toggle('open', state.isOpen);
    }

    function addMessage(text, type, extraClass = '') {
        const msgArea = document.getElementById('cirak-messages');
        const bubble = document.createElement('div');
        bubble.className = `cirak-bubble ${type} ${extraClass}`;
        bubble.textContent = text;
        msgArea.appendChild(bubble);
        msgArea.scrollTop = msgArea.scrollHeight;
    }

    function showTyping() {
        const msgArea = document.getElementById('cirak-messages');
        const typing = document.createElement('div');
        typing.id = 'cirak-typing';
        typing.className = 'cirak-typing';
        typing.innerHTML = '<span></span><span></span><span></span>';
        msgArea.appendChild(typing);
        msgArea.scrollTop = msgArea.scrollHeight;
    }

    function hideTyping() {
        const typing = document.getElementById('cirak-typing');
        if (typing) typing.remove();
    }

    async function handleSend() {
        const input = document.getElementById('cirak-input');
        const sendBtn = document.getElementById('cirak-send');
        const text = input.value.trim();

        if (!text || state.isLoading) return;

        // Add user message
        addMessage(text, 'user');
        input.value = '';
        state.isLoading = true;
        sendBtn.disabled = true;

        // Show typing indicator
        showTyping();

        try {
            const response = await fetch(`${CONFIG.apiBase}/api/cirak/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            hideTyping();

            if (!response.ok) {
                throw new Error('Network response failed');
            }

            const data = await response.json();

            // Update assistant bubble color based on tone
            const toneColor = CONFIG.toneColors[data.tone] || CONFIG.toneColors.neutral;
            const msgArea = document.getElementById('cirak-messages');

            // Main message
            const mainBubble = document.createElement('div');
            mainBubble.className = 'cirak-bubble assistant';
            mainBubble.style.borderLeftColor = toneColor;
            mainBubble.textContent = data.message;
            msgArea.appendChild(mainBubble);

            // Supporting message (if exists)
            if (data.supportingMessage) {
                setTimeout(() => {
                    addMessage(data.supportingMessage, 'assistant', 'supporting');
                }, 400);
            }

            // CTA message (if exists)
            if (data.ctaMessage) {
                setTimeout(() => {
                    addMessage(data.ctaMessage, 'assistant', 'cta');
                }, data.supportingMessage ? 800 : 400);
            }

            msgArea.scrollTop = msgArea.scrollHeight;

        } catch (error) {
            hideTyping();
            console.error('ÇIRAK Error:', error);
            addMessage('Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.', 'assistant', 'cirak-error');
        } finally {
            state.isLoading = false;
            sendBtn.disabled = false;
            input.focus();
        }
    }

    // Auto-init when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
