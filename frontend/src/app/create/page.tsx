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
import { max } from "date-fns";
import styles from './page.module.css';
import { useMemo } from 'react';

import { Login } from '@/components/login';

import { useAuthenticatedUser } from "@lens-protocol/react";

// function VariablesList({ templateId }: { templateId: number }) {
//   const { data, isError, isLoading } = useContractRead({
//     address: process.env.NEXT_PUBLIC_QUESTION_CONTRACT as `0x${string}`,
//     abi: questionABI,
//     functionName: 'getVariables',
//     args: [templateId],
//   })

//   if (isLoading) return <div>Loading variables...</div>
//   if (isError) return <div>Error fetching variables</div>

//   // `data` is an array of Variable objects with { name, paramType, options }
//   const variables = data ?? []

//   // Build a map: name -> { paramType, options }
//   const variableMap = variables.reduce<Record<string, { paramType: number; options: string[] }>>((acc, v) => {
//     acc[v.name] = { paramType: v.paramType, options: v.options }
//     return acc
//   }, {})

//   return (
//     <div>
//       <h3>Variables for Template {templateId}</h3>
//       <ul>
//         {variables.length === 0 && <li>No variables found</li>}
//         {variables.map((v: any, i: number) => (
//           <li key={i}>
//             <b>{v.name}</b> - Type: {v.paramType} - Options: {v.options.length ? v.options.join(', ') : 'None'}
//           </li>
//         ))}
//       </ul>
//     </div>
//   )
// }

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
  const [questionText,setQuestionText]=useState("")
  const [stake,setStake]=useState(0.01);
  const [minstake,setMinStake]=useState(0.01);
  const [maxstake,setMaxStake]=useState(0.02);
  const [confidence, setConfidence] = useState(6);


  const [stakeerror, setStakeError] = useState('');
  const [minstakeerror, setMinStakeError] = useState('');
  const [durationDays, setDurationDays] = useState(10);
  const [durationHours, setDurationHours] = useState(0);
  const challengeDurationSeconds = durationDays * 86400 + durationHours * 3600;

  const handleDurationDay = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      const clamped = Math.max(0, Math.min(365, value));
      setDurationDays(clamped);
    }
  };
  
  const handleDurationHour = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      const clamped = Math.max(0, Math.min(23, value));
      setDurationHours(clamped);
    }
  };

  const handleSetStake = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStake(parseFloat(value));
  
    const parsed = parseFloat(value);
    if (value === "") {
      setStakeError("");
    } else if (isNaN(parsed)) {
      setStakeError("Please enter a valid number");
    } else if (parsed < 0.01) {
      setStakeError("Stake must be at least 0.01");
    } else {
      setStakeError("");
    }
  };

  const handleSetMinStake = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMinStake(parseFloat(value));
  
    const parsed = parseFloat(value);
    if (value === "") {
      setMinStakeError("");
    } else if (isNaN(parsed)) {
      setMinStakeError("Please enter a valid number");
    } else if (parsed < 0.001) {
      setMinStakeError("Min Challenge Stake must be at least 0.001");
    } else {
      setMinStakeError("");
    }
  };

  useEffect(() => {
    const calculatedMin = Number(((stake * (11-confidence)) / 5).toFixed(4));
    const calculatedMax = Number((calculatedMin * 2).toFixed(4));

    setMinStake(calculatedMin);
    setMaxStake(calculatedMax);
  }, [confidence,stake]);



  const handleChangeTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedId(e.target.value);
    setValues({});
    console.log("hi")

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
                  templateCreateds(first: 100 , where: { activated: true }) {
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
      
      if(selectedId=="0" || templateText==""){
        return <div></div>;
      }
      const { data: variablesData, isLoading } = useContractRead({
        address: process.env.NEXT_PUBLIC_QUESTION_CONTRACT as `0x${string}`,
        abi: questionABI,
        functionName: 'getVariables',
        args: [parseInt(selectedId)],
      });
      console.log(selectedId,"selected id")
    
      // Create map: variableName -> { paramType, options }
  
      const variableMap: Record<string, { paramType: number; options: string[] }> = {};
      if (Array.isArray(variablesData)) {
        (variablesData || []).forEach((v: any) => {
          variableMap[v.name] = { paramType: v.paramType, options: v.options };
        });
      }
      const parsed = parseTemplate(templateText);
      console.log("parse",parsed)
    
      const handleChange = (variable: string, value: string) => {
        const updatedValues = { ...values, [variable]: value };
        setValues(updatedValues);
      
        const filledString = parsed
          .map(part => {
            if (typeof part === 'string') return part;
      
            const val = updatedValues[part.variable];
            if (!val) return `{${part.variable}}`;
      
            const isTimestamp = /^\d{10,}$/.test(val);
            if (isTimestamp) {
              const date = new Date(parseInt(val, 10) * 1000);
              return date.toUTCString(); // e.g., "Sat, 17 May 2025 00:00:00 GMT"
            }
      
            return val;
          })
          .join('');
      
        setQuestionText(filledString);
      };
      
      
      
    
    
      if (isLoading) return <div>Loading variables...</div>;
    
      return (
        <div>
  
           <br></br>
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
                        className={styles.inputvar}
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
                      type="datetime-local"
                      className={styles.inputvar}
                      value={
                        values[part.variable]
                          ? new Date(parseInt(values[part.variable]) * 1000)
                              .toISOString()
                              .slice(0, 16) // "YYYY-MM-DDTHH:mm"
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
                      className={styles.inputvar}
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

      setSteps(prevSteps =>
        prevSteps.map((step, i) =>
          i === 1
            ? { ...step, status: "pending", progressText: "uploading metadata..." }
            : step
        )
      );
      const { uri: contentUri } = await storageClient.uploadAsJson(metadata);
      
      setSteps(prevSteps =>
        prevSteps.map((step, i) =>
          i === 0
            ? { ...step, status: "success", progressText: `URI: ${contentUri}` }
            : step
        )
      );

      setSteps(prevSteps =>
        prevSteps.map((step, i) =>
          i === 1
            ? { ...step, status: "pending", progressText: `posting feed...` }
            : step
        )
      );

      console.log("uri",contentUri);
      if(!feed_address){
        throw("feed address is null");
      }
      const result = await post(sessionClient, {
        contentUri: uri(contentUri),
        feed: evmAddress(feed_address), 
      }).andThen(handleOperationWith(walletClient as any));
   
      if (!('value' in result)) {
        throw new Error(`Transaction failed: ${(result as any).error ?? 'Unknown error'}`);
      }
      const txHash = result.value as string;

      setSteps(prevSteps =>
        prevSteps.map((step, i) =>
          i === 1
            ? { ...step, status: "success", progressText: `Tx: ${txHash}` }
            : step
        )
      );
      setSteps(prevSteps =>
        prevSteps.map((step, i) =>
          i === 2
            ? { ...step, status: "pending", progressText: `Please confirm transaction in wallet` }
            : step
        )
      );
      

      addQuestion(txHash);
      setFinalProgressText("Post Created Successfully")
      setStatus("success");
      // setContent("");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setFinalProgressText("Something went wrong")
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

    // const templateId=1
    
       const hash = await walletClient.writeContract({
        address: process.env.NEXT_PUBLIC_PREDICTION_CONTRACT as `0x${string}`,
        abi: contractAbi,
        functionName: "createPrediction",
        args: [postTx, selectedId,variableNames,variableValues,questionText,BigInt(minstake * 1e18),BigInt(maxstake * 1e18),challengeDurationSeconds],
        value: BigInt(stake * 1e18), // example for sending 0.01 ETH
      });

      setSteps(prevSteps =>
        prevSteps.map((step, i) =>
          i === 2
            ? { ...step, status: "success", progressText: `Tx ${hash}` }
            : step
        )
      );
      
      
    }
    catch (err: any) {
      console.log(err);
    }
  }

  const [steps, setSteps] = useState([
    {
      label: "Upload prediction reasoning to Grove",
      status: "default",
      progressText: ""
    },
    {
      label: "Posting Lens Feed",
      status: "default",
      progressText: ""
    },
    {
      label: "Linking Feed and Create Prediction Transaction",
      status: "default",
      progressText: ""
    }
  ]);
  
  const [finalProgressText,setFinalProgressText] = useState("Please select From a template and create a prediction");
  

  // In your JSX:
  const { data: authenticatedUser, loading: authUserLoading } = useAuthenticatedUser();

  if(!authenticatedUser){
  return (
    <div
      style={{
        textAlign: "center",
        margin: "4rem auto",
        padding: "2rem",
        maxWidth: "400px",
        backgroundColor: "white", // soft yellow
        border: "2px solid black",
        borderRadius: "5px",
        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)",
        fontFamily: "sans-serif",
      }}
    >
      <p style={{ fontSize: "1.25rem", marginBottom: "1rem", color: "black" }}>
        Please Login and Refresh Page
      </p>
      <Login />
    </div>
  );}

  return (
    <div className={styles.container}>
      
      {/* <label htmlFor="question-select">Select a question template:</label> */}
      <div className={styles.left_container}>
        <div className={styles.title}>CREATE PREDICTION</div>
        <select
            className={styles.templateselect}
            id="question-select"
            value={selectedId}
            onChange={handleChangeTemplate}
          >
          <option value="">-- Choose a question Template --</option>
          {questionTemplates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.templateText}
            </option>
          ))}
        </select>
        {/* {memoizedFillInTheBlank} */}
        <FillInTheBlank templateText={selectedtemplateText} selectedId={selectedId}/>
    
        <textarea
    className={styles.textarea}
    rows={4}
    placeholder="Explain your reasoning in detail. This portion will be a lens feed."
    value={content}
    onChange={(e) => setContent(e.target.value)}
    disabled={posting}
  />
  <div>{questionText}</div>
  <div className={styles.stake_container}>
  <span className={styles.label}>Stake</span>
  <input
    type="number"
    id="stake"
    step="0.001"
    min="0.01"
    value={stake}
    onChange={handleSetStake}
    className={styles.input}
  />
  <span className={styles.unit}>GHO</span>
