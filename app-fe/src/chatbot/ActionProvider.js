import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL;
const urlParams = new URLSearchParams(window.location.search);
const uuid = urlParams.get("uuid");
class ActionProvider {
  constructor(
    createChatBotMessage,
    setStateFunc,
    createClientMessage,
    stateRef,
    createCustomMessage,
    ...rest
  ) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.createClientMessage = createClientMessage;
    this.stateRef = stateRef;
    this.createCustomMessage = createCustomMessage;
  }
  
  replyWithUserMessage = async (message) => {
    console.log("User message to reply:", message);
    console.log("UUID IS", uuid)
    if (message.toLowerCase().includes("hello")) {
      const botMessage = this.createChatBotMessage(`Howdy! How can I help you?`);
      console.log("Bot message to add:", botMessage);

      this.setState((prev) => ({
        ...prev,
        messages: [...prev.messages, botMessage],
      }));
    } else {
      try {
        let response = await axios.post(`${API_URL}/api/notes/chatWithPDF`, { uuid ,  message });
        console.log("Bot response:", response.data);
        const botMessage = this.createChatBotMessage(response.data.message);
        console.log("Bot message to add:", botMessage);

        this.setState((prev) => ({
          ...prev,
          messages: [...prev.messages, botMessage],
        }));
      } catch (error) {
        console.error("Error fetching bot response:", error);

        // Handling error response for the user
        const errorMessage = this.createChatBotMessage(
          "I'm sorry, but there was an issue with my response. Please try again later."
        );
        this.setState((prev) => ({
          ...prev,
          messages: [...prev.messages, errorMessage],
        }));
      }
    }
  };
}

export default ActionProvider;
