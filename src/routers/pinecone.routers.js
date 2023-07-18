const express = require("express");
const asyncHandler = require("express-async-handler");
const router = new express.Router();
const {HuggingFaceInferenceEmbeddings} = require("langchain/embeddings/hf")
const extract = require("pdf-text-extract");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { PineconeClient } = require("@pinecone-database/pinecone");
const { HuggingFaceInference } = require("langchain/llms/hf");

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 5000,
  chunkOverlap: 100,
});

const hfEmbeddings = new HuggingFaceInferenceEmbeddings({
  apiKey : "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"
})

let index = undefined;
const pinecone = new PineconeClient();

(async () => {
  await pinecone.init({
    environment: "us-west1-gcp-free",
    apiKey: "50501fb1-cdea-456b-9df3-f9be007a0847",
  });
  index = pinecone.Index("index-pdf");
})();

const convertTextInChunks = async (raw_text) => {
  const output = await splitter.createDocuments([raw_text]);
  return output;
};

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { caseId } = req.body;
    extract("./4.pdf", { splitPages: false }, async (err, pages) => {
      let pdfRawText = "";
      let allPdfVectors = [];
      if (err) {
        res.send("Check the pdf file.");
        return;
      }
      pages.forEach((page) => {
        pdfRawText += page + "\n";
      });
      const rawTextInChunksInDocuments = await convertTextInChunks(pdfRawText);
      for (let counter = 0; counter < rawTextInChunksInDocuments.length; counter++) {
        
        let documentEmbedding = await hfEmbeddings.embedQuery(rawTextInChunksInDocuments[counter].pageContent)
        
        allPdfVectors.push({
          id: `vector-${counter}`,
          values: documentEmbedding,
          metadata: {
            text: rawTextInChunksInDocuments[counter].pageContent,
          },
        });
      }
      let upsertRequest = {
        vectors: allPdfVectors,
        namespace:  "pdf4",
      };
      const upsertResponse = await index.upsert({ upsertRequest });
      res.send(`Pinecone updated ${upsertResponse}`);
    });
  })
);

module.exports = router;
