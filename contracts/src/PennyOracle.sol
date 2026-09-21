// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract PennyOracle {
    IERC20 public immutable USDC;
    uint256 public constant PRICE = 10_000;

    address public owner;
    address public oracle;
    uint256 public nextId;

    struct Question {
        address asker;
        string question;
        bytes32 answerHash;
        bool fulfilled;
        uint64 askedAt;
        uint64 fulfilledAt;
    }

    mapping(uint256 => Question) public questions;

    event Asked(
        uint256 indexed id,
        address indexed asker,
        string question,
        uint64 askedAt
    );
    event Fulfilled(uint256 indexed id, bytes32 answerHash, uint64 fulfilledAt);
    event OracleUpdated(address indexed oracle);
    event OwnerUpdated(address indexed owner);

    error NotOwner();
    error NotOracle();
    error AlreadyFulfilled();
    error QuestionNotFound();
    error EmptyQuestion();
    error PaymentFailed();

    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    modifier onlyOracle() {
        _checkOracle();
        _;
    }

    constructor(address usdcAddress, address oracleAddress) {
        USDC = IERC20(usdcAddress);
        owner = msg.sender;
        oracle = oracleAddress;
    }

    function ask(string calldata question) external returns (uint256 id) {
        if (bytes(question).length == 0) revert EmptyQuestion();
        if (!USDC.transferFrom(msg.sender, address(this), PRICE))
            revert PaymentFailed();

        id = nextId++;
        questions[id] = Question({
            asker: msg.sender,
            question: question,
            answerHash: bytes32(0),
            fulfilled: false,
            askedAt: uint64(block.timestamp),
            fulfilledAt: 0
        });

        emit Asked(id, msg.sender, question, uint64(block.timestamp));
    }

    function fulfill(uint256 id, bytes32 answerHash) external onlyOracle {
        Question storage q = questions[id];
        if (q.askedAt == 0) revert QuestionNotFound();
        if (q.fulfilled) revert AlreadyFulfilled();

        q.answerHash = answerHash;
        q.fulfilled = true;
        q.fulfilledAt = uint64(block.timestamp);

        emit Fulfilled(id, answerHash, q.fulfilledAt);
    }

    function setOracle(address oracleAddress) external onlyOwner {
        oracle = oracleAddress;
        emit OracleUpdated(oracleAddress);
    }

    function setOwner(address ownerAddress) external onlyOwner {
        owner = ownerAddress;
        emit OwnerUpdated(ownerAddress);
    }

    function withdraw(address to, uint256 amount) external onlyOwner {
        if (!USDC.transfer(to, amount)) revert PaymentFailed();
    }

    function getQuestion(uint256 id) external view returns (Question memory) {
        return questions[id];
    }

    function _checkOwner() internal view {
        if (msg.sender != owner) revert NotOwner();
    }

    function _checkOracle() internal view {
        if (msg.sender != oracle) revert NotOracle();
    }
}
