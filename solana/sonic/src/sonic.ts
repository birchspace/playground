import bs58 from "bs58"
import axios from 'axios';
import nacl from "tweetnacl";
import web3 from "@solana/web3.js"
import TWeetnaclUtil from "tweetnacl-util";

import type { Transaction, Keypair, Connection } from "@solana/web3.js";


class Sonic {
    keypair: Keypair;
    authorization: string
    connection: Connection

    private key: string


    constructor(key: string, connection: Connection) {
        this.key = key
        this.connection = connection
        this.keypair = web3.Keypair.fromSecretKey(bs58.decode(key))
    }


    public sleep = (ms = 1000 * Math.random() + 900) =>
        new Promise((resolve) => setTimeout(resolve, ms));

    public getBalance = async () => {
        const balance = await this.connection.getBalance(this.keypair.publicKey);
        return balance;
    };


    public faucet = async () => {
        const faucetApi = axios.create({
            baseURL: `https://odyssey-api.sonic.game/user/check-in/`,
            headers: {
                'authorization': this.authorization,
                'if-none-match': 'W/"198-HGTHb5LTJMV42a6+NNzdG8NECww"',
                'priority': 'u=1, i',
                'User-Agent': 'Apifox/1.0.0 (https://apifox.com)'
            }
        });

        try {
            const response = await faucetApi.get(`transaction`);
            return response.data.data.hash;
        } catch (error) {
            console.log("checkInTransaction error", error);
        }
    }
    public sendSol = async (fromKeypair: Keypair, toPublicKey: string, amountInsol: number) => {
        const transaction = new web3.Transaction().add(
            web3.SystemProgram.transfer({
                fromPubkey: fromKeypair.publicKey,
                toPubkey: new web3.PublicKey(toPublicKey),
                lamports: amountInsol,
            }))

        try {
            await web3.sendAndConfirmTransaction(
                this.connection,
                transaction,
                [fromKeypair],
                {
                    skipPreflight: true,
                }
            );
        } catch (error) {
            return { error: 'Transaction failed', details: error };
        }

        return {
            amount: amountInsol,
            destination: toPublicKey,
        };
    }

    public init = async () => {
        const message = await this.challenge()
        const signature = this.generateSignature(message)

        console.log("Get authorize...");


        const authorizeApi = axios.create({
            baseURL: `https://odyssey-api.sonic.game/auth/sonic/authorize`,
            headers: {
                'priority': 'u=1, i',
                'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
                'content-type': 'application/json'
            }
        });

        const data = JSON.stringify({
            "address": this.keypair.publicKey.toString(),
            "address_encoded": TWeetnaclUtil.encodeBase64(this.keypair.publicKey.toBytes()),
            "signature": signature
        });

        try {
            const response = await authorizeApi.post(`?wallet=${this.keypair.publicKey.toString()}`, data);
            this.authorization = response.data.data.token
        } catch (error) {
            console.log("get authorize error", error);
        }
    }

    public status = async () => {
        const userDeafultStatus = {
            "checked": false,
            "accumulative_days": 0,
            "total_transactions": 0,
            "transactions_1_claimed": false,
            "transactions_2_claimed": false,
            "transactions_3_claimed": false,
            "ring": 0,
            "ring_monitor": 0
        }

        const statusApi = axios.create({
            baseURL: `https://odyssey-api.sonic.game/user/`,
            headers: {
                'authorization': this.authorization,
                'if-none-match': 'W/"60-UycbyinrMpwPxvaprERozGBmb2c"',
                'priority': 'u=1, i',
                'User-Agent': 'Apifox/1.0.0 (https://apifox.com)'
            }
        });

        try {
            const response = await statusApi.get(`check-in/status`);
            const checkInStatus = response.data.data
            userDeafultStatus.checked = checkInStatus?.checked
            userDeafultStatus.accumulative_days = checkInStatus?.accumulative_days
        } catch (error) {
            console.log("Check in error", error);
        }

        try {
            const response = await statusApi.get(`transactions/state/daily`);
            const transactionsStatus = response.data.data
            userDeafultStatus.total_transactions = transactionsStatus?.total_transactions
            const { stage_1, stage_2, stage_3 } = transactionsStatus?.stage_info
            userDeafultStatus.transactions_1_claimed = stage_1?.claimed
            userDeafultStatus.transactions_2_claimed = stage_2?.claimed
            userDeafultStatus.transactions_3_claimed = stage_3?.claimed
        } catch (error) {
            console.log("transactions daily error", error);
        }

        return { ...userDeafultStatus }
    }