</div>
  {stakeerror && <p className={styles.error}>{stakeerror}</p>}

  <div className={styles.label_slider}>Confidence: {confidence}/10</div>
 
  <input
    type="range"
    min={1}
    max={10}
    value={confidence}
    onChange={(e) => setConfidence(Number(e.target.value))}
    className={styles.slider}
  />
  

  <div className={styles.stakeInputsContainer}>
  <div className={styles.inputBlock}>
    <label className={styles.label}>Minimum Challenge Stake
    <span className={styles.tooltipWrapper}>
      ?
      <span className={styles.tooltipText}>
        People can stake GHO to challenge this prediction. If the challenge pool is less than this minimum, the challenge will abort.
      </span>
    </span>
    </label>
    <input
      type="number"
      value={minstake}
      step="0.001"
      min="0.001"
      onChange={handleSetMinStake}
      className={styles.input}
    />
    {minstakeerror && <p className={styles.error}>{minstakeerror}</p>}
  </div>

  <div className={styles.inputBlock}>
    <label className={styles.label}>Maximum Challenge Stake</label>
    <input
      type="number"
      value={maxstake}
      step="0.001"
      onChange={(e) => setMaxStake(Number(e.target.value))}
      className={styles.input}
    />
  </div>
</div>
<div className={styles.durationContainer}>
  <label className={styles.label}>Challenge Deadline</label>
  <div className={styles.durationInputs}>
    <div className={styles.durationInput}>
      <input
        type="number"
        value={durationDays}
        onChange={handleDurationDay}
        min={0}
        max={365}
        className={styles.input2}
      />

      <span className={styles.unit2}>days</span>
    </div>
    <div className={styles.durationInput}>
      <input
        type="number"
        value={durationHours}
        onChange={handleDurationHour}
        min={0}
        max={23}
        className={styles.input2}
      />
      <span className={styles.unit2}>hours</span>
    </div>
  </div>
</div>



  <button
    className={styles.button}
    onClick={handlePost}
    disabled={posting || !content.trim()}
  >
    {posting ? "Posting..." : "Post"}
  </button>

      </div>
      <div className={styles.right_container}>
      {steps.map((step, index) => (
        <div className={styles.step} key={index}>
          <div className={styles.stepHeader}>
            <span className={`${styles.statusIndicator} ${styles[step.status]}`}></span>
            <span
              className={`${styles.progresslabel} ${
                step.status === "default" ? styles.labelDefault : ""
              }`}
            >
              {step.label}
            </span>
          </div>
          <div className={styles.progressText}>{step.progressText}</div>
        </div>
      ))}

      <div className={styles.finalProgressText}>{finalProgressText}</div>
    </div>



      {/* <button
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={addQuestion}
      >
        ADD QUESTION
      </button> */}

      {/* {status === "success" && (
        <p className="text-green-600 mt-2">Post created successfully!</p>
      )}
      {status === "error" && error && (
        <p className="text-red-600 mt-2">Error: {error}</p>
      )} */}
    </div>
  );
};

export default PostCreator;