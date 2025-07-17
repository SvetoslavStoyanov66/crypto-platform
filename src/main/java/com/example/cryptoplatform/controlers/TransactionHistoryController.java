package com.example.cryptoplatform.controlers;

import com.example.cryptoplatform.models.Transaction;
import com.example.cryptoplatform.services.TransactionService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@AllArgsConstructor
public class TransactionHistoryController {

    private final TransactionService transactionService;

    @GetMapping
    public List<Transaction> getHistory() {
        return transactionService.getTransactionHistoryOfLoggedUser();
    }
}
