import { newMockEvent } from "matchstick-as"
import { ethereum, Address, Bytes, BigInt } from "@graphprotocol/graph-ts"
import { QuestionCreated } from "../generated/QuestionSample/QuestionSample"

export function createQuestionCreatedEvent(
  sender: Address,
  postId: Bytes,
  question: string,
  amountSent: BigInt
): QuestionCreated {
  let questionCreatedEvent = changetype<QuestionCreated>(newMockEvent())

  questionCreatedEvent.parameters = new Array()

  questionCreatedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  questionCreatedEvent.parameters.push(
    new ethereum.EventParam("postId", ethereum.Value.fromFixedBytes(postId))
  )
  questionCreatedEvent.parameters.push(
    new ethereum.EventParam("question", ethereum.Value.fromString(question))
  )
  questionCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "amountSent",
      ethereum.Value.fromUnsignedBigInt(amountSent)
    )
  )

  return questionCreatedEvent
}
