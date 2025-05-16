import {
  QuestionCreated as QuestionCreatedEvent,
  TemplateActivated as TemplateActivatedEvent,
  TemplateCreated as TemplateCreatedEvent,
  VariableAdded as VariableAddedEvent
} from "../generated/QuestionTemplateManager/QuestionTemplateManager"
import {
  QuestionCreated,
  TemplateActivated,
  TemplateCreated,
  VariableAdded
} from "../generated/schema"

export function handleQuestionCreated(event: QuestionCreatedEvent): void {
  let entity = new QuestionCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.QuestionTemplateManager_id = event.params.id
  entity.templateId = event.params.templateId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTemplateActivated(event: TemplateActivatedEvent): void {
  let entity = new TemplateActivated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.QuestionTemplateManager_id = event.params.id
  entity.activated = event.params.activated

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTemplateCreated(event: TemplateCreatedEvent): void {
  let entity = new TemplateCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.QuestionTemplateManager_id = event.params.id

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleVariableAdded(event: VariableAddedEvent): void {
  let entity = new VariableAdded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.templateId = event.params.templateId
  entity.name = event.params.name

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
