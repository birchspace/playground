import fs from "fs"
import bs58 from "bs58"
import task from 'tasuku'
import * as  web3 from "@solana/web3.js"

import type { PublicKey, Keypair } from "@solana/web3.js";

export const TITLE_TEXT = `
                    .__        
  __________   ____ |__| ____  
 /  ___/  _ \ /    \|  |/ ___\ 
 \___ (  <_> )   |  \  \  \___ 
/____  >____/|___|  /__|\___  >
     \/           \/        \/ 
`;


console.log(TITLE_TEXT);

const RPC = "https://devnet.sonic.game"

const connection = new web3.Connection(
    RPC, 'finalized'
);


//lamports
const sol = 1000000000;
// Set the minimum and maximum amount of SOL to be transferred in each transaction
const give_next = 0.001 * sol
const minAmount = Math.floor(give_next * 1.0);
const maxAmount = Math.floor(give_next * 1.1);

export const sleep = (ms = 1000 * Math.random() + 900) =>
    new Promise((resolve) => setTimeout(resolve, ms));

const getBalance = async (sourcePublicKey: PublicKey) => {
    const balance = await connection.getBalance(sourcePublicKey);
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

async function main(times: number = 100) {

    let keys: string[] = []

    await new Promise<void>((resolve, reject) => {
        fs.readFile("./keys.txt", "utf8", async (err, data) => {
            if (err) {
                console.error("Error reading the file:", err);
                return reject(err);
            }

            keys = data
                .trim()
                .split("\n")
                .map((key) => key.trim());

            resolve()
        });

    });

    for (const key of keys) {
        const keypair = web3.Keypair.fromSecretKey(bs58.decode(key))

        await task(`${keypair.publicKey.toString()} has been completed 0`, async ({ setTitle }) => {

            for (let i = 0; i < times; i++) {
                let receiverKey: string
                do {
                    receiverKey = keys[Math.floor(Math.random() * keys.length)]
                } while (receiverKey === key);

                const receiverKeypair = web3.Keypair.fromSecretKey(bs58.decode(receiverKey));

                const nestedTask = await task(`-> ${receiverKeypair.publicKey.toString()}`, async () => {
                    await sendRandomAmount(keypair, receiverKeypair.publicKey.toString())
                })

                nestedTask.clear()
                setTitle(`${keypair.publicKey.toString()} has been completed ${i}`)
            }
        })
    }
}

main()