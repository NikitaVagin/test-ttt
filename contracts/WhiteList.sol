pragma solidity ^0.6.0;
import './Owner.sol';

contract WhiteList is Owner{
    mapping(address => bool) whitelist;
    event AddedToWhitelist(address indexed account);
    event RemovedFromWhitelist(address indexed account);

    modifier onlyWhitelisted() {
        require(isWhitelisted(msg.sender), 'The account is not in the whitelist');
        _;
    }

    function addToList(address _address) public onlyOwner{
        whitelist[_address] = true;
        emit AddedToWhitelist(_address);
    }

    function removeFromList(address _address) public onlyOwner{
        whitelist[_address] = false;
        emit RemovedFromWhitelist(_address);
    }

    function isWhitelisted(address _address) public view returns(bool) {
        return whitelist[_address];
    }
}
