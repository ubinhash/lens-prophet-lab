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
import { Bytes } from "@graphprotocol/graph-ts";
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

// export function handleTemplateActivated(event: TemplateActivatedEvent): void {
//   let entity = new TemplateActivated(
//     event.transaction.hash.concatI32(event.logIndex.toI32())
//   )
//   entity.QuestionTemplateManager_id = event.params.id
//   entity.activated = event.params.activated

//   entity.blockNumber = event.block.number
//   entity.blockTimestamp = event.block.timestamp
//   entity.transactionHash = event.transaction.hash

//   entity.save()
// }



export function handleTemplateActivated(event: TemplateActivatedEvent): void {
  let id = Bytes.fromHexString(event.params.id.toHexString()) as Bytes;

  let entity = TemplateActivated.load(id);
  if (entity == null) {
    entity = new TemplateActivated(id);
  }

  entity.QuestionTemplateManager_id = event.params.id;
  entity.activated = event.params.activated;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  let entity2 = TemplateCreated.load(id);
  if (entity2 != null) {
    entity2.activated = event.params.activated;
    entity2.save();
  }
}


// export function handleTemplateCreated(event: TemplateCreatedEvent): void {
//   let entity = new TemplateCreated(
//     event.transaction.hash.concatI32(event.logIndex.toI32())
//   )
//   entity.QuestionTemplateManager_id = event.params.id
//   entity.templateText = event.params.templateText
//   entity.category = event.params.category

//   entity.blockNumber = event.block.number
//   entity.blockTimestamp = event.block.timestamp
//   entity.transactionHash = event.transaction.hash

//   entity.save()
// }

export function handleTemplateCreated(event: TemplateCreatedEvent): void {
  let id = Bytes.fromHexString(event.params.id.toHexString()) as Bytes;

  // Try loading existing entity or create new
  let entity = TemplateCreated.load(id);
  if (entity == null) {
    entity = new TemplateCreated(id);
    entity.activated = false;  // default to false on creation
  }

  entity.QuestionTemplateManager_id = event.params.id
  entity.templateText = event.params.templateText
  entity.category = event.params.category

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
