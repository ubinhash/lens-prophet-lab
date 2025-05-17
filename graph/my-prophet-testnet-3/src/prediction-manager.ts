
import {
  Claimed as ClaimedEvent,
  NewClaim as NewClaimEvent,
  PredictionChallenged as PredictionChallengedEvent,
  PredictionCreated as PredictionCreatedEvent,
  PredictionResolved as PredictionResolvedEvent
} from "../generated/PredictionManager/PredictionManager"

import {
  Claimed,
  NewClaim,
  PredictionChallenged,
  PredictionCreated,
  PredictionResolved
} from "../generated/schema"

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
  entity.blockNumber = event.block.number
  entity.timestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.resolution=0;
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
}
