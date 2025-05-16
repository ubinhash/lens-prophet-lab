// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract QuestionSample {
    // Event to log when a question is created
    event QuestionCreated(address indexed sender, bytes32 postId, string question, uint256 amountSent);

    // Struct to store question data
    struct Question {
        bytes32 postId;
        string question;
        address sender;
        uint256 amountSent;
    }

    // Mapping to store questions by postId
    mapping(bytes32 => Question) public questions;

    // Owner of the contract
    address public owner;

    // Constructor to set the owner of the contract
    constructor() {
        owner = msg.sender; // Set the contract deployer as the owner
    }

    // Function to create a question and store it in the contract
    function createQuestion(bytes32 postId, string memory question) external payable {
        // Ensure that some ETH is sent along with the request
        require(msg.value > 0, "You must send some ETH to create a question");

        // Store the question in the contract
        questions[postId] = Question({
            postId: postId,
            question: question,
            sender: msg.sender,
            amountSent: msg.value
        });

        // Emit the event to notify the creation of the question
        emit QuestionCreated(msg.sender, postId, question, msg.value);
    }

    // Function to withdraw contract balance (only owner or admin)
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can withdraw");
        _;
    }

    function withdraw() external onlyOwner {
        (bool success, ) = payable(owner).call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }
}
