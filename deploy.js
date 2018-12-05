const HDWalletProvider = require('truffle-hdwallet-provider')
const Web3 = require('web3')
const { interface, bytecode } = require('./compile')
const envVars = require('./env')

const provider = new HDWalletProvider(
    envVars.mneumonic,
    envVars.deployUrl
)

const web3 = new Web3(provider)

const deploy = async () => {
    const accounts = await web3.eth.getAccounts()
    const deployAccount = accounts[0]

    console.log(`we will be deploying with public key ${deployAccount}`)

    const deployResult = await new web3.eth.Contract(
        JSON.parse(interface)
    )
    .deploy(
        {
            data: bytecode
        }
    )
    .send({
        gas: '1000000',
        from: deployAccount
    })

    console.log(`contract deployed to ${deployResult.options.address}`)

    console.log(`with ABI: ${interface}`)


}

deploy()