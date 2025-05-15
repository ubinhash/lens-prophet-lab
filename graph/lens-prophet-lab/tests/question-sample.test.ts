import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, Bytes, BigInt } from "@graphprotocol/graph-ts"
import { QuestionCreated } from "../generated/schema"
import { QuestionCreated as QuestionCreatedEvent } from "../generated/QuestionSample/QuestionSample"
import { handleQuestionCreated } from "../src/question-sample"
import { createQuestionCreatedEvent } from "./question-sample-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let sender = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let postId = Bytes.fromI32(1234567890)
    let question = "Example string value"
    let amountSent = BigInt.fromI32(234)
    let newQuestionCreatedEvent = createQuestionCreatedEvent(
      sender,
      postId,
      question,
      amountSent
    )
    handleQuestionCreated(newQuestionCreatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("QuestionCreated created and stored", () => {
    assert.entityCount("QuestionCreated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "QuestionCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "sender",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "QuestionCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "postId",
      "1234567890"
    )
    assert.fieldEquals(
      "QuestionCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "question",
      "Example string value"
    )
    assert.fieldEquals(
      "QuestionCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "amountSent",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
