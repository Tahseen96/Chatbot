const express = require("express");
const asyncHandler = require("express-async-handler");
const router = new express.Router();
const { PineconeClient } = require("@pinecone-database/pinecone");
const { HuggingFaceInference } = require("langchain/llms/hf");
const { PineconeStore } = require("langchain/vectorstores/pinecone");
const { HuggingFaceInferenceEmbeddings } = require("langchain/embeddings/hf");
const {VectorDBQAChain, RetrievalQAChain } = require("langchain/chains");
const {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate,
  SystemMessagePromptTemplate,
} = require("langchain/prompts")


const chatPrompt = ChatPromptTemplate.fromPromptMessages([
  SystemMessagePromptTemplate.fromTemplate(
    "You are AskMary and your task is to answer the question from the given data."
  ),
  HumanMessagePromptTemplate.fromTemplate("{text}"),
]);

const hfEmbeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: "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",
});

const pinecone = new PineconeClient();
let index;
let vectorStore;
let chain;

const model = new HuggingFaceInference({
  model: "tiiuae/falcon-7b-instruct",
  apiKey: "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", // In Node.js defaults to process.env.HUGGINGFACEHUB_API_KEY
  maxTokens: 1000,
  temperature: 0.1,
  topK: 10
});

(async () => {
  await pinecone.init({
    environment: "us-west1-gcp-free",
    apiKey: "50501fb1-cdea-456b-9df3-f9be007a0847",
  });
  index = pinecone.Index("index-pdf");

  vectorStore = await PineconeStore.fromExistingIndex(hfEmbeddings, {
    pineconeIndex: index,
  });
  
  chain = VectorDBQAChain.fromLLM(model, vectorStore, {
    k: 1,
    returnSourceDocuments: true,
  });
})();

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { question } = req.body;

    const chatbotResponse = await chain.call({
      query: question,
    });

    res.send(chatbotResponse);
  })
);

module.exports = router;
