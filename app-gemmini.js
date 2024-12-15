import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatMessageHistory } from 'langchain/memory';
import { RunnableWithMessageHistory } from '@langchain/core/runnables';
import {
  ChatPromptTemplate,
  MessagesPl/aceholder,
} from '@langchain/core/prompts';

import 'dotenv/config';
import prompts from 'prompts';

const llm = new ChatGoogleGenerativeAI({
  model: 'gemini-1.5-pro-latest',
  apiKey: process.env.GOOGLE_GEMINI_KEY,
});

const history = new ChatMessageHistory();

const prompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `Você é um chatbot de IA conversando com um humano. 
     Use o seguinte contexto para entender a pergunta humana. 
     Não inclua emojis em sua resposta`,
  ],
  new MessagesPlaceholder('chat_history'),
  ['human', '{input}'],
]);

const chain = prompt.pipe(llm);

const chainWithHistory = new RunnableWithMessageHistory({
  runnable: chain,
  getMessageHistory: sessionId => history,
  inputMessagesKey: 'input',
  historyMessagesKey: 'chat_history',
});

console.log('Converse com IA');
console.log('Digite /bye para encerrar o programa');

let exit = false;
while (!exit) {
  const { question } = await prompts([
    {
      type: 'text',
      name: 'question',
      message: 'Your question: ',
      validate: value => (value ? true : 'Question cannot be empty'),
    },
  ]);
  if (question == '/bye') {
    console.log('See you later!');
    exit = true;
  } else {
    const response = await chainWithHistory.invoke(
      { input: question },
      {
        configurable: {
          sessionId: 'test',
        },
      }
    );
    console.log(response.content);
  }
}