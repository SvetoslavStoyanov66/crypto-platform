package com.example.cryptoplatform.services;

import com.example.cryptoplatform.config.AuthContextManager;
import com.example.cryptoplatform.models.ApplicationUser;
import com.example.cryptoplatform.models.Wallet;
import com.example.cryptoplatform.repository.WalletRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;

@Service
@AllArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;

    private final AuthContextManager authContextManager;

    public Wallet getWallet(){
        return walletRepository.findWalletByUserId(authContextManager.getLoggedInUser().getUserId());
    }

    public void resetBalance() {
        ApplicationUser user = authContextManager.getLoggedInUser();

        Wallet userWallet = user.getWallet();

        userWallet.setUsdBalance(BigDecimal.valueOf(10000));
        userWallet.setCrypto(new HashMap<>());
        walletRepository.save(userWallet, user.getUserId());
    }
}
