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
})