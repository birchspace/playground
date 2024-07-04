import bs58 from "bs58"
import dotenv from "dotenv"
import * as  web3 from "@solana/web3.js"

import type { PublicKey, Keypair } from "@solana/web3.js";
// Load environment variables from .env file
dotenv.config();

const RPC = process.env.RPC!
const KEY = process.env.KEY!

const connection = new web3.Connection(
    RPC, 'finalized'
);


//lamports
const sol = 1000000000;
// Set the minimum and maximum amount of SOL to be transferred in each transaction
const give_next = 0.003 * sol
const minAmount = Math.floor(give_next * 1.0);
const maxAmount = Math.floor(give_next * 1.1);

function sleep(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

const getBalance = async (sourcePublicKey: PublicKey) => {
    const balance = await connection.getBalance(sourcePublicKey);
    console.log(`${sourcePublicKey.toString()} sol balance:`, balance / sol);
    return balance;
};


const sendRandomAmount = async (fromKeypair: Keypair, toPublicKey: string) => {
    const destinationKey = new web3.PublicKey(toPublicKey);

    // solToLamports(amountInSOL);   
    const amountInSOL = Math.floor(Math.random() * (maxAmount - minAmount) + minAmount);
    const before_bal = await getBalance(fromKeypair.publicKey)

    const balance_num = (before_bal - amountInSOL) / sol

    // Check if the balance is less than 0.05
    if (balance_num < 0.05) {
        return {
            signature: "",
            amount: amountInSOL,
            destination: toPublicKey,
        };
    }

    // Create a transaction
    const transaction = new web3.Transaction().add(
        web3.SystemProgram.transfer({
            fromPubkey: fromKeypair.publicKey,
            toPubkey: destinationKey,
            lamports: amountInSOL,
        }))

    web3.sendAndConfirmTransaction(
        connection,
        transaction,
        [fromKeypair],
        {
            skipPreflight: true,
        }
    );

    return {
        amount: amountInSOL,
        destination: toPublicKey,
    };
}


const sourceKeypair = web3.Keypair.fromSecretKey(bs58.decode(KEY))

async function main(limit: number) {
    // 接收地址
    const toAddress = ""

    for (let i = 0; i < limit; i++) {
        try {
            await sendRandomAmount(sourceKeypair, toAddress);
        } catch (err) {
            const error = err as Error
            console.error(`${sourceKeypair.publicKey.toString()} Failed to transfer to ${toAddress}: ${error.message}`);
        }
    }

}


main(10)