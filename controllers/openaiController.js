import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

import User from "../models/userModel.js";
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is also the default, can be omitted
});
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ConversationSummaryBufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "langchain/prompts";

const chatPrompt = ChatPromptTemplate.fromPromptMessages([
  SystemMessagePromptTemplate.fromTemplate(
    "I want you to act as a fashion outfit recommender who recommends personalized fashion. The outfit recommender should leverage fashion trends to offer tailored outfit recommendations. The recommended outfits should be complete and well-coordinated, including clothing, accessories, footwear etc. The recommender should consider factors such as the user's body type, occasion, and regional and age preferences to offer appropriate and versatile outfit suggestions. Users should also be able to interact with the outfit recommender to give feedback on what they like and don't like. The ultimate goal of the fashion outfit recommender is to enhance the user's experience by providing them with personalized, trendy outfit ideas. Your recommendations should have only one outfit at a time and no other text. The following is a conversation between a user and you. You should provide specific details from its context. The last part of the conversation contains the user's details, starting from formData."
  ),
  new MessagesPlaceholder("history"),
  HumanMessagePromptTemplate.fromTemplate("{input}"),
]);

const model = new ChatOpenAI({ temperature: 0.9, verbose: false });

export const chatbotController = async (req, res) => {
  try {
    const { text, id } = req.body;

    let _id = mongoose.Types.ObjectId(id);

    const user = await User.findById(_id);

    let inputMessages = user.inputMessages;
    let outputMessages = user.outputMessages;
    const userPref = user.userPref[0];

    const chatPromptMemory = new ConversationSummaryBufferMemory({
      llm: new ChatOpenAI({ modelName: "gpt-3.5-turbo", temperature: 0 }),
      maxTokenLimit: 3500,
      returnMessages: true,
    });

    let inputStr = "";
    let outputStr = "";

    for (let index = 0; index < inputMessages.length; index++) {
      inputStr = inputMessages[index];
      outputStr = outputMessages[index];
      await chatPromptMemory.saveContext(
        { input: inputStr },
        { output: outputStr }
      );
    }

    if (userPref) {
      await chatPromptMemory.saveContext(
        { input: userPref },
        {
          output:
            "Understood! I have saved the user details you provided for future reference.",
        }
      );
    }

    const chain = new ConversationChain({
      llm: model,
      memory: chatPromptMemory,
      prompt: chatPrompt,
    });

    const result = await chain.predict({ input: text });

    if (result) {
      console.log("result==================", result);
      inputMessages.push(text);
      outputMessages.push(result);

      user.inputMessages = inputMessages;

      user.outputMessages = outputMessages;

      const updatedUser = await user.save();
      return res.status(200).send(result);
    }
  } catch (err) {
    // console.log(err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const imageController = async (req, res) => {
  try {
    const { last_response } = req.body;
    // console.log(outfits);
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: `${last_response} From the above text, extract text that can be given to a text-to-image generator for outfit generation. Your response should only contain the outfit details and no other text, not even the heading for details.` }],
      model: 'gpt-3.5-turbo',
    });
    // console.log(completion.choices[0].message.content);
    const response = await openai.images.generate({
      prompt: completion.choices[0].message.content,
      n: 1,
      size: "512x512",
    });
    const image_url = response.data[0].url;
    return res.status(200).send(image_url);
  } catch (error) {
     console.log(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};
