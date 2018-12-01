const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3') // constructor
const web3 = new Web3(ganache.provider()) // instance
const { interface, bytecode } = require('../compile')

let accounts
let lotteryInstance

beforeEach(async () => {
    // get a list of accounts
    accounts = await web3.eth.getAccounts()

    // use one of those accounts to deploy the contract
    lotteryInstance = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({
            data: bytecode
        })
        .send({
            from: accounts[0],
            gas: '1000000'
        })
})

describe('Lottery contract', () => {
    it('deploys a contract', () => {
        assert.ok(lotteryInstance.options.address)
    })

    it('allows a player to enter', async () => {
        await lotteryInstance.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('.011', 'ether')
        })

        const players = await lotteryInstance.methods.getPlayers().call({
            from: accounts[0]
        })

        assert.equal(accounts[0], players[0])
        assert.equal(1, players.length)
    })

    it('allows multiple players to enter', async () => {
        await lotteryInstance.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('.011', 'ether')
        })

        await lotteryInstance.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('.011', 'ether')
        })

        await lotteryInstance.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('.02', 'ether')
        })

        const players = await lotteryInstance.methods.getPlayers().call({
            from: accounts[0]
        })

        assert.equal(accounts[0], players[0])
        assert.equal(accounts[1], players[1])
        assert.equal(accounts[2], players[2])
        assert.equal(3, players.length)
    })

    it('requires a minimum amount of ether to enter', async () => {
        try {
            await lotteryInstance.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei('.01', 'ether')
            })
            assert(false)
        } catch (err) {
            assert(err)
        }

        const players = await lotteryInstance.methods.getPlayers().call({
            from: accounts[0]
        })

        assert.equal(0, players.length)
    })

    it('only manager can call pickWinner', async () => {
        try {
            await lotteryInstance.methods.pickWinner().send({
                from: accounts[1],
                value: web3.utils.toWei('.01', 'ether')
            })
            assert(false)
        } catch (err) {
            assert(err)
        }
    })

    it('it runs through as expected; sends money to winner and resets players array', async () => {
        await lotteryInstance.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        })

        const balanceAfterJoining = await web3.eth.getBalance(accounts[0])

        await lotteryInstance.methods.pickWinner().send({
            from: accounts[0]
        })

        const postWinBalance = await web3.eth.getBalance(accounts[0])

        const difference = postWinBalance - balanceAfterJoining

        assert(difference > web3.utils.toWei('1.8', 'ether'))
    })
})