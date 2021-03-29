import './WhiteList.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
pragma solidity ^0.6.0;

contract Token is WhiteList, ERC20 {
    constructor() public ERC20("TestTransferToken", "TTT") {
        _setupDecimals(0);
    }
    function transfer(address recipient, uint256 amount) public onlyWhitelisted override returns (bool){
        _transfer(_msgSender(), recipient, amount);
        return true;
    }
}
