pragma solidity ^0.6.0;

contract Owner {
    address public owner;


    constructor () public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, 'ONLY OWNER!!!');
        _;
    }

}
