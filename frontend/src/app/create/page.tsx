"use client";
import React, { useEffect, useState } from "react";
import { textOnly } from "@lens-protocol/metadata";
import { post } from "@lens-protocol/client/actions";
import { uri } from "@lens-protocol/client";
import { handleOperationWith } from "@lens-protocol/client/viem";

import { storageClient } from "./storage-client";
import { useAccount,useWalletClient } from "wagmi";
import { getLensClient } from "@/lib/lens/client";
import { evmAddress } from "@lens-protocol/client";
import { env } from "process";

import predictionABI from '../../abi/prediction-abi.js';
import questionABI from '../../abi/question-abi.js';
import { useContractRead } from 'wagmi'

function VariablesList({ templateId }: { templateId: number }) {
  const { data, isError, isLoading } = useContractRead({
    address: process.env.NEXT_PUBLIC_QUESTION_CONTRACT,
    abi: questionABI,
    functionName: 'getVariables',
    args: [templateId],
  })

  if (isLoading) return <div>Loading variables...</div>
  if (isError) return <div>Error fetching variables</div>

  // `data` is an array of Variable objects with { name, paramType, options }
  const variables = data ?? []

  // Build a map: name -> { paramType, options }
  const variableMap = variables.reduce<Record<string, { paramType: number; options: string[] }>>((acc, v) => {
    acc[v.name] = { paramType: v.paramType, options: v.options }
    return acc
  }, {})

  return (
    <div>
      <h3>Variables for Template {templateId}</h3>
      <ul>
        {variables.length === 0 && <li>No variables found</li>}
        {variables.map((v: any, i: number) => (
          <li key={i}>
            <b>{v.name}</b> - Type: {v.paramType} - Options: {v.options.length ? v.options.join(', ') : 'None'}
          </li>
        ))}
      </ul>
    </div>
  )
}

