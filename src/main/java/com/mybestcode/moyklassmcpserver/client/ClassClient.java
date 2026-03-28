package com.mybestcode.moyklassmcpserver.client;

import com.mybestcode.moyklassmcpserver.model.Class;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Optional;

@Component
public class ClassClient {
    private final WebClient webClient;

        public ClassClient(WebClient crmWebClient) {
        this.webClient = crmWebClient;
    }

    public List<Class> getClasses(
            Boolean includeImages,
            Boolean includeAttributes,
            Long courseId,
            Integer filialId,
            Long classId,
            Boolean includeStats
    ) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1/company/classes")
                        .queryParamIfPresent("includeImages", Optional.ofNullable(includeImages))
                        .queryParamIfPresent("includeAttributes", Optional.ofNullable(includeAttributes))
                        .queryParamIfPresent("courseId", Optional.ofNullable(courseId))
                        .queryParamIfPresent("filialId", Optional.ofNullable(filialId))
                        .queryParamIfPresent("classId", Optional.ofNullable(classId))
                        .queryParamIfPresent("includeStats", Optional.ofNullable(includeStats))
                        .build())
                .retrieve()
                .bodyToFlux(Class.class)
                .collectList()
                .block();
    }
}
