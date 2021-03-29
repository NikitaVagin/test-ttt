const {expectEvent, BN, time, expectRevert, balance } = require('@openzeppelin/test-helpers');
const IcoContract = artifacts.require("ICO");
const { toWei } = require('web3-utils');

contract('ICO', async function(accounts) {
    let icoContract;
    let openingTime;
    let now;
    let closingTime;
    const tokenName = 'TestTransferToken';
    const tokenSymbol = 'TTT';
    const rateFirstPeriod = 42;
    const rateSecondPeriod = 28;
    const rateThird = 8;

    before(async function () {
        await time.advanceBlock();
        console.log(accounts[6]);
    });

    beforeEach(async function() {
        now = await time.latest();
        openingTime = (await time.latest()).add(time.duration.weeks(6)).add(time.duration.days(3));
        closingTime = openingTime.add(time.duration.weeks(1));
        icoContract = await IcoContract.new(accounts[0]);
    });

    it('should deploy smart-contract', async function () {
        assert(icoContract.address !== '');
    });

    it('should return contract owner ', async function () {
       const owner = await icoContract.owner()
        assert.equal(accounts[0], owner);
    });

    it('should return token symbol ', async function () {
        const symbol = await icoContract.symbol()
        assert(symbol === tokenSymbol);
    });

    it('should return token name ', async function () {
        const name = await icoContract.name()
        assert(name === tokenName);
    });
    it('should return 0 decimals ', async function () {
        const decimals = await icoContract.decimals();
        assert.equal(decimals, 0);
    });
    it('should return an error if sender is not contract owner', async function () {
        await expectRevert(icoContract.addToList(accounts[3], {from: accounts[1]}), 'ONLY OWNER!!!');
    });

    it('successful addition to the whitelist and event generation', async function () {
        const { logs } = await icoContract.addToList(accounts[3]);
        const isWhitelisted = await icoContract.isWhitelisted(accounts[3]);
        assert(isWhitelisted === true);
        expectEvent.inLogs(logs, 'AddedToWhitelist', {account: accounts[3]});
    });

    it('successful deletion from the whitelist and event generation', async function () {
        await icoContract.addToList(accounts[3]);
        const {logs} = await icoContract.removeFromList(accounts[3])
        expectEvent.inLogs(logs, 'RemovedFromWhitelist', {account: accounts[3]});
        const isWhitelisted = await icoContract.isWhitelisted(accounts[3]);
        assert(isWhitelisted === false);
    });


    it('should return an error if sale time has expired.', async function () {
        await time.increase(closingTime);
        await expectRevert(icoContract.sendTransaction({from: accounts[0], value: toWei('1', 'ether')}), 'ICO IS OVER');
    });

    describe('testing periods', () => {

        it('first period', async function () {
            await time.increase(time.duration.minutes(1));
            const {logs} = await icoContract.sendTransaction({from: accounts[0], value: toWei('1', 'ether')});
            const balance = await icoContract.balanceOf(accounts[0]);
            assert.equal(balance.toNumber(), rateFirstPeriod);
            expectEvent.inLogs(logs, 'Transfer', {value: rateFirstPeriod.toString()});

        });

        it('second period', async function () {
            await time.increase(time.duration.days(4));
            const {logs} = await icoContract.sendTransaction({from: accounts[0], value: toWei('1', 'ether')});
            const balance = await icoContract.balanceOf(accounts[0]);
            assert.equal(balance.toNumber(), rateSecondPeriod);
            expectEvent.inLogs(logs, 'Transfer', {value: rateSecondPeriod.toString()});
        });

        it('Third period', async function () {
            await time.increase(time.duration.weeks(4).add(time.duration.days(3)));
            const {logs} = await icoContract.sendTransaction({from: accounts[0], value: toWei('1', 'ether')});
            const balance = await icoContract.balanceOf(accounts[0]);
            assert.equal(balance.toNumber(), rateThird);
            expectEvent.inLogs(logs, 'Transfer', {value: rateThird.toString()});
        });

    })

    describe('testing transfer function', () => {
        it('should return an error if the sender is not in whitelist', async function () {
            await time.increase(time.duration.minutes(1));
            await icoContract.sendTransaction({from: accounts[0], value: toWei('1', 'ether')});
            expectRevert(icoContract.transfer(accounts[1], 5), 'The account is not in the whitelist');
        });

        it('successful transfer and event generation', async function () {
            let amount = 5

            await time.increase(time.duration.minutes(1));
            await icoContract.sendTransaction({from: accounts[0], value: toWei('1', 'ether')});
            await icoContract.addToList(accounts[0]);
            const { logs } = await icoContract.transfer(accounts[1], amount);

            const senderBalance = await icoContract.balanceOf(accounts[0]);
            const recipientBalance = await icoContract.balanceOf(accounts[1]);

            assert.equal(rateFirstPeriod - amount, senderBalance.toNumber());
            assert.equal(amount, recipientBalance.toNumber());
            expectEvent.inLogs(logs, 'Transfer', {from: accounts[0], to: accounts[1], value: amount.toString()})
        });
    })


});
