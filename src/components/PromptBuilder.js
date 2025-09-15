import React, { useState } from 'react';

const PromptBuilder = () => {
  const [tabname, setTabname] = useState('');
  const [context, setContext] = useState('');
  const [question, setQuestion] = useState('');

  const getFinalPrompt = () => {
    return `
Answer the question as detailed and formally as possible using the provided ${tabname}. Ensure the response is accurate and strictly based on the given context. 
If the answer is not found in the context, respond with: "Could you please clarify or resend your Question? I'm here to help with detailed and formal responses."
Otherwise, limit your answer to no more than 200 words while covering all essential details.

Context:
${context}

Question:
${question}

Answer:
    `.trim();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-center">Prompt Generator</h2>

      <div>
        <label className="block font-medium mb-1">Tab Name (Context Type):</label>
        <input
          type="text"
          value={tabname}
          onChange={(e) => setTabname(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="e.g., Telecom Policy, Licensing, Spectrum"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Context:</label>
        <textarea
          rows={5}
          value={context}
          onChange={(e) => setContext(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Paste your extracted or relevant context here"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Question:</label>
        <textarea
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Type the user's question here"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Generated Prompt:</label>
        <pre className="w-full p-4 border rounded bg-gray-100 whitespace-pre-wrap">
          {getFinalPrompt()}
        </pre>
      </div>
    </div>
  );
};

export default PromptBuilder;
