# Lens Prophet Lab

## Project Intro

### The Problem 

Every day, influencers make bold market calls, but only celebrate the wins and delete their post on lost. 

So how do we discover people who are actually good at making market calls? Lens Prophet Lab is here to change that.

We are building a novel user-centric social prediction market where the focus is the the user and the content they create, centered around predictions.

### What are we building?

Lens Prophet Lab is a user-centric social prediction platform that turns bold market calls into on-chain reputation.

Each prediction is tied to a Lens post, with public reasoning and peer challenges.

Prophets stake on their predictions and actually pick their odd themselves, the more the odd is against your claim, the higher the score for being confidently correct by risking your stake.

If you’re right consistently, your reputation grows and top prophets are featured on main page.


### Mechanics

But how do we ensure the incentives are aligned and people will not be spamming predictions? 

- Prophets can declare their "confidence level" by selecting the odd.
    - For example, if User A and B are making prediction on the same event:
        - User A Staked 0.05 ETH and allowed a minimum challenge of 0.01 ETH
        - User B Staked 0.05 ETH and only accepts a minimum challenge of 0.05 ETH
        - Then User A is considered to be more confident in their claim and will recieve a higher rating if they prophet comes true
- The scores are calculated based on multiple factors, the stake size, the confidence level, the template chosen,  and the outcome
- We take percentage of fee from winner.

Followers can challenge high-confidence claims with smaller stakes and earn a proportional share if the Prophet is wrong. The more "confident" you are, the more you stand to lose.

So climb on the top , and get your words be heard.

![Screenshot](https://github.com/ubinhash/lens-prophet-lab/blob/main/screenshots/mainpage.png)


### What's novel about this project?

- Creator-Centric Prediction
    - Most prediction markets focus on the outcome. We focus on the people. Lens Prophet Lab builds a reputation layer for market forecasters — your accuracy becomes your influence. This flips the script from anonymous bets to public accountability and recognition.

- Confidence-Based Risk Weighting
    - Instead of one-size-fits-all wagers, Prophets define their confidence by setting customizable odds and challenge thresholds. The more confident you claim to be, the more you're putting on the line — and the more credibility (or risk) you take on. This introduces a self-regulating system of trust.

- Social aspect using Lens feed
    - Each prediction have to come with a reaosoning which is posted as a lens feed and quoted in the prediction.

- Peer to Peer Challenge Mechanism 
    -The challenges are peer to peer which creates more of a social vibe that fits for Lens. In the future, this will allow for follower-only challenge where top prophets can make follower-only predictions that only their followers/token holder can challenge. 


## Deployment Info

### Prototype

Demo Website: https://lens-prophet-lab.vercel.app

### Smart Contract

- **Prediction Creation**: [0x9BF1Cfac8AE303Be2637bA928Ef5cb8A8E136579](https://explorer.lens.xyz/address/0x9BF1Cfac8AE303Be2637bA928Ef5cb8A8E136579)
- **Question Template Creation**: [0x48d5C7801658b29e413F343B5998c733662b24c4](https://explorer.lens.xyz/address/0x48d5C7801658b29e413F343B5998c733662b24c4)

### Regarding Prediction Resolution

We use a centralized prediction resolution system for robustness and simplicity. This means:

- A trusted operator is authorized to resolve predictions manually based on the outcome.

- To streamline/semi-automate the process, we create templates for common types of predictions (e.g., specific sports events, on-chain price action etc)

- Predictions linked to the same template can be batch resolved efficiently this way.

### Workflow

![Screenshot](https://github.com/ubinhash/lens-prophet-lab/blob/main/screenshots/workflow.png)


## Tech Stack

- Frontend: Next Js
- Indexing : GraphQL
- Smart Contract: Hardhat
- Wallet Connection: Connect Kit + Continue with Family 
- Lens Social Primitive Used: Account & Feed (the prediction's reasoning is stored as lens feed, referenced)
- Feed Storage: Grove

### How to Run The code

1. Frontend 

Install Dependencies: `bun install && bun run build`


Set up environemnt Variables in `.env`

```
NEXT_PUBLIC_ENVIRONMENT= "production"

NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=2cf87a887f037fbb1e90fb7357309d18

NEXT_PUBLIC_APP_ADDRESS_MAINNET=[CREATE APP PROJECT ON https://developer.lens.xyz/apps]

NEXT_PUBLIC_MAINNET_FEED_ADDRESS=[CREATE FEED ADDRESS ON https://developer.lens.xyz/feeds]

NEXT_PUBLIC_QUESTION_CONTRACT=[QUESTION TEMPLATE CONTRACT ADRESS]
NEXT_PUBLIC_PREDICTION_CONTRACT=[PREDICTION CONTRACT ADRESS]


NEXT_PUBLIC_GRAPH_URL=https://api.studio.thegraph.com/query/...
```

Running the project locallyL `bun run dev`

2. Indexing - The Graph

`graph codegen && graph build`
`graph deploy [project slug]`


3. Contracts

Compile with  

`yarn compile`

Deploy with 

`yarn deploy --script deploy-question.ts --network lensMainnet`
`yarn deploy --script deploy-prediction.ts --network lensMainnet`


### Tools and Library

- Frontend Starter Template: https://github.com/kuhaku-xyz/lens-starter 
- Hardhat Boilerplate: https://github.com/lens-protocol/lens-network-hardhat-boilerplate



## Future Improvments

- Follower Social-Fi Component 
    - We may add a social-fi aspect of the game to allow good prophet can monitize their influence. Top prophet can sell their predictions or create predictions where only followers can challenge.

- More advanced scoring algorithm
    - Due to time constraint, the current scoring algorithm is quite basic. But the exsistence of template will allow us to perform custom weighting for specific questions based on the parameters in the future
        - For example we may adjust the scoring weight for price prediction based on the variance and price of each token as well. If the user's prediction is too "safe" , then it will recieve minimal weighting.
- Complex Feed Structure
    - Currently we are doing for text-only metadata uploading for feed for simplicity. In the future will may support images/commenting.
    
- 
