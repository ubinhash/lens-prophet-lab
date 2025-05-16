// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IQuestionTemplateManager {
    function createQuestion(
        uint256 templateId,
        string[] memory variableNames,
        string[] memory variableValues
    ) external returns (uint256);
}

contract PredictionManager {
    enum Resolution { UNRESOLVED, WIN, LOSS, INVALIDATED }
    enum ClaimType { WINNING,REFUND,FEE }

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

    mapping(address => uint256) public balances;
    mapping(uint256 => mapping(address => uint256)) public claims; //predid -> address->win amount

    IQuestionTemplateManager public templateManager;

    uint256 public globalMinChallenge = 0.001 ether;
    uint256 public globalMinInitialStake = 0.01 ether;
    uint256 public feePercent = 5;
    address public owner;
    address public feeCollector;

    event PredictionCreated(uint256 indexed id, uint256 postId, uint256 questionId, address sender, uint256 stake);
    event PredictionChallenged(uint256 indexed id, address challenger, uint256 amount);
    event PredictionResolved(uint256 indexed id, Resolution resolution);
    event Claimed(address user, uint256 amount);
    event NewClaim(address user, uint256 predictionId, uint256 amount,ClaimType claimtype );

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
        string[] memory variableNames,
        string[] memory variableValues,
        string memory questionText,
        uint256 minChallengeStake,
        uint256 maxChallengeStake,
        uint256 challengeDuration
    ) external payable returns (uint256) {
        require(msg.value >= globalMinInitialStake, "Initial stake too low");
        require(minChallengeStake >= globalMinChallenge, "Min challenge too low");

        uint256 questionId = templateManager.createQuestion(templateId, variableNames, variableValues);

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
        require(msg.sender!=pred.sender,"can't challenge yourself");
        pred.totalChallenged += msg.value;
        challenges[predictionId][msg.sender] += msg.value;

        if (!hasChallenged[predictionId][msg.sender]) {
            hasChallenged[predictionId][msg.sender] = true;
            challengerList[predictionId].push(msg.sender);
        }

        emit PredictionChallenged(predictionId, msg.sender, msg.value);
    }

    function resolvePrediction(uint256 predictionId, Resolution res) external onlyOwner {
        Prediction storage pred = predictions[predictionId];
        require(pred.resolution == Resolution.UNRESOLVED, "Already resolved");
        pred.resolution = res;
        
        
        if (pred.totalChallenged<pred.minChallengeStake||res == Resolution.INVALIDATED) {
            uint256 fee = (pred.initialStake * feePercent) / 100;
            uint256 refund = pred.initialStake - fee;
            balances[feeCollector] += fee;
            _refundChallengers(predictionId);
            balances[pred.sender] += refund;
            claims[predictionId][pred.sender]+=refund;
            emit NewClaim(feeCollector,predictionId,fee,ClaimType.FEE);
            emit NewClaim(pred.sender,predictionId,refund,ClaimType.REFUND);
        } else if (res == Resolution.WIN) {
            uint256 fee = (pred.totalChallenged * feePercent) / 100;
            uint256 reward = pred.totalChallenged - fee;
            balances[feeCollector] += fee;
            balances[pred.sender] += pred.initialStake + reward;
            claims[predictionId][pred.sender]+=pred.initialStake + reward;
            emit NewClaim(feeCollector,predictionId,fee,ClaimType.FEE);
            emit NewClaim(pred.sender,predictionId,pred.initialStake + reward,ClaimType.WINNING);
        } else if (res == Resolution.LOSS) {
            uint256 fee = (pred.initialStake * feePercent) / 100;
            uint256 reward = pred.initialStake - fee;
            balances[feeCollector] += fee;
            emit NewClaim(feeCollector,predictionId,fee,ClaimType.FEE);

            address[] memory challengers = challengerList[predictionId];
            for (uint256 i = 0; i < challengers.length; i++) {
                address challenger = challengers[i];
                uint256 stake = challenges[predictionId][challenger];
                uint256 share = (stake * reward) / pred.totalChallenged;
                balances[challenger] += stake + share;
                claims[predictionId][challenger]+=stake + share;
                emit NewClaim(challenger,predictionId,stake + share,ClaimType.WINNING);
            }
        }

        emit PredictionResolved(predictionId, res);
    }

    function _refundChallengers(uint256 predictionId) internal {
        address[] memory challengers = challengerList[predictionId];
        for (uint256 i = 0; i < challengers.length; i++) {
            address challenger = challengers[i];
            uint256 stake = challenges[predictionId][challenger];
            balances[challenger] += stake;
            claims[predictionId][challenger]=stake;
            emit NewClaim(challenger,predictionId,stake,ClaimType.REFUND);
        }
    }

    function claim() external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "Nothing to claim");
        balances[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        emit Claimed(msg.sender, amount);
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
    function updateChallengeDeadline(uint256 predictionId, uint256 newDeadline) external {
        Prediction storage pred = predictions[predictionId];
        require(msg.sender == pred.sender, "Not prediction creator");
        require(pred.resolution == Resolution.UNRESOLVED, "Already resolved");
        require(newDeadline < pred.challengeDeadline, "Can only shorten deadline");
        require(newDeadline > block.timestamp, "Deadline must be in future");

        pred.challengeDeadline = newDeadline;
    }
    function updateConfig(
        uint256 _globalMinChallenge,
        uint256 _globalMinInitialStake,
        uint256 _feePercent
    ) external onlyOwner {
        require(_feePercent <= 100, "Fee percent cannot exceed 100");
        globalMinChallenge = _globalMinChallenge;
        globalMinInitialStake = _globalMinInitialStake;
        feePercent = _feePercent;
    }
}
