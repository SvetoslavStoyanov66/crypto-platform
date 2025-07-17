package com.example.cryptoplatform.services;

import com.example.cryptoplatform.config.AuthContextManager;
import com.example.cryptoplatform.models.Transaction;
import com.example.cryptoplatform.repository.TransactionRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final AuthContextManager authContextManager;

    public List<Transaction> getTransactionHistoryOfLoggedUser(){
        return transactionRepository.findTransactionsByUserId(authContextManager.getLoggedInUser().getUserId());
    }
}