    public sendTx = async (connection: Connection, tx: Transaction) => {
        const transactionSignature = await web3.sendAndConfirmTransaction(connection, tx, [this.keypair], { commitment: "confirmed" })
        const confirmation = await connection.getSignatureStatus(transactionSignature);

        return {
            slot: confirmation.value?.slot,
            txid: transactionSignature
        }

    }

    public claim = async () => {

        const userStatus = await this.status()

        const claimApi = axios.create({
            baseURL: `https://odyssey-api.sonic.game/user/transactions/rewards/`,
            headers: {
                'authorization': this.authorization,
                'priority': 'u=1, i',
                'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
                'content-type': 'application/json'
            }
        });

        const stagesToClaim = [1, 2, 3].filter(stage => !userStatus[`transactions_${stage}_claimed`]);

        const claimPromises = stagesToClaim.map(async stage => {
            const data = JSON.stringify({ "stage": stage });

            try {
                const response = await claimApi.post('claim', data);
                return response.data.data.claimed;
            } catch (error) {
                console.log("claim error", error);
            }
        });

        for (const promise of claimPromises) {

            await promise;
            this.sleep(1000)
        }
    }

    public checkInTransaction = async () => {

        const checkInTransactionApi = axios.create({
            baseURL: `https://odyssey-api.sonic.game/user/check-in/`,
            headers: {
                'authorization': this.authorization,
                'if-none-match': 'W/"198-HGTHb5LTJMV42a6+NNzdG8NECww"',
                'priority': 'u=1, i',
                'User-Agent': 'Apifox/1.0.0 (https://apifox.com)'
            }
        });

        try {
            const response = await checkInTransactionApi.get(`transaction`);
            return response.data.data.hash;
        } catch (error) {
            console.log("checkInTransaction error", error);
        }
    }

    public buildCheckInTx = async () => {
        const hash = await this.checkInTransaction()
        return web3.Transaction.from(Buffer.from(hash, "base64"))
    }

    public checkInHadnle = async (hash: string) => {
        const checkInHadnleApi = axios.create({
            baseURL: `https://odyssey-api.sonic.game/user/`,
            headers: {
                'authorization': this.authorization,
                'priority': 'u=1, i',
                'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
                'content-type': 'application/json'
            }
        });

        const data = JSON.stringify({
            "hash": hash,
        });

        try {
            const response = await checkInHadnleApi.post(`check-in`, data);
            return response.data;
        } catch (error) {
            console.log("checkInHadnle error", error);
        }
    }

    public lotteryTransaction = async () => {
        const lotteryTransactionApi = axios.create({
            baseURL: `https://odyssey-api.sonic.game/user/lottery/`,
            headers: {
                'authorization': this.authorization,
                'if-none-match': 'W/"21c-8h6IzDmo1uIQbaER3et5ECJibwk"',
                'priority': 'u=1, i',
                'User-Agent': 'Apifox/1.0.0 (https://apifox.com)'
            }
        });

        try {
            const response = await lotteryTransactionApi.get(`build-tx`);
            return response.data.data.hash;
        } catch (error) {
            console.log("lotteryTransaction error", error);
        }
    }

    public buildLotteryTx = async () => {
        const hash = await this.lotteryTransaction()
        return web3.Transaction.from(Buffer.from(hash, "base64"))
    }

    public lotteryDraw = async (hash: string) => {
        const lotteryDrawApi = axios.create({
            baseURL: `https://odyssey-api.sonic.game/user/lottery`,
            headers: {
                'authorization': this.authorization,
                'priority': 'u=1, i',
                'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
                'content-type': 'application/json'
            }
        });

        const data = JSON.stringify({
            "hash": hash
        });

        try {
            const response = await lotteryDrawApi.post(`draw`, data);
            const { hash, block_number } = response.data.data
            return { hash, block_number }
        } catch (error) {
            console.log("lotteryDraw error", error);
        }
    }

    public isLotteryWinner = async (blockNumber: number) => {
        const isLotteryWinnerApi = axios.create({
            baseURL: `https://odyssey-api.sonic.game/user/lottery/draw/`,
            headers: {
                'authorization': this.authorization,
                'priority': 'u=1, i',
                'User-Agent': 'Apifox/1.0.0 (https://apifox.com)'
            }
        });

        try {
            const response = await isLotteryWinnerApi.get(`winner?block_number=${blockNumber}`);
            const { winner, block_number, rewards, extra_rewards } = response.data.data
            const is = winner === this.keypair.publicKey.toString() ? "true" : "false"

            return { is, block_number, rewards, extra_rewards }
        } catch (error) {
            console.log("isLotteryWinner error", error);
        }
    }

