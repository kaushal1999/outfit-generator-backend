import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

import User from "../models/userModel.js";

import { OpenAI } from "langchain/llms/openai";
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
    "I want you to act as an fashion outfit recommender for that recommends personalized fashion outfits, in a natural conversational way. The outfit recommender should leverage fashion trends to offer tailored outfit recommendations. The recommended  outfits should be complete and well-coordinated, including clothing, accessories, and footwear etc. The recommender should consider factors such as the user's body type, occasion, and regional and age preferences to offer appropriate and versatile outfit suggestions. Users should also be able to interact with the outfit recommender to give it feedback in terms of what they like, dont like and be able to tweak the outfits in the manner of a conversation.The ultimate goal of the fashion outfit recommender is to enhance the user's experience by providing them with personalized, trendy, and cohesive outfit ideas. Your recommendations should be formatted in such a way that it is easy to read and keep it very crisp. The following is a conversation between an user & you. You should provide specific details from its context. The conversation also contains user's details."
  ),
  new MessagesPlaceholder("history"),
  HumanMessagePromptTemplate.fromTemplate("{input}"),
]);

const model = new ChatOpenAI({ temperature: 0.9, verbose: false });

const chatbotController = async (req, res) => {
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
            "Understood! I have saved the user details you provided for future reference as a personalized outfit suggester. When you have specific fashion-related queries or need personalized outfit suggestions in the future, feel free to ask, and I'll use these details to provide tailored recommendations.",
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

      try {
        const updatedUser = await user.save();
        return res.status(200).send(result);
      } catch (error) {
        res.status(500).json(err);
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(404).json({
      message: err.message,
    });
  }
};

export default chatbotController;
