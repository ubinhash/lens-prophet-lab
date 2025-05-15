import { QuestionCreated as QuestionCreatedEvent } from "../generated/Contract/Contract"
import { QuestionCreated } from "../generated/schema"

export function handleQuestionCreated(event: QuestionCreatedEvent): void {
  let entity = new QuestionCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.sender = event.params.sender
  entity.postId = event.params.postId
  entity.question = event.params.question
  entity.amountSent = event.params.amountSent

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
