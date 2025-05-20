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

![Screenshot1](https://raw.githubusercontent.com/ubinhash/lens-prophet-lab/main/screenshots/mainpage.png)


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

Live on Lens Mainnet

### Smart Contract

- **Prediction Manager **: [0x9BF1Cfac8AE303Be2637bA928Ef5cb8A8E136579](https://explorer.lens.xyz/address/0x9BF1Cfac8AE303Be2637bA928Ef5cb8A8E136579)
- **Question Template Manager **: [0x48d5C7801658b29e413F343B5998c733662b24c4](https://explorer.lens.xyz/address/0x48d5C7801658b29e413F343B5998c733662b24c4)

## Technical Details

### 1. Workflow

![Screenshot2](https://github.com/ubinhash/lens-prophet-lab/blob/main/screenshots/workflow.png)

### 1. Prediction Template Creation

Contract Owner can create prediction templates on the `QuestionTemplateManager` contract for the users to use based on current events and community interest, to ensure that the predictions are in valid forms.

Sample Template Definition

Question: `[TOKEN]` be `[Operator]` $`[TARGET_PRICE]` on `[DEADLINE]`?

Params:

- `[TOKEN]` => String| [BTC, ETH ....]

- `[Operator]` => String| [above, below]

- `[TARGET_PRICE]`=> Number

- `[DEADLINE]` => Date

After the params are added, the owner can then activate a template to indicate it can be used in prediction creation process.

During the creation process user will need to select a template ID and fill in the params, and the basic validity of params will be checked on chain.


### 2.Regarding Prediction Resolution

We use a centralized prediction resolution system for robustness and simplicity. This means:

- A trusted operator(eg owner) is authorized to resolve predictions manually based on the outcome.

- To streamline/semi-automate the process, we create templates for common types of predictions (e.g., specific sports events, on-chain price action etc)

- Predictions linked to the same template can be batch resolved efficiently this way.

### 3. Lens Feed Fetching

During the prediction creation process, the reasoning part is created as a lens feed, posting to a specific feed url (with your lens account), stored in grove and will be linked to the prediction on chain with your crypto wallet.

The prediction have a `postId` field linked to the hex of lens feed (So you can potentially reference **other's post**, currently not supported via UI). When we fetch and render latest prediction from graph, we also render the reasoning detail by querying the lens protocol api.

### 4. Stake Splitting

Disagree with a prediction? Challengers can stake to challenge a prediction up to the defined max.

*** a. Prediction Correct ***

Owner will get their stake back + get all the challenger's stake. (With small fee charged on the winning portion)


*** b. Prediction Incorrect ***

Each of the challenger will get their stake back + split the predictor's stake proportionally.  (With small fee charged on the winning portion)

*** c. Prediction Invalidated || Prediction Challenge Pool < Minimal ***

In this case the stake will be returned to the respective stakers. We do charge a small fee from the predictor in this case to reduce potentially spamming.




## Tech Stack

- Frontend: Next Js
- Indexing : The Graph
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
    