const PostCreator = () => {
  // const { address } = useAccount();
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  type QuestionTemplate = {
    id: string;
    templateText: string;
    category: string;
  };
  

  const [questionTemplates, setQuestionTemplates] = useState<QuestionTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const selectedtemplateText = questionTemplates.find(q => q.id === selectedId)?.templateText ?? "";

  const [values, setValues] = useState<Record<string, string>>({});
  const variableNames = Object.keys(values);
  const variableValues = Object.values(values);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedId(e.target.value);
    setValues({});

  };


  const [sessionClient, setSessionClient] = useState<any>(null);

  const { data: walletClient } = useWalletClient();

    useEffect(() => {
      const fetchQuestions = async () => {
        try {
          console.log("hi")
          const res = await fetch('https://api.studio.thegraph.com/query/111655/my-prophet-testnet-3/version/latest', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer YOUR_API_KEY', // replace with your actual key
            },
            body: JSON.stringify({
              query: `
                {
                  templateCreateds(first: 5 , where: { activated: true }) {
                    id
                    templateText
                    category
                  }
                }
              `,
              operationName: 'Subgraphs',
              variables: {}
            }),
          });
  
          const json = await res.json();
          if (json.data) {
            setQuestionTemplates(json.data.templateCreateds);
            console.log(json.data.templateCreateds)
          } else {
            setError('Failed to fetch questions.');
          }
        } catch (err) {
          console.error(err);
          setError('An error occurred while fetching data.');
        } finally {

        }
      };
  
      fetchQuestions();
    }, []);

    const parseTemplate = (template: string) => {
      const regex = /\[([^\]]+)\]/g;
      const parts: (string | { variable: string })[] = [];
    
      let lastIndex = 0;
      let match: RegExpExecArray | null;
    
      while ((match = regex.exec(template)) !== null) {
        if (match.index > lastIndex) {
          parts.push(template.slice(lastIndex, match.index)); // static text
        }
        parts.push({ variable: match[1] }); // variable name without brackets
        lastIndex = regex.lastIndex;
      }
    
      if (lastIndex < template.length) {
        parts.push(template.slice(lastIndex)); // remaining text
      }
    
      return parts;
    };

    
    const FillInTheBlank = ({ templateText, selectedId }: { templateText: string; selectedId: string }) => {
      // const [values, setValues] = useState<Record<string, string>>({});
      
    
      const { data: variablesData, isLoading } = useContractRead({
        address: process.env.NEXT_PUBLIC_QUESTION_CONTRACT,
        abi: questionABI,
        functionName: 'getVariables',
        args: [parseInt(selectedId)],
      });
    
      // Create map: variableName -> { paramType, options }
      const variableMap: Record<string, { paramType: number; options: string[] }> = {};
      (variablesData || []).forEach((v: any) => {
        variableMap[v.name] = { paramType: v.paramType, options: v.options };
      });
    
      const parsed = parseTemplate(templateText);
    
      const handleChange = (variable: string, value: string) => {
        setValues(prev => ({ ...prev, [variable]: value }));
      };
    
      if (isLoading) return <div>Loading variables...</div>;
    
      return (
        <div>
          {parsed.map((part, index) =>
            typeof part === 'string' ? (
              <span key={index}>{part}</span>
            ) : (
              <span key={index} style={{ margin: '0 4px' }}>
                {(() => {
                  const { paramType, options } = variableMap[part.variable] || {};
    
                  // Dropdown if STRING with options
                  if (paramType === 0 && options?.length) {
                    return (
                      <select
                        value={values[part.variable] || ''}
                        onChange={e => handleChange(part.variable, e.target.value)}
                      >
                        <option value="">Select {part.variable}</option>
                        {options.map(opt => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    );
                  }
    
                  // Date selector if TIMESTAMP
                  if (paramType === 2) {
                    return (
                      <input
                        type="date"
                        value={
                          values[part.variable]
                            ? new Date(parseInt(values[part.variable]) * 1000)
                                .toISOString()
                                .split('T')[0]
                            : ''
                        }
                        onChange={e => {
                          const unixTimestamp = Math.floor(
                            new Date(e.target.value).getTime() / 1000
                          );
                          handleChange(part.variable, unixTimestamp.toString());
                        }}
                      />
                    );
                  }
    
                  // Fallback to text input
                  return (
                    <input
                      placeholder={part.variable}
                      value={values[part.variable] || ''}
                      onChange={e => handleChange(part.variable, e.target.value)}
                    />
                  );
                })()}
              </span>
            )
          )}
        </div>
      );
    };

  useEffect(() => {
    const init = async () => {
      try {
        const rawClient = await getLensClient();
        if (!rawClient.isSessionClient()) {
          throw new Error("Not authenticated — expected a SessionClient.");
        }
        setSessionClient(rawClient);
      } catch (err) {
        console.error("Failed to initialize Lens client:", err);
        setError("Lens client init failed");
      }
    };

    init();
  }, []);

  const handlePost = async () => {
    if (!sessionClient || !walletClient) {
      setError("Wallet or session not ready");
      return;
    }

    setPosting(true);
    setStatus("idle");
    setError(null);
    const feed_address= process.env.NEXT_PUBLIC_ENVIRONMENT === "development" ? process.env.NEXT_PUBLIC_TESTNET_FEED_ADDRESS : process.env.NEXT_PUBLIC_MAINNET_FEED_ADDRESS

    try {
      const metadata = textOnly({ content });
      const { uri: contentUri } = await storageClient.uploadAsJson(metadata);

      console.log("uri",contentUri);
      if(!feed_address){
        throw("feed address is null");
      }
      const result = await post(sessionClient, {
        contentUri: uri(contentUri),
        feed: evmAddress(feed_address), 
      }).andThen(handleOperationWith(walletClient));
      
      
      const txHash = result.value as string;
      addQuestion(txHash);
      setStatus("success");
      setContent("");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setError(err.message || "Something went wrong");
    } finally {
      setPosting(false);
    }
  };

  const addQuestion = async (postTx: string) => {
    try{
      if(!walletClient){
        return;
      }
      const contractAbi=predictionABI;
    // const variableNames = ["Person"];
    // const variableValues = ["Person B"];
    console.log(variableNames,variableValues)
    const questionText="Testing Question Creation?";
    // const templateId=1
    
       const hash = await walletClient.writeContract({
        address: "0xD9882F7f91498e94a6cb1A8f0bE843b4b9C8A782",
        abi: contractAbi,
        functionName: "createPrediction",
        args: [postTx, selectedId,variableNames,variableValues,questionText,BigInt(0.001 * 1e18),BigInt(0.002 * 1e18),100000],
        value: BigInt(0.01 * 1e18), // example for sending 0.01 ETH
      });
      
      
    }
    catch (err: any) {
      console.log(err);
    }
  }

  return (
    <div className="p-4 border rounded shadow max-w-md mx-auto">
      
      <label htmlFor="question-select">Select a question template:</label>
      <select id="question-select" value={selectedId} onChange={handleChange}>
        <option value="">-- Choose a question --</option>
        {questionTemplates.map((template) => (
          <option key={template.id} value={template.id}>
            {template.templateText}
          </option>
        ))}
      </select>
      <FillInTheBlank templateText={selectedtemplateText} selectedId={selectedId}/>
   
      <textarea
        className="w-full p-2 border rounded mb-2"
        rows={4}
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={posting}
      />
   
      <button
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={handlePost}
        disabled={posting || !content.trim()}
      >
        {posting ? "Posting..." : "Post"}
      </button>

      {/* <button
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={addQuestion}
      >
        ADD QUESTION
      </button> */}

      {status === "success" && (
        <p className="text-green-600 mt-2">Post created successfully!</p>
      )}
      {status === "error" && error && (
        <p className="text-red-600 mt-2">Error: {error}</p>
      )}
    </div>
  );
};

export default PostCreator;