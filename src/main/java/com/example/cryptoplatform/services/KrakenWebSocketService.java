package com.example.cryptoplatform.services;

import com.example.cryptoplatform.models.CryptoPrice;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.annotation.PostConstruct;
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URI;
import java.util.List;
import java.util.Map;

@Service
public class KrakenWebSocketService extends WebSocketClient {

    @Autowired
    CryptoPriceService cryptoPriceService;

    private static final List<String> PAIRS = List.of(
            "XBT/USD", "ETH/USD", "ADA/USD", "SOL/USD", "XRP/USD",
            "DOT/USD", "LTC/USD", "AVAX/USD", "LINK/USD", "BCH/USD",
            "DOGE/USD", "ATOM/USD", "ETC/USD", "MATIC/USD", "UNI/USD",
            "XLM/USD", "FIL/USD", "ICP/USD", "EOS/USD", "TRX/USD"
    );

    private final ObjectMapper mapper = new ObjectMapper();

    public KrakenWebSocketService() throws Exception {
        super(new URI("wss://ws.kraken.com/v2"));
    }

    @PostConstruct
    public void start() throws Exception {
        this.connectBlocking();
        subscribeToTicker();
    }

    private void subscribeToTicker() throws Exception {
        Map<String, Object> params = Map.of(
                "channel", "ticker",
                "symbol", PAIRS
        );

        Map<String, Object> subscribeMessage = Map.of(
                "method", "subscribe",
                "params", params
        );

        this.send(mapper.writeValueAsString(subscribeMessage));
    }

    @Override
    public void onMessage(String message) {
        try {
            JsonNode json = mapper.readTree(message);

            if (json.has("channel") && "ticker".equals(json.get("channel").asText())) {
                JsonNode dataArray = json.get("data");

                if (dataArray != null && dataArray.isArray() && dataArray.size() > 0) {
                    JsonNode ticker = dataArray.get(0);

                    String symbol = getTextSafe(ticker, "symbol");
                    double last = getDoubleSafe(ticker, "last");
                    double changePct = getDoubleSafe(ticker, "change_pct");
                    double volume = getDoubleSafe(ticker, "volume");

                    if (symbol != null) {
                        CryptoPrice price = new CryptoPrice(symbol, last, changePct, volume);
                        cryptoPriceService.updatePrice(symbol, price);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to process message: " + message);
            e.printStackTrace();
        }
    }

    private String getTextSafe(JsonNode node, String key) {
        return node.has(key) && !node.get(key).isNull() ? node.get(key).asText() : null;
    }

    private double getDoubleSafe(JsonNode node, String key) {
        return node.has(key) && !node.get(key).isNull() ? node.get(key).asDouble() : 0.0;
    }

    @Override
    public void onOpen(ServerHandshake handshakedata) {
        System.out.println("Connected to Kraken WebSocket");
    }

    @Override
    public void onClose(int code, String reason, boolean remote) {
        System.out.println("Disconnected: " + reason);
    }

    @Override
    public void onError(Exception ex) {
        ex.printStackTrace();
    }
}
