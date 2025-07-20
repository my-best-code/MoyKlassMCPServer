package com.mybestcode.moyklassmcpserver.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Configuration
public class WebClientConfig {
    @Value("${crm.api.url}")
    private String crmApiUrl;

    @Value("${crm.api.key}")
    private String apiKey;

    @Bean
    public WebClient crmWebClient(WebClient.Builder builder) {
        return builder
                .baseUrl(crmApiUrl)
                .defaultHeader("x-access-token", apiKey)
                .filter(logRequest())
                .build();
    }

    private ExchangeFilterFunction logRequest() {
        return ExchangeFilterFunction.ofRequestProcessor(clientRequest -> {
            System.out.println("Making API call: " + clientRequest.method() + " " + clientRequest.url());
            return Mono.just(clientRequest);
        });
    }
}
