import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt } from "@graphprotocol/graph-ts"
import {
  QuestionCreated,
  TemplateActivated,
  TemplateCreated,
  VariableAdded
} from "../generated/QuestionTemplateManager/QuestionTemplateManager"

export function createQuestionCreatedEvent(
  id: BigInt,
  templateId: BigInt
): QuestionCreated {
  let questionCreatedEvent = changetype<QuestionCreated>(newMockEvent())

  questionCreatedEvent.parameters = new Array()

  questionCreatedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  questionCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "templateId",
      ethereum.Value.fromUnsignedBigInt(templateId)
    )
  )

  return questionCreatedEvent
}

export function createTemplateActivatedEvent(
  id: BigInt,
  activated: boolean
): TemplateActivated {
  let templateActivatedEvent = changetype<TemplateActivated>(newMockEvent())

  templateActivatedEvent.parameters = new Array()

  templateActivatedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  templateActivatedEvent.parameters.push(
    new ethereum.EventParam("activated", ethereum.Value.fromBoolean(activated))
  )

  return templateActivatedEvent
}

export function createTemplateCreatedEvent(id: BigInt): TemplateCreated {
  let templateCreatedEvent = changetype<TemplateCreated>(newMockEvent())

  templateCreatedEvent.parameters = new Array()

  templateCreatedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )

  return templateCreatedEvent
}

export function createVariableAddedEvent(
  templateId: BigInt,
  name: string
): VariableAdded {
  let variableAddedEvent = changetype<VariableAdded>(newMockEvent())

  variableAddedEvent.parameters = new Array()

  variableAddedEvent.parameters.push(
    new ethereum.EventParam(
      "templateId",
      ethereum.Value.fromUnsignedBigInt(templateId)
    )
  )
  variableAddedEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )

  return variableAddedEvent
}