    // public info = async () => {
    //     const infoApi = axios.create({
    //         baseURL: `https://odyssey-api.sonic.game/user/rewards/`,
    //         headers: {
    //             'authorization': this.authorization,
    //             'if-none-match': 'W/"6f-fhSr0yyaMdLLWiSLWCkT0Jm9vJM"',
    //             'priority': 'u=1, i',
    //             'User-Agent': 'Apifox/1.0.0 (https://apifox.com)'
    //         }
    //     });

    //     try {
    //         const response = await infoApi.get("info");
    //         const { ring, ring_monitor } = response.data?.data
    //         return { ring, ring_monitor }
    //     } catch (error) {
    //         console.log("info error", error);
    //     }
    // }

    // public openTransaction = async () => {
    //     const openTransactionApi = axios.create({
    //         baseURL: `https://odyssey-api.sonic.game/user/rewards/mystery-box/`,
    //         headers: {
    //             'authorization': this.authorization,
    //             'if-none-match': 'W/"414-ewWaOqaTMoZRbJUxPqfDFNxjH30"',
    //             'priority': 'u=1, i',
    //             'User-Agent': 'Apifox/1.0.0 (https://apifox.com)'
    //         }
    //     });

    //     try {
    //         const response = await openTransactionApi.get(`build-tx`);
    //         return response.data.data.hash;
    //     } catch (error) {
    //         console.log("openTransaction error", error);
    //     }
    // }

    // public buildOpenTx = async () => {
    //     const hash = await this.openTransaction()
    //     return web3.Transaction.from(Buffer.from(hash, "base64"))
    // }

    // public sendOpenTransaction = async () => {

    //     const openTransactionApi = axios.create({
    //         baseURL: `https://odyssey-api.sonic.game/user/rewards/mystery-box/`,
    //         headers: {
    //             'authorization': this.authorization,
    //             'if-none-match': 'W/"414-ewWaOqaTMoZRbJUxPqfDFNxjH30"',
    //             'priority': 'u=1, i',
    //             'User-Agent': 'Apifox/1.0.0 (https://apifox.com)'
    //         }
    //     });

    //     try {
    //         const response = await openTransactionApi.get(`build-tx`);
    //         return response.data.data.hash;
    //     } catch (error) {
    //         console.log("openTransaction error", error);
    //     }
    // }
    // public openMysteryBox = async (connection: Connection) => {
    //     // const openMysteryTx = await this.buildOpenTx()
    //     const hash = await this.openTransaction()
    //     console.log("hashhash", hash);

    //     const mysteryTx = await connection.sendTransaction(hash, { skipPreflight: true, preflightCommitment: "processed" })
    //     // const mysteryTx = await this.sendTx(connection, openMysteryTx)
    //     console.log("this mysteryTx", mysteryTx);

    //     await this.sleep(20000)

    //     const openMysteryBoxApi = axios.create({
    //         baseURL: `https://odyssey-api.sonic.game/user/rewards/mystery-box/`,
    //         headers: {
    //             'authorization': this.authorization,
    //             'priority': 'u=1, i',
    //             'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
    //             'content-type': 'application/json'
    //         }
    //     });

    //     const data = JSON.stringify({
    //         "hash": mysteryTx
    //     });

    //     try {
    //         // const response = await openMysteryBoxApi.post(`open`, data);
    //         // const { success, amount } = response.data.data
    //         const success = "true"
    //         const amount = 1
    //         return { success, amount }
    //     } catch (error) {
    //         console.log("openMysteryBox error", error);
    //     }

    // }

    private challenge = async () => {
        const challengeApi = axios.create({
            baseURL: `https://odyssey-api.sonic.game/auth/sonic/challenge`,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Apifox/1.0.0 (https://apifox.com)'
            }
        });

        try {
            const response = await challengeApi.get(`?wallet=${this.keypair.publicKey.toString()}`);
            return response.data.data;
        } catch (error) {
            console.log("challenge error", error);
        }
    }

    private generateSignature = (message: string) => {
        const keypair = nacl.sign.keyPair.fromSecretKey(bs58.decode(this.key))
        const signature = nacl.sign.detached(new TextEncoder().encode(message), keypair.secretKey);
        return TWeetnaclUtil.encodeBase64(signature);
    }
}

export default Sonic