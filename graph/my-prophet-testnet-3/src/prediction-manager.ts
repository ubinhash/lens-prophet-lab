
import {
  Claimed as ClaimedEvent,
  NewClaim as NewClaimEvent,
  PredictionChallenged as PredictionChallengedEvent,
  PredictionCreated as PredictionCreatedEvent,
  PredictionResolved as PredictionResolvedEvent,
  challengeDeadlineChanged as challengeDeadlineChangedEvent
} from "../generated/PredictionManager/PredictionManager"

import {
  Claimed,
  NewClaim,
  PredictionChallenged,
  PredictionCreated,
  PredictionResolved,
  ChallengeDeadlineChanged,
  Score
} from "../generated/schema"
import { BigInt } from "@graphprotocol/graph-ts";
import { BigDecimal } from "@graphprotocol/graph-ts";
export function handleClaimed(event: ClaimedEvent): void {
  let id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let entity = new Claimed(id)
  entity.user = event.params.user
  entity.amount = event.params.amount
  entity.blockNumber = event.block.number
  entity.timestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}

export function handleNewClaim(event: NewClaimEvent): void {
  let id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let entity = new NewClaim(id)
  entity.user = event.params.user
  entity.predictionId = event.params.predictionId
  entity.amount = event.params.amount
  entity.claimtype = event.params.claimtype
  entity.blockNumber = event.block.number
  entity.timestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}

export function handlePredictionChallenged(event: PredictionChallengedEvent): void {
  let id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let entity = new PredictionChallenged(id)
  entity.predictionId = event.parameters[0].value.toBigInt()
  entity.challenger = event.params.challenger
  entity.amount = event.params.amount
  entity.blockNumber = event.block.number
  entity.timestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()

  let predid=event.parameters[0].value.toBigInt().toString()
  let entity2 = PredictionCreated.load(predid);
   if (entity2 != null) {
    entity2.currentStake = entity2.currentStake.plus(event.params.amount);
    let challengers = entity2.challengers;
    if (!challengers.includes(event.params.challenger)) {
      challengers.push(event.params.challenger);
      entity2.challengers = challengers;
    }
     entity2.save();
   }
}

export function handlePredictionCreated(event: PredictionCreatedEvent): void {
  //let id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let id =  event.parameters[0].value.toBigInt().toString() //use prediction id as id
  let entity = new PredictionCreated(id)
  entity.predictionId = event.parameters[0].value.toBigInt()
  entity.postId = event.params.postId
  entity.questionId = event.params.questionId
  entity.sender = event.params.sender
  entity.stake = event.params.stake
  entity.questionText = event.params.questionText;
  entity.minChallengeStake = event.params.minChallengeStake;
  entity.maxChallengeStake = event.params.maxChallengeStake;
  entity.challengeDeadline=event.params.challengeDeadline;
  entity.blockNumber = event.block.number
  entity.timestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.resolution=0;

  entity.currentStake = BigInt.fromI32(0);
  entity.challengers = [];

  let score = Score.load(event.params.sender.toHex());
  if (score == null) {
    score = new Score(event.params.sender.toHex());
    score.total_prediction = 0;
    score.prediction_correct = 0;
    score.prediction_incorrect = 0;
    score.prediction_invalidated = 0;
    score.score = BigDecimal.zero();
  }
  score.total_prediction += 1;

  score.save();
  entity.save()
}

export function handlePredictionResolved(event: PredictionResolvedEvent): void {
  let id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let entity = new PredictionResolved(id)
  entity.predictionId =event.parameters[0].value.toBigInt()
  entity.resolution = event.params.resolution
  entity.blockNumber = event.block.number
  entity.timestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()

  let predid=event.parameters[0].value.toBigInt().toString()
   let entity2 = PredictionCreated.load(predid);
    if (entity2 != null) {
      entity2.resolution = event.params.resolution;
      entity2.save();
    }

    
    let prediction = PredictionCreated.load(event.parameters[0].value.toBigInt().toString());
    if (prediction == null) {
      // handle missing prediction case
      return;
    }
    let sender = prediction.sender.toHex();
    let score = Score.load(sender);
    if(score==null){
      score = new Score(sender);
    }
    if (event.params.resolution == 1) {
      score.prediction_correct += 1;
    } else if (event.params.resolution == 2) {
      score.prediction_incorrect += 1;
    } else if (event.params.resolution == 3) {
      score.prediction_invalidated += 1;
    }
    let newScore = calculateScore(
      prediction.stake,
      prediction.minChallengeStake,
      prediction.maxChallengeStake,
      prediction.challengeDeadline,
      event.block.timestamp
    );
  
    score.score = newScore;
  
    score.save();




}

export function handleChallengeDeadlineChanged(event: challengeDeadlineChangedEvent): void {
  let id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let entity = new ChallengeDeadlineChanged(id)
  entity.predictionId =event.parameters[0].value.toBigInt()
  entity.challengeDeadline = event.params.challengeDeadline;
  entity.blockNumber = event.block.number
  entity.timestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()

  let predid=event.parameters[0].value.toBigInt().toString()
   let entity2 = PredictionCreated.load(predid);
    if (entity2 != null) {
      entity2.challengeDeadline = event.params.challengeDeadline;
      entity2.save();
    }
}


function calculateScore(
  stake: BigInt,
  minChallengeStake: BigInt,
  maxChallengeStake: BigInt,
  challengeDeadline: BigInt,
  blockTimestamp: BigInt
): BigDecimal {
  // Convert BigInt to BigDecimal for precision operations
  let stakeDecimal = stake.toBigDecimal();
  let minStakeDecimal = minChallengeStake.toBigDecimal();
  let maxStakeDecimal = maxChallengeStake.toBigDecimal();

  // Calculate odds ratio factor: e.g. (maxStake / minStake)
  let oddsRatio1 = maxStakeDecimal.div(stakeDecimal);
  let oddsRatio2 = minStakeDecimal.div(stakeDecimal);
  let oddsRatio=oddsRatio1.plus(oddsRatio2);

  let DECIMALS_18 = BigDecimal.fromString("1000000000000000000");

   let normalizedStake = stakeDecimal.div(DECIMALS_18);
  // Logarithmic weight for stake size (adding 1 to avoid log(0))
  var stakeWeight=BigDecimal.fromString("1");;
  if (normalizedStake.lt(BigDecimal.fromString("0.02"))) {
    stakeWeight = BigDecimal.fromString("1");
  } else if (stakeDecimal.lt(BigDecimal.fromString("0.05"))) {
    stakeWeight = BigDecimal.fromString("2");
  } else if (stakeDecimal.lt(BigDecimal.fromString("0.1"))) {
    stakeWeight = BigDecimal.fromString("3");
  } else if (stakeDecimal.lt(BigDecimal.fromString("0.2"))) {
    stakeWeight = BigDecimal.fromString("4");
  } 
  else {
    stakeWeight = BigDecimal.fromString("5");
  }
  // let stakeWeight = stakeDecimal.plus(BigDecimal.fromString("1")).ln();

  // Time weight based on remaining challenge deadline time (in seconds)
  let now = BigInt.fromI32(blockTimestamp.toI32());
  let timeRemaining = challengeDeadline.minus(now).toBigDecimal();

  // You can normalize or scale the time weight as needed:
  let timeWeight = timeRemaining.div(BigDecimal.fromString("86400")); // e.g. days

  // Combine factors (weights can be adjusted for tuning)
  let score = oddsRatio.times(stakeWeight).times(timeWeight);

  return score;
}
