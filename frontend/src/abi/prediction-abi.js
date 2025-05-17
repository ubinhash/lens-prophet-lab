const predictionABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Claimed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "predictionId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "enum PredictionManager.ClaimType",
          "name": "claimtype",
          "type": "uint8"
        }
      ],
      "name": "NewClaim",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "challenger",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "PredictionChallenged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "postId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "questionId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "stake",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "questionText",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "minChallengeStake",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "maxChallengeStake",
          "type": "uint256"
        }
      ],
      "name": "PredictionCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "enum PredictionManager.Resolution",
          "name": "resolution",
          "type": "uint8"
        }
      ],
      "name": "PredictionResolved",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "balances",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "predictionId",
          "type": "uint256"
        }
      ],
      "name": "challengePrediction",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "challengerList",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "challenges",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "claim",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "claims",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "postId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "templateId",
          "type": "uint256"
        },
        {
          "internalType": "string[]",
          "name": "variableNames",
          "type": "string[]"
        },
        {
          "internalType": "string[]",
          "name": "variableValues",
          "type": "string[]"
        },
        {
          "internalType": "string",
          "name": "questionText",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "minChallengeStake",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "maxChallengeStake",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "challengeDuration",
          "type": "uint256"
        }
      ],
      "name": "createPrediction",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "feeCollector",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "feePercent",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "predictionId",
          "type": "uint256"
        }
      ],
      "name": "getChallengers",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "globalMinChallenge",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "globalMinInitialStake",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "hasChallenged",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "predictionCounter",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "predictions",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "postId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "questionId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "questionText",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "initialStake",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalChallenged",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "minChallengeStake",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "maxChallengeStake",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "challengeDeadline",
          "type": "uint256"
        },
        {
          "internalType": "enum PredictionManager.Resolution",
          "name": "resolution",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "predictionId",
          "type": "uint256"
        },
        {
          "internalType": "enum PredictionManager.Resolution",
          "name": "res",
          "type": "uint8"
        }
      ],
      "name": "resolvePrediction",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "templateManager",
      "outputs": [
        {
          "internalType": "contract IQuestionTemplateManager",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "predictionId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "newDeadline",
          "type": "uint256"
        }
      ],
      "name": "updateChallengeDeadline",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_globalMinChallenge",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_globalMinInitialStake",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_feePercent",
          "type": "uint256"
        }
      ],
      "name": "updateConfig",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newFeeCollector",
          "type": "address"
        }
      ],
      "name": "updateFeeCollector",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newTemplateManager",
          "type": "address"
        }
      ],
      "name": "updateTemplateManager",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]

export default predictionABI;