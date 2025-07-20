package com.example.cryptoplatform;

import com.example.cryptoplatform.config.AuthContextManager;
import com.example.cryptoplatform.exceptions.NotEnoughBalanceException;
import com.example.cryptoplatform.models.*;
import com.example.cryptoplatform.repository.TransactionRepository;
import com.example.cryptoplatform.repository.WalletRepository;
import com.example.cryptoplatform.services.CryptoPriceService;
import com.example.cryptoplatform.services.TradingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TradingServiceTest {

    @Mock
    private AuthContextManager authContextManager;

    @Mock
    private CryptoPriceService cryptoPriceService;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private TradingService tradingService;

    private ApplicationUser testUser;
    private Wallet testWallet;
    private CryptoPrice testCryptoPrice;

    @BeforeEach
    void setUp() {
        testUser = new ApplicationUser();
        testUser.setId(1);

        testWallet = new Wallet();
        testWallet.setUsdBalance(BigDecimal.valueOf(50000));
        HashMap<String, BigDecimal> crypto = new HashMap<>();
        crypto.put("BTC", BigDecimal.valueOf(2));
        testWallet.setCrypto(crypto);

        testUser.setWallet(testWallet);

        testCryptoPrice = new CryptoPrice();
        testCryptoPrice.setLastPrice(50000);
    }

    @Test
    void buyCrypto_SuccessfulPurchase_UpdatesWalletAndCreatesTransaction() {
        // Arrange
        when(authContextManager.getLoggedInUser()).thenReturn(testUser);
        when(cryptoPriceService.getPrice("BTC")).thenReturn(Optional.of(testCryptoPrice));

        double amountToBuy = 0.5;
        BigDecimal expectedUsdCost = BigDecimal.valueOf(50000 * amountToBuy);
        BigDecimal expectedNewUsdBalance = testWallet.getUsdBalance().subtract(expectedUsdCost);
        BigDecimal expectedNewBtcBalance = testWallet.getCrypto().get("BTC").add(BigDecimal.valueOf(amountToBuy));

        // Act
        tradingService.buyCrypto("BTC", amountToBuy);

        // Assert
        assertEquals(expectedNewUsdBalance, testWallet.getUsdBalance());
        assertEquals(expectedNewBtcBalance, testWallet.getCrypto().get("BTC"));

        verify(walletRepository).save(testWallet, testUser.getUserId());
        verify(transactionRepository).insert(
                argThat(transaction ->
                        transaction.getType() == TransactionType.BUY &&
                                transaction.getAsset().equals("BTC") &&
                                transaction.getAmount().compareTo(BigDecimal.valueOf(amountToBuy)) == 0),
                eq(testUser.getUserId())
        );
    }

    @Test
    void buyCrypto_NewCrypto_AddsNewCryptoToWallet() {
        // Arrange
        when(authContextManager.getLoggedInUser()).thenReturn(testUser);
        when(cryptoPriceService.getPrice("ETH")).thenReturn(Optional.of(testCryptoPrice));

        double amountToBuy = 1.0;

        // Act
        tradingService.buyCrypto("ETH", amountToBuy);

        // Assert
        assertTrue(testWallet.getCrypto().containsKey("ETH"));
        assertEquals(BigDecimal.valueOf(amountToBuy), testWallet.getCrypto().get("ETH"));
    }

    @Test
    void buyCrypto_InsufficientBalance_ThrowsNotEnoughBalanceException() {
        // Arrange
        when(authContextManager.getLoggedInUser()).thenReturn(testUser);
        testCryptoPrice.setLastPrice(1000000); // Price that makes the purchase too expensive
        when(cryptoPriceService.getPrice("BTC")).thenReturn(Optional.of(testCryptoPrice));

        // Act & Assert
        assertThrows(NotEnoughBalanceException.class,
                () -> tradingService.buyCrypto("BTC", 1.0));

        verify(walletRepository, never()).save(any(), anyInt());
        verify(transactionRepository, never()).insert(any(), anyInt());
    }

    @Test
    void sellCrypto_SuccessfulSale_UpdatesWalletAndCreatesTransaction() {
        // Arrange
        when(authContextManager.getLoggedInUser()).thenReturn(testUser);
        when(cryptoPriceService.getPrice("BTC")).thenReturn(Optional.of(testCryptoPrice));

        double amountToSell = 1.0;
        BigDecimal expectedUsdGain = BigDecimal.valueOf(50000 * amountToSell);
        BigDecimal expectedNewUsdBalance = testWallet.getUsdBalance().add(expectedUsdGain);
        BigDecimal expectedNewBtcBalance = testWallet.getCrypto().get("BTC").subtract(BigDecimal.valueOf(amountToSell));

        // Act
        tradingService.sellCrypto("BTC", amountToSell);

        // Assert
        assertEquals(expectedNewUsdBalance, testWallet.getUsdBalance());
        assertEquals(expectedNewBtcBalance, testWallet.getCrypto().get("BTC"));

        verify(walletRepository).save(testWallet, testUser.getUserId());
        verify(transactionRepository).insert(
                argThat(transaction ->
                        transaction.getType() == TransactionType.SELL &&
                                transaction.getAsset().equals("BTC") &&
                                transaction.getAmount().compareTo(BigDecimal.valueOf(amountToSell)) == 0),
                eq(testUser.getUserId())
        );
    }

    @Test
    void sellCrypto_CompleteSale_RemovesCryptoFromWallet() {
        // Arrange
        when(authContextManager.getLoggedInUser()).thenReturn(testUser);
        when(cryptoPriceService.getPrice("BTC")).thenReturn(Optional.of(testCryptoPrice));

        double amountToSell = 2.0; // Selling all BTC

        // Act
        tradingService.sellCrypto("BTC", amountToSell);

        // Assert
        assertFalse(testWallet.getCrypto().containsKey("BTC"));
    }

    @Test
    void sellCrypto_InsufficientCrypto_ThrowsNotEnoughBalanceException() {
        // Arrange
        when(authContextManager.getLoggedInUser()).thenReturn(testUser);

        // Act & Assert
        assertThrows(NotEnoughBalanceException.class,
                () -> tradingService.sellCrypto("BTC", 3.0)); // Trying to sell more than owned

        verify(walletRepository, never()).save(any(), anyInt());
        verify(transactionRepository, never()).insert(any(), anyInt());
    }

    @Test
    void sellCrypto_CryptoNotOwned_ThrowsNotEnoughBalanceException() {
        // Arrange
        when(authContextManager.getLoggedInUser()).thenReturn(testUser);

        // Act & Assert
        assertThrows(NotEnoughBalanceException.class,
                () -> tradingService.sellCrypto("ETH", 1.0)); // Trying to sell crypto not owned

        verify(walletRepository, never()).save(any(), anyInt());
        verify(transactionRepository, never()).insert(any(), anyInt());
    }
}
