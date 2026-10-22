const transactionModel = require("../models/transaction.model")
const ledgerModel = require("../models/ledger.model")
const emailService = require("../services/email.service")
const accountModel = require("../models/account.model")
const mongoose = require("mongoose")


/**
 * - Create a new transaction
 * The 10 steps to follow-
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create transaction (PENDING)
 * 6. Create Debit Ledger entry
 * 7. Create Credit ledger entry
 * 8. Mark transaction Completed
 * 9. Commit MONGODB session
 * 10. Send EMAIL notification
 */


async function createTransaction(req, res){

    /**
     * - validate request body
     */
    const {fromAccount, toAccount, amount, idempotencyKey} = req.body


    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message: "fromAccount, toAccount, amount and idempotencyKey are required fields"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount,
    })

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if(!fromUserAccount || !toUserAccount){
        return res.status(400).json({
            message:"Invalid fromAccount or toAccount"
        })
    }


    /**
     * -Validate idempotency key
     */
    const isTransactionAlreadyExists = await transactionModel.findOne({idempotencyKey: idempotencyKey})

    if(isTransactionAlreadyExists){
        if(isTransactionAlreadyExists.status === "COMPLETED"){
            return res.status(200).json({
                message:"Transaction already completed",
                transaction: isTransactionAlreadyExists
            })
        }

        if(isTransactionAlreadyExists.status === "PENDING"){
            return res.status(200).json({
                message:"Transaction is already in progress, please wait for some time"
            })
        }

        if(isTransactionAlreadyExists.status === "FAILED"){
            return res.status(500).json({
                message:"Transaction failed, please try again"
            })
        }

        if(isTransactionAlreadyExists.status === "REVERSED"){
            return res.status(500).json({
                message:"Transaction is reversed, please try again"
            })
        }
    }


    /**
     * -Check account status
     */
    if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){
        return res.status(400).json({
            message:"One or both accounts are not active"
        })
    }

    /**
     * -Derive sender balance from ledger
     */

    const balance = await fromUserAccount.getbalance()
    if(balance < amount){
        return res.status(400).json({
            message:`Insufficient balance. Current balance is ${balance}. required amount is ${amount}`
        })
    }

    /**
     * -crate transaction (PENDING)
     */

    const session = await mongoose.startSession()
    session.startTransaction()
    
    const [transaction] = await transactionModel.create([{
        fromAccount,
        toAccount,
        amount: amount,
        idempotencyKey,
        status: "PENDING"
    }], {session})

    const [debitLedgerEntry] = await ledgerModel.create([{
        account: fromAccount,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"
    }], {session})

    const [creditLedgerEntry] = await ledgerModel.create([{
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"
    }], {session})


    await transactionModel.findByIdAndUpdate(
        transaction._id,
        { status: "COMPLETED" },
        { session }
    )


    await session.commitTransaction()
    session.endSession()



        /**
         * Send email notification to both accounts
         */

        await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount, "DEBIT")

        return res.status(201).json({
            message:"Transaction completed successfully",
            transaction: transaction
        })
}




async function createInitialFundsTransaction(req, res){

    const {toAccount, amount, idempotencyKey} = req.body

    if(!toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message:"Bad Request, missing required fields"
        })
    }

    /**
     * -Validate idempotency key
     */
    const isTransactionAlreadyExists = await transactionModel.findOne({idempotencyKey: idempotencyKey})

    if(isTransactionAlreadyExists){
        if(isTransactionAlreadyExists.status === "COMPLETED"){
            return res.status(200).json({
                message:"Transaction already completed",
                transaction: isTransactionAlreadyExists
            })
        }

        if(isTransactionAlreadyExists.status === "PENDING"){
            return res.status(200).json({
                message:"Transaction is already in progress, please wait for some time"
            })
        }

        if(isTransactionAlreadyExists.status === "FAILED"){
            return res.status(500).json({
                message:"Transaction failed, please try again"
            })
        }

        if(isTransactionAlreadyExists.status === "REVERSED"){
            return res.status(500).json({
                message:"Transaction is reversed, please try again"
            })
        }
    }

    const toUserAccount = await accountModel.findOne({_id: toAccount})

    if(!toUserAccount){
        return res.status(404).json({
            message:"Invalid Account"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    })

    if(!fromUserAccount){
        return res.status(404).json({
            message:"System User Account not found"
        })
    }


    const session = await mongoose.startSession()
    session.startTransaction()

    const [transaction] = await transactionModel.create([{
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    }], {session})


    const [debitLedgerEntry] = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"
    }], {session})


    const [creditLedgerEntry] = await ledgerModel.create([{
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"
    }], {session})

    await transactionModel.findByIdAndUpdate(
        transaction._id,
        { status: "COMPLETED" },
        { session }
    )

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message:"Initial Funds Transaction Completed",
        transaction: transaction
    })

}

module.exports = {
    createTransaction,
    createInitialFundsTransaction
}