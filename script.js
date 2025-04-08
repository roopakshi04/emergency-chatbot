document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const emergencyBtn = document.getElementById('emergency-btn');
    const quickBtns = document.querySelectorAll('.quick-btn');
    const apiKeyInput = document.getElementById('api-key-input');
    const saveApiKeyBtn = document.getElementById('save-api-key');
    const apiKeyContainer = document.getElementById('api-key-container');
    const chatInputContainer = document.getElementById('chat-input-container');
    const emergencyPanel = document.getElementById('emergency-panel');
    
    let apiKey = localStorage.getItem('openai_api_key');
    
    // Check if API key exists in local storage
    if (apiKey) {
        // Hide API key input and show chat interface
        apiKeyContainer.style.display = 'none';
        chatInputContainer.style.display = 'flex';
        emergencyPanel.style.display = 'block';
        
        // Send welcome message
        setTimeout(() => {
            addBotMessage("Hello, I'm SafetyGuard AI Assistant, designed to provide safety information and emergency resources for women. How can I help you today?");
        }, 500);
    }
    
    // Save API key
    saveApiKeyBtn.addEventListener('click', function() {
        const key = apiKeyInput.value.trim();
        if (key !== '') {
            // Save API key to local storage
            localStorage.setItem('openai_api_key', key);
            apiKey = key;
            
            // Hide API key input and show chat interface
            apiKeyContainer.style.display = 'none';
            chatInputContainer.style.display = 'flex';
            emergencyPanel.style.display = 'block';
            
            // Send welcome message
            addBotMessage("Hello, I'm SafetyGuard AI Assistant, designed to provide safety information and emergency resources for women. How can I help you today?");
        } else {
            alert('Please enter a valid API key');
        }
    });
    
    // Handle send button click
    sendBtn.addEventListener('click', handleUserMessage);
    
    // Handle enter key press
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleUserMessage();
        }
    });
    
    // Handle emergency button
    emergencyBtn.addEventListener('click', function() {
        addUserMessage("EMERGENCY SOS");
        
        // Show immediate help while waiting for AI response
        addBotMessage("<strong>EMERGENCY MODE ACTIVATED</strong>");
        addBotMessage("If you're in immediate danger, call emergency services: <strong>911</strong> (US) or your local emergency number. I'm preparing resources to help you.");
        
        // Get AI response for emergency
        getAIResponse("I'm in an emergency situation and need immediate help. What should I do? Provide emergency numbers and resources for women's safety.");
    });
    
    // Handle quick buttons
    quickBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const query = this.getAttribute('data-query');
            userInput.value = query;
            handleUserMessage();
        });
    });
    
    // Handle user messages
    function handleUserMessage() {
        const message = userInput.value.trim();
        if (message !== '') {
            addUserMessage(message);
            getAIResponse(message);
            userInput.value = '';
        }
    }
    
    // Add a user message to the chat
    function addUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message user-message';
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        scrollToBottom();
    }
    
    // Add a bot message to the chat
    function addBotMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message bot-message';
        messageElement.innerHTML = message;
        chatMessages.appendChild(messageElement);
        scrollToBottom();
    }
    
    // Add a typing indicator
    function addTypingIndicator() {
        const indicatorElement = document.createElement('div');
        indicatorElement.className = 'message bot-message typing-indicator';
        indicatorElement.id = 'typing-indicator';
        indicatorElement.innerHTML = '<span></span><span></span><span></span>';
        chatMessages.appendChild(indicatorElement);
        scrollToBottom();
    }
    
    // Remove typing indicator
    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            chatMessages.removeChild(indicator);
        }
    }
    
    // Get response from OpenAI API
    async function getAIResponse(message) {
        addTypingIndicator();
        
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4",  // Or any available model like "gpt-3.5-turbo"
                    messages: [
                        {
                            role: "system",
                            content: "You are SafetyGuard, an AI assistant specifically designed to provide support, resources, and guidance for women's safety. Your primary goal is to provide helpful, accurate information about safety precautions, emergency responses, and resources available for women in dangerous or uncomfortable situations. Always prioritize the user's safety and well-being in your responses. In emergency situations, always recommend contacting official emergency services first. Provide practical, actionable advice that can help in various situations. When appropriate, provide specific resources like hotline numbers or organizations that can help."
                        },
                        {
                            role: "user",
                            content: message
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message);
            }
            
            removeTypingIndicator();
            const aiResponse = data.choices[0].message.content;
            addBotMessage(aiResponse);
            
        } catch (error) {
            removeTypingIndicator();
            console.error('Error:', error);
            addBotMessage("I'm sorry, there was an error processing your request. Please check your API key or try again later. " + error.message);
        }
    }
    
    // Scroll to bottom of chat
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});
