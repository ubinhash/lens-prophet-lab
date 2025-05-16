// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IQuestionTemplateManager {
    function createQuestion(uint256 templateId, string[] calldata params) external returns (uint256);
}


contract PredictionManager {
    enum Resolution { UNRESOLVED, WIN, LOSS, INVALIDATED }

    struct Prediction {
        uint256 postId;
        uint256 questionId;
        string questionText;
        address sender;
        uint256 initialStake;
        uint256 totalChallenged;
        uint256 minChallengeStake;
        uint256 maxChallengeStake;
        uint256 challengeDeadline;
        Resolution resolution;
    }

    uint256 public predictionCounter;
    mapping(uint256 => Prediction) public predictions;
    mapping(uint256 => mapping(address => uint256)) public challenges;
    mapping(uint256 => address[]) public challengerList;
    mapping(uint256 => mapping(address => bool)) public hasChallenged;
    mapping(uint256 => mapping(address => uint256)) public prizeClaims;
    mapping(uint256 => mapping(address => bool)) public prizeClaimed;
    IQuestionTemplateManager public templateManager;

    uint256 public globalMinChallenge = 0.001 ether;
    uint256 public globalMinInitialStake = 0.01 ether;
    uint256 public feePercent = 5;
    address public owner;
    address public feeCollector;

    event PredictionCreated(uint256 indexed id, uint256 postId, uint256 questionId, address sender, uint256 stake);
    event PredictionChallenged(uint256 indexed id, address challenger, uint256 amount);
    event PredictionResolved(uint256 indexed id, Resolution resolution);
    event PrizeClaimed(uint256 indexed id, address user, uint256 amount);

  
    constructor() {
        owner = msg.sender;
        feeCollector = msg.sender;
    }
    modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
}


function createPrediction(
        uint256 postId,
        uint256 templateId,
        string[] calldata templateParams,
        string memory questionText,
        uint256 minChallengeStake,
        uint256 maxChallengeStake,
        uint256 challengeDuration
    ) external payable returns (uint256) {
        require(msg.value >= globalMinInitialStake, "Initial stake too low");
        require(minChallengeStake >= globalMinChallenge, "Min challenge too low");

        uint256 questionId = templateManager.createQuestion(templateId, templateParams);

        predictionCounter++;
        predictions[predictionCounter] = Prediction({
            postId: postId,
            questionId: questionId,
            questionText: questionText,
            sender: msg.sender,
            initialStake: msg.value,
            totalChallenged: 0,
            minChallengeStake: minChallengeStake,
            maxChallengeStake: maxChallengeStake,
            challengeDeadline: block.timestamp + challengeDuration,
            resolution: Resolution.UNRESOLVED
        });

        emit PredictionCreated(predictionCounter, postId, questionId, msg.sender, msg.value);
        return predictionCounter;
    }

    function challengePrediction(uint256 predictionId) external payable {
        Prediction storage pred = predictions[predictionId];
        require(pred.resolution == Resolution.UNRESOLVED, "Resolved");
        require(block.timestamp <= pred.challengeDeadline, "Challenge over");
        require(pred.totalChallenged + msg.value <= pred.maxChallengeStake, "Exceeds max");

        pred.totalChallenged += msg.value;
        challenges[predictionId][msg.sender] += msg.value;

        if (!hasChallenged[predictionId][msg.sender]) {
            hasChallenged[predictionId][msg.sender] = true;
            challengerList[predictionId].push(msg.sender);
        }

        emit PredictionChallenged(predictionId, msg.sender, msg.value);
    }

    function resolvePrediction(uint256 predictionId, Resolution res) external {
        Prediction storage pred = predictions[predictionId];
        require(pred.resolution == Resolution.UNRESOLVED, "Already resolved");
        pred.resolution = res;

        if (res == Resolution.INVALIDATED) {
            uint256 fee = (pred.initialStake * feePercent) / 100;
            uint256 refund = pred.initialStake - fee;
            prizeClaims[predictionId][feeCollector] += fee;
            _refundChallengers(predictionId);
            prizeClaims[predictionId][pred.sender] += refund;
        } else if (res == Resolution.WIN) {
            uint256 fee = (pred.totalChallenged * feePercent) / 100;
            uint256 reward = pred.totalChallenged - fee;
            prizeClaims[predictionId][feeCollector] += fee;
            prizeClaims[predictionId][pred.sender] += pred.initialStake + reward;
        } else if (res == Resolution.LOSS) {
            uint256 fee = (pred.initialStake * feePercent) / 100;
            uint256 reward = pred.initialStake - fee;
            prizeClaims[predictionId][feeCollector] += fee;

            address[] memory challengers = challengerList[predictionId];
            for (uint256 i = 0; i < challengers.length; i++) {
                address challenger = challengers[i];
                uint256 stake = challenges[predictionId][challenger];
                uint256 share = (stake * reward) / pred.totalChallenged;
                prizeClaims[predictionId][challenger] += stake + share;
            }
        }

        emit PredictionResolved(predictionId, res);
    }

    function claimPrize(uint256 predictionId) external {
        uint256 amount = prizeClaims[predictionId][msg.sender];
        require(amount > 0, "Nothing to claim");
        require(!prizeClaimed[predictionId][msg.sender]);
        prizeClaimed[predictionId][msg.sender]=true;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        emit PrizeClaimed(predictionId, msg.sender, amount);
    }

    function _refundChallengers(uint256 predictionId) internal {
        address[] memory challengers = challengerList[predictionId];
        for (uint256 i = 0; i < challengers.length; i++) {
            address challenger = challengers[i];
            uint256 stake = challenges[predictionId][challenger];
            prizeClaims[predictionId][challenger] += stake;
        }
    }

    function getChallengers(uint256 predictionId) external view returns (address[] memory) {
        return challengerList[predictionId];
    }

    function updateTemplateManager(address newTemplateManager) external onlyOwner {
        require(newTemplateManager != address(0), "Invalid address");
        templateManager = IQuestionTemplateManager(newTemplateManager);
    }

    function updateFeeCollector(address newFeeCollector) external onlyOwner {
        require(newFeeCollector != address(0), "Invalid address");
        feeCollector = newFeeCollector;
    }
}
