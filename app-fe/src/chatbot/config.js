import { createChatBotMessage } from "react-chatbot-kit";

const config = {
  initialMessages: [
    createChatBotMessage(`Hey there!  I'm CANT, or Content Aware Note Taker`),
    createChatBotMessage(`I can generate structured notes from PDF and Live Lecture.`),
    createChatBotMessage(`If you do not want to download pdf notes, I can also answer all your questions about the class`)
  ],
  botName: "CANT",
  customStyles: {
    chatButton: {
      backgroundColor: "lightpurple",
      color: "white"
    }
  },
  widgets: [
    {
      widgetName: "HelpMenuWidget",
      widgetOptions: {
        helpMessages: [
          {
            id: "help1",
            message: "I can generate structured notes from PDF and Live Lectures."
          },
          {
            id: "help2",
            message: "I can also answer all your questions about the class."
          }
        ]
      }
    }]
}

export default config