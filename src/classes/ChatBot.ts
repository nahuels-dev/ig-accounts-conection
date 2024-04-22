import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config()
class ChatBot {
  private openai: any

  constructor(apiKey: string) {
    this.openai = new OpenAI({apiKey:apiKey})
  }

  async chatCompletion(prompt: string): Promise<{ status: number; response: string }> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { "role": "system", "content": "You are a helpful assistant." },
          { "role": "user", "content": prompt }
        ]
      });
      const content = response.choices[0].message.content
      return {
        status: 1,
        response: content
      };
    } catch (error) {
      console.log(error)
      return {
        status: 0,
        response: ''
      };
    }
  }
}

export default ChatBot
