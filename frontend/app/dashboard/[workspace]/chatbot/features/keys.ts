

export const chatbotKeys = {
    all: ["chatbot"],
    ailogs: (filter: any) => [...chatbotKeys.all, "logs", filter],
    knowledges: (filter: any) => [...chatbotKeys.all, "knowledges", filter],
    models: () => [...chatbotKeys.all, "models"],
}