package com.example.cryptoplatform.services;

import com.example.cryptoplatform.config.AuthContextManager;
import com.example.cryptoplatform.models.Wallet;
import com.example.cryptoplatform.repository.WalletRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;

    private final AuthContextManager authContextManager;

    public Wallet getWallet(){
        return walletRepository.findWalletByUserId(authContextManager.getLoggedInUser().getUserId());
    }
}
