import './Token.sol';
pragma solidity ^0.6.0;

contract ICO is Token{
    using SafeMath for uint256;
    address payable private _wallet;
    uint256 private _weiRaised;
    uint256 public _start;
    uint256 public _period;


    constructor(address payable wallet) public {
        require(wallet != address(0));
        _wallet = wallet;
        _period = 6 weeks + 3 days;
        _start = block.timestamp;
    }
    modifier icoActive() {
        require(block.timestamp > _start && block.timestamp < _start + _period, 'ICO IS OVER');
        _;
    }
    fallback () external payable {
        createTokens();
    }

    function createTokens() public icoActive payable {
        require(msg.value > 0);
        uint256 _rate;
        _wallet.transfer(msg.value);
        if(block.timestamp < (_start + 3 days)){ //First period
            _rate = 42;
        }else if(block.timestamp >= (_start + 1 minutes) && block.timestamp < (_start + (4 weeks + 3 days))){ //Second period
            _rate = 28;
        } else{ // third period
            _rate = 8;
        }
        uint256 tokens = _rate.mul(msg.value).div(1 ether);
        _mint(msg.sender, tokens);
    }
}
