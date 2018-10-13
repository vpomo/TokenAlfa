var AFACrowdsale = artifacts.require("./AFACrowdsale.sol");
var NZOCrowdsale = artifacts.require("./NZOCrowdsale.sol");

var contractNzo;

contract('NZOCrowdsale', (accounts) => {
    it('should deployed NZOCrowdsale', async ()  => {
        assert.equal(undefined, contractNzo);
        contractNzo = await NZOCrowdsale.deployed();
        assert.notEqual(undefined, contractNzo);
    });

    it('get address NZOCrowdsale', async ()  => {
        assert.notEqual(undefined, contractNzo.address);
    });
});


contract('AFACrowdsale', (accounts) => {
    var contract;
    var owner = accounts[0]; // for test

    var rate = Number(40);
    var rateStage2 = Number(20);
    var rateStage3 = Number(8);
    var buyWei = Number(1 * 10**18);
    var rateNew = Number(40);
    var buyWeiNew = 1 * 10**18;

    var fundForSale = 1575 * 10**22;

    it('should deployed contract', async ()  => {
        assert.equal(undefined, contract);
        contract = await AFACrowdsale.deployed();
        assert.notEqual(undefined, contract);
    });

    it('get address contract', async ()  => {
        assert.notEqual(undefined, contract.address);
    });

    it('verification balance owner contract', async ()  => {
        var balanceOwner = await contract.balanceOf(owner);
        assert.equal(fundForSale, balanceOwner);
    });


    it('verification of receiving Ether', async ()  => {
        await contract.setMinimumNzo(0);
        await contract.setContractNZO(contractNzo.address);

        var tokenAllocatedBefore = await contract.tokenAllocated.call();
        var balanceAccountTwoBefore = await contract.balanceOf(accounts[2]);
        var weiRaisedBefore = await contract.weiRaised.call();

        await contract.buyTokens(accounts[2],{from:accounts[2], value:buyWei});
        var tokenAllocatedAfter = await contract.tokenAllocated.call();
        assert.isTrue(tokenAllocatedBefore < tokenAllocatedAfter);
        assert.equal(0, tokenAllocatedBefore);
        //assert.equal(Number(rate*buyWei), Number(tokenAllocatedAfter));

       var balanceAccountTwoAfter = await contract.balanceOf(accounts[2]);
        assert.isTrue(balanceAccountTwoBefore < balanceAccountTwoAfter);
        assert.equal(0, balanceAccountTwoBefore);
        assert.equal(rate*buyWei, balanceAccountTwoAfter);

        var weiRaisedAfter = await contract.weiRaised.call();
        assert.isTrue(weiRaisedBefore < weiRaisedAfter);
        assert.equal(0, weiRaisedBefore);
        assert.equal(buyWei, weiRaisedAfter);

        var depositedAfter = await contract.getDeposited.call(accounts[2]);
        assert.equal(buyWei, depositedAfter);

        var balanceAccountThreeBefore = await contract.balanceOf(accounts[3]);
        await contract.buyTokens(accounts[3],{from:accounts[3], value:buyWeiNew});
        var balanceAccountThreeAfter = await contract.balanceOf(accounts[3]);
        assert.isTrue(balanceAccountThreeBefore < balanceAccountThreeAfter);
        assert.equal(0, balanceAccountThreeBefore);
        assert.equal(rateNew*buyWeiNew, balanceAccountThreeAfter);
    });


    it('verification claim tokens', async ()  => {
        var balanceAccountOneBefore = await contract.balanceOf(accounts[1]);
        assert.equal(0, balanceAccountOneBefore);
        await contract.buyTokens(accounts[1],{from:accounts[1], value:buyWei});
        var balanceAccountOneAfter = await contract.balanceOf(accounts[1]);
        await contract.transfer(contract.address,balanceAccountOneAfter,{from:accounts[1]});
        var balanceContractBefore = await contract.balanceOf(contract.address);
        assert.equal(buyWei*rate, balanceContractBefore);
        //console.log("balanceContractBefore = " + balanceContractBefore);
        var balanceAccountAfter = await contract.balanceOf(accounts[1]);
        assert.equal(0, balanceAccountAfter);
        var balanceOwnerBefore = await contract.balanceOf(owner);
        await contract.claimTokens(contract.address,{from:accounts[0]});
        var balanceContractAfter = await contract.balanceOf(contract.address);
        assert.equal(0, balanceContractAfter);
        var balanceOwnerAfter = await contract.balanceOf(owner);
        assert.equal(true, balanceOwnerBefore<balanceOwnerAfter);
    });

    it('verification limit stage', async ()  => {
        await contract.buyTokens(accounts[4],{from:accounts[4], value:buyWei*3}); //120 + 120
        var balanceAccountFor = await contract.balanceOf(accounts[4]);
        assert.equal(buyWei*3*rateStage2, Number(balanceAccountFor));

        await contract.buyTokens(accounts[4],{from:accounts[4], value:buyWei*3}); //120 + 120
        balanceAccountFor = await contract.balanceOf(accounts[4]);
        assert.equal(buyWei*3*rateStage3 + buyWei*3*rateStage2, Number(balanceAccountFor));
    });

    it('verification integration with token NZO', async ()  => {
        var balanceAccountFive = await contract.balanceOf(accounts[5]);
        assert.equal(0, Number(balanceAccountFive));
        var ownerTokenNzo = await contract.checkMinValueTokenNzo.call(accounts[5]);
        assert.equal(true, ownerTokenNzo);

        await contract.setMinimumNzo(buyWei);

        ownerTokenNzo = await contract.checkMinValueTokenNzo.call(accounts[5]);
        assert.equal(false, ownerTokenNzo);

        await contractNzo.transfer(accounts[5], buyWei*3, {from:accounts[0]});

        ownerTokenNzo = await contract.checkMinValueTokenNzo.call(accounts[5]);
        assert.equal(true, ownerTokenNzo);

    });


it('verification start/stop sale tokens', async ()  => {
        var numberTokens = await contract.validPurchaseTokens.call(buyWei);
        assert.equal(true, Number(numberTokens) > 0);
        await contract.stopSale();
        numberTokens = await contract.validPurchaseTokens.call(buyWei);
        assert.equal(0, Number(numberTokens));
    });

});



