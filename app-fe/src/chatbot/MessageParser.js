class MessageParser {
  constructor(actionProvider, state) {
    this.actionProvider = actionProvider;
    this.state = state;
  }

  parse(message) {
    console.log("Parsing user message:", message); // Log the user's message
    // Call the action to reply with the user’s message
    this.actionProvider.replyWithUserMessage(message);
  }
}

export default MessageParser;
